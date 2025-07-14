// src/modules/xchange/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import Xchange from "./models/xchange";

class XchangeService extends MedusaService({
  Xchange,
}) {}

export default XchangeService;
