ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
ALTER TABLE "article" DROP CONSTRAINT "article_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "article" DROP COLUMN "category_id";