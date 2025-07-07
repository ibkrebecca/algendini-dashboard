import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import { corsMiddleware } from "./middlewares/cors";
import { apiKeyAuth } from "./middlewares/api_key_auth";
import { rateLimit } from "./middlewares/rate_limit";
import { z } from "zod";
import { ResetPasswordRequest } from "./validators";
import { validateScopeProviderAssociation } from "@medusajs/medusa/api/auth/utils/validate-scope-provider-association";
import { validateToken } from "@medusajs/medusa/api/auth/utils/validate-token";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const customer_apis: Array<any> = [
  {
    matcher: "/store/customers/avatar",
    method: "POST",
    middlewares: [
      corsMiddleware,
      apiKeyAuth,
      rateLimit(10, 15 * 60 * 1000),
      upload.single("avatar"),
    ],
  },

  {
    matcher: "/store/customers/register",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(10, 15 * 60 * 1000)],
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

  {
    matcher: "/store/customers/signin",
    method: "POST",
    middlewares: [
      corsMiddleware,
      apiKeyAuth,
      rateLimit(10, 15 * 60 * 1000),
      validateScopeProviderAssociation(),
    ],
  },

  {
    matcher: "/store/customers/update",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(15, 15 * 60 * 1000)],
    additionalDataValidator: {
      id: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      dob: z.string().datetime().optional(),
      gender: z.enum(["male", "female"]).optional(),
      is_admin: z.boolean().optional(),
      is_driver: z.boolean().optional(),
    },
  },

  {
    matcher: "/store/customers/retrieve",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(50, 15 * 60 * 1000)],
    additionalDataValidator: {
      id: z.string(),
    },
  },

  {
    matcher: "/store/customers/delete",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(5, 15 * 60 * 1000)],
    additionalDataValidator: {
      id: z.string(),
    },
  },

  {
    matcher: "/store/customers/reset_password",
    method: "POST",
    middlewares: [
      corsMiddleware,
      apiKeyAuth,
      rateLimit(10, 15 * 60 * 1000),
      validateAndTransformBody(ResetPasswordRequest),
    ],
  },

  {
    matcher: "/store/customers/reset_password_confirm",
    method: "POST",
    middlewares: [
      corsMiddleware,
      apiKeyAuth,
      rateLimit(10, 15 * 60 * 1000),
      validateScopeProviderAssociation(),
      validateToken(),
    ],
  },
];

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/(products|categories)*",
      method: ["GET"],
      middlewares: [corsMiddleware, apiKeyAuth, rateLimit(50, 15 * 60 * 1000)],
    },

    ...customer_apis,
  ],
});
