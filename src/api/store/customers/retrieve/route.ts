import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveCustomerWorkflow } from "@/workflows/store/customer/retrieve";

// /store/customers/retrieve/ - retrieve a customer
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.query;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer id is required",
      });
    }

    const { result: customer } = await retrieveCustomerWorkflow(req.scope).run({
      input: { id },
    });

    res.json(customer);
  } catch (error) {
    console.error("Error retriving customer:", error);

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
