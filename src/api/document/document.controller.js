import { handlePromise } from "#lib/promise.lib.js";
import { documentService } from "./document.service.js";

export const documentController = {
  uploadDocument: handlePromise(async (req, res) => {
    const responseBody = await documentService.uploadDocument({
      userId: req.user.id,
      file: req.file,
    });
    res.status(201).json(responseBody);
  }),

  listDocuments: handlePromise(async (req, res) => {
    const responseBody = await documentService.listDocuments(req.user.id);
    res.status(200).json(responseBody);
  }),

  getDocument: handlePromise(async (req, res) => {
    const responseBody = await documentService.getDocument({
      documentId: req.params.id,
      userId: req.user.id,
    });
    res.status(200).json(responseBody);
  }),

  deleteDocument: handlePromise(async (req, res) => {
    await documentService.deleteDocument({
      documentId: req.params.id,
      userId: req.user.id,
    });
    res.status(204).send();
  }),
};
