import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import {
  errorResponse,
  generateOtp,
  generateToken,
  successResponse,
} from "../utils";
import type { AuthRequest } from "../middlewares";
import { sendOtpEmail, sendResetPasswordEmail } from "../services";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  verifyOtpSchema,
} from "../schemas";
import z from "zod";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");
const FIXED_TIME = 500;

export const registerController = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { email, password, name } = parsed.data;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = generateToken(payload);

    return successResponse(res, 201, "User created successfully", {
      token,
    });
  } catch (error) {
    console.error("registerController error:", error);
    const e = error as { code: string };

    if (e.code === "P2002") {
      return errorResponse(res, 400, "User already exists");
    }
    return errorResponse(res, 500, "Internal server error");
  }
};

export const loginController = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { email, password } = parsed.data;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        password: true,
        isVerified: true,
      },
    });

    const DUMMY_HASH = await bcrypt.hash("dummy", 12);
    const isPasswordCorrect = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH);

    if (!user || !isPasswordCorrect) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = generateToken(payload);

    return successResponse(res, 200, "User logged in successfully", {
      token,
    });
  } catch (error) {
    console.error("loginController error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const getOtpController = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  try {
    const { email } = req.user;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        otpLastSentAt: true,
        isVerified: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    if (user.isVerified) {
      return errorResponse(res, 400, "User already verified");
    }

    const coolDDownTime = 12 * 60 * 60 * 1000; // 12 hours
    if (user.otpLastSentAt) {
      const diff = Date.now() - user.otpLastSentAt.getTime();
      if (diff < coolDDownTime) {
        return errorResponse(
          res,
          429,
          "OTP has been sent recently. Please wait.",
        );
      }
    }

    const otp = generateOtp().toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        otpSecret: hashedOtp,
        otpLastSentAt: new Date(),
      },
    });
    await sendOtpEmail(email, otp);

    return successResponse(res, 200, "OTP sent successfully");
  } catch (error) {
    console.error("getOtpController error:", error);
    return errorResponse(res, 500, "Something went wrong");
  }
};

export const verifyOtpController = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 401, "Unauthorized");
  }
  const { email } = req.user;
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { otp } = parsed.data;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        otpSecret: true,
        otpLastSentAt: true,
        isVerified: true,
      },
    });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    if (user.isVerified) {
      if (user.otpSecret) {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            otpSecret: null,
            otpLastSentAt: null,
          },
        });
      }
      return errorResponse(res, 400, "User already verified");
    }
    if (!user.otpSecret || !user.otpLastSentAt) {
      return errorResponse(res, 400, "OTP not sent");
    }
    const diff = Date.now() - user.otpLastSentAt.getTime();
    if (diff > 12 * 60 * 60 * 1000) {
      return errorResponse(res, 400, "Invalid OTP");
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpSecret);
    if (!isOtpValid) {
      return errorResponse(res, 400, "Invalid OTP");
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
        otpSecret: null,
        otpLastSentAt: null,
      },
    });

    return successResponse(res, 200, "OTP verified successfully");
  } catch (error) {
    console.error("verifyOtpController error:", error);
    return errorResponse(res, 500, "Something went wrong");
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { email } = parsed.data;
  const startTime = Date.now();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
      },
    });
    if (user) {
      const token = generateToken({ email: user.email });
      await sendResetPasswordEmail(user.email, token);
    }

    const elapsed = Date.now() - startTime;
    const remaining = FIXED_TIME - elapsed;
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return successResponse(res, 200, "Reset password email sent successfully");
  } catch (error) {
    console.error("forgotPasswordController error:", error);
    return errorResponse(res, 500, "Something went wrong");
  }
};
