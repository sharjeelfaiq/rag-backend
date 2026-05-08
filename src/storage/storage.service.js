import { env } from "#config/env.config.js";
import { createLocalStorage } from "./local-storage.adapter.js";
import { createS3Storage } from "./s3-storage.adapter.js";

export const createStorageService = () => {
  if (env.DOCUMENT_STORAGE_PROVIDER === "s3") {
    return createS3Storage();
  }

  return createLocalStorage({
    rootDirectory: env.DOCUMENT_LOCAL_ROOT,
  });
};

export const storageService = createStorageService();
