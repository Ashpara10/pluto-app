/**
 * Example usage of block-level persistence
 * 
 * This file demonstrates how to:
 * 1. Query blocks from the database
 * 2. Use blocks for RAG (Retrieval-Augmented Generation)
 * 3. Search within blocks
 * 4. Generate embeddings per block
 */

import { db } from "@/lib/db/drizzle";
import { documentBlocks } from "@/lib/db/schema";
import { getDocumentBlocks, syncDocumentBlocks, BlockData } from "@/lib/db/blocks";
import { eq, and, inArray, sql } from "drizzle-orm";

// ============================================================================
// Example 1: Get all blocks for a document
// ============================================================================

export async function getAllBlocksForDocument(documentId: string) {
    const { data: blocks, error } = await getDocumentBlocks(documentId);

    if (error) {
        console.error("Error fetching blocks:", error);
        return [];
    }

    return blocks || [];
}

// ============================================================================
// Example 2: Get only headings (for table of contents)
// ============================================================================

export async function getDocumentHeadings(documentId: string) {
    const headings = await db
        .select({
            id: documentBlocks.id,
            blockKey: documentBlocks.blockKey,
            textContent: documentBlocks.textContent,
            level: documentBlocks.metadata,
            position: documentBlocks.position,
        })
        .from(documentBlocks)
        .where(
            and(
                eq(documentBlocks.documentId, documentId),
                eq(documentBlocks.blockType, "heading")
            )
        )
        .orderBy(documentBlocks.position);

    return headings.map(h => ({
        ...h,
        level: (h.level as any)?.level || 1,
    }));
}

// ============================================================================
// Example 3: Full-text search within blocks
// ============================================================================

export async function searchBlocksInDocument(
    documentId: string,
    searchQuery: string
) {
    const results = await db.execute(sql`
    SELECT 
      id,
      block_key,
      block_type,
      text_content,
      position,
      ts_rank(
        to_tsvector('english', text_content),
        plainto_tsquery('english', ${searchQuery})
      ) as rank
    FROM document_blocks
    WHERE document_id = ${documentId}
      AND to_tsvector('english', text_content) @@ plainto_tsquery('english', ${searchQuery})
    ORDER BY rank DESC, position ASC
    LIMIT 10
  `);

    return results.rows;
}

// ============================================================================
// Example 4: Get blocks by type
// ============================================================================

export async function getBlocksByType(
    documentId: string,
    blockTypes: string[]
) {
    const blocks = await db
        .select()
        .from(documentBlocks)
        .where(
            and(
                eq(documentBlocks.documentId, documentId),
                inArray(documentBlocks.blockType, blockTypes)
            )
        )
        .orderBy(documentBlocks.position);

    return blocks;
}

// ============================================================================
// Example 5: Get context for AI (last N blocks)
// ============================================================================

export async function getRecentBlocksForAI(
    documentId: string,
    limit: number = 10
) {
    const blocks = await db
        .select({
            blockType: documentBlocks.blockType,
            textContent: documentBlocks.textContent,
            position: documentBlocks.position,
        })
        .from(documentBlocks)
        .where(eq(documentBlocks.documentId, documentId))
        .orderBy(documentBlocks.position)
        .limit(limit);

    // Format for AI context
    return blocks
        .map(b => {
            const prefix = b.blockType === "heading" ? "## " : "";
            return `${prefix}${b.textContent}`;
        })
        .join("\n\n");
}

// ============================================================================
// Example 6: Manually sync blocks (if needed outside of plugin)
// ============================================================================

export async function manualBlockSync(documentId: string, blocks: BlockData[]) {
    const result = await syncDocumentBlocks(documentId, blocks);

    if (result.success) {
        console.log("✅ Blocks synced successfully");
    } else {
        console.error("❌ Failed to sync blocks:", result.error);
    }

    return result;
}

// ============================================================================
// Example 7: Get block statistics
// ============================================================================

export async function getDocumentBlockStats(documentId: string) {
    const stats = await db.execute(sql`
    SELECT 
      block_type,
      COUNT(*) as count,
      AVG(LENGTH(text_content)) as avg_length,
      SUM(LENGTH(text_content)) as total_chars
    FROM document_blocks
    WHERE document_id = ${documentId}
    GROUP BY block_type
    ORDER BY count DESC
  `);

    return stats.rows;
}

// ============================================================================
// Example 8: Find similar blocks (for future RAG with embeddings)
// ============================================================================

export async function findSimilarBlocks(
    documentId: string,
    queryText: string,
    limit: number = 5
) {
    // This is a placeholder for when you add embeddings
    // You would:
    // 1. Generate embedding for queryText
    // 2. Use vector similarity search
    // 3. Return most similar blocks

    // For now, use full-text search as fallback
    return searchBlocksInDocument(documentId, queryText);
}

// ============================================================================
// Example 9: Export blocks as markdown
// ============================================================================

export async function exportBlocksAsMarkdown(documentId: string) {
    const blocks = await db
        .select()
        .from(documentBlocks)
        .where(eq(documentBlocks.documentId, documentId))
        .orderBy(documentBlocks.position);

    return blocks
        .map(block => {
            switch (block.blockType) {
                case "heading":
                    const level = (block.metadata as any)?.level || 1;
                    return `${"#".repeat(level)} ${block.textContent}`;
                case "code":
                    const language = (block.metadata as any)?.language || "";
                    return `\`\`\`${language}\n${block.textContent}\n\`\`\``;
                case "list-item":
                    return `- ${block.textContent}`;
                default:
                    return block.textContent;
            }
        })
        .join("\n\n");
}

// ============================================================================
// Example 10: Get blocks modified after a certain time
// ============================================================================

export async function getRecentlyModifiedBlocks(
    documentId: string,
    since: Date
) {
    const blocks = await db.execute(sql`
    SELECT *
    FROM document_blocks
    WHERE document_id = ${documentId}
      AND updated_at > ${since.toISOString()}
    ORDER BY updated_at DESC
  `);

    return blocks.rows;
}

// ============================================================================
// Example 11: Batch update block metadata
// ============================================================================

export async function updateBlockMetadata(
    blockId: string,
    metadata: Record<string, any>
) {
    await db
        .update(documentBlocks)
        .set({
            metadata: metadata,
            updatedAt: new Date(),
        })
        .where(eq(documentBlocks.id, blockId));
}

// ============================================================================
// Example 12: Delete orphaned blocks (cleanup utility)
// ============================================================================

export async function cleanupOrphanedBlocks() {
    // Delete blocks whose documents no longer exist
    const result = await db.execute(sql`
    DELETE FROM document_blocks
    WHERE document_id NOT IN (SELECT id FROM documents)
  `);

    return result;
}
