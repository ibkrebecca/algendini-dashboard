// src/workflows/customer/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";

interface RetrieveCustomerInput {
  id: string;
}

// step 1: retrieve main customer
const retrieveCustomerStep = createStep(
  "retrieve_customer",
  async (input: RetrieveCustomerInput, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER);

    // retrieve customer
    const customer = await customerService.retrieveCustomer(input.id);

    if (!customer) throw new Error(`Customer with id ${input.id} not found`);
    return new StepResponse(customer);
  }
);

// step 2: retrieve extended customer data
const retrieveExtendedCustomerStep = createStep(
  "retrieve_extended_customer",
  async (input: { customerId: string }, { container }) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);

    try {
      const extendedCustomer =
        await extendedCustomerService.retrieveExtendedCustomer(
          input.customerId
        );
      return new StepResponse(extendedCustomer);
    } catch (error) {
      // if extended customer doesn't exist, return null instead of throwing error
      if (error.type === "not_found") return new StepResponse(null);
      throw error;
    }
  }
);

// main workflow
export const retrieveCustomerWorkflow = createWorkflow(
  "retrieve_customer",
  function (input: RetrieveCustomerInput) {
    // step 1: retrieve main customer
    const customer = retrieveCustomerStep(input);

    // step 2: retrieve extended customer data
    const extendedCustomer = retrieveExtendedCustomerStep({
      customerId: input.id,
    });

    return new WorkflowResponse({
      customer,
      extendedCustomer,
    });
  }
);
