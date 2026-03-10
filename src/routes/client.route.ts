import { Router } from "express";
import { authMiddleware } from "../middlewares";
import {
  createClientController,
  getAllClientsController,
  getClientByIdController,
} from "../controllers";

const clientRouter = Router();

clientRouter.use(authMiddleware);
clientRouter.post("/", createClientController);
clientRouter.get("/", getAllClientsController);
clientRouter.get("/:id", getClientByIdController);

export default clientRouter;
