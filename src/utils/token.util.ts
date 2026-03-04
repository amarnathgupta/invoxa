import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

export const generateToken = (data: unknown) => {
  if (!data) throw new Error("No data provided");
  return jwt.sign(data, JWT_SECRET, { expiresIn: "1d" });
};
