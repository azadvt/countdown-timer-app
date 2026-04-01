import { useState, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from "./useApi";

export function useTimers() {
  const fetch = useAuthenticatedFetch();
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTimers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/timers");
      if (!res.ok) throw new Error("Failed to load timers");
      const data = await res.json();
      setTimers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  const createTimer = useCallback(
    async (timerData) => {
      const res = await fetch("/api/timers", {
        method: "POST",
        body: JSON.stringify(timerData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create timer");
      }
      const created = await res.json();
      setTimers((prev) => [created, ...prev]);
      return created;
    },
    [fetch]
  );

  const updateTimer = useCallback(
    async (id, timerData) => {
      const res = await fetch(`/api/timers/${id}`, {
        method: "PUT",
        body: JSON.stringify(timerData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update timer");
      }
      const updated = await res.json();
      setTimers((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return updated;
    },
    [fetch]
  );

  const deleteTimer = useCallback(
    async (id) => {
      const res = await fetch(`/api/timers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete timer");
      setTimers((prev) => prev.filter((t) => t._id !== id));
    },
    [fetch]
  );

  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

  return { timers, loading, error, loadTimers, createTimer, updateTimer, deleteTimer };
}
