import { Router } from "express";
import {
  signUpController,
  VerifyOtp,
  Login,
} from "../controllers/user.controler";

const userrouter = Router();

userrouter.post("/signup", signUpController);
userrouter.post("/verify-otp", VerifyOtp);
userrouter.post("/login", Login);

export { userrouter };
