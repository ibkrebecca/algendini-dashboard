import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveCustomerWorkflow } from "../../../../workflows/customer/retrieve";

// define the request body type
interface RetrieveCustomerRequest {
  id: string;
}

// /store/customers/retrieve/ - retrieve a customer
export async function POST(
  req: MedusaRequest<RetrieveCustomerRequest>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.body as RetrieveCustomerRequest;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer id is required",
      });
    }

    const { result } = await retrieveCustomerWorkflow(req.scope).run({
      input: {
        id,
      },
    });

    // return success response without sensitive data
    res.status(201).json({
      customer: {
        id: result.customer.id,
        email: result.customer.email,
        first_name: result.customer.first_name,
        last_name: result.customer.last_name,
        phone: result.customer.phone,
        created_at: result.customer.created_at,
        avatar_url: result.extendedCustomer.avatar_url,
        dob: result.extendedCustomer.dob,
        gender: result.extendedCustomer.gender,
        is_admin: result.extendedCustomer.is_admin,
        is_driver: result.extendedCustomer.is_driver,
      },
      message: "Customer retrieved successfully",
    });
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve customer",
    });
  }
}
