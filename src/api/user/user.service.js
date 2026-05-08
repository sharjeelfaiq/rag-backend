import createError from "http-errors";

import { userRepository } from "./user.repository.js";

export const userService = {
  getById: async ({ id }) => {
    const user = await userRepository.findUserById(id);
    if (!user) throw createError(404, "User not found");
    return {
      message: "User retrieved successfully",
      data: user,
    };
  },

  updateById: async (id, userData) => {
    const existingUser = await userRepository.findUserById(id);
    if (!existingUser) throw createError(404, "User not found");

    const updatedUser = await userRepository.updateUserById(id, userData);
    if (!updatedUser) throw createError(500, "User update failed");

    return {
      message: "User updated successfully",
      data: updatedUser,
    };
  },

  deleteById: async (id) => {
    const user = await userRepository.deleteUserById(id);
    if (!user) throw createError(404, "User not found");
    return {
      message: "User deleted successfully",
      data: user,
    };
  },
};
