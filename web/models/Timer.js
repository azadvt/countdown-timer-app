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
    description: {
      type: String,
      trim: true,
      default: "",
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
      size: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      position: {
        type: String,
        enum: ["top", "bottom", "above_title", "below_title", "below_price"],
        default: "top",
      },
      message: { type: String, default: "Sale ends in:" },
      urgencyEffect: {
        type: String,
        enum: ["none", "color_pulse", "shake", "glow"],
        default: "color_pulse",
      },
      urgencyThreshold: { type: Number, default: 3600 },
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
