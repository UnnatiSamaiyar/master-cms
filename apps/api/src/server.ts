import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import categoryRoutes from "@controller/category";
import articleRoutes from "@controller/article";
import articleContentRoutes from "@controller/article-content";
import sectionRoutes from "@controller/section";
import authRoutes from "@controller/auth";
import websiteRoutes from "@controller/website";
import adminRoutes from "@controller/admin";
import websiteAritcleRoutes from "@controller/website-article";
import websiteAdminRoutes from "@controller/website-admin";
import websiteNewsletterRoutes from "@controller/website-newsletter";
import adsRoutes from "@controller/ads";
import ErrorMiddleware from "middleware/ErrorMiddleware";

export const createServer = (): Express => {
  const app: Express = express();

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors());

  app.get("/", (req, res) => {
    return res.status(200).json({ message: "Server is running" });
  });

  app.use("/api", websiteAdminRoutes);
  app.use("/api/websites", categoryRoutes);
  app.use("/api", articleContentRoutes);
  app.use("/api", articleRoutes);
  app.use("/api/websites", sectionRoutes);
  app.use("/api", authRoutes);
  app.use("/api", websiteAritcleRoutes);
  app.use("/api", websiteNewsletterRoutes);
  app.use("/api", websiteRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", adsRoutes);

  app.use(ErrorMiddleware);

  return app;
};
