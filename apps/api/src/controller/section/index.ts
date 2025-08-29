import { httpStatus, httpStatusCode } from "@customtype/http";
import WebsiteService from "@services/website";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import { checkWebsiteAccess } from "@utils/checkWebsiteAccess";
import HttpService from "@utils/httpService";
import logger from "@utils/logger";
import { Router, Request, Response } from "express";
import adminMiddleware from "middleware/adminMiddleware";

const SECTION_SYNC_SUCCESS = "Section synced successfully";
const SECTION_FETCHED_SUCCESS = "Sections fetched successfully.";
const SECTION_DELETED_SUCCESS = "Section deleted successfully.";

class SectionController extends Base {
  router: Router;
  private websiteService: WebsiteService;
  private httpService: HttpService;
  private apiUrl: string;

  constructor() {
    super();
    this.router = Router();
    this.websiteService = new WebsiteService();
    this.apiUrl = "/api/sections";
    this.httpService = new HttpService(this.apiUrl);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Article-Section routes
    this.router.get(
      "/:websiteId/sections/:sectionId/articles",
      adminMiddleware,
      this.getArticleSections,
    );
    this.router.delete(
      "/:websiteId/sections/articles",
      adminMiddleware,
      this.deleteArticleSection,
    );
    this.router.post(
      "/:websiteId/sections/articles",
      adminMiddleware,
      this.addArticleSection,
    );
    this.router.post(
      "/:websiteId/sections/articles/main",
      adminMiddleware,
      this.toggleMainArticleSection,
    );

    this.router.post("/:websiteId/sections", adminMiddleware, this.addSection);
    this.router.get("/:websiteId/sections", adminMiddleware, this.getSections);
    this.router.put(
      "/:websiteId/sections",
      adminMiddleware,
      this.updateSection,
    );
    this.router.delete(
      "/:websiteId/sections/:sectionId",
      adminMiddleware,
      this.deleteSection,
    );
  }

  private toggleMainArticleSection = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      const website = await this.validateWebsite(websiteId as string);

      const pushedSection = await this.httpService.pushToWebsite(
        website.backendUrl,
        "POST",
        req.body,
        "/api/sections/articles/main",
      );
      this.response(
        res,
        pushedSection.statusCode || httpStatusCode.OK,
        pushedSection.status || httpStatus.SUCCESS,
        pushedSection.message || SECTION_SYNC_SUCCESS,
        pushedSection.data,
      );
    },
  );

  private async validateWebsite(websiteId: string) {
    if (!websiteId) {
      throw new ApiError(
        "Please provide websiteId",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const website = await this.websiteService.getWebsiteById(websiteId);
    if (!website) {
      throw new ApiError("Website does not exist", httpStatusCode.BAD_REQUEST);
    }

    return website;
  }

  private addSection = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    const { name, isMain, layout } = req.body;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    if (!name || typeof isMain !== "boolean") {
      throw new ApiError(
        "Name and isMain are required.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const website = await this.validateWebsite(websiteId as string);
    const sectionData = { name, isMain, layout: parseInt(layout) };

    const pushedSection = await this.httpService.pushToWebsite(
      website.backendUrl,
      "POST",
      sectionData,
    );

    logger.info(
      `Section '${name}' added successfully to website: ${website.backendUrl}`,
    );

    this.response(
      res,
      pushedSection.statusCode || httpStatusCode.OK,
      pushedSection.status || httpStatus.SUCCESS,
      pushedSection.message || SECTION_SYNC_SUCCESS,
      pushedSection.data,
    );
  });

  private getSections = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;

    const { page = "1", perRow = "20", search } = req.query;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    // Parse pagination parameters
    const currentPage = Math.max(1, Number(page));
    const perPageRow = Math.max(1, Number(perRow));
    const website = await this.validateWebsite(websiteId as string);
    const url = `/api/sections?page=${currentPage}&perRow=${perPageRow}`;

    const sections = await this.httpService.pushToWebsite(
      website.backendUrl,
      "GET",
      {},
      url,
    );

    this.response(
      res,
      sections.statusCode || httpStatusCode.OK,
      sections.status || httpStatus.SUCCESS,
      sections.message || SECTION_FETCHED_SUCCESS,
      sections.data,
    );
  });

  private updateSection = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    const { sectionId, name, isMain } = req.body;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    if (!sectionId || !name || typeof isMain !== "boolean") {
      throw new ApiError(
        "Section ID, name, and isMain are required.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const website = await this.validateWebsite(websiteId as string);

    const updatedSection = await this.httpService.pushToWebsite(
      website.backendUrl,
      "PUT",
      { sectionId, name, isMain },
    );

    logger.info(
      `Section '${name}' updated successfully on website: ${website.backendUrl}`,
    );

    this.response(
      res,
      updatedSection.statusCode || httpStatusCode.OK,
      updatedSection.status || httpStatus.SUCCESS,
      updatedSection.message || SECTION_SYNC_SUCCESS,
      updatedSection.data,
    );
  });

  private deleteSection = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, sectionId } = req.params;

    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    if (!sectionId) {
      throw new ApiError("Section ID is required.", httpStatusCode.BAD_REQUEST);
    }

    const website = await this.validateWebsite(websiteId as string);

    const customUrl = `/api/sections/${sectionId}`;
    const deletedSection = await this.httpService.pushToWebsite(
      website.backendUrl,
      "DELETE",
      {},
      customUrl,
    );

    logger.info(
      `Section deleted successfully on website: ${website.backendUrl}`,
    );

    this.response(
      res,
      deletedSection.statusCode || httpStatusCode.OK,
      deletedSection.status || httpStatus.SUCCESS,
      deletedSection.message || SECTION_DELETED_SUCCESS,
      deletedSection.data,
    );
  });
  private addArticleSection = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      const { articleIds, sectionId } = req.body;
      logger.info(
        `Linking article to section: articleId=${articleIds}, sectionId=${sectionId}`,
      );

      const website = await this.validateWebsite(websiteId as string);

      const customUrl = `/api/sections/articles`;
      const addArticles = await this.httpService.pushToWebsite(
        website.backendUrl,
        "POST",
        req.body,
        customUrl,
      );

      const message = `Article linked to section successfully.`;
      logger.info(message);
      this.response(
        res,
        addArticles.statusCode || httpStatusCode.OK,
        addArticles.status || httpStatus.SUCCESS,
        addArticles.message || SECTION_DELETED_SUCCESS,
        addArticles.data,
      );
    },
  );

  private getArticleSections = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId, sectionId } = req.params;
      const { page = "1", perRow = "20", search } = req.query;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      // Parse pagination parameters
      const currentPage = Math.max(1, Number(page));
      const perPageRow = Math.max(1, Number(perRow));

      const url = `/api/sections/${sectionId}/articles?page=${currentPage}&perRow=${perPageRow}`;
      const website = await this.validateWebsite(websiteId as string);
      const sections = await this.httpService.pushToWebsite(
        website.backendUrl,
        "GET",
        {},
        url,
      );

      this.response(
        res,
        sections.statusCode || httpStatusCode.OK,
        sections.status || httpStatus.SUCCESS,
        sections.message || SECTION_FETCHED_SUCCESS,
        sections.data,
      );
    },
  );

  private deleteArticleSection = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.params;

      const { articleSectionId } = req.body;
      if (req.role === "content writer") {
        throw new ApiError(
          "You don't have any rights.",
          httpStatusCode.FORBIDDEN,
        );
      }

      if (req.role === "subadmin") {
        await checkWebsiteAccess(websiteId as string, req.id);
      }

      logger.info(
        `Delete article to section: articleSectionId=${articleSectionId}`,
      );

      const website = await this.validateWebsite(websiteId as string);

      const customUrl = `/api/sections/articles/${articleSectionId}`;
      const addArticles = await this.httpService.pushToWebsite(
        website.backendUrl,
        "DELETE",
        {},
        customUrl,
      );

      const message = `Article deelete to section successfully.`;
      logger.info(message);
      this.response(
        res,
        addArticles.statusCode || httpStatusCode.OK,
        addArticles.status || httpStatus.SUCCESS,
        addArticles.message || SECTION_DELETED_SUCCESS,
        addArticles.data,
      );
    },
  );
}

export default new SectionController().router;
