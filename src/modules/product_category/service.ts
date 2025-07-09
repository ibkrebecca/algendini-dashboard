// src/modules/product_category/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { ExtendedProductCategory } from "./models/extend";

class ExtendedProductCategoryService extends MedusaService({
  ExtendedProductCategory,
}) {}

export default ExtendedProductCategoryService;
