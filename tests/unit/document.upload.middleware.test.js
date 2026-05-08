import assert from "node:assert/strict";
import test from "node:test";

import { mapDocumentUploadError } from "../../src/api/document/document.upload.middleware.js";

test("mapDocumentUploadError maps multer file size errors to 413", () => {
  const error = mapDocumentUploadError({
    name: "MulterError",
    code: "LIMIT_FILE_SIZE",
  });

  assert.equal(error.statusCode, 413);
  assert.equal(error.message, "File size exceeds 20MB");
});

test("mapDocumentUploadError maps other multer errors to bad request", () => {
  const error = mapDocumentUploadError({
    name: "MulterError",
    code: "LIMIT_UNEXPECTED_FILE",
  });

  assert.equal(error.statusCode, 400);
  assert.equal(error.message, "Invalid document upload");
});
