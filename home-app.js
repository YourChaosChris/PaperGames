// home-app.js
// The short home page: "Continue Playing" (the last 3 started games,
// hidden when there are none), "My Favorites" (at most 6, then a link to
// games-favorites.html; a short hint while there are none) and a row of
// category tiles with their number of games (game-categories.js). Game
// entries here are compact: symbol, name, "Play" and the star - rules and
// history are on the category pages and in the games.
//
// Old links into the long home page (#section-popular, #section-new,
// #section-kids) go on to the matching category page.

(function () {
  // 2048 has always saved under its number rather than its slug. Save
  // keys of renamed games are migrated once in game-storage.js.
  const SAVE_SLUG_TO_CATALOG_SLUG = {
    "2048": "twenty48"
  };
  const CONTINUE_MAX = 3;
  const FAVORITES_MAX = 6;
  const OLD_ANCHORS = { "#section-popular": "games-popular.html", "#section-new": "games-new.html", "#section-kids": "games-kids.html" };

  function catalogEntry(slug) {
    for (let i = 0; i < GAMES_CATALOG.length; i++) {
      if (GAMES_CATALOG[i].slug === slug) return GAMES_CATALOG[i];
    }
    return null;
  }

  function t(key) { return window.I18n ? I18n.t(key) : key; }

  function renderContinuePlaying() {
    const section = document.getElementById("section-continue");
    const grid = document.getElementById("continue-grid");
    if (!section || !grid || typeof GameStorage === "undefined") return;

    const games = GameStorage.getRecentSlugs()
      .map((slug) => SAVE_SLUG_TO_CATALOG_SLUG[slug] || slug)
      .map(catalogEntry)
      .filter(Boolean)
      .slice(0, CONTINUE_MAX);

    section.classList.toggle("hidden", !games.length);
    grid.innerHTML = games.map(GamesRender.buildCompactCardHTML).join("");
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  function renderFavorites() {
    const grid = document.getElementById("favorites-grid");
    const emptyState = document.getElementById("favorites-empty");
    const more = document.getElementById("favorites-more");
    if (!grid) return;

    const favGames = GameCategories.games("favorites", GAMES_CATALOG);
    if (emptyState) emptyState.classList.toggle("hidden", favGames.length > 0);
    grid.innerHTML = favGames.slice(0, FAVORITES_MAX).map(GamesRender.buildCompactCardHTML).join("");
    if (more) {
      more.classList.toggle("hidden", favGames.length <= FAVORITES_MAX);
      const link = more.querySelector("a");
      if (link) link.textContent = t("home_favorites_all").split("{n}").join(String(favGames.length));
    }
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  // The tiles: symbol, name and number of games of each category page.
  function renderCategories() {
    const box = document.getElementById("category-tiles");
    if (!box) return;
    box.innerHTML = GameCategories.PAGES.map((c) => {
      const n = GameCategories.games(c.id, GAMES_CATALOG).length;
      const count = t("home_cat_count").split("{n}").join(String(n));
      return '<a class="category-tile" href="' + c.file + '">' + GameCategories.ICONS[c.id] +
        '<span class="category-tile-name">' + t(c.nameKey) + '</span><span class="category-tile-count">' + count + "</span></a>";
    }).join("");
  }

  // The offline status line in the header card: whether the service worker
  // has stored the app on this device (offline-status.js).
  const OFFLINE_ICON = {
    check: '<svg viewBox="0 0 16 16" focusable="false"><path d="M2 8.5 L6.2 12.5 L14 3.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/></svg>',
    dot: '<svg viewBox="0 0 16 16" focusable="false"><circle cx="8" cy="8" r="3.5" fill="currentColor"/></svg>'
  };
  // The line is filled from the last state, again on a language change
  // (the counts don't fit a static data-i18n key).
  let offlineState = null;

  function offlineText(key, detail) {
    return t(key).split("{n}").join(String(detail.done)).split("{m}").join(String(detail.total));
  }

  function showOfflineStatus() {
    const text = document.getElementById("offline-status-text");
    const mark = document.querySelector("#offline-status .offline-status-icon");
    if (!text || !mark || !offlineState) return;
    const state = offlineState.state, detail = offlineState.detail;
    const counted = typeof detail.total === "number";
    let key = "", icon = "dot";
    if (state === "ready") {
      // No network: nothing is loading, the new version follows later.
      key = detail.updating ? (detail.offline ? "offline_ready_update_waiting" : "offline_ready_updating") : "offline_ready";
      icon = "check";
    } else if (state === "loading" && detail.controlled) {
      // A worker already controls this page, so the files are stored and
      // its answer is a few milliseconds away - don't flash "loading" on
      // an e-ink screen for that.
      key = "";
    } else if ((state === "loading" || state === "paused") && detail.offline) {
      // Not complete on the device and no network: say what is missing and
      // what to do, instead of "is being loaded now".
      key = "offline_waiting";
    } else if (state === "loading") {
      key = counted ? "offline_loading_progress" : "offline_loading";
    } else if (state === "paused") {
      key = "offline_paused";
    } else {
      key = "offline_unavailable";
    }
    mark.innerHTML = key ? OFFLINE_ICON[icon] : "";
    text.removeAttribute("data-i18n");
    text.textContent = key ? offlineText(key, detail) : "";
  }

  function watchOfflineStatus() {
    if (typeof OfflineStatus === "undefined" || !document.getElementById("offline-status")) return;
    OfflineStatus.watch((state, detail) => {
      offlineState = { state: state, detail: detail };
      showOfflineStatus();
    });
    if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(showOfflineStatus);
  }

  function goToRandomGame() {
    const games = GAMES_CATALOG.filter(GamesRender.isListed);
    if (!games.length) return;
    const pick = games[Math.floor(Math.random() * games.length)];
    window.location.href = pick.slug + ".html";
  }

  function renderAll() {
    renderContinuePlaying();
    renderFavorites();
    renderCategories();
  }

  function init() {
    if (OLD_ANCHORS[window.location.hash]) { window.location.replace(OLD_ANCHORS[window.location.hash]); return; }
    renderAll();
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

    if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(renderAll);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
