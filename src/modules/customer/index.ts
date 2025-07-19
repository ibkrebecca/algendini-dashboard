// src/modules/customer/index.ts
import ExtendedCustomerModuleService from "@/modules/customer/service";
import { Module } from "@medusajs/framework/utils";

export const EXTENDED_CUSTOMER_MODULE = "extended_customer";

export default Module(EXTENDED_CUSTOMER_MODULE, {
  service: ExtendedCustomerModuleService,
});
