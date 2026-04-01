// Use the app proxy path — Shopify routes /apps/countdown/* to our backend
const PROXY_BASE = "/apps/countdown";

export async function fetchTimers(shop, productId) {
  try {
    const url = `${PROXY_BASE}/timers?shop=${encodeURIComponent(shop)}&productId=${encodeURIComponent(productId)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("Countdown widget: failed to fetch timers", e);
    return [];
  }
}

export function trackImpression(shop, timerId) {
  // fire and forget — don't block rendering
  fetch(`${PROXY_BASE}/impression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shop, timerId }),
  }).catch(() => {});
}
