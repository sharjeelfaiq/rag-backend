import { NotificationModel } from "./notification.model.js";

export const notificationRepository = {
  getByUserId: (userId) =>
    NotificationModel.find({ user: userId }).sort({ createdAt: -1 }).exec(),

  create: ({ userId, message }) =>
    NotificationModel.create({
      user: userId,
      message,
    }),

  updateReadStatusForUser: ({ notificationId, userId, read }) =>
    NotificationModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { read } },
      { new: true, runValidators: true },
    ).exec(),
};
