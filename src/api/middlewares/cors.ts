import {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";

export function corsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  let allowedOrigin: string;
  const requestOrigin = req.headers.origin as string;

  const APP_URL = process.env.APP_URL!;
  const allowedOrigins = APP_URL!.split(",").map((url) => url.trim());

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else {
    allowedOrigin = allowedOrigins[0];
  }

  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
