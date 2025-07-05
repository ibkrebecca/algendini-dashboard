// src/workflows/customer/register.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";

interface UpdateCustomerInput {
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
const updateCustomerStep = createStep(
  "update_customer",
  async (input: UpdateCustomerInput, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER);

    // check if customer exists
    const existingCustomer = await customerService.retrieveCustomer(input.id);
    if (!existingCustomer) {
      throw new Error(`Customer with id ${input.id} not found`);
    }

    // prepare update data (only include fields that are provided)
    const updateData: any = {};
    if (input.first_name !== undefined)
      updateData.first_name = input.first_name;
    if (input.last_name !== undefined) updateData.last_name = input.last_name;
    if (input.phone !== undefined) updateData.phone = input.phone;

    // update customer if there's data to update
    let updatedCustomer = existingCustomer;
    if (Object.keys(updateData).length > 0) {
      updatedCustomer = await customerService.updateCustomers(
        input.id,
        updateData
      );
    }

    return new StepResponse(updatedCustomer, {
      customerId: input.id,
      originalCustomer: existingCustomer,
    });
  },
  async (revert, { container }) => {
    // revert: restore original customer data if something goes wrong
    if (revert?.customerId && revert?.originalCustomer) {
      const customerService = container.resolve(Modules.CUSTOMER);
      await customerService.updateCustomers(revert.customerId, {
        first_name: revert.originalCustomer.first_name,
        last_name: revert.originalCustomer.last_name,
        phone: revert.originalCustomer.phone,
      });
    }
  }
);

// step 2: update extended customer data
const updateExtendedCustomerStep = createStep(
  "update_extended_customer",
  async (
    input: {
      customerId: string;
      dob?: string;
      gender?: string;
      is_admin?: boolean;
      is_driver?: boolean;
    },
    { container }
  ) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);
    // check if extended customer exists
    let existingExtendedCustomer;

    try {
      existingExtendedCustomer =
        await extendedCustomerService.retrieveExtendedCustomer(
          input.customerId
        );
    } catch (error) {
      // if extended customer doesn't exist, throw error
      if (error.type === "not_found") {
        throw new Error(
          `Extended customer profile not found for customer ID: ${input.customerId}`
        );
      }
      throw error;
    }

    // prepare update data for extended customer
    const updateData: any = {};
    if (input.dob !== undefined) updateData.dob = new Date(input.dob);
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.is_admin !== undefined) updateData.is_admin = input.is_admin;
    if (input.is_driver !== undefined) updateData.is_driver = input.is_driver;

    // update extended customer if there's data to update
    let updatedExtendedCustomer = existingExtendedCustomer;
    if (Object.keys(updateData).length > 0) {
      updatedExtendedCustomer =
        await extendedCustomerService.updateExtendedCustomers({
          id: input.customerId,
          ...updateData,
        });
    }

    return new StepResponse(updatedExtendedCustomer, {
      customerId: input.customerId,
      originalExtendedCustomer: existingExtendedCustomer,
      isNewRecord: false,
    });
  },
  async (revert, { container }) => {
    // revert: restore original extended customer data
    if (revert?.customerId && revert?.originalExtendedCustomer) {
      const extendedCustomerService = container.resolve(
        EXTENDED_CUSTOMER_MODULE
      );

      // restore original data
      await extendedCustomerService.updateExtendedCustomers({
        id: revert.customerId,
        dob: revert.originalExtendedCustomer.dob,
        gender: revert.originalExtendedCustomer.gender,
        is_admin: revert.originalExtendedCustomer.is_admin,
        is_driver: revert.originalExtendedCustomer.is_driver,
      });
    }
  }
);

// main workflow
export const updateCustomerWorkflow = createWorkflow(
  "update_customer",
  function (input: UpdateCustomerInput) {
    // step 1: update main customer
    const customer = updateCustomerStep(input);

    // step 2: update extended customer data
    const extendedCustomer = updateExtendedCustomerStep({
      customerId: input.id,
      dob: input.dob,
      gender: input.gender,
      is_admin: input.is_admin,
      is_driver: input.is_driver,
    });

    return new WorkflowResponse({
      customer,
      extendedCustomer,
    });
  }
);
