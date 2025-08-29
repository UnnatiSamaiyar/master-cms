import { httpStatus, httpStatusCode } from "@customtype/http";
import AdminService from "@services/admin";
import ApiError from "@utils/apiError";
import asyncHandler from "@utils/asynHandler";
import { Base } from "@utils/baseResponse";
import logger from "@utils/logger";
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { insertAdmin } from "@db/schema";
import {
  getAccessToken,
  getRefreshToken,
  options,
  verifyToken,
} from "@utils/jwt";
import adminMiddleware from "middleware/adminMiddleware";
import { SignOptions } from "jsonwebtoken";
import { payload } from "@customtype/index";

class AuthController extends Base {
  router: Router;
  adminService: AdminService;

  constructor() {
    super();
    this.router = Router();
    this.initializeRoutes();
    this.adminService = new AdminService();
  }

  private initializeRoutes() {
    this.router.post("/auth/register", adminMiddleware, this.registerAdmin);
    this.router.post("/auth/login", this.loginAdmin);
    this.router.get("/auth/token/rotation", this.refreshAccessToken);
  }

  private refreshAccessToken = asyncHandler(
    async (req: Request, res: Response) => {
      const { refreshtoken } = req.query;
      const option: SignOptions = { ...options, expiresIn: "30d" };
      const { id, name, email, role } = await verifyToken<payload>(
        refreshtoken as string,
        option,
      );
      const payload: payload = {
        id,
        name,
        email,
        role,
      };
      const token = await getAccessToken(payload);
      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "AccessToken rotation",
        { AccessToken: token, Refreshtoken: refreshtoken },
      );
    },
  );

  private registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    logger.info(`Registering new admin: email=${email}`);

    if (req.role === "subadmin")
      throw new ApiError(
        "You don't have any permission to add an admin.",
        httpStatusCode.BAD_REQUEST,
      );

    const existingAdmin = await this.adminService.getAdminByEmail(email, false);

    if (existingAdmin) {
      throw new ApiError("Admin already exists.", httpStatusCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData: insertAdmin = {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    };

    const newAdmin = await this.adminService.addAdmin(adminData);
    if (!newAdmin)
      throw new ApiError("Something went wrong", httpStatusCode.BAD_REQUEST);

    logger.info(`Admin registered successfully: email=${email}`);
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Admin registered successfully.",
    );
  });

  private loginAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    logger.info(`Admin login attempt: email=${email}`);

    const admin = await this.adminService.getAdminByEmail(email, true);

    if (!admin) {
      throw new ApiError(
        "Invalid email or password.",
        httpStatusCode.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password as string,
    );

    if (!isPasswordValid) {
      throw new ApiError(
        "Invalid email or password.",
        httpStatusCode.UNAUTHORIZED,
      );
    }

    const payload: payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    const token = await Promise.all([
      getAccessToken(payload),
      getRefreshToken(payload),
    ]);

    logger.info(`Admin logged in successfully: email=${email}`);
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Login successful",
      { accessToken: token[0], refreshToken: token[1] },
    );
  });
}

export default new AuthController().router;
