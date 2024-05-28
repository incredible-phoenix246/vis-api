import nodemailer, { Transporter, SentMessageInfo } from "nodemailer";
import { BadRequestError } from "../middlewares";

const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

const Sendmail = async (emailcontent: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });
  try {
    await transporter.sendMail(emailcontent);
    console.log("Email sent successfully.");
    return { message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new BadRequestError("Error sending email");
  }
};

export { Sendmail };
