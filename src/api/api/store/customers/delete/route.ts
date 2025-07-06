import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deleteCustomerWorkflow } from "../../../../../workflows/customer/delete";

// define the request body type
interface DeleteCustomerRequest {
  id: string;
}

// /api/store/customers/delete/ - delete a customer
export async function POST(
  req: MedusaRequest<DeleteCustomerRequest>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.body as DeleteCustomerRequest;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer id is required",
      });
    }

    const { result } = await deleteCustomerWorkflow(req.scope).run({
      input: {
        id,
      },
    });

    // return success response without sensitive data
    res.status(201).json({
      customer: {
        deleted: result.deleted,
        customerId: result.customerId,
        details: {
          customer: result.customerDeleted,
          extendedCustomer: result.extendedCustomerDeleted,
          authIdentity: result.authIdentityDeleted,
        },
      },
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete customer",
    });
  }
}
