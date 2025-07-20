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
import { REGION_CURRENCY, REGION_ID } from "@/lib/env";

interface InputType {
  filters?: any;
  order?: any;
  skip?: number;
  take?: number;
  withGraph?: boolean;
}

// retrieve products
const retrieveProducts = createStep(
  "retrieve_products",
  async (input: InputType, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    let result: any;
    let products: any;

    const queryObj: any = {
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "variants.prices.*",
        "variants.calculated_price.*",
        "variants.options.*",
        "variants.inventory_items.*",
        "options.*",
        "options.values.*",
        "images.*",
        "tags.*",
        "categories.*",
        "collection.*",
        "sales_channels.*",
        "shipping_profile.*",
        "type.*",
        "metadata.*",
        "brand.*",
        "extended_product.*",
      ],
      filters: input.filters,
      context: {
        variants: {
          calculated_price: QueryContext({
            region_id: REGION_ID,
            currency_code: REGION_CURRENCY,
          }),
        },
      },
      pagination: {
        order: input.order,
        skip: input.skip,
        take: input.take,
      },
    };

    if (input.withGraph) {
      result = await query.graph(queryObj);
    } else {
      result = await query.index(queryObj);
    }

    products = result.data;
    if (!products) throw new Error(`No products found`);
    return new StepResponse({
      products,
      order: input.order,
      skip: input.skip,
      take: input.take,
    });
  }
);

// workflow
export const retrieveProductsWorkflow = createWorkflow(
  "retrieve_products_workflow",
  function (input: InputType) {
    const products = retrieveProducts(input);

    return new WorkflowResponse(products);
  }
);
