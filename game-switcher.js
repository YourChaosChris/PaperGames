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
  // [slug, i18n key, family] for every game, slug matching its <slug>.html /
  // <slug>-rules.html / <slug>-history.html files. The i18n key is the
  // same one each game's own card on the home page uses for its name,
  // so the label here always matches what the player already knows the
  // game as, in whatever language is active. The family is the game's
  // `family` in games-catalog.js (tests/game-families.js checks they
  // agree); a game page lists the other members under "Related games".
  var GAMES = [
    ["bingo", "game_bingo"],
    ["chess", "game_chess", "chess"],
    ["go", "game_go"],
    ["checkers", "game_checkers", "draughts"],
    ["reversi", "game_reversi"],
    ["fourinarow", "game_four_in_a_row", "inarow"],
    ["gomoku", "game_gomoku", "inarow"],
    ["hex", "game_hex"],
    ["morris", "game_morris"],
    ["wallmaze", "game_wall_maze"],
    ["halma", "game_halma", "halma"],
    ["xiangqi", "game_xiangqi_short", "chess"],
    ["shogi", "game_shogi", "chess"],
    ["cardtactics", "game_card_tactics"],
    ["hnefatafl", "game_hnefatafl", "tafl"],
    ["backgammon", "game_backgammon", "ancientrace"],
    ["ur", "game_ur", "ancientrace"],
    ["senet", "game_senet", "ancientrace"],
    ["mancala", "game_mancala"],
    ["ludo", "game_ludo", "dicerace"],
    ["sudoku", "game_sudoku", "sudoku"],
    ["minesweeper", "game_minesweeper"],
    ["twenty48", "game_2048"],
    ["freecell", "game_freecell", "patience"],
    ["mahjong", "game_mahjong_solitaire"],
    ["nonogram", "game_nonograms"],
    ["pegsolitaire", "game_peg_solitaire"],
    ["yatzy", "game_yatzy", "dicegames"],
    ["lightswitch", "game_lightswitch"],
    ["bullsandcows", "game_bullsandcows"],
    ["dotsandboxes", "game_dotsandboxes"],
    ["klondike", "game_klondike", "patience"],
    ["amazons", "game_amazons"],
    ["kakuro", "game_kakuro", "math"],
    ["hashi", "game_hashi"],
    ["skyscrapers", "game_skyscrapers", "latin"],
    ["slitherlink", "game_slitherlink"],
    ["fanorona", "game_fanorona", "draughts"],
    ["fleetbattle", "game_fleetbattle"],
    ["konane", "game_konane", "draughts"],
    ["sternhalma", "game_sternhalma", "halma"],
    ["spidersolitaire", "game_spidersolitaire", "patience"],
    ["baghchal", "game_baghchal", "hunt"],
    ["tablut", "game_tablut", "tafl"],
    ["marblepush", "game_marblepush"],
    ["pyramidsolitaire", "game_pyramidsolitaire", "patience"],
    ["surakarta", "game_surakarta"],
    ["categories", "game_categories"],
    ["domino", "game_domino"],
    ["maumau", "game_maumau"],
    ["calcudoku", "game_calcudoku", "math"],
    ["noneighbors", "game_numberblocks"],
    ["killersudoku", "game_killersudoku", "sudoku"],
    ["schwimmen", "game_schwimmen"],
    ["durak", "game_durak"],
    ["concan", "game_concan", "rummy"],
    ["doppelkopf", "game_doppelkopf", "tricks"],
    ["trix", "game_trix", "tricks"],
    ["cratepusher", "game_cratepusher"],
    ["tictactoe", "game_tictactoe", "inarow"],
    ["alquerque", "game_alquerque", "draughts"],
    ["pairs", "game_pairs"],
    ["futoshiki", "game_futoshiki", "latin"],
    ["cake", "game_cake"],
    ["linkpairs", "game_linkpairs"],
    ["shapesort", "game_shapesort"],
    ["animalsudoku", "game_animalsudoku", "sudoku"],
    ["foxandgeese", "game_foxandgeese", "hunt"],
    ["seega", "game_seega"],
    ["romme", "game_romme", "rummy"],
    ["oldmaid", "game_oldmaid"],
    ["war", "game_war"],
    ["snakesladders", "game_snakesladders", "dicerace"],
    ["blockers", "game_blockers", "dicerace"],
    ["blackjack", "game_blackjack", "casino"],
    ["poker", "game_poker", "casino"],
    ["skat", "game_skat", "tricks"],
    ["schafkopf", "game_schafkopf", "tricks"],
    ["canasta", "game_canasta", "rummy"],
    ["bridge", "game_bridge", "tricks"],
    ["tenpairs", "game_tenpairs"],
    ["mathcross", "game_mathcross", "math"],
    ["differences", "game_differences"],
    ["pentomino", "game_pentomino", "tiling"],
    ["cardduel", "game_cardduel"],
    ["villains", "game_villains"],
    ["forestvillage", "game_forestvillage"],
    ["adventurebook", "game_adventurebook"],
    ["arrows", "game_arrows"],
    ["rings", "game_rings", "rings"],
    ["tangram", "game_tangram", "tiling"],
    ["matches", "game_matches"],
    ["catplaces", "game_catplaces"],
    ["loosen", "game_loosen", "rings"],
    ["klappenkasten", "game_klappenkasten", "dicegames"],
    ["steckwuerfeln", "game_steckwuerfeln", "dicegames"],
    ["sternjagd", "game_sternjagd", "hunt"],
    ["patternrow", "game_patternrow", "picturelogic"],
    ["shadowmatch", "game_shadowmatch", "picturelogic"],
    ["oddone", "game_oddone", "picturelogic"],
    ["kleeberg", "game_kleeberg", "inarow"],
    ["weidefreunde", "game_weidefreunde", "dicegames"],
    ["zoowurf", "game_zoowurf", "dicegames"],
    ["tieryatzy", "game_tieryatzy", "dicegames"],
    ["slidepuzzle", "game_slidepuzzle"],
    ["hanoi", "game_hanoi"],
    ["nim", "game_nim"],
    ["teufelsieben", "game_teufelsieben"],
    ["gipfelwurf", "game_gipfelwurf", "dicegames"],
    ["advent", "game_advent", "latin"]
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

  // "Related games" at the end of a game's play page (not its rules or
  // history page): the family's name and links to the other members.
  function familyOf(slug) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i][0] === slug) return GAMES[i][2] || null;
    return null;
  }

  function fillRelated(box, slug, family) {
    var html = '<h2 data-i18n="related_games_title">' + label("related_games_title") + "</h2>" +
      '<p class="related-games-family"><span data-i18n="family_label">' + label("family_label") + "</span> " +
      '<a href="games.html?family=' + family + '" data-i18n="family_' + family + '">' + label("family_" + family) + "</a></p>" +
      '<ul class="related-games-list">';
    GAMES.forEach(function (g) {
      if (g[2] === family && g[0] !== slug) {
        html += '<li><a href="' + g[0] + '.html" data-i18n="' + g[1] + '">' + label(g[1]) + "</a></li>";
      }
    });
    box.innerHTML = html + "</ul>";
  }

  function addRelated(slug) {
    var file = (location.pathname.split("/").pop() || "").toLowerCase();
    if (/-(rules|history)\.html?$/.test(file)) return;
    var family = familyOf(slug);
    var main = document.querySelector("main");
    if (!family || !main || document.getElementById("related-games")) return;
    var box = document.createElement("section");
    box.id = "related-games";
    box.className = "card related-games";
    fillRelated(box, slug, family);
    main.appendChild(box);
  }

  function init() {
    var slug = currentSlug();
    if (!slug) return;
    addRelated(slug);

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
    I18n.setAria(select, "Switch game");
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
