import { httpStatus, httpStatusCode } from "@customtype/http";
import { INSERT_CONTENT } from "@customtype/article-content";
import db from "@db/index";
import { articleTable, insertArticle, insertarticleContent } from "@db/schema";
import { articleContentQueue } from "@queues/index";
import ArticleService from "@services/article";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import { createSlug, generateShortId, pagination } from "@utils/index";
import logger from "@utils/logger";
import { Router, Request, Response } from "express";
import { ilike, SQL, count, desc, and } from "drizzle-orm";
import adminMiddleware from "middleware/adminMiddleware";
import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import awsS3Client from "@config/awsConfig";
import multer, { Multer, StorageEngine } from "multer";

class ArticleController extends Base {
  router: Router;
  private articleService: ArticleService;
  private storage: StorageEngine;
  private upload: Multer;

  constructor() {
    super();
    this.router = Router();
    this.articleService = new ArticleService();
    this.storage = multer.memoryStorage();
    this.upload = multer({ storage: this.storage });
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `/articles/stats/recent`,
      adminMiddleware,
      this.recentArticles,
    );
    this.router.get(`/articles/total`, adminMiddleware, this.totalArticles);
    this.router.post(
      "/articles/publish",
      adminMiddleware,
      this.upload.single("image"),
      this.publishArticle,
    );
    this.router.post("/articles/unpublish", adminMiddleware, this.unPublish);
    this.router.post(
      "/articles",
      adminMiddleware,
      this.upload.single("image"),
      this.addArticle,
    );
    this.router.get(
      "/articles/:articleId",
      adminMiddleware,
      this.getArticleDetails,
    );
    this.router.get("/articles", adminMiddleware, this.getArticles);
    this.router.put(
      "/articles",
      adminMiddleware,
      this.upload.single("image"),
      this.updateArticle,
    );
    this.router.delete(
      "/articles/:articleId",
      adminMiddleware,
      this.deleteArticle,
    );
    this.router.post(
      "/articles/content/upload",
      adminMiddleware,
      this.upload.single("image"),
      this.uploadArticleContentImage,
    );
  }

  private uploadArticleContentImage = asyncHandler(
    async (req: Request, res: Response) => {
      const file = req.file;
      if (!file)
        throw new ApiError("Please provide a file", httpStatusCode.BAD_REQUEST);
      const unique_filename = `${generateShortId(4)}_${file.originalname}`;
      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `articles/content/${unique_filename}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      const s3result: PutObjectCommandOutput = await awsS3Client.send(command);

      if (s3result.$metadata.httpStatusCode !== 200) {
        throw new ApiError(
          "Something went wrong while uploading",
          httpStatusCode.BAD_REQUEST,
        );
      }

      const fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/articles/content/${unique_filename}`;
      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Uploaded successfully",
        fullUrl,
      );
    },
  );

  private recentArticles = asyncHandler(async (req: Request, res: Response) => {
    const articles = await db
      .select()
      .from(articleTable)
      .limit(5)
      .orderBy(desc(articleTable.createdAt));
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Fetched",
      articles,
    );
  });

  private totalArticles = asyncHandler(async (req: Request, res: Response) => {
    const total = await db.select({ count: count() }).from(articleTable);
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Total Article fetched successfully",
      total[0],
    );
  });

  private unPublish = asyncHandler(async (req: Request, res: Response) => {
    const { articleId } = req.body;

    if (req.role === "content writer") {
      throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
    }
    const unPublishArticle =
      await this.articleService.unpublishArticle(articleId);
    if (!unPublishArticle)
      throw new ApiError(
        "Article  does not exist.",
        httpStatusCode.BAD_REQUEST,
      );

    const message = `The Article "${unPublishArticle.title}" has been un publish successfully.`;
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private publishArticle = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, isNewImage, imageUrl, tags, articleId } =
      req.body;
    logger.info("publish article start");
    if (req.role === "content writer") {
      throw new ApiError("You don't have right.", httpStatusCode.FORBIDDEN);
    }
    const article = await this.articleService.getArticleById(
      articleId as string,
    );
    if (!article)
      throw new ApiError(
        "Article doest not exist.",
        httpStatusCode.BAD_REQUEST,
      );
    if (article.isPublished) {
      throw new ApiError("Article already exist.", httpStatusCode.BAD_REQUEST);
    }
    let fullUrl = "";

    if (JSON.parse(isNewImage) && req.file) {
      const file = req.file;
      const unique_filename = `${generateShortId(7)}_${file.originalname}`;
      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `articles/${unique_filename}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      const s3result: PutObjectCommandOutput = await awsS3Client.send(command);

      if (s3result.$metadata.httpStatusCode !== 200) {
        throw new ApiError(
          "Something went wrong while uploading",
          httpStatusCode.BAD_REQUEST,
        );
      }

      fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/articles/${unique_filename}`;
    }

    const articleData: insertArticle = {
      title,
      tags: JSON.parse(tags),
      slug: createSlug(title),
      description,
      imageUrl: JSON.parse(isNewImage) ? fullUrl : imageUrl,
      isPublished: true,
    };
    const response = await this.articleService.updateArticle(
      articleId as string,
      articleData,
    );
    if (!response.updated)
      throw new ApiError("Something went wrong", httpStatusCode.BAD_REQUEST);
    const message = `The "${response.name} has been published successfully.`;
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private getArticleDetails = asyncHandler(
    async (req: Request, res: Response) => {
      const { articleId } = req.params;

      const article = await this.articleService.getArticleById(
        articleId as string,
      );

      if (!article)
        throw new ApiError(
          "Article does not exist.",
          httpStatusCode.BAD_REQUEST,
        );
      const message = `Article fetched successfully.`;
      logger.info(`Article fetched successfully`);
      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        message,
        article,
      );
    },
  );

  private addArticle = asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body;
    logger.info(`Adding new article: title=${title}`);

    if (!req.file)
      throw new ApiError("No file provided", httpStatusCode.BAD_REQUEST);

    const file = req.file;
    const unique_filename = `${generateShortId(7)}_${file.originalname}`;
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `articles/${unique_filename}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    const s3result: PutObjectCommandOutput = await awsS3Client.send(command);

    if (s3result.$metadata.httpStatusCode !== 200) {
      throw new ApiError(
        "Something went wrong while uploading",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/articles/${unique_filename}`;

    const articleData: insertArticle = {
      title,
      description,
      imageUrl: fullUrl,
      slug: createSlug(title),
      authorId: req.id,
    };
    const result = await this.articleService.addArticle(articleData);

    if (!result || !result.id || !result.title) {
      logger.error(`Error while creating article: title=${title}`);
      throw new ApiError(
        "Something went wrong while creating the article.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const contentData: insertarticleContent = {
      articleId: result.id,
      content: [
        {
          type: "paragraph",
          children: [
            {
              text: "A line of text in a paragraph.",
            },
          ],
        },
      ],
    };

    await articleContentQueue.add(INSERT_CONTENT, {
      insertContent: contentData,
    });

    const message = `The article '${title}' has been created successfully.`;
    logger.info(`Article created successfully: title=${title}`);
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private getArticles = asyncHandler(async (req: Request, res: Response) => {
    const { page, perRow, search } = req.query;

    let currentPage: number = 1;
    let perPageRow: number = 20;

    if (page && !isNaN(Number(page))) {
      currentPage = Number(page);
    }

    if (perRow && !isNaN(Number(perRow))) {
      perPageRow = Number(perRow);
    }

    const skip = pagination(currentPage, perPageRow);

    const filters: SQL[] = [];
    if (search && search.length) {
      filters.push(ilike(articleTable.title, `%${search}%`));
    }

    const [totalCount, articles] = await Promise.all([
      db
        .select({ count: count() })
        .from(articleTable)
        .where(and(...filters)),
      db
        .select()
        .from(articleTable)
        .where(and(...filters))
        .limit(perPageRow)
        .offset(skip)
        .orderBy(desc(articleTable.createdAt)),
    ]);
    const result = {
      totalCount: totalCount[0]?.count,
      articles,
    };
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Articles fetched successfully.",
      result,
    );
  });

  private updateArticle = asyncHandler(async (req: Request, res: Response) => {
    const { articleId, tags, imageUrl, title, description, isNewImage } =
      req.body;
    logger.info(`Updating article: articleId=${articleId}, title=${title}`);

    let fullUrl = "";

    if (JSON.parse(isNewImage) && req.file) {
      const file = req.file;
      const unique_filename = `${generateShortId(7)}_${file.originalname}`;
      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `articles/${unique_filename}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      const s3result: PutObjectCommandOutput = await awsS3Client.send(command);

      if (s3result.$metadata.httpStatusCode !== 200) {
        throw new ApiError(
          "Something went wrong while uploading",
          httpStatusCode.BAD_REQUEST,
        );
      }

      fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/articles/${unique_filename}`;
    }

    const result = await this.articleService.updateArticle(articleId, {
      title,
      description,
      slug: createSlug(title),
      imageUrl: JSON.parse(isNewImage) ? fullUrl : imageUrl,
    });

    if (!result.updated) {
      logger.warn(`Article not found: articleId=${articleId}`);
      throw new ApiError("Article does not exist.", httpStatusCode.BAD_REQUEST);
    }

    // await articlePushQueue.add(ARTICLE_JOB.UPDATE_ARTICLE, {
    //   articleId: articleId,
    // });

    const message = `The article '${title}' has been updated successfully.`;
    logger.info(`Article updated successfully: articleId=${articleId}`);
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private deleteArticle = asyncHandler(async (req: Request, res: Response) => {
    const { articleId } = req.params;
    logger.info(`Deleting article: articleId=${articleId}`);

    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have right to delete the article.",
        httpStatusCode.FORBIDDEN,
      );
    }

    const [result] = await this.articleService.deleteArticle(
      articleId as string,
    );

    if (!result || !result.title) {
      logger.warn(`Article not found for deletion: articleId=${articleId}`);
      throw new ApiError("Article does not exist.", httpStatusCode.BAD_REQUEST);
    }

    const message = `The article '${result.title}' has been deleted successfully.`;
    logger.info(`Article deleted successfully: articleId=${articleId}`);
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });
}

export default new ArticleController().router;
