// src/modules/brand/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import Brand from "@/modules/brand/models/brand";

class BrandService extends MedusaService({
  Brand,
}) {}

export default BrandService;
