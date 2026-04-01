import { h, render } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { fetchTimers, trackImpression } from "./utils/api.js";
import { getEvergreenEnd } from "./utils/evergreen.js";
import { getRemaining } from "./utils/time.js";

function CountdownWidget({ timer, shop }) {
  const [remaining, setRemaining] = useState(null);
  const [expired, setExpired] = useState(false);
  const endTimeRef = useRef(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    // figure out end time
    if (timer.type === "fixed") {
      endTimeRef.current = new Date(timer.endDate).getTime();
    } else {
      endTimeRef.current = getEvergreenEnd(timer._id, timer.duration);
    }

    // track impression once
    if (!trackedRef.current) {
      trackImpression(shop, timer._id);
      trackedRef.current = true;
    }

    // countdown loop
    let rafId;
    function tick() {
      const rem = getRemaining(endTimeRef.current);
      if (!rem) {
        setExpired(true);
        setRemaining(null);
        return;
      }
      setRemaining(rem);
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => cancelAnimationFrame(rafId);
  }, [timer, shop]);

  if (expired || !remaining) return null;

  const style = timer.style || {};
  const isUrgent = remaining.totalSec < (style.urgencyThreshold || 3600);
  const bgColor = style.accentColor || "#1a1a2e";
  const message = style.message || "YOUR SPECIAL OFFER ENDS IN";

  const urgencyEffect = isUrgent && style.urgencyEffect === "color_pulse"
    ? "ct-pulse"
    : isUrgent && style.urgencyEffect === "shake"
    ? "ct-shake"
    : isUrgent && style.urgencyEffect === "glow"
    ? "ct-glow"
    : "";

  return h("div", {
    class: "ct-widget " + urgencyEffect,
    style: {
      border: "1px solid #e1e3e5",
      borderRadius: "8px",
      padding: "16px",
      textAlign: "center",
      marginTop: "12px",
      fontFamily: "inherit",
      background: "#fff",
    },
  }, [
    h("style", null, `
      .ct-widget { transition: all 0.3s ease; }
      @keyframes ct-pulse-anim { 0%,100%{opacity:1} 50%{opacity:0.7} }
      @keyframes ct-shake-anim { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)} }
      .ct-pulse { animation: ct-pulse-anim 1s infinite; }
      .ct-shake { animation: ct-shake-anim 0.5s infinite; }
      .ct-glow { box-shadow: 0 0 12px ${bgColor}66; }
      .ct-time-digit { display:inline-block; background:#1a1a2e; color:#fff; padding:6px 10px; border-radius:4px; font-size:20px; font-weight:700; min-width:36px; font-variant-numeric:tabular-nums; }
      .ct-time-sep { font-size:20px; font-weight:700; padding:0 4px; color:#333; }
    `),
    h("p", {
      style: {
        margin: "0 0 10px",
        fontSize: "13px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        color: "#333",
      },
    }, message),
    h("div", null, [
      h("span", { class: "ct-time-digit" }, remaining.hours),
      h("span", { class: "ct-time-sep" }, ":"),
      h("span", { class: "ct-time-digit" }, remaining.minutes),
      h("span", { class: "ct-time-sep" }, ":"),
      h("span", { class: "ct-time-digit" }, remaining.seconds),
    ]),
  ]);
}

function App({ shop, productId }) {
  const [timers, setTimers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchTimers(shop, productId).then((data) => {
      setTimers(data);
      setLoaded(true);
    });
  }, [shop, productId]);

  if (!loaded || timers.length === 0) return null;

  // show the first matching timer
  return h(CountdownWidget, { timer: timers[0], shop });
}

// mount
(function () {
  const root = document.getElementById("countdown-timer-root");
  if (!root) return;

  const shop = root.dataset.shop;
  const productId = root.dataset.productId;
  if (!shop || !productId) return;

  render(h(App, { shop, productId }), root);
})();
