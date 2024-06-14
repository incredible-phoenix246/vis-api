import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { getUserIdFromToken } from "../utils";

const alllNotifications = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
    });
    return res.status(200).json({
      message: "notifications",
      notifications: notifications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const markNotificationasread = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Id is needed" });
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const notification = await prisma.notification.update({
      where: {
        id: Number(id),
      },
      data: {
        read: true,
      },
    });
    return res.status(200).json({
      message: "notification marked as read",
      notification: notification,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export { alllNotifications, markNotificationasread };
