// src/workflows/brand/update.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "../../modules/brand";
import BrandService from "../../modules/brand/service";

interface InputType {
  id: string;
  name: string;
}

const updateBrand = createStep(
  "update_brand",
  async (input: InputType, { container }) => {
    const brandService: BrandService = container.resolve(BRAND_MODULE);

    let exist: any = null;
    try {
      exist = await brandService.retrieveBrand(input.id);
    } catch (_) {
      exist = null;
    }

    if (!exist) {
      await brandService.createBrands({
        name: input.name,
      });
    } else {
      await brandService.updateBrands({
        id: input.id,
        name: input.name,
      });
    }

    return new StepResponse(true, {
      brandId: input.id,
    });
  },
  async (revert, { container }) => {
    if (revert?.brandId) {
      try {
        const brandService: BrandService = container.resolve(BRAND_MODULE);

        await brandService.deleteBrands(revert.brandId);
      } catch (error) {
        console.error("Failed to revert brand:", error);
      }
    }
  }
);

// main workflow
export const updateBrandWorkflow = createWorkflow(
  "update_brand_workflow",
  function (input: InputType) {
    const brand = updateBrand(input);

    return new WorkflowResponse({
      brand,
    });
  }
);
