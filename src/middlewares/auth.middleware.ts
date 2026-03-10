import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export interface JwtPayload {
  id: string;
  email: string;
  isVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
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
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return errorResponse(res, 401, "Unauthorized");
  }
};
