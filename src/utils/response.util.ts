import type { Response } from "express";

export function successResponse(
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  pagination?: any,
) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  error?: unknown,
) {
  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
}
