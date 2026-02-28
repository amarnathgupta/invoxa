import { Router } from "express";
import {
  createOrganizationController,
  deleteOrganizationController,
  generateSlugController,
  getAllOrganizationController,
  getOrganizationByIdController,
  getOrganizationBySlugController,
  updateOrganizationController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);

// Static routes
organizationRouter.get("/", getAllOrganizationController);
organizationRouter.post("/", createOrganizationController);
organizationRouter.post("/generate-slug", generateSlugController);

// Dynamic routes
organizationRouter.get("/id/:id", getOrganizationByIdController);
organizationRouter.get("/:slug", getOrganizationBySlugController);
organizationRouter.patch("/:id", updateOrganizationController);
organizationRouter.delete("/:id", deleteOrganizationController);
