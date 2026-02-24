import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return errorResponse(res, 401, "Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 401, "Unauthorized");
  }
};
