// /api/store/customers/register/ - register a new customer
// src/api/store/customers/register/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    first_name,
    last_name,
    has_account,
    groups,
    addresses,
    phone,
    email,
    password,
    dob,
    gender,
    is_admin,
    is_driver,
  } = req.body as {
    first_name: string;
    last_name: string;
    has_account: boolean;
    groups: [];
    addresses: [];
    phone: string;
    email: string;
    password: string;
    dob: string;
    gender: "male" | "female";
    is_admin: boolean;
    is_driver: boolean;
  };

  // 1. Register the customer
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
  const customer = await customerModuleService.createCustomers({
    first_name: first_name,
    last_name: last_name,
    email: email,
    phone: phone,
    has_account: has_account,
    addresses: addresses,
  });

  // 2. Create the extended customer data and link it
  const extendedCustomerService = req.scope.resolve("extended_customer");
//   const extendedCustomer = await extendedCustomerService.create({
//     customer_id: customer.id,
//     dob,
//     gender,
//     is_admin,
//     is_driver,
//     groups,
//     created_on: new Date(),
//   });

  // 3. Return the result
  res.json({
    customer,
    // extended_customer: extendedCustomer,
  });
}
