import { handlePromise } from "#lib/promise.lib.js";
import { emailService } from "./email.service.js";

export const emailController = {
  send: handlePromise(async (req, res) => {
    const requestBody = req.body;
    const responseBody = await emailService.send(requestBody);
    res.status(200).send(responseBody);
  }),

  verify: handlePromise(async (req, res) => {
    const parameters = req.params;
    const responseBody = await emailService.verify(parameters);
    res.status(200).send(responseBody);
  }),
};
