import { Router } from "express";
import {
  getOtpController,
  loginController,
  registerController,
  verifyOtpController,
} from "../controllers";
import { authMiddleware } from "../middlewares";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/verify-otp", verifyOtpController);

authRouter.use(authMiddleware);
authRouter.get("/get-otp", getOtpController);
