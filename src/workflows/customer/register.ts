// src/workflows/customer/register.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";
import {
  IAuthModuleService,
  AuthenticationInput,
  CustomerDTO,
} from "@medusajs/framework/types";
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows";

interface RegisterCustomerInput {
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

// step 1: register using auth service (creates both customer and auth identity)
const registerWithAuthServiceStep = createStep(
  "register_with_auth_service",
  async (input: RegisterCustomerInput, { container }) => {
    const authService: IAuthModuleService = container.resolve(Modules.AUTH);

    // prepare auth data for the service
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

    // get the created customer
    const customerService = container.resolve(Modules.CUSTOMER);
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

    return new StepResponse(
      { customer, authIdentity },
      {
        customerId: customer.id,
        authIdentityId: authIdentity.id,
      }
    );
  },
  async (revert, { container }) => {
    // revert: delete both customer and auth identity if something goes wrong
    if (revert?.authIdentityId) {
      try {
        const authService: IAuthModuleService = container.resolve(Modules.AUTH);
        await authService.deleteAuthIdentities([revert.authIdentityId]);
      } catch (error) {
        console.error("Failed to revert auth identity:", error);
      }
    }

    if (revert?.customerId) {
      try {
        const customerService = container.resolve(Modules.CUSTOMER);
        await customerService.deleteCustomers(revert.customerId);
      } catch (error) {
        console.error("Failed to revert customer:", error);
      }
    }
  }
);

// step 2: create extended customer data
const createExtendedCustomerStep = createStep(
  "create_extended_customer",
  async (
    input: {
      customerId: string;
      avatar_url: string;
      dob: string;
      gender: string;
      is_admin: boolean;
      is_driver: boolean;
    },
    { container }
  ) => {
    const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);

    const extendedCustomer =
      await extendedCustomerService.createExtendedCustomers({
        id: input.customerId,
        avatar_url: input.avatar_url,
        dob: new Date(input.dob),
        gender: input.gender,
        is_admin: input.is_admin,
        is_driver: input.is_driver,
        created_on: new Date(),
      });

    return new StepResponse(extendedCustomer, {
      extendedCustomerId: input.customerId,
    });
  },
  async (revert, { container }) => {
    // revert: delete the extended customer data if something goes wrong
    if (revert?.extendedCustomerId) {
      try {
        const extendedCustomerService = container.resolve(
          EXTENDED_CUSTOMER_MODULE
        );
        await extendedCustomerService.deleteExtendedCustomers(
          revert.extendedCustomerId
        );
      } catch (error) {
        console.error("Failed to revert extended customer:", error);
      }
    }
  }
);

// Main workflow
export const registerCustomerWorkflow = createWorkflow(
  "register_customer",
  function (input: RegisterCustomerInput) {
    // Step 1: Register using auth service (creates customer + auth identity)
    const registrationResult = registerWithAuthServiceStep(input);

    // Step 2: Create extended customer data
    const extendedCustomer = createExtendedCustomerStep({
      customerId: registrationResult.customer.id,
      avatar_url: input.avatar_url,
      dob: input.dob,
      gender: input.gender,
      is_admin: input.is_admin,
      is_driver: input.is_driver,
    });

    // step 3: set app_metadata on auth identity
    setAuthAppMetadataStep({
      authIdentityId: registrationResult.authIdentity.id,
      actorType: "customer",
      value: registrationResult.customer.id,
    });

    return new WorkflowResponse({
      customer: registrationResult.customer,
      authIdentity: registrationResult.authIdentity,
      extendedCustomer,
    });
  }
);
