import { handlePromise } from "#lib/promise.lib.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  getNotificationsByUserId: handlePromise(async (request, response) => {
    const requestParams = request.params;
    const responseBody =
      await notificationService.getNotificationsByUserId(requestParams);
    response.status(200).json(responseBody);
  }),

  updateNotificationById: handlePromise(async (request, response) => {
    const requestParams = request.params;
    const responseBody =
      await notificationService.updateNotificationById(requestParams);
    response.status(200).json(responseBody);
  }),
};
