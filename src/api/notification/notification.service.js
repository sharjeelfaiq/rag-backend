import { notificationRepository } from "./notification.repository.js";
import createError from "http-errors";

export const notificationService = {
  getMyNotifications: async (userId) => {
    const userNotifications = await notificationRepository.getByUserId(userId);

    if (!userNotifications) {
      throw createError(500, "Notification retrieval failed");
    }

    return {
      status: "success",
      message: "Notifications retrieved successfully",
      data: userNotifications,
    };
  },

  updateNotificationById: async (notificationId, userId) => {
    const updatedNotification =
      await notificationRepository.updateReadStatusForUser({
        notificationId,
        userId,
        read: true,
      });

    if (!updatedNotification) {
      throw createError(404, "Notification not found");
    }

    return {
      status: "success",
      message: "Notification updated successfully",
      data: updatedNotification,
    };
  },
};
