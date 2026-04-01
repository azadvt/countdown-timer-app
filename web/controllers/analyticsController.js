import Analytics from "../models/Analytics.js";
import Timer from "../models/Timer.js";

export async function getTimerAnalytics(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;

    // make sure this timer belongs to the shop
    const timer = await Timer.findOne({ _id: req.params.id, shop });
    if (!timer) {
      return res.status(404).json({ error: "Timer not found" });
    }

    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const records = await Analytics.find({
      timerId: req.params.id,
      date: { $gte: sinceStr },
    })
      .sort({ date: 1 })
      .lean();

    res.json({
      timerId: req.params.id,
      timerName: timer.name,
      totalImpressions: timer.impressions,
      daily: records,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOverview(req, res, next) {
  try {
    const shop = res.locals.shopify.session.shop;

    const timers = await Timer.find({ shop })
      .select("name impressions type isActive")
      .sort({ impressions: -1 })
      .lean();

    const totalImpressions = timers.reduce((sum, t) => sum + t.impressions, 0);

    res.json({
      totalTimers: timers.length,
      totalImpressions,
      timers,
    });
  } catch (err) {
    next(err);
  }
}

// public route — called from storefront widget
export async function trackImpression(req, res, next) {
  try {
    const { shop, timerId } = req.body;

    if (!shop || !timerId) {
      return res.status(400).json({ error: "shop and timerId are required" });
    }

    const today = new Date().toISOString().split("T")[0];

    // increment daily analytics
    await Analytics.findOneAndUpdate(
      { timerId, date: today },
      { $inc: { impressions: 1 }, $setOnInsert: { shop } },
      { upsert: true }
    );

    // increment total on timer
    await Timer.findByIdAndUpdate(timerId, { $inc: { impressions: 1 } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
