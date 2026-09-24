// error-banner.js
// Shows a small, dismissible banner on an uncaught error or unhandled
// promise rejection, so a genuine bug doesn't leave a silently broken
// or frozen page with no clue anything went wrong - especially
// important on a device with no developer console to check. Reuses
// update-banner.js's shape (an in-flow bar at the top of the page, not
// a full-page takeover), since one broken feature elsewhere on the
// page shouldn't hide the board state the player is still looking at.
//
// No data about the error is collected or sent anywhere - this project
// has no backend and no analytics (see datenschutz.html) - the banner
// is purely a local, client-side "something broke, try reloading" cue.
//
// Loaded as the very first script on every page (before i18n.js, even)
// so it can catch errors thrown by any script that loads after it -
// which, since plain <script> tags run in document order, is every
// other script on the page.

(function () {
  let shown = false;

  function label(key, fallback) {
    return (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : fallback;
  }

  function showBanner() {
    if (shown || !document.body) return;
    shown = true;

    const bar = document.createElement("div");
    bar.id = "error-banner";
    bar.className = "update-banner error-banner";
    bar.setAttribute("role", "alert");

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
      text.textContent = label("error_banner_text", "Something went wrong. Reloading may fix it.");
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

  window.addEventListener("error", showBanner);
  window.addEventListener("unhandledrejection", showBanner);
})();
