import { defineMiddlewares } from "@medusajs/framework/http";
import { corsMiddleware } from "./middlewares/cors";
import { apiKeyAuth } from "./middlewares/api_key_auth";
import { rateLimit } from "./middlewares/rate_limit";
import { z } from "zod";

const blockedPaths = ["/admin", "/store"];
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/(products|categories|customers)*",
      method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      middlewares: [
        (req, res, next) => {
          const isBlocked = blockedPaths.some((p) => req.path.startsWith(p));

          if (isBlocked) {
            return res.status(404).json({
              error: "Not Found",
              message: "The requested resource was not found",
            });
          }

          next();
        },
      ],
    },

    {
      matcher: "/api/store/(products|categories)*",
      method: ["GET"],
      middlewares: [corsMiddleware, apiKeyAuth, rateLimit(50, 15 * 60 * 1000)],
    },

    {
      matcher: "/api/store/customers/register",
      method: "POST",
      middlewares: [corsMiddleware, apiKeyAuth, rateLimit(50, 15 * 60 * 1000)],
      additionalDataValidator: {
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        first_name: z.string(),
        last_name: z.string(),
        phone: z.string(),
        dob: z.string().datetime(),
        gender: z.enum(["male", "female"]),
        is_admin: z.boolean().default(false),
        is_driver: z.boolean().default(false),
      },
    },
  ],
});
