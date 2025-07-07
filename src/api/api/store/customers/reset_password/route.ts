import { generateResetPasswordTokenWorkflow } from "@medusajs/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ResetPasswordRequestType } from "@medusajs/medusa/api/auth/validators";

// /api/store/customers/reset_password/ - reset password for a customer
export const POST = async (
  req: AuthenticatedMedusaRequest<ResetPasswordRequestType>,
  res: MedusaResponse
) => {
  const { identifier } = req.validatedBody;

  const { http } = req.scope.resolve(
    ContainerRegistrationKeys.CONFIG_MODULE
  ).projectConfig;

  await generateResetPasswordTokenWorkflow(req.scope).run({
    input: {
      entityId: identifier,
      actorType: "customer",
      provider: "emailpass",
      secret: http.jwtSecret!,
    },
    throwOnError: false, // we don't want to throw on error to avoid leaking information about non-existing identities
  });

  res.sendStatus(201);
};

export const AUTHENTICATE = false;
