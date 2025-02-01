"use server";
import { revalidateDocumentData } from "@/app/(dashboard)/w/[workspace]/document/[id]/actions";
import { eq, inArray, is, sql } from "drizzle-orm";
import { getServerAuthSession } from "../auth";
import { CreateDocumentPayload, TGetDocument } from "../types";
import { db } from "./drizzle";
import {
  collectionToDocuments,
  Document,
  documents,
  workspaceToDocuments,
} from "./schema";

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

// export const getAllDocumentIds = async (user: string, workspace: string) => {
//   try {
//     const data = await db
//       .select({ id: documents.id })
//       .from(documents)
//       .where(
//         and(eq(documents.authorId, user), eq(documents.workspaceId, workspace))
//       );
//     return { data: data?.map((d) => d?.id), error: null };
//   } catch (error) {
//     return { data: null, error: (error as Error).message };
//   }
// };

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
      .update(workspaceToDocuments)
      .set({
        isFavorite: isFavorite,
      })
      .where(eq(workspaceToDocuments.documentId, id))
      .returning();
    if (document.length === 0) {
      throw new Error("Failed to add to favourites");
    }
    return { ok: true, data: document[0], error: null };
  } catch (error) {
    return { ok: false, data: null, error: (error as Error).message };
  }
};

export const createDocument = async ({
  collection,
  title,
  content,
  markdown,
}: CreateDocumentPayload) => {
  try {
    const session = await getServerAuthSession();
    const document = await db
      .insert(documents)
      .values({
        title: title || `Untitled Document`,
        content: content || "",
        markdown: markdown || "",
        tags: [],
      })
      .returning();

    if (document.length === 0) {
      throw new Error("Failed to create document");
    }
    if (collection) {
      await db.insert(collectionToDocuments).values({
        documentId: document[0].id as string,
        collectionSlug: collection,
      });
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

export const getDocumentsGroupedByTag = async () => {
  try {
    const session = await getServerAuthSession();
    const docs = await db.execute(sql`
      SELECT
  t.tag,
  json_agg(json_build_object(
        'document', json_build_object(
          'id',d.id,
          'title',d.title,
           'content',d.content,
           'markdown',d.markdown,
          'tags', d.tags,
           'createdAt',d.created_at,
           'updatedAt', d.updated_at,
           'deletedAt', d.deleted_at 

        ),
        'isFavorite', d.is_favorite
    )) AS documents
FROM
  (
    SELECT
      d.*,wd.is_favorite
    FROM
      documents AS d
      INNER JOIN workspace_to_documents AS wd ON wd.document_id = d.id
    WHERE
      wd.workspace_slug = ${session?.user?.activeWorkspace?.slug}
  ) AS d,
  LATERAL UNNEST(d.tags) AS t (tag)
GROUP BY
  t.tag;

      `);
    return docs?.rows.map((row) => ({
      tag: row?.tag as string,
      documents: row?.documents as TGetDocument[],
    }));
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};
