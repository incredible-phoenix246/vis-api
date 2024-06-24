import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { generateNumericOTP, getUserIdFromToken } from "../utils";
import { User as bodyprops } from "../types";
import { User } from "@prisma/client";
import { compilerOtp } from "../complier";
import { Sendmail } from "../utils/mailer";
import jwt from "jsonwebtoken";

const signUpController = async (req: Request, res: Response) => {
  const {
    email,
    fullName,
    password,
    referralCode,
    phoneNumber,
    accountType,
  }: bodyprops = req.body;

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
          accountType: accountType ? accountType : "user",
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

    const updatedUser = await prisma.user.update({
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
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const Login = async (req: Request, res: Response) => {
  const { email, password }: bodyprops = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(400).json({ message: "Please verify your account" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await prisma.refreshToken.create({
      data: {
        token: token,
        userId: user.id,
      },
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

const RefreshToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const newAccessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const verifyOperator = async (req: Request, res: Response) => {
  const {

    ninNumber,
    cacNumber,
    mobilityType,
    driversLicense,
    vechLicense,
    document,
  }: bodyprops = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    if (user.accountType !== "operator") {
      return res.status(400).json({ message: "Invalid user" });
    }

    let verified = false;

    if (cacNumber !== undefined) {
      const response = await fetch('https://searchapp.cac.gov.ng/searchapp/api/public/public-search/company-business-name-it', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm: cacNumber })
      });

      const data = await response.json();

      if (data.status === 'OK' && data.success) {
        const company = data.data.data.find((company: any) => company.rcNumber === cacNumber);

        if (company && company.status === 'ACTIVE') {
          verified = true;
        }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ninNumber: ninNumber || "",
        cacNumber: cacNumber || "",
        mobilityType: Array.isArray(mobilityType) ? mobilityType : [mobilityType],
        driversLicense,
        vechLicense,
        document: Array.isArray(document) ? document : [document],
        isOperatorverified: verified
      },
    });

    return res.status(200).json({
      success: true,
      message: verified ? "Your account has been verified" : "Your account will be verified in 3 working days",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllOperators = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const u = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!u) {
      return res.status(400).json({ message: "Invalid user" });
    }
    if (u.accountType !== "admin") {
      return res.status(400).json({ message: "Invalid user" });
    }

    const operators = await prisma.user.findMany({
      where: {
        accountType: "operator",
      },
    });

    return res.status(200).json({
      success: true,
      operators,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const AdminVerifyOperatorbyid = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const u = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!u) {
      return res.status(400).json({ message: "Invalid user" });
    }
    if (u.accountType !== "admin") {
      return res.status(400).json({ message: "Invalid user" });
    }

    const operator = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!operator) {
      return res.status(400).json({ message: "Invalid user" });
    }
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        isOperatorverified: true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllusers = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const u = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!u) {
      return res.status(400).json({ message: "Invalid user" });
    }
    if (u.accountType !== "admin") {
      return res.status(400).json({ message: "Invalid user" });
    }

    const users = await prisma.user.findMany();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export {
  signUpController,
  VerifyOtp,
  Login,
  RefreshToken,
  verifyOperator,
  getAllOperators,
  AdminVerifyOperatorbyid,
  getAllusers,
};
