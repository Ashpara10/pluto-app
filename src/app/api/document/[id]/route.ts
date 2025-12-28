import { db } from "@/lib/db/drizzle";
import { documents, documentTags, tags } from "@/lib/db/schema";
import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { ...rest } = getTableColumns(documents);
    const doc = await db
      .select({
        ...rest,
        tags: sql<Array<{
          id: string;
          name: string;
          metadata: Record<string, any> | null;
        }> | null>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${tags.id},
              'name', ${tags.name},
              'metadata', ${tags.metadata}
            )
          ) FILTER (WHERE ${tags.id} IS NOT NULL),
          '[]'
        )
      `,
      })
      .from(documents)
      .leftJoin(documentTags, eq(documents.id, documentTags.documentId))
      .leftJoin(tags, eq(documentTags.tagId, tags.id))
      .where(eq(documents.id, id))
      .groupBy(documents.id);

    console.log({ doc });
    if (doc.length === 0) {
      throw new Error("Document not found");
    }

    return NextResponse.json({ data: doc[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 400 }
    );
  }
}
