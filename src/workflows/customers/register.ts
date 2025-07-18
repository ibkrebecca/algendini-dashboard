// src/workflows/customer/register.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";
import { AuthenticationInput, CustomerDTO } from "@medusajs/framework/types";
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows";

interface InputType {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  dob: string;
  gender: "male" | "female";
  is_admin: boolean;
  is_driver: boolean;
  // these for auth service compatibility
  url?: string;
  headers?: any;
  query?: any;
  protocol?: string;
}

const registerWithAuthService = createStep(
  "register_with_auth_service",
  async (input: InputType, { container }) => {
    const authService = container.resolve(Modules.AUTH);
    const customerService = container.resolve(Modules.CUSTOMER);

    const authData = {
      url: input.url || "/store/customers/register",
      headers: input.headers || {},
      query: input.query || {},
      body: {
        email: input.email,
        password: input.password,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
      },
      protocol: input.protocol || "https",
    } as AuthenticationInput;

    const { success, error, authIdentity } = await authService.register(
      "emailpass",
      authData
    );

    if (!success || !authIdentity) {
      throw new Error(error || "Authentication registration failed");
    }

    const customers = await customerService.listCustomers({
      email: input.email,
    });

    let customer: CustomerDTO;
    if (customers.length === 0) {
      customer = await customerService.createCustomers({
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        has_account: true,
      });
    } else {
      customer = customers[0];
    }

    const result = {
      customer_id: customer.id,
      auth_identity_id: authIdentity.id,
      auth_identity: authIdentity,
    };
    return new StepResponse(result, result);
  },
  async (revert, { container }) => {
    // revert: delete both customer and auth identity if something goes wrong
    if (revert?.auth_identity_id) {
      try {
        const authService = container.resolve(Modules.AUTH);
        await authService.deleteAuthIdentities([revert.auth_identity_id]);
      } catch (error) {
        console.error("Failed to revert auth identity:", error);
      }
    }

    if (revert?.customer_id) {
      try {
        const customerService = container.resolve(Modules.CUSTOMER);
        await customerService.deleteCustomers(revert.customer_id);
      } catch (error) {
        console.error("Failed to revert customer:", error);
      }
    }
  }
);

const createExtendedCustomer = createStep(
  "create_extended_customer",
  async (
    input: {
      customer_id: string;
      avatar_url: string;
      dob: string;
      gender: string;
      is_admin: boolean;
      is_driver: boolean;
    },
    { container }
  ) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    const extendedCustomer =
      await extendedCustomerService.createExtendedCustomers({
        id: input.customer_id,
        avatar_url: input.avatar_url,
        dob: new Date(input.dob),
        gender: input.gender,
        is_admin: input.is_admin,
        is_driver: input.is_driver,
        created_on: new Date(),
      });

    await link.create({
      [Modules.CUSTOMER]: { customer_id: input.customer_id },
      extended_customer: {
        extended_customer_id: input.customer_id,
      },
    });
    
    return new StepResponse(extendedCustomer, {
      extendedCustomerId: input.customer_id,
    });
  },
  async (revert, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    // revert: delete the extended customer data if something goes wrong
    if (revert?.extendedCustomerId) {
      try {
        const extendedCustomerService = container.resolve(
          EXTENDED_CUSTOMER_MODULE
        );
        await extendedCustomerService.deleteExtendedCustomers(
          revert.extendedCustomerId
        );
        await link.delete({
          [Modules.CUSTOMER]: { customer_id: revert.extendedCustomerId },
          extended_customer: {
            extended_customer_id: revert.extendedCustomerId,
          },
        });
      } catch (error) {
        console.error("Failed to revert extended customer:", error);
      }
    }
  }
);

// workflow
export const registerCustomerWorkflow = createWorkflow(
  "register_customer_workflow",
  function (input: InputType) {
    // register using auth service (creates customer + auth identity)
    const result = registerWithAuthService(input);

    // create extended customer data
    createExtendedCustomer({
      customer_id: result.customer_id,
      avatar_url: input.avatar_url,
      dob: input.dob,
      gender: input.gender,
      is_admin: input.is_admin,
      is_driver: input.is_driver,
    });

    // set app_metadata on auth identity
    setAuthAppMetadataStep({
      authIdentityId: result.auth_identity_id,
      actorType: "customer",
      value: result.customer_id,
    });

    return new WorkflowResponse(result);
  }
);
