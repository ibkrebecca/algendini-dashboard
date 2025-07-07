import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ConfigModule } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import { registerCustomerWorkflow } from "../../../../workflows/customer/register";
import { generateJwtTokenForAuthIdentity } from "@medusajs/medusa/api/auth/utils/generate-jwt-token";

// Define the request body type
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

// /store/customers/register/ - register a new customer
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

    // get config for JWT generation
    const config: ConfigModule = req.scope.resolve(
      ContainerRegistrationKeys.CONFIG_MODULE
    );

    // run the enhanced workflow
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
        // pass request context for auth service
        url: req.url,
        headers: req.headers,
        query: req.query,
        protocol: req.protocol,
      },
    });

    // generate JWT token for the authenticated user
    const { http } = config.projectConfig;
    const token = generateJwtTokenForAuthIdentity(
      {
        authIdentity: result.authIdentity,
        actorType: "customer",
      },
      {
        secret: http.jwtSecret!,
        expiresIn: http.jwtExpiresIn,
        options: http.jwtOptions,
      }
    );

    //  success response with token and customer data
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
      token,
      message: "Customer registered successfully",
    });
  } catch (error) {
    console.error("Error registering customer:", error);

    // handle specific error cases
    if (
      error.message?.includes("already exists") ||
      error.message?.includes("duplicate") ||
      error.message?.includes("conflict")
    ) {
      res.status(409).json({
        error: "Conflict",
        message: "Customer with this email already exists",
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

    if (error.message?.includes("Authentication")) {
      res.status(401).json({
        error: "Unauthorized",
        message: error.message,
      });
    }

    // Generic server error
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to register customer",
    });
  }
}
