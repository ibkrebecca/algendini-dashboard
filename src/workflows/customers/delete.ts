// src/workflows/customer/delete.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "@/../modules/customer";
import { AuthIdentityDTO } from "@medusajs/framework/types";

interface InputType {
  id: string;
}

const deleteExtendedCustomer = createStep(
  "delete_extended_customer",
  async (input: { customerId: string }, { container }) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);

    try {
      await extendedCustomerService.deleteExtendedCustomers(input.customerId);
    } catch (error) {
      if (error.type !== "not_found") throw error;
    }

    return new StepResponse(true);
  },
  async (revert, { container }) => {}
);

const deleteAuthIdentity = createStep(
  "delete_auth_identity",
  async (input: { customerId: string }, { container }) => {
    const authService = container.resolve(Modules.AUTH);

    try {
      const identities = await authService.listAuthIdentities(
        {
          app_metadata: {
            customer_id: input.customerId,
          },
        },
        {
          select: ["id", "provider_id", "app_metadata"],
        }
      );

      const auth_ids = identities.map((ai: AuthIdentityDTO) => ai.id);

      await authService.deleteAuthIdentities(auth_ids);
    } catch (error) {
      if (error.type !== "not_found") throw error;
    }

    return new StepResponse(true);
  },
  async (revert, { container }) => {}
);

const deleteCustomer = createStep(
  "delete_customer",
  async (input: { customerId: string }, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    const exist = await customerService.retrieveCustomer(input.customerId);

    if (!exist) {
      throw new Error(`Customer with id ${input.customerId} not found`);
    }

    await customerService.deleteCustomers(input.customerId);

    // delete link to extended customer
    await link.delete({
      [Modules.CUSTOMER]: { customer_id: input.customerId },
      extended_customer: {
        extended_customer_id: input.customerId,
      },
    });

    return new StepResponse(true);
  },
  async (revert, { container }) => {}
);

// workflow
export const deleteCustomerWorkflow = createWorkflow(
  "delete_customer_workflow",
  function (input: InputType) {
    // delete extended customer
    const extendedCustomer = deleteExtendedCustomer({
      customerId: input.id,
    });

    // delete auth identity
    const authIdentity = deleteAuthIdentity({
      customerId: input.id,
    });

    // delete customer
    const customer = deleteCustomer({
      customerId: input.id,
    });

    return new WorkflowResponse({
      customer_id: input.id,
      deleted: true,
      extended_customer_deleted: extendedCustomer,
      auth_identity_deleted: authIdentity,
      customer_deleted: customer,
    });
  }
);
