import type { Response } from "express";
import { errorResponse, generateUniqueSlug, successResponse } from "../utils";
import type { AuthRequest } from "../middlewares";
import { createOrganizationInputSchema } from "../schemas";
import { prisma } from "../lib/prisma";

export const createOrganizationController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req?.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const result = createOrganizationInputSchema.safeParse(req.body);
  if (!result.success) {
    return errorResponse(res, 400, result.error.message);
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
  } = result.data;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        isVerified: true,
      },
    });
    if (user && !user.isVerified) {
      return errorResponse(res, 400, "User is not verified");
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
  if (!req?.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const { limit, page } = req.query;
  const limitValue = limit ? parseInt(limit as string) : 10;
  const pageValue = page ? parseInt(page as string) : 1;
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        ownerId: req.user.id,
        deletedAt: null,
      },
      take: limitValue,
      skip: (pageValue - 1) * limitValue,
      orderBy: {
        createdAt: "desc",
      },
    });
    if (organizations.length === 0) {
      return errorResponse(res, 404, "No organizations found");
    }
    return successResponse(
      res,
      200,
      "Organizations fetched successfully",
      organizations,
      { limit: limitValue, page: pageValue, total: organizations.length },
    );
  } catch (error) {
    return errorResponse(res, 500, "Internal server error");
  }
};
