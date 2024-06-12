import { Router } from "express";
import {
  signUpController,
  VerifyOtp,
  Login,
  RefreshToken,
} from "../controllers/user.controler";
import verifyToken from "../middlewares/auth";

const userrouter = Router();

userrouter.post("/signup", signUpController);
userrouter.post("/verify-otp", VerifyOtp);
userrouter.post("/login", Login);
userrouter.get("/refresh-token", verifyToken, RefreshToken);

export { userrouter };
