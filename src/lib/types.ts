import { z } from "zod";

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

export type TabType = "documents" | "collections" | "tags";

export type SortDocumentBy = "createdAt" | "updatedAt" | "favourites";
