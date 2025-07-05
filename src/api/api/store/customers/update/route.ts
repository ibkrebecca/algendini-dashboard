import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateCustomerWorkflow } from "../../../../../workflows/customer/update";

// define the request body type
interface RegisterCustomerRequest {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female";
  is_admin?: boolean;
  is_driver?: boolean;
}

// /api/store/customers/update/ - update a customer
export async function POST(
  req: MedusaRequest<RegisterCustomerRequest>,
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
    } = req.body as RegisterCustomerRequest;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer id is required",
      });
    }

    // validate dob format if provided
    if (dob) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateRegex.test(dob)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid date format for dob. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        });
        return;
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

    // return success response without sensitive data
    res.status(201).json({
      customer: {
        id: result.customer.id,
        email: result.customer.email,
        first_name: result.customer.first_name,
        last_name: result.customer.last_name,
        phone: result.customer.phone,
        created_at: result.customer.created_at,
        dob: result.extendedCustomer.dob,
        gender: result.extendedCustomer.gender,
        is_admin: result.extendedCustomer.is_admin,
        is_driver: result.extendedCustomer.is_driver,
      },
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
      return;
    }

    if (error.message?.includes("Invalid date")) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid date format provided",
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update customer",
    });
  }
}
