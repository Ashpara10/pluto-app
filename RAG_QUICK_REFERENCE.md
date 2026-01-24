# RAG Pipeline - Quick Reference

## 🚀 Quick Start

### **1. Simple Ask AI**

```typescript
import { prepareRAGPrompt } from "@/lib/db/rag";
import { generateText } from "ai";
import google from "@/lib/ai";

// One-liner RAG flow
const { prompt } = await prepareRAGPrompt(documentId, userQuestion);
const { text } = await generateText({ model: google("gemini-2.0-flash-exp"), prompt });
```

---

## 📋 Core Functions

| Function | Purpose | When to Use |
|----------|---------|-------------|
| `prepareRAGPrompt()` | Complete RAG flow | **Most common** - Ask AI, Q&A |
| `ensureDocumentEmbeddings()` | Generate embeddings | Before any AI action |
| `searchSimilarChunks()` | Find relevant chunks | Custom RAG flows |
| `buildRAGPrompt()` | Format prompt | Custom prompt templates |
| `getEmbeddingStats()` | Debug info | Troubleshooting |

---

## 🎯 Common Use Cases

### **Ask AI**
```typescript
const result = await prepareRAGPrompt(docId, question);
const { text } = await generateText({ model, prompt: result.prompt });
```

### **Continue Writing**
```typescript
await ensureDocumentEmbeddings(docId);
const { chunks } = await searchSimilarChunks(docId, lastSentence, 4);
// Use chunks as context for continuation
```

### **Summarize**
```typescript
await ensureDocumentEmbeddings(docId);
const chunks = await db.select().from(documentEmbeddings)...
// Use all chunks for summary
```

---

## 🔍 Similarity Search Query

```sql
SELECT 
  chunk,
  chunk_index,
  1 - (embedding <=> $queryEmbedding::vector) as similarity
FROM document_embeddings
WHERE document_id = $documentId
ORDER BY embedding <=> $queryEmbedding::vector
LIMIT 6
```

**Key Points:**
- `<=>` = cosine distance operator (pgvector)
- Lower distance = More similar
- Returns top 6 most relevant chunks

---

## 📊 Data Flow

```
User Question
    ↓
ensureDocumentEmbeddings(docId)
    ├─ Fetch blocks from document_blocks
    ├─ Generate embeddings (text-embedding-004)
    └─ Upsert to document_embeddings
    ↓
searchSimilarChunks(docId, question)
    ├─ Generate query embedding
    └─ Vector similarity search
    ↓
buildRAGPrompt(question, chunks)
    └─ Format context + instructions
    ↓
Send to LLM
    ↓
Return Answer
```

---

## 🗄️ Schema Mapping

```
document_blocks              document_embeddings
├─ position         ────────▶ chunk_index
├─ text_content     ────────▶ chunk
└─ document_id      ────────▶ document_id
                             └─ embedding (generated)
```

---

## ⚡ Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Generate 15 embeddings | ~2s | Batch operation |
| Search 100 embeddings | ~50ms | Indexed |
| Full RAG flow | ~3s | First time only |
| Subsequent searches | ~100ms | Embeddings cached in DB |

---

## 🐛 Debugging

### Check embeddings exist
```typescript
const stats = await getEmbeddingStats(docId);
console.log(stats); // { total_embeddings: 15, ... }
```

### Test search
```typescript
const result = await searchSimilarChunks(docId, "test", 3);
console.log(result.chunks.map(c => c.chunk.substring(0, 50)));
```

### Verify sync
```sql
-- Should return 0 if synced
SELECT COUNT(*) FROM document_blocks b
LEFT JOIN document_embeddings e 
  ON b.document_id = e.document_id 
  AND b.position = e.chunk_index
WHERE b.document_id = 'doc-id' AND e.id IS NULL;
```

---

## ✅ Response Format

All functions return:

```typescript
// Success
{ success: true, ...data }

// Error
{ success: false, error: "message" }
```

**Always check:**
```typescript
if (!result.success) {
  console.error(result.error);
  return;
}
// Use result safely
```

---

## 📝 Example API Route

```typescript
// app/api/ask/route.ts
import { prepareRAGPrompt } from "@/lib/db/rag";
import { generateText } from "ai";
import google from "@/lib/ai";

export async function POST(req: Request) {
  const { documentId, question } = await req.json();

  // RAG flow
  const ragResult = await prepareRAGPrompt(documentId, question);
  if (!ragResult.success) {
    return Response.json({ error: ragResult.error }, { status: 500 });
  }

  // LLM call
  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    prompt: ragResult.prompt,
  });

  return Response.json({ 
    answer: text,
    chunksUsed: ragResult.metadata?.chunksRetrieved 
  });
}
```

---

## 🎨 Custom Prompt Template

```typescript
function customRAGPrompt(question: string, chunks: any[]) {
  const context = chunks.map(c => c.chunk).join("\n\n");
  
  return `You are Pluto, an AI writing assistant.

<CONTEXT>
${context}
</CONTEXT>

<QUESTION>
${question}
</QUESTION>

<INSTRUCTIONS>
- Answer using ONLY the context
- Be concise and specific
- Use markdown formatting
</INSTRUCTIONS>

Answer:`;
}
```

---

## 🔧 Configuration

### Adjust number of chunks
```typescript
const { chunks } = await searchSimilarChunks(docId, query, 10); // Default: 6
```

### Custom temperature
```typescript
const { text } = await generateText({
  model: google("gemini-2.0-flash-exp"),
  prompt,
  temperature: 0.5, // Lower = more focused
  maxTokens: 500,
});
```

---

## 🚨 Common Issues

### "No embeddings found"
**Solution:** Call `ensureDocumentEmbeddings()` first

### "Embeddings out of sync"
**Solution:** Call `ensureDocumentEmbeddings()` to regenerate

### "Slow first query"
**Cause:** Generating embeddings (~2-3s)
**Solution:** Normal - subsequent queries are fast

### "Low similarity scores"
**Cause:** Query doesn't match document content
**Solution:** Rephrase query or check document has content

---

## 📚 Files

- **Core:** `src/lib/db/rag.ts`
- **Examples:** `src/lib/db/rag.examples.ts`
- **Docs:** `RAG_IMPLEMENTATION.md`
- **Quick Ref:** `RAG_QUICK_REFERENCE.md` (this file)

---

## 💡 Tips

1. **Always call `ensureDocumentEmbeddings()` before search** - It's idempotent and fast if embeddings exist
2. **Use `prepareRAGPrompt()` for simple cases** - It handles everything
3. **Check `success` field** - All functions return structured responses
4. **Adjust `limit` based on use case** - 6 chunks for Q&A, 3-4 for continuation
5. **Monitor logs** - Look for `[RAG]` prefix in console

---

## 🎯 One-Liner Cheat Sheet

```typescript
// Ask AI
const { prompt } = await prepareRAGPrompt(docId, question);

// Continue Writing
const { chunks } = await searchSimilarChunks(docId, lastSentence, 4);

// Summarize
await ensureDocumentEmbeddings(docId);

// Debug
const stats = await getEmbeddingStats(docId);
```

**That's all you need to know!** 🚀
