ALTER TYPE "public"."role" ADD VALUE 'content writer';--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN "author_id" uuid;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_author_id_admin_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;