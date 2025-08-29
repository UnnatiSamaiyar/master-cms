import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import * as dotenv from "dotenv";
dotenv.config();

export let transporter = nodemailer.createTransport({
  host: "mail.nearzo.com",
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendMail = async (mailOptions: MailOptions) => {
  try {
    let info = await transporter.sendMail(mailOptions);
    return { info };
  } catch (error: any) {
    return { error };
  }
};
