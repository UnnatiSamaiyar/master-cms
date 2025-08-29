import { updateResponse } from "@customtype/index";
import db from "@db/index";
import { articleContentTable, insertarticleContent } from "@db/schema";
import { eq } from "drizzle-orm";

class ArticleContentService {
  constructor() {}

  async updateArticleContent(
    articleId: string,
    data: Partial<insertarticleContent>,
  ): Promise<updateResponse> {
    const [result] = await db
      .update(articleContentTable)
      .set(data)
      .where(eq(articleContentTable.articleId, articleId))
      .returning({ content: articleContentTable.content });

    if (!result || !result.content) {
      return { updated: false };
    } else {
      return { updated: true };
    }
  }

  async deleteArticleContent(contentId: string) {
    const result = await db
      .delete(articleContentTable)
      .where(eq(articleContentTable.id, contentId))
      .returning({ id: articleContentTable.id });

    return result;
  }

  async addArticleContent(data: insertarticleContent) {
    const [result] = await db
      .insert(articleContentTable)
      .values(data)
      .returning({
        id: articleContentTable.id,
        articleId: articleContentTable.articleId,
      });

    return result;
  }

  async getArticleContentById(contentId: string) {
    const result = await db
      .select()
      .from(articleContentTable)
      .where(eq(articleContentTable.id, contentId))
      .limit(1);

    return result[0];
  }

  async getArticleContentByArticleId(articleId: string) {
    const result = await db
      .select()
      .from(articleContentTable)
      .where(eq(articleContentTable.articleId, articleId));

    return result;
  }
}

export default ArticleContentService;
