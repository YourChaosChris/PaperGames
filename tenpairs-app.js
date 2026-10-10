// tenpairs-app.js
// Wires TenPairsCore to tenpairs.html.
//
// Tap a digit (thick double frame), then a second one: if they are equal
// or add up to 10 and see each other, both are crossed out (a thick
// diagonal line through a hollow digit, not grey alone); otherwise the
// status line says why. "Add" writes the open digits at the end (at most
// 5 times), "Undo" goes back any number of steps, "Hint" marks a pair
// that can be crossed out (or says to tap "Add"). The field scrolls only
// downwards; rows that are all crossed out vanish.

const TENPAIRS_SAVE_KEY = "einkchess_save_tenpairs";

const AppStateTp = {
  state: null,
  history: [],
  selected: -1,
  hint: null,
  hinted: false,
  recorded: false
};

function setStatusTp(text) { const el = document.getElementById("board-info"); if (el) I18n.setMsg(el, text || ""); }
function setResultTp(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveTp() {
  if (typeof GameStorage === "undefined" || !AppStateTp.state) return;
  GameStorage.save(TENPAIRS_SAVE_KEY, { state: AppStateTp.state, history: AppStateTp.history.slice(-300), hinted: AppStateTp.hinted, recorded: AppStateTp.recorded });
}

function initTenPairsApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  const startSel = document.getElementById("tp-start");
  const levelSel = document.getElementById("tp-level");
  const syncLevel = () => { levelSel.disabled = startSel.value === "classic"; };
  startSel.addEventListener("change", syncLevel);
  syncLevel();
  document.getElementById("start-tp-game").addEventListener("click", () => startGameTp(startSel.value, parseInt(levelSel.value, 10)));
  document.getElementById("tp-add").addEventListener("click", onAddTp);
  document.getElementById("tp-undo").addEventListener("click", onUndoTp);
  document.getElementById("tp-hint").addEventListener("click", onHintTp);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateTp.state) renderTp(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(TENPAIRS_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.cells)) {
    Object.assign(AppStateTp, { state: saved.state, history: saved.history || [], hinted: !!saved.hinted, recorded: !!saved.recorded, selected: -1, hint: null });
    showBoardTp();
    afterChangeTp("");
  }
}

function showBoardTp() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameTp(mode, level) {
  AppStateTp.state = TenPairsCore.newGame(mode, level);
  Object.assign(AppStateTp, { history: [], selected: -1, hint: null, hinted: false, recorded: false });
  setResultTp("");
  showBoardTp();
  saveTp();
  afterChangeTp("Tap a digit, then a second one: equal or adding up to 10.");
}

function statusKeyTp() { return TenPairsCore.status(AppStateTp.state); }

function afterChangeTp(msg) {
  const st = statusKeyTp();
  let text = msg || "";
  if (st) {
    const end = st === "won" ? "You crossed out every digit!" : st === "lost-rows" ? "The field has grown to more than 40 rows - the game is lost." : "No pair is left and no Add either - the game is lost.";
    text = (text ? text + " " : "") + end;
    if (!AppStateTp.recorded && typeof GameStats !== "undefined") {
      GameStats.record("tenpairs", st === "won" ? "win" : "loss", { hinted: AppStateTp.hinted });
      AppStateTp.recorded = true;
    }
    setResultTp(text);
    if (window.ResultModal && msg) window.ResultModal.show(st === "won" ? "You win!" : "You lose", text);
  } else if (!TenPairsCore.findPair(AppStateTp.state)) {
    text = (text ? text + " " : "") + "No pair is left: tap Add.";
  }
  saveTp();
  setStatusTp(text);
  renderTp();
}

function pushHistoryTp() {
  AppStateTp.history.push(TenPairsCore.clone(AppStateTp.state));
  if (AppStateTp.history.length > 300) AppStateTp.history.shift();
}

function playingTp() { return AppStateTp.state && !statusKeyTp(); }

function onCellTp(i) {
  if (!playingTp()) return;
  const s = AppStateTp.state;
  if (s.cells[i].x) return;
  const sel = AppStateTp.selected;
  if (sel === -1) { AppStateTp.selected = i; setStatusTp("Now tap the second digit."); renderTp(); return; }
  if (sel === i) { AppStateTp.selected = -1; setStatusTp("Tap a digit, then a second one: equal or adding up to 10."); renderTp(); return; }
  const why = TenPairsCore.check(s, sel, i);
  if (why) {
    AppStateTp.selected = i;
    setStatusTp(why === "sum" ? "These two don't add up to 10 and aren't equal. Now tap the second digit." : "These two don't see each other. Now tap the second digit.");
    renderTp();
    return;
  }
  const a = s.cells[sel].d, b = s.cells[i].d;
  pushHistoryTp();
  AppStateTp.state = TenPairsCore.cross(s, sel, i);
  AppStateTp.selected = -1;
  AppStateTp.hint = null;
  let msg = "Crossed out: " + a + " and " + b + ".";
  if (AppStateTp.state.lastRemovedRows === 1) msg += " An empty row vanished.";
  else if (AppStateTp.state.lastRemovedRows > 1) msg += " " + AppStateTp.state.lastRemovedRows + " empty rows vanished.";
  afterChangeTp(msg);
}

function onAddTp() {
  if (!playingTp()) return;
  const s = AppStateTp.state;
  if (!TenPairsCore.canAdd(s)) { setStatusTp("No Add left."); return; }
  pushHistoryTp();
  AppStateTp.state = TenPairsCore.add(s);
  AppStateTp.selected = -1;
  AppStateTp.hint = null;
  afterChangeTp("The open digits were added at the end.");
}

function onUndoTp() {
  if (!AppStateTp.history.length) { setStatusTp("Nothing to undo."); return; }
  AppStateTp.state = AppStateTp.history.pop();
  AppStateTp.selected = -1;
  AppStateTp.hint = null;
  setResultTp("");
  afterChangeTp("Undone.");
}

function onHintTp() {
  if (!playingTp()) return;
  const p = TenPairsCore.findPair(AppStateTp.state);
  AppStateTp.hinted = true;
  AppStateTp.selected = -1;
  if (!p) { AppStateTp.hint = null; setStatusTp("Hint: no pair is left - tap Add."); renderTp(); return; }
  AppStateTp.hint = p;
  saveTp();
  setStatusTp("Hint: the two marked digits can be crossed out.");
  renderTp();
}

function renderTp() {
  const s = AppStateTp.state;
  if (!s) return;
  const grid = document.getElementById("tp-grid");
  grid.innerHTML = "";
  const playing = !statusKeyTp();
  const rows = TenPairsCore.rows(s);
  for (let r = 0; r < rows; r++) {
    const row = document.createElement("div");
    row.className = "tp-row";
    for (let c = 0; c < TenPairsCore.COLS; c++) {
      const i = r * TenPairsCore.COLS + c;
      const cell = s.cells[i];
      if (!cell) { const e = document.createElement("span"); e.className = "tp-cell tp-empty"; e.setAttribute("aria-hidden", "true"); row.appendChild(e); continue; }
      const b = document.createElement("button");
      b.type = "button";
      const hinted = AppStateTp.hint && AppStateTp.hint.indexOf(i) !== -1;
      b.className = "tp-cell" + (cell.x ? " tp-crossed" : "") + (AppStateTp.selected === i ? " tp-selected" : "") + (hinted ? " tp-hint" : "");
      b.textContent = String(cell.d);
      b.disabled = !playing || cell.x;
      b.setAttribute("data-i", String(i));
      I18n.setAria(b, "Row " + (r + 1) + ", column " + (c + 1) + ", " + (cell.x ? "crossed out" : cell.d + (AppStateTp.selected === i ? ", selected" : "") + (hinted ? ", hint" : "")));
      b.addEventListener("click", () => onCellTp(i));
      row.appendChild(b);
    }
    grid.appendChild(row);
  }
  I18n.setMsg(document.getElementById("tp-info"), "Digits left: " + TenPairsCore.left(s) + " · Add used: " + s.adds + " of " + TenPairsCore.MAX_ADDS);
  const addBtn = document.getElementById("tp-add");
  I18n.setMsg(addBtn, "Add (" + (TenPairsCore.MAX_ADDS - s.adds) + " left)");
  addBtn.disabled = !playing || !TenPairsCore.canAdd(s);
  document.getElementById("tp-hint").disabled = !playing;
  document.getElementById("tp-undo").disabled = !AppStateTp.history.length;
  I18n.setMsg(document.getElementById("tp-mode-line"), s.mode === "classic" ? "Classic start" : ["", "Random start · Easy", "Random start · Medium", "Random start · Hard"][s.level]);
}

document.addEventListener("DOMContentLoaded", initTenPairsApp);
