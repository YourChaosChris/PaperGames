// home-app.js
// Renders the personalized "My Favorites" section on the home page
// (hidden entirely when empty, since it could be any of the 31+ games,
// not just the curated "Popular Games" set below it) and keeps every
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
    if (!section || !grid || typeof GameStorage === "undefined") return;

    const games = GameStorage.getRecentSlugs()
      .map((slug) => SAVE_SLUG_TO_CATALOG_SLUG[slug] || slug)
      .map(catalogEntry)
      .filter(Boolean);

    if (!games.length) {
      section.classList.add("hidden");
      grid.innerHTML = "";
      return;
    }

    section.classList.remove("hidden");
    grid.innerHTML = games.map(GamesRender.buildGameCardHTML).join("");
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  function renderFavorites() {
    const section = document.getElementById("section-favorites");
    const grid = document.getElementById("favorites-grid");
    if (!section || !grid) return;

    const favGames = Favorites.getAll().map(catalogEntry).filter(Boolean);
    if (!favGames.length) {
      section.classList.add("hidden");
      grid.innerHTML = "";
      return;
    }

    section.classList.remove("hidden");
    grid.innerHTML = favGames.map(GamesRender.buildGameCardHTML).join("");
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  function goToRandomGame() {
    const games = GAMES_CATALOG;
    if (!games.length) return;
    const pick = games[Math.floor(Math.random() * games.length)];
    window.location.href = pick.slug + ".html";
  }

  function init() {
    renderContinuePlaying();
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
        renderFavorites();
        GamesRender.updateFavoriteButtons(document);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
