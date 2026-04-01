import Timer from "../models/Timer.js";

export async function getActiveTimers(req, res, next) {
  try {
    const { shop, productId } = req.query;

    if (!shop || !productId) {
      return res.status(400).json({ error: "shop and productId are required" });
    }

    const now = new Date();

    // find timers that could apply to this product
    const timers = await Timer.find({
      shop,
      isActive: true,
      $or: [
        // fixed timers that are currently running
        { type: "fixed", startDate: { $lte: now }, endDate: { $gt: now } },
        // evergreen timers are always "running" — expiry is handled client-side
        { type: "evergreen" },
      ],
    })
      .select("-shop -__v")
      .lean();

    // filter by targeting
    const matching = timers.filter((t) => {
      if (t.targetType === "all") return true;
      if (t.targetType === "products") return t.targetIds.includes(productId);
      // collections are checked by ID too — the widget passes collection IDs
      if (t.targetType === "collections") return t.targetIds.includes(productId);
      return false;
    });

    // cache for 60 seconds — timer config doesn't change often
    res.set("Cache-Control", "public, max-age=60");
    res.json(matching);
  } catch (err) {
    next(err);
  }
}
