import { Base } from "@utils/baseResponse";
import { adminTable, insertAdminVerification } from "@db/schema";
import { Router, Request, Response } from "express";
import db from "@db/index";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  SQL,
} from "drizzle-orm";
import { TransactionRollbackError } from "drizzle-orm";
import AdminService from "@services/admin";
import asyncHandler from "@utils/asynHandler";
import { httpStatus, httpStatusCode } from "@customtype/http";
import ApiError from "@utils/apiError";
import { generateCode, pagination } from "@utils/index";
import adminMiddleware from "middleware/adminMiddleware";
import bcrypt from "bcrypt";
import { notificationQueue } from "@queues/index";
import logger from "@utils/logger";

class AdminController extends Base {
  public router: Router;
  private adminService: AdminService;
  constructor() {
    super();
    this.router = Router();
    this.initializeRoutes();
    this.adminService = new AdminService();
  }
  private initializeRoutes() {
    this.router.get(
      "/admins/:adminId/assigned/websites",
      adminMiddleware,
      this.assignedWebsite,
    );
    this.router.get("/admins/recent", adminMiddleware, this.recentAdmins);
    this.router.get("/admins/total", adminMiddleware, this.totalAdmins);
    this.router.get("/admins", adminMiddleware, this.getAdmins);
    this.router.get("/admins/:id", adminMiddleware, this.getAdminById);
    this.router.delete("/admins", adminMiddleware, this.deleteAdmins);
    this.router.put("/admins/change/role", adminMiddleware, this.changeRole);
    this.router.put("/admins", adminMiddleware, this.updateProfile);
    this.router.put(
      "/admins/change/password",
      adminMiddleware,
      this.changePassword,
    );
    this.router.post(
      "/admins/password/reset/request",
      this.resetPasswordRequest,
    );
    this.router.post(
      "/admins/password/reset/verification",
      this.resetPasswordVerification,
    );
    this.router.put("/admins/change/name", adminMiddleware, this.changeName);
  }

  private changeName = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = await db
      .update(adminTable)
      .set({ name })
      .where(eq(adminTable.id, req.id));
    if (!result.rowCount || result.rowCount < 1) {
      throw new ApiError(
        "Something went wrong please try again.",
        httpStatusCode.BAD_REQUEST,
      );
    }
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Name updated successfully.",
    );
  });

  private resetPasswordVerification = asyncHandler(
    async (req: Request, res: Response) => {
      const { email, code, password } = await req.body;
      const isAdminExist = await this.adminService.getAdminByEmail(email);
      if (!isAdminExist) {
        throw new ApiError("Admin does not exist.", httpStatusCode.BAD_REQUEST);
      }
      const isTokenExist = await this.adminService.isPasswordTokenExist(
        isAdminExist.id,
      );
      if (!isTokenExist) {
        logger.warn(
          `Verification record not found for admin ID: ${isAdminExist.id}`,
        );
        throw new ApiError(
          "Invalid code provided.",
          httpStatusCode.BAD_REQUEST,
        );
      }
      if (new Date() > isTokenExist.expireAt) {
        await this.adminService.removeCode(isTokenExist.id);
        logger.warn(
          `Verification code expired for admin ID: ${isAdminExist.id}`,
        );
        throw new ApiError(
          "Your verification code has expired.",
          httpStatusCode.BAD_REQUEST,
        );
      }

      if (isTokenExist.code !== code) {
        logger.warn(`Invalid OTP for admin ID: ${isAdminExist.id}`);
        throw new ApiError(
          "Invalid code provided.",
          httpStatusCode.BAD_REQUEST,
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const updateAdmin = await this.adminService.updateAdmin(isAdminExist.id, {
        password: hashedPassword,
      });
      if (!updateAdmin.updated) {
        throw new ApiError("Something went wrong", httpStatusCode.BAD_REQUEST);
      }
      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Your password is reset successfully.",
      );
    },
  );

  private resetPasswordRequest = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;

      // Check if admin exists
      const admin = await this.adminService.getAdminByEmail(email, false);
      if (!admin) {
        throw new ApiError("Admin does not exist.", httpStatusCode.BAD_REQUEST);
      }

      // Check if reset token exists
      const existingToken = await this.adminService.isPasswordTokenExist(
        admin.id,
      );
      if (existingToken) {
        if (new Date() <= existingToken.expireAt) {
          return this.response(
            res,
            httpStatusCode.BAD_REQUEST,
            httpStatus.ERROR,
            `Reset password link has already been sent to your email ${admin.email}.`,
          );
        }
        await this.adminService.removeCode(existingToken.id);
      }

      // Generate new reset token
      const resetTokenData: insertAdminVerification = {
        code: generateCode(),
        expireAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes validity
        adminId: admin.id,
      };

      const newToken = await this.adminService.addPasswordToken(resetTokenData);
      if (!newToken.rowCount || newToken.rowCount < 1) {
        throw new ApiError(
          "Something went wrong, please try again.",
          httpStatusCode.BAD_REQUEST,
        );
      }

      // Generate reset link
      const resetLink = this.generateResetPasswordLink(req, admin.email);

      // Prepare email content
      const emailContent = {
        from: process.env.EMAIL_ID as string,
        to: [admin.email],
        subject: "Reset Password Link",
        html: this.generateResetEmailContent(resetTokenData.code, resetLink),
      };

      // Send email via notification queue
      notificationQueue.add("EMAIL", { emailData: emailContent });

      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        `Reset password link has been sent to your email ${admin.email}.`,
      );
    },
  );

  // Utility method to generate reset link
  private generateResetPasswordLink(req: Request, email: string): string {
    const baseURL =
      process.env.NODE_ENV === "production"
        ? req.headers.origin
        : process.env.FRONTEND_URL;
    return `${baseURL}/auth/reset/password/?email=${email}`;
  }

  // Utility method to generate email content
  private generateResetEmailContent(code: string, link: string): string {
    return `
    <html>
      <body>
        <p>Hello,</p>
        <p>You requested a password reset. Use the code below and click the link to reset your password:</p>
        <p><strong>Your code: ${code}</strong></p>
        <p><a href="${link}" target="_blank">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,<br/>CMSDesk Team</p>
      </body>
    </html>
  `;
  }

  private changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { password, newPassword } = req.body;
    const isAdminExist = await this.adminService.getAdminById(req.id, true);
    if (!isAdminExist)
      throw new ApiError("Admin does not exist.", httpStatusCode.BAD_REQUEST);

    const isValidPassword = await bcrypt.compare(
      password,
      isAdminExist.password as string,
    );

    if (!isValidPassword) {
      throw new ApiError(
        "Invalid password,Please try again",
        httpStatusCode.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedPassword = await this.adminService.updateAdmin(
      isAdminExist.id,
      { password: hashedPassword },
    );
    if (!updatedPassword.updated)
      throw new ApiError(
        "Invalid password,Please try again",
        httpStatusCode.BAD_REQUEST,
      );

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Password has been changed Successfully.",
    );
  });

  private assignedWebsite = asyncHandler(
    async (req: Request, res: Response) => {
      const { adminId } = req.params;
      const websites = await this.adminService.assignedWebsite(
        adminId as string,
      );
      return this.response(
        res,
        httpStatusCode.OK,
        httpStatus.SUCCESS,
        "Assigend Website fetched successfully",
        websites,
      );
    },
  );

  private totalAdmins = asyncHandler(async (req: Request, res: Response) => {
    const total = await db
      .select({ count: count() })
      .from(adminTable)
      .where(eq(adminTable.isDeleted, false));
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Total Admin fetched successfully",
      total[0],
    );
  });

  private getAdmins = asyncHandler(async (req: Request, res: Response) => {
    const { page, perRow, search } = req.query;

    let currentPage: number = 1;
    let perPageRow: number = 20;

    if (page && !isNaN(Number(page))) {
      currentPage = Number(page);
    }

    if (perRow && !isNaN(Number(perRow))) {
      perPageRow = Number(perRow);
    }

    const filters: SQL[] = [eq(adminTable.isDeleted, false)];
    if (search && search.length) {
      filters.push(
        or(
          ilike(adminTable.email, `%${search}%`),
          ilike(adminTable.name, `%${search}%`),
        ) as any,
      );
    }

    const skip = pagination(currentPage, perPageRow);
    const { password, ...rest } = getTableColumns(adminTable);
    const [totalCount, admins] = await Promise.all([
      db
        .select({ count: count() })
        .from(adminTable)
        .where(and(...filters)),
      db
        .select({ ...rest })
        .from(adminTable)
        .where(and(...filters))
        .limit(perPageRow)
        .offset(skip)
        .orderBy(desc(adminTable.createdAt)),
    ]);
    const result = {
      totalCount: totalCount[0]?.count,
      admins,
    };
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      `Admins has been fetched successfully`,
      result,
    );
  });

  private changeRole = asyncHandler(async (req: Request, res: Response) => {
    const { adminId, role } = req.body;
    if (req.role !== "admin") {
      throw new ApiError(
        "You don't have right to change the admin role.",
        httpStatusCode.BAD_REQUEST,
      );
    }
    const { updated } = await this.adminService.changeRole(adminId, role);
    if (!updated)
      throw new ApiError("Admin does not exist.", httpStatusCode.BAD_REQUEST);
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Role has been changed successfully.",
    );
  });

  private deleteAdmins = asyncHandler(async (req: Request, res: Response) => {
    const { adminIds } = req.body;

    if (req.role !== "admin") {
      throw new ApiError(
        "You don't have right to delete the admins.",
        httpStatusCode.BAD_REQUEST,
      );
    }
    const isDeleted = await db.transaction(async (tx) => {
      try {
        const result = await tx
          .update(adminTable)
          .set({ isDeleted: true })
          .where(inArray(adminTable.id, adminIds));
        if (result.rowCount !== adminIds.length) {
          tx.rollback();
        }
        return true;
      } catch (error: any) {
        if (error instanceof TransactionRollbackError) {
          throw new ApiError(
            "One or more admin does not exist.",
            httpStatusCode.BAD_REQUEST,
          );
        }
        throw new ApiError(error.message, httpStatusCode.BAD_REQUEST);
      }
    });

    if (!isDeleted) {
      throw new ApiError(
        "Something is went wrong please try again.",
        httpStatusCode.BAD_REQUEST,
      );
    }

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      `Admins has been deleted successfully`,
    );
  });

  private getAdminById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const isadminExist = await this.adminService.getAdminById(
      id as string,
      false,
    );
    if (!isadminExist) {
      throw new ApiError("Admin doesn't exist.", httpStatusCode.BAD_REQUEST);
    }
    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Admin feched successfully.",
      isadminExist,
    );
  });

  private updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const isAdminExist = await this.adminService.getAdminById(req.id, false);
    if (!isAdminExist)
      throw new ApiError("Admin does not exist.", httpStatusCode.BAD_REQUEST);
    const isUpdatedProfile = await this.adminService.updateAdmin(
      isAdminExist.id,
      { name },
    );

    if (!isUpdatedProfile.updated)
      throw new ApiError(
        "Something went wrong,please try agian.",
        httpStatusCode.FORBIDDEN,
      );

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Your profile has been updated successfully.",
      isUpdatedProfile.name,
    );
  });

  private recentAdmins = asyncHandler(async (req: Request, res: Response) => {
    const { password, ...rest } = getTableColumns(adminTable);
    const admins = await db
      .select({ ...rest })
      .from(adminTable)
      .where(eq(adminTable.isDeleted, false))
      .orderBy(desc(adminTable.createdAt))
      .limit(5);

    return this.response(
      res,
      httpStatusCode.OK,
      httpStatus.SUCCESS,
      "Admin Fetched",
      admins,
    );
  });
}

export default new AdminController().router;
