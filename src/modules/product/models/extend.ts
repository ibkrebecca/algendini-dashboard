// src/modules/product/models/extend.ts
import { model } from "@medusajs/framework/utils";

export const ExtendedProduct = model.define("extended_product", {
  id: model.id().primaryKey(),
  features: model.json().nullable(),
});
