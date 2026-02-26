import { Router } from "express";
import {
  createOrganizationController,
  deleteOrganizationController,
  getAllOrganizationController,
  getOrganizationByIdController,
  getOrganizationBySlugController,
  updateOrganizationController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);
organizationRouter.get("/", getAllOrganizationController);
organizationRouter.get("/id/:id", getOrganizationByIdController);
organizationRouter.get("/:slug", getOrganizationBySlugController);
organizationRouter.post("/", createOrganizationController);
organizationRouter.put("/:id", updateOrganizationController);
organizationRouter.delete("/:id", deleteOrganizationController);
