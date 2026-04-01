import { Router } from "express";
import { getActiveTimers } from "../controllers/widgetController.js";
import { trackImpression } from "../controllers/analyticsController.js";
import { widgetLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// public routes — no shopify auth, just rate limiting
router.get("/timers", widgetLimiter, getActiveTimers);
router.post("/impression", widgetLimiter, trackImpression);

export default router;
