import { db } from "@/lib/db/drizzle";
import { documents, workspaceToDocuments } from "@/lib/db/schema";
import { and, desc, eq, SQL } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const workspace = req.nextUrl.searchParams?.get("workspace");
  const sortBy = req.nextUrl.searchParams?.get("sortBy");
  console.log({ sortBy });
  const filters: SQL[] = [
    eq(workspaceToDocuments?.workspaceSlug, workspace as string),
  ];

  let sortDocumentsBy;
  switch (sortBy) {
    case "createdAt":
      sortDocumentsBy = documents?.createdAt;
      break;
    case "updatedAt":
      sortDocumentsBy = documents?.updatedAt;
      break;

    case "favourites":
      sortDocumentsBy = workspaceToDocuments?.isFavorite;
      break;

    default:
      sortDocumentsBy = documents?.createdAt;
      break;
  }
  if (sortBy === "favourites") {
    filters.push(eq(workspaceToDocuments?.isFavorite, true));
  }

  const workspaceDocuments = await db
    .select({
      document: documents,
      isFavorite: workspaceToDocuments?.isFavorite,
    })
    .from(documents)
    .innerJoin(
      workspaceToDocuments,
      eq(workspaceToDocuments?.documentId, documents?.id)
    )
    .where(and(...filters))
    .orderBy(desc(sortDocumentsBy));

  return Response.json(
    {
      documents: workspaceDocuments,
    },
    { status: 201 }
  );
}
