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
  email: z.email(),
  otp: z.string().min(1),
});
