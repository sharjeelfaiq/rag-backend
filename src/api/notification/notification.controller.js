import { handlePromise } from "#lib/promise.lib.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  getMyNotifications: handlePromise(async (request, response) => {
    const responseBody = await notificationService.getMyNotifications(
      request.user.id,
    );
    response.status(200).json(responseBody);
  }),

  updateNotificationById: handlePromise(async (request, response) => {
    const { notiId } = request.params;
    const responseBody = await notificationService.updateNotificationById(
      notiId,
      request.user.id,
    );
    response.status(200).json(responseBody);
  }),
};
