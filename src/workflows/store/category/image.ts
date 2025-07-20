// src/workflows/categories/image.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// retrieve category image
const imageCategory = createStep(
  "category_image",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: image, metadata: { count } = {} } =
      await query.graph({
        entity: "extended_product_category",
        fields: ["id", "image"],
        filters: input.filters,
      });

    if (!image) throw new Error(`No category image found`);
    return new StepResponse(image);
  }
);

// workflow
export const imageCategoryWorkflow = createWorkflow(
  "category_image_workflow",
  function (input) {
    const image = imageCategory(input);

    return new WorkflowResponse(image);
  }
);
