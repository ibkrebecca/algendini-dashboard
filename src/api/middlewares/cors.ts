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
  const isProd = process.env.NODE_ENV === "production";
  const requestOrigin = req.headers.origin as string;
  const appUrl = process.env.APP_URL;

  const prodOrigins = appUrl!.split(",").map((url) => url.trim());
  const devOrigins = ["http://localhost:9000"];

  const allowedOrigins = isProd ? prodOrigins : devOrigins;
  let allowedOrigin: string;

  const inLocal1 = !isProd && requestOrigin?.startsWith("http://localhost");
  const inLocal2 = !isProd && requestOrigin?.startsWith("http://127.0.0.1");

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else if (inLocal1) {
    allowedOrigin = requestOrigin;
  } else if (inLocal2) {
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
