import assert from "node:assert/strict";
import test from "node:test";

import { DocumentModel } from "../../src/api/document/document.model.js";

test("document model uses PascalCase name with explicit documents collection", () => {
  assert.equal(DocumentModel.modelName, "Document");
  assert.equal(DocumentModel.collection.name, "documents");
});

test("document schema tracks required metadata and lifecycle status", () => {
  const paths = DocumentModel.schema.paths;

  assert.equal(paths.originalFileName.isRequired, true);
  assert.equal(paths.storedFileName.isRequired, true);
  assert.equal(paths.fileType.isRequired, true);
  assert.equal(paths.fileSize.isRequired, true);
  assert.equal(paths.uploadedBy.isRequired, true);
  assert.equal(paths.storageProvider.isRequired, true);
  assert.equal(paths.checksumHash.isRequired, true);
  assert.equal(paths.storageKey.isRequired, true);
  assert.equal(paths.status.defaultValue, "uploaded");
  assert.deepEqual(paths.status.enumValues, [
    "uploaded",
    "processing",
    "processed",
    "failed",
  ]);
  assert.equal(paths.uploadedBy.options.ref, "User");
});

test("document schema enforces per-user checksum uniqueness", () => {
  const indexes = DocumentModel.schema.indexes();

  assert.ok(
    indexes.some(
      ([fields, options]) =>
        fields.uploadedBy === 1 &&
        fields.checksumHash === 1 &&
        options.unique === true,
    ),
  );
});
