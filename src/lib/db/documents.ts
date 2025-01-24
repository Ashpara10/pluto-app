"use server";
import { revalidateDocumentData } from "@/app/(dashboard)/w/[workspace]/document/[id]/actions";
import { and, eq, inArray } from "drizzle-orm";
import { CreateDocumentPayload } from "../types";
import { db } from "./drizzle";
import { documents, workspaceToDocuments } from "./schema";
import { getServerAuthSession } from "../auth";

export const getDocumentById = async (id: string) => {
  try {
    const res = await db
      .select()
      .from(documents)
      .where(eq(documents?.id, id))
      .limit(1);

    if (res.length === 0) {
      throw new Error("Document not found");
    }
    return { data: res[0], error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const getAllDocumentIds = async (user: string, workspace: string) => {
  try {
    const data = await db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(eq(documents.authorId, user), eq(documents.workspaceId, workspace))
      );
    return { data: data?.map((d) => d?.id), error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const updateDocument = async ({
  content,
  id,
  title,
  tags,
  markdown,
}: {
  id: string;
  title: string;
  content: string;
  markdown: string;
  tags: string[];
}) => {
  try {
    const document = await db
      .update(documents)
      .set({
        title: title,
        content: content,
        markdown: markdown,
        tags: tags,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    // console.log({ document });

    if (document.length === 0) {
      throw new Error("Failed to save document");
    }
    await revalidateDocumentData("/(dashboard)/w/[workspace]/document/[id]");
    return { data: document, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const handleDocumentFavourites = async ({
  id,
  isFavorite,
}: {
  id: string;
  isFavorite: boolean;
}) => {
  try {
    const document = await db
      .update(documents)
      .set({
        isFavorite: isFavorite,
      })
      .where(eq(documents.id, id))
      .returning();
    if (document.length === 0) {
      throw new Error("Failed to add to favourites");
    }
    return { ok: true, data: document[0], error: null };
  } catch (error) {
    return { ok: false, data: null, error: (error as Error).message };
  }
};

export const createDocument = async ({}: CreateDocumentPayload) => {
  try {
    const session = await getServerAuthSession();
    const document = await db
      .insert(documents)
      .values({
        title: `Untitled Document`,
        content: "",
        markdown: "",
        tags: [],
      })
      .returning();

    if (document.length === 0) {
      throw new Error("Failed to create document");
    }
    await db.insert(workspaceToDocuments).values({
      documentId: document[0].id as string,
      workspaceSlug: session?.user?.activeWorkspace?.slug as string,
    });
    return { data: document[0], error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const deleteDocuments = async (ids: string[]) => {
  try {
    ids.map(async (id) => {
      await db.delete(documents).where(eq(documents.id, id));
    });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

export const getDocumentsById = async (ids: string[]) => {
  try {
    const data = await db
      .select()
      .from(documents)
      .where(inArray(documents?.id, ids));
    if (data?.length === 0) {
      throw new Error("Documents not found");
    }
    return { data: data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error)?.message };
  }
};
// const movetoCollection = async ({
//   documentsToMove,
//   collectionId,
// }: {
//   documentsToMove: string[];
//   collectionId: string;
// }) => {
//   try {
//     documentsToMove?.map(async (doc) => {
//       await db
//         .update(documents)
//         .set({
//           collectionId: collectionId,
//         })
//         .where(eq(documents.id, doc));
//     });
//     // revalidateDocumentData("/(dashboard)/w/[workspace]");
//     // revalidateDocumentData("/(dashboard)/w/[workspace]/collection/[slug]");
//   } catch (error) {
//     return { data: null, error: (error as Error).message };
//   }
// };
