import { OtpModel } from "./otp.model.js";

export const otpRepository = {
  createOtp: ({ otpHash, userId, expiresAt }) =>
    OtpModel.create({
      otpHash,
      userId,
      expiresAt,
    }),

  findOtpByUserId: (userId) => OtpModel.find({ userId }),
};
