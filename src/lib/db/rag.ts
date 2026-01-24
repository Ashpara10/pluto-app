"use server";

import { db } from "./drizzle";
import { documentBlocks, documentEmbeddings } from "./schema";
import { eq, sql, desc } from "drizzle-orm";
import { embed, embedMany } from "ai";
import google from "../ai";

/**
 * Minimal RAG Pipeline - v1
 * 
 * This is intentionally simple and explicit.
 * No background jobs, no queues, no incremental updates.
 * Called on-demand when user triggers AI action.
 */

// ============================================================================
// 1. Ensure Document Embeddings Exist
// ============================================================================

/**
 * Generate/update embeddings for all blocks in a document
 * 
 * Flow:
 * 1. Fetch all blocks from document_blocks
 * 2. Generate embeddings for each block's text_content
 * 3. Upsert into document_embeddings (chunk = text_content, chunk_index = position)
 * 4. Delete embeddings for removed blocks
 * 
 * @param documentId - UUID of the document
 * @returns Success status and count of embeddings created
 */
export async function ensureDocumentEmbeddings(documentId: string) {
    try {
        console.log(`[RAG] Ensuring embeddings for document: ${documentId}`);

        // Step 1: Fetch all blocks for this document
        const blocks = await db
            .select({
                position: documentBlocks.position,
                textContent: documentBlocks.textContent,
                blockType: documentBlocks.blockType,
            })
            .from(documentBlocks)
            .where(eq(documentBlocks.documentId, documentId))
            .orderBy(documentBlocks.position);

        if (blocks.length === 0) {
            console.log(`[RAG] No blocks found for document ${documentId}`);
            return { success: true, count: 0, message: "No blocks to embed" };
        }

        console.log(`[RAG] Found ${blocks.length} blocks to embed`);

        // Step 2: Filter out blocks with no text content
        const blocksToEmbed = blocks.filter(
            (b) => b.textContent && b.textContent.trim().length > 0
        );

        if (blocksToEmbed.length === 0) {
            console.log(`[RAG] No blocks with text content`);
            return { success: true, count: 0, message: "No text content to embed" };
        }

        // Step 3: Generate embeddings for all blocks
        console.log(`[RAG] Generating embeddings for ${blocksToEmbed.length} blocks...`);

        const { embeddings } = await embedMany({
            model: google.textEmbeddingModel("text-embedding-004"),
            values: blocksToEmbed.map((b) => b.textContent!),
        });

        console.log(`[RAG] Generated ${embeddings.length} embeddings`);

        // Step 4: Upsert embeddings into database
        // Use chunk_index = position for alignment with blocks
        await Promise.all(
            embeddings.map((embedding, index) => {
                const block = blocksToEmbed[index];
                return db
                    .insert(documentEmbeddings)
                    .values({
                        documentId,
                        embedding,
                        chunk: block.textContent!,
                        chunkIndex: block.position,
                    })
                    .onConflictDoUpdate({
                        target: [documentEmbeddings.documentId, documentEmbeddings.chunkIndex],
                        set: {
                            embedding,
                            chunk: block.textContent!,
                        },
                    });
            })
        );

        console.log(`[RAG] Upserted ${embeddings.length} embeddings`);

        // Step 5: Delete embeddings for removed blocks
        // Get all existing chunk_indexes from embeddings
        const existingEmbeddings = await db
            .select({ chunkIndex: documentEmbeddings.chunkIndex })
            .from(documentEmbeddings)
            .where(eq(documentEmbeddings.documentId, documentId));

        const existingIndexes = new Set(existingEmbeddings.map((e) => e.chunkIndex));
        const currentIndexes = new Set(blocks.map((b) => b.position));

        // Find indexes that exist in embeddings but not in current blocks
        const indexesToDelete = Array.from(existingIndexes).filter(
            (idx) => !currentIndexes.has(idx)
        );

        if (indexesToDelete.length > 0) {
            console.log(`[RAG] Deleting ${indexesToDelete.length} orphaned embeddings`);
            await db.execute(sql`
        DELETE FROM document_embeddings
        WHERE document_id = ${documentId}
          AND chunk_index = ANY(${indexesToDelete})
      `);
        }

        console.log(`[RAG] ✅ Successfully ensured embeddings for document ${documentId}`);

        return {
            success: true,
            count: embeddings.length,
            message: `Generated ${embeddings.length} embeddings`,
        };
    } catch (error) {
        console.error(`[RAG] Error ensuring embeddings:`, error);
        return {
            success: false,
            count: 0,
            error: (error as Error).message,
        };
    }
}

// ============================================================================
// 2. Similarity Search
// ============================================================================

/**
 * Find most relevant chunks for a query using vector similarity
 * 
 * @param documentId - UUID of the document to search within
 * @param query - User's question/query
 * @param limit - Number of chunks to retrieve (default: 6)
 * @returns Array of relevant chunks ordered by similarity
 */
export async function searchSimilarChunks(
    documentId: string,
    query: string,
    limit: number = 6
) {
    try {
        console.log(`[RAG] Searching for: "${query}" in document ${documentId}`);

        // Step 1: Generate embedding for the query
        const { embedding: queryEmbedding } = await embed({
            model: google.textEmbeddingModel("text-embedding-004"),
            value: query,
        });

        console.log(`[RAG] Generated query embedding`);

        // Step 2: Perform similarity search using cosine distance
        // pgvector uses <-> for cosine distance (lower = more similar)
        const results = await db.execute(sql`
      SELECT 
        chunk,
        chunk_index,
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM document_embeddings
      WHERE document_id = ${documentId}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `);

        console.log(`[RAG] Found ${results.rows.length} similar chunks`);

        return {
            success: true,
            chunks: results.rows.map((row: any) => ({
                chunk: row.chunk,
                chunkIndex: row.chunk_index,
                similarity: row.similarity,
            })),
        };
    } catch (error) {
        console.error(`[RAG] Error searching chunks:`, error);
        return {
            success: false,
            chunks: [],
            error: (error as Error).message,
        };
    }
}

// ============================================================================
// 3. RAG Prompt Construction
// ============================================================================

/**
 * Construct a RAG-enhanced prompt for the LLM
 * 
 * @param userQuestion - The user's question
 * @param retrievedChunks - Chunks from similarity search
 * @returns Formatted prompt with context
 */
export function buildRAGPrompt(
    userQuestion: string,
    retrievedChunks: { chunk: string; chunkIndex: number; similarity: number }[]
): string {
    // Build context from retrieved chunks
    const context = retrievedChunks
        .map((c, idx) => `[${idx + 1}] ${c.chunk}`)
        .join("\n\n");

    // Construct the prompt
    const prompt = `You are Pluto, an AI writing assistant. Answer the user's question based on the provided document context.

<CONTEXT>
${context}
</CONTEXT>

<QUESTION>
${userQuestion}
</QUESTION>

<INSTRUCTIONS>
- Answer the question using ONLY the information in the CONTEXT above
- If the context doesn't contain enough information, say "I don't have enough information in the document to answer that"
- Be concise and specific
- Reference specific parts of the context when relevant
- Use markdown formatting for better readability
</INSTRUCTIONS>

Answer:`;

    return prompt;
}

// ============================================================================
// 4. Complete RAG Flow (Helper Function)
// ============================================================================

/**
 * Complete RAG pipeline: Ensure embeddings → Search → Build prompt
 * 
 * This is the main function to call from your AI actions
 * 
 * @param documentId - UUID of the document
 * @param userQuestion - User's question
 * @returns Prompt ready for LLM + metadata
 */
export async function prepareRAGPrompt(
    documentId: string,
    userQuestion: string
) {
    try {
        console.log(`[RAG] Starting RAG flow for question: "${userQuestion}"`);

        // Step 1: Ensure embeddings exist
        const embeddingResult = await ensureDocumentEmbeddings(documentId);
        if (!embeddingResult.success) {
            throw new Error(`Failed to ensure embeddings: ${embeddingResult.error}`);
        }

        // Step 2: Search for similar chunks
        const searchResult = await searchSimilarChunks(documentId, userQuestion, 6);
        if (!searchResult.success) {
            throw new Error(`Failed to search chunks: ${searchResult.error}`);
        }

        // Step 3: Build prompt
        const prompt = buildRAGPrompt(userQuestion, searchResult.chunks);

        console.log(`[RAG] ✅ RAG prompt prepared successfully`);

        return {
            success: true,
            prompt,
            metadata: {
                chunksRetrieved: searchResult.chunks.length,
                embeddingsGenerated: embeddingResult.count,
                chunks: searchResult.chunks,
            },
        };
    } catch (error) {
        console.error(`[RAG] Error in RAG flow:`, error);
        return {
            success: false,
            prompt: "",
            error: (error as Error).message,
        };
    }
}

// ============================================================================
// 5. Utility: Get Embedding Stats
// ============================================================================

/**
 * Get statistics about embeddings for a document
 * Useful for debugging
 */
export async function getEmbeddingStats(documentId: string) {
    try {
        const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_embeddings,
        MIN(chunk_index) as min_index,
        MAX(chunk_index) as max_index,
        AVG(LENGTH(chunk)) as avg_chunk_length
      FROM document_embeddings
      WHERE document_id = ${documentId}
    `);

        return {
            success: true,
            stats: stats.rows[0],
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}
