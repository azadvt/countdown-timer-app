import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  FormLayout,
  TextField,
  Select,
  ColorPicker,
  hsbToHex,
  hexToHsb,
} from "@shopify/polaris";

const TIMER_TYPES = [
  { label: "Fixed (specific start & end)", value: "fixed" },
  { label: "Evergreen (per-visitor session)", value: "evergreen" },
];

const POSITIONS = [
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Above title", value: "above_title" },
  { label: "Below title", value: "below_title" },
  { label: "Below price", value: "below_price" },
];

const SIZES = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const URGENCY_EFFECTS = [
  { label: "None", value: "none" },
  { label: "Color pulse", value: "color_pulse" },
  { label: "Shake", value: "shake" },
  { label: "Glow", value: "glow" },
];

const TARGET_TYPES = [
  { label: "All products", value: "all" },
  { label: "Specific products", value: "products" },
  { label: "Specific collections", value: "collections" },
];

const defaultForm = {
  name: "",
  description: "",
  type: "fixed",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  duration: "3600",
  targetType: "all",
  targetIds: "",
  position: "top",
  size: "medium",
  urgencyEffect: "color_pulse",
  message: "Sale ends in:",
};

export default function TimerModal({ open, onClose, onSubmit, timer, saving }) {
  const [form, setForm] = useState(defaultForm);
  const [color, setColor] = useState({ hue: 120, saturation: 1, brightness: 0.6 });
  const [errors, setErrors] = useState({});

  // populate form when editing
  useEffect(() => {
    if (timer) {
      const start = timer.startDate ? new Date(timer.startDate) : null;
      const end = timer.endDate ? new Date(timer.endDate) : null;

      setForm({
        name: timer.name || "",
        description: timer.description || "",
        type: timer.type || "fixed",
        startDate: start ? start.toISOString().split("T")[0] : "",
        startTime: start ? start.toTimeString().slice(0, 5) : "",
        endDate: end ? end.toISOString().split("T")[0] : "",
        endTime: end ? end.toTimeString().slice(0, 5) : "",
        duration: timer.duration ? String(timer.duration) : "3600",
        targetType: timer.targetType || "all",
        targetIds: timer.targetIds ? timer.targetIds.join(", ") : "",
        position: timer.style?.position || "top",
        size: timer.style?.size || "medium",
        urgencyEffect: timer.style?.urgencyEffect || "color_pulse",
        message: timer.style?.message || "Sale ends in:",
      });

      if (timer.style?.accentColor) {
        try {
          setColor(hexToHsb(timer.style.accentColor));
        } catch (e) {
          // keep default color
        }
      }
    } else {
      setForm(defaultForm);
      setColor({ hue: 120, saturation: 1, brightness: 0.6 });
    }
    setErrors({});
  }, [timer, open]);

  const handleChange = useCallback((field) => {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Timer name is required";

    if (form.type === "fixed") {
      if (!form.startDate) errs.startDate = "Start date is required";
      if (!form.endDate) errs.endDate = "End date is required";
    }

    if (form.type === "evergreen") {
      const dur = parseInt(form.duration);
      if (!dur || dur < 60) errs.duration = "Duration must be at least 60 seconds";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      targetType: form.targetType,
      targetIds: form.targetIds
        ? form.targetIds.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      style: {
        accentColor: hsbToHex(color),
        position: form.position,
        size: form.size,
        urgencyEffect: form.urgencyEffect,
        message: form.message,
      },
    };

    if (form.type === "fixed") {
      payload.startDate = new Date(`${form.startDate}T${form.startTime || "00:00"}`).toISOString();
      payload.endDate = new Date(`${form.endDate}T${form.endTime || "23:59"}`).toISOString();
    } else {
      payload.duration = parseInt(form.duration);
    }

    onSubmit(payload);
  }, [form, color, validate, onSubmit]);

  const title = timer ? "Edit Timer" : "Create New Timer";
  const primaryAction = {
    content: timer ? "Save changes" : "Create timer",
    onAction: handleSubmit,
    loading: saving,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={primaryAction}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Timer name"
            value={form.name}
            onChange={handleChange("name")}
            requiredIndicator
            error={errors.name}
            placeholder="Enter timer name"
            autoComplete="off"
          />

          <Select
            label="Timer type"
            options={TIMER_TYPES}
            value={form.type}
            onChange={handleChange("type")}
          />

          {form.type === "fixed" && (
            <>
              <FormLayout.Group>
                <TextField
                  label="Start date"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange("startDate")}
                  error={errors.startDate}
                  autoComplete="off"
                />
                <TextField
                  label="Start time"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange("startTime")}
                  autoComplete="off"
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  label="End date"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange("endDate")}
                  error={errors.endDate}
                  autoComplete="off"
                />
                <TextField
                  label="End time"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange("endTime")}
                  autoComplete="off"
                />
              </FormLayout.Group>
            </>
          )}

          {form.type === "evergreen" && (
            <TextField
              label="Duration (seconds)"
              type="number"
              value={form.duration}
              onChange={handleChange("duration")}
              error={errors.duration}
              helpText="How long the timer runs for each visitor. e.g. 3600 = 1 hour"
              autoComplete="off"
            />
          )}

          <TextField
            label="Promotion description"
            value={form.description}
            onChange={handleChange("description")}
            multiline={3}
            placeholder="Enter promotion details"
            autoComplete="off"
          />

          <Select
            label="Target"
            options={TARGET_TYPES}
            value={form.targetType}
            onChange={handleChange("targetType")}
          />

          {form.targetType !== "all" && (
            <TextField
              label={form.targetType === "products" ? "Product IDs" : "Collection IDs"}
              value={form.targetIds}
              onChange={handleChange("targetIds")}
              placeholder="Comma-separated IDs"
              helpText="Enter Shopify resource IDs separated by commas"
              autoComplete="off"
            />
          )}

          <div>
            <p style={{ marginBottom: "8px", fontWeight: 500 }}>Timer color</p>
            <ColorPicker onChange={setColor} color={color} />
          </div>

          <FormLayout.Group>
            <Select
              label="Timer size"
              options={SIZES}
              value={form.size}
              onChange={handleChange("size")}
            />
            <Select
              label="Timer position"
              options={POSITIONS}
              value={form.position}
              onChange={handleChange("position")}
            />
          </FormLayout.Group>

          <Select
            label="Urgency notification"
            options={URGENCY_EFFECTS}
            value={form.urgencyEffect}
            onChange={handleChange("urgencyEffect")}
          />

          <TextField
            label="Timer message"
            value={form.message}
            onChange={handleChange("message")}
            placeholder="Sale ends in:"
            autoComplete="off"
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
