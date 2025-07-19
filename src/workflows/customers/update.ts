// src/workflows/customer/update.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "@/../modules/customer";

interface InputType {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female";
  is_admin?: boolean;
  is_driver?: boolean;
}

// step 1: update main customer profile
const updateCustomer = createStep(
  "update_customer",
  async (input: InputType, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER);

    const exist = await customerService.retrieveCustomer(input.id);
    if (!exist) {
      throw new Error(`Customer with id ${input.id} not found`);
    }

    // prepare update data (only include fields that are provided)
    const update: any = {};
    if (input.first_name !== undefined) update.first_name = input.first_name;
    if (input.last_name !== undefined) update.last_name = input.last_name;
    if (input.phone !== undefined) update.phone = input.phone;

    // update customer if there's data to update
    if (Object.keys(update).length > 0) {
      await customerService.updateCustomers(input.id, update);
    }

    return new StepResponse(true, {
      customer_id: input.id,
      original: exist,
    });
  },
  async (revert, { container }) => {
    // revert: restore original customer data if something goes wrong
    if (revert?.customer_id && revert?.original) {
      const customerService = container.resolve(Modules.CUSTOMER);
      await customerService.updateCustomers(revert.customer_id, {
        first_name: revert.original.first_name,
        last_name: revert.original.last_name,
        phone: revert.original.phone,
      });
    }
  }
);

// step 2: update extended customer data
const updateExtendedCustomer = createStep(
  "update_extended_customer",
  async (
    input: {
      customer_id: string;
      dob?: string;
      gender?: string;
      is_admin?: boolean;
      is_driver?: boolean;
    },
    { container }
  ) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);

    let exist;
    try {
      exist = await extendedCustomerService.retrieveExtendedCustomer(
        input.customer_id
      );
    } catch (error) {
      if (error.type === "not_found") {
        throw new Error(
          `Extended customer profile not found for customer ID: ${input.customer_id}`
        );
      }
      throw error;
    }

    // prepare update data for extended customer
    const update: any = {};
    if (input.dob !== undefined) update.dob = new Date(input.dob);
    if (input.gender !== undefined) update.gender = input.gender;
    if (input.is_admin !== undefined) update.is_admin = input.is_admin;
    if (input.is_driver !== undefined) update.is_driver = input.is_driver;

    if (Object.keys(update).length > 0) {
      await extendedCustomerService.updateExtendedCustomers({
        id: input.customer_id,
        ...update,
      });
    }

    return new StepResponse(true, {
      customer_id: input.customer_id,
      original: exist,
    });
  },
  async (revert, { container }) => {
    // revert: restore original extended customer data
    if (revert?.customer_id && revert?.original) {
      const extendedCustomerService = container.resolve(
        EXTENDED_CUSTOMER_MODULE
      );

      // restore original data
      await extendedCustomerService.updateExtendedCustomers({
        id: revert.customer_id,
        dob: revert.original.dob,
        gender: revert.original.gender,
        is_admin: revert.original.is_admin,
        is_driver: revert.original.is_driver,
      });
    }
  }
);

// main workflow
export const updateCustomerWorkflow = createWorkflow(
  "update_customer_workflow",
  function (input: InputType) {
    const customer = updateCustomer(input);

    const extended_customer = updateExtendedCustomer({
      customer_id: input.id,
      dob: input.dob,
      gender: input.gender,
      is_admin: input.is_admin,
      is_driver: input.is_driver,
    });

    return new WorkflowResponse({
      customer,
      extended_customer,
    });
  }
);
