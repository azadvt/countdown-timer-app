const STORAGE_KEY = "ct_evergreen_";

export function getEvergreenEnd(timerId, durationSec) {
  const key = STORAGE_KEY + timerId;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const endTime = parseInt(stored, 10);
      // still valid?
      if (endTime > Date.now()) {
        return endTime;
      }
      // expired — clear and start fresh
      localStorage.removeItem(key);
    }

    // start new session timer
    const endTime = Date.now() + durationSec * 1000;
    localStorage.setItem(key, String(endTime));
    return endTime;
  } catch (e) {
    // localStorage might be blocked (incognito, safari)
    return Date.now() + durationSec * 1000;
  }
}
