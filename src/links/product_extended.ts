// src/links/extended_product.ts
import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import ExtendedProductModule from "@/modules/product";

export default defineLink(
  ProductModule.linkable.product,
  ExtendedProductModule.linkable.extendedProduct,
  {
    database: {
      table: "product_extended_link",
    },
  }
);
