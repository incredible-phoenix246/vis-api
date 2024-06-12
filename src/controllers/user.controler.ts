import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { generateNumericOTP } from "../utils";
import { User as bodyprops, Referral } from "../types";
import { User } from "@prisma/client";
import { compilerOtp } from "../complier";
import { Sendmail } from "../utils/mailer";
import jwt from "jsonwebtoken";

const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, fullName, password, referralCode, phoneNumber }: bodyprops =
    req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Please enter your first name" });
  }
  if (!email) {
    return res.status(400).json({ message: "Please enter your email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Please enter your password" });
  }
  if (!phoneNumber) {
    return res.status(400).json({ message: "Please enter your phone number" });
  }

  try {
    const [existingUserByEmail, existingUserByPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { phoneNumber } }),
    ]);

    if (existingUserByEmail || existingUserByPhone) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateNumericOTP(6);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    let user: User;

    if (!referralCode) {
      user = await prisma.user.create({
        data: {
          fullName,
          phoneNumber,
          email,
          password: hashedPassword,
          otp: otp.toString(),
          otpExpires,
        },
      });
    }

    if (referralCode) {
      const referrer = await prisma.referral.findUnique({
        where: {
          code: referralCode,
        },
      });

      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }

      user = await prisma.user.create({
        data: {
          fullName,
          phoneNumber,
          email,
          password: hashedPassword,
          otp: otp.toString(),
          otpExpires,
          referredById: referrer.userId,
        },
      });
    }

    const { password: _, ...rest } = user;

    await Sendmail({
      from: `VISCIO <support@viscio.com>`,
      to: email,
      subject: "OTP VERIFICATION",
      html: compilerOtp(parseInt(otp)),
    });
    res.status(201).json({ user: rest });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const VerifyOtp = async (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        otp: null,
        otpExpires: null,
        verified: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Your account is now active.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

interface LoginProps {
  email: string;
  password: string;
}

const Login = async (req: Request, res: Response) => {
  const { email, password }: LoginProps = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const { password: _, ...rest } = user;
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: rest,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export { signUpController, VerifyOtp, Login };
