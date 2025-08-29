CREATE TABLE "admin_verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"code" varchar(6) NOT NULL,
	"expire_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "admin_verification_admin_id_unique" UNIQUE("admin_id")
);
--> statement-breakpoint
ALTER TABLE "admin_verification" ADD CONSTRAINT "admin_verification_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;