import { alllNotifications } from "../controllers/notifications.cnt";
import verifyToken from "../middlewares/auth";
import { Router } from "express";

const notRoute = Router();

notRoute.get("/all-notifications", verifyToken, alllNotifications);

export { notRoute };
