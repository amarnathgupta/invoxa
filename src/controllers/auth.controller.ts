import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { errorResponse, generateOtp, successResponse } from "../utils";
import type { AuthRequest } from "../middlewares";
import { sendOtpEmail } from "../services";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      return errorResponse(res, 400, "Missing email or password or name");
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    return successResponse(res, 201, "User created successfully", {
      token,
    });
  } catch (error) {
    const e = error as { code: string };

    if (e.code === "P2002") {
      return errorResponse(res, 400, "User already exists");
    }
    return errorResponse(res, 500, "Something went wrong");
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email.trim() || !password.trim()) {
      return errorResponse(res, 400, "Missing email or password");
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password.trim(),
      user.password,
    );

    if (!isPasswordCorrect) {
      return errorResponse(res, 401, "Incorrect password");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    return successResponse(res, 200, "User logged in successfully", {
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong");
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
        otpSecret: true,
      },
    });

    const coolDDownTime = 12 * 60 * 60 * 1000; // 12 hours
    if (user?.otpLastSentAt) {
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
    await sendOtpEmail(email, otp);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        otpSecret: otp,
        otpLastSentAt: new Date(),
      },
    });

    return successResponse(res, 200, "OTP sent successfully");
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong");
  }
};
