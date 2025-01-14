// Workspaces Types
export type CreateWorkspacePayload = {
  name: string;
  user: string;
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
  user: string;
  title?: string;
  content?: string;
  workspaceId?: string;
  collectionId?: string;
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
};

export type TabType = "documents" | "collections" | "tags";

export type SortDocumentBy = "createdAt" | "updatedAt" | "favourites";
