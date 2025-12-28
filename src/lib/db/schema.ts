import {
  boolean,
  customType,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export type AuthProvider = "google" | "github" | "credentials";
export type Role = "admin" | "member";

const authProvider = customType<{ data: AuthProvider }>({
  dataType() {
    return "text";
  },
});
const role = customType<{ data: Role }>({
  dataType() {
    return "text";
  },
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 100 }),
  image: varchar("image"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  authProvider: authProvider("auth_provider").notNull().default("credentials"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title"),
  content: text("content"),
  markdown: text("markdown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  metadata: jsonb("metadata").$type<{
    [key: string]: any;
  }>(),
  workspaceSlug: varchar("workspace_slug", { length: 40 })
    .notNull()
    .references(() => workspaces.slug, { onDelete: "cascade" }),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentTags = pgTable(
  "document_tags",
  {
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.documentId, t.tagId] }),
  })
);
export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Collections ↔ Tags
export const collectionTags = pgTable(
  "collection_tags",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.collectionId, t.tagId] }),
  })
);

export const usersToWorkspaces = pgTable(
  "user_to_workspace",
  {
    workspaceSlug: varchar("workspace_slug", { length: 40 })
      .notNull()
      .references(() => workspaces.slug, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: role("role").notNull().default("member"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceSlug, table.userId] }),
  })
);

export const workspaceToDocuments = pgTable(
  "workspace_to_documents",
  {
    workspaceSlug: varchar("workspace_slug", { length: 40 })
      .notNull()
      .references(() => workspaces.slug, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    isFavorite: boolean("is_favorite").default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceSlug, table.documentId] }),
  })
);

export const workspaceToCollections = pgTable(
  "workspace_to_collections",
  {
    workspaceSlug: varchar("workspace_slug", { length: 40 })
      .notNull()
      .references(() => workspaces.slug, { onDelete: "cascade" }),
    collectionSlug: varchar("collection_slug", { length: 40 })
      .notNull()
      .references(() => collections.slug, { onDelete: "cascade" }),
    isFavorite: boolean("is_favorite").default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceSlug, table.collectionSlug] }),
  })
);

export const collectionToDocuments = pgTable(
  "collection_to_documents",
  {
    collectionSlug: varchar("collection_slug", { length: 40 })
      .notNull()
      .references(() => collections.slug, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionSlug, table.documentId] }),
  })
);

// Embeddings table for RAG
export const documentEmbeddings = pgTable(
  "document_embeddings",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: 768 }),
    chunk: text("chunk"),
    chunkIndex: integer("chunk_index").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueDocumentChunk: unique("unique_document_chunk").on(
      table.documentId,
      table.chunkIndex
    ),
  })
);

type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type DocumentEmbedding = typeof documentEmbeddings.$inferSelect;
export type NewDocumentEmbedding = typeof documentEmbeddings.$inferInsert;
