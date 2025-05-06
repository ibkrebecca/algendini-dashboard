export const NODE_ENV = process.env.NODE_ENV;

export const STORE_CORS = process.env.STORE_CORS;
export const ADMIN_CORS = process.env.ADMIN_CORS;
export const AUTH_CORS = process.env.AUTH_CORS;
export const JWT_SECRET = process.env.JWT_SECRET;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;

export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_DATABASE = process.env.DB_DATABASE;
export const REDIS_URL = process.env.REDIS_URL;
export const DATABASE_URL =
  `postgres://${DB_USERNAME}:${DB_PASSWORD}` +
  `@${DB_HOST}:${DB_PORT}/${DB_DATABASE}` +
  `${NODE_ENV !== "development" ? "?ssl_mode=require" : ""}`;

export const ADMIN_URL = process.env.ADMIN_URL;
export const ADMIN_DISABLE = process.env.ADMIN_DISABLE;
export const ADMIN_PATH = process.env.ADMIN_PATH;

export const S3_FILE_URL = process.env.S3_FILE_URL;
export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
export const S3_REGION = process.env.S3_REGION;
export const S3_BUCKET = process.env.S3_BUCKET;
export const S3_ENDPOINT = process.env.S3_ENDPOINT;
