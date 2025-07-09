// src/links/extended_product_category.ts
import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import ExtendedProductCategoryModule from "../modules/product_category";

export default defineLink(
  ProductModule.linkable.productCategory,
  ExtendedProductCategoryModule.linkable.extendedProductCategory,
  {
    database: {
      table: "product_product_category_extended",
    },
  }
);
