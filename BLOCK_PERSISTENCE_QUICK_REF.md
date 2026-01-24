# Block Persistence Quick Reference

## 🚀 Quick Start

### 1. Generate and Run Migration

```bash
# Generate migration from schema changes
bun drizzle-kit generate

# Apply migration to database
bun drizzle-kit migrate
```

### 2. Plugin is Already Integrated

The `BlockPersistencePlugin` is automatically active when you pass a `documentId` to the Editor component.

```tsx
<Editor
  content={content}
  documentId="your-document-id" // ← This enables block persistence
/>
```

---

## 📊 Database Queries

### Get All Blocks

```typescript
import { getDocumentBlocks } from "@/lib/db/blocks";

const { data: blocks } = await getDocumentBlocks(documentId);
```

### Get Headings Only

```typescript
const headings = await db
  .select()
  .from(documentBlocks)
  .where(
    and(
      eq(documentBlocks.documentId, documentId),
      eq(documentBlocks.blockType, "heading")
    )
  )
  .orderBy(documentBlocks.position);
```

### Search Blocks

```typescript
const results = await db.execute(sql`
  SELECT * FROM document_blocks
  WHERE document_id = ${documentId}
    AND to_tsvector('english', text_content) @@ plainto_tsquery('english', ${query})
  ORDER BY position
`);
```

---

## 🔧 Manual Sync (Advanced)

```typescript
import { syncDocumentBlocks, BlockData } from "@/lib/db/blocks";

const blocks: BlockData[] = [
  {
    blockKey: "abc123",
    blockType: "paragraph",
    content: '{"type":"paragraph","text":"Hello"}',
    textContent: "Hello",
    metadata: {},
    position: 0,
  },
];

await syncDocumentBlocks(documentId, blocks);
```

---

## 🎯 Block Types

| Type | Description | Metadata |
|------|-------------|----------|
| `paragraph` | Regular paragraph | `{}` |
| `heading` | H1-H6 heading | `{ level: 1-6 }` |
| `list` | Bullet/numbered list | `{ listType: "bullet" \| "number" }` |
| `list-item` | List item | `{ checked: boolean }` |
| `code` | Code block | `{ language: string }` |

---

## ⚡ Commit Triggers

Blocks are saved when:

- ✅ User stops typing (2 second debounce)
- ✅ Editor loses focus (blur)
- ✅ Cursor moves to different block
- ✅ Component unmounts

**NOT saved on:**
- ❌ Every keystroke
- ❌ Cursor movement within same block

---

## 🔍 Common Queries

### Table of Contents

```typescript
const toc = await db
  .select({
    text: documentBlocks.textContent,
    level: documentBlocks.metadata,
  })
  .from(documentBlocks)
  .where(
    and(
      eq(documentBlocks.documentId, docId),
      eq(documentBlocks.blockType, "heading")
    )
  )
  .orderBy(documentBlocks.position);
```

### Block Count by Type

```typescript
const stats = await db.execute(sql`
  SELECT block_type, COUNT(*) as count
  FROM document_blocks
  WHERE document_id = ${docId}
  GROUP BY block_type
`);
```

### Recently Modified Blocks

```typescript
const recent = await db
  .select()
  .from(documentBlocks)
  .where(eq(documentBlocks.documentId, docId))
  .orderBy(desc(documentBlocks.updatedAt))
  .limit(10);
```

---

## 🤖 RAG Integration

### Get Context for AI

```typescript
const blocks = await db
  .select({ textContent: documentBlocks.textContent })
  .from(documentBlocks)
  .where(eq(documentBlocks.documentId, docId))
  .orderBy(documentBlocks.position)
  .limit(20);

const context = blocks.map(b => b.textContent).join("\n\n");
```

### Future: Block Embeddings

```typescript
// After adding embeddings
const { embedding } = await embed({
  value: block.textContent,
  model: google.textEmbeddingModel("text-embedding-004"),
});

await db.insert(blockEmbeddings).values({
  blockId: block.id,
  embedding,
});
```

---

## 🐛 Debugging

### Check if blocks are being saved

```sql
SELECT 
  block_key,
  block_type,
  LEFT(text_content, 50) as preview,
  updated_at
FROM document_blocks
WHERE document_id = 'your-doc-id'
ORDER BY position;
```

### Monitor plugin activity

Open browser console and look for:
```
✅ Persisted 5 blocks
```

### Verify triggers

1. Type in editor → wait 2s → check console
2. Click outside editor → check console immediately
3. Move to different paragraph → check console

---

## 📝 Schema Reference

```sql
CREATE TABLE document_blocks (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  block_key VARCHAR(100) NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  text_content TEXT,
  metadata JSONB,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, block_key)
);

CREATE INDEX idx_document_blocks_document_id ON document_blocks(document_id);
CREATE INDEX idx_document_blocks_text_content ON document_blocks 
  USING gin(to_tsvector('english', text_content));
```

---

## 🔗 File Locations

| File | Purpose |
|------|---------|
| `src/lib/db/schema.ts` | Table definition |
| `src/lib/db/blocks.ts` | CRUD functions |
| `src/components/editor/plugins/BlockPersistencePlugin.tsx` | Lexical plugin |
| `src/lib/db/blocks.examples.ts` | Usage examples |
| `BLOCK_PERSISTENCE.md` | Full documentation |

---

## ⚠️ Troubleshooting

### Blocks not saving?

1. Check `documentId` is passed to Editor
2. Verify plugin is in `EditorPlugins`
3. Check browser console for errors
4. Verify database connection

### Duplicate blocks?

- Unique constraint prevents this
- If you see errors, check `block_key` uniqueness

### Performance issues?

- Debounce is set to 2000ms (adjust in plugin props)
- Batch operations use `Promise.all`
- Indexes are on `document_id` and `text_content`

---

## 📚 Next Steps

1. ✅ Run migration
2. ✅ Test in browser
3. 🔜 Add block embeddings for RAG
4. 🔜 Implement semantic search
5. 🔜 Build AI context retrieval
