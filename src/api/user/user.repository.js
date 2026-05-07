import { UserModel } from "./user.model.js";

export const userRepository = {
  createUser: (firstName, lastName, email, password, username) =>
    UserModel.create({
      firstName,
      lastName,
      email,
      password,
      ...(username ? { username } : {}),
    }),

  findAllUsers: () => UserModel.find().select("-password"),

  findUserByEmail: (email) => UserModel.findOne({ email }),

  findUserByEmailOrUsername: ({ email, username }) => {
    const conditions = [
      ...(email ? [{ email }] : []),
      ...(username ? [{ username }] : []),
    ];

    return UserModel.findOne({ $or: conditions });
  },

  findUserById: (id) => UserModel.findById(id).select("-password"),

  updateUserById: (id, userData) =>
    UserModel.findByIdAndUpdate(id, userData, {
      new: true,
    }),

  updateUserByEmail: (email, userData) =>
    UserModel.findOneAndUpdate({ email }, userData, {
      new: true,
    }),

  updateUserPasswordByEmail: (email, password) =>
    UserModel.findOneAndUpdate(
      { email },
      { password },
      { new: true },
    ),

  deleteUserById: (id) => UserModel.findByIdAndDelete(id),
};
