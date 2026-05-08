import { NotificationModel } from "./notification.model.js";

export const notificationRepository = {
  getByUserId: (userId) => {
    return NotificationModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  },

  create: ({ userId, message }) => {
    return NotificationModel.create({
      user: userId,
      message,
    });
  },

  updateReadStatusForUser: ({ notificationId, userId, read }) => {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { read } },
      { new: true, runValidators: true },
    ).exec();
  },
};
