import {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";

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

  // validate API key
  const PUBLIC_KEY = process.env.PUBLIC_KEY!;
  const publicKey = PUBLIC_KEY?.split(",") || [];

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
