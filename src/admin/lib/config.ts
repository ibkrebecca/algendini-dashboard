import Medusa from "@medusajs/js-sdk";

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;

export const sdk = new Medusa({
  baseUrl: ADMIN_URL,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
});
