"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getRoot,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    LexicalNode,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef } from "react";
import { syncDocumentBlocks, BlockData } from "@/lib/db/blocks";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isListNode, $isListItemNode } from "@lexical/list";
import { $isCodeNode } from "@lexical/code";

interface BlockPersistencePluginProps {
    documentId: string;
    debounceMs?: number;
}

/**
 * Extract plain text content from a node and its children
 */
function extractTextContent(node: LexicalNode): string {
    if ($isTextNode(node)) {
        return node.getTextContent();
    }

    if ($isElementNode(node)) {
        return node.getChildren().map(extractTextContent).join("");
    }

    return "";
}

/**
 * Get block type and metadata from a Lexical node
 */
function getBlockInfo(node: LexicalNode): {
    blockType: string;
    metadata: Record<string, any>;
} | null {
    // Heading nodes
    if ($isHeadingNode(node)) {
        return {
            blockType: "heading",
            metadata: { level: parseInt(node.getTag().replace("h", "")) },
        };
    }

    // List nodes
    if ($isListNode(node)) {
        return {
            blockType: "list",
            metadata: { listType: node.getListType() },
        };
    }

    // List item nodes
    if ($isListItemNode(node)) {
        return {
            blockType: "list-item",
            metadata: { checked: node.getChecked() },
        };
    }

    // Code block nodes
    if ($isCodeNode(node)) {
        return {
            blockType: "code",
            metadata: { language: node.getLanguage() || "plaintext" },
        };
    }

    // Paragraph nodes (default)
    if (node.getType() === "paragraph") {
        return {
            blockType: "paragraph",
            metadata: {},
        };
    }

    // Skip non-block nodes
    return null;
}

/**
 * Plugin to track dirty blocks and persist them to the database
 */
export default function BlockPersistencePlugin({
    documentId,
    debounceMs = 2000,
}: BlockPersistencePluginProps) {
    const [editor] = useLexicalComposerContext();
    const dirtyBlocksRef = useRef<Set<string>>(new Set());
    const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSelectionKeyRef = useRef<string | null>(null);
    const isCommittingRef = useRef(false);

    console.log(dirtyBlocksRef.current);
    /**
     * Extract all top-level blocks from the editor
     */
    const extractBlocks = useCallback((): BlockData[] => {
        const blocks: BlockData[] = [];

        editor.getEditorState().read(() => {
            const root = $getRoot();
            const children = root.getChildren();

            children.forEach((node, index) => {
                const blockInfo = getBlockInfo(node);
                if (!blockInfo) return;

                const blockKey = node.getKey();
                const textContent = extractTextContent(node);

                // Serialize node to HTML/JSON for content
                const content = JSON.stringify({
                    type: node.getType(),
                    version: 1,
                    text: textContent,
                });

                blocks.push({
                    blockKey,
                    blockType: blockInfo.blockType,
                    content,
                    textContent,
                    metadata: blockInfo.metadata,
                    position: index,
                });
            });
        });

        return blocks;
    }, [editor]);

    /**
     * Commit dirty blocks to the database
     */
    const commitBlocks = useCallback(async () => {
        if (isCommittingRef.current) return;
        if (dirtyBlocksRef.current.size === 0) return;

        isCommittingRef.current = true;

        try {
            // Extract all blocks (we need full state to handle deletions)
            const allBlocks = extractBlocks();

            // Sync to database
            const result = await syncDocumentBlocks(documentId, allBlocks);

            if (result.success) {
                dirtyBlocksRef.current.clear();
                console.log(`✅ Persisted ${allBlocks.length} blocks`);
            } else {
                console.error("Failed to persist blocks:", result.error);
            }
        } catch (error) {
            console.error("Error committing blocks:", error);
        } finally {
            isCommittingRef.current = false;
        }
    }, [documentId, extractBlocks]);

    /**
     * Mark blocks as dirty and schedule commit
     */
    const markDirtyAndScheduleCommit = useCallback(
        (blockKeys: string[]) => {
            blockKeys.forEach((key) => dirtyBlocksRef.current.add(key));

            // Clear existing timeout
            if (commitTimeoutRef.current) {
                clearTimeout(commitTimeoutRef.current);
            }

            // Schedule new commit
            commitTimeoutRef.current = setTimeout(() => {
                commitBlocks();
            }, debounceMs);
        },
        [commitBlocks, debounceMs]
    );

    /**
     * Handle editor updates
     */
    useEffect(() => {
        const removeUpdateListener = editor.registerUpdateListener(
            ({ editorState, dirtyElements, dirtyLeaves }) => {
                // Skip if no changes
                if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

                editorState.read(() => {
                    const dirtyBlockKeys: string[] = [];

                    // Check dirty elements for block-level nodes
                    dirtyElements.forEach((_, nodeKey) => {
                        const node = editorState._nodeMap.get(nodeKey);
                        if (node && getBlockInfo(node)) {
                            dirtyBlockKeys.push(nodeKey);
                        }
                    });

                    // For dirty leaves, find their parent block
                    dirtyLeaves.forEach((_, nodeKey) => {
                        const node = editorState._nodeMap.get(nodeKey);
                        if (node) {
                            let parent = node.getParent();
                            while (parent) {
                                if (getBlockInfo(parent)) {
                                    dirtyBlockKeys.push(parent.getKey());
                                    break;
                                }
                                parent = parent.getParent();
                            }
                        }
                    });

                    if (dirtyBlockKeys.length > 0) {
                        markDirtyAndScheduleCommit(dirtyBlockKeys);
                    }
                });
            }
        );

        return () => {
            removeUpdateListener();
            if (commitTimeoutRef.current) {
                clearTimeout(commitTimeoutRef.current);
            }
        };
    }, [editor, markDirtyAndScheduleCommit]);

    /**
     * Handle selection changes (commit when moving to another block)
     */
    useEffect(() => {
        const removeSelectionListener = editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                editor.getEditorState().read(() => {
                    const selection = $getSelection();
                    if (!selection || !$isRangeSelection(selection)) return false;

                    const anchorNode = selection.anchor.getNode();
                    let currentBlockKey: string | null = null;

                    // Find the current block
                    let node: LexicalNode | null = anchorNode;
                    while (node) {
                        if (getBlockInfo(node)) {
                            currentBlockKey = node.getKey();
                            break;
                        }
                        node = node.getParent();
                    }

                    // If we moved to a different block, commit immediately
                    if (
                        currentBlockKey &&
                        lastSelectionKeyRef.current &&
                        currentBlockKey !== lastSelectionKeyRef.current &&
                        dirtyBlocksRef.current.size > 0
                    ) {
                        // Clear timeout and commit immediately
                        if (commitTimeoutRef.current) {
                            clearTimeout(commitTimeoutRef.current);
                        }
                        commitBlocks();
                    }

                    lastSelectionKeyRef.current = currentBlockKey;
                });

                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        return () => {
            removeSelectionListener();
        };
    }, [editor, commitBlocks]);

    /**
     * Handle editor blur (commit when focus leaves)
     */
    useEffect(() => {
        const rootElement = editor.getRootElement();
        if (!rootElement) return;

        const handleBlur = () => {
            if (dirtyBlocksRef.current.size > 0) {
                if (commitTimeoutRef.current) {
                    clearTimeout(commitTimeoutRef.current);
                }
                commitBlocks();
            }
        };

        rootElement.addEventListener("blur", handleBlur);

        return () => {
            rootElement.removeEventListener("blur", handleBlur);
        };
    }, [editor, commitBlocks]);

    /**
     * Cleanup: commit on unmount
     */
    useEffect(() => {
        return () => {
            if (dirtyBlocksRef.current.size > 0) {
                commitBlocks();
            }
        };
    }, [commitBlocks]);

    return null;
}
