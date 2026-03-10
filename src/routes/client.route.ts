import { Router } from "express";
import { authMiddleware } from "../middlewares";
import {
  createClientController,
  getAllClientsController,
} from "../controllers";

const clientRouter = Router();

clientRouter.use(authMiddleware);
clientRouter.post("/", createClientController);
clientRouter.get("/", getAllClientsController);

export default clientRouter;
