const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL environment variable is not defined");
}

import { sendEmail } from "../utils/email.util";

export const sendOtpEmail = async (to: string, otp: string) => {
  const subject = "Your OTP Code";

  const html = `
    <h2>Your OTP Code</h2>
    <p>Your OTP is: <b>${otp}</b></p>
  `;

  return await sendEmail({
    to,
    subject,
    html,
  });
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = "Reset Password";

  const html = `
    <h2>Reset Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">Reset Password</a>
  `;

  return await sendEmail({
    to,
    subject,
    html,
  });
};
