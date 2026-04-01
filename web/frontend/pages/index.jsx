import { useState, useCallback, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Spinner,
  Banner,
  EmptyState,
  Text,
} from "@shopify/polaris";
import TimerCard from "../components/TimerCard";
import TimerModal from "../components/TimerModal";
import { useTimers } from "../hooks/useTimers";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Expired", value: "expired" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Most impressions", value: "impressions" },
];

export default function DashboardPage() {
  const { timers, loading, error, createTimer, updateTimer, deleteTimer } = useTimers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [toastMsg, setToastMsg] = useState(null);

  const openCreateModal = useCallback(() => {
    setEditingTimer(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((timer) => {
    setEditingTimer(timer);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTimer(null);
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      setSaving(true);
      try {
        if (editingTimer) {
          await updateTimer(editingTimer._id, data);
          setToastMsg("Timer updated");
        } else {
          await createTimer(data);
          setToastMsg("Timer created");
        }
        closeModal();
      } catch (err) {
        setToastMsg(err.message);
      } finally {
        setSaving(false);
      }
    },
    [editingTimer, createTimer, updateTimer, closeModal]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this timer?")) return;
      try {
        await deleteTimer(id);
        setToastMsg("Timer deleted");
      } catch (err) {
        setToastMsg(err.message);
      }
    },
    [deleteTimer]
  );

  // filter and sort
  const filtered = useMemo(() => {
    let result = [...timers];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "impressions") {
      result.sort((a, b) => b.impressions - a.impressions);
    }

    return result;
  }, [timers, search, statusFilter, sort]);

  return (
    <Page
      title="Countdown Timer Manager"
      subtitle="Create and manage countdown timers for your promotions"
      primaryAction={{ content: "+ Create timer", onAction: openCreateModal }}
    >
      {toastMsg && (
        <div style={{ marginBottom: "16px" }}>
          <Banner onDismiss={() => setToastMsg(null)}>{toastMsg}</Banner>
        </div>
      )}

      <Layout>
        <Layout.Section>
          <Card padding="0">
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e1e3e5" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <TextField
                    placeholder="Search timers"
                    value={search}
                    onChange={setSearch}
                    clearButton
                    onClearButtonClick={() => setSearch("")}
                    autoComplete="off"
                    labelHidden
                    label="Search"
                  />
                </div>
                <div style={{ width: "160px" }}>
                  <Select
                    label="Status"
                    labelHidden
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
                <div style={{ width: "180px" }}>
                  <Select
                    label="Sort"
                    labelHidden
                    options={SORT_OPTIONS}
                    value={sort}
                    onChange={setSort}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Spinner size="large" />
              </div>
            ) : error ? (
              <div style={{ padding: "16px" }}>
                <Banner tone="critical">{error}</Banner>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                heading="No timers yet"
                action={{ content: "Create timer", onAction: openCreateModal }}
                image=""
              >
                <p>Create your first countdown timer to boost sales with urgency.</p>
              </EmptyState>
            ) : (
              filtered.map((timer) => (
                <TimerCard
                  key={timer._id}
                  timer={timer}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))
            )}

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                <Text variant="bodySm" color="subdued">
                  {filtered.length} timer{filtered.length !== 1 ? "s" : ""}
                </Text>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>

      <TimerModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        timer={editingTimer}
        saving={saving}
      />
    </Page>
  );
}
