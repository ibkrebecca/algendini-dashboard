// src/modules/product/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { ExtendedProduct } from "./models/extend";

class ExtendedProductService extends MedusaService({
  ExtendedProduct,
}) {}

export default ExtendedProductService;
