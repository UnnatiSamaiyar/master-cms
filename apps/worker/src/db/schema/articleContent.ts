import { timestamps } from "@utils/timestamps";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { jsonb } from "drizzle-orm/pg-core";
import { articleTable } from "./article";

export const articleContentTable = pgTable("article_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articleTable.id, { onDelete: "cascade" }),
  content: jsonb("content"),
  ...timestamps,
});

export type insertarticleContent = typeof articleContentTable.$inferInsert;
export type selectarticleContent = typeof articleContentTable.$inferSelect;
