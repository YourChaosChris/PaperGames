// snakesladders-app.js
// Wires SnakesLaddersCore ("Snakes and Ladders" / Leiterspiel) to
// snakesladders.html.
//
// 2 to 4 players on one device, any of them played by the computer.
// Tap "Roll": the die is shown large, the token moves by itself, and a
// ladder or snake is taken at once and named in the status line - no
// animation. Tokens differ by shape (circle, square, triangle, star);
// ladders are two rails with rungs, snakes a thick wavy band with a head,
// all black on white.
//
// Before the game every person chooses a token (the computers get the
// others) and who starts: me, a computer or random (the default). Computer
// turns one at a time: with "Computer moves: Continue after a tap" (the
// default, remembered on the device) each computer roll waits for the
// Continue button; with "Automatically" it comes after a calm pause
// (about 1.5 seconds, AiPacing). The die shows the roll large next to the
// roller's token, the status line names ladder or snake, and a short list
// shows the last moves (who, rolled, from, to).

const SNAKESLADDERS_SAVE_KEY = "einkchess_save_snakesladders";
const SL_SHAPES = ["circle", "square", "triangle", "star"];
const SL_SHAPE_EN = { circle: "circle", square: "square", triangle: "triangle", star: "star" };
const SL_SHAPE_NAME = { circle: "Circle", square: "Square", triangle: "Triangle", star: "Star" };
const SL_PACE_KEY = "papergames_snakesladders_pace";
const SL_LOG_MAX = 6;

const AppStateSL = {
  board: "big",
  finish: "spare",
  numPlayers: 2,
  computers: 1,
  state: null,
  started: false,
  gameOver: false,
  busy: false,
  log: []          // last moves, newest first: { player, roll, from, end, via, blocked }
};

function loadPaceSL() {
  try { return window.localStorage.getItem(SL_PACE_KEY) === "auto" ? "auto" : "tap"; } catch (e) { return "tap"; }
}

function savePaceSL(pace) {
  try { window.localStorage.setItem(SL_PACE_KEY, pace === "auto" ? "auto" : "tap"); } catch (e) { /* the choice just isn't remembered */ }
}

// Player p's token shape; games saved before tokens could be chosen have
// player p on shape p.
function shapeOfSL(p) {
  const s = AppStateSL.state;
  return s && Array.isArray(s.shapes) ? s.shapes[p] : p;
}

/*** Players ***/

// Computers take the last seats. With one person playing they are "You";
// otherwise "Player 1", "Player 2" ... and "Computer 1", "Computer 2" ...
function isComputerSL(p) {
  return p >= AppStateSL.numPlayers - AppStateSL.computers;
}

function humansSL() {
  return AppStateSL.numPlayers - AppStateSL.computers;
}

function nameSL(p) {
  if (isComputerSL(p)) return "Computer " + (p - humansSL() + 1);
  return humansSL() === 1 ? "You" : "Player " + (p + 1);
}

function shapeMarkupSL(shape, x, y, r) {
  const stroke = ' stroke="#fff" stroke-width="' + (r * 0.28).toFixed(2) + '" stroke-linejoin="round"';
  if (shape === "circle") return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#141413"' + stroke + "/>";
  if (shape === "square") return '<rect x="' + (x - r * 0.88) + '" y="' + (y - r * 0.88) + '" width="' + r * 1.76 + '" height="' + r * 1.76 + '" fill="#141413"' + stroke + "/>";
  if (shape === "triangle") return '<polygon points="' + x + "," + (y - r * 1.05) + " " + (x + r * 1.05) + "," + (y + r * 0.85) + " " + (x - r * 1.05) + "," + (y + r * 0.85) + '" fill="#141413"' + stroke + "/>";
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r * 1.12;
    pts.push((x + rr * Math.cos(a)).toFixed(2) + "," + (y + rr * Math.sin(a)).toFixed(2));
  }
  return '<polygon points="' + pts.join(" ") + '" fill="#141413"' + stroke + "/>";
}

function shapeSvgSL(p, cls) {
  return shapeSvgOfSL(shapeOfSL(p), cls);
}

function shapeSvgOfSL(k, cls) {
  return '<svg class="' + (cls || "sl-shape") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + shapeMarkupSL(SL_SHAPES[k], 20, 20, 15) + "</svg>";
}

/*** Status and save ***/

function setStatusSL(text) {
  if (AppStateSL.computers > 0 && text) {
    const uiStatusText = String(text);
    const uiStatusKeep = /(n't|\bnot\b|cannot|\billegal\b|\binvalid\b|\bfirst\b|\bmust\b|\bneed|\bempty\b|\bchoose\b|\btap\b|\bselect\b|\bpick\b|\balready\b|\bno tile\b|\bno card\b|\bno move\b|\bplay the card\b|\bplay a\b|\bdraw\b.*\bstock\b)/i.test(uiStatusText) && !/\b(wins?|won|winner)\b/i.test(uiStatusText);
    const uiStatusState = AppStateSL.state || AppStateSL;
    const uiStatusGameOver = AppStateSL.gameOver === true || AppStateSL.over === true || uiStatusState.gameOver === true || uiStatusState.over === true;
    const uiStatusTurn = (AppStateSL.state || {}).turn;
    const uiStatusHuman = AppStateSL.numPlayers - AppStateSL.computers;
    let uiStatusKey = null;
    if (uiStatusGameOver && !/\b(draw|drawn|tie|remis|stalemate)\b/i.test(uiStatusText) && /\b(win|wins|won|winner|lose|loses)\b/i.test(uiStatusText)) {
      if (/\b(you win|you won|you have won)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_you_win";
      else if (/\b(you lose|you lost|computer.{0,30}wins?)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_computer_wins";
      else if (uiStatusState.winner !== undefined) uiStatusKey = Number(uiStatusState.winner) < Number(AppStateSL.numPlayers - AppStateSL.computers) ? "ui_status_you_win" : "ui_status_computer_wins";
    }
    if (!uiStatusKey && /(?:^|[.!?]\s+)(?:the\s+)?computer(?:\s+\d+)?(?:\x27s)?\s+(?:turn|thinking|to move|is thinking|is playing|plays|acts|rolling)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_computer_turn";
    if (!uiStatusKey && /\b(turn|to move|move a stone|place a stone|draw a card|roll|throw)\b/i.test(uiStatusText) && uiStatusHuman !== undefined && uiStatusTurn !== undefined) uiStatusKey = !isComputerSL(uiStatusTurn) ? "ui_status_your_turn" : "ui_status_computer_turn";
    if (!uiStatusKey && /\b(your turn|you are next|you to move)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_your_turn";
    if (!uiStatusKey && !/\b(draw|drawn|tie|remis|stalemate|win|wins|won|winner|lose|loses)\b/i.test(uiStatusText)) {
      if (uiStatusHuman !== undefined && uiStatusTurn !== undefined) uiStatusKey = !isComputerSL(uiStatusTurn) ? "ui_status_your_turn" : "ui_status_computer_turn";
      else if (/(?:^|[.!?]\s+)(?:the\s+)?computer(?:\s+\d+)?(?:\x27s)?\s+(?:turn|thinking|to move|is thinking|is playing|plays|acts|rolling)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_computer_turn";
      else uiStatusKey = "ui_status_your_turn";
    }
    if (uiStatusKey && !uiStatusKeep) {
      const uiStatusExtra = uiStatusText.replace(/^.*?(?:\.|…|!)(?:\s+|$)/, "").trim();
      text = I18n.t(uiStatusKey) + (uiStatusExtra ? " " + uiStatusExtra : "");
    }
  }
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultSL(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveSL() {
  if (typeof GameStorage === "undefined" || !AppStateSL.state) return;
  GameStorage.save(SNAKESLADDERS_SAVE_KEY, {
    board: AppStateSL.board, finish: AppStateSL.finish, numPlayers: AppStateSL.numPlayers,
    computers: AppStateSL.computers, state: AppStateSL.state, log: AppStateSL.log
  });
}

function clearSaveSL() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(SNAKESLADDERS_SAVE_KEY);
}

/*** Setup ***/

function initSnakesLaddersApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  const players = document.getElementById("sl-num-players");
  const computers = document.getElementById("sl-computers");
  function limitComputers() {
    const n = parseInt(players.value, 10);
    Array.from(computers.options).forEach((o) => { o.disabled = parseInt(o.value, 10) > n - 1; });
    if (parseInt(computers.value, 10) > n - 1) computers.value = String(n - 1);
  }
  const firstSel = document.getElementById("sl-first");
  const paceSel = document.getElementById("sl-pace");
  players.addEventListener("change", () => { limitComputers(); buildTokenChoicesSL(); });
  computers.addEventListener("change", buildTokenChoicesSL);
  limitComputers();
  buildTokenChoicesSL();
  paceSel.value = loadPaceSL();
  paceSel.addEventListener("change", () => {
    savePaceSL(paceSel.value);
    // Switched to automatic while a computer waits for Continue: go on.
    if (paceSel.value === "auto" && AppStateSL.state) { renderSL(); continueSL(); }
  });
  document.getElementById("start-sl-game").addEventListener("click", () => {
    const choices = Array.from(document.querySelectorAll("#sl-token-choices select")).map((sel) => parseInt(sel.value, 10));
    startGameSL(document.getElementById("sl-board-choice").value, document.getElementById("sl-finish").value,
      parseInt(players.value, 10), parseInt(computers.value, 10), choices, firstSel.value);
  });
  document.getElementById("sl-roll").addEventListener("click", humanRollSL);
  document.getElementById("sl-next").addEventListener("click", nextComputerSL);
  window.addEventListener("resize", () => { if (AppStateSL.state) renderBoardSL(); });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateSL.state) renderSL(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SNAKESLADDERS_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver && SnakesLaddersCore.BOARDS[saved.board]) {
    Object.assign(AppStateSL, { board: saved.board, finish: saved.finish, numPlayers: saved.numPlayers, computers: saved.computers, state: saved.state, log: Array.isArray(saved.log) ? saved.log : [] });
    AppStateSL.started = true;
    AppStateSL.gameOver = false;
    showBoardSL();
    promptSL();
    continueSL();
  }
}

function showBoardSL() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

// One token choice per person: "Your token" with one person, "Token of
// player N" with several. Two people can't pick the same token: choosing
// one that is taken swaps it with the other person's.
function buildTokenChoicesSL() {
  const wrap = document.getElementById("sl-token-choices");
  const n = parseInt(document.getElementById("sl-num-players").value, 10);
  const humans = n - parseInt(document.getElementById("sl-computers").value, 10);
  const before = Array.from(wrap.querySelectorAll("select")).map((sel) => parseInt(sel.value, 10));
  const values = SnakesLaddersCore.assignShapes(n, before.slice(0, humans)).slice(0, humans);
  wrap.innerHTML = "";
  values.forEach((v, h) => {
    const id = "sl-token-" + h;
    const row = document.createElement("span");
    row.className = "sl-token-choice";
    const label = document.createElement("label");
    label.setAttribute("for", id);
    I18n.setMsg(label, humans === 1 ? "Your token:" : "Token of player " + (h + 1) + ":");
    const sel = document.createElement("select");
    sel.id = id;
    SL_SHAPES.forEach((shape, k) => {
      const o = document.createElement("option");
      o.value = String(k);
      I18n.setMsg(o, SL_SHAPE_NAME[shape]);
      sel.appendChild(o);
    });
    sel.value = String(v);
    sel.dataset.prev = String(v);
    sel.addEventListener("change", () => {
      const others = Array.from(wrap.querySelectorAll("select")).filter((x) => x !== sel && x.value === sel.value);
      others.forEach((x) => { x.value = sel.dataset.prev; x.dataset.prev = sel.dataset.prev; });
      sel.dataset.prev = sel.value;
      renderTokenPreviewSL();
    });
    row.appendChild(label);
    row.appendChild(sel);
    const pic = document.createElement("span");
    pic.className = "sl-token-pic";
    row.appendChild(pic);
    wrap.appendChild(row);
  });
  renderTokenPreviewSL();
  // "Computer starts" needs a computer.
  const firstSel = document.getElementById("sl-first");
  const compOpt = firstSel.querySelector('option[value="computer"]');
  compOpt.disabled = humans >= n;
  if (compOpt.disabled && firstSel.value === "computer") firstSel.value = "random";
}

function renderTokenPreviewSL() {
  document.querySelectorAll("#sl-token-choices .sl-token-choice").forEach((row) => {
    row.querySelector(".sl-token-pic").innerHTML = shapeSvgOfSL(parseInt(row.querySelector("select").value, 10), "sl-shape sl-shape-inline");
  });
}

function startGameSL(board, finish, numPlayers, computers, tokenChoices, firstChoice) {
  const n = Math.max(2, Math.min(4, numPlayers || 2));
  AppStateSL.board = SnakesLaddersCore.BOARDS[board] ? board : "big";
  AppStateSL.finish = finish === "exact" ? "exact" : "spare";
  AppStateSL.numPlayers = n;
  AppStateSL.computers = Math.max(0, Math.min(n - 1, computers || 0));
  const humans = n - AppStateSL.computers;
  const shapes = SnakesLaddersCore.assignShapes(n, (tokenChoices || []).slice(0, humans));
  const first = SnakesLaddersCore.firstPlayer(firstChoice || "random", n, AppStateSL.computers ? humans : n);
  AppStateSL.state = SnakesLaddersCore.createInitialState(AppStateSL.board, n, AppStateSL.finish, { shapes, first });
  AppStateSL.log = [];
  AppStateSL.started = true;
  AppStateSL.gameOver = false;
  AppStateSL.busy = false;
  setResultSL("");
  showBoardSL();
  promptSL();
  saveSL();
  continueSL();
}

/*** Turns ***/

function promptSL(prefix) {
  const s = AppStateSL.state;
  const pre = prefix ? prefix + " " : "";
  const who = nameSL(s.turn);
  if (isComputerSL(s.turn) && loadPaceSL() === "tap") setStatusSL(pre + who + "'s turn: tap Continue.");
  else if (isComputerSL(s.turn)) setStatusSL(pre + who + "'s turn.");
  else setStatusSL(pre + (who === "You" ? "Your turn: tap Roll." : who + "'s turn: tap Roll."));
  renderSL();
}

// A computer's turn: waits for Continue ("tap"), or rolls after a calm
// pause ("auto").
function continueSL() {
  const s = AppStateSL.state;
  if (!s || AppStateSL.gameOver || s.gameOver || !isComputerSL(s.turn) || AppStateSL.busy) return;
  if (loadPaceSL() === "tap") return;
  AppStateSL.busy = true;
  setTimeout(() => {
    AppStateSL.busy = false;
    const st = AppStateSL.state;
    if (!st || AppStateSL.gameOver || st.gameOver || !isComputerSL(st.turn)) return;
    doRollSL();
  }, AiPacing.delay(600));
}

function nextComputerSL() {
  const s = AppStateSL.state;
  if (!s || AppStateSL.gameOver || s.gameOver || !isComputerSL(s.turn) || AppStateSL.busy) return;
  doRollSL();
}

function humanRollSL() {
  const s = AppStateSL.state;
  if (!s || AppStateSL.gameOver || s.gameOver) return;
  if (isComputerSL(s.turn)) {
    setStatusSL("Computer thinking…");
    return;
  }
  doRollSL();
}

function describeSL(last) {
  const b = SnakesLaddersCore.BOARDS[AppStateSL.board];
  const who = nameSL(last.player);
  const you = who === "You";
  const parts = [(you ? "You rolled " : who + " rolled ") + last.roll + "."];
  if (last.blocked) {
    parts.push((you ? "Too far - you need exactly " : "Too far - " + who + " needs exactly ") + (b.size - last.from) + " to finish.");
  } else {
    parts.push((you ? "You move to field " : who + " moves to field ") + last.to + ".");
    if (last.via === "ladder") parts.push("Ladder: up to field " + last.end + "!");
    if (last.via === "snake") parts.push("Snake: down to field " + last.end + ".");
  }
  return parts.join(" ");
}

function doRollSL() {
  const roll = SnakesLaddersCore.rollDie();
  AppStateSL.state = SnakesLaddersCore.move(AppStateSL.state, roll);
  const s = AppStateSL.state;
  const l = s.last;
  AppStateSL.log = [{ player: l.player, roll: l.roll, from: l.from, end: l.end, via: l.via, blocked: l.blocked }].concat(AppStateSL.log).slice(0, SL_LOG_MAX);
  const msg = describeSL(s.last);
  if (s.gameOver) { endGameSL(msg); return; }
  saveSL();
  promptSL(msg);
  continueSL();
}

function endGameSL(prefix) {
  const s = AppStateSL.state;
  AppStateSL.gameOver = true;
  const b = SnakesLaddersCore.BOARDS[AppStateSL.board];
  const who = nameSL(s.winner);
  const end = who === "You" ? "You reach field " + b.size + " and win!" : who + " reaches field " + b.size + " and wins!";
  setResultSL(end);
  setStatusSL(prefix + " " + end);
  if (humansSL() === 1 && typeof GameStats !== "undefined") GameStats.record("snakesladders", s.winner === 0 ? "win" : "loss");
  if (window.ResultModal) window.ResultModal.show(who === "You" ? "You win!" : (humansSL() === 1 ? "You lose" : who + " wins"), end);
  clearSaveSL();
  renderSL();
}

/*** Rendering ***/

const SL_PIPS = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };

function dieSvgSL(n) {
  return '<svg class="sl-die" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="5" y="5" width="90" height="90" rx="14" fill="#fff" stroke="#141413" stroke-width="6"/>' +
    SL_PIPS[n].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#141413"/>').join("") + "</svg>";
}

function renderSL() {
  const s = AppStateSL.state;
  if (!s) return;
  const over = AppStateSL.gameOver || s.gameOver;
  // Players: shape, name, field.
  const playersEl = document.getElementById("sl-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < s.numPlayers; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !over ? " game-player-active" : "");
    row.insertAdjacentHTML("beforeend", shapeSvgSL(p, "sl-shape sl-shape-inline"));
    const name = document.createElement("span");
    name.className = "game-player-name";
    I18n.setMsg(name, nameSL(p));
    row.appendChild(name);
    const extra = document.createElement("span");
    extra.className = "pc-player-extra";
    I18n.setMsg(extra, s.pos[p] ? "Field " + s.pos[p] : "Start");
    row.appendChild(extra);
    I18n.setAria(row, nameSL(p) + ", " + SL_SHAPE_EN[SL_SHAPES[shapeOfSL(p)]] + ", " + (s.pos[p] ? "Field " + s.pos[p] : "Start"));
    row.setAttribute("role", "img");
    playersEl.appendChild(row);
  }
  // Die and button.
  const dieEl = document.getElementById("sl-die");
  dieEl.innerHTML = s.last ? shapeSvgSL(s.last.player, "sl-shape sl-die-who") + dieSvgSL(s.last.roll) : "";
  if (s.last) I18n.setAria(dieEl, nameSL(s.last.player) + ", " + "Rolled " + s.last.roll);
  const rollBtn = document.getElementById("sl-roll");
  const nextBtn = document.getElementById("sl-next");
  const computerWaits = !over && isComputerSL(s.turn) && loadPaceSL() === "tap";
  rollBtn.classList.toggle("hidden", over || computerWaits);
  rollBtn.disabled = over || isComputerSL(s.turn);
  nextBtn.classList.toggle("hidden", !computerWaits);
  renderLogSL();
  // Tokens still at the start.
  const startEl = document.getElementById("sl-start");
  startEl.innerHTML = "";
  for (let p = 0; p < s.numPlayers; p++) if (!s.pos[p]) startEl.insertAdjacentHTML("beforeend", shapeSvgSL(p, "sl-shape sl-shape-inline"));
  document.getElementById("sl-start-wrap").classList.toggle("hidden", !startEl.innerHTML);
  renderBoardSL();
}

// The last moves, newest first: token and name, roll, from, to (with
// ladder or snake).
function renderLogSL() {
  const wrap = document.getElementById("sl-log-wrap");
  const body = document.getElementById("sl-log-body");
  body.innerHTML = "";
  wrap.classList.toggle("hidden", !AppStateSL.log.length);
  AppStateSL.log.forEach((e) => {
    const tr = document.createElement("tr");
    const who = document.createElement("td");
    who.insertAdjacentHTML("beforeend", shapeSvgSL(e.player, "sl-shape sl-shape-inline"));
    const name = document.createElement("span");
    I18n.setMsg(name, nameSL(e.player));
    who.appendChild(name);
    const roll = document.createElement("td");
    roll.className = "sl-log-roll";
    roll.textContent = String(e.roll);
    const from = document.createElement("td");
    I18n.setMsg(from, e.from ? String(e.from) : "Start");
    const to = document.createElement("td");
    I18n.setMsg(to, e.blocked ? "Too far" : String(e.end) + (e.via === "ladder" ? " (Ladder)" : e.via === "snake" ? " (Snake)" : ""));
    [who, roll, from, to].forEach((td) => tr.appendChild(td));
    body.appendChild(tr);
  });
}

// The board: cells with their numbers, ladders and snakes and the tokens
// drawn in one SVG over the cells. Sized in pixels to the space.
function renderBoardSL() {
  const s = AppStateSL.state;
  const b = SnakesLaddersCore.BOARDS[AppStateSL.board];
  const cols = b.cols, rows = b.size / cols;
  const wrap = document.getElementById("sl-board-wrap");
  const boardEl = document.getElementById("sl-board");
  const width = Math.min(wrap.clientWidth || 320, 560);
  const u = Math.floor((width - 4) / cols);
  boardEl.style.width = (u * cols + 4) + "px";
  boardEl.style.height = (u * rows + 4) + "px";
  const C = (f) => { const c = SnakesLaddersCore.cellOf(AppStateSL.board, f); return [c.col * u + u / 2, c.row * u + u / 2]; };
  const fx = (v) => Math.round(v * 10) / 10;
  let out = "";
  // Cells: thin grid and the number top left.
  for (let f = 1; f <= b.size; f++) {
    const c = SnakesLaddersCore.cellOf(AppStateSL.board, f);
    out += '<rect x="' + c.col * u + '" y="' + c.row * u + '" width="' + u + '" height="' + u + '" fill="#fff" stroke="#141413" stroke-width="' + (f === b.size ? 3 : 0.8) + '"/>';
    out += '<text x="' + (c.col * u + 3) + '" y="' + (c.row * u + Math.max(10, u * 0.3)) + '" font-size="' + fx(Math.max(9.5, u * 0.27)) + '" fill="#141413">' + f + "</text>";
  }
  // Ladders: two rails and rungs.
  Object.entries(b.ladders).forEach(([from, to]) => {
    const [x1, y1] = C(+from), [x2, y2] = C(to);
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, w = u * 0.17;
    out += '<path d="M' + fx(x1 + nx * w) + " " + fx(y1 + ny * w) + "L" + fx(x2 + nx * w) + " " + fx(y2 + ny * w) +
      "M" + fx(x1 - nx * w) + " " + fx(y1 - ny * w) + "L" + fx(x2 - nx * w) + " " + fx(y2 - ny * w) + '" stroke="#141413" stroke-width="' + fx(u * 0.08) + '" fill="none" stroke-linecap="round"/>';
    const rungs = Math.max(2, Math.round(len / (u * 0.38)));
    let d = "";
    for (let k = 1; k < rungs; k++) {
      const t = k / rungs, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      d += "M" + fx(x + nx * w) + " " + fx(y + ny * w) + "L" + fx(x - nx * w) + " " + fx(y - ny * w);
    }
    out += '<path d="' + d + '" stroke="#141413" stroke-width="' + fx(u * 0.06) + '" fill="none"/>';
  });
  // Snakes: a wavy band (black edge, white middle) and a black head.
  Object.entries(b.snakes).forEach(([from, to]) => {
    const [x1, y1] = C(+from), [x2, y2] = C(to);
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    const waves = Math.max(1, Math.round(len / (u * 1.4))), amp = u * 0.22;
    let d = "M" + fx(x1) + " " + fx(y1);
    const steps = waves * 8;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps, off = Math.sin(t * waves * 2 * Math.PI) * amp * (1 - t * 0.3);
      d += "L" + fx(x1 + (x2 - x1) * t + nx * off) + " " + fx(y1 + (y2 - y1) * t + ny * off);
    }
    out += '<path d="' + d + '" stroke="#141413" stroke-width="' + fx(u * 0.22) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    out += '<path d="' + d + '" stroke="#fff" stroke-width="' + fx(u * 0.09) + '" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + fx(u * 0.18) + " " + fx(u * 0.12) + '"/>';
    out += '<ellipse cx="' + fx(x1) + '" cy="' + fx(y1) + '" rx="' + fx(u * 0.2) + '" ry="' + fx(u * 0.16) + '" fill="#141413"/>' +
      '<circle cx="' + fx(x1 - u * 0.07) + '" cy="' + fx(y1 - u * 0.03) + '" r="' + fx(u * 0.04) + '" fill="#fff"/><circle cx="' + fx(x1 + u * 0.07) + '" cy="' + fx(y1 - u * 0.03) + '" r="' + fx(u * 0.04) + '" fill="#fff"/>';
  });
  // Tokens on the board: one quarter of the cell each.
  const offsets = [[-0.23, 0.17], [0.23, 0.17], [-0.23, -0.17], [0.23, -0.17]];
  for (let p = 0; p < s.numPlayers; p++) {
    if (!s.pos[p]) continue;
    const [x, y] = C(s.pos[p]);
    out += shapeMarkupSL(SL_SHAPES[shapeOfSL(p)], fx(x + offsets[p][0] * u), fx(y + offsets[p][1] * u), fx(u * 0.23));
  }
  boardEl.innerHTML = '<svg class="sl-board-svg" viewBox="0 0 ' + u * cols + " " + u * rows + '" width="' + u * cols + '" height="' + u * rows + '" aria-hidden="true" focusable="false">' + out + "</svg>";
  // Screen reader: a list of what is where.
  const desc = [];
  for (let p = 0; p < s.numPlayers; p++) {
    const who = nameSL(p);
    if (who === "You") desc.push(s.pos[p] ? "You are on field " + s.pos[p] + "." : "You are at the start.");
    else desc.push(s.pos[p] ? who + " is on field " + s.pos[p] + "." : who + " is at the start.");
  }
  Object.entries(b.ladders).forEach(([f, t]) => desc.push("Ladder from field " + f + " to " + t + "."));
  Object.entries(b.snakes).forEach(([f, t]) => desc.push("Snake from field " + f + " to " + t + "."));
  const list = document.getElementById("sl-board-desc");
  list.innerHTML = "";
  desc.forEach((d) => { const li = document.createElement("li"); I18n.setMsg(li, d); list.appendChild(li); });
}

document.addEventListener("DOMContentLoaded", initSnakesLaddersApp);
