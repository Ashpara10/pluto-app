import { eq } from "drizzle-orm";
import { getServerAuthSession } from "../auth";
import { getSlug } from "../utils";
import { db } from "./drizzle";
import { collections, NewCollection, workspaceToCollections } from "./schema";

export type CreateCollectionPayload = {
  name: string;
  tags?: string[];
  documents?: string[];
};

export const createCollection = async ({
  name,
  tags,
  documents,
}: CreateCollectionPayload) => {
  try {
    const session = await getServerAuthSession();
    const collectionSlug = getSlug(name);
    const collection = await db
      .insert(collections)
      .values({
        name: name,
        slug: collectionSlug,
        tags: tags || [],
      } as NewCollection)
      .returning();
    if (collection.length === 0) {
      throw new Error("Failed to create collection");
    }

    await db.insert(workspaceToCollections).values({
      collectionSlug: collectionSlug,
      workspaceSlug: session?.user?.activeWorkspace?.slug as string,
    });

    return { data: collection, error: null };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { data: null, error: error?.message };
    }
  }
};

export const getCollectionBySlug = async (slug: string) => {
  try {
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);
    if (collection.length === 0) {
      throw new Error("Collection not found");
    }
    return { data: collection[0], error: null };
  } catch (error) {
    // if (error instanceof Error) {
    //   console.error(error.message);
    return { data: null, error: (error as Error)?.message };
    // }
  }
};
