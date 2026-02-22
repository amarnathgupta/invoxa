import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    const response = await resend.emails.send({
      from: "noreply@contact.amarnathgupta.in",
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.log("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
