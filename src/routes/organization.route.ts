import { Router } from "express";
import {
  createOrganizationController,
  getAllOrganizationController,
  getOrganizationByIdController,
  getOrganizationBySlugController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);
organizationRouter.post("/", createOrganizationController);
organizationRouter.get("/", getAllOrganizationController);
organizationRouter.get("/id/:id", getOrganizationByIdController);
organizationRouter.get("/:slug", getOrganizationBySlugController);
