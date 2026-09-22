// home-app.js
// Renders the personalized "My Favorites" section on the home page
// (hidden entirely when empty, since it could be any of the 31+ games,
// not just the curated "Popular Games" set below it) and keeps every
// favorite-toggle star - on both the static Popular section and the
// dynamically-rendered Favorites section - in sync with the shared
// Favorites module.

(function () {
  function catalogEntry(slug) {
    for (let i = 0; i < GAMES_CATALOG.length; i++) {
      if (GAMES_CATALOG[i].slug === slug) return GAMES_CATALOG[i];
    }
    return null;
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
    if (window.I18n) I18n.apply();
  }

  function init() {
    renderFavorites();
    GamesRender.updateFavoriteButtons(document);

    document.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".favorite-toggle");
      if (!btn) return;
      Favorites.toggle(btn.getAttribute("data-slug"));
      renderFavorites();
      GamesRender.updateFavoriteButtons(document);
    });

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(() => {
        renderFavorites();
        GamesRender.updateFavoriteButtons(document);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
