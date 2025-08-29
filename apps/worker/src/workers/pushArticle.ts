import { connector } from "@config/redisConfig";
import {
  ARTICLE_PUSH_POP,
  PushArticleQueueData,
} from "@customtype/artilceContent";
import db from "@db/index";
import { adminTable, articleContentTable, articleTable } from "@db/schema";
import { ArticlePushQueueName } from "@queues/index";
import ArticleService from "@services/article";
import HttpService from "@utils/httpService";
import logger from "@utils/logger";
import { Worker } from "bullmq";
import { eq, getTableColumns } from "drizzle-orm";

export const startPushArticleWorker = () => {
  const pushArticleWorker = new Worker<PushArticleQueueData>(
    ArticlePushQueueName,
    async (job) => {
      logger.info(`Started processing job ${job.id} of type ${job.name}`);

      const jobName = job.name as ARTICLE_PUSH_POP;
      const apiUrl = "/api/articles";
      const httpService = new HttpService(apiUrl);
      const articleService = new ArticleService();

      try {
        switch (jobName) {
          case "PUSH_ARTICLE":
            await handlePushArticleJob(
              { id: job.id as string, data: job.data },
              httpService,
            );
            break;
          default:
            logger.warn(`Job ${job.id}: Unknown job type ${jobName}`);
            break;
        }
      } catch (err: any) {
        logger.error(`Job ${job.id}: Error processing job - ${err.message}`);
        throw err; // Re-throw error to mark job as failed
      }
    },
    { connection: connector },
  );

  // Event listeners for worker
  pushArticleWorker.on("error", (err) => {
    logger.error(`Worker encountered an error: ${err.message}`);
  });

  pushArticleWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
  });

  pushArticleWorker.on("failed", (job, error) => {
    logger.error(`Job ${job?.id} failed with error: ${error.message}`);
  });

  pushArticleWorker.on("closed", () => {
    logger.info("Worker has been closed.");
  });

  pushArticleWorker.on("stalled", (jobId) => {
    logger.warn(`Job ${jobId} has stalled`);
  });
};

const handlePushArticleJob = async (
  job: { id: string; data?: PushArticleQueueData },
  httpService: HttpService,
) => {
  if (!job.data) {
    logger.error(`Job ${job.id}: Missing article data`);
    throw new Error("Please provide the content data");
  }

  const { pushArticle } = job.data;
  if (!pushArticle) {
    logger.error(`Job ${job.id}: Missing pushArticle data`);
    return;
  }

  const { ...rest } = getTableColumns(articleTable);

  const [article] = await db
    .select({
      ...rest,
      author: {
        id: adminTable.id,
        name: adminTable.name,
      },
    })
    .from(articleTable)
    .where(eq(articleTable.id, pushArticle.articleId))
    .leftJoin(adminTable, eq(articleTable.authorId, adminTable.id));

  if (!article) {
    logger.error(`Job ${job.id}: Article not found`);
    throw new Error("Article not found");
  }

  const [articleContent] = await db
    .select()
    .from(articleContentTable)
    .where(eq(articleContentTable.articleId, article.id));

  if (!articleContent) {
    logger.error(`Job ${job.id}: Article content not found`);
    throw new Error("Article content not found");
  }

  const result = await httpService.pushToWebsite(
    pushArticle.website.backendUrl,
    "POST",
    { ...article, categoryId: pushArticle?.categoryId },
  );

  const contentHttpService = new HttpService("/api/articles/content");
  await contentHttpService.pushToWebsite(
    pushArticle.website.backendUrl,
    "POST",
    {
      articleId: result.data.id,
      content: articleContent.content,
    },
  );

  logger.info(`Job ${job.id}: Article and content pushed successfully`);
};
