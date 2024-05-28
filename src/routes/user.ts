import { Router } from "express";
import { signUpController, VerifyOtp } from "../controllers/user.controler";

const userrouter = Router();

userrouter.post("/signup", signUpController);
userrouter.post("/verify-otp", VerifyOtp);

export { userrouter };
