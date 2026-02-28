import type { Response } from "express";
import { errorResponse, generateUniqueSlug, successResponse } from "../utils";
import type { AuthRequest } from "../middlewares";
import {
  createOrganizationInputSchema,
  generateSlugSchema,
  getOrgBySlugSchema,
  paramSchema,
  querySchema,
  updateOrganizationInputSchema,
} from "../schemas";
import { prisma } from "../lib/prisma";
import z from "zod";

export const createOrganizationController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const parsed = createOrganizationInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const {
    name,
    email,
    phone,
    website,
    logoUrl,
    gstNumber,
    taxId,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    slug,
  } = parsed.data;
  if (!gstNumber && !taxId) {
    return errorResponse(res, 400, "Either GST number or Tax ID is required");
  }
  try {
    if (!req.user.isVerified) {
      return errorResponse(res, 403, "User is not verified");
    }

    const slugValue: string =
      slug ?? (await generateUniqueSlug(req.user.id, name));
    const organization = await prisma.organization.create({
      data: {
        name,
        email,
        phone,
        website,
        logoUrl,
        gstNumber,
        taxId,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        slug: slugValue,
        ownerId: req.user.id,
      },
    });
    return successResponse(
      res,
      201,
      "Organization created successfully",
      organization,
    );
  } catch (error) {
    console.error("createOrganizationController error:", error);
    const e = error as { code: string };
    if (e.code === "P2002") {
      return errorResponse(res, 400, "Slug already exists");
    }
    return errorResponse(res, 500, "Internal server error");
  }
};

export const getAllOrganizationController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { limit, page, status } = parsed.data;

  try {
    const where = {
      ownerId: req.user.id,
      ...(status === "deleted"
        ? { deletedAt: { not: null } }
        : status === "active"
          ? { deletedAt: null }
          : {}),
    };

    const [total, organizations] = await Promise.all([
      prisma.organization.count({
        where,
      }),
      prisma.organization.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return successResponse(
      res,
      200,
      "Organizations fetched successfully",
      organizations,
      {
        limit: limit,
        page: page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    );
  } catch (error) {
    console.error("getAllOrganizationController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const getOrganizationBySlugController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const parsed = paramSchema.safeParse(req.params);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { slug } = parsed.data;
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        ownerId_slug: {
          ownerId: req.user.id,
          slug,
        },
        deletedAt: null,
      },
    });
    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }
    return successResponse(
      res,
      200,
      "Organization fetched successfully",
      organization,
    );
  } catch (error) {
    console.error("getOrganizationBySlugController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const getOrganizationByIdController = async (
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
    const organization = await prisma.organization.findUnique({
      where: {
        id,
        ownerId: req.user.id,
      },
    });
    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }
    return successResponse(
      res,
      200,
      "Organization fetched successfully",
      organization,
    );
  } catch (error) {
    console.error("getOrganizationByIdController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const updateOrganizationController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const paramSchema = z.object({ id: z.string().min(1) });
  const paramParsed = paramSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return errorResponse(res, 400, "Invalid id");
  }
  const { id } = paramParsed.data;
  const parsed = updateOrganizationInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  try {
    const updatedOrganization = await prisma.organization.update({
      where: {
        id,
        ownerId: req.user.id,
        deletedAt: null,
      },
      data: {
        ...parsed.data,
      },
    });
    return successResponse(
      res,
      200,
      "Organization updated successfully",
      updatedOrganization,
    );
  } catch (error) {
    console.error("updateOrganizationController error:", error);
    const e = error as { code: string };
    if (e.code === "P2025") {
      return errorResponse(res, 404, "Organization not found");
    }
    if (e.code === "P2002") {
      return errorResponse(res, 400, "Slug already exists");
    }
    return errorResponse(res, 500, "Internal server error");
  }
};

export const deleteOrganizationController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const paramSchema = z.object({ id: z.string().min(1) });
  const paramParsed = paramSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return errorResponse(res, 400, "Invalid id");
  }
  const { id } = paramParsed.data;
  try {
    await prisma.organization.update({
      where: {
        id,
        ownerId: req.user.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return successResponse(res, 200, "Organization deleted successfully");
  } catch (error) {
    console.error("deleteOrganizationController error:", error);
    const e = error as { code: string };
    if (e.code === "P2025")
      return errorResponse(res, 404, "Organization not found");
    return errorResponse(res, 500, "Internal server error");
  }
};

export const generateSlugController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const result = generateSlugSchema.safeParse(req.body);
  if (!result.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(result.error).fieldErrors,
    );
  }
  try {
    const { name } = result.data;
    const slug = await generateUniqueSlug(req.user.id, name);
    return successResponse(res, 200, "Slug generated successfully", { slug });
  } catch (error) {
    console.error("generateSlugController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};
