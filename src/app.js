import os from "os";
import process from "process";
import { router } from "#api/index.js";
import { env } from "#config/env.config.js";
import { logger } from "#lib/logger.lib.js";
import { app, httpServer } from "#server/app.js";
import { handlePromise } from "#lib/promise.lib.js";
import { connectDatabase } from "#lib/database.lib.js";
import { applyGlobalMiddleware } from "#middlewares/global.middleware.js";

const { PORT, BACKEND_URL, NODE_ENV } = env;

const getNetworkIP = () => {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  return null;
};

const RUNTIME_INFO = {
  framework: "Express Server",
  nodeVersion: process.version,
  envFile: ".env",
  environment: NODE_ENV ?? "development",
};

handlePromise(async () => {
  await connectDatabase();

  applyGlobalMiddleware(app, router);

  app.get("/", (_req, res) => {
    res.json({ status: "OK" });
  });

  httpServer.listen(PORT ?? 8000, async () => {
    const ip = getNetworkIP();

    logger.info(`
  ⚙️  ${RUNTIME_INFO.framework}
    - Node.js: ${RUNTIME_INFO.nodeVersion}
    - Environment: ${RUNTIME_INFO.environment}
    - Environments: ${RUNTIME_INFO.envFile}

    ➜  Local: ${BACKEND_URL}
    ➜  Network: ${ip ? `http://${ip}:${PORT ?? 8000}` : "Not available"}
`);
  });
})();
