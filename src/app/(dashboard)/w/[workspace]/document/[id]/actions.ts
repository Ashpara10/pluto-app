"use server";

import { Document } from "@/lib/db/schema";
import { GetDocumentWithTags } from "@/lib/types";
import { BASE_URL } from "@/lib/url";
import { revalidatePath } from "next/cache";

export const getDocument = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/document/${id}`, {
    next: {
      tags: ["document-by-id"],
    },
  });
  const data = await res.json();

  if (!res?.ok && data.error) {
    return { data: null, error: data.error };
  }
  return {
    data: data?.data as GetDocumentWithTags,
    error: null,
  };
};

export const revalidateDocumentData = async (
  path: string,
  type: "layout" | "page" = "page"
) => {
  revalidatePath(path, type);
};
