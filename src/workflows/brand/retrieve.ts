// src/workflows/brand/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// retrieve brand
const retrieveBrand = createStep(
  "retrieve_brand",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: brand, metadata: { count } = {} } = await query.graph({
      entity: "brand",
      fields: ["*"],
      filters: input.filters,
    });

    if (!brand) throw new Error(`No brand found`);
    return new StepResponse({
      brand,
      count,
    });
  }
);

// workflow
export const retrieveBrandWorkflow = createWorkflow(
  "retrieve_brand_workflow",
  function (input) {
    const brand = retrieveBrand(input);

    return new WorkflowResponse(brand);
  }
);
