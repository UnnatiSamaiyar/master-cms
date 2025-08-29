import { httpStatus, httpStatusCode } from "@customtype/http";
import db from "@db/index";
import {
  articleContentTable,
  articleTable,
  insertarticleContent,
} from "@db/schema";
import ArticleContentService from "@services/articleContent";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import logger from "@utils/logger";
import { getTableColumns } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { Router, Request, Response } from "express";

class ArticleContentController extends Base {
  router: Router;
  private articleContentService: ArticleContentService;

  constructor() {
    super();
    this.router = Router();
    this.articleContentService = new ArticleContentService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/articles/content", this.addArticleContent);
    this.router.get("/articles/content", this.getArticleContents);
    this.router.put("/articles/content", this.updateArticleContent);
    this.router.delete(
      "/articles/content/:contentId",
      this.deleteArticleContent,
    );
    this.router.get(
      "/articles/content/:articleId",
      this.getArticleContentByArticleId,
    );
  }

  private getArticleContentByArticleId = asyncHandler(
    async (req: Request, res: Response) => {
      const { articleId } = req.params;
      const { title, isPublished } = getTableColumns(articleTable);
      const { ...rest } = getTableColumns(articleContentTable);
      const [content] = await db
        .select({
          ...rest,
          title,
          isPublished,
        })
        .from(articleContentTable)
        .leftJoin(
          articleTable,
          eq(articleContentTable.articleId, articleTable.id),
        )
        .where(eq(articleContentTable.articleId, articleId as string));

      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Content Fethed successfully.",
        content,
      );
    },
  );

  private addArticleContent = asyncHandler(
    async (req: Request, res: Response) => {
      const { articleId, content } = req.body;
      logger.info(`Adding article content for articleId=${articleId}`);

      const articleContentData: insertarticleContent = { articleId, content };
      const result =
        await this.articleContentService.addArticleContent(articleContentData);

      if (!result || !result.id) {
        logger.error(
          `Error while creating article content: articleId=${articleId}`,
        );
        throw new ApiError(
          "Something went wrong while creating the article content.",
          httpStatusCode.BAD_REQUEST,
        );
      }

      const message = "The article content has been created successfully.";
      logger.info(
        `Article content created successfully: articleId=${articleId}`,
      );
      return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
    },
  );

  private getArticleContents = asyncHandler(
    async (req: Request, res: Response) => {
      logger.info("Fetching article contents");

      const result = await db.query.articleContentTable.findMany({
        // with: { article: true },
      });

      logger.info(
        `Article contents fetched successfully: count=${result.length}`,
      );
      return res.status(httpStatusCode.OK).json({ result });
    },
  );

  private updateArticleContent = asyncHandler(
    async (req: Request, res: Response) => {
      const { articleId, content } = req.body;
      logger.info(`Updating article content: articleId=${articleId}`);

      const result = await this.articleContentService.updateArticleContent(
        articleId,
        { content },
      );

      if (!result.updated) {
        logger.warn(`Article content not found: articleId=${articleId}`);
        throw new ApiError(
          "Article content does not exist.",
          httpStatusCode.BAD_REQUEST,
        );
      }

      const message = "The article content has been updated successfully.";
      logger.info(
        `Article content updated successfully: articleId=${articleId}`,
      );
      return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
    },
  );

  private deleteArticleContent = asyncHandler(
    async (req: Request, res: Response) => {
      const { contentId } = req.params;
      logger.info(`Deleting article content: contentId=${contentId}`);

      const [result] = await this.articleContentService.deleteArticleContent(
        contentId as string,
      );

      if (!result) {
        logger.warn(
          `Article content not found for deletion: contentId=${contentId}`,
        );
        throw new ApiError(
          "Article content does not exist.",
          httpStatusCode.BAD_REQUEST,
        );
      }

      const message = "The article content has been deleted successfully.";
      logger.info(
        `Article content deleted successfully: contentId=${contentId}`,
      );
      return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
    },
  );
}

export default new ArticleContentController().router;
