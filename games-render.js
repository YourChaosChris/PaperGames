// games-render.js
// Shared card-building + favorite-star helpers for GAMES_CATALOG entries,
// used by both index.html's home-app.js (the "My Favorites" section) and
// games.html's games-app.js (the full searchable/sortable list), so the
// exact same card markup and star-toggle behavior only needs writing once.

const GamesRender = (function () {
  function buildGameCardHTML(game) {
    return (
      '<div class="game-select-item" data-slug="' + game.slug + '">' +
      '<button type="button" class="favorite-toggle" data-slug="' + game.slug + '"></button>' +
      '<div class="game-select-title">' + game.icon + ' <span data-i18n="' + game.nameKey + '">' + game.nameText + '</span></div>' +
      '<p class="game-select-desc" data-i18n="' + game.descKey + '">' + game.descText + '</p>' +
      '<div class="game-select-actions">' +
      '<a href="' + game.slug + '.html" class="primary small" data-i18n="nav_play">Play</a>' +
      '<a href="' + game.slug + '-rules.html" class="secondary small" data-i18n="nav_rules">Rules</a>' +
      '<a href="' + game.slug + '-history.html" class="secondary small" data-i18n="nav_history">History</a>' +
      '</div>' +
      '</div>'
    );
  }

  // Sets each favorite-toggle button's glyph/state within `root` (a
  // container element or `document`) from the current Favorites list -
  // filled vs. outline star, no color needed, matching this site's
  // monochrome convention everywhere else.
  function updateFavoriteButtons(root) {
    const btns = root.querySelectorAll(".favorite-toggle");
    for (let i = 0; i < btns.length; i++) {
      const btn = btns[i];
      const slug = btn.getAttribute("data-slug");
      const fav = window.Favorites ? Favorites.isFavorite(slug) : false;
      btn.textContent = fav ? "★" : "☆";
      btn.classList.toggle("is-favorite", fav);
      btn.setAttribute("aria-pressed", fav ? "true" : "false");
      const key = fav ? "favorite_remove" : "favorite_add";
      btn.setAttribute("aria-label", window.I18n ? I18n.t(key) : key);
    }
  }

  return { buildGameCardHTML, updateFavoriteButtons };
})();

// See favorites.js for why this explicit export is needed: a top-level
// `const` doesn't become a `window` property on its own.
window.GamesRender = GamesRender;
