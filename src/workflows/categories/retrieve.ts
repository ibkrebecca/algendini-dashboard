// src/workflows/categories/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// retrieve categories
const retrieveCustomer = createStep(
  "retrieve_categories",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: categories, metadata: { count } = {} } = await query.graph({
      entity: "product_category",
      fields: [
        "*",
        "id",
        "name",
        "description",
        "handle",
        "is_active",
        "is_internal",
        "parent_category_id",
        "created_at",
        "updated_at",
        "metadata.*",
        "parent_category.*",
        "category_children.*",
        "products.*",
        "extended_product_category.*",
      ],
      filters: input.filters,
      pagination: {
        skip: input.skip,
        take: input.take,
      },
    });

    if (!categories) throw new Error(`No categories found`);
    return new StepResponse({
      categories,
      count,
      skip: input.skip,
      take: input.take,
    });
  }
);

// workflow
export const retrieveCategoriesWorkflow = createWorkflow(
  "retrieve_categories_workflow",
  function (input) {
    const categories = retrieveCustomer(input);

    return new WorkflowResponse(categories);
  }
);
