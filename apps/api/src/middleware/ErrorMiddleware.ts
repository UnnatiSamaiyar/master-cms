import { httpStatusCode } from "@customtype/http";
import ApiError from "@utils/apiError";
import logger from "@utils/logger";
import { Request, Response, NextFunction } from "express";
import { DatabaseError } from "pg";

const ErrorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number;
  let message: string;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    if (err instanceof DatabaseError) {
      statusCode = httpStatusCode.BAD_REQUEST;
      message = err.message;
    } else {
      statusCode = httpStatusCode.INTERNAL_SERVER_ERROR;
      message = err.message || "Internal Server Error";
    }
  }

  switch (err.name) {
    case "JsonWebTokenError":
      message = "Json Web Token is invalid. Try again.";
      statusCode = httpStatusCode.UNAUTHORIZED;
      break;
    case "TokenExpiredError":
      message = "Json Web Token has expired. Try again.";
      statusCode = httpStatusCode.UNAUTHORIZED;
      break;
    default:
      break;
  }

  // Log the error appropriately
  if (err instanceof ApiError) {
    logger.warn(`Custom error: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
    logger.warn(`JWT error: ${err.message}`, {
      name: err.name,
      stack: err.stack,
    });
  } else {
    if (process.env.NODE_ENV === "production") {
      logger.error(`Error: ${err.message}`, { stack: err.stack });
    } else {
      logger.error(`Error: ${err.message}`, { stack: err.stack, details: err });
    }
  }

  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};
export default ErrorMiddleware;
