const APP_URL = "https://countdown-timer-app.fly.dev"; // TODO: update with actual deployed URL

export async function fetchTimers(shop, productId) {
  try {
    const url = `${APP_URL}/api/storefront/timers?shop=${encodeURIComponent(shop)}&productId=${encodeURIComponent(productId)}`;
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
  fetch(`${APP_URL}/api/storefront/impression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shop, timerId }),
  }).catch(() => {});
}
