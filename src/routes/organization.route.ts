import { Router } from "express";
import {
  createOrganizationController,
  getAllOrganizationController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);
organizationRouter.post("/", createOrganizationController);
organizationRouter.get("/", getAllOrganizationController);
