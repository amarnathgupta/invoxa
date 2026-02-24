import { Router } from "express";
import {
  getOtpController,
  loginController,
  registerController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

authRouter.use(authMiddleware);
authRouter.get("/get-otp", getOtpController);
