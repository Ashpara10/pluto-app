import { getServerAuthSession } from "@/lib/auth";
import { createCollection } from "@/lib/db/collections";
import { db } from "@/lib/db/drizzle";
import {
  Collection,
  collections,
  collectionToDocuments,
  documents,
  workspaceToCollections,
} from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getServerAuthSession();
  const workspace = req.nextUrl.searchParams?.get("workspace");
  if (workspace === null) {
    return Response.json(
      { data: null, error: "Missing parameters" },
      { status: 400 }
    );
  }

  const allCollections = await db
    .select({
      collection: collections,
      documents_count: db.$count(
        collectionToDocuments,
        eq(collectionToDocuments.collectionSlug, collections.slug)
      ),
    })
    .from(collections)
    // .where(
    //   and(
    //     eq(collections?.userId, user?.user?.id as string),
    //     eq(collections.workspaceId, workspace as string)
    //   )
    // )
    .innerJoin(
      workspaceToCollections,
      eq(workspaceToCollections?.collectionSlug, collections?.slug)
    )
    .where(eq(workspaceToCollections?.workspaceSlug, workspace as string))
    .groupBy(collections?.id);

  return Response.json({ data: allCollections, error: null }, { status: 201 });
}
export async function POST(req: NextRequest) {
  const { name, tags, documents }: Collection & { documents?: string[] } =
    await req.json();

  const resp = await createCollection({
    name: name as string,
    tags: tags as string[],
    documents,
  });
  if (resp?.error)
    return Response.json({ data: null, error: resp.error }, { status: 400 });
  return Response.json({ data: resp?.data, error: null }, { status: 201 });
}
export async function PUT(req: NextRequest) {}
export async function DELETE(req: NextRequest) {}
