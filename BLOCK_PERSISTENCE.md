# Block-Level Persistence Implementation Guide

## 📚 Overview

This implementation provides **semantic block-level persistence** for Lexical.js documents, enabling:
- ✅ Stable block tracking using Lexical node keys
- ✅ Debounced persistence (no keystroke-level writes)
- ✅ Automatic dirty tracking
- ✅ RAG-ready text extraction
- ✅ Future-proof for AI features

---

## 🏗️ Architecture

### Data Flow

```
┌─────────────────┐
│  Lexical Editor │
│   (User types)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ BlockPersistencePlugin  │
│  - Listens to changes   │
│  - Tracks dirty blocks  │
│  - Debounces commits    │
└────────┬────────────────┘
         │
         ▼ (2s debounce / blur / block change)
┌─────────────────────────┐
│   extractBlocks()       │
│  - Get all top blocks   │
│  - Extract text content │
│  - Serialize metadata   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  syncDocumentBlocks()   │
│  - Upsert changed       │
│  - Delete removed       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   PostgreSQL DB         │
│   document_blocks table │
└─────────────────────────┘
```

---

## 🗄️ Database Schema

### `document_blocks` Table

```sql
CREATE TABLE document_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  block_key VARCHAR(100) NOT NULL,  -- Lexical node.__key
  block_type VARCHAR(50) NOT NULL,  -- paragraph, heading, list, code, etc.
  content TEXT NOT NULL,            -- Serialized block content (JSON)
  text_content TEXT,                -- Plain text for RAG/search
  metadata JSONB,                   -- { level: 2, listType: "bullet", ... }
  position INTEGER NOT NULL,        -- Order in document (0, 1, 2, ...)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(document_id, block_key)
);

CREATE INDEX idx_document_blocks_document_id ON document_blocks(document_id);
CREATE INDEX idx_document_blocks_text_content ON document_blocks USING gin(to_tsvector('english', text_content));
```

### Why This Schema?

| Field | Purpose |
|-------|---------|
| `block_key` | Stable identifier from Lexical (survives edits) |
| `block_type` | Semantic type for filtering/querying |
| `content` | Full serialized block (for reconstruction) |
| `text_content` | Plain text for RAG embeddings & search |
| `metadata` | Type-specific data (heading level, list type, etc.) |
| `position` | Maintains document order |

---

## 🔧 Implementation Files

### 1. **Schema Definition** (`src/lib/db/schema.ts`)

```typescript
export const documentBlocks = pgTable(
  "document_blocks",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    blockKey: varchar("block_key", { length: 100 }).notNull(),
    blockType: varchar("block_type", { length: 50 }).notNull(),
    content: text("content").notNull(),
    textContent: text("text_content"),
    metadata: jsonb("metadata").$type<{
      level?: number;
      listType?: "bullet" | "number" | "check";
      language?: string;
      [key: string]: any;
    }>(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueDocumentBlock: unique("unique_document_block").on(
      table.documentId,
      table.blockKey
    ),
  })
);
```

### 2. **Database Functions** (`src/lib/db/blocks.ts`)

#### Key Functions:

```typescript
// Main function: sync all blocks (upsert + delete)
syncDocumentBlocks(documentId: string, currentBlocks: BlockData[])

// Individual operations
upsertDocumentBlocks(documentId: string, blocks: BlockData[])
deleteDocumentBlocks(documentId: string, blockKeysToDelete: string[])
getDocumentBlocks(documentId: string)
```

#### Example Usage:

```typescript
import { syncDocumentBlocks } from "@/lib/db/blocks";

// Extract blocks from editor
const blocks = extractBlocksFromEditor();

// Sync to database (handles inserts, updates, deletes)
await syncDocumentBlocks("doc-uuid-123", blocks);
```

### 3. **Lexical Plugin** (`src/components/editor/plugins/BlockPersistencePlugin.tsx`)

#### How It Works:

1. **Listens to editor updates** via `registerUpdateListener`
2. **Tracks dirty blocks** in a `Set<string>` (block keys)
3. **Debounces commits** (default 2 seconds)
4. **Immediate commits** on:
   - Editor blur
   - Selection moves to different block
5. **Extracts blocks** from `$getRoot().getChildren()`
6. **Syncs to database** via `syncDocumentBlocks()`

#### Block Detection:

```typescript
function getBlockInfo(node: LexicalNode) {
  if ($isHeadingNode(node)) {
    return { blockType: "heading", metadata: { level: 2 } };
  }
  if ($isListNode(node)) {
    return { blockType: "list", metadata: { listType: "bullet" } };
  }
  if (node.getType() === "paragraph") {
    return { blockType: "paragraph", metadata: {} };
  }
  // ... more node types
}
```

---

## 🚀 Integration Steps

### Step 1: Run Database Migration

```bash
# Generate migration
bun drizzle-kit generate

# Apply migration
bun drizzle-kit migrate
```

### Step 2: Add Plugin to Editor

Update `src/components/editor/plugins/index.tsx`:

```typescript
import BlockPersistencePlugin from "./BlockPersistencePlugin";

export default function EditorPlugins({ documentId }: { documentId: string }) {
  return (
    <>
      {/* Existing plugins */}
      <HistoryPlugin />
      <AutoLinkPlugin />
      {/* ... */}
      
      {/* Add block persistence */}
      <BlockPersistencePlugin documentId={documentId} debounceMs={2000} />
    </>
  );
}
```

### Step 3: Pass Document ID to Editor

Update `src/components/documents/DocumentPage.tsx`:

```typescript
<Editor
  content={data?.content as string}
  setContent={(data) => setData((p) => ({ ...p, content: data }))}
  documentId={data?.id} // ← Add this
/>
```

Update `src/components/editor/editor.tsx`:

```typescript
interface EditorProps {
  content: string;
  setContent?: (data: string) => void;
  documentId?: string; // ← Add this
}

function Editor({ content, setContent, documentId }: EditorProps) {
  return (
    <>
      <RichTextPlugin ... />
      <ParseContentPlugin ... />
      <EditorPlugins documentId={documentId} /> {/* ← Pass it */}
    </>
  );
}
```

---

## 🎯 Commit Triggers

Blocks are persisted when:

| Trigger | Behavior | Rationale |
|---------|----------|-----------|
| **User stops typing** | 2s debounce | Batch edits together |
| **Editor blur** | Immediate commit | Save before leaving |
| **Block navigation** | Immediate commit | Semantic boundary |
| **Component unmount** | Immediate commit | Cleanup |

**NOT triggered by:**
- ❌ Every keystroke
- ❌ Cursor movement within same block
- ❌ Selection changes within same block

---

## 📊 Example Queries

### Get all blocks for a document

```typescript
const { data: blocks } = await getDocumentBlocks("doc-uuid");
```

### Search blocks by text

```sql
SELECT * FROM document_blocks
WHERE document_id = 'doc-uuid'
  AND to_tsvector('english', text_content) @@ plainto_tsquery('search term')
ORDER BY position;
```

### Get all headings

```typescript
const headings = await db
  .select()
  .from(documentBlocks)
  .where(
    and(
      eq(documentBlocks.documentId, docId),
      eq(documentBlocks.blockType, "heading")
    )
  )
  .orderBy(documentBlocks.position);
```

### RAG: Get blocks with embeddings

```sql
-- Future: Join with embeddings table
SELECT 
  b.text_content,
  b.block_type,
  e.embedding
FROM document_blocks b
LEFT JOIN block_embeddings e ON e.block_id = b.id
WHERE b.document_id = 'doc-uuid'
ORDER BY b.position;
```

---

## 🧪 Testing

### Manual Testing

1. Open a document in the editor
2. Type a paragraph → wait 2s → check DB
3. Add a heading → blur editor → check DB
4. Delete a block → wait 2s → verify deletion in DB
5. Navigate between blocks → verify immediate commits

### Database Verification

```sql
-- Check blocks were created
SELECT block_key, block_type, text_content, position
FROM document_blocks
WHERE document_id = 'your-doc-id'
ORDER BY position;

-- Check timestamps
SELECT block_key, created_at, updated_at
FROM document_blocks
WHERE document_id = 'your-doc-id';
```

---

## 🔮 Future Enhancements

### 1. **Block-Level Embeddings**

```typescript
// Generate embeddings per block
const { embedding } = await embed({
  value: block.textContent,
  model: google.textEmbeddingModel("text-embedding-004"),
});

await db.insert(blockEmbeddings).values({
  blockId: block.id,
  embedding,
});
```

### 2. **Collaborative Editing**

- Use `block_key` for conflict resolution
- Track `updated_at` for last-write-wins
- Implement operational transforms per block

### 3. **Version History**

```sql
CREATE TABLE block_versions (
  id UUID PRIMARY KEY,
  block_id UUID REFERENCES document_blocks(id),
  content TEXT,
  version INTEGER,
  created_at TIMESTAMP
);
```

### 4. **AI Context Retrieval**

```typescript
// Get relevant blocks for AI context
const relevantBlocks = await db
  .select()
  .from(documentBlocks)
  .where(
    and(
      eq(documentBlocks.documentId, docId),
      inArray(documentBlocks.blockType, ["heading", "paragraph"])
    )
  )
  .limit(10);
```

---

## ⚠️ Important Notes

### Performance Considerations

- **Debounce is critical**: Prevents DB overload
- **Batch operations**: `Promise.all` for parallel upserts
- **Index `document_id`**: Fast lookups
- **Unique constraint**: Prevents duplicates

### Edge Cases Handled

✅ **Rapid typing**: Debounced to single commit  
✅ **Block deletion**: Detected via diff with DB state  
✅ **Block reordering**: Position field updated  
✅ **Editor unmount**: Final commit in cleanup  
✅ **Concurrent edits**: Unique constraint prevents duplicates  

### What's NOT Handled (By Design)

❌ **Inline formatting**: Not block-level (bold, italic, etc.)  
❌ **Sentence-level tracking**: Too granular  
❌ **Real-time sync**: Use separate WebSocket layer  
❌ **Conflict resolution**: Implement separately for collab  

---

## 📝 Summary

This implementation provides a **production-ready, RAG-compatible** block persistence layer that:

1. ✅ Uses Lexical node keys as stable identifiers
2. ✅ Tracks only top-level semantic blocks
3. ✅ Debounces writes to avoid DB spam
4. ✅ Handles inserts, updates, and deletes
5. ✅ Extracts plain text for embeddings
6. ✅ Maintains document structure via position
7. ✅ Supports future AI/RAG features

**Next Steps:**
1. Run migration to create `document_blocks` table
2. Integrate `BlockPersistencePlugin` into editor
3. Test with real documents
4. (Optional) Add block-level embeddings for RAG
