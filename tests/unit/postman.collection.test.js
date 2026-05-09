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
const collectionJson = JSON.stringify(collection);
const variableReferences = [
  ...new Set(
    [...collectionJson.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]),
  ),
].sort();
const removedFieldPattern = new RegExp(["user", "name"].join(""), "i");

test("postman collection documents AI persistence and ingestion endpoints", () => {
  assert.ok(folderNames.includes("Ingestion"));
  assert.ok(folderNames.includes("AI Usage"));
  assert.ok(folderNames.includes("Conversations"));

  const rawUrls = collectionJson;
  assert.match(rawUrls, /\/api\/v1\/ingestion\/jobs/);
  assert.match(
    rawUrls,
    /\/api\/v1\/ingestion\/jobs\/68872978782a7467070c8ec6\/retry/,
  );
  assert.match(rawUrls, /\/api\/v1\/ai\/usage/);
  assert.match(rawUrls, /\/api\/v1\/conversations/);
  assert.match(
    rawUrls,
    /\/api\/v1\/conversations\/68872978782a7467070c8ec7\/messages/,
  );
});

test("postman collection uses only BASE_URL as a variable", () => {
  assert.deepEqual(collection.variable, [
    {
      key: "BASE_URL",
      value: "http://localhost:8000",
      type: "string",
    },
  ]);

  assert.deepEqual(variableReferences, ["BASE_URL"]);
  assert.ok(requests.every(({ rawUrl }) => rawUrl.startsWith("{{BASE_URL}}")));
  assert.doesNotMatch(
    collectionJson,
    /pm\.(?:collectionVariables|environment|globals)\./,
  );
});

test("postman collection omits removed identity fields", () => {
  assert.doesNotMatch(collectionJson, removedFieldPattern);
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
    "GET /api/v1/email/verify-email/sample-verification-token",
    "POST /api/v1/otp/send",
    "POST /api/v1/otp/verify",
    "GET /api/v1/users/me",
    "PATCH /api/v1/users/me",
    "DELETE /api/v1/users/me",
    "POST /api/v1/documents/upload",
    "GET /api/v1/documents",
    "GET /api/v1/documents/68872978782a7467070c8ec5",
    "DELETE /api/v1/documents/68872978782a7467070c8ec5",
    "GET /api/v1/notifications/me",
    "PATCH /api/v1/notifications/68872978782a7467070c8ec4",
    "POST /api/v1/ingestion/jobs",
    "GET /api/v1/ingestion/jobs",
    "GET /api/v1/ingestion/jobs/68872978782a7467070c8ec6",
    "POST /api/v1/ingestion/jobs/68872978782a7467070c8ec6/retry",
    "GET /api/v1/ai/usage",
    "POST /api/v1/conversations",
    "GET /api/v1/conversations",
    "POST /api/v1/conversations/68872978782a7467070c8ec7/messages",
    "GET /api/v1/conversations/68872978782a7467070c8ec7/messages",
  ]);
});

test("postman collection removed stale user-id based routes", () => {
  const rawUrls = collectionJson;
  assert.doesNotMatch(rawUrls, /\/api\/v1\/users\/\{\{USER_ID\}\}/);
  assert.doesNotMatch(rawUrls, /\/api\/v1\/notifications\/\{\{USER_ID\}\}/);
});
