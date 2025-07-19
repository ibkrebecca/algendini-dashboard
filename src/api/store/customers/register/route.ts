import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { registerCustomerWorkflow } from "@/workflows/store/customers/register";
import { generateJwtTokenForAuthIdentity } from "@medusajs/medusa/api/auth/utils/generate-jwt-token";

interface InputType {
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
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE);
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
    } = req.body as InputType;

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
        // pass request context for auth service
        url: req.url,
        headers: req.headers,
        query: req.query,
        protocol: req.protocol,
      },
    });

    // generate JWT token for the authenticated user
    const { http } = config.projectConfig;
    const token: string = generateJwtTokenForAuthIdentity(
      {
        authIdentity: result.auth_identity,
        actorType: "customer",
      },
      {
        secret: http.jwtSecret!,
        expiresIn: http.jwtExpiresIn,
        options: http.jwtOptions,
      }
    );

    res.status(201).json({
      result,
      token,
    });
  } catch (error) {
    console.error("Error registering customer:", error);

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

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to register customer",
    });
  }
}
