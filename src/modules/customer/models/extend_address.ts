// src/modules/customer/models/extend_address.ts
import { model } from "@medusajs/framework/utils";

export const ExtendedCustomerAddress = model.define(
  "extended_customer_address",
  {
    id: model.id().primaryKey(),
    place_id: model.text(),
    city_country: model.text(),
    lat: model.text(),
    lng: model.text(),
  }
);
