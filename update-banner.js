// update-banner.js
// Tells the player when a new version of the app has just taken over in
// the background, since the page they're currently looking at is still
// running the previous version's HTML/CSS/JS in memory even though new
// network requests are now served by the new one - reloading brings it
// back in sync. sw.js calls self.skipWaiting() + clients.claim(), so an
// update activates immediately rather than waiting for every open tab
// to close first; the standard "controllerchange" event fires exactly
// when that happens, the usual signal PWAs use for this.
//
// The very first visit also fires one controllerchange - the freshly
// registered worker taking control of a page that had no controller
// yet, not a real update - so that first change is swallowed before any
// later one is treated as an actual update.

(function () {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  let hadController = !!navigator.serviceWorker.controller;
  let ignoredFirstChange = false;

  function label(key, fallback) {
    return (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : fallback;
  }

  function showBanner() {
    if (document.getElementById("update-banner")) return;

    const bar = document.createElement("div");
    bar.id = "update-banner";
    bar.className = "update-banner";
    bar.setAttribute("role", "status");

    const text = document.createElement("span");
    text.className = "update-banner-text";

    const reloadBtn = document.createElement("button");
    reloadBtn.type = "button";
    reloadBtn.className = "primary small";
    reloadBtn.addEventListener("click", () => window.location.reload());

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "secondary small update-banner-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => bar.remove());

    function setLabels() {
      text.textContent = label("update_banner_text", "A new version of PaperGames is available.");
      reloadBtn.textContent = label("update_banner_reload", "Reload now");
      closeBtn.setAttribute("aria-label", label("update_banner_dismiss", "Dismiss"));
    }
    setLabels();
    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(setLabels);
    }

    bar.appendChild(text);
    bar.appendChild(reloadBtn);
    bar.appendChild(closeBtn);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController && !ignoredFirstChange) {
      ignoredFirstChange = true;
      hadController = true;
      return;
    }
    showBanner();
  });
})();
