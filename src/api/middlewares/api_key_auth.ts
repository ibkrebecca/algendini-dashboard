import {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";
import { IS_PROD } from "@/lib/env";

declare module "@medusajs/framework/http" {
  interface MedusaRequest {
    apiKeyInfo?: {
      key: string;
      timestamp: number;
    };
  }
}

export function apiKeyAuth(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  // get API key from header
  const apiKey = req.headers["x-publishable-api-key"] as string;

  // check if API key exists
  if (!apiKey) {
    res.status(401).json({
      error: "Unauthorized",
      message: "API key is required",
    });
    return;
  }

  // validate API key (you should store this securely in environment variables)
  const LOCAL_PUBLIC_KEY = process.env.LOCAL_PUBLIC_KEY!;
  const PUBLIC_KEY = process.env.PUBLIC_KEY!;

  const localPublicKey = LOCAL_PUBLIC_KEY?.split(",") || [];
  const prodPublicKey = PUBLIC_KEY?.split(",") || [];
  const publicKey = IS_PROD ? prodPublicKey : localPublicKey;

  if (!publicKey.includes(apiKey)) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid API key",
    });
    return;
  }

  // add rate limiting info to request
  req.apiKeyInfo = {
    key: apiKey,
    timestamp: Date.now(),
  };

  next();
}
