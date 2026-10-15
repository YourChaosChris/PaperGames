// differences-app.js
// Wires DifferencesCore ("Spot the Difference") to differences.html. Two
// pictures - one above the other, side by side on wide screens. Tapping a
// difference in either picture circles it in both; a tap where there is
// none only says so (no time limit, no penalty). The hint marks the area
// of a difference not found yet with a dashed frame.
//
// Each picture has a grid of invisible buttons over its 5 x 3 areas: they
// take the taps and tell a screen reader what is in each area.
//
// Mode "Picture search": one large picture of a room and above it the
// drawings to find, as small pictures (no words needed). Tapping one of
// them in the large picture circles it there and ticks it off above. The
// room (kitchen, attic, garden, ...) is chosen next to the level, or by
// chance.

const DF_SAVE_KEY = "einkchess_save_differences";

const AppStateDf = {
  mode: "diff",  // "diff" | "search"
  level: "easy",
  puzzle: null,
  found: [],     // areas of differences found
  hintArea: -1,
  hinted: false,
  gameOver: false
};

function tDf(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusDf(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function syncDifferencesQuickRules(mode) {
  if (!window.PaperGamesQuickRules) return;
  const isSearch = (mode || AppStateDf.mode) === "search";
  const suffix = isSearch ? "_search" : "";
  window.PaperGamesQuickRules.setSentences("differences", [
    "quickrules_differences" + suffix + "_1",
    "quickrules_differences" + suffix + "_2",
    "quickrules_differences" + suffix + "_3"
  ]);
}

function saveDfGame() {
  if (typeof GameStorage === "undefined" || !AppStateDf.puzzle) return;
  GameStorage.save(DF_SAVE_KEY, { mode: AppStateDf.mode, level: AppStateDf.level, puzzle: AppStateDf.puzzle, found: AppStateDf.found, hinted: AppStateDf.hinted });
}

function clearSavedDfGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(DF_SAVE_KEY);
}

function initDfApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("df-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  const modeSelect = document.getElementById("df-mode");
  if (modeSelect) modeSelect.addEventListener("change", () => {
    levelLabelsDf(modeSelect.value);
    syncDifferencesQuickRules(modeSelect.value);
  });
  document.getElementById("start-df-game").addEventListener("click", () => {
    AppStateDf.mode = modeSelect && modeSelect.value === "search" ? "search" : "diff";
    const roomSelect = document.getElementById("df-room");
    startNewDfGame(levelSelect ? levelSelect.value : "easy", roomSelect ? roomSelect.value : "random");
  });
  document.getElementById("df-hint").addEventListener("click", hintDf);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateDf.puzzle) renderDf(); });
  }
  syncDifferencesQuickRules();
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(DF_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.items) {
    AppStateDf.mode = saved.mode === "search" ? "search" : "diff";
    syncDifferencesQuickRules();
    if (modeSelect) modeSelect.value = AppStateDf.mode;
    levelLabelsDf(AppStateDf.mode);
    AppStateDf.level = saved.level || "easy";
    AppStateDf.puzzle = saved.puzzle;
    AppStateDf.found = saved.found || [];
    AppStateDf.hinted = !!saved.hinted;
    AppStateDf.hintArea = -1;
    AppStateDf.gameOver = false;
    if (levelSelect) levelSelect.value = AppStateDf.level;
    showBoardDf();
    setStatusDf(AppStateDf.mode === "search" ? "Find the things shown above the picture: tap them in the picture." : "Find the differences: tap a place in either picture.");
  }
}

// The level choices name differences or things to find; the room choice
// is only there for the picture search.
function levelLabelsDf(mode) {
  const room = document.getElementById("df-room");
  if (room) room.classList.toggle("hidden", mode !== "search");
  const sel = document.getElementById("df-level");
  if (!sel) return;
  ["easy", "medium", "hard"].forEach((lv) => {
    const o = sel.querySelector('option[value="' + lv + '"]');
    if (o) I18n.setKey(o, (mode === "search" ? "df_slevel_" : "df_level_") + lv);
  });
}

function showBoardDf() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderDf();
}

function startNewDfGame(level, room) {
  AppStateDf.level = level;
  AppStateDf.puzzle = AppStateDf.mode === "search" ? DifferencesCore.generateSearch(level, null, room) : DifferencesCore.generatePuzzle(level);
  AppStateDf.found = [];
  AppStateDf.hintArea = -1;
  AppStateDf.hinted = false;
  AppStateDf.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardDf();
  setStatusDf(AppStateDf.mode === "search" ? "Find the things shown above the picture: tap them in the picture." : "Find the differences: tap a place in either picture.");
  saveDfGame();
}

function onAreaDf(area) {
  if (AppStateDf.gameOver) return;
  const p = AppStateDf.puzzle;
  const isDiff = p.diffs.some((d) => d.area === area);
  if (!isDiff) {
    setStatusDf("There is no difference there - keep looking.");
    return;
  }
  if (AppStateDf.found.indexOf(area) !== -1) {
    setStatusDf("You have already found this one.");
    return;
  }
  AppStateDf.found.push(area);
  if (AppStateDf.hintArea === area) AppStateDf.hintArea = -1;
  if (AppStateDf.found.length === p.diffs.length) {
    winDf();
    return;
  }
  setStatusDf("Found! " + AppStateDf.found.length + " of " + p.diffs.length + ".");
  renderDf();
  saveDfGame();
}

// Picture search: a tap on a cell of the large picture.
function onCellDf(cell) {
  if (AppStateDf.gameOver) return;
  const p = AppStateDf.puzzle;
  if (p.targets.indexOf(cell) === -1) {
    setStatusDf("That is not one of the things you are looking for.");
    return;
  }
  if (AppStateDf.found.indexOf(cell) !== -1) {
    setStatusDf("You have already found this one.");
    return;
  }
  AppStateDf.found.push(cell);
  if (AppStateDf.hintArea === cell) AppStateDf.hintArea = -1;
  if (AppStateDf.found.length === p.targets.length) {
    winDf();
    return;
  }
  setStatusDf("Found! " + AppStateDf.found.length + " of " + p.targets.length + ".");
  renderDf();
  saveDfGame();
}

function winDf() {
  AppStateDf.gameOver = true;
  AppStateDf.hintArea = -1;
  const text = AppStateDf.mode === "search" ? "You found all the things!" : "You found all the differences!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusDf(text);
  if (typeof GameStats !== "undefined") GameStats.record("differences", "win", { hinted: AppStateDf.hinted });
  if (window.ResultModal) window.ResultModal.show(tDf("df_win_title"), I18n.msg(text));
  clearSavedDfGame();
  renderDf();
}

function hintDf() {
  const p = AppStateDf.puzzle;
  if (!p || AppStateDf.gameOver) return;
  if (AppStateDf.mode === "search") {
    const left = p.targets.filter((c) => AppStateDf.found.indexOf(c) === -1);
    if (!left.length) return;
    AppStateDf.hinted = true;
    AppStateDf.hintArea = left[0];
    setStatusDf("Hint: one of the things is in the marked place.");
    renderDf();
    saveDfGame();
    return;
  }
  const open = p.diffs.filter((d) => AppStateDf.found.indexOf(d.area) === -1);
  if (!open.length) return;
  AppStateDf.hinted = true;
  AppStateDf.hintArea = open[0].area;
  setStatusDf("Hint: there is a difference in the marked area.");
  renderDf();
  saveDfGame();
}

// What a screen reader hears for an area: picture, row, column and the
// drawing there (or "empty").
function areaLabelDf(items, area, picture) {
  const it = items.find((x) => x.area === area);
  const row = Math.floor(area / DifferencesCore.COLS) + 1, col = (area % DifferencesCore.COLS) + 1;
  let label = tDf("df_aria_area").split("{P}").join(String(picture)).split("{R}").join(String(row)).split("{C}").join(String(col)) + ": " +
    (it ? tDf("df_item_" + it.type) : tDf("df_aria_empty"));
  if (AppStateDf.found.indexOf(area) !== -1) label += ", " + tDf("df_aria_found");
  return label;
}

// What a screen reader hears for a drawing in the search picture: type,
// pattern and, where it matters, whether it is mirrored.
function lookLabelDf(it) {
  let label = tDf("df_item_" + it.type) + ", " + tDf("df_pat_" + it.pattern);
  if (DifferencesCore.TYPES[it.type].asym && it.mirror) label += ", " + tDf("df_mirrored");
  return label;
}

function renderSearchDf() {
  const p = AppStateDf.puzzle;
  const D = DifferencesCore;
  const C = D.CELL, W = p.cols * C, H = p.rows * C;
  const centre = (cell) => [(cell % p.cols) * C + C / 2, Math.floor(cell / p.cols) * C + C / 2];
  let marks = "";
  AppStateDf.found.forEach((cell) => { const c = centre(cell); marks += '<circle class="df-found" cx="' + c[0] + '" cy="' + c[1] + '" r="19"/>'; });
  if (AppStateDf.hintArea !== -1) { const c = centre(AppStateDf.hintArea); marks += '<rect class="df-hint" x="' + (c[0] - 19) + '" y="' + (c[1] - 19) + '" width="38" height="38"/>'; }
  const box = document.getElementById("df-search-pic");
  let html = '<svg class="df-svg" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true" focusable="false">' + D.searchSvg(p, "dfs") + marks +
    '</svg><div class="df-areas" style="grid-template-columns:repeat(' + p.cols + ",1fr);grid-template-rows:repeat(" + p.rows + ',1fr)">';
  for (let cell = 0; cell < p.cols * p.rows; cell++) html += '<button type="button" class="df-area" data-cell="' + cell + '"></button>';
  box.innerHTML = html + "</div>";
  box.querySelectorAll(".df-area").forEach((btn) => {
    const cell = parseInt(btn.getAttribute("data-cell"), 10);
    const it = p.items.find((x) => x.cell === cell);
    let label = tDf("df_aria_cell").split("{R}").join(String(Math.floor(cell / p.cols) + 1)).split("{C}").join(String((cell % p.cols) + 1)) + ": " + (it ? lookLabelDf(it) : tDf("df_aria_empty"));
    if (AppStateDf.found.indexOf(cell) !== -1) label += ", " + tDf("df_aria_found");
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", () => onCellDf(cell));
  });
  // The room's name above the picture (older saved pictures have none).
  const roomName = document.getElementById("df-room-name");
  if (roomName) {
    if (p.room && D.ROOMS[p.room]) I18n.setKey(roomName, "df_room_" + p.room);
    else { roomName.removeAttribute("data-i18n"); roomName.textContent = ""; }
  }
  // The things to find, as small pictures; found ones are crossed out.
  const list = document.getElementById("df-targets");
  list.innerHTML = p.targets.map((cell, i) => {
    const it = p.items.find((x) => x.cell === cell);
    const found = AppStateDf.found.indexOf(cell) !== -1;
    return '<li class="df-target' + (found ? " df-target-found" : "") + '" aria-label="' + lookLabelDf(it) + (found ? ", " + tDf("df_aria_found") : "") + '">' +
      '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + D.lookSvg(it, "dft" + i) +
      (found ? '<path d="M6 34L34 6" stroke="#141413" stroke-width="3" stroke-linecap="round"/>' : "") + "</svg></li>";
  }).join("");
  const info = document.getElementById("df-info");
  if (info) I18n.setMsg(info, "Found: " + AppStateDf.found.length + " of " + p.targets.length);
}

function renderDf() {
  const p = AppStateDf.puzzle;
  if (!p) return;
  const search = AppStateDf.mode === "search";
  document.getElementById("df-diff-box").classList.toggle("hidden", search);
  document.getElementById("df-search-box").classList.toggle("hidden", !search);
  if (search) { renderSearchDf(); return; }
  const D = DifferencesCore;
  const itemsB = D.pictureB(p);
  ["a", "b"].forEach((which, idx) => {
    const box = document.getElementById("df-pic-" + which);
    let marks = "";
    AppStateDf.found.forEach((area) => {
      const c = D.areaCentre(area);
      marks += '<circle class="df-found" cx="' + c[0] + '" cy="' + c[1] + '" r="27"/>';
    });
    if (AppStateDf.hintArea !== -1) {
      const c = D.areaCentre(AppStateDf.hintArea);
      marks += '<rect class="df-hint" x="' + (c[0] - 29) + '" y="' + (c[1] - 29) + '" width="58" height="58"/>';
    }
    let html = '<svg class="df-svg" viewBox="0 0 ' + D.W + " " + D.H + '" aria-hidden="true" focusable="false">' +
      D.pictureSvg(p, which, "df" + which) + marks + "</svg><div class=\"df-areas\">";
    for (let area = 0; area < D.COLS * D.ROWS; area++) {
      html += '<button type="button" class="df-area" data-area="' + area + '"></button>';
    }
    box.innerHTML = html + "</div>";
    box.querySelectorAll(".df-area").forEach((btn) => {
      const area = parseInt(btn.getAttribute("data-area"), 10);
      btn.setAttribute("aria-label", areaLabelDf(which === "b" ? itemsB : p.items, area, idx + 1));
      btn.addEventListener("click", () => onAreaDf(area));
    });
  });
  const info = document.getElementById("df-info");
  if (info) I18n.setMsg(info, "Found: " + AppStateDf.found.length + " of " + p.diffs.length);
}

document.addEventListener("DOMContentLoaded", initDfApp);
