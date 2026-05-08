import dotenv from "dotenv";
import { cleanEnv, str, port, url, bool } from "envalid";

dotenv.config();

const validators = {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
    desc: "Environment type",
  }),

  PORT: port({ devDefault: 8000 }),

  FRONTEND_URL: url({ desc: "Frontend URL" }),
  BACKEND_URL: url({ desc: "Backend URL" }),

  DATABASE_URI: str({ desc: "MongoDB connection string" }),

  JWT_SECRET_KEY: str({ desc: "JWT secret key" }),
  JWT_SHORT_EXPIRY: str({ desc: "Short JWT expiry" }),
  JWT_LONG_EXPIRY: str({ desc: "Long JWT expiry" }),

  COOKIE_NAME: str(),
  COOKIE_HTTP_ONLY: bool(),
  COOKIE_SAME_SITE: str({
    choices: ["strict", "lax", "none"],
  }),
  COOKIE_PATH: str(),
  COOKIE_SHORT_EXPIRY: str(),
  COOKIE_LONG_EXPIRY: str(),

  EMAIL_HOST: str(),
  EMAIL_SERVICE: str(),
  EMAIL_PORT: port(),
  USER_EMAIL: str(),
  USER_PASSWORD: str(),

  DOCUMENT_STORAGE_PROVIDER: str({
    choices: ["local", "s3"],
    default: "local",
    desc: "Document storage provider",
  }),
  DOCUMENT_LOCAL_ROOT: str({
    default: "uploads/documents",
    desc: "Local document storage root",
  }),

  INGESTION_WORKER_ENABLED: bool({
    default: true,
    desc: "Enable Mongo-backed ingestion worker polling",
  }),
  INGESTION_WORKER_INTERVAL_MS: str({
    default: "5000",
    desc: "Polling interval for the ingestion worker",
  }),
};

export const env = cleanEnv(process.env, validators, {
  reporter: ({ errors }) => {
    const invalidVars = Object.keys(errors);

    if (invalidVars.length) {
      process.stderr.write(
        `Invalid environment variables:\n\n- ${invalidVars.join(
          "\n- ",
        )}\n\nFix them in your .env file.\n`,
      );
      process.exit(1);
    }
  },
});
