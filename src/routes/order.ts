import verifyToken from "../middlewares/auth";
import { createOrder } from "../controllers/order.controler";
import { Router } from "express";

const orderRouter = Router();

orderRouter.post("/create-order", verifyToken, createOrder);

export { orderRouter };
