import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateCustomerWorkflow } from "@/workflows/customers/update";

interface InputType {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female";
  is_admin?: boolean;
  is_driver?: boolean;
}

// /store/customers/update/ - update a customer
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const {
      id,
      first_name,
      last_name,
      phone,
      dob,
      gender,
      is_admin = false,
      is_driver = false,
    } = req.body as InputType;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer id is required",
      });
    }

    // validate dob format if provided
    if (dob) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z?$/;
      if (!dateRegex.test(dob)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid date format for dob. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        });
      }
    }

    const { result } = await updateCustomerWorkflow(req.scope).run({
      input: {
        id,
        first_name,
        last_name,
        phone,
        dob,
        gender,
        is_admin,
        is_driver,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    if (error.message?.includes("Invalid date")) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid date format provided",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update customer",
    });
  }
}
