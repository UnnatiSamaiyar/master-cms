import { timestamps } from "@utils/timestamps";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { websiteTable } from "./website";
import { articleTable } from "./article";

export const websiteArticleTable = pgTable("website_article", {
  id: uuid("id").primaryKey().defaultRandom(),
  websiteId: uuid("website_id").references(() => websiteTable.id, {
    onDelete: "cascade",
  }),
  articleId: uuid("article_id").references(() => articleTable.id, {
    onDelete: "cascade",
  }),
  ...timestamps,
});

export type insertWebsiteArticle = typeof websiteArticleTable.$inferInsert;
export type selectWebsiteArticle = typeof websiteArticleTable.$inferSelect;
