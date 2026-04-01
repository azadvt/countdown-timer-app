import { Router } from "express";
import { listTimers, getTimer, createTimer, updateTimer, deleteTimer } from "../controllers/timerController.js";
import { timerRules, idParam, handleValidation } from "../middleware/validate.js";

const router = Router();

router.get("/", listTimers);
router.get("/:id", idParam, handleValidation, getTimer);
router.post("/", timerRules, handleValidation, createTimer);
router.put("/:id", idParam, timerRules, handleValidation, updateTimer);
router.delete("/:id", idParam, handleValidation, deleteTimer);

export default router;
