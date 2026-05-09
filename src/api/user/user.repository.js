import { UserModel } from "./user.model.js";

export const userRepository = {
  createUser: (firstName, lastName, email, password) =>
    UserModel.create({
      firstName,
      lastName,
      email,
      password,
    }),

  findUserByEmail: (email) => UserModel.findOne({ email }),

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
    UserModel.findOneAndUpdate({ email }, { password }, { new: true }),

  deleteUserById: (id) => UserModel.findByIdAndDelete(id),
};
