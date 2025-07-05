import { defineMiddlewares } from "@medusajs/framework/http";
import { corsMiddleware } from "./middlewares/cors";
import { apiKeyAuth } from "./middlewares/api_key_auth";
import { rateLimit } from "./middlewares/rate_limit";
import { z } from "zod";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/(products|categories)*",
      method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      middlewares: [
        (req, res, next) => {
          // block only specific API endpoints that we've moved to /api/admin/
          const blockedPaths = ["/admin/products", "/admin/categories"];
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
      matcher: "/api/admin/(products|categories)*",
      method: ["GET"],
      middlewares: [corsMiddleware, apiKeyAuth, rateLimit(50, 15 * 60 * 1000)],
    },

    // {
    //   method: "POST",
    //   matcher: "/api/store/customers/register",
    //   additionalDataValidator: {
    //     dob: z.string().datetime().optional(),
    //     gender: z.enum(["male", "female"]).optional(),
    //     is_admin: z.boolean().default(false),
    //     is_driver: z.boolean().default(false),
    //   },
    // },
  ],
});
