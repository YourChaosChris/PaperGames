// storage-warning.js
// Shows a small, dismissible banner the first time a game's progress or
// win/loss record actually fails to save - localStorage full, or
// unavailable entirely (e.g. private browsing on some browsers) -
// instead of the failure being silently swallowed by GameStorage.save()
// / GameStats.record()'s own try/catch, only to be discovered later as
// "my progress just vanished" with no clue why. Reuses
// update-banner.js/error-banner.js's shape (an in-flow bar at the top
// of the page) for visual consistency, and - unlike those two - has no
// reload button, since reloading doesn't fix full/disabled storage.
//
// This module only shows the banner; it doesn't watch localStorage
// itself. GameStorage.save() and GameStats.record() each call
// StorageWarning.show() from their own catch block when a write fails.

const StorageWarning = (function () {
  let shown = false;

  function label(key, fallback) {
    return (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : fallback;
  }

  function show() {
    if (shown || !document.body) return;
    shown = true;

    const bar = document.createElement("div");
    bar.id = "storage-warning-banner";
    bar.className = "update-banner";
    bar.setAttribute("role", "alert");

    const text = document.createElement("span");
    text.className = "update-banner-text";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "secondary small update-banner-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => bar.remove());

    function setLabels() {
      text.textContent = label("storage_warning_text",
        "Your progress could not be saved. Storage may be full or unavailable (e.g. private browsing).");
      closeBtn.setAttribute("aria-label", label("update_banner_dismiss", "Dismiss"));
    }
    setLabels();
    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(setLabels);
    }

    bar.appendChild(text);
    bar.appendChild(closeBtn);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  return { show };
})();

if (typeof window !== "undefined") {
  window.StorageWarning = StorageWarning;
}
