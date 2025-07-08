// src/links/extended_product_category.ts
import { defineLink } from "@medusajs/framework/utils";
import ProductCategory from "@medusajs/medusa/product";
import ExtendedProductCategoryModule from "../modules/product_category";

export default defineLink(
  ProductCategory.linkable.productCategory,
  ExtendedProductCategoryModule.linkable.extendedProductCategory
);
