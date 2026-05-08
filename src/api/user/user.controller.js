import { handlePromise } from "#lib/promise.lib.js";
import { userService } from "./user.service.js";

export const userController = {
  getMe: handlePromise(async (req, res) => {
    const responseBody = await userService.getById({ id: req.user.id });
    res.status(200).json(responseBody);
  }),

  updateMe: handlePromise(async (req, res) => {
    const responseBody = await userService.updateById(req.user.id, req.body);
    res.status(200).json(responseBody);
  }),

  deleteMe: handlePromise(async (req, res) => {
    await userService.deleteById(req.user.id);
    res.status(204).send();
  }),
};
