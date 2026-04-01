import { body, param, query, validationResult } from "express-validator";

// run validation and return errors if any
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const timerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("type").isIn(["fixed", "evergreen"]).withMessage("Type must be fixed or evergreen"),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  body("duration").optional().isInt({ min: 60 }).withMessage("Duration must be at least 60 seconds"),
  body("targetType").optional().isIn(["all", "products", "collections"]),
  body("targetIds").optional().isArray(),
  body("style").optional().isObject(),
  body("style.backgroundColor").optional().isString(),
  body("style.textColor").optional().isString(),
  body("style.accentColor").optional().isString(),
  body("style.position")
    .optional()
    .isIn(["top", "bottom", "above_title", "below_title", "below_price"]),
  body("style.size").optional().isIn(["small", "medium", "large"]),
  body("style.urgencyEffect")
    .optional()
    .isIn(["none", "color_pulse", "shake", "glow"]),
  body("style.message").optional().isString().trim(),
];

export const idParam = [
  param("id").isMongoId().withMessage("Invalid timer ID"),
];

export const widgetQuery = [
  query("shop").notEmpty().withMessage("Shop is required"),
  query("productId").notEmpty().withMessage("Product ID is required"),
];
