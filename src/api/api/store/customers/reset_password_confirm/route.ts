import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// define the request body type
interface ConfirmResetPasswordRequest {
  email: string;
  token: string;
  new_password: string;
}

// /api/store/customers/reset_password_confirm/ - reset password confirmation for a customer
export async function POST(
  req: MedusaRequest<ConfirmResetPasswordRequest>,
  res: MedusaResponse
): Promise<void> {
  const authModuleService = req.scope.resolve(Modules.AUTH);

  try {
    const { email, token, new_password } =
      req.body as ConfirmResetPasswordRequest;

    // validate required fields
    if (!token || !new_password || !email) {
      res.status(400).json({
        error: "Bad Request",
        message: "Token, email and new password are required",
      });
      return;
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid email format",
      });
    }

    // validate password strength
    if (new_password.length < 8) {
      res.status(400).json({
        error: "Bad Request",
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    // run the medusa auth module to update password
    const { success } = await authModuleService.updateProvider("emailpass", {
      entity_id: email,
      password: new_password,
      token,
    });

    console.log(success);

    if (!success) {
      res.status(400).json({
        error: "Bad Request",
        message: "Failed to update password. Invalid token or email.",
      });
    } else {
      res.status(200).json({
        message: "Password has been successfully reset",
      });
    }
  } catch (error) {
    console.error("Error updating password for customer:", error);

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update password for customer",
    });
  }
}
