import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { z } from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetBrandsSchema = createFindParams().extend({
  q: z.string().optional(),
  id: z.string().optional(),
});

const customerApis: Array<any> = [
  {
    matcher: "/admin/customers/:id",
    middlewares: [
      (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        (req.allowed ??= []).push("extended_customer");
        next();
      },
    ],
  },
];

const productApis: Array<any> = [
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
];

const BrandApis: Array<any> = [
  {
    matcher: "/admin/brands/retrieve",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(GetBrandsSchema, {
        defaults: ["id", "name", "products.*"],
        isList: true,
      }),
    ],
  },
];

const adminMiddleware = [...customerApis, ...productApis, ...BrandApis];

export default adminMiddleware;
