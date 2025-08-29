import { PUSH_ARTICLE, pushArticleData } from "@customtype/article-content";
import { PushArtilceReq } from "@customtype/article-website";
import { httpStatus, httpStatusCode } from "@customtype/http";
import db from "@db/index";
import { websiteArticleTable } from "@db/schema/website_article";
import { articlePushQueue } from "@queues/index";
import ArticleService from "@services/article";
import ArticleWebsiteService from "@services/article-website";
import WebsiteService from "@services/website";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import { checkWebsiteAccess } from "@utils/checkWebsiteAccess";
import HttpService from "@utils/httpService";
import logger from "@utils/logger";
import { and, eq } from "drizzle-orm";
import { Router, Request, Response } from "express";
import adminMiddleware from "middleware/adminMiddleware";

class ArticleWebsiteController extends Base {
  router: Router;
  private articleWebsiteService: ArticleWebsiteService;
  private articleService: ArticleService;
  private websiteService: WebsiteService;
  private httpService: HttpService;
  private apiUrl: string;

  constructor() {
    super();
    this.router = Router();
    this.articleWebsiteService = new ArticleWebsiteService();
    this.articleService = new ArticleService();
    this.websiteService = new WebsiteService();
    this.apiUrl = "/api/articles";
    this.httpService = new HttpService(this.apiUrl);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/website-article/website/:websiteId/unpublish",
      adminMiddleware,
      this.unPublishArticle,
    );
    this.router.post(
      "/website-article/website/:websiteId/publish",
      adminMiddleware,
      this.publishArticle,
    );

    this.router.get(
      "/website-article/website/:websiteId",
      adminMiddleware,
      this.getWebsiteArticles,
    );
    this.router.put(
      "/website-article/website/:websiteId/content",
      adminMiddleware,
      this.updateArticleContent,
    );

    this.router.delete(
      "/website-article/website/:websiteId",
      adminMiddleware,
      this.deleteArticle,
    );
    this.router.put(
      "/website-article/website/:websiteId",
      adminMiddleware,
      this.updateArticle,
    );

    this.router.post(
      `/website-article/push`,
      adminMiddleware,
      this.pushArticles,
    );
    this.router.get(
      "/website-article/:articleId",
      adminMiddleware,
      this.getArticleWebsite,
    );
  }

  private publishArticle = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;

    if (req.role === "content writer") {
      throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
    }
    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }
    const website = await this.websiteService.getWebsiteById(
      websiteId as string,
    );
    if (!website)
      throw new ApiError("Website does not exist.", httpStatusCode.BAD_REQUEST);

    const updateArticle = await this.httpService.pushToWebsite(
      website.backendUrl,
      "POST",
      req.body,
      `/api/articles/publish`,
    );
    return this.response(
      res,
      updateArticle.statusCode || httpStatusCode.OK,
      updateArticle.status || httpStatus.SUCCESS,
      updateArticle.message || "Backend sync failed.",
      updateArticle.data,
    );
  });

  private unPublishArticle = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
      }
      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      const website = await this.websiteService.getWebsiteById(
        websiteId as string,
      );
      if (!website)
        throw new ApiError(
          "Website does not exist.",
          httpStatusCode.BAD_REQUEST,
        );

      const updateArticle = await this.httpService.pushToWebsite(
        website.backendUrl,
        "POST",
        req.body,
        `/api/articles/unpublish`,
      );
      return this.response(
        res,
        updateArticle.statusCode || httpStatusCode.OK,
        updateArticle.status || httpStatus.SUCCESS,
        updateArticle.message || "Backend sync failed.",
        updateArticle.data,
      );
    },
  );

  private updateArticleContent = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;

      if (req.role === "content writer") {
        throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
      }
      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      const { articleId, content } = req.body;
      const website = await this.websiteService.getWebsiteById(
        websiteId as string,
      );
      if (!website)
        throw new ApiError(
          "Website does not exist.",
          httpStatusCode.BAD_REQUEST,
        );

      const updateArticle = await this.httpService.pushToWebsite(
        website.backendUrl,
        "PUT",
        { articleId, content },
        `/api/articles/content`,
      );
      return this.response(
        res,
        updateArticle.statusCode || httpStatusCode.OK,
        updateArticle.status || httpStatus.SUCCESS,
        updateArticle.message || "Backend sync failed.",
        updateArticle.data,
      );
    },
  );

  private deleteArticle = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    const { articleId } = req.body;

    if (req.role === "content writer") {
      throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    const website = await this.websiteService.getWebsiteById(
      websiteId as string,
    );
    if (!website)
      throw new ApiError("Website does not exist.", httpStatusCode.BAD_REQUEST);
    const deleteArticle = await this.httpService.pushToWebsite(
      website.backendUrl,
      "DELETE",
      {},
      `/api/articles/${articleId}`,
    );
    if (deleteArticle.statusCode === httpStatusCode.OK) {
      logger.info("Website Article Delete process started");
      const cmsArticleId = deleteArticle.data.cmsArticleId;
      if (cmsArticleId && websiteId) {
        logger.info("cmsArticleId found");
        await db
          .delete(websiteArticleTable)
          .where(
            and(
              eq(websiteArticleTable.websiteId, websiteId as string),
              eq(websiteArticleTable.articleId, cmsArticleId),
            ),
          );
      }
    }
    return this.response(
      res,
      deleteArticle.statusCode || httpStatusCode.BAD_REQUEST,
      deleteArticle.status || httpStatus.ERROR,
      deleteArticle.message || "Backend sync failed.",
      deleteArticle.data,
    );
  });

  private updateArticle = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    const { articleId, title, tags, imageUrl, description } = req.body;

    if (req.role === "content writer") {
      throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    const website = await this.websiteService.getWebsiteById(
      websiteId as string,
    );
    if (!website)
      throw new ApiError("Website does not exist.", httpStatusCode.BAD_REQUEST);

    const updateArticle = await this.httpService.pushToWebsite(
      website.backendUrl,
      "PUT",
      { articleId, title, tags, imageUrl, description },
    );
    return this.response(
      res,
      updateArticle.statusCode || httpStatusCode.BAD_REQUEST,
      updateArticle.status || httpStatus.ERROR,
      updateArticle.message || "Backend sync failed.",
      updateArticle.data,
    );
  });

  private getWebsiteArticles = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;

      if (req.role === "content writer") {
        throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
      }

      const url = new URL(req.url, `http://${req.headers.host}`);

      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      const website = await this.websiteService.getWebsiteById(
        websiteId as string,
      );
      if (!website)
        throw new ApiError(
          "Website does not exist.",
          httpStatusCode.BAD_REQUEST,
        );

      const articles = await this.httpService.pushToWebsite(
        website.backendUrl,
        "GET",
        // `/api/articles?page=${page}&perRow=${perRow}&search=${search}`,
      );

      return this.response(
        res,
        articles.statusCode || httpStatusCode.BAD_REQUEST,
        articles.status || httpStatus.ERROR,
        articles.message || "Backend sync failed.",
        articles.data,
      );
    },
  );

  private pushArticles = asyncHandler(async (req: Request, res: Response) => {
    const { articleId, selectedWebsites, categories }: PushArtilceReq =
      req.body;

    if (req.role === "content writer") {
      throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
    }

    console.log("Received push request", {
      articleId,
      selectedWebsites,
      categories,
    });

    const article = await this.articleService.getArticleById(articleId);
    if (!article) {
      logger.warn("Article does not exist", { articleId });
      throw new ApiError("Article does not exist.", httpStatusCode.BAD_REQUEST);
    }

    const websites = await Promise.all(
      selectedWebsites.map((website) =>
        this.websiteService.getWebsiteBackendUrl(website),
      ),
    );

    const hasUndefined = websites.some((item) => item === undefined);
    if (hasUndefined) {
      logger.error("Invalid website provided", { selectedWebsites });
      throw new ApiError(
        "Invalid website provided.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    await Promise.all(
      websites.map(async (website) => {
        if (!website) return;
        const data: pushArticleData = {
          articleId,
          categoryId: categories[website.id] as string,
          website,
        };

        await db
          .insert(websiteArticleTable)
          .values({ articleId: articleId, websiteId: website.id });

        logger.info("Article pushed to queue", {
          articleId,
          website: website.id,
        });

        await articlePushQueue.add(PUSH_ARTICLE, {
          pushArticle: data,
        });
      }),
    );

    logger.info("Articles pushed successfully", { articleId });

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Articles pushed successfully",
    );
  });

  private getArticleWebsite = asyncHandler(
    async (req: Request, res: Response) => {
      const { articleId } = req.params;
      logger.info("Fetching websites for article", { articleId });

      if (req.role === "content writer") {
        throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
      }

      const websites = await this.websiteService.getAllWebsites();
      const articles =
        await this.articleWebsiteService.getPublishedWebsiteByArticleId(
          articleId as string,
        );

      const transformedData =
        this.articleWebsiteService.transformWebsiteArticleData(
          websites,
          articles,
        );

      logger.info("Fetched article websites successfully", { articleId });

      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Fetched",
        transformedData,
      );
    },
  );
}

export default new ArticleWebsiteController().router;
