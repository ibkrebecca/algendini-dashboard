import {
  loadEnv,
  defineConfig,
  Modules,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import {
  ADMIN_CORS,
  AUTH_CORS,
  COOKIE_SECRET,
  DATABASE_URL,
  IS_PROD,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NODE_ENV,
  REDIS_URL,
  S3_ACCESS_KEY_ID,
  S3_BUCKET,
  S3_ENDPOINT,
  S3_FILE_URL,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
  SENDGRID_API_KEY,
  SENDGRID_FROM,
  STORE_CORS,
} from "@/lib/env";
import path from "path";

loadEnv(NODE_ENV || "development", process.cwd());

const getConnection = () => {
  if (IS_PROD) return { connection: { ssl: { rejectUnauthorized: false } } };
  return { connection: { ssl: false } };
};

const getEmailPass = () => {
  return {
    resolve: "@medusajs/medusa/auth",
    dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/auth-emailpass",
          id: "emailpass",
          options: {
            actor_type: "customer",
          },
        },
      ],
    },
  };
};

const getBucket = () => {
  if (IS_PROD) {
    return {
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
    };
  }

  return {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-local",
          id: "local",
          options: {},
        },
      ],
    },
  };
};

const getSendEmail = () => {
  return {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/notification-sendgrid",
          id: "sendgrid",
          options: {
            channels: ["email"],
            api_key: SENDGRID_API_KEY,
            from: SENDGRID_FROM,
          },
        },
      ],
    },
  };
};

const getCustomModel = () => {
  return [
    {
      resolve: "@medusajs/index",
    },
    {
      resolve: "./src/modules/customer",
    },
    {
      resolve: "./src/modules/product",
    },
    {
      resolve: "./src/modules/product_category",
    },
    {
      resolve: "./src/modules/xchange",
    },
    {
      resolve: "./src/modules/brand",
    },
  ];
};

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    redisUrl: REDIS_URL,
    databaseLogging: true,
    redisOptions: {
      maxRetriesPerRequest: 20,
      lazyConnect: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
    },
    databaseDriverOptions: {
      ...getConnection(),
      idle_in_transaction_session_timeout: 60000,
      pool: {
        min: 0,
        max: 20,
        acquireTimeoutMillis: 60000,
      },
    },
    http: {
      storeCors: STORE_CORS!,
      adminCors: ADMIN_CORS!,
      authCors: AUTH_CORS!,
      jwtSecret: JWT_SECRET!,
      cookieSecret: COOKIE_SECRET!,
      jwtExpiresIn: JWT_EXPIRES_IN!,
    },
  },
  admin: {
    vite: () => ({
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src/admin"),
        },
      },
    }),
  },
  modules: [getEmailPass(), getBucket(), getSendEmail(), ...getCustomModel()],
});
