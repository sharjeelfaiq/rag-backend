import { handlePromise } from "#lib/promise.lib.js";
import { healthService } from "./health.service.js";

export const healthController = {
  checkHealth: handlePromise(async (_request, response) => {
    const responseBody = await healthService.checkHealth();
    response.status(200).json(responseBody);
  }),

  checkDetailedHealth: handlePromise(async (_request, response) => {
    const responseBody = await healthService.checkDetailedHealth();
    response.status(200).json(responseBody);
  }),
};
