import rateLimit from "express-rate-limit";

// admin routes — 100 requests per minute per shop
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, try again later" },
});

// storefront widget — higher limit since it gets hit by every page view
export const widgetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: "Too many requests" },
});
