import { httpStatus, httpStatusCode } from "@customtype/http";
import { insertWebsiteAdmin } from "@db/schema";
import AdminService from "@services/admin";
import WebsiteAdminService from "@services/website-admin";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import HttpService from "@utils/httpService";
import logger from "@utils/logger";
import { Router, Request, Response } from "express";
import adminMiddleware from "middleware/adminMiddleware";

class WebsiteAdminController extends Base {
  router: Router;
  private adminService: AdminService;
  private websiteAdminService: WebsiteAdminService;
  private httpService: HttpService;
  private apiUrl: string;

  constructor() {
    super();
    this.router = Router();
    this.websiteAdminService = new WebsiteAdminService();
    this.adminService = new AdminService();
    this.apiUrl = "/api/sections";
    this.httpService = new HttpService(this.apiUrl);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/websites/admin", adminMiddleware, this.getWebsiteAdmins);
    this.router.post(
      "/websites/admin/assign",
      adminMiddleware,
      this.assignAdmins,
    );
    this.router.delete(
      "/websites/admin/assign",
      adminMiddleware,
      this.removeAdmins,
    );
  }

  private removeAdmins = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, adminIds } = req.body;
    if (req.role !== "admin")
      throw new ApiError(
        "You don't have any rights to remove admins.",
        httpStatusCode.BAD_REQUEST,
      );
    const result = await this.websiteAdminService.removeAdmins(
      websiteId,
      adminIds,
    );

    if (!result.rowCount || result.rowCount < 1) {
      throw new ApiError("Something went wrong.", httpStatusCode.BAD_REQUEST);
    }
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Admins removed successfully.",
    );
  });

  private assignAdmins = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, adminIds } = req.body;
    if (req.role !== "admin")
      throw new ApiError(
        "You don't have any rights to remove admins.",
        httpStatusCode.BAD_REQUEST,
      );

    const values: insertWebsiteAdmin[] = adminIds.map((admin: string) => ({
      adminId: admin,
      websiteId,
    }));
    const result = await this.websiteAdminService.assignAdmins(values);
    if (!result.rowCount || result.rowCount < 1)
      throw new ApiError(
        "Admin or Website does not exist.",
        httpStatusCode.BAD_REQUEST,
      );
    if (result.rowCount !== adminIds.length)
      throw new ApiError(
        "Something went wrong please try again.",
        httpStatusCode.BAD_REQUEST,
      );
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Admins assigend successfully.",
    );
  });

  private getWebsiteAdmins = asyncHandler(
    async (req: Request, res: Response) => {
      const { websiteId } = req.query;
      if (req.role !== "admin")
        throw new ApiError(
          "You don't have any rights to remove admins.",
          httpStatusCode.BAD_REQUEST,
        );

      const [admins, assignedAdmins] = await Promise.all([
        this.adminService.getAllAdmins(),
        this.websiteAdminService.getAdmins(websiteId as string),
      ]);

      const assignedAdminIds = new Set(assignedAdmins.map((admin) => admin.id));
      const data = admins.map((admin) => ({
        ...admin,
        assigned: assignedAdminIds.has(admin.id),
      }));
      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Assigned admins fetched successfully.",
        data,
      );
    },
  );
}

export default new WebsiteAdminController().router;
