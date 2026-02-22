import { Router } from "express";
import { registerController } from "../controllers";

export const authRouter = Router();

authRouter.post("/register", registerController);
