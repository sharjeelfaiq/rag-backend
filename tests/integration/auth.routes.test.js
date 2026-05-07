import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

const request = ({ app, method, path, body }) =>
  new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const payload = body ? JSON.stringify(body) : "";
      const req = http.request(
        {
          method,
          port,
          path,
          host: "127.0.0.1",
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let responseBody = "";

          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            responseBody += chunk;
          });
          res.on("end", () => {
            server.close(() => {
              resolve({
                statusCode: res.statusCode,
                body: responseBody ? JSON.parse(responseBody) : null,
              });
            });
          });
        },
      );

      req.on("error", (error) => {
        server.close(() => reject(error));
      });
      req.end(payload);
    });
  });

test("auth signup route returns centralized validation errors", async () => {
  const express = (await import("express")).default;
  const { authRoutes } = await import("../../src/api/auth/auth.routes.js");
  const { applyGlobalMiddleware } =
    await import("../../src/middlewares/global.middleware.js");
  const app = express();
  const router = express.Router();

  router.use("/auth", authRoutes);
  applyGlobalMiddleware(app, router);

  const response = await request({
    app,
    method: "POST",
    path: "/auth/signup",
    body: {},
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.status, 400);
  assert.match(response.body.message, /Validation failed/);
});
