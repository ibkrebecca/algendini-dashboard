import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { corsMiddleware } from "./middlewares/cors";
import { apiKeyAuth } from "./middlewares/api_key_auth";
import { rateLimit } from "./middlewares/rate_limit";
import { z } from "zod";
import { ResetPasswordRequest } from "./validators";
import { validateScopeProviderAssociation } from "@medusajs/medusa/api/auth/utils/validate-scope-provider-association";
import { validateToken } from "@medusajs/medusa/api/auth/utils/validate-token";
import multer from "multer";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

const upload = multer({ storage: multer.memoryStorage() });
export const GetBrandsSchema = createFindParams();

const general_apis: Array<any> = [
  {
    matcher: "/admin/brands",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(GetBrandsSchema, {
        defaults: ["id", "name", "products.*"],
        isList: true,
      }),
    ],
  },

  {
    matcher: "/admin/products",
    method: ["POST"],
    additionalDataValidator: {
      brand_id: z.string().optional(),
    },
  },

  {
    matcher: "/admin/products/:id",
    method: ["GET", "PUT", "PATCH", "DELETE"],
    middlewares: [
      (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        (req.allowed ??= []).push("brand");
        req.allowed.push("extended_product");
        next();
      },
    ],
  },

  {
    matcher: "/admin/product-categories/:id",
    middlewares: [
      (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        (req.allowed ??= []).push("extended_product_category");
        next();
      },
    ],
  },

  {
    matcher: "/admin/customers/:id",
    middlewares: [
      (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        (req.allowed ??= []).push("extended_customer");
        next();
      },
    ],
  },

  {
    matcher: "/store/upload/single_image",
    method: "POST",
    middlewares: [
      corsMiddleware,
      apiKeyAuth,
      rateLimit(10, 15 * 60 * 1000),
      upload.single("image"),
    ],
  },

  {
    matcher: "/store/xchange/retrieve",
    method: "GET",
    middlewares: [corsMiddleware, apiKeyAuth],
  },

  {
    matcher: "/store/xchange/update",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth],
    additionalDataValidator: {
      id: z.string(),
      usd: z.string(),
      gbp: z.string(),
      eur: z.string(),
      lira: z.string(),
      created_on: z.string().datetime(),
    },
  },
];

const customer_apis: Array<any> = [
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

  {
    matcher: "/store/customers/retrieve",
    method: "GET",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(50, 15 * 60 * 1000)],
    additionalDataValidator: {
      id: z.string(),
    },
  },
];

const product_apis: Array<any> = [
  {
    matcher: "/store/(products|categories)*",
    method: "GET",
    middlewares: [corsMiddleware, apiKeyAuth],
  },

  {
    matcher: "/store/categories/update_image",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(10, 15 * 60 * 1000)],
    additionalDataValidator: {
      id: z.string(),
      url: z.string(),
    },
  },

  {
    matcher: "/store/products/update",
    method: "POST",
    middlewares: [corsMiddleware, apiKeyAuth, rateLimit(15, 15 * 60 * 1000)],
    additionalDataValidator: {
      id: z.string(),
      view_count: z.number().optional(),
      features: z
        .array(z.object({ title: z.string(), value: z.string() }))
        .optional(),
    },
  },
];

export default defineMiddlewares({
  routes: [...general_apis, ...customer_apis, ...product_apis],
});
