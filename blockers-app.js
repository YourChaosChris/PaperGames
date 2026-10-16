// blockers-app.js
// Wires BlockersCore/BlockersAi ("Path Blockers" / Sperrsteine) to
// blockers.html.
//
// 2 to 4 players on one device, any of them played by the computer
// (levels Easy, Medium, Hard). On your turn: tap Roll, tap one of your
// tokens that can move (they get a dashed ring; tokens still in the house
// are chosen with the house button under the board), then tap one of the
// marked fields. Landing on a stone lets you put it on any free field:
// tap one. Tokens differ by shape (circle, triangle, diamond, star);
// stones are black squares with a white bar.
//
// Before the game every person chooses a token and a start house (six
// houses under the board, all equally far from the goal); the computers
// get the others. "Who starts": me, a computer or random (the default).
// Computer turns one at a time, like Snakes and Ladders: with "Computer
// moves: Continue after a tap" (the default, remembered on the device) a
// computer rolls when Continue is tapped, then moves and places a stone
// after calm pauses; with "Automatically" it rolls by itself after a calm
// pause too (AiPacing). Under the board each house shows its number and
// the token of the player starting there.
//
// "Game end" (remembered on the device): "One token in the goal" (the
// default) or "All tokens in the goal" - then a token reaching the goal
// leaves the board, every player shows "In the goal: n of 5", and with
// more than two players a ranking follows the win. "Tokens per player"
// (3 or 5, remembered) applies to "All tokens in the goal" only; with
// "One token in the goal" it stays 5.
//
// Fields in the safe lower half (no token can be sent back there) are
// drawn as rounded squares, the others as circles.

const BLOCKERS_SAVE_KEY = "einkchess_save_blockers";
const BL_SHAPES = ["circle", "triangle", "diamond", "star"];
const BL_SHAPE_NAME = { circle: "Circle", triangle: "Triangle", diamond: "Diamond", star: "Star" };
const BL_PACE_KEY = "papergames_blockers_pace";
const BL_FINISH_KEY = "papergames_blockers_finish";
const BL_TOKENS_KEY = "papergames_blockers_tokens";

function loadTokensBL() {
  try { return window.localStorage.getItem(BL_TOKENS_KEY) === "5" ? 5 : 3; } catch (e) { return 3; }
}

function saveTokensBL(n) {
  try { window.localStorage.setItem(BL_TOKENS_KEY, String(n === 5 ? 5 : 3)); } catch (e) { /* the choice just isn't remembered */ }
}

function loadFinishBL() {
  try { return window.localStorage.getItem(BL_FINISH_KEY) === "all" ? "all" : "one"; } catch (e) { return "one"; }
}

function saveFinishBL(finish) {
  try { window.localStorage.setItem(BL_FINISH_KEY, finish === "all" ? "all" : "one"); } catch (e) { /* the choice just isn't remembered */ }
}

// The game end of the running game; games saved before the choice play "one".
function finishBL() {
  const s = AppStateBL.state;
  return s && s.finish === "all" ? "all" : "one";
}

function loadPaceBL() {
  try { return window.localStorage.getItem(BL_PACE_KEY) === "auto" ? "auto" : "tap"; } catch (e) { return "tap"; }
}

function savePaceBL(pace) {
  try { window.localStorage.setItem(BL_PACE_KEY, pace === "auto" ? "auto" : "tap"); } catch (e) { /* the choice just isn't remembered */ }
}

// Player p's token shape; games saved before tokens could be chosen have
// player p on shape p.
function shapeOfBL(p) {
  const s = AppStateBL.state;
  return s && Array.isArray(s.shapes) ? s.shapes[p] : p;
}

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
  return shapeSvgOfBL(shapeOfBL(p));
}

function shapeSvgOfBL(k) {
  return '<svg class="bl-shape" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + shapeMarkupBL(BL_SHAPES[k], 20, 21, 14) + "</svg>";
}

/*** Status and save ***/

function setStatusBL(text) {
  if (AppStateBL.computers > 0 && text) {
    const uiStatusText = String(text);
    const uiStatusKeep = /(n't|\bnot\b|cannot|\billegal\b|\binvalid\b|\bfirst\b|\bmust\b|\bneed|\bempty\b|\bchoose\b|\btap\b|\bselect\b|\bpick\b|\balready\b|\bno tile\b|\bno card\b|\bno move\b|\bplay the card\b|\bplay a\b|\bdraw\b.*\bstock\b)/i.test(uiStatusText) && !/\b(wins?|won|winner)\b/i.test(uiStatusText);
    const uiStatusState = AppStateBL.state || AppStateBL;
    const uiStatusGameOver = AppStateBL.gameOver === true || AppStateBL.over === true || uiStatusState.gameOver === true || uiStatusState.over === true;
    const uiStatusTurn = (AppStateBL.state || {}).turn;
    const uiStatusHuman = AppStateBL.numPlayers - AppStateBL.computers;
    let uiStatusKey = null;
    if (uiStatusGameOver && !/\b(draw|drawn|tie|remis|stalemate)\b/i.test(uiStatusText) && /\b(win|wins|won|winner|lose|loses)\b/i.test(uiStatusText)) {
      if (/\b(you win|you won|you have won)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_you_win";
      else if (/\b(you lose|you lost|computer.{0,30}wins?)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_computer_wins";
      else if (uiStatusState.winner !== undefined) uiStatusKey = Number(uiStatusState.winner) < Number(AppStateBL.numPlayers - AppStateBL.computers) ? "ui_status_you_win" : "ui_status_computer_wins";
    }
    if (!uiStatusKey && /(?:^|[.!?]\s+)(?:the\s+)?computer(?:\s+\d+)?(?:\x27s)?\s+(?:turn|thinking|to move|is thinking|is playing|plays|acts|rolling)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_computer_turn";
    if (!uiStatusKey && /\b(turn|to move|move a stone|place a stone|draw a card|roll|throw)\b/i.test(uiStatusText) && uiStatusHuman !== undefined && uiStatusTurn !== undefined) uiStatusKey = !isComputerBL(uiStatusTurn) ? "ui_status_your_turn" : "ui_status_computer_turn";
    if (!uiStatusKey && /\b(your turn|you are next|you to move)\b/i.test(uiStatusText)) uiStatusKey = "ui_status_your_turn";
    if (!uiStatusKey && !/\b(draw|drawn|tie|remis|stalemate|win|wins|won|winner|lose|loses)\b/i.test(uiStatusText)) {
      if (uiStatusHuman !== undefined && uiStatusTurn !== undefined) uiStatusKey = !isComputerBL(uiStatusTurn) ? "ui_status_your_turn" : "ui_status_computer_turn";
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
  const firstSel = document.getElementById("bl-first");
  const paceSel = document.getElementById("bl-pace");
  const finishSel = document.getElementById("bl-finish");
  const tokensSel = document.getElementById("bl-tokens");
  // "Tokens per player" only with "All tokens in the goal"; otherwise 5.
  const syncTokens = () => {
    const all = finishSel.value === "all";
    tokensSel.disabled = !all;
    tokensSel.value = all ? String(loadTokensBL()) : "5";
  };
  finishSel.value = loadFinishBL();
  syncTokens();
  finishSel.addEventListener("change", () => { saveFinishBL(finishSel.value); syncTokens(); });
  tokensSel.addEventListener("change", () => { if (finishSel.value === "all") saveTokensBL(parseInt(tokensSel.value, 10)); });
  players.addEventListener("change", () => { limitComputers(); buildChoicesBL(); });
  computers.addEventListener("change", buildChoicesBL);
  limitComputers();
  buildChoicesBL();
  paceSel.value = loadPaceBL();
  paceSel.addEventListener("change", () => {
    savePaceBL(paceSel.value);
    if (paceSel.value === "auto" && AppStateBL.state) { renderBL(); continueBL(); }
  });
  document.getElementById("start-bl-game").addEventListener("click", () => {
    const tokens = Array.from(document.querySelectorAll("#bl-choices .bl-token-select")).map((sel) => parseInt(sel.value, 10));
    const houses = Array.from(document.querySelectorAll("#bl-choices .bl-house-select")).map((sel) => parseInt(sel.value, 10));
    saveFinishBL(finishSel.value);
    startGameBL(parseInt(players.value, 10), parseInt(computers.value, 10), parseInt(document.getElementById("bl-level").value, 10), tokens, houses, firstSel.value, finishSel.value, parseInt(tokensSel.value, 10));
  });
  document.getElementById("bl-roll").addEventListener("click", humanRollBL);
  document.getElementById("bl-next").addEventListener("click", nextComputerBL);
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

// Per person: token and start house. Two people can't take the same
// token or house: choosing one that is taken swaps it with the other
// person's.
function buildChoicesBL() {
  const wrap = document.getElementById("bl-choices");
  const n = parseInt(document.getElementById("bl-num-players").value, 10);
  const humans = n - parseInt(document.getElementById("bl-computers").value, 10);
  const tokBefore = Array.from(wrap.querySelectorAll(".bl-token-select")).map((sel) => parseInt(sel.value, 10));
  const houseBefore = Array.from(wrap.querySelectorAll(".bl-house-select")).map((sel) => parseInt(sel.value, 10));
  const toks = BlockersCore.assignShapes(n, tokBefore.slice(0, humans)).slice(0, humans);
  // A new person starts in house 2 (as before this choice existed) or the next free one.
  const houses = BlockersCore.assignHouses(n, houseBefore.length ? houseBefore.slice(0, humans).concat([1, 1, 1]).slice(0, humans) : new Array(humans).fill(1)).slice(0, humans);
  wrap.innerHTML = "";
  const swapper = (cls) => (sel) => {
    sel.dataset.prev = sel.value;
    sel.addEventListener("change", () => {
      wrap.querySelectorAll("." + cls).forEach((x) => { if (x !== sel && x.value === sel.value) { x.value = sel.dataset.prev; x.dataset.prev = sel.dataset.prev; } });
      sel.dataset.prev = sel.value;
      renderChoicePicsBL();
    });
  };
  for (let h = 0; h < humans; h++) {
    const row = document.createElement("div");
    row.className = "field-row bl-choice";
    const tl = document.createElement("label");
    tl.setAttribute("for", "bl-token-" + h);
    I18n.setMsg(tl, humans === 1 ? "Your token:" : "Token of player " + (h + 1) + ":");
    const ts = document.createElement("select");
    ts.id = "bl-token-" + h;
    ts.className = "bl-token-select";
    BL_SHAPES.forEach((shape, k) => {
      const o = document.createElement("option");
      o.value = String(k);
      I18n.setMsg(o, BL_SHAPE_NAME[shape]);
      ts.appendChild(o);
    });
    ts.value = String(toks[h]);
    swapper("bl-token-select")(ts);
    const pic = document.createElement("span");
    pic.className = "bl-choice-pic";
    const hl = document.createElement("label");
    hl.setAttribute("for", "bl-house-" + h);
    I18n.setMsg(hl, "Start house:");
    const hs = document.createElement("select");
    hs.id = "bl-house-" + h;
    hs.className = "bl-house-select";
    BlockersCore.HOUSE_COLS.forEach((_, k) => {
      const o = document.createElement("option");
      o.value = String(k);
      I18n.setKey(o, "bl_house_" + (k + 1));
      hs.appendChild(o);
    });
    hs.value = String(houses[h]);
    swapper("bl-house-select")(hs);
    [tl, ts, pic, hl, hs].forEach((el) => row.appendChild(el));
    wrap.appendChild(row);
  }
  renderChoicePicsBL();
  const firstSel = document.getElementById("bl-first");
  const compOpt = firstSel.querySelector('option[value="computer"]');
  compOpt.disabled = humans >= n;
  if (compOpt.disabled && firstSel.value === "computer") firstSel.value = "random";
}

function renderChoicePicsBL() {
  document.querySelectorAll("#bl-choices .bl-choice").forEach((row) => {
    row.querySelector(".bl-choice-pic").innerHTML = shapeSvgOfBL(parseInt(row.querySelector(".bl-token-select").value, 10));
  });
}

function startGameBL(numPlayers, computers, level, tokenChoices, houseChoices, firstChoice, finish, tokenCount) {
  const n = Math.max(2, Math.min(4, numPlayers || 2));
  AppStateBL.numPlayers = n;
  AppStateBL.computers = Math.max(0, Math.min(n - 1, computers || 0));
  AppStateBL.level = level >= 1 && level <= 3 ? level : 2;
  const humans = n - AppStateBL.computers;
  const shapes = BlockersCore.assignShapes(n, (tokenChoices || []).slice(0, humans));
  const houses = BlockersCore.assignHouses(n, (houseChoices || []).slice(0, humans));
  const first = BlockersCore.firstPlayer(firstChoice || "random", n, AppStateBL.computers ? humans : n);
  AppStateBL.state = BlockersCore.createInitialState(n, { houses, shapes, first, finish: finish === "all" ? "all" : "one", tokens: tokenCount === 5 ? 5 : 3 });
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

// "1 field", "3 fields" - the singular for a roll of 1.
function fieldsBL(n) {
  return n + (n === 1 ? " field" : " fields");
}

function pickTextBL(roll) {
  return "Tap a token with a dashed ring (or the house button) to move it " + fieldsBL(roll) + ".";
}

function promptBL(prefix) {
  const s = AppStateBL.state;
  const pre = prefix ? prefix + " " : "";
  const who = nameBL(s.turn), you = who === "You";
  let text;
  if (isComputerBL(s.turn)) text = prefix && s.phase !== "roll" ? "" : (s.phase === "roll" && loadPaceBL() === "tap" ? who + "'s turn: tap Continue." : who + "'s turn.");
  else if (s.phase === "roll") text = you ? "Your turn: tap Roll." : who + "'s turn: tap Roll.";
  else if (s.phase === "stone") text = "Tap a free field to put the stone on (not in the bottom row).";
  else if (AppStateBL.selected >= 0) text = "Now tap one of the marked fields.";
  else text = pickTextBL(s.roll);
  setStatusBL((pre + text).trim());
  renderBL();
}

// A computer's turn: the roll waits for Continue ("tap") or comes after a
// calm pause ("auto"); the move and the stone always follow after a pause.
function continueBL() {
  const s = AppStateBL.state;
  if (!s || AppStateBL.gameOver || s.gameOver || !isComputerBL(s.turn) || AppStateBL.busy) return;
  if (s.phase === "roll" && loadPaceBL() === "tap") return;
  AppStateBL.busy = true;
  setTimeout(aiStepBL, AiPacing.delay(s.phase === "roll" ? 600 : 900));
}

function nextComputerBL() {
  const s = AppStateBL.state;
  if (!s || AppStateBL.gameOver || s.gameOver || !isComputerBL(s.turn) || AppStateBL.busy || s.phase !== "roll") return;
  rollBL();
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
  if (r.arrived) {
    const left = r.state.tokens[p].length - BlockersCore.arrivedCount(r.state, p);
    parts.push(you ? "You bring a token into the goal: " + left + " still to go." : who + " brings a token into the goal: " + left + " still to go.");
  }
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
  let end;
  if (finishBL() === "all") end = who === "You" ? "All your tokens are in the goal - you win!" : who + " has all tokens in the goal and wins!";
  else end = who === "You" ? "You reach the goal and win!" : who + " reaches the goal and wins!";
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
    setStatusBL("This token cannot move " + fieldsBL(s.roll) + ".");
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
  setStatusBL(AppStateBL.selected >= 0 ? "Now tap one of the marked fields." : pickTextBL(s.roll));
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
    if (finishBL() === "all") {
      const goalCount = document.createElement("span");
      goalCount.className = "pc-player-extra bl-goal-count";
      I18n.setMsg(goalCount, "In the goal: " + BlockersCore.arrivedCount(s, p) + " of " + s.tokens[p].length);
      row.appendChild(goalCount);
    }
    I18n.setAria(row, nameBL(p) + ", " + BL_SHAPES[shapeOfBL(p)] + ", " + "House: " + inHouse + (finishBL() === "all" ? ", " + "In the goal: " + BlockersCore.arrivedCount(s, p) + " of " + s.tokens[p].length : "") + (canPick ? ", can move" : ""));
    row.disabled = !canPick;
    row.addEventListener("click", () => onHouseBL(p));
    playersEl.appendChild(row);
  }
  renderRankingBL(over);
  const dieEl = document.getElementById("bl-die");
  dieEl.innerHTML = s.roll ? '<svg class="bl-die" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="5" y="5" width="90" height="90" rx="14" fill="#fff" stroke="#141413" stroke-width="6"/>' +
    BL_PIPS[s.roll].map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="9" fill="#141413"/>').join("") + "</svg>" : "";
  if (s.roll) I18n.setAria(dieEl, "Rolled " + s.roll); else dieEl.removeAttribute("aria-label");
  const rollBtn = document.getElementById("bl-roll");
  const nextBtn = document.getElementById("bl-next");
  const computerWaits = !over && isComputerBL(s.turn) && s.phase === "roll" && loadPaceBL() === "tap";
  rollBtn.classList.toggle("hidden", over || computerWaits);
  rollBtn.disabled = over || isComputerBL(s.turn) || s.phase !== "roll";
  nextBtn.classList.toggle("hidden", !computerWaits);
  renderBoardBL();
}

// "All tokens in the goal" with more than two players: after the win, the
// players in order (winner first, then by tokens in the goal).
function renderRankingBL(over) {
  const s = AppStateBL.state;
  const wrap = document.getElementById("bl-ranking-wrap");
  const list = document.getElementById("bl-ranking");
  list.innerHTML = "";
  const show = over && finishBL() === "all" && s.numPlayers > 2 && s.winner >= 0;
  wrap.classList.toggle("hidden", !show);
  if (!show) return;
  BlockersCore.ranking(s).forEach((p) => {
    const li = document.createElement("li");
    li.insertAdjacentHTML("beforeend", shapeSvgBL(p));
    const name = document.createElement("span");
    name.className = "game-player-name";
    I18n.setMsg(name, nameBL(p));
    li.appendChild(name);
    const count = document.createElement("span");
    count.className = "pc-player-extra bl-goal-count";
    I18n.setMsg(count, "In the goal: " + BlockersCore.arrivedCount(s, p) + " of " + s.tokens[p].length);
    li.appendChild(count);
    list.appendChild(li);
  });
}

function renderBoardBL() {
  const s = AppStateBL.state;
  const C = BlockersCore;
  const wrap = document.getElementById("bl-board-wrap");
  const boardEl = document.getElementById("bl-board");
  const width = Math.min((wrap.clientWidth || 324) - 4, 560);
  const u = Math.floor(width / C.COLS);
  // One more row under the fields for the six houses.
  boardEl.style.width = u * C.COLS + "px";
  boardEl.style.height = u * (C.ROWS + 1) + "px";
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
    } else if (C.isSafe(f)) {
      // Safe half: a rounded square instead of a circle.
      const h = u * 0.31;
      out += '<rect x="' + fx(x - h) + '" y="' + fx(y - h) + '" width="' + fx(2 * h) + '" height="' + fx(2 * h) + '" rx="' + fx(u * 0.08) + '" fill="#fff" stroke="#141413" stroke-width="' + fx(entries.has(f) ? u * 0.11 : u * 0.05) + '"/>';
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
      out += shapeMarkupBL(BL_SHAPES[shapeOfBL(p)], x, y, u * 0.26);
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
  // The houses under the bottom row: a house outline, thick with the token
  // of the player who starts there, or thin with its number when free.
  // (Games saved before the houses existed show the old entry fields only.)
  const owners = {};
  if (Array.isArray(s.houses)) for (let p = 0; p < s.numPlayers; p++) owners[s.houses[p]] = p;
  const houseCols = Array.isArray(s.houses) ? C.HOUSE_COLS : [];
  houseCols.forEach((col, h) => {
    const x = col * u + u / 2, top = C.ROWS * u + u * 0.06, w = u * 0.42, roof = u * 0.3, bottom = C.ROWS * u + u * 0.96;
    const owned = owners[h] !== undefined;
    out += '<path d="M' + fx(x) + " " + fx(top) + "L" + fx(x + w) + " " + fx(top + roof) + "V" + fx(bottom) + "H" + fx(x - w) + "V" + fx(top + roof) + 'Z" fill="#fff" stroke="#141413" stroke-width="' + fx(owned ? Math.max(2, u * 0.08) : Math.max(1, u * 0.035)) + '" stroke-linejoin="round"/>';
    if (owned) out += shapeMarkupBL(BL_SHAPES[shapeOfBL(owners[h])], x, top + roof + (bottom - top - roof) * 0.5, u * 0.22);
    else out += '<text x="' + fx(x) + '" y="' + fx(bottom - u * 0.1) + '" text-anchor="middle" font-size="' + fx(Math.max(9, u * 0.3)) + '" font-weight="700" fill="#141413">' + (h + 1) + "</text>";
  });
  let html = '<svg class="bl-board-svg" viewBox="0 0 ' + u * C.COLS + " " + u * (C.ROWS + 1) + '" width="' + u * C.COLS + '" height="' + u * (C.ROWS + 1) + '" aria-hidden="true" focusable="false">' + out + "</svg>";
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
    if (C.isSafe(f)) parts.push("safe");
    if (targets.has(f) || stoneSpots.has(f)) parts.push("possible");
    I18n.setAria(btn, parts.join(", "));
    btn.addEventListener("click", () => onFieldBL(f));
    boardEl.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", initBlockersApp);
