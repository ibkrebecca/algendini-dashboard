// src/links/extended_customer_address.ts
import { defineLink } from "@medusajs/framework/utils";
import CustomerModule from "@medusajs/medusa/customer";
import ExtendedCustomerModule from "../modules/customer";

export default defineLink(
  CustomerModule.linkable.customerAddress,
  ExtendedCustomerModule.linkable.extendedCustomerAddress,
  {
    database: {
      table: "customer_customer_address_extended",
    },
  }
);
