import db from "@db/index";
import { articleTable, websiteTable } from "@db/schema";
import { websiteArticleTable } from "@db/schema/website_article";
import { eq, getTableColumns } from "drizzle-orm";

class ArticleService {
  constructor() {}

  async getArticleWebsite(articleId: string) {
    const { createdAt, updatedAt, ...rest } = getTableColumns(websiteTable);
    const result = await db
      .select({ ...rest })
      .from(websiteArticleTable)
      .where(eq(websiteArticleTable.articleId, articleId))
      .leftJoin(
        websiteTable,
        eq(websiteArticleTable.websiteId, websiteTable.id),
      );

    return result;
  }

  async getArticleById(articleId: string) {
    const [result] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.id, articleId))
      .limit(1);
    return result;
  }
}

export default ArticleService;
