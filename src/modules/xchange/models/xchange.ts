// src/modules/xchange/models/xchange.ts
import { model } from "@medusajs/framework/utils";

const Xchange = model.define("xchange", {
  id: model.id().primaryKey(),
  usd: model.text(),
  gbp: model.text(),
  eur: model.text(),
  try: model.text(),
  created_on: model.dateTime(),
});

export default Xchange;
