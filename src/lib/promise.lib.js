import { logger } from "#lib/logger.lib.js";

export const handlePromise =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Async handler error: ${error.message}`);

      const next = args[2]; // Express next()

      if (typeof next === "function") {
        next(error);
        return undefined;
      }

      throw error;
    }
  };
