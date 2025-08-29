import { updateResponse } from "@customtype/index";
import db from "@db/index";
import { articleTable, insertArticle } from "@db/schema";
import { eq } from "drizzle-orm";

class ArticleService {
  constructor() {}

  async updateArticle(
    articleId: string,
    data: Partial<insertArticle>,
  ): Promise<updateResponse> {
    const [result] = await db
      .update(articleTable)
      .set(data)
      .where(eq(articleTable.id, articleId))
      .returning({ title: articleTable.title });

    if (!result || !result.title) {
      return { updated: false };
    } else {
      return { updated: true, name: result.title };
    }
  }

  async deleteArticle(articleId: string) {
    const result = await db
      .delete(articleTable)
      .where(eq(articleTable.id, articleId))
      .returning({ title: articleTable.title });

    return result;
  }

  async addArticle(data: insertArticle) {
    const [result] = await db
      .insert(articleTable)
      .values(data)
      .returning({ id: articleTable.id, title: articleTable.title });

    return result;
  }

  async getArticleById(articleId: string) {
    const result = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.id, articleId))
      .limit(1);

    return result[0];
  }

  async publishArticle(articleId: string) {
    const [result] = await db
      .update(articleTable)
      .set({ isPublished: true })
      .where(eq(articleTable.id, articleId))
      .returning({ title: articleTable.title });

    return result;
  }

  async unpublishArticle(articleId: string) {
    const [result] = await db
      .update(articleTable)
      .set({ isPublished: false })
      .where(eq(articleTable.id, articleId))
      .returning({ title: articleTable.title });

    return result;
  }
}

export default ArticleService;
