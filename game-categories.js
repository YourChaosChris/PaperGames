// game-categories.js
// The category pages (games-new.html, games-popular.html, games-kids.html,
// games-strategy.html, games-race.html, games-puzzles.html,
// games-party.html, games-favorites.html): which games each one lists, its
// file, name key and symbol, and the paging shared with games.html - at
// most 12 games per page, the page number in the address (?page=2).
// Used by home-app.js (the category tiles with their counts),
// category-app.js (the pages themselves) and games-app.js (paging).

const GameCategories = (function () {
  const PER_PAGE = 12;
  // "New Games": the NEW_MAX newest games, and only those published in
  // the last NEW_DAYS days.
  const NEW_DAYS = 60;
  const NEW_MAX = 10;

  // Small black-and-white symbols for the tiles (no colour needed).
  const S = (body) => '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">' + body + "</svg>";
  const ICONS = {
    new: S('<path d="M12 2L14.5 9.5H22L16 14L18.5 22L12 17L5.5 22L8 14L2 9.5H9.5Z" fill="#fff" stroke="#141413" stroke-width="2" stroke-linejoin="round"/>'),
    popular: S('<path d="M8 21H16M9 18H15L14 9H10Z" fill="#141413"/><circle cx="12" cy="6" r="3" fill="#141413"/>'),
    kids: S('<circle cx="12" cy="12" r="9" fill="#fff" stroke="#141413" stroke-width="2"/><circle cx="9" cy="10" r="1.4" fill="#141413"/><circle cx="15" cy="10" r="1.4" fill="#141413"/><path d="M8 14.5Q12 18 16 14.5" fill="none" stroke="#141413" stroke-width="2" stroke-linecap="round"/>'),
    strategy: S('<path d="M6 21H18V19H6ZM7 18H17L16 10H8ZM7 4V8H17V4H15V6H13V4H11V6H9V4Z" fill="#141413"/>'),
    race: S('<rect x="3" y="3" width="18" height="18" rx="4" fill="#fff" stroke="#141413" stroke-width="2"/><circle cx="8" cy="8" r="1.7" fill="#141413"/><circle cx="12" cy="12" r="1.7" fill="#141413"/><circle cx="16" cy="16" r="1.7" fill="#141413"/>'),
    puzzles: S('<rect x="3" y="3" width="18" height="18" fill="#fff" stroke="#141413" stroke-width="2"/><path d="M9 3V21M15 3V21M3 9H21M3 15H21" stroke="#141413" stroke-width="1.5"/><rect x="9" y="9" width="6" height="6" fill="#141413"/>'),
    party: S('<rect x="4" y="5" width="11" height="15" rx="2" fill="#fff" stroke="#141413" stroke-width="2" transform="rotate(-10 9.5 12.5)"/><rect x="9" y="4" width="11" height="15" rx="2" fill="#fff" stroke="#141413" stroke-width="2"/><path d="M14.5 8L16.5 11.5L14.5 15L12.5 11.5Z" fill="#141413"/>'),
    favorites: S('<path d="M12 2L14.5 9.5H22L16 14L18.5 22L12 17L5.5 22L8 14L2 9.5H9.5Z" fill="#141413"/>'),
    all: S('<rect x="3" y="3" width="7" height="7" fill="#141413"/><rect x="14" y="3" width="7" height="7" fill="#fff" stroke="#141413" stroke-width="2"/><rect x="3" y="14" width="7" height="7" fill="#fff" stroke="#141413" stroke-width="2"/><rect x="14" y="14" width="7" height="7" fill="#141413"/>')
  };

  // In the order of the tiles on the home page; "all" is games.html.
  const PAGES = [
    { id: "new", file: "games-new.html", nameKey: "home_section_new" },
    { id: "popular", file: "games-popular.html", nameKey: "home_section_popular" },
    { id: "kids", file: "games-kids.html", nameKey: "home_section_kids" },
    { id: "strategy", file: "games-strategy.html", nameKey: "home_section_strategy" },
    { id: "race", file: "games-race.html", nameKey: "home_section_race" },
    { id: "puzzles", file: "games-puzzles.html", nameKey: "home_section_puzzles" },
    { id: "party", file: "games-party.html", nameKey: "home_section_party" },
    { id: "all", file: "games.html", nameKey: "nav_all_games" }
  ];
  // Not a tile, but a page like the others (the home page's "All favorites").
  const FAVORITES = { id: "favorites", file: "games-favorites.html", nameKey: "home_section_favorites" };

  function name(g) { return window.I18n ? I18n.t(g.nameKey) : g.nameText; }
  function byName(a, b) { return name(a).localeCompare(name(b)); }

  // The games of a category in the order the page shows them: new ones
  // newest first (at most NEW_MAX), favorites in the order they were starred, all others
  // alphabetical in the current language.
  function games(id, catalog, now) {
    const listed = catalog.filter((g) => GamesRender.isListed(g));
    switch (id) {
      case "new": return GamesRender.newGames(catalog, NEW_MAX, NEW_DAYS, now);
      case "popular": return listed.filter((g) => g.popular === true).sort(byName);
      case "kids": return GamesRender.kidsGames(catalog).sort(byName);
      case "favorites": {
        const fav = window.Favorites ? Favorites.getAll() : [];
        return fav.map((slug) => listed.find((g) => g.slug === slug)).filter(Boolean);
      }
      case "all": return listed.slice().sort(byName);
      default: return listed.filter((g) => g.category === id).sort(byName);
    }
  }

  // The page number from the address (?page=2), at least 1.
  function pageFromUrl() {
    const n = parseInt(new URLSearchParams(window.location.search).get("page"), 10);
    return n > 0 ? n : 1;
  }

  // One page of a list: { items, page, pages } (page clamped to 1..pages).
  function pageOf(list, page) {
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    const p = Math.min(Math.max(1, page || 1), pages);
    return { items: list.slice((p - 1) * PER_PAGE, p * PER_PAGE), page: p, pages };
  }

  // "← Back / Page 2 of 3 / Next →" with big buttons. hrefFor(n) gives the
  // address of page n (links), or null to make them buttons with
  // data-page (games.html changes the page without reloading).
  function pagerHTML(page, pages, hrefFor) {
    if (pages <= 1) return "";
    const t = (k) => (window.I18n ? I18n.t(k) : k);
    const btn = (n, key, cls) => {
      if (n < 1 || n > pages) return '<span class="pager-btn pager-off ' + cls + '" aria-hidden="true">' + t(key) + "</span>";
      return hrefFor ? '<a class="pager-btn secondary ' + cls + '" href="' + hrefFor(n) + '">' + t(key) + "</a>"
        : '<button type="button" class="pager-btn secondary ' + cls + '" data-page="' + n + '">' + t(key) + "</button>";
    };
    return btn(page - 1, "pager_prev", "pager-prev") +
      '<span class="pager-now" aria-current="page">' + t("pager_page").split("{n}").join(String(page)).split("{m}").join(String(pages)) + "</span>" +
      btn(page + 1, "pager_next", "pager-next");
  }

  return { PER_PAGE, NEW_DAYS, NEW_MAX, PAGES, FAVORITES, ICONS, games, pageFromUrl, pageOf, pagerHTML };
})();

window.GameCategories = GameCategories;
