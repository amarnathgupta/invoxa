import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils";

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
