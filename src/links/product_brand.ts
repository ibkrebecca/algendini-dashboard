// src/links/brand_product.ts
import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import BrandModule from "@/modules/brand";

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  {
    linkable: BrandModule.linkable.brand,
    filterable: ["id", "name"],
  },
  {
    database: {
      table: "product_brand_link",
    },
  }
);
