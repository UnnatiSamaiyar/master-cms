import { httpStatusCode } from "@customtype/http";
import { payload } from "@customtype/index";
import AdminService from "@services/admin";
import ApiError from "@utils/apiError";
import { verifyToken, options } from "@utils/jwt";
import { NextFunction, Request, Response } from "express";

const adminService = new AdminService();

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      throw new ApiError("you are unauthorized.", httpStatusCode.UNAUTHORIZED);

    const isValidatoken = await verifyToken<payload>(token, options);

    if (!isValidatoken)
      throw new ApiError(
        "Something went wrong",
        httpStatusCode.INTERNAL_SERVER_ERROR,
      );

    const admin = await adminService.getAdminById(isValidatoken.id);
    if (!admin)
      throw new ApiError("You are anauthorized.", httpStatusCode.UNAUTHORIZED);

    if (!admin.isVerified)
      throw new ApiError(
        "Your account has been not verified yet.",
        httpStatusCode.BAD_REQUEST,
      );

    req.id = admin.id;
    req.name = admin.name;
    req.email = admin.email;
    req.role = admin.role;

    next();
  } catch (error) {
    next(error);
  }
};

export default adminMiddleware;
