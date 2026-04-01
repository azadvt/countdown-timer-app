import { useState, useEffect, useCallback } from "react";
import { Page, Layout, Card, Text, Spinner, Banner, DataTable } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks/useApi";

export default function AnalyticsPage() {
  const fetch = useAuthenticatedFetch();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/overview");
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (loading) {
    return (
      <Page title="Analytics">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <Spinner size="large" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Analytics">
        <Banner tone="critical">{error}</Banner>
      </Page>
    );
  }

  const rows = (overview?.timers || []).map((t) => [
    t.name,
    t.type,
    t.isActive ? "Active" : "Inactive",
    t.impressions.toLocaleString(),
  ]);

  return (
    <Page title="Analytics">
      <Layout>
        <Layout.Section oneThird>
          <Card>
            <div style={{ padding: "16px" }}>
              <Text variant="bodySm" color="subdued">Total timers</Text>
              <Text variant="headingLg">{overview?.totalTimers || 0}</Text>
            </div>
          </Card>
        </Layout.Section>
        <Layout.Section oneThird>
          <Card>
            <div style={{ padding: "16px" }}>
              <Text variant="bodySm" color="subdued">Total impressions</Text>
              <Text variant="headingLg">
                {(overview?.totalImpressions || 0).toLocaleString()}
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <Text variant="headingMd">Impressions by Timer</Text>
            </div>
            {rows.length > 0 ? (
              <DataTable
                columnContentTypes={["text", "text", "text", "numeric"]}
                headings={["Timer", "Type", "Status", "Impressions"]}
                rows={rows}
              />
            ) : (
              <div style={{ padding: "16px" }}>
                <Text color="subdued">No timer data yet.</Text>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
