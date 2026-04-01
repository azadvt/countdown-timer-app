import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true },
    timerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timer",
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

analyticsSchema.index({ timerId: 1, date: 1 }, { unique: true });
analyticsSchema.index({ shop: 1 });

export default mongoose.model("Analytics", analyticsSchema);
