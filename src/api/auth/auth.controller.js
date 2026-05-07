import { env } from "#config/env.config.js";
import { authService } from "./auth.service.js";
import { handlePromise } from "#lib/promise.lib.js";
import { getCookieOptions } from "#lib/cookie.lib.js";

const { COOKIE_NAME } = env;

export const authController = {
  signup: handlePromise(async (req, res) => {
    const requestBody = req.body;
    const responseBody = await authService.signup(requestBody);
    res.status(201).json(responseBody);
  }),

  signin: handlePromise(async (req, res) => {
    const { token, ...responseBody } = await authService.signin(req.body);

    const options = getCookieOptions(req.body.isRemembered);

    res
      .status(200)
      .cookie(COOKIE_NAME, token, { ...options, maxAge: undefined })
      .json(responseBody);
  }),

  signOut: handlePromise(async (req, res) => {
    const token = req.cookies[COOKIE_NAME];
    const responseBody = await authService.signOut(token);

    const options = getCookieOptions(false);
    res.clearCookie(COOKIE_NAME, {
      ...options,
      maxAge: undefined,
    });

    res.status(200).json(responseBody);
  }),

  forgotPassword: handlePromise(async (req, res) => {
    const responseBody = await authService.forgotPassword(req.body);
    res.status(200).json(responseBody);
  }),

  resetPassword: handlePromise(async (req, res) => {
    const requestBody = req.body;
    const responseBody = await authService.resetPassword(requestBody);
    res.status(200).json(responseBody);
  }),
};
