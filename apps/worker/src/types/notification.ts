import { MailOptions } from "nodemailer/lib/sendmail-transport";

export type JobName = "EMAIL" | "APP" | "MOBILE";

export interface NotiificationData {
  emailData?: MailOptions;
}
