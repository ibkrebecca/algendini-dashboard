// src/workflows/customer/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// retrieve customer
const retrieveCustomer = createStep(
  "retrieve_customer",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: customer } = await query.graph({
      entity: "customer",
      fields: [
        "*",
        "groups.*",
        "addresses.*",
        "extended_customer.*",
      ],
      filters: { id: input.id },
    });

    if (!customer) throw new Error(`Customer with id ${input.id} not found`);
    return new StepResponse(customer);
  }
);

// workflow
export const retrieveCustomerWorkflow = createWorkflow(
  "retrieve_customer_workflow",
  function (input: any) {
    const customer = retrieveCustomer(input.id);
    return new WorkflowResponse(customer[0]);
  }
);
