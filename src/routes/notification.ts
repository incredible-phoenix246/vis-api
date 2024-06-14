import {
  alllNotifications,
  markNotificationasread,
} from "../controllers/notifications.cnt";
import verifyToken from "../middlewares/auth";
import { Router } from "express";

const notRoute = Router();

notRoute.get("/all-notifications", verifyToken, alllNotifications);
notRoute.get(
  "/mark-notification-as-read?:id",
  verifyToken,
  markNotificationasread
);

export { notRoute };
