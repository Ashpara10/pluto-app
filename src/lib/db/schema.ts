import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export type AuthProvider = "google" | "github" | "credentials";

const authProvider = customType<{ data: AuthProvider }>({
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
  name: text("name").notNull(),
  slug: text("slug").unique(),
  image: text("image"),
  user: uuid("user")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
  isFavorite: boolean("is_favorite").default(false),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").references(() => collections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name"),
  slug: text("slug"),
  tags: text("tags").array().default([]),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  workspace: many(workspaces),
  collections: many(collections),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.authorId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [documents.collectionId],
    references: [collections.id],
  }),
  workspace: one(workspaces, {
    fields: [documents.workspaceId],
    references: [workspaces.id],
  }),
}));
export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, {
    fields: [workspaces?.user],
    references: [users.id],
  }),
  collections: many(collections),
}));

export const collectionRelations = relations(collections, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [collections?.workspaceId],
    references: [workspaces.id],
  }),
  documents: many(documents),
  user: one(users, {
    fields: [collections?.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
