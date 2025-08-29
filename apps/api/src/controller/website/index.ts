import { httpStatus, httpStatusCode } from "@customtype/http";
import db from "@db/index";
import { insertWebsite, websiteTable } from "@db/schema";
import WebsiteService from "@services/website";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import { checkWebsiteAccess } from "@utils/checkWebsiteAccess";
import { pagination } from "@utils/index";
import logger from "@utils/logger";
import { and, count, desc, eq, ilike, SQL } from "drizzle-orm";
import { Router, Response, Request } from "express";
import adminMiddleware from "middleware/adminMiddleware";

class WebsiteController extends Base {
  router: Router;
  private websiteService: WebsiteService;
  constructor() {
    super();
    this.router = Router();
    this.websiteService = new WebsiteService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/websites/total", adminMiddleware, this.totalWebsites);
    this.router.post("/websites", adminMiddleware, this.addWebsite);
    this.router.put("/websites", adminMiddleware, this.updateWebsite);
    this.router.get("/websites", adminMiddleware, this.getWebsites);
    this.router.delete(
      "/websites/:websiteId",
      adminMiddleware,
      this.deleteWebsite,
    );
    this.router.get(
      "/websites/:websiteId",
      adminMiddleware,
      this.getWebsiteById,
    );
  }

  private totalWebsites = asyncHandler(async (req: Request, res: Response) => {
    const total = await db
      .select({ count: count() })
      .from(websiteTable)
      .where(eq(websiteTable.isDeleted, false));
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Total Website fetched successfully",
      total[0],
    );
  });

  private getWebsiteById = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    logger.info(`Website details ${websiteId}`);
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    const website = await this.websiteService.getWebsiteById(
      websiteId as string,
    );
    if (!website)
      throw new ApiError("Website does not exist", httpStatusCode.BAD_REQUEST);
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Website fetched successfully",
      website,
    );
  });

  private deleteWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;

    logger.info(`Deleting website: id=${websiteId}`);
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    const [deleted] = await this.websiteService.deleteWebsite(
      websiteId as string,
    );
    if (!deleted) {
      logger.warn(`Website not found: id=${websiteId}`);
      throw new ApiError("Website not found.", httpStatusCode.NOT_FOUND);
    }
    const message = `The Website ${deleted.name} has been deleted successfully.`;
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private getWebsites = asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching all websites");

    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

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

    const [totalCount, websites] = await Promise.all([
      db
        .select({ count: count() })
        .from(websiteTable)
        .where(and(...filters)),
      db
        .select()
        .from(websiteTable)
        .where(and(...filters))
        .limit(perPageRow)
        .offset(skip)
        .orderBy(desc(websiteTable.createdAt)),
    ]);
    const result = {
      totalCount: totalCount[0]?.count,
      websites,
    };
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Websites fetched successfully.",
      result,
    );
  });

  private updateWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { name, domain, backendUrl, websiteId } = req.body;

    logger.info(`Updating website: id=${websiteId}`);

    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId, req.id);
    }

    const websiteData: Partial<insertWebsite> = {
      name,
      domain,
      backendUrl,
    };

    const result = await this.websiteService.updateWebsite(
      websiteId,
      websiteData,
    );

    if (!result.updated) {
      logger.warn(`Website not found: id=${websiteId}`);
      throw new ApiError("Website not found.", httpStatusCode.NOT_FOUND);
    }

    const message = `Website '${result.name}' has been updated successfully.`;
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });

  private addWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { name, domain, backendUrl } = req.body;
    logger.info(`Adding new website: name=${name}, domain=${domain}`);

    if (req.role !== "admin")
      throw new ApiError(
        "You don't have any right to add website.",
        httpStatusCode.BAD_REQUEST,
      );

    const websiteData: insertWebsite = { name, domain, backendUrl };
    const result = await this.websiteService.addWebsite(websiteData);
    result;

    if (!result || !result.id) {
      logger.error("Error while creating website");
      throw new ApiError(
        "Error while creating website.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const message = `Website '${name}' has been created successfully.`;
    return this.response(res, httpStatusCode.OK, httpStatus.SUCCESS, message);
  });
}

export default new WebsiteController().router;
