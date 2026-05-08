import assert from "node:assert/strict";
import test from "node:test";

import {
  computeSha256,
  createStoredFileName,
  validateDocumentFile,
} from "../../src/api/document/document.validation.js";

const file = (overrides) => ({
  originalname: "sample.pdf",
  mimetype: "application/pdf",
  size: 12,
  buffer: Buffer.from("%PDF-1.7\ncontent"),
  ...overrides,
});

test("computeSha256 returns a deterministic sha256 hex digest", () => {
  assert.equal(
    computeSha256(Buffer.from("rag-document")),
    "bd063b78b85fd662be1d30c15a7213a370576f1cbb5cc9c48adc67cd06d19961",
  );
});

test("validateDocumentFile accepts pdf, docx, txt, and markdown files", () => {
  assert.equal(validateDocumentFile(file()).fileType, "pdf");
  assert.equal(
    validateDocumentFile(
      file({
        originalname: "notes.txt",
        mimetype: "text/plain",
        buffer: Buffer.from("plain text"),
      }),
    ).fileType,
    "txt",
  );
  assert.equal(
    validateDocumentFile(
      file({
        originalname: "readme.md",
        mimetype: "text/markdown",
        buffer: Buffer.from("# Heading"),
      }),
    ).fileType,
    "md",
  );
  assert.equal(
    validateDocumentFile(
      file({
        originalname: "document.docx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: Buffer.concat([
          Buffer.from("PK"),
          Buffer.from("[Content_Types].xml word/"),
        ]),
      }),
    ).fileType,
    "docx",
  );
});

test("validateDocumentFile rejects mismatched extension and mime type", () => {
  assert.throws(
    () =>
      validateDocumentFile(
        file({ originalname: "sample.pdf", mimetype: "text/plain" }),
      ),
    /File type is not allowed/,
  );
});

test("validateDocumentFile rejects binary text content", () => {
  assert.throws(
    () =>
      validateDocumentFile(
        file({
          originalname: "notes.txt",
          mimetype: "text/plain",
          buffer: Buffer.from([0x48, 0x00, 0x49]),
        }),
      ),
    /File content does not match/,
  );
});

test("validateDocumentFile rejects files over 20MB", () => {
  assert.throws(
    () => validateDocumentFile(file({ size: 20 * 1024 * 1024 + 1 })),
    /File size exceeds 20MB/,
  );
});

test("createStoredFileName keeps extension and avoids original name reuse", () => {
  const storedFileName = createStoredFileName({
    originalFileName: "Quarterly Report.pdf",
    checksumHash: "abcdef1234567890",
  });

  assert.match(storedFileName, /^abcdef1234567890-[\w-]+\.pdf$/);
  assert.notEqual(storedFileName, "Quarterly Report.pdf");
});
