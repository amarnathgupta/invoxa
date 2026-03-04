import { Router } from "express";
import {
  forgotPasswordController,
  getOtpController,
  loginController,
  registerController,
  verifyOtpController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

authRouter.use(authMiddleware);
authRouter.post("/otp/send", getOtpController);
authRouter.post("/otp/verify", verifyOtpController);
authRouter.post("/forgot-password", forgotPasswordController);
