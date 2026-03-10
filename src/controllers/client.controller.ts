import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils";
import type { AuthRequest } from "../middlewares";
import {
  createClientInputSchema,
  getPaginatedInputSchema,
  updateClientInputSchema,
} from "../schemas";
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

export const getAllClientsController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const result = getPaginatedInputSchema.safeParse(req.query);
  if (!result.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(result.error).fieldErrors,
    );
  }
  const { page, limit, status } = result.data;

  try {
    const deleted =
      status === "deleted"
        ? { deletedAt: { not: null } }
        : status === "active"
          ? { deletedAt: null }
          : {};
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: {
          ownerId: req.user.id,
          ...deleted,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.client.count({
        where: {
          ownerId: req.user.id,
          ...deleted,
        },
      }),
    ]);
    return successResponse(res, 200, "Clients fetched successfully", clients, {
      limit: limit,
      page: page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAllClientsController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const getClientByIdController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return errorResponse(res, 400, "Invalid id");
  }
  try {
    const client = await prisma.client.findUnique({
      where: {
        id,
        ownerId: req.user.id,
      },
    });
    if (!client) {
      return errorResponse(res, 404, "Client not found");
    }
    return successResponse(res, 200, "Client fetched successfully", client);
  } catch (error) {
    console.log("getClientByIdController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const updateClientByIdController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return errorResponse(res, 400, "Invalid id");
  }
  const result = updateClientInputSchema.safeParse(req.body);
  if (!result.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const client = await prisma.client.update({
      where: {
        id,
        ownerId: req.user.id,
      },
      data: {
        ...result.data,
      },
    });

    return successResponse(res, 200, "Client updated successfully", client);
  } catch (error) {
    console.log("updateClientByIdController error:", error);
    const e = error as { code: string };
    if (e.code === "P2025") return errorResponse(res, 404, "Client not found");
    return errorResponse(res, 500, "Internal server error");
  }
};

export const deleteClientByIdController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return errorResponse(res, 400, "Invalid id");
  }
  try {
    await prisma.client.update({
      where: {
        id,
        ownerId: req.user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return successResponse(res, 200, "Client deleted successfully");
  } catch (error) {
    console.log("deleteClientByIdController error:", error);
    const e = error as { code: string };
    if (e.code === "P2025") return errorResponse(res, 404, "Client not found");
    return errorResponse(res, 500, "Internal server error");
  }
};
