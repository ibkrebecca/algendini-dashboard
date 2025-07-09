import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deleteCustomerWorkflow } from "../../../../workflows/customer/delete";

interface InputType {
  id: string;
}

// /store/customers/delete/ - delete a customer
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.body as InputType;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer id is required",
      });
    }

    const { result: deleted } = await deleteCustomerWorkflow(req.scope).run({
      input: {
        id,
      },
    });

    res.status(201).json(deleted);
  } catch (error) {
    console.error("Error deleting customer:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete customer",
    });
  }
}
