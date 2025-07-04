// src/modules/customer/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { ExtendedCustomer } from "./models/extend";
import { ExtendedCustomerAddress } from "./models/extend_address";

class ExtendedCustomerModuleService extends MedusaService({
  ExtendedCustomer,
  ExtendedCustomerAddress,
}) {}

export default ExtendedCustomerModuleService;
