// src/modules/customer/models/extend.ts
import { model } from "@medusajs/framework/utils";

export const ExtendedCustomer = model.define("extended_customer", {
  id: model.id().primaryKey(),
  dob: model.dateTime(),
  gender: model.text(),
  is_admin: model.boolean().default(false),
  is_driver: model.boolean().default(false),
  created_on: model.dateTime(),
});
