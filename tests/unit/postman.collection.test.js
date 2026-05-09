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
const flattenRequests = (items, folder = "") =>
  items.flatMap((item) => {
    const itemFolder = folder ? `${folder}/${item.name}` : item.name;
    if (item.item) return flattenRequests(item.item, itemFolder);
    return [
      {
        folder,
        name: item.name,
        method: item.request.method,
        rawUrl: item.request.url.raw,
      },
    ];
  });

const requests = flattenRequests(collection.item);
const routeKeys = requests.map(
  ({ method, rawUrl }) =>
    `${method} ${rawUrl.replace("{{BASE_URL}}", "").split("?")[0]}`,
);

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

test("postman collection mirrors current API route modules", () => {
  assert.deepEqual(routeKeys, [
    "GET /health",
    "GET /health/details",
    "POST /api/v1/auth/signup",
    "POST /api/v1/auth/signin",
    "POST /api/v1/auth/signout",
    "POST /api/v1/auth/forgot-password",
    "PATCH /api/v1/auth/reset-password",
    "POST /api/v1/email/send-verification-email",
    "GET /api/v1/email/verify-email/{{VERIFICATION_TOKEN}}",
    "POST /api/v1/otp/send",
    "POST /api/v1/otp/verify",
    "GET /api/v1/users/me",
    "PATCH /api/v1/users/me",
    "DELETE /api/v1/users/me",
    "POST /api/v1/documents/upload",
    "GET /api/v1/documents",
    "GET /api/v1/documents/{{DOCUMENT_ID}}",
    "DELETE /api/v1/documents/{{DOCUMENT_ID}}",
    "GET /api/v1/notifications/me",
    "PATCH /api/v1/notifications/{{NOTIFICATION_ID}}",
    "POST /api/v1/ingestion/jobs",
    "GET /api/v1/ingestion/jobs",
    "GET /api/v1/ingestion/jobs/{{INGESTION_JOB_ID}}",
    "POST /api/v1/ingestion/jobs/{{INGESTION_JOB_ID}}/retry",
    "GET /api/v1/ai/usage",
    "POST /api/v1/conversations",
    "GET /api/v1/conversations",
    "POST /api/v1/conversations/{{CONVERSATION_ID}}/messages",
    "GET /api/v1/conversations/{{CONVERSATION_ID}}/messages",
  ]);
});

test("postman collection removed stale user-id based routes", () => {
  const rawUrls = JSON.stringify(collection);
  assert.doesNotMatch(rawUrls, /\/api\/v1\/users\/\{\{USER_ID\}\}/);
  assert.doesNotMatch(rawUrls, /\/api\/v1\/notifications\/\{\{USER_ID\}\}/);
});
