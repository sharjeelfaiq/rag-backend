import createError from "http-errors";

import { env } from "#config/env.config.js";
import { handlePromise } from "#lib/promise.lib.js";
import { verifyToken } from "#lib/token.lib.js";

const { COOKIE_NAME } = env;

export const verifyAccessToken = (req, _, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token)
    throw createError(401, "Token is missing in the authorization cookie.");

  const decoded = verifyToken(token);
  if (!decoded) throw createError(401, "Invalid or expired token.");

  req.user = decoded;
  next();
};

export const verifyAuthRole = (authorizedRole) =>
  handlePromise(async (req, _, next) => {
    if (!req.user) throw createError(401, "Authentication required.");

    if (req.user.role !== authorizedRole)
      throw createError(403, `Access denied: ${authorizedRole} role required.`);

    next();
  });
