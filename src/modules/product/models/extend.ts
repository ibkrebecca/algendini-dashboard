// src/modules/product/models/extend.ts
import { model } from "@medusajs/framework/utils";

export const ExtendedProduct = model.define("extended_product", {
  id: model.id().primaryKey(),
  view_count: model.number().default(0),
  features: model.json().nullable(),
  brand: model.json().nullable(),
});
