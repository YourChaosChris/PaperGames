// force-update.js
// Wipes the service worker and every cache, then reloads a fresh copy.
// Normally the service worker's stale-while-revalidate strategy catches up
// within a reload or two (see sw.js), but some e-reader browsers appear to
// cache more aggressively than that - this gives those users an explicit
// way to start fresh, at the cost of needing to be online for it to work.
//
// ForceUpdate.run(statusEl, button) does the work; it is used by the
// "Force update now" button on guide.html and by the one in the settings
// dialog (settings-menu.js), which is why this file is loaded on every page.
const ForceUpdate = (function () {
  async function run(statusEl, button) {
    if (button) button.disabled = true;
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (e) {
      // Best effort - fall through to the reload regardless, since a
      // cache-busted URL bypasses both the service worker and the
      // browser's own HTTP cache on its own.
    }
    if (statusEl) statusEl.textContent = (window.I18n && window.I18n.t("guide_update_done")) || "Cache cleared. Reloading…";
    setTimeout(() => {
      window.location.href = window.location.pathname + "?_fresh=" + Date.now();
    }, 400);
  }

  function initGuideButton() {
    const btn = document.getElementById("force-update-button");
    if (!btn) return;
    btn.addEventListener("click", () => run(document.getElementById("force-update-status"), btn));
  }

  document.addEventListener("DOMContentLoaded", initGuideButton);

  return { run };
})();

if (typeof window !== "undefined") {
  window.ForceUpdate = ForceUpdate;
}
