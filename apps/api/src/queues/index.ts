import { connector } from "@config/redisConfig";
import {
  ArticleContentQueueData,
  pushAdsData,
  PushArticleQueueData,
} from "@customtype/article-content";
import { Queue } from "bullmq";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

export const ArticleContentName: string = "Article_Content_Queue" as const;
export const NotificationQueue: string = "Notification_Queue" as const;
export const ArticlePushQueueName: string = "Article_Push_Queue" as const;
export const AdsPushQueueName: string = "Ads_Push_Queue" as const;
export const addPermissionQueueName: string = "Add_Permission_Queue" as const;

type NotificationNameData = {
  emailData?: MailOptions;
};

export const adsPushQueue = new Queue<pushAdsData>(AdsPushQueueName, {
  connection: connector,
});

export const articlePushQueue = new Queue<PushArticleQueueData>(
  ArticlePushQueueName,
  {
    connection: connector,
  },
);

export const articleContentQueue = new Queue<ArticleContentQueueData>(
  ArticleContentName,
  {
    connection: connector,
  },
);

export const notificationQueue = new Queue<NotificationNameData>(
  NotificationQueue,
  {
    connection: connector,
  },
);
