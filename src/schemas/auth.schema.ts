import z from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  otp: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
