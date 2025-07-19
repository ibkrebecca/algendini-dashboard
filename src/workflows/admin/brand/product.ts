// src/workflows/brand/product.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "@/modules/brand";
import { Modules } from "@medusajs/framework/utils";

interface InputType {
  brand_id: string;
  old_brand_id: string;
  product_id: string;
  is_remove: boolean;
}

const updateBrandProduct = createStep(
  "update_brand_product",
  async (input: InputType, { container }) => {
    const link = container.resolve("link");

    if (input.old_brand_id) {
      await link.dismiss({
        [Modules.PRODUCT]: { product_id: input.product_id },
        [BRAND_MODULE]: { brand_id: input.old_brand_id },
      });
    }

    if (!input.is_remove) {
      await link.create({
        [Modules.PRODUCT]: { product_id: input.product_id },
        [BRAND_MODULE]: { brand_id: input.brand_id },
      });
    }

    return new StepResponse(true);
  },
  async (revert, { container }) => {}
);

// main workflow
export const updateBrandProductWorkflow = createWorkflow(
  "brand_product_workflow",
  function (input: InputType) {
    const brand = updateBrandProduct(input);

    return new WorkflowResponse(brand);
  }
);
