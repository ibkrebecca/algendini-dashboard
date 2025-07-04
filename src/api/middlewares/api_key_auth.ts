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
  const apiKey = req.headers["x-api-key"] as string;
  
  // check if API key exists
  if (!apiKey) {
    res.status(401).json({
      error: "Unauthorized",
      message: "API key is required",
    });
    return;
  }

  // validate API key (you should store this securely in environment variables)
  const validApiKeys = process.env.API_KEYS?.split(",") || [];

  if (!validApiKeys.includes(apiKey)) {
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
