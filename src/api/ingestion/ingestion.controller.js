import { handlePromise } from "#lib/promise.lib.js";
import { ingestionService } from "./ingestion.service.js";

export const ingestionController = {
  createJob: handlePromise(async (req, res) => {
    const responseBody = await ingestionService.createJob({
      documentId: req.body.documentId,
      userId: req.user.id,
    });
    res.status(201).json(responseBody);
  }),

  listJobs: handlePromise(async (req, res) => {
    const responseBody = await ingestionService.listJobs({
      userId: req.user.id,
      state: req.query.state,
    });
    res.status(200).json(responseBody);
  }),

  getJob: handlePromise(async (req, res) => {
    const responseBody = await ingestionService.getJob({
      jobId: req.params.id,
      userId: req.user.id,
    });
    res.status(200).json(responseBody);
  }),

  retryJob: handlePromise(async (req, res) => {
    const responseBody = await ingestionService.retryJob({
      jobId: req.params.id,
      userId: req.user.id,
    });
    res.status(200).json(responseBody);
  }),
};
