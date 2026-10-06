// home-app.js
// Renders the "New Games" section (the newest games of the last 60 days,
// from GAMES_CATALOG's `added` dates; hidden when there are none) and the
// personalized "My Favorites" section on the home page
// (always visible, with an empty-state message when there are none yet,
// so its permanent nav link is never dead - the empty one further down
// the page, see placeFavoritesSection) and keeps every
// favorite-toggle star - on both the static Popular section and the
// dynamically-rendered Favorites section - in sync with the shared
// Favorites module.

(function () {
  // 2048 has always saved under its number rather than its slug. Save
  // keys of renamed games are migrated once in game-storage.js.
  const SAVE_SLUG_TO_CATALOG_SLUG = {
    "2048": "twenty48"
  };

  function catalogEntry(slug) {
    for (let i = 0; i < GAMES_CATALOG.length; i++) {
      if (GAMES_CATALOG[i].slug === slug) return GAMES_CATALOG[i];
    }
    return null;
  }

  function renderContinuePlaying() {
    const section = document.getElementById("section-continue");
    const grid = document.getElementById("continue-grid");
    const navLink = document.getElementById("nav-link-continue");
    if (!section || !grid || typeof GameStorage === "undefined") return;

    const games = GameStorage.getRecentSlugs()
      .map((slug) => SAVE_SLUG_TO_CATALOG_SLUG[slug] || slug)
      .map(catalogEntry)
      .filter(Boolean);

    if (!games.length) {
      section.classList.add("hidden");
      if (navLink) navLink.classList.add("hidden");
      grid.innerHTML = "";
      return;
    }

    section.classList.remove("hidden");
    if (navLink) navLink.classList.remove("hidden");
    grid.innerHTML = games.map(GamesRender.buildGameCardHTML).join("");
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  const NEW_GAMES_MAX = 6;
  const NEW_GAMES_DAYS = 60;

  function renderNewGames() {
    const section = document.getElementById("section-new");
    const grid = document.getElementById("new-grid");
    const navLink = document.getElementById("nav-link-new");
    if (!section || !grid) return;

    const cutoff = Date.now() - NEW_GAMES_DAYS * 24 * 60 * 60 * 1000;
    const games = GAMES_CATALOG
      .filter((g) => GamesRender.isListed(g) && g.added && Date.parse(g.added + "T00:00:00") >= cutoff)
      .sort((a, b) => b.added.localeCompare(a.added))
      .slice(0, NEW_GAMES_MAX);

    if (!games.length) {
      section.classList.add("hidden");
      if (navLink) navLink.classList.add("hidden");
      grid.innerHTML = "";
      return;
    }

    section.classList.remove("hidden");
    if (navLink) navLink.classList.remove("hidden");
    grid.innerHTML = games.map(GamesRender.buildGameCardHTML).join("");
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  // While there are no favorites the section is only a hint ("tap the
  // star"), and on a first visit it would push every game tile below the
  // fold - so it waits under Popular Games until the first star is set,
  // then moves back up under Continue Playing.
  function placeFavoritesSection(hasFavorites) {
    const section = document.getElementById("section-favorites");
    const anchor = document.getElementById(hasFavorites ? "section-continue" : "section-popular");
    if (!section || !anchor || anchor.nextElementSibling === section) return;
    anchor.parentNode.insertBefore(section, anchor.nextElementSibling);
  }

  function renderFavorites() {
    const grid = document.getElementById("favorites-grid");
    const emptyState = document.getElementById("favorites-empty");
    if (!grid) return;

    const favGames = Favorites.getAll().map(catalogEntry).filter(Boolean);
    placeFavoritesSection(favGames.length > 0);
    if (!favGames.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    grid.innerHTML = favGames.map(GamesRender.buildGameCardHTML).join("");
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  // The offline status line under the intro: whether the service worker
  // has stored the app on this device (offline-status.js). It stays on the
  // page for good, so anyone can check it later too.
  const OFFLINE_ICON = {
    check: '<svg viewBox="0 0 16 16" focusable="false"><path d="M2 8.5 L6.2 12.5 L14 3.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/></svg>',
    dot: '<svg viewBox="0 0 16 16" focusable="false"><circle cx="8" cy="8" r="3.5" fill="currentColor"/></svg>'
  };
  // Storing 400-odd files on a slow reader takes a minute or two, so the
  // home page waits longer than the Settings dialog's 30 seconds before
  // it calls the device unable to store the app.
  const OFFLINE_WAIT_MS = 180000;

  function showOfflineStatus(key, icon) {
    const text = document.getElementById("offline-status-text");
    const mark = document.querySelector("#offline-status .offline-status-icon");
    if (!text || !mark) return;
    mark.innerHTML = key ? OFFLINE_ICON[icon] : "";
    if (!key) {
      text.removeAttribute("data-i18n");
      text.textContent = "";
    } else if (window.I18n && typeof I18n.setKey === "function") {
      I18n.setKey(text, key);
    }
  }

  function watchOfflineStatus() {
    if (typeof OfflineStatus === "undefined" || !document.getElementById("offline-status")) return;
    OfflineStatus.watch((state, detail) => {
      if (state === "ready") {
        showOfflineStatus("offline_ready", "check");
      } else if (state === "loading" && detail.controlled) {
        // A worker already controls this page, so the files are stored and
        // its answer is a few milliseconds away - don't flash "loading" on
        // an e-ink screen for that.
        showOfflineStatus("", "");
      } else if (state === "loading") {
        showOfflineStatus("offline_loading", "dot");
      } else {
        showOfflineStatus("offline_unavailable", "dot");
        // A very slow first install can still finish after the time limit;
        // when a worker takes over after all, ask again.
        const sw = navigator.serviceWorker;
        if (sw && (location.protocol === "http:" || location.protocol === "https:")) {
          sw.addEventListener("controllerchange", watchOfflineStatus, { once: true });
        }
      }
    }, { limit: OFFLINE_WAIT_MS });
  }

  // The short "no ads, no account, ..." block under the heading. Shown on
  // the first two visits to the home page; from the third on it stays
  // hidden and only the footer link brings it back. The visit counter is
  // guarded like favorites.js - without storage it just keeps showing.
  const HOME_VISITS_KEY = "papergames_home_visits";
  const PITCH_VISITS = 2;

  function countHomeVisit() {
    try {
      if (!window.localStorage) return 1;
      const visits = (parseInt(window.localStorage.getItem(HOME_VISITS_KEY), 10) || 0) + 1;
      window.localStorage.setItem(HOME_VISITS_KEY, String(visits));
      return visits;
    } catch (e) {
      return 1;
    }
  }

  function showPitch(show) {
    const pitch = document.getElementById("home-pitch");
    const hero = document.querySelector(".home-hero");
    if (!pitch || !hero) return;
    pitch.classList.toggle("hidden", !show);
    hero.classList.toggle("home-pitch-shown", show);
  }

  function initPitch() {
    showPitch(countHomeVisit() <= PITCH_VISITS);
    const link = document.getElementById("home-pitch-link");
    if (!link) return;
    link.addEventListener("click", (evt) => {
      evt.preventDefault();
      showPitch(true);
      const pitch = document.getElementById("home-pitch");
      if (pitch) pitch.scrollIntoView();
    });
  }

  function goToRandomGame() {
    const games = GAMES_CATALOG.filter(GamesRender.isListed);
    if (!games.length) return;
    const pick = games[Math.floor(Math.random() * games.length)];
    window.location.href = pick.slug + ".html";
  }

  function init() {
    initPitch();
    renderContinuePlaying();
    renderNewGames();
    renderFavorites();
    GamesRender.updateFavoriteButtons(document);
    watchOfflineStatus();

    const surpriseBtn = document.getElementById("home-surprise-button");
    if (surpriseBtn) surpriseBtn.addEventListener("click", goToRandomGame);

    document.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".favorite-toggle");
      if (!btn) return;
      Favorites.toggle(btn.getAttribute("data-slug"));
      renderContinuePlaying();
      renderFavorites();
      GamesRender.updateFavoriteButtons(document);
    });

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(() => {
        renderContinuePlaying();
        renderNewGames();
        renderFavorites();
        GamesRender.updateFavoriteButtons(document);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
