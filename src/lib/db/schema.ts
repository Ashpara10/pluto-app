import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
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
  tags: text("tags").array().default([]),
  markdown: text("markdown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

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

type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
