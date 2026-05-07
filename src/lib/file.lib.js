import fs from "fs";
import { logger } from "#lib/logger.lib.js";

export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    logger.info(`File deleted: ${filePath}`);
  } else {
    logger.warn(`File not found: ${filePath}`);
  }
};
