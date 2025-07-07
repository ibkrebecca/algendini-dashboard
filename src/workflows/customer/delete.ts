// src/workflows/customer/delete.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";
import { AuthIdentityDTO } from "@medusajs/framework/types";

interface DeleteCustomerInput {
  id: string;
}

// step 1: delete extended customer data first
const deleteExtendedCustomerStep = createStep(
  "delete_extended_customer",
  async (input: { customerId: string }, { container }) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);

    let deletedExtendedCustomer: any = null;
    try {
      // first retrieve the extended customer to store for potential rollback
      const existingExtendedCustomer =
        await extendedCustomerService.retrieveExtendedCustomer(
          input.customerId
        );

      // delete the extended customer
      await extendedCustomerService.deleteExtendedCustomers(input.customerId);

      deletedExtendedCustomer = existingExtendedCustomer;
    } catch (error) {
      // if extended customer doesn't exist, that's fine - continue with deletion
      if (error.type !== "not_found") throw error;
    }

    return new StepResponse(
      { deleted: deletedExtendedCustomer !== null },
      {
        customerId: input.customerId,
        deletedExtendedCustomer,
      }
    );
  },
  async (revert, { container }) => {
    // NO REVERT: do not recreate auth identity
    // once deleted, it stays deleted
  }
);

// step 2: delete auth identity
const deleteAuthIdentityStep = createStep(
  "delete_auth_identity",
  async (input: { customerId: string }, { container }) => {
    const authService = container.resolve(Modules.AUTH);

    let deletedAuthIdentity: any = null;
    try {
      // get authIdentities
      const authIdentities = await authService.listAuthIdentities(
        {
          app_metadata: {
            customer_id: input.customerId,
          },
        },
        {
          select: ["id", "provider_id", "app_metadata"],
        }
      );

      const auth_ids = authIdentities.map((ai: AuthIdentityDTO) => ai.id);

      // delete the auth identity
      await authService.deleteAuthIdentities(auth_ids);

      deletedAuthIdentity = authIdentities;
    } catch (error) {
      // if auth identity doesn't exist, that's fine - continue with deletion
      if (error.type !== "not_found") throw error;
    }

    return new StepResponse(
      { deleted: deletedAuthIdentity !== null },
      {
        customerId: input.customerId,
        deletedAuthIdentity,
      }
    );
  },
  async (revert, { container }) => {
    // NO REVERT: do not recreate auth identity
    // once deleted, it stays deleted
  }
);

// step 3: delete main customer
const deleteCustomerStep = createStep(
  "delete_customer",
  async (input: { customerId: string }, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER);

    // first retrieve the customer to store for potential rollback
    const existingCustomer = await customerService.retrieveCustomer(
      input.customerId
    );

    if (!existingCustomer) {
      throw new Error(`Customer with id ${input.customerId} not found`);
    }

    // delete the customer
    await customerService.deleteCustomers(input.customerId);

    return new StepResponse(
      { deleted: true, customerId: input.customerId },
      {
        customerId: input.customerId,
        deletedCustomer: existingCustomer,
      }
    );
  },
  async (revert, { container }) => {
    // NO REVERT: do not recreate customer
    // once deleted, it stays deleted
  }
);

// main workflow
export const deleteCustomerWorkflow = createWorkflow(
  "delete_customer",
  function (input: DeleteCustomerInput) {
    // step 1: delete extended customer data first
    const extendedCustomerResult = deleteExtendedCustomerStep({
      customerId: input.id,
    });

    // step 2: delete auth identity
    const authIdentityResult = deleteAuthIdentityStep({
      customerId: input.id,
    });

    // step 3: delete main customer last
    const customerResult = deleteCustomerStep({
      customerId: input.id,
    });

    return new WorkflowResponse({
      deleted: true,
      customerId: input.id,
      extendedCustomerDeleted: extendedCustomerResult.deleted,
      authIdentityDeleted: authIdentityResult.deleted,
      customerDeleted: customerResult.deleted,
    });
  }
);
