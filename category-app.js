// category-app.js
// Powers the category pages (games-strategy.html and the others, see
// game-categories.js): the games of the category from GAMES_CATALOG, at
// most 12 per page, with "← Back / Page 2 of 3 / Next →" under them. The
// page number stays in the address (?page=2), so the browser's back
// button and a reload land on the same page. The category comes from the
// page's data-category-page attribute.

(function () {
  function render() {
    const root = document.querySelector("[data-category-page]");
    const grid = document.getElementById("cat-grid");
    const pager = document.getElementById("cat-pager");
    if (!root || !grid) return;
    const id = root.getAttribute("data-category-page");
    const list = GameCategories.games(id, GAMES_CATALOG);
    const view = GameCategories.pageOf(list, GameCategories.pageFromUrl());
    const empty = document.getElementById("cat-empty");
    if (empty) empty.classList.toggle("hidden", list.length > 0);
    const card = id === "kids" ? GamesRender.buildKidsCardHTML : GamesRender.buildGameCardHTML;
    grid.innerHTML = view.items.length ? '<div class="game-select-grid">' + view.items.map(card).join("") + "</div>" : "";
    if (pager) {
      pager.innerHTML = GameCategories.pagerHTML(view.page, view.pages, (n) => "?page=" + n);
      pager.classList.toggle("hidden", view.pages <= 1);
      pager.setAttribute("aria-label", window.I18n ? I18n.t("pager_label") : "Pages");
    }
    GamesRender.updateFavoriteButtons(grid);
    GamesRender.translateInto(grid);
  }

  function init() {
    document.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".favorite-toggle");
      if (!btn) return;
      Favorites.toggle(btn.getAttribute("data-slug"));
      // On "My favorites" a removed game leaves the list at once.
      const root = document.querySelector("[data-category-page]");
      if (root && root.getAttribute("data-category-page") === "favorites") render();
      else GamesRender.updateFavoriteButtons(document.getElementById("cat-grid"));
    });
    render();
    if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(render);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
