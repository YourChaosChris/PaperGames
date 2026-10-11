// differences-app.js
// Wires DifferencesCore ("Spot the Difference") to differences.html. Two
// pictures - one above the other, side by side on wide screens. Tapping a
// difference in either picture circles it in both; a tap where there is
// none only says so (no time limit, no penalty). The hint marks the area
// of a difference not found yet with a dashed frame.
//
// Each picture has a grid of invisible buttons over its 5 x 3 areas: they
// take the taps and tell a screen reader what is in each area.

const DF_SAVE_KEY = "einkchess_save_differences";

const AppStateDf = {
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

function saveDfGame() {
  if (typeof GameStorage === "undefined" || !AppStateDf.puzzle) return;
  GameStorage.save(DF_SAVE_KEY, { level: AppStateDf.level, puzzle: AppStateDf.puzzle, found: AppStateDf.found, hinted: AppStateDf.hinted });
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
  document.getElementById("start-df-game").addEventListener("click", () => startNewDfGame(levelSelect ? levelSelect.value : "easy"));
  document.getElementById("df-hint").addEventListener("click", hintDf);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateDf.puzzle) renderDf(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(DF_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.items) {
    AppStateDf.level = saved.level || "easy";
    AppStateDf.puzzle = saved.puzzle;
    AppStateDf.found = saved.found || [];
    AppStateDf.hinted = !!saved.hinted;
    AppStateDf.hintArea = -1;
    AppStateDf.gameOver = false;
    if (levelSelect) levelSelect.value = AppStateDf.level;
    showBoardDf();
    setStatusDf("Find the differences: tap a place in either picture.");
  }
}

function showBoardDf() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderDf();
}

function startNewDfGame(level) {
  AppStateDf.level = level;
  AppStateDf.puzzle = DifferencesCore.generatePuzzle(level);
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
  setStatusDf("Find the differences: tap a place in either picture.");
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

function winDf() {
  AppStateDf.gameOver = true;
  AppStateDf.hintArea = -1;
  const text = "You found all the differences!";
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

function renderDf() {
  const p = AppStateDf.puzzle;
  if (!p) return;
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
