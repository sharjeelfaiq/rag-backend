import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const collection = JSON.parse(
  fs.readFileSync(
    new URL("../../RAG Backend API.postman_collection.json", import.meta.url),
    "utf8",
  ),
);

const folderNames = collection.item.map((item) => item.name);

test("postman collection documents AI persistence and ingestion endpoints", () => {
  assert.ok(folderNames.includes("Ingestion"));
  assert.ok(folderNames.includes("AI Usage"));
  assert.ok(folderNames.includes("Conversations"));

  const rawUrls = JSON.stringify(collection);
  assert.match(rawUrls, /\/api\/v1\/ingestion\/jobs/);
  assert.match(
    rawUrls,
    /\/api\/v1\/ingestion\/jobs\/\{\{INGESTION_JOB_ID\}\}\/retry/,
  );
  assert.match(rawUrls, /\/api\/v1\/ai\/usage/);
  assert.match(rawUrls, /\/api\/v1\/conversations/);
  assert.match(
    rawUrls,
    /\/api\/v1\/conversations\/\{\{CONVERSATION_ID\}\}\/messages/,
  );
});
