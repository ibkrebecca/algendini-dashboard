import {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";

// simple in-memory rate limiter (use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  return (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const key = (req.headers["x-api-key"] as string) || req.ip;
    const now = Date.now();

    // clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }

    const current = rateLimitStore.get(key!);

    if (!current) {
      rateLimitStore.set(key!, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > current.resetTime) {
      rateLimitStore.set(key!, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded",
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      });
    }

    current.count++;
    next();
  };
}
