// src/links/extended_customer.ts
import { defineLink } from "@medusajs/framework/utils";
import CustomerModule from "@medusajs/medusa/customer";
import ExtendedCustomerModule from "@/modules/customer";

export default defineLink(
  CustomerModule.linkable.customer,
  ExtendedCustomerModule.linkable.extendedCustomer,
  {
    database: {
      table: "customer_customer_extended",
    },
  }
);
