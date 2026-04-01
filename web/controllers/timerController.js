import Timer from "../models/Timer.js";

export async function listTimers(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;
    const { status } = req.query;

    const timers = await Timer.find({ shop }).sort({ createdAt: -1 }).lean();

    // compute status for each timer and filter if needed
    const now = new Date();
    const result = timers.map((t) => {
      let computedStatus;
      if (!t.isActive) {
        computedStatus = "inactive";
      } else if (t.type === "evergreen") {
        computedStatus = "active";
      } else if (t.startDate > now) {
        computedStatus = "scheduled";
      } else if (t.endDate < now) {
        computedStatus = "expired";
      } else {
        computedStatus = "active";
      }
      return { ...t, status: computedStatus };
    });

    if (status) {
      return res.json(result.filter((t) => t.status === status));
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTimer(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;
    const timer = await Timer.findOne({ _id: req.params.id, shop });

    if (!timer) {
      return res.status(404).json({ error: "Timer not found" });
    }

    res.json(timer);
  } catch (err) {
    next(err);
  }
}

export async function createTimer(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;
    const { name, type, startDate, endDate, duration, targetType, targetIds, style, isActive } = req.body;

    // type-specific validation
    if (type === "fixed") {
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Fixed timers need start and end dates" });
      }
      if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({ error: "End date must be after start date" });
      }
    }

    if (type === "evergreen" && !duration) {
      return res.status(400).json({ error: "Evergreen timers need a duration" });
    }

    const timer = await Timer.create({
      shop,
      name,
      type,
      startDate: type === "fixed" ? startDate : undefined,
      endDate: type === "fixed" ? endDate : undefined,
      duration: type === "evergreen" ? duration : undefined,
      targetType: targetType || "all",
      targetIds: targetIds || [],
      style: style || {},
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(timer);
  } catch (err) {
    next(err);
  }
}

export async function updateTimer(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;
    const timer = await Timer.findOne({ _id: req.params.id, shop });

    if (!timer) {
      return res.status(404).json({ error: "Timer not found" });
    }

    const allowed = ["name", "type", "startDate", "endDate", "duration", "targetType", "targetIds", "style", "isActive"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        timer[key] = req.body[key];
      }
    }

    await timer.save();
    res.json(timer);
  } catch (err) {
    next(err);
  }
}

export async function deleteTimer(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;
    const timer = await Timer.findOneAndDelete({ _id: req.params.id, shop });

    if (!timer) {
      return res.status(404).json({ error: "Timer not found" });
    }

    res.json({ message: "Timer deleted" });
  } catch (err) {
    next(err);
  }
}
