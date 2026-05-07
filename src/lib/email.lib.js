import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import createError from "http-errors";
import path, { dirname, join } from "path";
import { readFile, access, constants } from "fs/promises";

import { logger } from "./logger.lib.js";
import { env } from "#config/env.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VIEWS_DIRECTORY = path.join(__dirname, "../views");
const { NODE_ENV, EMAIL_HOST, EMAIL_PORT, USER_EMAIL, USER_PASSWORD } = env;

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465, // Set true for SSL (465), false for TLS (587)
    auth: { user: USER_EMAIL, pass: USER_PASSWORD },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    sendTimeout: 30000,
  });

  return transporter;
};

// Supported email types
const SUPPORTED_HTML_TEMPLATES = [
  "otp-email",
  "reset-password",
  "verification-email",
  "verification-success",
];

// In-memory template cache
const templateCache = new Map();

// Escape HTML special characters
const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// Read template with caching
const getEmailTemplate = async (type) => {
  const cacheKey = `${type}/index.html`;
  if (templateCache.has(cacheKey)) return templateCache.get(cacheKey);

  const filePath = join(VIEWS_DIRECTORY, type, "index.html");
  try {
    await access(filePath, constants.R_OK);
    const template = await readFile(filePath, "utf-8");
    templateCache.set(cacheKey, template);
    return template;
  } catch (error) {
    throw createError(
      500,
      `Failed to load email template "${type}/index.html": ${error.message}`,
    );
  }
};

// Replace variables in template
const processTemplate = (template, variables) => {
  let processed = template;

  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(
      new RegExp(`\\$\\{${key}\\}`, "g"),
      escapeHtml(String(value)),
    );
  }
  const unmatched = processed.match(/\$\{.+?\}/g);
  if (unmatched) logger.warn("Unmatched template variables:", unmatched);
  return processed;
};

// Send email via transporter
const sendMail = async ({ to, subject, html }) => {
  try {
    return await getTransporter().sendMail({
      from: USER_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    if (NODE_ENV !== "production") logger.error("[Email Send Error]", error);
    throw createError(500, "Failed to send email.");
  }
};

// Main function to send email
export const sendEmail = async (type, options) => {
  if (!SUPPORTED_HTML_TEMPLATES.includes(type)) {
    throw createError(
      400,
      `Invalid email type: "${type}". Supported types: ${SUPPORTED_HTML_TEMPLATES.join(", ")}`,
    );
  }

  const { email, subject, ...variables } = options;
  if (!email || !subject)
    throw createError(400, "Email and subject are required.");

  const template = await getEmailTemplate(type);
  const html = processTemplate(template, { ...variables, email });

  return sendMail({ to: email, subject, html });
};
