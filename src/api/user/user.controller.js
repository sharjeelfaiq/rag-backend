import { handlePromise } from "#lib/promise.lib.js";
import { userService } from "./user.service.js";

export const userController = {
  getAll: handlePromise(async (_, res) => {
    const responseBody = await userService.getAll();
    res.status(200).json(responseBody);
  }),

  getById: handlePromise(async (req, res) => {
    const parameters = req.params;
    const responseBody = await userService.getById(parameters);
    res.status(200).json(responseBody);
  }),

  updateById: handlePromise(async (req, res) => {
    const { id } = req.params;
    const responseBody = await userService.updateById(id, req.body, req.files);
    res.status(200).json(responseBody);
  }),

  deleteById: handlePromise(async (req, res) => {
    const { id } = req.params;
    await userService.deleteById(id);
    res.status(204).send();
  }),
};
