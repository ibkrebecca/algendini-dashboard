import { defineMiddlewares } from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import adminMiddleware from "./admin/middlewares";
import storeMiddleware from "./store/middlewares";

export const GetBrandsSchema = createFindParams();

export default defineMiddlewares({
  routes: [...adminMiddleware, ...storeMiddleware],
});
