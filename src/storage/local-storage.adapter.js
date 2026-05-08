import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const createLocalStorage = ({ rootDirectory }) => {
  const resolvedRoot = path.resolve(rootDirectory);

  const resolveStorageKey = (storageKey) => {
    const resolvedPath = path.resolve(resolvedRoot, storageKey);
    if (!resolvedPath.startsWith(resolvedRoot)) {
      throw new Error("Resolved storage path is outside document storage root");
    }
    return resolvedPath;
  };

  return {
    provider: "local",

    async save({ buffer, userId, storedFileName }) {
      const storageKey = path.join(String(userId), storedFileName);
      const targetPath = resolveStorageKey(storageKey);

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, buffer, { flag: "wx" });

      return {
        storageKey,
        storedFileName,
      };
    },

    async delete(storageKey) {
      const targetPath = resolveStorageKey(storageKey);
      await fs.rm(targetPath, { force: true });
    },

    getIngestionLocation(storageKey) {
      return pathToFileURL(resolveStorageKey(storageKey)).href;
    },
  };
};
