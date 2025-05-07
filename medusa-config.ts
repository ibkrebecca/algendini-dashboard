import { loadEnv, defineConfig } from "@medusajs/framework/utils";

// Pull in your constants from process.env
import {
  NODE_ENV,
  DATABASE_URL,
  REDIS_URL,
  ADMIN_CORS,
  AUTH_CORS,
  STORE_CORS,
  MEDUSA_BACKEND_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  COOKIE_SECRET,
  S3_FILE_URL,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_REGION,
  S3_BUCKET,
  S3_ENDPOINT,
  MEDUSA_ADMIN_BACKEND_URL,
} from "./src/lib/constants";

// Load .env
loadEnv(NODE_ENV || "development", process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL!,
    redisUrl: REDIS_URL!,
    databaseLogging: true,
    databaseDriverOptions: {
      connection: { ssl: { rejectUnauthorized: false } },
      pool: { min: 0, max: 20, acquireTimeoutMillis: 60000 },
      idle_in_transaction_session_timeout: 60000,
    },
    http: {
      // Must exactly match the comma‐separated ADMIN_CORS / AUTH_CORS / STORE_CORS
      adminCors: ADMIN_CORS!,
      authCors: AUTH_CORS!,
      storeCors: STORE_CORS!,
      jwtSecret: JWT_SECRET!,
      jwtExpiresIn: JWT_EXPIRES_IN!,
      cookieSecret: COOKIE_SECRET!,
    },
  },

  // Admin UI settings
  admin: {
    disable: false,
    // This must point at your API, not at itself
    backendUrl:
      MEDUSA_ADMIN_BACKEND_URL || MEDUSA_BACKEND_URL || "http://localhost:9000",
    // Serving path for the Admin UI (root in PROD)
    path: NODE_ENV === "development" ? "/app" : "/",
  },

  // Your S3 (DigitalOcean Spaces) provider
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: S3_FILE_URL,
              access_key_id: S3_ACCESS_KEY_ID,
              secret_access_key: S3_SECRET_ACCESS_KEY,
              region: S3_REGION,
              bucket: S3_BUCKET,
              endpoint: S3_ENDPOINT,
            },
          },
        ],
      },
    },
  ],
});
