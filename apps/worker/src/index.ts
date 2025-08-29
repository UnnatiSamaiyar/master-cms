import * as dotenv from "dotenv";
dotenv.config();
import logger from "@utils/logger";
import { transporter } from "@utils/sendMail";
import { startNotificationWorker } from "@workers/notification";
import { startArticleContentWorker } from "@workers/articleContent";
import { startPushArticleWorker } from "@workers/pushArticle";
import { createServer } from "node:http";
import { startPushAdsWorker } from "@workers/pushAds";

logger.info("Worker is running");

startNotificationWorker();
startArticleContentWorker();
startPushArticleWorker();
startPushAdsWorker();

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World!\n");
});

// starts a simple http server locally on port 3000
server.listen(9000, "127.0.0.1", () => {
  logger.info("Worker is running");
});

transporter.verify(async (error, success) => {
  if (error) {
    logger.error(error);
  } else {
    logger.info("success");
  }
});
