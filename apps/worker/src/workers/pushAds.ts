import { connector } from "@config/redisConfig";
import db from "@db/index";
import { adsTable } from "@db/schema";
import HttpService from "@utils/httpService";
import logger from "@utils/logger";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

export interface pushAdsData {
  adsId: string;
  website: {
    id: string;
    backendUrl: string;
  };
}

export const AdsPushQueueName: string = "Ads_Push_Queue" as const;
export type PUSH_ADS_JOB = "PUSH_ADS" | "REMOVE_ADS";

export const startPushAdsWorker = async () => {
  const adsWorker = new Worker<pushAdsData>(
    AdsPushQueueName,
    async (job) => {
      logger.info(`Started processing job ${job.id} of type ${job.name}`);
      const jobName = job.name as PUSH_ADS_JOB;

      const httpService = new HttpService("/api/ads");
      try {
        switch (jobName) {
          case "PUSH_ADS":
            const data = job.data;
            const [ads] = await db
              .select()
              .from(adsTable)
              .where(eq(adsTable.id, data.adsId));
            if (!ads) throw Error("Ads does not exist.");
            const result = await httpService.pushToWebsite(
              data.website.backendUrl,
              "POST",
              ads,
            );
            break;
            console.log(result);
          default:
            break;
        }
      } catch (error: any) {
        logger.error(`Job ${job.id}: Error processing job - ${error.message}`);
        throw error; // Re-throw error to mark job as failed
      }
    },
    { connection: connector },
  );

  // Event listeners for worker
  adsWorker.on("error", (err) => {
    logger.error(`Worker encountered an error: ${err.message}`);
  });

  adsWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
  });

  adsWorker.on("failed", (job, error) => {
    logger.error(`Job ${job?.id} failed with error: ${error.message}`);
  });

  adsWorker.on("closed", () => {
    logger.info("Worker has been closed.");
  });

  adsWorker.on("stalled", (jobId) => {
    logger.warn(`Job ${jobId} has stalled`);
  });
};
