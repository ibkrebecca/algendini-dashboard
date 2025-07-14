// src/workflows/products/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils";

// retrieve products
const retrieveProduct = createStep(
  "retrieve_products",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: products, metadata: { count } = {} } = await query.graph({
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "variants.prices.*",
        "variants.calculated_price.*",
        "variants.options.*",
        "variants.inventory_items.*",
        "options.*",
        "images.*",
        "tags.*",
        "categories.*",
        "collection.*",
        "sales_channels.*",
        "shipping_profile.*",
        "type.*",
        "metadata.*",
        "extended_product.*",
      ],
      filters: input.filters,
      context: {
        variants: {
          calculated_price: QueryContext({
            region_id: "reg_01JS9A6Y581Q4X0VS5DXDQS49F", // TODO: change id in prod
            currency_code: "try",
          }),
        },
      },
      pagination: {
        order: input.order,
        skip: input.skip,
        take: input.take,
      },
    });

    if (!products) throw new Error(`No products found`);
    return new StepResponse({
      products,
      count,
      order: input.order,
      skip: input.skip,
      take: input.take,
    });
  }
);

// workflow
export const retrieveProductsWorkflow = createWorkflow(
  "retrieve_products_workflow",
  function (input) {
    const products = retrieveProduct(input);

    return new WorkflowResponse(products);
  }
);
