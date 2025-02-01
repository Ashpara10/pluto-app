import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import {
  collections,
  collectionToDocuments,
  Document,
  documents,
  workspaceToDocuments,
} from "@/lib/db/schema";
import { and, eq, is, SQL, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: { slug: string };
  }
) {
  try {
    const slug = params?.slug;
    const session = await getServerAuthSession();
    const sortBy = req.nextUrl.searchParams?.get("sortBy");
    const filters: SQL[] = [eq(documents.id, workspaceToDocuments.documentId)];
    if (sortBy === "favourites") {
      filters.push(eq(workspaceToDocuments.isFavorite, true));
    }

    let sortDocumentsBy;
    switch (sortBy) {
      case "createdAt":
        sortDocumentsBy = documents?.createdAt;
        break;
      case "updatedAt":
        sortDocumentsBy = documents?.updatedAt;
        break;

      default:
        sortDocumentsBy = documents?.createdAt;
        break;
    }

    const collectionDocuments = await db
      .select({
        document: documents,
        isFavorite: workspaceToDocuments.isFavorite,
      })
      .from(documents)
      .innerJoin(
        collectionToDocuments,
        eq(documents.id, collectionToDocuments.documentId)
      )
      .innerJoin(workspaceToDocuments, and(...filters))
      .where(eq(collectionToDocuments.collectionSlug, slug))
      .orderBy(sortDocumentsBy);

    console.log({
      collectionDocuments: collectionDocuments.map((doc) => doc.document),
    });
    return Response.json(
      {
        data: collectionDocuments,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
