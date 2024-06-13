import prisma from "./prisma";
import { Notification } from "../types";

const CreateNotification = async (notification: Notification) => {
  try {
    await prisma.notification.create({
      data: {
        from: notification.from,
        avatar: notification.avatar,
        type: notification.type,
        item: {
          type: notification.item.type,
          body: notification.item.body,
        },
        read: notification.read ?? false,
        userId: notification.userId,
      },
    });
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export { CreateNotification };
