import { connector } from "@config/redisConfig";
import { NotiificationData, JobName } from "@customtype/notification";
import logger from "@utils/logger";
import { sendMail } from "@utils/sendMail";
import { Worker } from "bullmq";

export const notificationName: string = "Notification_Queue";

export const startNotificationWorker = () => {
  const notificationWorker = new Worker<NotiificationData>(
    notificationName,
    async (job) => {
      logger.info(`Started processing job ${job.id} of type ${job.name}`);

      const jobName = job.name as JobName;
      try {
        switch (jobName) {
          case "EMAIL":
            if (!job.data.emailData) {
              logger.error(`Job ${job.id}: Missing email data`);
              throw new Error("Please provide the mail data");
            }

            logger.info(`Job ${job.id}: Sending email...`);
            const { info, error } = await sendMail(job.data.emailData);
            if (error) {
              logger.error(`Job ${job.id}: Error sending email - ${error}`);
              throw new Error(error as any);
            }

            logger.info(
              `Job ${job.id}: Email sent successfully with response: ${info?.response}`,
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

  // Listen to 'error' events
  notificationWorker.on("error", (err) => {
    logger.error(`Worker encountered an error: ${err.message}`);
  });

  // Listen to 'completed' events
  notificationWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
  });

  // Listen to 'failed' events
  notificationWorker.on("failed", (job, error) => {
    logger.error(`Job ${job?.id} failed with error: ${error.message}`);
  });

  // Listen to 'closed' event (Worker is closing)
  notificationWorker.on("closed", () => {
    logger.info("Worker has been closed.");
  });

  // Listen to 'stalled' event (Job has stalled)
  notificationWorker.on("stalled", (jobId) => {
    logger.warn(`Job ${jobId} has stalled`);
  });
};
