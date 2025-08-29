import { connector } from "@config/redisConfig";
import { ArticleContentData, JobName } from "@customtype/artilceContent";
import db from "@db/index";
import { articleContentTable } from "@db/schema";
import { ArticleContentName } from "@queues/index";
import logger from "@utils/logger";
import { Worker } from "bullmq";

export const startArticleContentWorker = () => {
  const articleContentWorker = new Worker<ArticleContentData>(
    ArticleContentName,
    async (job) => {
      logger.info(`Started processing job ${job.id} of type ${job.name}`);

      const jobName = job.name as JobName;
      try {
        switch (jobName) {
          case "INSERT_CONTENT":
            if (!job.data.insertContent) {
              logger.error(`Job ${job.id}: article  data`);
              throw new Error("Please provide the content data");
            }

            const result = await db
              .insert(articleContentTable)
              .values(job.data.insertContent);

            if (!result.rowCount || result.rowCount < 1) {
              throw new Error("Soemthing went wrong");
            }

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

  // Listen to 'error' events
  articleContentWorker.on("error", (err) => {
    logger.error(`Worker encountered an error: ${err.message}`);
  });

  // Listen to 'completed' events
  articleContentWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
  });

  // Listen to 'failed' events
  articleContentWorker.on("failed", (job, error) => {
    logger.error(`Job ${job?.id} failed with error: ${error.message}`);
  });

  // Listen to 'closed' event (Worker is closing)
  articleContentWorker.on("closed", () => {
    logger.info("Worker has been closed.");
  });

  // Listen to 'stalled' event (Job has stalled)
  articleContentWorker.on("stalled", (jobId) => {
    logger.warn(`Job ${jobId} has stalled`);
  });
};
