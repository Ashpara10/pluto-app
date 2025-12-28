import { z } from "zod";
import { Document, tags } from "./db/schema";

// Workspaces Types
export type CreateWorkspacePayload = {
  name: string;
  image?: string;
};
// Collection Types
export type CreateCollectionPayload = {
  name: string;
  tags?: string[];
  user?: string;
  documents?: string[];
  workspace?: string;
};

// Document Types
export type CreateDocumentPayload = {
  title?: string;
  content?: string;
  markdown?: string;
  collection?: string;
};

export type AddDocumentToCollectionPayload = {
  collections: string[];
  documents: number[];
};

// User Types

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  image?: string;
};

export const RegisterSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(6),
  image: z.string().optional(),
});

export type TGetDocument = {
  document: Document;
  isFavorite: boolean;
};

export type TGetDocumentsGroupedByTag = {
  tag: string;
  documents: TGetDocument[];
};
export type TabType = "documents" | "collections" | "tags";

export type SortDocumentBy = "createdAt" | "updatedAt" | "favourites";
export type GetDocumentWithTags = Document & {
  tags: Array<{
    id: string;
    name: string;
    metadata: Record<string, any> | null;
  }>;
};

export type TTag = typeof tags.$inferSelect;
