import db from "@db/index";
import { selectWebsite } from "@db/schema";
import {
  selectWebsiteArticle,
  websiteArticleTable,
} from "@db/schema/website_article";
import { eq } from "drizzle-orm";

class ArticleWebsite {
  constructor() {}

  transformWebsiteArticleData(
    websites: selectWebsite[],
    articlesWebsite: selectWebsiteArticle[],
  ) {
    const new_data = websites.map((website) => {
      const pushedArticles = articlesWebsite
        .filter((item) => item.websiteId === website.id)
        .map((item) => item.articleId);
      return { ...website, pushedArticles };
    });
    return new_data;
  }

  async getPublishedWebsiteByArticleId(articleId: string) {
    const websites = await db
      .select()
      .from(websiteArticleTable)
      .where(eq(websiteArticleTable.articleId, articleId));
    return websites;
  }
}

export default ArticleWebsite;
