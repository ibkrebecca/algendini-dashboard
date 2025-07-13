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
} from "./src/lib/constants";

loadEnv(NODE_ENV || "development", process.cwd());

const localDbUrl = "postgres://algendini:0000@localhost:5400/algendini";
const databaseUrl = IS_PROD ? DATABASE_URL! : localDbUrl;
const getConnection = () => {
  if (IS_PROD) return { connection: { ssl: { rejectUnauthorized: false } } };
  return { connection: { ssl: false } };
};

const getEmailPass = () => {
  if (IS_PROD) return {};

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

const getExtendedModel = () => {
  return [
    {
      resolve: "./src/modules/customer",
    },
    {
      resolve: "./src/modules/product",
    },
    {
      resolve: "./src/modules/product_category",
    },
  ];
};
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: databaseUrl,
    redisUrl: REDIS_URL || "redis://localhost:6379",
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
      storeCors: STORE_CORS || "http://localhost:8000",
      adminCors: ADMIN_CORS || "http://localhost:9000",
      authCors: AUTH_CORS || "http://localhost:9000",
      jwtSecret: JWT_SECRET || "supersecret",
      cookieSecret: COOKIE_SECRET || "supersecret",
      jwtExpiresIn: JWT_EXPIRES_IN || "7d",
    },
  },
  modules: [getEmailPass(), getBucket(), getSendEmail(), ...getExtendedModel()],
});
