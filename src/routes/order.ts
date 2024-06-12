import verifyToken from "../middlewares/auth";
import {
  createOrder,
  getOrders,
  createBid,
  getBids,
  getBidsbyId,
  getOrderbyId,
} from "../controllers/order.controler";
import { Router } from "express";

const orderRouter = Router();

orderRouter.post("/create-order", verifyToken, createOrder);
orderRouter.get("/get-orders", verifyToken, getOrders);
orderRouter.post("/create-bid", verifyToken, createBid);
orderRouter.get("/get-bids", verifyToken, getBids);
orderRouter.get("/get-bids?:id", verifyToken, getBidsbyId);
orderRouter.get("/get-order?:id", verifyToken, getOrderbyId);

export { orderRouter };
