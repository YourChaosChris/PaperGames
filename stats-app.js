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
  ludo: "game_ludo",
  othello: "game_reversi",
  connectfour: "game_four_in_a_row",
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
  onitama: "game_card_tactics",
  hnefatafl: "game_hnefatafl",
  quoridor: "game_wall_maze",
  hex: "game_hex",
  halma: "game_halma",
  lightsout: "game_lightsout",
  mastermind: "game_mastermind",
  dotsandboxes: "game_dotsandboxes",
  amazons: "game_amazons",
  kakuro: "game_kakuro",
  hashi: "game_hashi",
  skyscrapers: "game_skyscrapers",
  slitherlink: "game_slitherlink",
  fanorona: "game_fanorona",
  fleetbattle: "game_fleetbattle",
  konane: "game_konane",
  sternhalma: "game_sternhalma",
  baghchal: "game_baghchal",
  tablut: "game_tablut",
  abalone: "game_abalone",
  pyramidsolitaire: "game_pyramidsolitaire",
  surakarta: "game_surakarta"
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
    const streakTd = document.createElement("td");
    // A live win streak (rec.streak > 0) is shown with a small flame mark
    // so it stands out from the permanent best-streak number - both are
    // plain text/Unicode, no color, so they read the same on E-Ink.
    streakTd.textContent = rec.streak > 0 ? rec.bestStreak + " (\u{1F525}" + rec.streak + ")" : String(rec.bestStreak);
    tr.appendChild(nameTd);
    tr.appendChild(winsTd);
    tr.appendChild(lossesTd);
    tr.appendChild(drawsTd);
    tr.appendChild(streakTd);
    body.appendChild(tr);
  });

  if (table) table.classList.toggle("hidden", totalGames === 0);
  if (empty) empty.classList.toggle("hidden", totalGames > 0);
}

function renderAchievements() {
  const grid = document.getElementById("achievements-grid");
  if (!grid || typeof Achievements === "undefined") return;

  grid.innerHTML = "";
  Achievements.getStatus().forEach((a) => {
    const badge = document.createElement("div");
    badge.className = "achievement-badge" + (a.unlocked ? "" : " locked");

    const icon = document.createElement("span");
    icon.className = "achievement-badge-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = a.unlocked ? a.icon : "\u{1F512}";

    const text = document.createElement("div");
    text.className = "achievement-badge-text";
    const name = document.createElement("span");
    name.className = "achievement-badge-name";
    name.textContent = (window.I18n && window.I18n.t(a.nameKey)) || a.id;
    const desc = document.createElement("span");
    desc.className = "achievement-badge-desc";
    desc.textContent = (window.I18n && window.I18n.t(a.descKey)) || "";
    text.appendChild(name);
    text.appendChild(desc);

    badge.appendChild(icon);
    badge.appendChild(text);
    grid.appendChild(badge);
  });
}

function setBackupStatus(text) {
  const el = document.getElementById("backup-status");
  if (el) el.textContent = text || "";
}

function initBackupControls() {
  const exportBtn = document.getElementById("backup-export-button");
  const importBtn = document.getElementById("backup-import-button");
  const importInput = document.getElementById("backup-import-input");
  if (!exportBtn || !importBtn || !importInput || typeof Backup === "undefined") return;

  exportBtn.addEventListener("click", () => {
    Backup.exportBackup();
  });

  importBtn.addEventListener("click", () => {
    importInput.click();
  });

  importInput.addEventListener("change", () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;

    const confirmMsg = (window.I18n && window.I18n.t("backup_import_confirm")) ||
      "Import this backup? It will overwrite your current stats, achievements progress and saved games. This cannot be undone.";
    if (!window.confirm(confirmMsg)) {
      importInput.value = "";
      return;
    }

    Backup.importBackup(file, (err) => {
      importInput.value = "";
      if (err) {
        setBackupStatus((window.I18n && window.I18n.t("backup_import_error")) ||
          "Could not read that file. Make sure it's a PaperGames backup file exported from this page.");
        return;
      }
      setBackupStatus((window.I18n && window.I18n.t("backup_import_success")) || "Backup imported. Reloading…");
      setTimeout(() => window.location.reload(), 800);
    });
  });
}

function initStatsApp() {
  renderStats();
  renderAchievements();
  initBackupControls();
  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderStats();
      renderAchievements();
    });
  });
  const resetBtn = document.getElementById("stats-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const msg = (window.I18n && window.I18n.t("stats_reset_confirm")) || "Reset all stats? This cannot be undone.";
      if (window.confirm(msg)) {
        GameStats.reset();
        renderStats();
        renderAchievements();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initStatsApp);
