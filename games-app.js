// games-app.js
// Powers games.html: a searchable, sortable list of every game, built
// entirely from GAMES_CATALOG so a new game only ever needs adding there.
// Search matches the game's name in whatever language is currently active
// (not the raw i18n key), and "sort by type" groups games under the same
// Strategy/Race/Puzzles headings the home page itself uses.

(function () {
  const state = { query: "", sort: "alpha", category: "all" };
  const CATEGORY_ORDER = ["strategy", "race", "puzzles"];
  const CATEGORY_LABEL_KEY = {
    strategy: "home_section_strategy",
    race: "home_section_race",
    puzzles: "home_section_puzzles"
  };

  function displayName(game) {
    return window.I18n ? I18n.t(game.nameKey) : game.nameKey;
  }

  function byDisplayName(a, b) {
    return displayName(a).localeCompare(displayName(b));
  }

  function matchesQuery(game, q) {
    if (!q) return true;
    return displayName(game).toLowerCase().indexOf(q) !== -1;
  }

  function matchesCategory(game) {
    return state.category === "all" || game.category === state.category;
  }

  function render() {
    const grid = document.getElementById("games-grid");
    const noResults = document.getElementById("games-no-results");
    if (!grid) return;

    const q = state.query.trim().toLowerCase();
    const filtered = GAMES_CATALOG.filter((g) => matchesQuery(g, q) && matchesCategory(g));

    if (!filtered.length) {
      grid.innerHTML = "";
      if (noResults) noResults.classList.remove("hidden");
      return;
    }
    if (noResults) noResults.classList.add("hidden");

    // Grouped-by-type headings only make sense across all categories at
    // once - a single category chip already says what group this is, so
    // that selection always renders as a flat, alphabetical list instead.
    if (state.sort === "type" && state.category === "all") {
      let html = "";
      CATEGORY_ORDER.forEach((cat) => {
        const group = filtered.filter((g) => g.category === cat).sort(byDisplayName);
        if (!group.length) return;
        html += '<h3 class="games-group-title" data-i18n="' + CATEGORY_LABEL_KEY[cat] + '"></h3>';
        html += '<div class="game-select-grid">' + group.map(GamesRender.buildGameCardHTML).join("") + "</div>";
      });
      grid.innerHTML = html;
    } else {
      const sorted = filtered.slice().sort(byDisplayName);
      grid.innerHTML = '<div class="game-select-grid">' + sorted.map(GamesRender.buildGameCardHTML).join("") + "</div>";
    }

    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  function init() {
    const searchInput = document.getElementById("games-search");
    const sortSelect = document.getElementById("games-sort");
    const categoryChips = document.getElementById("games-category-chips");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        render();
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        render();
      });
    }
    if (categoryChips) {
      categoryChips.addEventListener("click", (evt) => {
        const btn = evt.target.closest(".mode-btn");
        if (!btn) return;
        state.category = btn.getAttribute("data-category");
        categoryChips.querySelectorAll(".mode-btn").forEach((b) => {
          b.classList.toggle("active-mode", b === btn);
        });
        render();
      });
    }

    document.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".favorite-toggle");
      if (!btn) return;
      Favorites.toggle(btn.getAttribute("data-slug"));
      GamesRender.updateFavoriteButtons(document.getElementById("games-grid"));
    });

    render();

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(render);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
