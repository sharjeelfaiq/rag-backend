# MERN Backend Starter

## Overview

MERN Backend Starter is a Node.js and Express backend template using ES modules, MongoDB through Mongoose, feature-oriented API modules, centralized runtime configuration, Swagger documentation, email templates, cookie-based JWT authentication, file upload support through Cloudinary storage, and a small Node test suite.

This README reflects the current repository state, including known limitations and technical debt. It should be treated as the source of truth for local setup, available commands, architecture, and current production-readiness gaps.

## Features

- Express 4 API server with versioned routes under `/api/v1`.
- MongoDB connection through Mongoose.
- Feature modules for auth, email verification, OTP, health, notifications, and users.
- Layered route -> controller -> service -> repository -> model flow for most modules.
- JWT authentication stored in an HTTP cookie.
- Role guard middleware for selected protected routes.
- Joi request validation on selected auth routes.
- Email delivery through Nodemailer and HTML templates in `src/views`.
- Cloudinary-backed `multer` storage for avatar uploads.
- Swagger UI mounted at `/api-docs`.
- Postman collection included in `Generic Backend API.postman_collection.json`.
- ESLint, Prettier, and Node's built-in test runner.

Current limitations are documented in [Known Issues](#known-issues).

## Tech Stack

- Runtime: Node.js with ES modules
- Server: Express
- Database: MongoDB with Mongoose
- Validation: Joi
- Environment validation: dotenv and envalid
- Authentication: JSON Web Tokens and cookie-parser
- Password hashing: bcryptjs
- Email: Nodemailer
- Uploads: multer, multer-storage-cloudinary, Cloudinary
- Logging: Winston and Morgan
- API docs: swagger-jsdoc and swagger-ui-express
- Testing: `node:test` and `node:assert`
- Tooling: ESLint 9 and Prettier 3

Installed but not currently applied in global middleware:

- `helmet`
- `compression`
- `express-mongo-sanitize`
- `express-rate-limit`
- `xss-clean`

## Project Structure

```text
.
  src/
    app.js                         # Application bootstrap: DB connect, middleware, routes, listen
    api/
      index.js                     # Root API router and /api/v1 route mounting
      auth/                        # Signup, signin, signout, password reset
      email/                       # Verification email send/verify flows
      health/                      # Basic and detailed health checks
      notification/                # Notification list/update feature
      otp/                         # OTP send/verify feature
      user/                        # User read/update/delete feature
    config/
      env.config.js                # Validated environment configuration
      swagger.config.js            # Swagger/OpenAPI configuration
    lib/                           # Shared helpers: database, tokens, cookies, email, files, logging
    middlewares/                   # Global, auth, upload, and validation middleware
    server/
      app.js                       # Express and HTTP server instances
      sockets.js                   # Socket.IO setup module, currently not imported by bootstrap
    views/                         # HTML email templates
  swagger/
    api.swagger.yaml               # OpenAPI route definitions
  tests/
    helpers/
    integration/
    unit/
  .env.example
  eslint.config.js
  nodemon.json
  package.json
```

Architecture

The intended request flow is:

```text
routes -> controllers -> services -> repositories -> models
```

- Routes define URL paths, route-level middleware, DTO validation where present, and controller handlers.
- Controllers translate Express request/response objects and delegate business work to services.
- Services contain business rules, orchestration, token handling, email workflows, file workflows, and repository calls.
- Repositories isolate persistence operations against Mongoose models.
- Models define stored document shape, indexes, defaults, and database validation.
- Shared middleware handles parsing, CORS, cookies, Swagger UI, 404 responses, and centralized error responses.

Known deviations:

- `health.service.js` directly checks `mongoose.connection` instead of using a data/provider abstraction.
- Some routes do not yet use DTO validation.
- Socket.IO setup exists in `src/server/sockets.js` but is not imported by `src/app.js`, so it is not active at runtime.
- Some repository update methods use `upsert: true`, which can create records during update flows.

## Prerequisites

- Node.js 18 or newer; Node.js 20 or newer is recommended.
- npm.
- A running MongoDB instance.
- SMTP credentials for email flows.
- Cloudinary account credentials for avatar upload flows.
- Optional: Postman or another API client.

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Edit `.env` with local values.
4. Start MongoDB locally or update `DATABASE_URI` to point to an accessible MongoDB server.

## Environment Setup

Environment variables are loaded by `dotenv` and validated in `src/config/env.config.js` with `envalid`.

| Variable                | Current validator | Expected value                                                             | Example                                          |
| ----------------------- | ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| `NODE_ENV`              | string enum       | `development`, `test`, or `production`                                     | `development`                                    |
| `PORT`                  | port              | HTTP port                                                                  | `8000`                                           |
| `FRONTEND_URL`          | url               | Frontend application URL                                                   | `http://localhost:3000`                          |
| `BACKEND_URL`           | url               | Backend base URL                                                           | `http://localhost:8000`                          |
| `DATABASE_URI`          | string            | MongoDB connection string                                                  | `mongodb://127.0.0.1:27017/mern-backend-starter` |
| `JWT_SECRET_KEY`        | string            | JWT signing secret                                                         | `change_me`                                      |
| `JWT_SHORT_EXPIRY`      | string            | Short JWT expiry accepted by `jsonwebtoken`                                | `15m`                                            |
| `JWT_LONG_EXPIRY`       | string            | Long JWT expiry accepted by `jsonwebtoken`                                 | `7d`                                             |
| `COOKIE_NAME`           | string            | Auth cookie name                                                           | `access_token`                                   |
| `COOKIE_HTTP_ONLY`      | boolean           | Whether cookie is HTTP-only                                                | `true`                                           |
| `COOKIE_SAME_SITE`      | string enum       | `strict`, `lax`, or `none`                                                 | `lax`                                            |
| `COOKIE_PATH`           | string            | Cookie path                                                                | `/`                                              |
| `COOKIE_SHORT_EXPIRY`   | string            | Milliseconds used as cookie `maxAge`                                       | `900000`                                         |
| `COOKIE_LONG_EXPIRY`    | string            | Milliseconds used as cookie `maxAge`                                       | `604800000`                                      |
| `EMAIL_HOST`            | string            | SMTP host                                                                  | `smtp.example.com`                               |
| `EMAIL_SERVICE`         | string            | Email service label; currently validated but not used by transporter setup | `example`                                        |
| `EMAIL_PORT`            | port              | SMTP port                                                                  | `587`                                            |
| `USER_EMAIL`            | string            | SMTP username/from address                                                 | `dummy@example.com`                              |
| `USER_PASSWORD`         | string            | SMTP password                                                              | `dummy_email_password`                           |
| `CLOUDINARY_CLOUD_NAME` | string            | Cloudinary cloud name                                                      | `dummy_cloud_name`                               |
| `CLOUDINARY_API_KEY`    | string            | Cloudinary API key                                                         | `dummy_api_key`                                  |
| `CLOUDINARY_API_SECRET` | string            | Cloudinary API secret                                                      | `dummy_api_secret`                               |

Important notes:

- Application code should import `env` from `#config/env.config.js` instead of reading `process.env` directly.
- Cookie expiry values are currently validated as strings, although Express `maxAge` expects milliseconds. They should contain numeric millisecond strings until the config layer is tightened.
- In `authController.signin`, `maxAge` is currently removed when setting the cookie, so remember-me duration is not applied.

## Running Locally

Start the development server with nodemon:

```bash
npm run dev
```

Start the server without nodemon:

```bash
npm start
```

Default local URLs with the provided example env:

- API root: `http://localhost:8000/`
- API v1 base: `http://localhost:8000/api/v1`
- Swagger UI: `http://localhost:8000/api-docs`

The root `/` endpoint returns:

```json
{ "status": "OK" }
```

## Scripts

| Script                 | Command                                                        | Purpose                                                |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| `npm run dev`          | `nodemon src/app.js`                                           | Start local development server with automatic restart. |
| `npm start`            | `node src/app.js`                                              | Start server normally.                                 |
| `npm run lint`         | `eslint "./**/*.js"`                                           | Run ESLint against JavaScript files.                   |
| `npm run format`       | `prettier --write "./**/*.{js,jsx,html,yaml,env,md,json,txt}"` | Format supported files.                                |
| `npm run format:check` | `prettier --check "./**/*.{js,jsx,html,yaml,env,md,json,txt}"` | Check formatting without writing files.                |
| `npm test`             | `node --test`                                                  | Run the test suite.                                    |

## API Documentation

Swagger UI is mounted at:

```text
GET /api-docs
```

The OpenAPI source file is:

```text
swagger/api.swagger.yaml
```

The repository also includes:

```text
Generic Backend API.postman_collection.json
```

Implemented route groups:

- `GET /health`
- `GET /health/details`
- `/api/v1/auth`
- `/api/v1/email`
- `/api/v1/otp`
- `/api/v1/users`
- `/api/v1/notifications`

Protected route groups use the `verifyAccessToken` middleware where mounted in `src/api/index.js`.

## Security Notes

Current security behavior:

- JWTs are signed with `JWT_SECRET_KEY`.
- Auth token is stored in a cookie named by `COOKIE_NAME`.
- Cookie options are centralized in `src/lib/cookie.lib.js`.
- Passwords are hashed with bcryptjs.
- CORS is enabled globally.
- Request body parsing is enabled globally.
- Centralized error middleware returns JSON error responses.

Security gaps to address before production:

- CORS currently uses `origin: true` with credentials, which reflects arbitrary origins. Restrict this to configured allowed frontend origins.
- Installed middleware packages `helmet`, `compression`, `express-mongo-sanitize`, `express-rate-limit`, and `xss-clean` are not currently applied.
- Some mutation routes do not have DTO validation.
- Error responses include a `stack` key in all environments, with a placeholder outside development. Production responses should omit stack details entirely.
- Cookie `maxAge` is removed on sign-in, so configured cookie duration is not enforced.
- Sign-out validates the token but does not maintain a token denylist; JWTs remain valid until expiry unless the client removes the cookie.
- CSRF protection is not implemented.
- Upload handling should validate file type and ownership before storing assets.

## Known Issues

- `signinDto` allows `username`, but `authService.signin` only looks up users by `email`.
- The user model does not define a `username` field.
- `forgotPasswordDto` exists but is not wired to `/forgot-password`.
- `/reset-password`, email routes, and OTP routes do not currently use DTO validation.
- `userRepository.updateUserById`, `updateUserByEmail`, and `updateUserPasswordByEmail` use `upsert: true`.
- User model is registered as `model("users", UserSchema)`, while notification references use `ref: "User"`.
- Model naming is inconsistent across `users`, `otps`, and `Notification`.
- `src/server/sockets.js` exports a Socket.IO instance, but nothing imports it during startup.
- `src/lib/file.lib.js` uses synchronous filesystem operations.
- `userService.updateById` attempts to delete old profile pictures from a local `public` path even though uploads use Cloudinary and no `public/` folder exists.
- Health service accesses Mongoose directly.
- Test coverage is present but limited.

## Testing

Run tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Run formatting check:

```bash
npm run format:check
```

Current test files:

- `tests/unit/promise.lib.test.js`
- `tests/unit/email.service.test.js`
- `tests/integration/auth.routes.test.js`
- `tests/integration/user.controller.test.js`

Current test limitations:

- Tests use Node's built-in test runner and manual mocks.
- There is no full database integration test harness.
- There is no authentication flow test that signs up, verifies, signs in, and accesses protected routes end to end.
- There is no upload test coverage.
- There is no socket test coverage.
- There is no CI configuration in the repository.

## Deployment

No deployment configuration is currently included.

Before deploying:

- Set `NODE_ENV=production`.
- Use production MongoDB, SMTP, Cloudinary, frontend, and backend values.
- Replace dummy secrets from `.env.example`.
- Restrict CORS origins.
- Apply production security middleware.
- Confirm cookie settings for HTTPS, same-site policy, domain, and lifetime.
- Confirm Swagger exposure is acceptable for the target environment.
- Add process management or platform configuration for the selected host.
- Add CI checks for lint, format, and tests.

Common production start command:

```bash
npm start
```

## Contributing

1. Keep feature code organized by module under `src/api/<feature>`.
2. Preserve the route -> controller -> service -> repository -> model boundary.
3. Do not add database calls directly in routes or controllers.
4. Add or update DTO validation for new request bodies.
5. Add tests for changed behavior.
6. Run lint, format check, and tests before submitting changes.

Recommended local verification:

```bash
npm run lint
npm run format:check
npm test
```

## License

ISC. See `LICENSE`.
