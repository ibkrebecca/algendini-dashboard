import Medusa from "@medusajs/js-sdk";

const IS_PROD = import.meta.env.PROD;
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;
const LOCAL_ADMIN_URL = import.meta.env.VITE_LOCAL_ADMIN_URL;
const BASE_URL = IS_PROD ? ADMIN_URL : LOCAL_ADMIN_URL;

export const sdk = new Medusa({
  baseUrl: BASE_URL,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
});
