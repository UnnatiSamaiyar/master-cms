import { insertarticleContent } from "@db/schema";

export interface ArticleContentQueueData {
  insertContent?: insertarticleContent;
}

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

export interface pushAdsData {
  adsId: string;
  website: {
    id: string;
    backendUrl: string;
  };
}

export const INSERT_CONTENT = "INSERT_CONTENT" as const;
export const PUSH_ARTICLE = "PUSH_ARTICLE" as const;
export const UPDATE_ARTICLE = "UPDATE_ARTICLE" as const;
export const PUSH_ADS = "PUSH_ADS" as const;

export const ARTICLE_JOB = {
  PUSH_ARTICLE,
  UPDATE_ARTICLE,
};
