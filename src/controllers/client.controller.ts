import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils";
import type { AuthRequest } from "../middlewares";
import { createClientInputSchema } from "../schemas";
import z from "zod";
import { prisma } from "../lib/prisma";

export const createClientController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const result = createClientInputSchema.safeParse(req.body);
  if (!result.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(result.error).fieldErrors,
    );
  }
  try {
    const client = await prisma.client.create({
      data: {
        ...result.data,
        ownerId: req.user.id,
      },
    });

    return successResponse(res, 201, "Client created successfully", client);
  } catch (error) {
    console.error("clientController error:", error);
    const e = error as { code: string };
    if (e.code === "P2002") {
      return errorResponse(res, 409, "Client with this email already exists");
    }
    return errorResponse(res, 500, "Internal server error");
  }
};
