import createError from "http-errors";

import { env } from "#config/env.config.js";
import { verifyToken } from "#lib/token.lib.js";

const { COOKIE_NAME } = env;

export const verifyAccessToken = (req, _, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token)
    throw createError(401, "Token is missing in the authorization cookie.");

  const decoded = verifyToken(token);
  if (!decoded) throw createError(401, "Invalid or expired token.");
  if (!decoded.id) throw createError(401, "Invalid token payload.");

  req.user = { id: decoded.id };
  next();
};
