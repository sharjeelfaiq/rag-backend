import { handlePromise } from "#lib/promise.lib.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  getMyNotifications: handlePromise(async (req, res) => {
    const responseBody = await notificationService.getMyNotifications(
      req.user.id,
    );
    res.status(200).json(responseBody);
  }),

  updateNotificationById: handlePromise(async (req, res) => {
    const { notiId } = req.params;
    const responseBody = await notificationService.updateNotificationById(
      notiId,
      req.user.id,
    );
    res.status(200).json(responseBody);
  }),
};
