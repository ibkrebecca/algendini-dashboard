import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { registerCustomerWorkflow } from "../../../../../workflows/customer/register";

// define the request body type
interface RegisterCustomerRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  dob: string;
  gender: "male" | "female";
  is_admin: boolean;
  is_driver: boolean;
}

// /api/store/customers/register/ - register a new customer
export async function POST(
  req: MedusaRequest<RegisterCustomerRequest>,
  res: MedusaResponse
): Promise<void> {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      avatar_url,
      dob,
      gender,
      is_admin = false,
      is_driver = false,
    } = req.body as RegisterCustomerRequest;

    // validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: "Bad Request",
        message: "Email and password are required",
      });
    }

    const { result } = await registerCustomerWorkflow(req.scope).run({
      input: {
        email,
        password,
        first_name,
        last_name,
        phone,
        avatar_url,
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
        avatar_url: result.extendedCustomer.avatar_url,
        dob: result.extendedCustomer.dob,
        gender: result.extendedCustomer.gender,
        is_admin: result.extendedCustomer.is_admin,
        is_driver: result.extendedCustomer.is_driver,
      },
      message: "Customer registered successfully",
    });
  } catch (error) {
    console.error("Error registering customer:", error);

    if (error.message?.includes("already exists")) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
    }

    if (error.message?.includes("email")) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid email format",
      });
    }

    if (error.message?.includes("password")) {
      res.status(400).json({
        error: "Bad Request",
        message: "Password does not meet requirements",
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to register customer",
    });
  }
}
