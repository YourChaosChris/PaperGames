// game-switcher.js
// Lets a player jump straight from whatever game they're currently on to
// any other game, without detouring through the home page first. Adds a
// plain <select> to the header, right next to the language picker.
//
// Like the .lang-select built by i18n.js, this is injected at runtime
// rather than hand-written into every HTML file: with no build step and
// ~90 static pages, that's the only way to keep one shared list of games
// instead of editing every page whenever a game is added. Adding a 26th
// game later means adding one entry to the GAMES list below - no HTML
// file needs to change.
//
// It only appears on an actual game's play/rules/history page (where
// "I want a different game" is a real need); the home page and other
// site pages have no "current game" to switch away from, so it stays
// off there.

(function () {
  // [slug, i18n key] for every game, slug matching its <slug>.html /
  // <slug>-rules.html / <slug>-history.html files. The i18n key is the
  // same one each game's own card on the home page uses for its name,
  // so the label here always matches what the player already knows the
  // game as, in whatever language is active.
  var GAMES = [
    ["chess", "game_chess"],
    ["go", "game_go"],
    ["checkers", "game_checkers"],
    ["reversi", "game_reversi"],
    ["fourinarow", "game_four_in_a_row"],
    ["gomoku", "game_gomoku"],
    ["hex", "game_hex"],
    ["morris", "game_morris"],
    ["wallmaze", "game_wall_maze"],
    ["halma", "game_halma"],
    ["xiangqi", "game_xiangqi_short"],
    ["shogi", "game_shogi"],
    ["cardtactics", "game_card_tactics"],
    ["hnefatafl", "game_hnefatafl"],
    ["backgammon", "game_backgammon"],
    ["ur", "game_ur"],
    ["senet", "game_senet"],
    ["mancala", "game_mancala"],
    ["sudoku", "game_sudoku"],
    ["minesweeper", "game_minesweeper"],
    ["twenty48", "game_2048"],
    ["freecell", "game_freecell"],
    ["mahjong", "game_mahjong_solitaire"],
    ["nonogram", "game_nonograms"],
    ["pegsolitaire", "game_peg_solitaire"],
    ["yatzy", "game_yatzy"],
    ["lightsout", "game_lightsout"],
    ["mastermind", "game_mastermind"],
    ["dotsandboxes", "game_dotsandboxes"],
    ["klondike", "game_klondike"],
    ["amazons", "game_amazons"],
    ["kakuro", "game_kakuro"],
    ["fanorona", "game_fanorona"],
    ["sternhalma", "game_sternhalma"],
    ["spidersolitaire", "game_spidersolitaire"],
    ["baghchal", "game_baghchal"],
    ["tablut", "game_tablut"],
    ["abalone", "game_abalone"],
    ["pyramidsolitaire", "game_pyramidsolitaire"],
    ["surakarta", "game_surakarta"]
  ];

  var GAME_SLUGS = {};
  GAMES.forEach(function (pair) {
    GAME_SLUGS[pair[0]] = true;
  });

  // The current page's game, or null when this isn't a game/rules/history
  // page (home, guide, about, stats, legal pages) - those get no switcher.
  function currentSlug() {
    var file = (location.pathname.split("/").pop() || "").toLowerCase();
    file = file.replace(/\.html?$/, "");
    var slug = file.replace(/-(rules|history)$/, "");
    return GAME_SLUGS[slug] ? slug : null;
  }

  function label(key) {
    return window.I18n && typeof I18n.t === "function" ? I18n.t(key) : key;
  }

  function populate(select) {
    select.innerHTML = "";
    GAMES.forEach(function (pair) {
      var opt = document.createElement("option");
      opt.value = pair[0];
      opt.textContent = label(pair[1]);
      select.appendChild(opt);
    });
  }

  function init() {
    var slug = currentSlug();
    if (!slug) return;

    var panel = document.querySelector(".app-header .user-panel");
    if (!panel) return;

    var wrap = document.createElement("div");
    wrap.className = "game-switch";

    var icon = document.createElement("span");
    icon.className = "game-switch-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "\u{1F3B2}"; // dice, matches the icon used for the "Race" home page section
    wrap.appendChild(icon);

    var select = document.createElement("select");
    select.className = "game-select";
    select.setAttribute("aria-label", "Switch game");
    populate(select);
    select.value = slug;
    select.addEventListener("change", function () {
      if (select.value) location.href = select.value + ".html";
    });
    wrap.appendChild(select);

    // Ahead of the language picker / menu button, so it's the first
    // thing reached in the header's user panel.
    panel.insertBefore(wrap, panel.firstChild);

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(function () {
        var current = select.value;
        populate(select);
        select.value = current;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
