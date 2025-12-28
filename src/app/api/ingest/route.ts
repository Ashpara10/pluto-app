import { Document } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { selected }: { selected: Document[] } = await req.json();
  try {
    //   if (!selected || selected.length === 0)
    //     throw new Error("No documents selected");
    //   const chunks = selected.flatMap((doc) =>
    //     chunkText(doc?.markdown as string, 500, 50).map((chunk, idx) => ({
    //       id: `${doc.id}-${idx}`,
    //       text: chunk,
    //       metadata: {
    //         documentId: doc.id,
    //         // updatedAt: doc.updatedAt?.toISOString(),
    //         title: doc.title || "",
    //         tags: doc?.tags && doc?.tags?.length > 0 ? doc.tags?.join(",") : "",
    //         chunkIndex: idx,
    //       },
    //     }))
    //   );

    //   // const { embeddings } = await embedMany({
    //   //   model: google.textEmbeddingModel("text-embedding-004"),
    //   //   values: chunks.map((chunk) => chunk.text),
    //   // });

    //   const BATCH_SIZE = 100;
    //   const allEmbeddings: number[][] = [];
    //   for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    //     const batch = chunks.slice(i, i + BATCH_SIZE);

    //     const { embeddings } = await embedMany({
    //       model: google.textEmbeddingModel("text-embedding-004"),
    //       values: batch.map((chunk) => chunk.text),
    //     });

    //     allEmbeddings.push(...embeddings);
    //   }

    //   console.log(allEmbeddings.length, "embeddings generated");
    //   const col = await getDocsCollection();

    //   await col.upsert({
    //     ids: chunks.map((i) => i.id),
    //     embeddings: allEmbeddings,
    //     documents: chunks.map((i) => i.text),
    //     metadatas: chunks.map((i) => i.metadata),
    //   });
    //   console.log({ allEmbeddings });
    return NextResponse.json(
      {
        allEmbeddings: [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
