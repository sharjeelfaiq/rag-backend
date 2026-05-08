import { handlePromise } from "#lib/promise.lib.js";
import { aiUsageService } from "./ai-usage.service.js";

export const aiUsageController = {
  listUsage: handlePromise(async (req, res) => {
    const responseBody = await aiUsageService.listUsage({
      userId: req.user.id,
      operation: req.query.operation,
    });
    res.status(200).json(responseBody);
  }),
};
