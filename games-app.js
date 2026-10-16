// games-app.js
// Powers games.html: a searchable, sortable list of every game, built
// entirely from GAMES_CATALOG so a new game only ever needs adding there.
// Search matches the game's name in whatever language is currently active
// (not the raw i18n key), and "sort by type" groups games under the same
// Strategy/Race/Puzzles headings the category pages use. At most 12 games
// per page (game-categories.js); search, sorting and the filters work
// over all pages, the page number stays in the address (?page=2).
// Old links with ?category=kids (or another category) go on to that
// category's own page.

(function () {
  const state = { query: "", sort: "alpha", category: "all", family: "all", page: 1 };
  const CATEGORY_PAGES = { strategy: 1, race: 1, puzzles: 1, party: 1, kids: 1 };
  const CATEGORY_ORDER = ["strategy", "race", "puzzles", "party"];
  const CATEGORY_LABEL_KEY = {
    strategy: "home_section_strategy",
    race: "home_section_race",
    puzzles: "home_section_puzzles",
    party: "home_section_party"
  };

  function displayName(game) {
    return window.I18n ? I18n.t(game.nameKey) : game.nameKey;
  }

  function byDisplayName(a, b) {
    return displayName(a).localeCompare(displayName(b));
  }

  function matchesQuery(game, q) {
    const t = (key) => window.I18n ? I18n.t(key) : key;
    return GamesSearch.matches(game, q, {
      name: displayName(game),
      description: t(game.descKey),
      family: game.family ? t("family_" + game.family) : "",
      category: t("home_section_" + game.category)
    });
  }

  // "kids" is not a category but the `kids: true` mark, which a game has
  // on top of its category.
  function matchesCategory(game) {
    if (state.category === "kids") return game.kids === true;
    return state.category === "all" || game.category === state.category;
  }

  // Family (games-catalog.js `family`): a filter of its own. Picking a
  // family shows all its games ("All" chip); picking a chip shows all
  // families again, so the two never combine into an empty list.
  function matchesFamily(game) {
    return state.family === "all" || game.family === state.family;
  }

  function fillFamilySelect(select) {
    const t = (k) => (window.I18n ? I18n.t(k) : k);
    const families = GAME_FAMILIES.slice().sort((a, b) => t("family_" + a).localeCompare(t("family_" + b)));
    select.innerHTML = '<option value="all">' + t("family_filter_all") + "</option>" +
      families.map((f) => '<option value="' + f + '">' + t("family_" + f) + "</option>").join("");
    select.value = state.family;
  }

  function setCategoryChip(cat) {
    state.category = cat;
    const chips = document.getElementById("games-category-chips");
    if (!chips) return;
    chips.querySelectorAll(".mode-btn").forEach((b) => {
      const active = b.getAttribute("data-category") === cat;
      b.classList.toggle("active-mode", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function render() {
    const grid = document.getElementById("games-grid");
    const noResults = document.getElementById("games-no-results");
    if (!grid) return;

    const q = state.query.trim();
    const filtered = GAMES_CATALOG.filter((g) => GamesRender.isListed(g) && matchesQuery(g, q) && matchesCategory(g) && matchesFamily(g));

    const pager = document.getElementById("games-pager");
    if (!filtered.length) {
      grid.innerHTML = "";
      if (pager) { pager.innerHTML = ""; pager.classList.add("hidden"); }
      if (noResults) noResults.classList.remove("hidden");
      return;
    }
    if (noResults) noResults.classList.add("hidden");
    let view;

    // Grouped-by-type headings only make sense across all categories at
    // once - a single category chip already says what group this is, so
    // that selection always renders as a flat, alphabetical list instead.
    if (state.sort === "type" && state.category === "all" && state.family === "all") {
      // The pages cut through the groups; each page shows the headings of
      // the groups it has games of.
      let ordered = [];
      CATEGORY_ORDER.forEach((cat) => { ordered = ordered.concat(filtered.filter((g) => g.category === cat).sort(byDisplayName)); });
      view = GameCategories.pageOf(ordered, state.page);
      let html = "";
      CATEGORY_ORDER.forEach((cat) => {
        const group = view.items.filter((g) => g.category === cat);
        if (!group.length) return;
        html += '<h3 class="games-group-title" data-i18n="' + CATEGORY_LABEL_KEY[cat] + '"></h3>';
        html += '<div class="game-select-grid">' + group.map(GamesRender.buildGameCardHTML).join("") + "</div>";
      });
      grid.innerHTML = html;
    } else {
      // "newest" orders by publication date (GAMES_CATALOG's `added`),
      // alphabetical within the same date.
      const sorted = state.sort === "newest"
        ? filtered.slice().sort((a, b) => GamesRender.compareNewest(a, b) || byDisplayName(a, b))
        : filtered.slice().sort(byDisplayName);
      const card = state.category === "kids"
        ? (game) => GamesRender.buildGameCardHTML(game, true)
        : GamesRender.buildGameCardHTML;
      view = GameCategories.pageOf(sorted, state.page);
      grid.innerHTML = '<div class="game-select-grid">' + view.items.map(card).join("") + "</div>";
    }
    state.page = view.page;
    if (pager) {
      pager.innerHTML = GameCategories.pagerHTML(view.page, view.pages, null);
      pager.classList.toggle("hidden", view.pages <= 1);
      pager.setAttribute("aria-label", window.I18n ? I18n.t("pager_label") : "Pages");
    }
    keepPageInUrl();

    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  // The page number in the address, without reloading (other parameters
  // such as ?family= stay).
  function keepPageInUrl() {
    if (!window.history || typeof history.replaceState !== "function") return;
    const params = new URLSearchParams(window.location.search);
    if (state.page > 1) params.set("page", String(state.page)); else params.delete("page");
    const q = params.toString();
    const url = window.location.pathname + (q ? "?" + q : "") + window.location.hash;
    if (url !== window.location.pathname + window.location.search + window.location.hash) history.replaceState(null, "", url);
  }

  // A change of search, sorting or filter starts again on page 1.
  function renderFromStart() {
    state.page = 1;
    render();
  }

  function init() {
    const oldCat = new URLSearchParams(window.location.search).get("category");
    if (oldCat && CATEGORY_PAGES[oldCat]) { window.location.replace("games-" + oldCat + ".html"); return; }
    state.page = GameCategories.pageFromUrl();
    const pagerBox = document.getElementById("games-pager");
    if (pagerBox) {
      pagerBox.addEventListener("click", (evt) => {
        const b = evt.target.closest("[data-page]");
        if (!b) return;
        state.page = parseInt(b.getAttribute("data-page"), 10) || 1;
        render();
        const top = document.getElementById("games-grid");
        if (top && top.scrollIntoView) top.scrollIntoView();
      });
    }
    const searchInput = document.getElementById("games-search");
    const sortSelect = document.getElementById("games-sort");
    const categoryChips = document.getElementById("games-category-chips");
    const familySelect = document.getElementById("games-family");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        renderFromStart();
      });
    }
    if (sortSelect) {
      // games.html?sort=newest (the home page's "All new games" link).
      const wanted = new URLSearchParams(window.location.search).get("sort");
      if (wanted && sortSelect.querySelector('option[value="' + wanted + '"]')) {
        sortSelect.value = wanted;
        state.sort = wanted;
      }
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        renderFromStart();
      });
    }
    if (categoryChips) {
      // games.html?category=all (a real category went to its own page above).
      const wantedCat = new URLSearchParams(window.location.search).get("category");
      const wantedBtn = wantedCat && categoryChips.querySelector('.mode-btn[data-category="' + wantedCat + '"]');
      if (wantedBtn) {
        state.category = wantedCat;
        categoryChips.querySelectorAll(".mode-btn").forEach((b) => {
          const active = b === wantedBtn;
          b.classList.toggle("active-mode", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
      }
      categoryChips.addEventListener("click", (evt) => {
        const btn = evt.target.closest(".mode-btn");
        if (!btn) return;
        state.category = btn.getAttribute("data-category");
        categoryChips.querySelectorAll(".mode-btn").forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active-mode", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        state.family = "all";
        if (familySelect) familySelect.value = "all";
        renderFromStart();
      });
    }
    if (familySelect) {
      // games.html?family=sudoku (the "Related games" box on game pages).
      const wantedFam = new URLSearchParams(window.location.search).get("family");
      if (wantedFam && GAME_FAMILIES.indexOf(wantedFam) !== -1) {
        state.family = wantedFam;
        setCategoryChip("all");
      }
      fillFamilySelect(familySelect);
      familySelect.addEventListener("change", () => {
        state.family = familySelect.value;
        if (state.family !== "all") setCategoryChip("all");
        renderFromStart();
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
      I18n.onChange(() => {
        if (familySelect) fillFamilySelect(familySelect);
        render();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
