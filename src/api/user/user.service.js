import createError from "http-errors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { deleteFile } from "#lib/file.lib.js";
import { userRepository } from "./user.repository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getUploadedProfilePicture = (files) => {
  const avatar = files?.avatar?.[0];
  if (!avatar) return null;

  return avatar.path ?? avatar.filename ?? null;
};

export const userService = {
  getAll: async () => {
    const users = await userRepository.findAllUsers();
    if (!users.length) throw createError(404, "Users not found");
    return {
      message: "Users retrieved successfully",
      data: users,
    };
  },

  getById: async ({ id }) => {
    const user = await userRepository.findUserById(id);
    if (!user) throw createError(404, "User not found");
    return {
      message: "User retrieved successfully",
      data: user,
    };
  },

  updateById: async (id, userData, files) => {
    const existingUser = await userRepository.findUserById(id);
    if (!existingUser) throw createError(404, "User not found");

    const profilePicture = getUploadedProfilePicture(files);
    const updateData = {
      ...userData,
      ...(profilePicture ? { profilePicture } : {}),
    };

    if (updateData.profilePicture && existingUser.profilePicture) {
      const oldProfilePicturePath = path.join(
        __dirname,
        "../../../public",
        existingUser.profilePicture,
      );
      deleteFile(oldProfilePicturePath);
    }

    const updatedUser = await userRepository.updateUserById(id, updateData);
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
