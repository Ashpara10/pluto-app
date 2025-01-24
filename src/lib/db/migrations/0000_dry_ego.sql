CREATE TABLE IF NOT EXISTS "collection_to_documents" (
	"collection_slug" varchar(40) NOT NULL,
	"document_id" uuid NOT NULL,
	CONSTRAINT "collection_to_documents_collection_slug_document_id_pk" PRIMARY KEY("collection_slug","document_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(30) NOT NULL,
	"slug" varchar(40) NOT NULL,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"content" text,
	"tags" text[] DEFAULT '{}',
	"markdown" text,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"image" varchar,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"auth_provider" text DEFAULT 'credentials' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_to_workspace" (
	"workspace_slug" varchar(40) NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	CONSTRAINT "user_to_workspace_workspace_slug_user_id_pk" PRIMARY KEY("workspace_slug","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_to_collections" (
	"workspace_slug" varchar(40) NOT NULL,
	"collection_slug" varchar(40) NOT NULL,
	CONSTRAINT "workspace_to_collections_workspace_slug_collection_slug_pk" PRIMARY KEY("workspace_slug","collection_slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_to_documents" (
	"workspace_slug" varchar(40) NOT NULL,
	"document_id" uuid NOT NULL,
	CONSTRAINT "workspace_to_documents_workspace_slug_document_id_pk" PRIMARY KEY("workspace_slug","document_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(30) NOT NULL,
	"slug" varchar(40) NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_to_documents" ADD CONSTRAINT "collection_to_documents_collection_slug_collections_slug_fk" FOREIGN KEY ("collection_slug") REFERENCES "public"."collections"("slug") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_to_documents" ADD CONSTRAINT "collection_to_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_workspace" ADD CONSTRAINT "user_to_workspace_workspace_slug_workspaces_slug_fk" FOREIGN KEY ("workspace_slug") REFERENCES "public"."workspaces"("slug") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_workspace" ADD CONSTRAINT "user_to_workspace_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_to_collections" ADD CONSTRAINT "workspace_to_collections_workspace_slug_workspaces_slug_fk" FOREIGN KEY ("workspace_slug") REFERENCES "public"."workspaces"("slug") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_to_collections" ADD CONSTRAINT "workspace_to_collections_collection_slug_collections_slug_fk" FOREIGN KEY ("collection_slug") REFERENCES "public"."collections"("slug") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_to_documents" ADD CONSTRAINT "workspace_to_documents_workspace_slug_workspaces_slug_fk" FOREIGN KEY ("workspace_slug") REFERENCES "public"."workspaces"("slug") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_to_documents" ADD CONSTRAINT "workspace_to_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
