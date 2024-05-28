import { Router } from "express";
import { signUpController } from "../controllers/user.controler";

const userrouter = Router();

userrouter.post("/signup", signUpController);

export { userrouter };
