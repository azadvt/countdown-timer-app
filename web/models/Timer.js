import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["fixed", "evergreen"],
      required: true,
    },

    // fixed timer
    startDate: { type: Date },
    endDate: { type: Date },

    // evergreen timer — duration in seconds
    duration: { type: Number },

    // targeting
    targetType: {
      type: String,
      enum: ["all", "products", "collections"],
      default: "all",
    },
    targetIds: [String],

    // appearance
    style: {
      backgroundColor: { type: String, default: "#1a1a2e" },
      textColor: { type: String, default: "#ffffff" },
      accentColor: { type: String, default: "#e94560" },
      position: {
        type: String,
        enum: ["above_title", "below_title", "below_price", "below_add_to_cart"],
        default: "below_price",
      },
      message: { type: String, default: "Sale ends in:" },
      urgencyMessage: { type: String, default: "Hurry! Almost over!" },
      urgencyThreshold: { type: Number, default: 3600 }, // seconds
    },

    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// compound index for storefront queries
timerSchema.index({ shop: 1, isActive: 1, targetType: 1 });

// helper to compute status based on dates
timerSchema.methods.getStatus = function () {
  if (!this.isActive) return "inactive";

  if (this.type === "evergreen") return "active";

  const now = new Date();
  if (this.startDate > now) return "scheduled";
  if (this.endDate < now) return "expired";
  return "active";
};

export default mongoose.model("Timer", timerSchema);
