import Medusa from "@medusajs/js-sdk";

const IS_PROD = import.meta.env.PROD;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const LOCAL_BACKEND_URL = import.meta.env.VITE_LOCAL_BACKEND_URL;
const BASE_URL = IS_PROD ? BACKEND_URL : LOCAL_BACKEND_URL;

export const sdk = new Medusa({
  baseUrl: BASE_URL,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
});
