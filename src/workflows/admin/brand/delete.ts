// src/workflows/brand/delete.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "@/modules/brand";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

interface InputType {
  id: string;
}

const deleteBrand = createStep(
  "delete_brand",
  async (input: { brandId: string }, { container }) => {
    const brandService = container.resolve(BRAND_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    await link.delete({
      [BRAND_MODULE]: { brand_id: input.brandId },
    });

    try {
      await brandService.deleteBrands(input.brandId);
    } catch (error) {
      if (error.type !== "not_found") throw error;
    }

    return new StepResponse(true);
  },
  async (revert, { container }) => {}
);

// workflow
export const deleteBrandWorkflow = createWorkflow(
  "delete_brand_workflow",
  function (input: InputType) {
    // delete brand
    const brand = deleteBrand({
      brandId: input.id,
    });

    return new WorkflowResponse(brand);
  }
);
