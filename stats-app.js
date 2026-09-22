// stats-app.js
// Renders the per-game win/loss/draw table on stats.html from GameStats
// (localStorage, vs-AI games only - see game-stats.js).

const STATS_GAME_NAME_KEY = {
  chess: "game_chess",
  go: "game_go",
  checkers: "game_checkers",
  ur: "game_ur",
  morris: "game_morris",
  backgammon: "game_backgammon",
  xiangqi: "game_xiangqi_short",
  mancala: "game_mancala",
  othello: "game_othello",
  connectfour: "game_connect_four",
  gomoku: "game_gomoku",
  senet: "game_senet",
  shogi: "game_shogi",
  sudoku: "game_sudoku",
  pegsolitaire: "game_peg_solitaire",
  minesweeper: "game_minesweeper",
  nonogram: "game_nonograms",
  twenty48: "game_2048",
  mahjong: "game_mahjong_solitaire",
  freecell: "game_freecell",
  onitama: "game_onitama",
  hnefatafl: "game_hnefatafl",
  quoridor: "game_quoridor",
  hex: "game_hex",
  halma: "game_halma"
};

function gameDisplayName(game) {
  const key = STATS_GAME_NAME_KEY[game];
  const fallback = game.charAt(0).toUpperCase() + game.slice(1);
  return (window.I18n && key ? window.I18n.t(key) : null) || fallback;
}

function renderStats() {
  const body = document.getElementById("stats-body");
  const empty = document.getElementById("stats-empty");
  const table = document.querySelector(".stats-table");
  if (!body || typeof GameStats === "undefined") return;

  const all = GameStats.getAll();
  const totalGames = GameStats.GAMES.reduce((sum, g) => sum + all[g].wins + all[g].losses + all[g].draws, 0);

  body.innerHTML = "";
  GameStats.GAMES.forEach((game) => {
    const rec = all[game];
    const tr = document.createElement("tr");
    const nameTd = document.createElement("td");
    nameTd.textContent = gameDisplayName(game);
    const winsTd = document.createElement("td");
    winsTd.textContent = String(rec.wins);
    const lossesTd = document.createElement("td");
    lossesTd.textContent = String(rec.losses);
    const drawsTd = document.createElement("td");
    drawsTd.textContent = String(rec.draws);
    tr.appendChild(nameTd);
    tr.appendChild(winsTd);
    tr.appendChild(lossesTd);
    tr.appendChild(drawsTd);
    body.appendChild(tr);
  });

  if (table) table.classList.toggle("hidden", totalGames === 0);
  if (empty) empty.classList.toggle("hidden", totalGames > 0);
}

function initStatsApp() {
  renderStats();
  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.addEventListener("click", renderStats);
  });
  const resetBtn = document.getElementById("stats-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const msg = (window.I18n && window.I18n.t("stats_reset_confirm")) || "Reset all stats? This cannot be undone.";
      if (window.confirm(msg)) {
        GameStats.reset();
        renderStats();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initStatsApp);
