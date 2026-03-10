import { Router } from "express";
import { authMiddleware } from "../middlewares";
import { createClientController } from "../controllers";

const clientRouter = Router();

clientRouter.use(authMiddleware);
clientRouter.post("/", createClientController);

export default clientRouter;
