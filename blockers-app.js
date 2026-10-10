// blockers-app.js
// Wires BlockersCore/BlockersAi ("Path Blockers" / Sperrsteine) to
// blockers.html.
//
// 2 to 4 players on one device, any of them played by the computer
// (levels Easy, Medium, Hard). On your turn: tap Roll, tap one of your
// tokens that can move (they get a dashed ring; tokens still in the house
// are chosen with the house button under the board), then tap one of the
// marked fields. Landing on a stone lets you put it on any free field:
// tap one. Computer turns follow one after another with a pause
// (AiPacing). Tokens differ by shape (circle, triangle, diamond, star);
// stones are black squares with a white bar.

const BLOCKERS_SAVE_KEY = "einkchess_save_blockers";
const BL_SHAPES = ["circle", "triangle", "diamond", "star"];

const AppStateBL = {
  numPlayers: 2,
  computers: 1,
  level: 2,
  state: null,
  started: false,
  gameOver: false,
  busy: false,
  selected: -1,      // token index chosen by the human
  moves: []          // legal moves for the current roll
};

/*** Players ***/

function isComputerBL(p) {
  return p >= AppStateBL.numPlayers - AppStateBL.computers;
}

function humansBL() {
  return AppStateBL.numPlayers - AppStateBL.computers;
}

function nameBL(p) {
  if (isComputerBL(p)) return "Computer " + (p - humansBL() + 1);
  return humansBL() === 1 ? "You" : "Player " + (p + 1);
}

function shapeMarkupBL(shape, x, y, r) {
  const stroke = ' stroke="#fff" stroke-width="' + (r * 0.3).toFixed(2) + '" stroke-linejoin="round"';
  const f = (v) => v.toFixed(2);
  if (shape === "circle") return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#141413"' + stroke + "/>";
  if (shape === "triangle") return '<polygon points="' + f(x) + "," + f(y - r * 1.1) + " " + f(x + r * 1.1) + "," + f(y + r * 0.85) + " " + f(x - r * 1.1) + "," + f(y + r * 0.85) + '" fill="#141413"' + stroke + "/>";
  if (shape === "diamond") return '<polygon points="' + f(x) + "," + f(y - r * 1.15) + " " + f(x + r * 1.0) + "," + f(y) + " " + f(x) + "," + f(y + r * 1.15) + " " + f(x - r * 1.0) + "," + f(y) + '" fill="#141413"' + stroke + "/>";
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.5 : r * 1.2;
    pts.push(f(x + rr * Math.cos(a)) + "," + f(y + rr * Math.sin(a)));
  }
  return '<polygon points="' + pts.join(" ") + '" fill="#141413"' + stroke + "/>";
}

function shapeSvgBL(p) {
  return '<svg class="bl-shape" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + shapeMarkupBL(BL_SHAPES[p], 20, 21, 14) + "</svg>";
}

/*** Status and save ***/

function setStatusBL(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultBL(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveBL() {
  if (typeof GameStorage === "undefined" || !AppStateBL.state) return;
  GameStorage.save(BLOCKERS_SAVE_KEY, { numPlayers: AppStateBL.numPlayers, computers: AppStateBL.computers, level: AppStateBL.level, state: AppStateBL.state });
}

function clearSaveBL() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(BLOCKERS_SAVE_KEY);
}

/*** Setup ***/

function initBlockersApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  const players = document.getElementById("bl-num-players");
  const computers = document.getElementById("bl-computers");
  function limitComputers() {
    const n = parseInt(players.value, 10);
    Array.from(computers.options).forEach((o) => { o.disabled = parseInt(o.value, 10) > n - 1; });
    if (parseInt(computers.value, 10) > n - 1) computers.value = String(n - 1);
  }
  players.addEventListener("change", limitComputers);
  limitComputers();
  document.getElementById("start-bl-game").addEventListener("click", () => {
    startGameBL(parseInt(players.value, 10), parseInt(computers.value, 10), parseInt(document.getElementById("bl-level").value, 10));
  });
  document.getElementById("bl-roll").addEventListener("click", humanRollBL);
  window.addEventListener("resize", () => { if (AppStateBL.state) renderBoardBL(); });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateBL.state) renderBL(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(BLOCKERS_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver && Array.isArray(saved.state.tokens)) {
    Object.assign(AppStateBL, { numPlayers: saved.numPlayers, computers: saved.computers, level: saved.level || 2, state: saved.state });
    AppStateBL.started = true;
    AppStateBL.gameOver = false;
    AppStateBL.moves = AppStateBL.state.phase === "move" ? BlockersCore.legalMoves(AppStateBL.state) : [];
    showBoardBL();
    promptBL();
    continueBL();
  }
}

function showBoardBL() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameBL(numPlayers, computers, level) {
  const n = Math.max(2, Math.min(4, numPlayers || 2));
  AppStateBL.numPlayers = n;
  AppStateBL.computers = Math.max(0, Math.min(n - 1, computers || 0));
  AppStateBL.level = level >= 1 && level <= 3 ? level : 2;
  AppStateBL.state = BlockersCore.createInitialState(n);
  AppStateBL.started = true;
  AppStateBL.gameOver = false;
  AppStateBL.busy = false;
  AppStateBL.selected = -1;
  AppStateBL.moves = [];
  setResultBL("");
  showBoardBL();
  promptBL();
  saveBL();
  continueBL();
}

/*** Turns ***/

function promptBL(prefix) {
  const s = AppStateBL.state;
  const pre = prefix ? prefix + " " : "";
  const who = nameBL(s.turn), you = who === "You";
  let text;
  if (isComputerBL(s.turn)) text = prefix && s.phase !== "roll" ? "" : who + "'s turn.";
  else if (s.phase === "roll") text = you ? "Your turn: tap Roll." : who + "'s turn: tap Roll.";
  else if (s.phase === "stone") text = "Tap a free field to put the stone on (not in the bottom row).";
  else if (AppStateBL.selected >= 0) text = "Now tap one of the marked fields.";
  else text = "Tap a token with a dashed ring (or the house button) to move it " + s.roll + " fields.";
  setStatusBL((pre + text).trim());
  renderBL();
}

function continueBL() {
  const s = AppStateBL.state;
  if (!s || AppStateBL.gameOver || s.gameOver || !isComputerBL(s.turn) || AppStateBL.busy) return;
  AppStateBL.busy = true;
  setTimeout(aiStepBL, AiPacing.delay(s.phase === "roll" ? 700 : 900));
}

function aiStepBL() {
  AppStateBL.busy = false;
  const s = AppStateBL.state;
  if (!s || AppStateBL.gameOver || s.gameOver || !isComputerBL(s.turn)) return;
  if (s.phase === "roll") { rollBL(); return; }
  if (s.phase === "move") {
    const m = BlockersAi.chooseMove(s, AppStateBL.level);
    if (m) doMoveBL(m);
    return;
  }
  if (s.phase === "stone") {
    const f = BlockersAi.chooseStone(s, AppStateBL.level);
    doStoneBL(f);
  }
}

function humanRollBL() {
  const s = AppStateBL.state;
  if (!s || AppStateBL.gameOver || s.gameOver) return;
  if (isComputerBL(s.turn)) { setStatusBL("Computer thinking…"); return; }
  if (s.phase !== "roll") return;
  rollBL();
}

function rollBL() {
  const s = AppStateBL.state;
  AppStateBL.state = BlockersCore.setRoll(s, BlockersCore.rollDie());
  const st = AppStateBL.state;
  const who = nameBL(st.turn), you = who === "You";
  AppStateBL.moves = BlockersCore.legalMoves(st);
  AppStateBL.selected = -1;
  const rolled = (you ? "You rolled " : who + " rolled ") + st.roll + ".";
  if (!AppStateBL.moves.length) {
    AppStateBL.state = BlockersCore.pass(st);
    AppStateBL.moves = [];
    saveBL();
    promptBL(rolled + " No move is possible with " + st.roll + ".");
    continueBL();
    return;
  }
  saveBL();
  promptBL(isComputerBL(st.turn) ? rolled : rolled);
  continueBL();
}

function doMoveBL(move) {
  const before = AppStateBL.state;
  const p = before.turn, who = nameBL(p), you = who === "You";
  const fromHouse = before.tokens[p][move.token] === -1;
  const r = BlockersCore.applyMove(before, move);
  AppStateBL.state = r.state;
  AppStateBL.selected = -1;
  AppStateBL.moves = [];
  const parts = [];
  parts.push(you ? (fromHouse ? "You bring a token onto the board." : "You move a token.") : (fromHouse ? who + " brings a token onto the board." : who + " moves a token."));
  if (r.captured) {
    const victim = nameBL(r.captured.player);
    if (victim === "You") parts.push(who + " sends one of your tokens back to the house!");
    else parts.push((you ? "You send a token of " : who + " sends a token of ") + victim + " back to the house!");
  }
  if (r.state.gameOver) { endGameBL(parts.join(" ")); return; }
  if (r.stone) parts.push(you ? "You take a stone." : who + " takes a stone and puts it on another field.");
  saveBL();
  promptBL(parts.join(" "));
  continueBL();
}

function doStoneBL(field) {
  const s = BlockersCore.placeStone(AppStateBL.state, field);
  if (!s) return;
  AppStateBL.state = s;
  saveBL();
  promptBL();
  continueBL();
}

function endGameBL(prefix) {
  const s = AppStateBL.state;
  AppStateBL.gameOver = true;
  const who = nameBL(s.winner);
  const end = who === "You" ? "You reach the goal and win!" : who + " reaches the goal and wins!";
  setResultBL(end);
  setStatusBL(prefix + " " + end);
  if (humansBL() === 1 && typeof GameStats !== "undefined") GameStats.record("blockers", s.winner === 0 ? "win" : "loss");
  if (window.ResultModal) window.ResultModal.show(who === "You" ? "You win!" : (humansBL() === 1 ? "You lose" : who + " wins"), end);
  clearSaveBL();
  renderBL();
}

/*** Human input on the board ***/

function humanCanActBL() {
  const s = AppStateBL.state;
  return s && !AppStateBL.gameOver && !s.gameOver && !isComputerBL(s.turn);
}

function movableTokensBL() {
  return new Set(AppStateBL.moves.map((m) => m.token));
}

function chooseTokenBL(token) {
  const s = AppStateBL.state;
  if (!humanCanActBL() || s.phase !== "move") return;
  // A token in the house stands for every token in the house.
  const k = s.tokens[s.turn][token] === -1 ? (AppStateBL.moves.find((m) => s.tokens[s.turn][m.token] === -1) || {}).token : token;
  if (k === undefined || !movableTokensBL().has(k)) {
    setStatusBL("This token cannot move " + s.roll + " fields.");
    return;
  }
  AppStateBL.selected = AppStateBL.selected === k ? -1 : k;
  promptBL();
}

function onFieldBL(field) {
  const s = AppStateBL.state;
  if (!humanCanActBL()) return;
  if (s.phase === "stone") {
    if (BlockersCore.stoneTargets(s).indexOf(field) === -1) { setStatusBL("The stone can only go on a free field, not in the bottom row."); return; }
    doStoneBL(field);
    return;
  }
  if (s.phase !== "move") {
    if (s.phase === "roll") setStatusBL(nameBL(s.turn) === "You" ? "Your turn: tap Roll." : nameBL(s.turn) + "'s turn: tap Roll.");
    return;
  }
  if (AppStateBL.selected >= 0) {
    const m = AppStateBL.moves.find((mv) => mv.token === AppStateBL.selected && mv.to === field);
    if (m) { doMoveBL(m); return; }
  }
  const o = BlockersCore.ownerAt(s, field);
  if (o && o.player === s.turn) { chooseTokenBL(o.token); return; }
  setStatusBL(AppStateBL.selected >= 0 ? "Now tap one of the marked fields." : "Tap a token with a dashed ring (or the house button) to move it " + s.roll + " fields.");
}

function onHouseBL(p) {
  const s = AppStateBL.state;
  if (!humanCanActBL() || p !== s.turn) return;
  const k = s.tokens[p].indexOf(-1);
  if (k === -1) return;
  chooseTokenBL(k);
}

/*** Rendering ***/

const BL_PIPS = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };

function renderBL() {
  const s = AppStateBL.state;
  if (!s) return;
  const over = AppStateBL.gameOver || s.gameOver;
  const playersEl = document.getElementById("bl-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < s.numPlayers; p++) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "game-player bl-house" + (p === s.turn && !over ? " game-player-active" : "");
    const inHouse = s.tokens[p].filter((t) => t === -1).length;
    const canPick = !over && p === s.turn && s.phase === "move" && !isComputerBL(p) && inHouse > 0 && AppStateBL.moves.some((m) => s.tokens[p][m.token] === -1);
    if (canPick) row.classList.add("bl-house-pick");
    if (AppStateBL.selected >= 0 && p === s.turn && s.tokens[p][AppStateBL.selected] === -1) row.classList.add("bl-house-selected");
    row.insertAdjacentHTML("beforeend", shapeSvgBL(p));
    const name = document.createElement("span");
    name.className = "game-player-name";
    I18n.setMsg(name, nameBL(p));
    row.appendChild(name);
    row.appendChild(document.createTextNode(":"));
    const extra = document.createElement("span");
    extra.className = "pc-player-extra";
    I18n.setMsg(extra, "House: " + inHouse);
    row.appendChild(extra);
    I18n.setAria(row, nameBL(p) + ", " + BL_SHAPES[p] + ", " + "House: " + inHouse + (canPick ? ", can move" : ""));
    row.disabled = !canPick;
    row.addEventListener("click", () => onHouseBL(p));
    playersEl.appendChild(row);
  }
  const dieEl = document.getElementById("bl-die");
  dieEl.innerHTML = s.roll ? '<svg class="bl-die" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="5" y="5" width="90" height="90" rx="14" fill="#fff" stroke="#141413" stroke-width="6"/>' +
    BL_PIPS[s.roll].map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="9" fill="#141413"/>').join("") + "</svg>" : "";
  if (s.roll) I18n.setAria(dieEl, "Rolled " + s.roll); else dieEl.removeAttribute("aria-label");
  const rollBtn = document.getElementById("bl-roll");
  rollBtn.classList.toggle("hidden", over);
  rollBtn.disabled = over || isComputerBL(s.turn) || s.phase !== "roll";
  renderBoardBL();
}

function renderBoardBL() {
  const s = AppStateBL.state;
  const C = BlockersCore;
  const wrap = document.getElementById("bl-board-wrap");
  const boardEl = document.getElementById("bl-board");
  const width = Math.min((wrap.clientWidth || 324) - 4, 560);
  const u = Math.floor(width / C.COLS);
  boardEl.style.width = u * C.COLS + "px";
  boardEl.style.height = u * C.ROWS + "px";
  const xy = (f) => [(f % C.COLS) * u + u / 2, Math.floor(f / C.COLS) * u + u / 2];
  const fx = (v) => Math.round(v * 10) / 10;
  const human = humanCanActBL();
  const targets = new Set();
  if (human && s.phase === "move" && AppStateBL.selected >= 0) AppStateBL.moves.filter((m) => m.token === AppStateBL.selected).forEach((m) => targets.add(m.to));
  const stoneSpots = new Set(human && s.phase === "stone" ? C.stoneTargets(s) : []);
  const movable = human && s.phase === "move" ? movableTokensBL() : new Set();
  let out = "";
  // Paths between fields.
  C.fields.forEach((f) => C.neighbours[f].forEach((n) => {
    if (n < f) return;
    const [x1, y1] = xy(f), [x2, y2] = xy(n);
    out += '<line x1="' + fx(x1) + '" y1="' + fx(y1) + '" x2="' + fx(x2) + '" y2="' + fx(y2) + '" stroke="#141413" stroke-width="' + fx(Math.max(2, u * 0.08)) + '"/>';
  }));
  // Entry fields of the houses: a thick ring.
  const entries = new Set();
  for (let p = 0; p < s.numPlayers; p++) entries.add(C.entryOf(s, p));
  C.fields.forEach((f) => {
    const [x, y] = xy(f);
    if (f === C.goal) {
      out += '<circle cx="' + fx(x) + '" cy="' + fx(y) + '" r="' + fx(u * 0.42) + '" fill="#fff" stroke="#141413" stroke-width="' + fx(u * 0.1) + '"/>' +
        '<circle cx="' + fx(x) + '" cy="' + fx(y) + '" r="' + fx(u * 0.22) + '" fill="#fff" stroke="#141413" stroke-width="' + fx(u * 0.07) + '"/>';
    } else {
      out += '<circle cx="' + fx(x) + '" cy="' + fx(y) + '" r="' + fx(u * 0.33) + '" fill="#fff" stroke="#141413" stroke-width="' + fx(entries.has(f) ? u * 0.11 : u * 0.05) + '"/>';
    }
  });
  // Stones: black squares with a white bar.
  s.stones.forEach((f) => {
    const [x, y] = xy(f), h = u * 0.34;
    out += '<rect x="' + fx(x - h) + '" y="' + fx(y - h) + '" width="' + fx(2 * h) + '" height="' + fx(2 * h) + '" rx="' + fx(u * 0.06) + '" fill="#141413"/>' +
      '<rect x="' + fx(x - h * 0.7) + '" y="' + fx(y - h * 0.18) + '" width="' + fx(1.4 * h) + '" height="' + fx(0.36 * h) + '" fill="#fff"/>';
  });
  // Tokens.
  for (let p = 0; p < s.numPlayers; p++) {
    s.tokens[p].forEach((f, k) => {
      if (f < 0) return;
      const [x, y] = xy(f);
      out += shapeMarkupBL(BL_SHAPES[p], x, y, u * 0.26);
      if (p === s.turn && movable.has(k)) {
        out += '<circle cx="' + fx(x) + '" cy="' + fx(y) + '" r="' + fx(u * 0.46) + '" fill="none" stroke="#141413" stroke-width="' + fx(Math.max(1.5, u * 0.05)) + '" stroke-dasharray="' + fx(u * 0.12) + " " + fx(u * 0.08) + '"/>';
      }
      if (p === s.turn && AppStateBL.selected === k) {
        out += '<circle cx="' + fx(x) + '" cy="' + fx(y) + '" r="' + fx(u * 0.47) + '" fill="none" stroke="#141413" stroke-width="' + fx(Math.max(2.5, u * 0.09)) + '"/>';
      }
    });
  }
  // Fields you can move to (or put the stone on): a dashed square.
  targets.forEach((f) => {
    const [x, y] = xy(f), h = u * 0.47;
    out += '<rect x="' + fx(x - h) + '" y="' + fx(y - h) + '" width="' + fx(2 * h) + '" height="' + fx(2 * h) + '" fill="none" stroke="#141413" stroke-width="' + fx(Math.max(2, u * 0.08)) + '" stroke-dasharray="' + fx(u * 0.14) + " " + fx(u * 0.08) + '"/>';
  });
  stoneSpots.forEach((f) => {
    const [x, y] = xy(f), h = u * 0.44;
    out += '<rect x="' + fx(x - h) + '" y="' + fx(y - h) + '" width="' + fx(2 * h) + '" height="' + fx(2 * h) + '" fill="none" stroke="#141413" stroke-width="' + fx(Math.max(1.2, u * 0.04)) + '" stroke-dasharray="' + fx(u * 0.06) + " " + fx(u * 0.08) + '"/>';
  });
  let html = '<svg class="bl-board-svg" viewBox="0 0 ' + u * C.COLS + " " + u * C.ROWS + '" width="' + u * C.COLS + '" height="' + u * C.ROWS + '" aria-hidden="true" focusable="false">' + out + "</svg>";
  boardEl.innerHTML = html;
  // A button over every field, for tapping and for screen readers.
  C.fields.forEach((f) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bl-field";
    btn.style.left = (f % C.COLS) * u + "px";
    btn.style.top = Math.floor(f / C.COLS) * u + "px";
    btn.style.width = u + "px";
    btn.style.height = u + "px";
    const parts = ["Row " + (Math.floor(f / C.COLS) + 1) + ", column " + ((f % C.COLS) + 1)];
    if (f === C.goal) parts.push("goal");
    if (s.stones.indexOf(f) !== -1) parts.push("stone");
    const o = C.ownerAt(s, f);
    if (o) parts.push(nameBL(o.player) === "You" ? "your token" : "token of " + nameBL(o.player));
    if (entries.has(f)) parts.push("house entry");
    if (targets.has(f) || stoneSpots.has(f)) parts.push("possible");
    I18n.setAria(btn, parts.join(", "));
    btn.addEventListener("click", () => onFieldBL(f));
    boardEl.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", initBlockersApp);
