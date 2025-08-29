import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import awsS3Client from "@config/awsConfig";
import { PUSH_ADS, pushAdsData } from "@customtype/article-content";
import { httpStatus, httpStatusCode } from "@customtype/http";
import db from "@db/index";
import { adsTable, insertAds, websiteTable } from "@db/schema";
import { adsPushQueue } from "@queues/index";
import { AdsService } from "@services/ads";
import WebsiteService from "@services/website";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import { checkWebsiteAccess } from "@utils/checkWebsiteAccess";
import HttpService from "@utils/httpService";
import { generateShortId, pagination } from "@utils/index";
import logger from "@utils/logger";
import { count } from "drizzle-orm";
import { and, desc, eq, ilike, SQL } from "drizzle-orm";
import { Router, Request, Response } from "express";
import adminMiddleware from "middleware/adminMiddleware";
import multer, { Multer, StorageEngine } from "multer";

class AdsController extends Base {
  router: Router;
  adsService: AdsService;
  private storage: StorageEngine;
  private websiteService: WebsiteService;
  private apiUrl: string;
  private httpService: HttpService;

  private upload: Multer;
  constructor() {
    super();
    this.router = Router();
    this.storage = multer.memoryStorage();
    this.websiteService = new WebsiteService();
    this.upload = multer({ storage: this.storage });
    this.adsService = new AdsService();
    this.apiUrl = "/api/ads";
    this.httpService = new HttpService(this.apiUrl);

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/ads/push", adminMiddleware, this.pushAdsToWebsite);
    this.router.post(
      "/ads",
      adminMiddleware,
      this.upload.single("image"),
      this.createAd,
    );
    this.router.get("/ads/:adsId", this.getAdById);
    this.router.get("/ads", adminMiddleware, this.getAllAds);
    this.router.put("/ads", adminMiddleware, this.updateAd);
    this.router.delete("/ads/:adsId", adminMiddleware, this.deleteAd);
    this.router.get("/ads/date-range", this.getAdsByDateRange);
    this.router.get("/website-ads/:adsId", adminMiddleware, this.getWebiteAds);
    this.router.post(
      "/website-ads/add/:websiteId",
      adminMiddleware,
      this.upload.single("image"),
      this.addWebsiteAd,
    );
    this.router.post(
      `/website-ads/:websiteId`,
      adminMiddleware,
      this.upload.single("image"),
      this.updateWebsiteAds,
    );
    this.router.delete(
      `/website-ads/:websiteId`,
      adminMiddleware,
      this.deleteWebsiteAds,
    );
    this.router.post(
      `/website-ads/push/articles/ads/:websiteId`,
      adminMiddleware,
      this.upload.single("image"),
      this.addWebsiteArticleAds,
    );
    this.router.put(
      `/website-ads/articles/ads/:websiteId`,
      adminMiddleware,
      this.upload.single("image"),
      this.updateWebsiteArticleAds,
    );
    this.router.delete(
      "/website-ads/articles/ads/:websiteId",
      adminMiddleware,
      this.deleteWebsiteArticleAds,
    );
  }

  private addWebsiteAd = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }
    if (req.role !== "admin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }
    const website = await this.websiteService.getWebsiteById(
      websiteId as string,
    );
    if (!website)
      throw new ApiError("Website does not exist.", httpStatusCode.BAD_REQUEST);

    let fullUrl = "";
    if (req.file) {
      const file = req.file;
      const unique_filename = `${generateShortId(7)}_${file.originalname}`;
      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `ads/${unique_filename}`,
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

      fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ads/${unique_filename}`;
    }

    const pushAd = await this.httpService.pushToWebsite(
      website.backendUrl,
      "POST",
      { ...req.body, imageUrl: fullUrl },
    );

    return this.response(
      res,
      pushAd.statusCode || httpStatusCode.OK,
      pushAd.status || httpStatus.SUCCESS,
      pushAd.message || "Backend sync failed.",
      pushAd.data,
    );
  });

  private deleteWebsiteArticleAds = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }
      if (req.role !== "admin") {
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
      const deleteAds = await this.httpService.pushToWebsite(
        website.backendUrl,
        "DELETE",
        req.body,
        `/api/articles/ads/${req.body.adsId}`,
      );
      return this.response(
        res,
        deleteAds.statusCode || httpStatusCode.OK,
        deleteAds.status || httpStatus.SUCCESS,
        deleteAds.message || "Backend sync failed.",
        deleteAds.data,
      );
    },
  );

  private updateWebsiteArticleAds = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }
      if (req.role !== "admin") {
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
      const { isNewImage } = req.body;
      let fullUrl = "";

      if (JSON.parse(isNewImage) && req.file) {
        const file = req.file;
        const unique_filename = `${generateShortId(7)}_${file.originalname}`;
        const params: PutObjectCommandInput = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: `ads/${unique_filename}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        const s3result: PutObjectCommandOutput =
          await awsS3Client.send(command);

        if (s3result.$metadata.httpStatusCode !== 200) {
          throw new ApiError(
            "Something went wrong while uploading",
            httpStatusCode.BAD_REQUEST,
          );
        }

        fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ads/${unique_filename}`;
      }

      const updateAds = await this.httpService.pushToWebsite(
        website.backendUrl,
        "PUT",
        {
          ...req.body,
          imageUrl: fullUrl.length > 0 ? fullUrl : req.body.imageUrl,
        },
        `/api/articles/ads`,
      );
      return this.response(
        res,
        updateAds.statusCode || httpStatusCode.OK,
        updateAds.status || httpStatus.SUCCESS,
        updateAds.message || "Backend sync failed.",
        updateAds.data,
      );
    },
  );

  private addWebsiteArticleAds = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }
      if (req.role !== "admin") {
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
      let fullUrl = "";
      if (req.file) {
        const file = req.file;
        const unique_filename = `${generateShortId(7)}_${file.originalname}`;
        const params: PutObjectCommandInput = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: `ads/${unique_filename}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        const s3result: PutObjectCommandOutput =
          await awsS3Client.send(command);

        if (s3result.$metadata.httpStatusCode !== 200) {
          throw new ApiError(
            "Something went wrong while uploading",
            httpStatusCode.BAD_REQUEST,
          );
        }

        fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ads/${unique_filename}`;
      }

      const addedAds = await this.httpService.pushToWebsite(
        website.backendUrl,
        "POST",
        { ...req.body, imageUrl: fullUrl },
        `/api/articles/ads`,
      );
      return this.response(
        res,
        addedAds.statusCode || httpStatusCode.OK,
        addedAds.status || httpStatus.SUCCESS,
        addedAds.message || "Backend sync failed.",
        addedAds.data,
      );
    },
  );

  private deleteWebsiteAds = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      if (req.role !== "admin") {
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

      const deletedAds = await this.httpService.pushToWebsite(
        website.backendUrl,
        "DELETE",
        req.body,
        `/api/ads/${req.body.adsId}`,
      );
      return this.response(
        res,
        deletedAds.statusCode || httpStatusCode.OK,
        deletedAds.status || httpStatus.SUCCESS,
        deletedAds.message || "Backend sync failed.",
        deletedAds.data,
      );
    },
  );

  private updateWebsiteAds = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      const { isNewImage } = req.body;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      if (req.role !== "admin") {
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

      let fullUrl = "";

      if (JSON.parse(isNewImage) && req.file) {
        const file = req.file;
        const unique_filename = `${generateShortId(7)}_${file.originalname}`;
        const params: PutObjectCommandInput = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: `ads/${unique_filename}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        const s3result: PutObjectCommandOutput =
          await awsS3Client.send(command);

        if (s3result.$metadata.httpStatusCode !== 200) {
          throw new ApiError(
            "Something went wrong while uploading",
            httpStatusCode.BAD_REQUEST,
          );
        }

        fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ads/${unique_filename}`;
      }

      const updatedAds = await this.httpService.pushToWebsite(
        website.backendUrl,
        "PUT",
        {
          ...req.body,
          imageUrl: fullUrl.length > 0 ? fullUrl : req.body.imageUrl,
        },
      );
      return this.response(
        res,
        updatedAds.statusCode || httpStatusCode.OK,
        updatedAds.status || httpStatus.SUCCESS,
        updatedAds.message || "Backend sync failed.",
        updatedAds.data,
      );
    },
  );

  private getWebiteAds = asyncHandler(async (req: Request, res: Response) => {
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    const { adsId } = req.params;
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

    const filters: SQL[] = [eq(websiteTable.isDeleted, false)];
    if (search && search.length) {
      filters.push(ilike(websiteTable.name, `%${search}%`));
    }
    const websites = await db
      .select()
      .from(websiteTable)
      .where(and(...filters))
      .limit(perPageRow)
      .offset(skip)
      .orderBy(desc(websiteTable.createdAt));

    const websitesAds = await this.adsService.getWebsiteAds(adsId as string);
    const transformData = await this.adsService.transformWebsiteAdsData(
      websites,
      websitesAds,
    );

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Website ads fetched successfully",
      transformData,
    );
  });

  private pushAdsToWebsite = asyncHandler(
    async (req: Request, res: Response) => {
      const { selectedWebsites, adsId } = req.body;

      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      const isAdsExist = await this.adsService.getAdById(adsId);
      if (!isAdsExist)
        throw new ApiError("Ads does not exist.", httpStatusCode.BAD_REQUEST);

      const websites = await Promise.all(
        selectedWebsites.map((website: string) =>
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
          const data: pushAdsData = {
            adsId,
            website,
          };

          await this.adsService.addWebsiteAd({
            adsId: adsId,
            websiteId: website.id,
          });

          logger.info("Ads pushed to queue");

          await adsPushQueue.add(PUSH_ADS, data);
        }),
      );

      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Ads pushed successfully.",
      );
    },
  );

  private createAd = asyncHandler(async (req: Request, res: Response) => {
    const { title, targetUrl, startDate, endDate } = req.body;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (!req.file)
      throw new ApiError("No file provided", httpStatusCode.BAD_REQUEST);

    // Ensure date conversion
    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);
    const file = req.file;

    // Validate date conversion
    if (
      isNaN(formattedStartDate.getTime()) ||
      isNaN(formattedEndDate.getTime())
    ) {
      throw new ApiError(
        "Invalid date format. Use YYYY-MM-DD.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const unique_filename = `${generateShortId(7)}_${file.originalname}`;
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `ads/${unique_filename}`,
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

    const fullUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ads/${unique_filename}`;

    const adData: insertAds = {
      title,
      targetUrl,
      imageUrl: fullUrl,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: "Active",
    };

    const result = await this.adsService.createAd(adData);
    if (!result) {
      throw new ApiError("Failed to create ad", httpStatusCode.BAD_REQUEST);
    }

    const message = `The "${result.title}" has been created successfully.`;
    this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private getAdById = asyncHandler(async (req: Request, res: Response) => {
    const { adsId } = req.params;
    const ad = await this.adsService.getAdById(adsId as string);
    if (!ad) throw new ApiError("Ad not found", httpStatusCode.NOT_FOUND);
    this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Ads fetched successfully",
      ad,
    );
  });

  private getAllAds = asyncHandler(async (req: Request, res: Response) => {
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
      filters.push(ilike(adsTable.title, `%${search}%`));
    }

    const [totalCount, ads] = await Promise.all([
      db
        .select({ count: count() })
        .from(adsTable)
        .where(and(...filters)),
      db
        .select()
        .from(adsTable)
        .where(and(...filters))
        .limit(perPageRow)
        .offset(skip)
        .orderBy(desc(adsTable.createdAt)),
    ]);

    const result = {
      totalCount: totalCount[0]?.count,
      ads,
    };

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Ads fetched successfully",
      result,
    );
  });

  // private getAdsByStatus = asyncHandler(async (req: Request, res: Response) => {
  //   const ads = await this.adsService.getAdsByStatus(req.params.status);
  //   this.response(res, httpStatusCode.OK, ads);
  // });

  // private getAdsByPosition = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const ads = await this.adsService.getAdsByPosition(req.params.position);
  //     this.response(res, httpStatusCode.OK, ads);
  //   },
  // );

  private updateAd = asyncHandler(async (req: Request, res: Response) => {
    const { adsId, startDate, endDate } = req.body;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    // Validate date conversion
    if (
      isNaN(formattedStartDate.getTime()) ||
      isNaN(formattedEndDate.getTime())
    ) {
      throw new ApiError(
        "Invalid date format. Use YYYY-MM-DD.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const [updatedAd] = await this.adsService.updatedAd(adsId, {
      ...req.body,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
    if (!updatedAd)
      throw new ApiError("Failed to update ad", httpStatusCode.BAD_REQUEST);
    const message = `The Ads "${updatedAd.title}" has been updated.`;
    this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      message,
      updatedAd,
    );
  });

  private deleteAd = asyncHandler(async (req: Request, res: Response) => {
    const { adsId } = req.params;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have permission.",
        httpStatusCode.FORBIDDEN,
      );
    }
    const deletedAd = await this.adsService.deleteAd(adsId as string);
    if (!deletedAd)
      throw new ApiError("Failed to delete ad", httpStatusCode.BAD_REQUEST);
    const message = `The Ads "${deletedAd.title} has been deleted successfully."`;
    this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      message,
      deletedAd,
    );
  });

  private getAdsByDateRange = asyncHandler(
    async (req: Request, res: Response) => {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate)
        throw new ApiError("Missing date range", httpStatusCode.BAD_REQUEST);
      const ads = await this.adsService.getAdsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
      );
      this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Ads feteched",
        ads,
      );
    },
  );
}

export default new AdsController().router;
