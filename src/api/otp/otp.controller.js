import { handlePromise } from "#lib/promise.lib.js";
import { otpService } from "./otp.service.js";

export const otpController = {
  send: handlePromise(async (req, res) => {
    const requestBody = req.body;
    const responseBody = await otpService.send(requestBody);
    res.status(200).json(responseBody);
  }),

  verify: handlePromise(async (req, res) => {
    const requestBody = req.body;
    const responseBody = await otpService.verify(requestBody);
    res.status(200).json(responseBody);
  }),
};
