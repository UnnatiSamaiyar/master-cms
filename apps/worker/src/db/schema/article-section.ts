import { timestamps } from "@utils/timestamps";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { articleTable } from "./article";
import { sectionTable } from "./section";

export const articleSectionTable = pgTable("article_section", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articleTable.id, { onDelete: "cascade" }),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sectionTable.id, { onDelete: "cascade" }),

  ...timestamps,
});

export type insertarticleSection = typeof articleSectionTable.$inferInsert;
export type selectarticleSection = typeof articleSectionTable.$inferSelect;
