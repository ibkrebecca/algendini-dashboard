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

  const LOCAL_APP_URL = process.env.LOCAL_APP_URL!;
  const APP_URL = process.env.APP_URL!;

  const isProd = process.env.NODE_ENV === "production";
  const localOrigins = LOCAL_APP_URL.split(",").map((url) => url.trim());
  const prodOrigins = APP_URL!.split(",").map((url) => url.trim());
  const allowedOrigins = isProd ? prodOrigins : localOrigins;

  const inLocal = !isProd && requestOrigin?.startsWith(process.env.APP_URL!);

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else if (inLocal) {
    allowedOrigin = requestOrigin;
  } else {
    allowedOrigin = allowedOrigins[0];

    if (isProd && requestOrigin) {
      console.warn(
        `CORS: Blocked origin ${requestOrigin} in production. Allowed: ${allowedOrigins.join(
          ", "
        )}`
      );
    }
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
