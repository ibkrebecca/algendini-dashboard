// src/workflows/customer/register.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";

interface RegisterCustomerInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  dob: string;
  gender: "male" | "female";
  is_admin: boolean;
  is_driver: boolean;
}

interface RegisterCustomerOutput {
  customer: any;
  extendedCustomer: any;
  authIdentity: any;
}

// step 1: create customer profile
const createCustomerStep = createStep(
  "create_customer",
  async (input: RegisterCustomerInput, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER);

    // check if customer already exists
    const existingCustomers = await customerService.listCustomers({
      email: input.email,
    });

    if (existingCustomers.length > 0) {
      throw new Error("Customer with this email already exists");
    }

    const customer = await customerService.createCustomers({
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      has_account: true,
    });

    return new StepResponse(customer, {
      customerId: customer.id,
    });
  },
  async (revert, { container }) => {
    // revert: delete the customer if something goes wrong
    if (revert?.customerId) {
      const customerService = container.resolve(Modules.CUSTOMER);
      await customerService.deleteCustomers(revert.customerId);
    }
  }
);

// step 2: create auth identity
const createAuthIdentityStep = createStep(
  "create_auth_identity",
  async (
    input: { customerId: string; email: string; password: string },
    { container }
  ) => {
    const authService = container.resolve(Modules.AUTH);

    const authIdentity = await authService.createAuthIdentities({
      id: input.customerId,
      provider_identities: [
        {
          provider: "emailpass",
          entity_id: input.email,
          provider_metadata: {
            password: input.password,
          },
        },
      ],
    });

    return new StepResponse(authIdentity, {
      authIdentityId: authIdentity.id,
    });
  },
  async (revert, { container }) => {
    // revert: delete the auth identity if something goes wrong
    if (revert?.authIdentityId) {
      const authService = container.resolve(Modules.AUTH);
      await authService.deleteAuthIdentities([revert.authIdentityId]);
    }
  }
);

// step 3: create extended customer data
const createExtendedCustomerStep = createStep(
  "create_extended_customer",
  async (
    input: {
      customerId: string;
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
      const extendedCustomerService = container.resolve(
        EXTENDED_CUSTOMER_MODULE
      );
      await extendedCustomerService.deleteExtendedCustomers(
        revert.extendedCustomerId
      );
    }
  }
);

// main workflow
export const registerCustomerWorkflow = createWorkflow(
  "register_customer",
  function (input: RegisterCustomerInput) {
    // step 1: create customer
    const customer = createCustomerStep(input);

    // step 2: create auth identity
    const authIdentity = createAuthIdentityStep({
      customerId: customer.id,
      email: input.email,
      password: input.password,
    });

    // step 3: create extended customer data
    const extendedCustomer = createExtendedCustomerStep({
      customerId: customer.id,
      dob: input.dob,
      gender: input.gender,
      is_admin: input.is_admin,
      is_driver: input.is_driver,
    });

    return new WorkflowResponse({
      customer,
      authIdentity,
      extendedCustomer,
    });
  }
);
