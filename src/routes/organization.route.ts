import { Router } from "express";
import { createOrganizationController } from "../controllers/organization.controller";
import { authMiddleware } from "../middlewares";

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);
organizationRouter.post("/", createOrganizationController);
