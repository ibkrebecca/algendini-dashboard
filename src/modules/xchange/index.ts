// src/modules/xchange/index.ts
import XchangeService from "@/modules/xchange/service";
import { Module } from "@medusajs/framework/utils";

export const XCHANGE_MODULE = "xchange";

export default Module(XCHANGE_MODULE, {
  service: XchangeService,
});
