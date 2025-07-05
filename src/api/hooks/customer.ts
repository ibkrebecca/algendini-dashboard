// src/api/hooks/customer.ts
import { EXTENDED_CUSTOMER_MODULE } from "../../modules/customer";
import { Modules } from "@medusajs/framework/utils";

export const getCustomerWithExtendedData = async (
  customerId: string,
  container: any
) => {
  const customerService = container.resolve(Modules.CUSTOMER);
  const extendedCustomerService = container.resolve(EXTENDED_CUSTOMER_MODULE);

  try {
    // get the main customer data
    const customer = await customerService.retrieveCustomer(customerId);

    // get the extended customer data
    const extendedCustomer = await extendedCustomerService.getExtendedCustomer(
      customerId
    );

    return {
      ...customer,
      dob: extendedCustomer.dob,
      gender: extendedCustomer.gender,
      is_admin: extendedCustomer.is_admin,
      is_driver: extendedCustomer.is_driver,
    };
  } catch (error) {
    console.error("Error fetching customer with extended data:", error);
    throw error;
  }
};
