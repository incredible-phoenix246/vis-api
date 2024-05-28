import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import {
  generateNumericOTP,
  capitalizeFirstLetter,
  getFirstName,
} from "../utils";
import { User as bodyprops, Referral } from "../types";
import { User } from "@prisma/client";

const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, fullName, password, referralCode }: bodyprops = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Please enter your first name" });
  }
  if (!email) {
    return res.status(400).json({ message: "Please enter your email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Please enter your password" });
  }

  try {
    const existinguser = await prisma.user.findUnique({
      where: { email },
    });
    if (existinguser) {
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
          email,
          password: hashedPassword,
          otp: otp.toString(),
          otpExpires,
          referredById: referrer.userId,
        },
      });
    }

    const { password: _, ...rest } = user;
    res.status(201).json({ user: rest });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { signUpController };
