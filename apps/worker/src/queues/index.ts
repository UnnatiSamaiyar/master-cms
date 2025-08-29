import { connector } from "@config/redisConfig";
import { PushArticleQueueData } from "@customtype/artilceContent";
import { Queue } from "bullmq";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

export const ArticleContentName: string = "Article_Content_Queue" as const;
export const NotificationQueue: string = "Notification_Queue" as const;
export const addPermissionQueueName: string = "Add_Permission_Queue" as const;
export const ArticlePushQueueName: string = "Article_Push_Queue" as const;

type NotificationNameData = {
  emailData?: MailOptions;
};

export const articlePushQueue = new Queue<PushArticleQueueData>(
  ArticlePushQueueName,
  {
    connection: connector,
  },
);

export const articleContentQueue = new Queue(ArticleContentName, {
  connection: connector,
});

export const notificationQueue = new Queue<NotificationNameData>(
  NotificationQueue,
  {
    connection: connector,
  },
);
