import { Router } from "express";
import { getTimerAnalytics, getOverview } from "../controllers/analyticsController.js";
import { idParam, handleValidation } from "../middleware/validate.js";

const router = Router();

router.get("/overview", getOverview);
router.get("/:id", idParam, handleValidation, getTimerAnalytics);

export default router;
