"use server";

import { db } from "./drizzle";
import { documentBlocks, NewDocumentBlock } from "./schema";
import { and, eq, inArray } from "drizzle-orm";

export interface BlockData {
    blockKey: string;
    blockType: string;
    content: string;
    textContent: string;
    metadata?: Record<string, any>;
    position: number;
}

/**
 * Upsert multiple blocks for a document
 * This is the main function called when committing dirty blocks
 */
export const upsertDocumentBlocks = async (
    documentId: string,
    blocks: BlockData[]
) => {
    try {
        if (blocks.length === 0) return { success: true, error: null };

        const values: NewDocumentBlock[] = blocks.map((block) => ({
            documentId,
            blockKey: block.blockKey,
            blockType: block.blockType,
            content: block.content,
            textContent: block.textContent,
            metadata: block.metadata || null,
            position: block.position,
            updatedAt: new Date(),
        }));

        // Use onConflictDoUpdate to handle both inserts and updates
        await Promise.all(
            values.map((value) =>
                db
                    .insert(documentBlocks)
                    .values(value)
                    .onConflictDoUpdate({
                        target: [documentBlocks.documentId, documentBlocks.blockKey],
                        set: {
                            blockType: value.blockType,
                            content: value.content,
                            textContent: value.textContent,
                            metadata: value.metadata,
                            position: value.position,
                            updatedAt: new Date(),
                        },
                    })
            )
        );

        return { success: true, error: null };
    } catch (error) {
        console.error("Error upserting document blocks:", error);
        return { success: false, error: (error as Error).message };
    }
};

/**
 * Delete blocks that no longer exist in the document
 */
export const deleteDocumentBlocks = async (
    documentId: string,
    blockKeysToDelete: string[]
) => {
    try {
        if (blockKeysToDelete.length === 0) return { success: true, error: null };

        await db
            .delete(documentBlocks)
            .where(
                and(
                    eq(documentBlocks.documentId, documentId),
                    inArray(documentBlocks.blockKey, blockKeysToDelete)
                )
            );

        return { success: true, error: null };
    } catch (error) {
        console.error("Error deleting document blocks:", error);
        return { success: false, error: (error as Error).message };
    }
};

/**
 * Get all blocks for a document
 */
export const getDocumentBlocks = async (documentId: string) => {
    try {
        const blocks = await db
            .select()
            .from(documentBlocks)
            .where(eq(documentBlocks.documentId, documentId))
            .orderBy(documentBlocks.position);

        return { data: blocks, error: null };
    } catch (error) {
        console.error("Error fetching document blocks:", error);
        return { data: null, error: (error as Error).message };
    }
};

/**
 * Delete all blocks for a document (useful when document is deleted)
 */
export const deleteAllDocumentBlocks = async (documentId: string) => {
    try {
        await db
            .delete(documentBlocks)
            .where(eq(documentBlocks.documentId, documentId));

        return { success: true, error: null };
    } catch (error) {
        console.error("Error deleting all document blocks:", error);
        return { success: false, error: (error as Error).message };
    }
};

/**
 * Sync blocks: upsert current blocks and delete removed ones
 * This is the recommended function to call during commit
 */
export const syncDocumentBlocks = async (
    documentId: string,
    currentBlocks: BlockData[]
) => {
    try {
        // Get existing block keys from DB
        const existingBlocks = await db
            .select({ blockKey: documentBlocks.blockKey })
            .from(documentBlocks)
            .where(eq(documentBlocks.documentId, documentId));

        const existingBlockKeys = new Set(
            existingBlocks.map((b) => b.blockKey)
        );
        const currentBlockKeys = new Set(currentBlocks.map((b) => b.blockKey));

        // Find blocks to delete (exist in DB but not in current editor state)
        const blocksToDelete = Array.from(existingBlockKeys).filter(
            (key) => !currentBlockKeys.has(key)
        );

        // Upsert current blocks
        await upsertDocumentBlocks(documentId, currentBlocks);

        // Delete removed blocks
        if (blocksToDelete.length > 0) {
            await deleteDocumentBlocks(documentId, blocksToDelete);
        }

        return { success: true, error: null };
    } catch (error) {
        console.error("Error syncing document blocks:", error);
        return { success: false, error: (error as Error).message };
    }
};
