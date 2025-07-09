// src/modules/product_category/models/extend.ts
import { model } from "@medusajs/framework/utils";

export const ExtendedProductCategory = model.define(
  "extended_product_category",
  {
    id: model.id().primaryKey(),
    image: model.text().nullable(),
  }
);
