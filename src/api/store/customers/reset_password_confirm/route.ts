import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { IAuthModuleService } from "@medusajs/framework/types";
import { MedusaError, Modules } from "@medusajs/framework/utils";

// /store/customers/reset_password_confirm/ - reset password confirmation for a customer
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH);

  const updateData = {
    ...(req.body as Record<string, unknown>),
    entity_id: req.auth_context.actor_id, // comes from the validated token
  };

  const { authIdentity, success, error } = await authService.updateProvider(
    "emailpass",
    updateData
  );

  if (success && authIdentity) {
    return res.status(200).json({ success: true });
  }

  throw new MedusaError(
    MedusaError.Types.UNAUTHORIZED,
    error || "Unauthorized"
  );
};
