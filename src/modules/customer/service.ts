// src/modules/customer/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { ExtendedCustomer } from "./models/extend";
import { ExtendedCustomerAddress } from "./models/extend_address";

class ExtendedCustomerModuleService extends MedusaService({
  ExtendedCustomer,
  ExtendedCustomerAddress,
}) {
  async getAdminCustomers() {
    return await this.listExtendedCustomers({
      is_admin: true,
    });
  }

  async getDriverCustomers() {
    return await this.listExtendedCustomers({
      is_driver: true,
    });
  }

  // Custom method to get extended customer with error handling
  async getExtendedCustomerSafely(id: string) {
    try {
      return await this.retrieveExtendedCustomer(id);
    } catch (error) {
      if (error.type === "not_found") {
        return null;
      }
      throw error;
    }
  }

  // Extended Customer Address custom methods
  async getAddressesByCustomer(customerId: string) {
    return await this.listExtendedCustomerAddresses({
      customer_id: customerId,
    });
  }

  async getDefaultAddressForCustomer(customerId: string) {
    const addresses = await this.listExtendedCustomerAddresses({
      customer_id: customerId,
      is_default: true,
    });
    return addresses.length > 0 ? addresses[0] : null;
  }
}

export default ExtendedCustomerModuleService;
