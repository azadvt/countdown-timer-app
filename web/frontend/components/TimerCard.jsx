import { Card, Text, Badge, Popover, ActionList, Button } from "@shopify/polaris";
import { useState, useCallback } from "react";

function getStatusBadge(status) {
  switch (status) {
    case "active":
      return <Badge tone="success">Active</Badge>;
    case "scheduled":
      return <Badge tone="attention">Scheduled</Badge>;
    case "expired":
      return <Badge tone="critical">Expired</Badge>;
    case "inactive":
      return <Badge>Inactive</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimerCard({ timer, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  const handleEdit = useCallback(() => {
    setMenuOpen(false);
    onEdit(timer);
  }, [timer, onEdit]);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    onDelete(timer._id);
  }, [timer, onDelete]);

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e1e3e5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Text variant="bodyMd" fontWeight="bold">
              {timer.name}
            </Text>
            {getStatusBadge(timer.status)}
            <Badge tone="info">{timer.type === "fixed" ? "Fixed" : "Evergreen"}</Badge>
          </div>

          {timer.description && (
            <Text variant="bodySm" color="subdued">
              {timer.description}
            </Text>
          )}

          <div style={{ marginTop: "4px" }}>
            <Text variant="bodySm" color="subdued">
              {timer.type === "fixed" && timer.startDate
                ? `Start: ${formatDate(timer.startDate)}`
                : `Duration: ${Math.floor((timer.duration || 0) / 60)} min`}
              {timer.impressions > 0 && ` · ${timer.impressions.toLocaleString()} impressions`}
            </Text>
          </div>
        </div>

        <Popover
          active={menuOpen}
          activator={
            <Button variant="plain" onClick={toggleMenu}>
              ⋯
            </Button>
          }
          onClose={toggleMenu}
        >
          <ActionList
            items={[
              { content: "Edit", onAction: handleEdit },
              { content: "Delete", destructive: true, onAction: handleDelete },
            ]}
          />
        </Popover>
      </div>
    </div>
  );
}
