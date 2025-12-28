import google, { getSystemPrompt } from "@/lib/ai";
import { createDocument, deleteDocuments } from "@/lib/db/documents";
import { db } from "@/lib/db/drizzle";
import { documentEmbeddings, documents } from "@/lib/db/schema";
// import { getDocsCollection } from "@/lib/embeddings";
import { convertToModelMessages, embed, streamText, UIMessage } from "ai";
import { cosineDistance, desc, eq, inArray, sql } from "drizzle-orm";
import z from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const { selected, messages } = body as {
    messages: UIMessage[];
    selected: string[];
  };

  console.log({ selected, messages });

  const question = messages.filter((m) => m.role === "user").at(-1);

  console.log({ question });

  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: question?.parts
      .map((part) => {
        switch (part.type) {
          case "text":
            return part.text;
        }
      })
      .join(""),
  });

  const hits = await db
    .select({
      id: documentEmbeddings.id,
      documentId: documentEmbeddings.documentId,
      chunk: documentEmbeddings.chunk,
      chunkIndex: documentEmbeddings.chunkIndex,
      distance: sql<number>`${cosineDistance(
        documentEmbeddings.embedding,
        embedding
      )}`.as("distance"),
      title: documents.title,
    })
    .from(documentEmbeddings)
    .innerJoin(documents, eq(documentEmbeddings.documentId, documents.id))
    .where(inArray(documentEmbeddings.documentId, selected))
    .orderBy((fields) => desc(fields.distance))
    .limit(8);

  // Format context
  const context = hits
    .map(
      (h, i) =>
        `# Source ${i + 1} — ${h.title} [${h.documentId}#${h.chunkIndex}]\n${
          h.chunk
        }`
    )
    .join("\n\n");

  const result = streamText({
    system: getSystemPrompt(context),
    model: google("gemini-1.5-flash"),
    messages: [...convertToModelMessages(messages)],
    tools: {
      createDocument: {
        description: "Create a new document in a workspace",
        inputSchema: z.object({
          title: z.string().min(1).max(100),
        }),
        execute: async ({ title }) => {
          return await createDocument({ title });
        },
      },
      deleteDocument: {
        description: "Delete a document by ID",
        inputSchema: z.object({
          docIds: z.array(z.string()),
        }),
        execute: async ({ docIds }) => {
          return await deleteDocuments(docIds);
        },
      },
    },
    onStepFinish: ({ toolCalls, toolResults }) => {
      // Type-safe iteration
      for (const toolCall of toolCalls) {
        if (toolCall.dynamic) {
          // Dynamic tool: input is 'unknown'
          console.log("Dynamic:", toolCall.toolName, toolCall.input);
          continue;
        }

        // Static tool: full type inference
        switch (toolCall.toolName) {
          case "createDocument":
            console.log(toolCall.input.title); // typed as string
            break;
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
// import google, { systemPrompt } from "@/lib/ai";
// import redis from "@/lib/redis";
// import { Ratelimit } from "@upstash/ratelimit";
// import { streamText } from "ai";
// import { NextRequest } from "next/server";

// const ratelimit = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.fixedWindow(5, "30s"),
// });

// export const maxDuration = 30;

// export async function POST(req: NextRequest) {
//   const ip = req.ip ?? "ip";
//   const { success, remaining } = await ratelimit.limit(ip);
//   if (!success) {
//     return Response.json({ remaining }, { status: 429 });
//   }
//   const { ctx, messages } = await req.json();

//   const result = await streamText({
//     model: google("gemini-1.5-flash"),
//     system: `
//         ${systemPrompt}

//         <context>
//         ${ctx}
//         </context>
//         `,
//     temperature: 0.5,
//     messages,
//   });
//   return result.toAIStreamResponse();
// }
