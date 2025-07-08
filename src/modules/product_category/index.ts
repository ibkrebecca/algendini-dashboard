// src/modules/product_category/index.ts
import ExtendedProductCategoryService from "./service";
import { Module } from "@medusajs/framework/utils";

export const EXTENDED_PRODUCT_CATEGORY_MODULE = "extended_product_category";

export default Module(EXTENDED_PRODUCT_CATEGORY_MODULE, {
  service: ExtendedProductCategoryService,
});
