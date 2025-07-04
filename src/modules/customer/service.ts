// src/modules/customer/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { ExtendedCustomer } from "./models/extend";

class ExtendedCustomerModuleService extends MedusaService({
  ExtendedCustomer,
}) {}

export default ExtendedCustomerModuleService;
