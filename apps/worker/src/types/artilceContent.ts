import { insertarticleContent } from "@db/schema";

export type JobName = "INSERT_CONTENT";
export type ARTICLE_PUSH_POP =
  | "PUSH_ARTICLE"
  | "REMOVE_ARTICLE"
  | "UPDATE_ARTICLE";

export interface pushArticleData {
  articleId: string;
  website: {
    id: string;
    backendUrl: string;
  };
  categoryId: string;
}

export interface PushArticleQueueData {
  pushArticle?: pushArticleData;
  articleId?: string;
}

export interface ArticleContentData {
  insertContent: insertarticleContent;
}
