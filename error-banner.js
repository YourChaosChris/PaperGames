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

  // A saved game that no longer fits the game's code (an older format,
  // or a write cut off halfway) would otherwise crash the page on every
  // single load. If the page breaks while it is still starting up and a
  // saved game was just read (game-storage.js notes which), that save is
  // moved aside to einkchess_broken_<game> - kept, not deleted, but no
  // longer loaded - and the page reloads once with a fresh game.
  let startingUp = true;
  window.addEventListener("load", () => setTimeout(() => { startingUp = false; }, 2000));

  function setAsideBrokenSave() {
    try {
      const keys = window.__pgSavesLoaded || [];
      if (!startingUp || !keys.length || !window.localStorage || !window.sessionStorage) return false;
      const flag = "pg_save_set_aside:" + keys.join("|");
      if (window.sessionStorage.getItem(flag)) return false; // once only - no reload loop
      window.sessionStorage.setItem(flag, "1");
      keys.forEach((key) => {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return;
        window.localStorage.setItem(key.replace("einkchess_save_", "einkchess_broken_"), raw);
        window.localStorage.removeItem(key);
      });
      window.location.reload();
      return true;
    } catch (e) {
      return false;
    }
  }

  function onError() {
    if (setAsideBrokenSave()) return;
    showBanner();
  }

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onError);
})();
