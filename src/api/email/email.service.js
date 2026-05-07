import createError from "http-errors";

import { env } from "#config/env.config.js";
import { verifyToken, generateToken } from "#lib/token.lib.js";
import { sendEmail } from "#lib/email.lib.js";
import { userRepository } from "../user/user.repository.js";

const { BACKEND_URL, FRONTEND_URL } = env;

export const emailService = {
  send: async ({ email }) => {
    const user = await userRepository.findUserByEmail(email);
    if (!user) throw createError(404, "User not found");

    const verificationToken = generateToken(user._id);
    if (!verificationToken) {
      await userRepository.deleteUserById(user._id);
      throw createError(500, "An error occurred while generating the token.");
    }

    const isEmailSent = await sendEmail("verification-email", {
      email,
      subject: "Verify Your Email Address",
      verificationToken,
      BACKEND_URL,
    });
    if (!isEmailSent) {
      await userRepository.deleteUserById(user._id);
      throw createError(500, "Failed to send the welcome email.");
    }

    return { message: "Verification email sent successfully" };
  },

  verify: async ({ verificationToken }) => {
    const decoded = verifyToken(verificationToken);
    if (!decoded) throw createError(400, "Invalid token");

    const { id } = decoded;
    if (!id) throw createError(400, "Token does not contain the user id");

    const isUserUpdated = await userRepository.updateUserById(id, {
      isEmailVerified: true,
    });
    if (!isUserUpdated)
      throw createError(500, "An error occurred while verifying the email");

    const user = await userRepository.findUserById(id);
    if (!user) throw createError(404, "User not found");

    await sendEmail("verification-success", {
      email: user.email,
      subject: "Email Verification Successful",
      FRONTEND_URL,
    });

    return { message: "Email verified successfully" };
  },
};
