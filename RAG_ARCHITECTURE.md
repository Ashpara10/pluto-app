# RAG Pipeline - Visual Architecture

## 📊 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
│                                                                     │
│  User clicks "Ask AI" button                                       │
│  Enters question: "What are the main themes?"                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ROUTE (/api/ask)                           │
│                                                                     │
│  POST { documentId: "doc-123", question: "What are..." }           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   prepareRAGPrompt(docId, question)                 │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Step 1: ensureDocumentEmbeddings(docId)                       │ │
│  │                                                               │ │
│  │  1. SELECT * FROM document_blocks WHERE document_id = docId  │ │
│  │     ↓                                                         │ │
│  │  2. Filter blocks with text_content                          │ │
│  │     ↓                                                         │ │
│  │  3. embedMany({ values: [text1, text2, ...] })               │ │
│  │     → Google text-embedding-004                              │ │
│  │     → Returns: [[0.23, 0.45, ...], [0.12, 0.67, ...], ...]   │ │
│  │     ↓                                                         │ │
│  │  4. INSERT INTO document_embeddings                          │ │
│  │     ON CONFLICT (document_id, chunk_index)                   │ │
│  │     DO UPDATE SET embedding = ..., chunk = ...               │ │
│  │     ↓                                                         │ │
│  │  5. DELETE orphaned embeddings                               │ │
│  │     (exist in DB but not in current blocks)                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                             │                                       │
│                             ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Step 2: searchSimilarChunks(docId, question, 6)              │ │
│  │                                                               │ │
│  │  1. embed({ value: "What are the main themes?" })            │ │
│  │     → Returns: [0.34, 0.56, 0.12, ...]                       │ │
│  │     ↓                                                         │ │
│  │  2. SELECT chunk, chunk_index,                               │ │
│  │            1 - (embedding <=> $queryEmbedding) as similarity │ │
│  │     FROM document_embeddings                                 │ │
│  │     WHERE document_id = docId                                │ │
│  │     ORDER BY embedding <=> $queryEmbedding                   │ │
│  │     LIMIT 6                                                  │ │
│  │     ↓                                                         │ │
│  │  3. Returns: [                                               │ │
│  │       { chunk: "Theme 1...", similarity: 0.89 },             │ │
│  │       { chunk: "Theme 2...", similarity: 0.82 },             │ │
│  │       ...                                                    │ │
│  │     ]                                                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                             │                                       │
│                             ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Step 3: buildRAGPrompt(question, chunks)                     │ │
│  │                                                               │ │
│  │  Formats as:                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ You are Pluto, an AI writing assistant...               │ │ │
│  │  │                                                          │ │ │
│  │  │ <CONTEXT>                                                │ │ │
│  │  │ [1] Theme 1 is about...                                  │ │ │
│  │  │ [2] Theme 2 focuses on...                                │ │ │
│  │  │ [3] Supporting evidence...                               │ │ │
│  │  │ </CONTEXT>                                               │ │ │
│  │  │                                                          │ │ │
│  │  │ <QUESTION>                                               │ │ │
│  │  │ What are the main themes?                                │ │ │
│  │  │ </QUESTION>                                              │ │ │
│  │  │                                                          │ │ │
│  │  │ <INSTRUCTIONS>                                           │ │ │
│  │  │ - Answer using ONLY the context                          │ │ │
│  │  │ - Be concise and specific                                │ │ │
│  │  │ </INSTRUCTIONS>                                          │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SEND TO LLM (Gemini)                           │
│                                                                     │
│  generateText({                                                     │
│    model: google("gemini-2.0-flash-exp"),                          │
│    prompt: ragPrompt,                                              │
│    temperature: 0.7                                                │
│  })                                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LLM RESPONSE                                  │
│                                                                     │
│  "The document discusses three main themes:                        │
│   1. Theme 1 - explanation based on context                        │
│   2. Theme 2 - explanation based on context                        │
│   3. Theme 3 - explanation based on context"                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RETURN TO USER                                 │
│                                                                     │
│  Display AI response in chat interface                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Operations

### **Embedding Generation**

```
document_blocks (source)              document_embeddings (derived)
┌──────────────────────────┐         ┌──────────────────────────────┐
│ id: uuid-1               │         │ id: uuid-a                   │
│ document_id: doc-123     │────────▶│ document_id: doc-123         │
│ position: 0              │         │ chunk_index: 0               │
│ text_content: "Intro..." │────────▶│ chunk: "Intro..."            │
│ block_type: paragraph    │         │ embedding: [0.23, 0.45, ...] │
└──────────────────────────┘         └──────────────────────────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────────────┐         ┌──────────────────────────────┐
│ id: uuid-2               │         │ id: uuid-b                   │
│ document_id: doc-123     │────────▶│ document_id: doc-123         │
│ position: 1              │         │ chunk_index: 1               │
│ text_content: "Main..." │────────▶│ chunk: "Main..."             │
│ block_type: heading      │         │ embedding: [0.12, 0.67, ...] │
└──────────────────────────┘         └──────────────────────────────┘
```

### **Similarity Search**

```
Query: "What are the main themes?"
  ↓
Generate embedding: [0.34, 0.56, 0.12, ...]
  ↓
Compare with all document embeddings:

┌─────────────────────────────────────────────────────────────┐
│ Chunk 1: "Intro..."                                         │
│ Embedding: [0.23, 0.45, ...]                                │
│ Distance: 0.45  →  Similarity: 0.55                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Chunk 2: "Main themes include..."                          │
│ Embedding: [0.35, 0.58, ...]                                │
│ Distance: 0.11  →  Similarity: 0.89  ⭐ HIGH MATCH          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Chunk 3: "Supporting evidence..."                          │
│ Embedding: [0.31, 0.52, ...]                                │
│ Distance: 0.18  →  Similarity: 0.82  ⭐ HIGH MATCH          │
└─────────────────────────────────────────────────────────────┘

  ↓
Return top 6 chunks ordered by similarity
```

---

## 🔄 Embedding Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT LIFECYCLE                       │
└─────────────────────────────────────────────────────────────┘

User creates document
  ↓
User types content in Lexical editor
  ↓
BlockPersistencePlugin saves blocks to document_blocks
  (debounced, on blur, on block navigation)
  ↓
Blocks exist in DB, NO embeddings yet
  ↓
User clicks "Ask AI" or "Continue Writing"
  ↓
ensureDocumentEmbeddings() is called
  ├─ Checks if embeddings exist
  ├─ Generates embeddings for all blocks
  └─ Stores in document_embeddings
  ↓
Embeddings now exist in DB
  ↓
User edits document (adds/removes blocks)
  ↓
BlockPersistencePlugin updates document_blocks
  ↓
Embeddings are now OUT OF SYNC
  ↓
User clicks "Ask AI" again
  ↓
ensureDocumentEmbeddings() is called
  ├─ Detects changes
  ├─ Regenerates embeddings for all blocks
  ├─ Deletes embeddings for removed blocks
  └─ Updates document_embeddings
  ↓
Embeddings are IN SYNC again
```

---

## ⚡ Performance Timeline

```
User clicks "Ask AI"
  ↓
t=0ms     API route receives request
  ↓
t=10ms    ensureDocumentEmbeddings() starts
  ↓
t=50ms    Fetch 15 blocks from document_blocks
  ↓
t=100ms   Send batch to Google embedding API
  ↓
t=2000ms  Receive 15 embeddings (768 dimensions each)
  ↓
t=2100ms  Upsert to document_embeddings (parallel)
  ↓
t=2200ms  searchSimilarChunks() starts
  ↓
t=2250ms  Generate query embedding
  ↓
t=2300ms  Vector similarity search in PostgreSQL
  ↓
t=2350ms  Return top 6 chunks
  ↓
t=2360ms  buildRAGPrompt() formats prompt
  ↓
t=2370ms  Send prompt to Gemini
  ↓
t=4000ms  Receive LLM response
  ↓
t=4010ms  Return to user

Total: ~4 seconds (first time)
Subsequent: ~2 seconds (embeddings cached)
```

---

## 🎯 Vector Similarity Visualization

```
768-Dimensional Vector Space
(simplified to 2D for visualization)

                    ▲
                    │
        Query: "themes"  ●
                    │   ╱ ╲
                    │  ╱   ╲
                    │ ╱     ╲
        Chunk 2 ●───┼───────● Chunk 3
      (distance: 0.11)   (distance: 0.18)
                    │
                    │
                    │
        Chunk 1 ●   │
      (distance: 0.45)
                    │
                    │
────────────────────┼────────────────────▶
                    │
                    │
        Chunk 4 ●   │
      (distance: 0.92)

Lower distance = More similar
Chunks 2 & 3 are closest to query → Retrieved
```

---

## 🔧 Error Handling Flow

```
prepareRAGPrompt(docId, question)
  ↓
ensureDocumentEmbeddings(docId)
  ├─ Try: Fetch blocks
  │   ├─ Success → Continue
  │   └─ Error → Return { success: false, error: "..." }
  ├─ Try: Generate embeddings
  │   ├─ Success → Continue
  │   └─ Error → Return { success: false, error: "..." }
  └─ Try: Upsert to DB
      ├─ Success → Continue
      └─ Error → Return { success: false, error: "..." }
  ↓
searchSimilarChunks(docId, question)
  ├─ Try: Generate query embedding
  │   ├─ Success → Continue
  │   └─ Error → Return { success: false, error: "..." }
  └─ Try: Vector search
      ├─ Success → Continue
      └─ Error → Return { success: false, error: "..." }
  ↓
buildRAGPrompt(question, chunks)
  └─ Always succeeds (pure function)
  ↓
Return { success: true, prompt, metadata }
```

**All functions return structured responses:**
```typescript
{ success: true, ...data }  // Success
{ success: false, error }   // Error
```

---

## 📊 Data Size Estimates

```
Document with 50 blocks:

document_blocks:
  50 rows × ~500 bytes = 25 KB

document_embeddings:
  50 rows × (768 floats × 4 bytes + metadata) = ~160 KB

Total storage per document: ~185 KB

For 1000 documents:
  ~185 MB total
  
Query performance:
  50 embeddings: ~50ms
  500 embeddings: ~200ms
  5000 embeddings: ~1s
```

---

## 🚀 Optimization Opportunities

```
Current Implementation:
  ├─ Batch embedding generation ✅
  ├─ Parallel upserts ✅
  ├─ Indexed searches ✅
  └─ Structured error handling ✅

Future Optimizations:
  ├─ Incremental updates (only changed blocks)
  ├─ Embedding caching (in-memory)
  ├─ Hybrid search (vector + full-text)
  ├─ Reranking (cross-encoder)
  └─ Background job queue
```
