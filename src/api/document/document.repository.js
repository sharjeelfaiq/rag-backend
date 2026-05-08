import { DocumentModel } from "./document.model.js";

export const documentRepository = {
  create: (documentData) => DocumentModel.create(documentData),

  findByChecksumForUser: ({ userId, checksumHash }) =>
    DocumentModel.findOne({
      uploadedBy: userId,
      checksumHash,
    }).exec(),

  findByUser: (userId) =>
    DocumentModel.find({ uploadedBy: userId }).sort({ createdAt: -1 }).exec(),

  findByIdForUser: ({ documentId, userId }) =>
    DocumentModel.findOne({
      _id: documentId,
      uploadedBy: userId,
    }).exec(),

  deleteByIdForUser: ({ documentId, userId }) =>
    DocumentModel.findOneAndDelete({
      _id: documentId,
      uploadedBy: userId,
    }).exec(),

  updateIngestionStatus: ({ documentId, status, lastIngestionJob }) =>
    DocumentModel.findByIdAndUpdate(
      documentId,
      {
        $set: {
          status,
          ...(lastIngestionJob ? { lastIngestionJob } : {}),
        },
      },
      { new: true, runValidators: true },
    ).exec(),
};
