ALTER TABLE "workspace_to_collections" ADD COLUMN "is_favorite" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "workspace_to_documents" ADD COLUMN "is_favorite" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN IF EXISTS "is_favorite";