import { httpStatus, httpStatusCode } from "@customtype/http";
import WebsiteService from "@services/website";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import { checkWebsiteAccess } from "@utils/checkWebsiteAccess";
import HttpService from "@utils/httpService";
import { Router, Request, Response } from "express";
import adminMiddleware from "middleware/adminMiddleware";

class WebsiteNewslatterController extends Base {
  router: Router;
  websiteService: WebsiteService;
  private httpService: HttpService;
  private apiUrl: string;

  constructor() {
    super();
    this.router = Router();
    this.apiUrl = `/api/newsletter`;
    this.httpService = new HttpService(this.apiUrl);
    this.websiteService = new WebsiteService();
    this.initRoute();
  }

  private initRoute() {
    this.router.get(
      "/website-newsletter/website/:websiteId",
      adminMiddleware,
      this.getNewsletter,
    );
  }
  private getNewsletter = asyncHandler(async (req: Request, res: Response) => {
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

    const queryString = new URLSearchParams(
      req.query as Record<string, string>,
    ).toString();

    const newsletter = await this.httpService.pushToWebsite(
      website.backendUrl,
      "GET",
      {},
      `/api/newsletter?${queryString}`,
    );

    return this.response(
      res,
      newsletter.statusCode || httpStatusCode.OK,
      newsletter.status || httpStatus.SUCCESS,
      newsletter.message || "Backend sync failed.",
      newsletter.data,
    );
  });
}

export default new WebsiteNewslatterController().router;
