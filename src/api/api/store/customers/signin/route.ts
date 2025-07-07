import {
  AuthenticationInput,
  ConfigModule,
  IAuthModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { generateJwtTokenForAuthIdentity } from "@medusajs/medusa/api/auth/utils/generate-jwt-token";

// /api/store/customers/signin/ - signin a customer
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const config: ConfigModule = req.scope.resolve(
    ContainerRegistrationKeys.CONFIG_MODULE
  );

  const service: IAuthModuleService = req.scope.resolve(Modules.AUTH);

  const authData = {
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    protocol: req.protocol,
  } as AuthenticationInput;

  const { success, error, authIdentity, location } = await service.authenticate(
    "emailpass",
    authData
  );

  if (location) {
    return res.status(200).json({ location });
  }

  if (success && authIdentity) {
    const { http } = config.projectConfig;

    const token = generateJwtTokenForAuthIdentity(
      {
        authIdentity,
        actorType: "customer",
      },
      {
        secret: http.jwtSecret!,
        expiresIn: http.jwtExpiresIn,
      }
    );

    return res.status(200).json({ token });
  }
  
  throw new MedusaError(
    MedusaError.Types.UNAUTHORIZED,
    error || "Authentication failed"
  );
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  await GET(req, res);
};
