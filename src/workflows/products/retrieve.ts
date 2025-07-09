// src/workflows/products/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// retrieve products
const retrieveCustomer = createStep(
  "retrieve_products",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: products, metadata: { count } = {} } = await query.graph({
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "options.*",
        "images.*",
        "tags.*",
        "categories.*",
        "collection.*",
        "type.*",
        "metadata.*",
      ],
      filters: input.filters,
      pagination: {
        skip: parseInt(input.offset as string),
        take: parseInt(input.limit as string),
      },
    });

    if (!products) throw new Error(`No products found`);
    return new StepResponse({
      products,
      count,
      offset: parseInt(input.offset as string),
      limit: parseInt(input.limit as string),
    });
  }
);

// workflow
export const retrieveProductsWorkflow = createWorkflow(
  "retrieve_products_workflow",
  function (input) {
    const products = retrieveCustomer(input);

    return new WorkflowResponse(products);
  }
);
