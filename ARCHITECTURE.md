# Block-Level Persistence Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    DocumentPage.tsx                       │ │
│  │  - Manages document state                                 │ │
│  │  - Passes documentId to Editor                           │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      Editor.tsx                           │ │
│  │  - Lexical Composer                                       │ │
│  │  - RichTextPlugin                                         │ │
│  │  - Passes documentId to EditorPlugins                    │ │
│  └───────────────────────────┬───────────────────────────────┘ │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LEXICAL PLUGINS                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              BlockPersistencePlugin.tsx                   │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  1. registerUpdateListener()                        │ │ │
│  │  │     - Detects dirty elements & leaves               │ │ │
│  │  │     - Finds parent blocks                           │ │ │
│  │  │     - Adds to dirtyBlocksRef Set                    │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                          │                                │ │
│  │                          ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  2. markDirtyAndScheduleCommit()                    │ │ │
│  │  │     - Clears existing timeout                       │ │ │
│  │  │     - Schedules commit after debounceMs (2s)        │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                          │                                │ │
│  │                          ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  3. Commit Triggers                                 │ │ │
│  │  │     ✓ Debounce timeout (2s)                         │ │ │
│  │  │     ✓ Editor blur                                   │ │ │
│  │  │     ✓ Selection moves to different block           │ │ │
│  │  │     ✓ Component unmount                             │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                          │                                │ │
│  │                          ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  4. extractBlocks()                                 │ │ │
│  │  │     - $getRoot().getChildren()                      │ │ │
│  │  │     - For each top-level node:                      │ │ │
│  │  │       • Get block type (heading, paragraph, etc.)   │ │ │
│  │  │       • Extract text content                        │ │ │
│  │  │       • Extract metadata (level, listType, etc.)    │ │ │
│  │  │       • Get position index                          │ │ │
│  │  │       • Use node.__key as blockKey                  │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                          │                                │ │
│  │                          ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  5. commitBlocks()                                  │ │ │
│  │  │     - Calls syncDocumentBlocks()                    │ │ │
│  │  │     - Clears dirtyBlocksRef                         │ │ │
│  │  │     - Logs success/failure                          │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────┬───────────────────────────────┘ │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (blocks.ts)                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              syncDocumentBlocks()                         │ │
│  │                                                           │ │
│  │  1. Get existing blocks from DB                          │ │
│  │     SELECT block_key FROM document_blocks                │ │
│  │     WHERE document_id = ?                                │ │
│  │                                                           │ │
│  │  2. Compare with current blocks                          │ │
│  │     - Find blocks to delete (in DB but not in editor)    │ │
│  │     - Find blocks to upsert (all current blocks)         │ │
│  │                                                           │ │
│  │  3. Upsert current blocks                                │ │
│  │     INSERT INTO document_blocks (...)                    │ │
│  │     ON CONFLICT (document_id, block_key)                 │ │
│  │     DO UPDATE SET ...                                    │ │
│  │                                                           │ │
│  │  4. Delete removed blocks                                │ │
│  │     DELETE FROM document_blocks                          │ │
│  │     WHERE document_id = ? AND block_key IN (...)         │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  document_blocks table                    │ │
│  │                                                           │ │
│  │  Columns:                                                 │ │
│  │  • id (uuid, PK)                                          │ │
│  │  • document_id (uuid, FK → documents.id)                 │ │
│  │  • block_key (varchar, unique per document)              │ │
│  │  • block_type (varchar: paragraph, heading, list, etc.)  │ │
│  │  • content (text: serialized block data)                 │ │
│  │  • text_content (text: plain text for RAG)               │ │
│  │  • metadata (jsonb: type-specific data)                  │ │
│  │  • position (integer: order in document)                 │ │
│  │  • created_at (timestamp)                                │ │
│  │  • updated_at (timestamp)                                │ │
│  │                                                           │ │
│  │  Constraints:                                             │ │
│  │  • UNIQUE(document_id, block_key)                        │ │
│  │  • ON DELETE CASCADE (when document deleted)             │ │
│  │                                                           │ │
│  │  Indexes:                                                 │ │
│  │  • idx_document_blocks_document_id                       │ │
│  │  • idx_document_blocks_text_content (GIN for FTS)        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
┌──────┐                                                    ┌──────────┐
│ User │                                                    │ Database │
└──┬───┘                                                    └────┬─────┘
   │                                                             │
   │ 1. Types "Hello World"                                     │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ 2. Lexical fires update event                              │
   │    (dirtyElements, dirtyLeaves)                            │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ 3. Plugin detects dirty paragraph block                    │
   │    Adds block key to dirtyBlocksRef                        │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ 4. Plugin schedules commit (2s debounce)                   │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ ... User continues typing ...                              │
   │ Each keystroke resets the 2s timer                         │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ 5. User stops typing for 2 seconds                         │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ 6. Plugin extracts all blocks:                             │
   │    [                                                        │
   │      {                                                      │
   │        blockKey: "abc123",                                 │
   │        blockType: "paragraph",                             │
   │        content: '{"type":"paragraph",...}',                │
   │        textContent: "Hello World",                         │
   │        metadata: {},                                       │
   │        position: 0                                         │
   │      }                                                      │
   │    ]                                                        │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ 7. Calls syncDocumentBlocks(docId, blocks) ────────────────▶│
   │                                                             │
   │                                          8. Get existing ◀──┤
   │                                             block keys      │
   │                                                             │
   │                                          9. Compare sets ◀──┤
   │                                             (insert/update/ │
   │                                              delete)        │
   │                                                             │
   │                                         10. UPSERT blocks ◀─┤
   │                                             INSERT ... ON   │
   │                                             CONFLICT DO     │
   │                                             UPDATE          │
   │                                                             │
   │                                         11. DELETE removed ◀┤
   │                                             blocks          │
   │                                                             │
   │◀────────────────────────────────────────12. Return success─┤
   │                                                             │
   │ 13. Clear dirtyBlocksRef                                   │
   │     Log "✅ Persisted 1 blocks"                            │
   └─────────────────────────────────────────────────────────────┘
```

---

## Block Type Detection

```
Lexical Node Tree:
┌─────────────────────────────────────┐
│ RootNode                            │
│  ├─ HeadingNode (h2)                │  ──▶  { blockType: "heading", metadata: { level: 2 } }
│  │   └─ TextNode "Introduction"     │
│  │                                   │
│  ├─ ParagraphNode                   │  ──▶  { blockType: "paragraph", metadata: {} }
│  │   └─ TextNode "Hello world"      │
│  │                                   │
│  ├─ ListNode (bullet)               │  ──▶  { blockType: "list", metadata: { listType: "bullet" } }
│  │   ├─ ListItemNode                │  ──▶  { blockType: "list-item", metadata: {} }
│  │   │   └─ TextNode "Item 1"       │
│  │   └─ ListItemNode                │  ──▶  { blockType: "list-item", metadata: {} }
│  │       └─ TextNode "Item 2"       │
│  │                                   │
│  └─ CodeNode (javascript)           │  ──▶  { blockType: "code", metadata: { language: "javascript" } }
│      └─ TextNode "const x = 1;"     │
└─────────────────────────────────────┘
```

---

## Dirty Block Tracking

```
┌──────────────────────────────────────────────────────────────┐
│                    In-Memory State                           │
│                                                              │
│  dirtyBlocksRef = Set<string> {                             │
│    "abc123",  // Paragraph block key                        │
│    "def456",  // Heading block key                          │
│  }                                                           │
│                                                              │
│  commitTimeoutRef = NodeJS.Timeout | null                   │
│    - Cleared and reset on each edit                         │
│    - Fires after 2s of inactivity                           │
│                                                              │
│  lastSelectionKeyRef = string | null                        │
│    - Tracks current block cursor is in                      │
│    - Used to detect block navigation                        │
│                                                              │
│  isCommittingRef = boolean                                  │
│    - Prevents concurrent commits                            │
│    - Set to true during DB operation                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Operations

### Upsert Flow

```sql
-- For each block in current editor state:

INSERT INTO document_blocks (
  document_id,
  block_key,
  block_type,
  content,
  text_content,
  metadata,
  position,
  updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, NOW()
)
ON CONFLICT (document_id, block_key) 
DO UPDATE SET
  block_type = EXCLUDED.block_type,
  content = EXCLUDED.content,
  text_content = EXCLUDED.text_content,
  metadata = EXCLUDED.metadata,
  position = EXCLUDED.position,
  updated_at = NOW();
```

### Delete Flow

```sql
-- Find blocks that exist in DB but not in editor:

WITH current_keys AS (
  SELECT unnest(ARRAY['abc123', 'def456']) AS block_key
)
DELETE FROM document_blocks
WHERE document_id = $1
  AND block_key NOT IN (SELECT block_key FROM current_keys);
```

---

## Future: RAG Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    Block → Embedding Pipeline                   │
│                                                                 │
│  1. Block saved to DB                                           │
│     ↓                                                            │
│  2. Extract text_content                                        │
│     ↓                                                            │
│  3. Generate embedding                                          │
│     const { embedding } = await embed({                         │
│       value: block.textContent,                                 │
│       model: google.textEmbeddingModel("text-embedding-004")    │
│     });                                                          │
│     ↓                                                            │
│  4. Store in block_embeddings table                             │
│     INSERT INTO block_embeddings (block_id, embedding)          │
│     ↓                                                            │
│  5. Use for semantic search                                     │
│     SELECT * FROM document_blocks b                             │
│     JOIN block_embeddings e ON e.block_id = b.id                │
│     ORDER BY e.embedding <=> $query_embedding                   │
│     LIMIT 10;                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Debouncing

```
User types: "H" "e" "l" "l" "o"
            ↓   ↓   ↓   ↓   ↓
Timer:      2s  2s  2s  2s  2s  ← Each keystroke resets timer
                            ↓
                         Commit! ← Only fires after 2s of silence
```

### Batch Operations

```typescript
// ❌ BAD: Sequential inserts
for (const block of blocks) {
  await db.insert(documentBlocks).values(block);
}

// ✅ GOOD: Parallel upserts
await Promise.all(
  blocks.map(block =>
    db.insert(documentBlocks)
      .values(block)
      .onConflictDoUpdate(...)
  )
);
```

### Indexes

```sql
-- Fast document lookups
CREATE INDEX idx_document_blocks_document_id 
  ON document_blocks(document_id);

-- Full-text search
CREATE INDEX idx_document_blocks_text_content 
  ON document_blocks 
  USING gin(to_tsvector('english', text_content));
```

---

## Error Handling

```
┌──────────────────────────────────────────────────────────────┐
│                     Error Scenarios                          │
│                                                              │
│  1. Database connection lost                                │
│     → Plugin logs error, keeps dirty blocks in memory       │
│     → Retries on next commit trigger                        │
│                                                              │
│  2. Unique constraint violation                             │
│     → Should never happen (upsert handles this)             │
│     → If it does, log error and continue                    │
│                                                              │
│  3. Invalid block data                                      │
│     → Skip invalid blocks, persist valid ones               │
│     → Log warning for debugging                             │
│                                                              │
│  4. Concurrent commits                                      │
│     → isCommittingRef prevents this                         │
│     → Second commit waits for first to complete             │
└──────────────────────────────────────────────────────────────┘
```
