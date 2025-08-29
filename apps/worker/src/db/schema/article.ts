import { timestamps } from "@utils/timestamps";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { text, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminTable } from "./admin";

export const articleTable = pgTable("article", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  authorId: uuid("author_id").references(() => adminTable.id),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  ...timestamps,
});

export type insertArticle = typeof articleTable.$inferInsert;
export type selectArticle = typeof articleTable.$inferSelect;
