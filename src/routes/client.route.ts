import { Router } from "express";
import { authMiddleware } from "../middlewares";
import {
  createClientController,
  deleteClientByIdController,
  getAllClientsController,
  getClientByIdController,
  updateClientByIdController,
} from "../controllers";

const clientRouter = Router();

clientRouter.use(authMiddleware);
clientRouter.post("/", createClientController);
clientRouter.get("/", getAllClientsController);
clientRouter.get("/:id", getClientByIdController);
clientRouter.patch("/:id", updateClientByIdController);
clientRouter.delete("/:id", deleteClientByIdController);

export default clientRouter;
