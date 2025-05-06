import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import {
  ADMIN_CORS,
  AUTH_CORS,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  NODE_ENV,
  REDIS_URL,
  STORE_CORS,
} from "./src/lib/constants";

loadEnv(NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL!,
    redisUrl: REDIS_URL!,
    databaseDriverOptions: {
      connection: { ssl: { rejectUnauthorized: false } },
      pool: {
        min: 0,
        max: 20,
        acquireTimeoutMillis: 60000,
      },
      idle_in_transaction_session_timeout: 60000,
    },
    // NODE_ENV !== "development"
    //   ? {
    //       connection: { ssl: { rejectUnauthorized: false } },
    //       pool: {
    //         min: 0,
    //         max: 20,
    //         acquireTimeoutMillis: 60000,
    //       },
    //       idle_in_transaction_session_timeout: 60000,
    //     }
    //   : {
    //       pool: {
    //         min: 0,
    //         max: 10,
    //       },
    //     },
    http: {
      storeCors: STORE_CORS!,
      adminCors: ADMIN_CORS!,
      authCors: AUTH_CORS!,
      jwtSecret: JWT_SECRET || "secret",
      cookieSecret: COOKIE_SECRET || "secret",
    },
  },
});
