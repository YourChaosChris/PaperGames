// tangram-app.js
// Wires TangramCore ("Tangram") to tangram.html.
//
// Choose a piece below the outline, turn it by 45 degrees or flip it,
// then tap where it should go: it snaps to the nearest place where it
// fits. Tap a laid piece to pick it up again. No dragging. Hint lays one
// piece where the computer's solution has it. On Easy the lines of that
// solution are drawn faintly inside the outline. Pieces differ by black
// and white patterns, never by colour.

const TG_SAVE_KEY = "einkchess_save_tangram";
const TG_DONE_KEY = "einkchess_tangram_done";
const TG_U = 40;   // drawing units per tangram unit
const TG_PAD = 1;  // free units around the outline

const AppStateTg = {
  level: "easy",
  index: 0,
  fig: null,
  rows: null,
  solution: null,
  placed: [],
  selected: null,
  k: 0,
  flip: false,
  hintPiece: null,
  hinted: false,
  gameOver: false
};

function tTg(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusTg(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function doneTg() {
  const d = typeof GameStorage !== "undefined" ? GameStorage.load(TG_DONE_KEY) : null;
  return d && typeof d === "object" ? d : {};
}

function saveTgGame() {
  if (typeof GameStorage === "undefined" || !AppStateTg.fig) return;
  GameStorage.save(TG_SAVE_KEY, { level: AppStateTg.level, index: AppStateTg.index, placed: AppStateTg.placed, hinted: AppStateTg.hinted });
}

function clearSavedTgGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(TG_SAVE_KEY);
}

// Black-and-white patterns, one per piece.
const TG_PATTERNS = {
  L1: '<rect width="8" height="8" fill="#fff"/><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="#141413" stroke-width="1.6"/>',
  L2: '<rect width="8" height="8" fill="#fff"/><path d="M0 4H8M4 0V8" stroke="#141413" stroke-width="1.3"/>',
  M: '<rect width="8" height="8" fill="#fff"/><circle cx="4" cy="4" r="1.5" fill="#141413"/>',
  S1: '<rect width="8" height="8" fill="#fff"/><path d="M2 0V8M6 0V8" stroke="#141413" stroke-width="1.6"/>',
  S2: '<rect width="8" height="8" fill="#fff"/><path d="M0 2H8M0 6H8" stroke="#141413" stroke-width="1.6"/>',
  Q: '<rect width="8" height="8" fill="#141413"/>',
  P: '<rect width="8" height="8" fill="#fff"/><rect width="4" height="4" fill="#141413"/><rect x="4" y="4" width="4" height="4" fill="#141413"/>'
};

function tgDefs(prefix) {
  return "<defs>" + TangramCore.PIECES.map((p) => '<pattern id="' + prefix + p + '" width="8" height="8" patternUnits="userSpaceOnUse">' + TG_PATTERNS[p] + "</pattern>").join("") + "</defs>";
}

function polyPath(pts, ox, oy, u) {
  return "M" + pts.map((p) => ((p[0] + ox) * u).toFixed(1) + " " + ((p[1] + oy) * u).toFixed(1)).join("L") + "Z";
}

function pieceNameTg(piece) {
  return tTg("tg_piece_" + TangramCore.KIND[piece]);
}

function fillOutlineListTg() {
  const levelSel = document.getElementById("tg-level");
  const numSel = document.getElementById("tg-number");
  const done = doneTg();
  const lv = levelSel.value;
  const keep = numSel.value;
  numSel.innerHTML = "";
  TangramCore.LEVELS[lv].forEach((f, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = (i + 1) + (done[f.id] ? " ✓" : "");
    numSel.appendChild(o);
  });
  if (keep && +keep < TangramCore.LEVELS[lv].length) numSel.value = keep;
  else {
    const first = TangramCore.LEVELS[lv].findIndex((f) => !done[f.id]);
    numSel.value = String(first < 0 ? 0 : first);
  }
}

function initTgApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("tg-level");
  const numSel = document.getElementById("tg-number");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  levelSel.addEventListener("change", () => { numSel.value = ""; fillOutlineListTg(); });
  fillOutlineListTg();
  document.getElementById("start-tg-game").addEventListener("click", () => startTgGame(levelSel.value, +numSel.value));
  document.getElementById("tg-turn").addEventListener("click", () => turnTg(1, false));
  document.getElementById("tg-flip").addEventListener("click", () => turnTg(0, true));
  document.getElementById("tg-hint").addEventListener("click", hintTg);
  document.getElementById("tg-next").addEventListener("click", nextTg);
  document.getElementById("tg-board").addEventListener("click", onBoardTg);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateTg.fig) renderTg(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(TG_SAVE_KEY) : null;
  if (saved && TangramCore.LEVELS[saved.level] && TangramCore.LEVELS[saved.level][saved.index] && Array.isArray(saved.placed)) {
    loadFigureTg(saved.level, saved.index);
    AppStateTg.placed = saved.placed.filter((p) => TangramCore.fits(AppStateTg.fig, [], p));
    AppStateTg.hinted = !!saved.hinted;
    levelSel.value = saved.level;
    numSel.value = "";
    fillOutlineListTg();
    numSel.value = String(saved.index);
    showBoardTg();
    setStatusTg("Choose a piece below the outline.");
  }
}

function loadFigureTg(level, index) {
  const f = TangramCore.LEVELS[level][index];
  AppStateTg.level = level;
  AppStateTg.index = index;
  AppStateTg.rows = f.rows;
  AppStateTg.fig = TangramCore.parseFigure(f.rows);
  AppStateTg.solution = TangramCore.solve(AppStateTg.fig);
  AppStateTg.placed = [];
  AppStateTg.selected = null;
  AppStateTg.k = 0;
  AppStateTg.flip = false;
  AppStateTg.hintPiece = null;
  AppStateTg.hinted = false;
  AppStateTg.gameOver = false;
}

function showBoardTg() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderTg();
}

function startTgGame(level, index) {
  loadFigureTg(level, index);
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardTg();
  setStatusTg("Choose a piece below the outline.");
  saveTgGame();
}

function nextTg() {
  const list = TangramCore.LEVELS[AppStateTg.level];
  const done = doneTg();
  let i = (AppStateTg.index + 1) % list.length;
  for (let s = 1; s <= list.length; s++) {
    const j = (AppStateTg.index + s) % list.length;
    if (!done[list[j].id]) { i = j; break; }
  }
  document.getElementById("tg-number").value = String(i);
  startTgGame(AppStateTg.level, i);
}

function selectTg(piece) {
  if (AppStateTg.gameOver) return;
  const at = AppStateTg.placed.findIndex((p) => p.piece === piece);
  if (at !== -1) {
    const p = AppStateTg.placed.splice(at, 1)[0];
    AppStateTg.k = p.k;
    AppStateTg.flip = p.flip;
  } else if (AppStateTg.selected !== piece) {
    AppStateTg.k = 0;
    AppStateTg.flip = false;
  }
  AppStateTg.selected = piece;
  AppStateTg.hintPiece = null;
  setStatusTg(at !== -1 ? "Piece picked up." : "Turn or flip it, then tap where it should go.");
  renderTg();
  saveTgGame();
}

function turnTg(step, flip) {
  if (!AppStateTg.selected || AppStateTg.gameOver) {
    setStatusTg("Choose a piece below the outline.");
    return;
  }
  if (flip) AppStateTg.flip = !AppStateTg.flip;
  AppStateTg.k = (AppStateTg.k + step) % 8;
  setStatusTg(AppStateTg.k % 2 ? "Turned this way the piece fits nowhere - turn it once more." : "Turn or flip it, then tap where it should go.");
  renderTg();
}

// The tapped point in tangram units of the figure.
function boardPointTg(evt) {
  const svg = document.querySelector("#tg-board svg");
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const x = vb.x + (evt.clientX - rect.left) / rect.width * vb.width;
  const y = vb.y + (evt.clientY - rect.top) / rect.height * vb.height;
  return [x / TG_U - TG_PAD, y / TG_U - TG_PAD];
}

function pointInPolyTg(pt, poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function onBoardTg(evt) {
  if (!AppStateTg.fig || AppStateTg.gameOver) return;
  const pt = boardPointTg(evt);
  if (!pt) return;
  const hit = AppStateTg.placed.find((p) => pointInPolyTg(pt, TangramCore.placementPolygon(p)));
  if (hit && !AppStateTg.selected) { selectTg(hit.piece); return; }
  if (!AppStateTg.selected) {
    setStatusTg("Choose a piece below the outline.");
    return;
  }
  if (AppStateTg.k % 2) {
    setStatusTg("Turned this way the piece fits nowhere - turn it once more.");
    return;
  }
  const pl = TangramCore.snap(AppStateTg.fig, AppStateTg.placed, AppStateTg.selected, AppStateTg.k, AppStateTg.flip, pt[0], pt[1], 1.6);
  if (!pl) {
    if (hit) { selectTg(hit.piece); return; }
    setStatusTg("The piece does not fit there.");
    return;
  }
  AppStateTg.placed.push(pl);
  AppStateTg.selected = null;
  AppStateTg.hintPiece = null;
  if (TangramCore.isComplete(AppStateTg.fig, AppStateTg.placed)) { winTg(); return; }
  setStatusTg("Choose a piece below the outline.");
  renderTg();
  saveTgGame();
}

function hintTg() {
  if (!AppStateTg.fig || AppStateTg.gameOver) return;
  AppStateTg.hinted = true;
  const h = TangramCore.findHint(AppStateTg.fig, AppStateTg.solution, AppStateTg.placed);
  if (!h) return;
  AppStateTg.placed = AppStateTg.placed.filter((p) => h.remove.indexOf(p.piece) === -1 && p.piece !== h.place.piece);
  AppStateTg.placed.push(h.place);
  AppStateTg.selected = null;
  AppStateTg.hintPiece = h.place.piece;
  if (TangramCore.isComplete(AppStateTg.fig, AppStateTg.placed)) { winTg(); return; }
  setStatusTg(h.remove.length ? "Hint: one piece has been laid; pieces in its way went back." : "Hint: one piece has been laid.");
  renderTg();
  saveTgGame();
}

function winTg() {
  AppStateTg.gameOver = true;
  AppStateTg.selected = null;
  AppStateTg.hintPiece = null;
  const text = "The outline is full - solved!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusTg(text);
  if (typeof GameStorage !== "undefined") {
    const done = doneTg();
    done[TangramCore.LEVELS[AppStateTg.level][AppStateTg.index].id] = true;
    GameStorage.save(TG_DONE_KEY, done);
  }
  if (typeof GameStats !== "undefined") GameStats.record("tangram", "win", { hinted: AppStateTg.hinted });
  if (window.ResultModal) window.ResultModal.show(tTg("tg_win_title"), I18n.msg(text));
  clearSavedTgGame();
  fillOutlineListTg();
  document.getElementById("tg-number").value = String(AppStateTg.index);
  renderTg();
}

/*** Rendering ***/

// The outline: white inside (patterns belong to the pieces only), its
// border thick.
function outlineSvgTg(fig, u) {
  const P = TG_PAD;
  let fill = "", edges = "";
  const has = fig.quarters;
  const tri = (r, c, q) => {
    const m = [c + 0.5, r + 0.5], k = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]];
    return [k[q], k[(q + 1) % 4], m];
  };
  // Across which quarter each edge of a quarter lies: side edge, then the
  // two diagonal halves.
  const across = { 0: [[-1, 0, 2], [0, 0, 1], [0, 0, 3]], 1: [[0, 1, 3], [0, 0, 2], [0, 0, 0]], 2: [[1, 0, 0], [0, 0, 3], [0, 0, 1]], 3: [[0, -1, 1], [0, 0, 0], [0, 0, 2]] };
  Object.keys(has).forEach((key) => {
    const [r, c, q] = key.split(",").map(Number);
    const t = tri(r, c, q);
    fill += polyPath(t, P, P, u);
    // edges: side t0-t1, then t1-m, m-t0
    const segs = [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]];
    across[q].forEach((d, i) => {
      if (!has[(r + d[0]) + "," + (c + d[1]) + "," + d[2]]) {
        const s = segs[i];
        edges += "M" + ((s[0][0] + P) * u).toFixed(1) + " " + ((s[0][1] + P) * u).toFixed(1) + "L" + ((s[1][0] + P) * u).toFixed(1) + " " + ((s[1][1] + P) * u).toFixed(1);
      }
    });
  });
  return '<path d="' + fill + '" fill="#fff" stroke="none"/><path d="' + edges + '" fill="none" stroke="#141413" stroke-width="3.5" stroke-linecap="round"/>';
}

function renderTg() {
  const fig = AppStateTg.fig;
  if (!fig) return;
  const u = TG_U, P = TG_PAD;
  const W = (fig.cols + 2 * P) * u, H = (fig.rows + 2 * P) * u;
  let svg = '<svg class="pt-svg" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true" focusable="false">' + tgDefs("tgb") +
    '<rect width="' + W + '" height="' + H + '" fill="#fff"/>' + outlineSvgTg(fig, u);
  if (AppStateTg.level === "easy" && AppStateTg.solution) {
    svg += AppStateTg.solution.map((s) => '<path d="' + polyPath(TangramCore.placementPolygon(s), P, P, u) + '" fill="none" stroke="#141413" stroke-width="1" stroke-dasharray="3 4"/>').join("");
  }
  AppStateTg.placed.forEach((p) => {
    svg += '<path d="' + polyPath(TangramCore.placementPolygon(p), P, P, u) + '" fill="url(#tgb' + p.piece + ')" stroke="#141413" stroke-width="2.5" stroke-linejoin="round"/>';
    if (AppStateTg.hintPiece === p.piece) svg += '<path class="pt-hint" d="' + polyPath(TangramCore.placementPolygon(p), P, P, u) + '"/>';
  });
  svg += "</svg>";
  const box = document.getElementById("tg-board");
  box.innerHTML = svg;
  box.style.maxWidth = ((fig.cols + 2 * P) * 3.2) + "rem";
  box.setAttribute("aria-label", tTg("tg_aria_board").split("{N}").join(String(AppStateTg.index + 1)) + ": " +
    AppStateTg.placed.map((p) => pieceNameTg(p.piece)).join(", "));
  renderTrayTg();
  renderCurrentTg();
  const info = document.getElementById("tg-info");
  if (info) I18n.setMsg(info, "Pieces laid: " + AppStateTg.placed.length + " of 7");
  const title = document.getElementById("tg-title");
  if (title) title.textContent = tTg("tg_aria_board").split("{N}").join(String(AppStateTg.index + 1));
  document.getElementById("tg-hint").disabled = AppStateTg.gameOver;
  document.getElementById("tg-next").classList.toggle("hidden", !AppStateTg.gameOver);
}

function pieceSvgTg(piece, k, flip, prefix, u, label) {
  const poly = TangramCore.polygon(TangramCore.KIND[piece], k, flip);
  const w = Math.max.apply(null, poly.map((p) => p[0])), h = Math.max.apply(null, poly.map((p) => p[1]));
  return '<svg viewBox="-3 -3 ' + (w * u + 6).toFixed(1) + " " + (h * u + 6).toFixed(1) + '"' + (label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true" focusable="false"') + ">" + tgDefs(prefix) +
    '<path d="' + polyPath(poly, 0, 0, u) + '" fill="url(#' + prefix + piece + ')" stroke="#141413" stroke-width="2.5" stroke-linejoin="round"/></svg>';
}

function renderTrayTg() {
  const tray = document.getElementById("tg-tray");
  tray.innerHTML = "";
  TangramCore.PIECES.forEach((piece) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const laid = AppStateTg.placed.some((p) => p.piece === piece);
    btn.className = "secondary pt-piece" + (AppStateTg.selected === piece ? " pt-piece-selected" : "") + (laid ? " pt-piece-laid" : "");
    btn.innerHTML = pieceSvgTg(piece, 0, false, "tgt" + piece, 24, "");
    btn.setAttribute("aria-label", pieceNameTg(piece) + (laid ? ", " + tTg("tg_laid") : ""));
    btn.disabled = AppStateTg.gameOver;
    btn.addEventListener("click", () => selectTg(piece));
    tray.appendChild(btn);
  });
}

function renderCurrentTg() {
  const box = document.getElementById("tg-current");
  const piece = AppStateTg.selected;
  document.getElementById("tg-turn").disabled = !piece || AppStateTg.gameOver;
  document.getElementById("tg-flip").disabled = !piece || AppStateTg.gameOver;
  if (!piece) { box.innerHTML = ""; box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  box.innerHTML = pieceSvgTg(piece, AppStateTg.k, AppStateTg.flip, "tgc", 24, pieceNameTg(piece));
}

document.addEventListener("DOMContentLoaded", initTgApp);
