import { httpStatus } from "@customtype/http";
import { Response } from "express";

export interface dtoInterface {
  statusCode: number;
  status: httpStatus;
  message: string;
  data?: any;
}

export abstract class Base {
  protected response(
    res: Response,
    statusCode: number,
    status: httpStatus,
    message: string,
    data?: any,
  ): Response {
    const dto: dtoInterface = { statusCode: statusCode, status, message };

    if (data) dto.data = data;
    return res.status(statusCode).json(dto);
  }
}
