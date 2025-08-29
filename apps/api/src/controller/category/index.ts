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

// Constants for repeated strings
const CATEGORY_ADDED_SUCCESS = "Category added successfully";
const CATEGORY_UPDATED_SUCCESS = "Category updated successfully";
const CATEGORY_FETCHED_SUCCESS = "Categories fetched successfully";
const CATEGORY_DELETED_SUCCESS = "Category deleted successfully";

interface CategoryRequest {
  name: string;
  parentId?: string;
}

interface UpdateCategoryRequest extends CategoryRequest {
  categoryId: string;
}

class CategoryController extends Base {
  router: Router;
  private websiteService: WebsiteService;
  private httpService: HttpService;
  private apiUrl: string;

  constructor() {
    super();
    this.router = Router();
    this.websiteService = new WebsiteService();
    this.apiUrl = `/api/categories`;
    this.httpService = new HttpService(this.apiUrl);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:websiteId/categories",
      adminMiddleware,
      this.addCategory,
    );
    this.router.get(
      "/:websiteId/categories",
      adminMiddleware,
      this.getCategories,
    );
    this.router.put(
      "/:websiteId/categories",
      adminMiddleware,
      this.updateCategory,
    );
    this.router.delete(
      "/:websiteId/categories/:categoryId",
      adminMiddleware,
      this.deleteCategory,
    );
  }

  // Helper: Validate and fetch website
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

  private addCategory = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    const { name, parentId } = req.body as CategoryRequest;

    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    if (!name) {
      throw new ApiError(
        "Category name is required",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const website = await this.validateWebsite(websiteId as string);
    const categoryData = { name, parentId: parentId || null };

    const pushedCategory = await this.httpService.pushToWebsite(
      website.backendUrl,
      "POST",
      categoryData,
    );

    logger.info(
      `Category '${name}' added successfully to website: ${website.backendUrl}`,
    );

    this.response(
      res,
      pushedCategory.statusCode || httpStatusCode.OK,
      pushedCategory.status || httpStatus.SUCCESS,
      pushedCategory.message || CATEGORY_ADDED_SUCCESS,
      pushedCategory.data,
    );
  });

  private updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    const { categoryId, name } = req.body as UpdateCategoryRequest;
    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    if (!categoryId || !name) {
      throw new ApiError(
        "Category ID and name are required",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const website = await this.validateWebsite(websiteId as string);

    const updatedCategory = await this.httpService.pushToWebsite(
      website.backendUrl,
      "PUT",
      { categoryId, name },
    );

    logger.info(
      `Category '${name}' updated successfully on website: ${website.backendUrl}`,
    );

    this.response(
      res,
      updatedCategory.statusCode || httpStatusCode.OK,
      updatedCategory.status || httpStatus.SUCCESS,
      updatedCategory.message || CATEGORY_UPDATED_SUCCESS,
      updatedCategory.data,
    );
  });

  private getCategories = asyncHandler(async (req: Request, res: Response) => {
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

    const categories = await this.httpService.pushToWebsite(
      website.backendUrl,
      "GET",
    );

    this.response(
      res,
      categories.statusCode || httpStatusCode.OK,
      categories.status || httpStatus.SUCCESS,
      categories.message || CATEGORY_FETCHED_SUCCESS,
      categories.data,
    );
  });

  private deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, categoryId } = req.params;

    if (req.role === "content writer") {
      throw new ApiError(
        "You don't have any rights.",
        httpStatusCode.FORBIDDEN,
      );
    }

    if (req.role === "subadmin") {
      await checkWebsiteAccess(websiteId as string, req.id);
    }

    if (!categoryId) {
      throw new ApiError("Category ID is required", httpStatusCode.BAD_REQUEST);
    }

    const website = await this.validateWebsite(websiteId as string);

    const customUrl = `/api/categories/${categoryId}`;
    const deletedCategory = await this.httpService.pushToWebsite(
      website.backendUrl,
      "DELETE",
      {},
      customUrl,
    );

    logger.info(
      `Category deleted successfully on website: ${website.backendUrl}`,
    );

    this.response(
      res,
      deletedCategory.statusCode || httpStatusCode.OK,
      deletedCategory.status || httpStatus.SUCCESS,
      deletedCategory.message || CATEGORY_DELETED_SUCCESS,
      deletedCategory.data,
    );
  });
}

export default new CategoryController().router;
