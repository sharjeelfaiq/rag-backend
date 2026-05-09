import { handlePromise } from "#lib/promise.lib.js";
import { healthService } from "./health.service.js";

export const healthController = {
  checkHealth: handlePromise(async (_req, res) => {
    const responseBody = await healthService.checkHealth();
    res.status(200).json(responseBody);
  }),

  checkDetailedHealth: handlePromise(async (_req, res) => {
    const responseBody = await healthService.checkDetailedHealth();
    res.status(200).json(responseBody);
  }),
};
