// slidepuzzle-app.js
// Wires SlidePuzzleCore (sliding puzzle) to slidepuzzle.html.
//
// Board of 3 x 3, 4 x 4 or 5 x 5 places; a tile is a white square with a
// large number, the gap is empty and dashed. Tapping a tile in the row or
// column of the gap slides it (and every tile in between) towards the gap.
// A move counter, "New puzzle" to mix again and a hint button that marks
// the tile to move next with a thick frame. No timer, nothing animated.
// On 3 x 3 the result names the fewest moves possible from the start.

const SLIDEPUZZLE_SAVE_KEY = "einkchess_save_slidepuzzle";

const AppStateSP = {
  state: null,
  hint: -1,         // the place the hint marks (-1: none)
  hints: 0
};

function tSP(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function saveSP() {
  if (typeof GameStorage === "undefined" || !AppStateSP.state) return;
  if (AppStateSP.state.solved) { GameStorage.clear(SLIDEPUZZLE_SAVE_KEY); return; }
  GameStorage.save(SLIDEPUZZLE_SAVE_KEY, { state: AppStateSP.state, hints: AppStateSP.hints });
}

function validStateSP(s) {
  return !!s && SlidePuzzleCore.SIZES.indexOf(s.size) !== -1 && Array.isArray(s.tiles) && s.tiles.length === s.size * s.size && !s.solved &&
    SlidePuzzleCore.isSolvable(s.tiles, s.size);
}

function startSP() {
  const size = parseInt(document.getElementById("sp-size").value, 10) || 3;
  AppStateSP.state = SlidePuzzleCore.newGame(size);
  AppStateSP.hint = -1;
  AppStateSP.hints = 0;
  setResultSP("");
  if (window.ResultModal) window.ResultModal.hide();
  showBoardSP();
  renderSP();
  saveSP();
}

function showBoardSP() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
}

function setStatusSP(text) {
  const el = document.getElementById("board-info");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function setResultSP(text) {
  const el = document.getElementById("game-result");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function tapSP(index) {
  const s = AppStateSP.state;
  if (!s || s.solved) return;
  const next = SlidePuzzleCore.move(s, index);
  if (next === s) {
    setStatusSP(tSP("sp_not_in_line"));
    return;
  }
  AppStateSP.state = next;
  AppStateSP.hint = -1;
  if (next.solved) finishSP();
  renderSP();
  saveSP();
}

function hintSP() {
  const s = AppStateSP.state;
  if (!s || s.solved) return;
  AppStateSP.hint = SlidePuzzleCore.hint(s);
  if (AppStateSP.hint === null) AppStateSP.hint = -1;
  AppStateSP.hints++;
  renderSP();
  saveSP();
  if (AppStateSP.hint >= 0) setStatusSP(tSP("sp_hint_text", { n: s.tiles[AppStateSP.hint] }));
}

function finishSP() {
  const s = AppStateSP.state;
  let text = tSP("sp_solved", { n: s.moves });
  if (s.size === 3) {
    const best = SlidePuzzleCore.solve3(s.start);
    if (best) text += " " + tSP("sp_best", { n: best.length });
  }
  setResultSP(text);
  if (window.ResultModal) window.ResultModal.show("You win!", text);
  if (typeof GameStats !== "undefined") GameStats.record("slidepuzzle", "win", { hinted: AppStateSP.hints > 0 });
}

function renderSP() {
  const s = AppStateSP.state;
  if (!s) return;
  const board = document.getElementById("sp-board");
  board.style.gridTemplateColumns = "repeat(" + s.size + ", 1fr)";
  board.className = "sp-board sp-size-" + s.size;
  board.innerHTML = "";
  s.tiles.forEach((v, i) => {
    const b = document.createElement("button");
    b.type = "button";
    const row = Math.floor(i / s.size) + 1, col = (i % s.size) + 1;
    if (v === 0) {
      b.className = "sp-tile sp-gap";
      b.disabled = true;
      b.setAttribute("aria-label", tSP("sp_gap_aria", { r: row, c: col }));
    } else {
      b.className = "sp-tile" + (i === AppStateSP.hint ? " sp-hint" : "") + (SlidePuzzleCore.canMove(s, i) ? " sp-movable" : "");
      b.textContent = String(v);
      b.setAttribute("aria-label", tSP("sp_tile_aria", { n: v, r: row, c: col }));
      b.addEventListener("click", () => tapSP(i));
    }
    board.appendChild(b);
  });
  // Square places without aspect-ratio (not known to every e-ink browser).
  board.style.gridAutoRows = Math.floor((board.clientWidth || 300) / s.size) + "px";
  document.getElementById("game-meta").textContent = tSP("sp_moves", { n: s.moves });
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.disabled = s.solved;
  if (!s.solved && AppStateSP.hint < 0) setStatusSP(tSP("sp_goal_status"));
}

function initSlidePuzzleApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-sp-puzzle").addEventListener("click", startSP);
  document.getElementById("hint-btn").addEventListener("click", hintSP);
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateSP.state) renderSP(); });
  window.addEventListener("resize", () => { if (AppStateSP.state) renderSP(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SLIDEPUZZLE_SAVE_KEY) : null;
  if (saved && validStateSP(saved.state)) {
    AppStateSP.state = saved.state;
    AppStateSP.hints = saved.hints || 0;
    document.getElementById("sp-size").value = String(saved.state.size);
    showBoardSP();
    renderSP();
  }
}

document.addEventListener("DOMContentLoaded", initSlidePuzzleApp);
