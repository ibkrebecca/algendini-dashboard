import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { generateResetPasswordTokenWorkflow } from "@medusajs/medusa/core-flows";
import { JWT_SECRET } from "../../../../../lib/constants";

// define the request body type
interface ResetPasswordRequest {
  email: string;
}

// /api/store/customers/reset_password/ - reset password for a customer
export async function POST(
  req: MedusaRequest<ResetPasswordRequest>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email } = req.body as ResetPasswordRequest;

    // validate required fields
    if (!email) {
      res.status(400).json({
        error: "Bad Request",
        message: "Customer email is required",
      });
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid email format",
      });
    }

    // run the medusa workflow to generate a reset password token
    await generateResetPasswordTokenWorkflow(req.scope).run({
      input: {
        entityId: email,
        actorType: "customer",
        provider: "emailpass",
        secret: JWT_SECRET || "supersecret",
      },
    });

    // return success response without sensitive data
    res.status(201).json({
      message: "You will receive an email with a link to reset the password.",
    });
  } catch (error) {
    console.error("Error resetting password for customer:", error);

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to reset password for customer",
    });
  }
}
