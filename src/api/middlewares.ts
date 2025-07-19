import { defineMiddlewares } from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import adminMiddleware from "@/api/admin/middlewares";
import storeMiddleware from "@/api/store/middlewares";

export const GetBrandsSchema = createFindParams();

export default defineMiddlewares({
  routes: [...adminMiddleware, ...storeMiddleware],
});
