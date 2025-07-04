// src/links/extended_customer_address.ts
import { defineLink } from "@medusajs/framework/utils";
import CustomerAddressModule from "@medusajs/medusa/customer";
import ExtendedCustomerModule from "../modules/customer";

export default defineLink(
  CustomerAddressModule.linkable.customer,
  ExtendedCustomerModule.linkable.extendedCustomerAddress
);
