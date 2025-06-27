import { defineMiddlewares } from "@medusajs/framework/http";
import { corsMiddleware } from "./middlewares/cors";
import { apiKeyAuth } from "./middlewares/api_key_auth";
import { rateLimit } from "./middlewares/rate_limit";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/products*",
      middlewares: [
        corsMiddleware,
        apiKeyAuth,
        rateLimit(50, 15 * 60 * 1000),
      ],
    },
  ],
});