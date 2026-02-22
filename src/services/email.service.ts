// services/email.service.ts

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
