// src/modules/customer/models/extend.ts
import { model } from "@medusajs/framework/utils";

export const ExtendedCustomer = model.define("extended_customer", {
  id: model.id().primaryKey(),
  dob: model.dateTime(),
  gender: model.text(),
  is_admin: model.boolean(),
  is_driver: model.boolean(),
  created_on: model.dateTime(),
});
