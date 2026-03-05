import { Router } from "express";
import {
  forgotPasswordController,
  getOtpController,
  loginController,
  registerController,
  resetPasswordController,
  verifyOtpController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", resetPasswordController);

authRouter.use(authMiddleware);
authRouter.post("/otp/send", getOtpController);
authRouter.post("/otp/verify", verifyOtpController);
