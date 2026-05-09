import createError from "http-errors";
import bcrypt from "bcryptjs";

import { env } from "#config/env.config.js";
import { generateToken, verifyToken } from "#lib/token.lib.js";
import { sendEmail } from "#lib/email.lib.js";
import { userRepository } from "../user/user.repository.js";

const { BACKEND_URL, FRONTEND_URL } = env;

export const authService = {
  signup: async ({ firstName, lastName, email, password }) => {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser)
      throw createError(400, "A user with this email already exists.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepository.createUser(
      firstName,
      lastName,
      email,
      hashedPassword,
    );
    if (!newUser) throw createError(500, "Failed to create a new user.");

    const verificationToken = generateToken(newUser._id);
    if (!verificationToken) {
      await userRepository.deleteUserById(newUser._id);
      throw createError(500, "An error occurred while generating the token.");
    }

    const isEmailSent = await sendEmail("verification-email", {
      email,
      subject: "Verify Your Email Address",
      verificationToken,
      BACKEND_URL,
    });
    if (!isEmailSent) {
      await userRepository.deleteUserById(newUser._id);
      throw createError(500, "Failed to send the welcome email.");
    }

    return {
      message:
        "User registered successfully. Please verify your email address.",
    };
  },

  signin: async ({ email, password, isRemembered }) => {
    const existingUser = await userRepository.findUserByEmail(email);
    if (!existingUser) throw createError(401, "Invalid email or password.");

    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) throw createError(401, "Invalid email or password.");

    const isEmailVerified = existingUser.isEmailVerified;
    if (!isEmailVerified)
      throw createError(403, "Please verify your email address to sign in.");

    const token = generateToken(existingUser._id, isRemembered);
    if (!token) throw createError(500, "Token generation failed");

    return {
      message: "Sign-in successful",
      token,
      data: {
        id: existingUser._id,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
      },
    };
  },

  signOut: async (token) => {
    if (!token) throw createError(400, "No token found");

    const decoded = verifyToken(token);

    if (!decoded)
      throw createError(401, "The provided token is invalid or expired.");

    return {
      message: "Sign-out successful. The token has been invalidated.",
    };
  },

  forgotPassword: async ({ email }) => {
    const existingUser = await userRepository.findUserByEmail(email);
    if (!existingUser) throw createError(404, "User not found");

    const resetToken = generateToken(existingUser._id);
    if (!resetToken)
      throw createError(500, "Failed to generate password reset token.");

    const isEmailSent = await sendEmail("reset-password", {
      email,
      subject: "Password Reset Request",
      resetToken,
      FRONTEND_URL,
    });
    if (!isEmailSent)
      throw createError(
        500,
        "Failed to send the password reset email. Please try again later.",
      );

    return {
      status: true,
      message: "Password reset link sent to your email.",
    };
  },

  resetPassword: async ({ token, password }) => {
    const decoded = verifyToken(token);
    if (!decoded)
      throw createError(400, "The password reset token is invalid or expired.");

    const userId = decoded.id;
    const existingUser = await userRepository.findUserById(userId);
    if (!existingUser) throw createError(404, "User not found");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isUpdated = await userRepository.updateUserPasswordByEmail(
      existingUser.email,
      hashedPassword,
    );
    if (!isUpdated)
      throw createError(500, "Failed to reset the password. Please try again.");

    return {
      status: true,
      message: "Password has been reset successfully.",
    };
  },
};
