// home-app.js
// Renders the "New Games" section (the newest games of the last 60 days,
// from GAMES_CATALOG's `added` dates; hidden when there are none) and the
// personalized "My Favorites" section on the home page
// (always visible, with an empty-state message when there are none yet,
// so its permanent nav link is never dead) and keeps every
// favorite-toggle star - on both the static Popular section and the
// dynamically-rendered Favorites section - in sync with the shared
// Favorites module.

(function () {
  // A handful of trademark-safe renames kept their original internal
  // slug for the localStorage save key (see game-storage.js/game-stats.js)
  // even though the game's own URL/GAMES_CATALOG slug changed.
  const SAVE_SLUG_TO_CATALOG_SLUG = {
    othello: "reversi",
    connectfour: "fourinarow",
    onitama: "cardtactics",
    quoridor: "wallmaze"
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

  function renderFavorites() {
    const grid = document.getElementById("favorites-grid");
    const emptyState = document.getElementById("favorites-empty");
    if (!grid) return;

    const favGames = Favorites.getAll().map(catalogEntry).filter(Boolean);
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

  function goToRandomGame() {
    const games = GAMES_CATALOG.filter(GamesRender.isListed);
    if (!games.length) return;
    const pick = games[Math.floor(Math.random() * games.length)];
    window.location.href = pick.slug + ".html";
  }

  function init() {
    renderContinuePlaying();
    renderNewGames();
    renderFavorites();
    GamesRender.updateFavoriteButtons(document);

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
