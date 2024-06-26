import { Router } from "express";
import {
  signUpController,
  VerifyOtp,
  Login,
  RefreshToken,
  verifyOperator,
  getAllOperators,
  AdminVerifyOperatorbyid,
  getAllusers,
  getMe
} from "../controllers/user.controler";
import verifyToken from '../middlewares/auth';

const userrouter = Router();

userrouter.post("/signup", signUpController);
userrouter.post("/verify-otp", VerifyOtp);
userrouter.post("/login", Login);
userrouter.get("/refresh-token", verifyToken, RefreshToken);
userrouter.post("/verify-operator", verifyToken, verifyOperator);
userrouter.get("/get-all-operators", verifyToken, getAllOperators);
userrouter.post(
  "/admin-verify-operator?:id",
  verifyToken,
  AdminVerifyOperatorbyid
);
userrouter.get("/get-all-users", verifyToken, getAllusers);
userrouter.get("/get-me", verifyToken, getMe)

export { userrouter };
