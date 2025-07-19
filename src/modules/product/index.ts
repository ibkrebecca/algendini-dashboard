// src/modules/product/index.ts
import ExtendedProductService from "@/modules/product/service";
import { Module } from "@medusajs/framework/utils";

export const EXTENDED_PRODUCT_MODULE = "extended_product";

export default Module(EXTENDED_PRODUCT_MODULE, {
  service: ExtendedProductService,
});
