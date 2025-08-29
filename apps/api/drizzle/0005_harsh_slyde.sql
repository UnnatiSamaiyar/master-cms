CREATE TYPE "public"."ads_position_enum" AS ENUM('Sidebar', 'Footer', 'center', 'Header');--> statement-breakpoint
CREATE TYPE "public"."ads_status_enum" AS ENUM('Active', 'Draft');--> statement-breakpoint
CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"target_url" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "ads_status_enum" DEFAULT 'Draft',
	"position" "ads_position_enum" DEFAULT 'Sidebar',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
