// domino-app.js
// Wires DominoCore/DominoAi to domino.html.
//
// Layout (top to bottom), chosen so a long line of tiles never has to be
// read or tapped on a small e-ink screen:
//   - one row with the two open ends, each shown as a big number and
//     tappable - these are the only targets for placing a tile;
//   - the line of tiles played so far, as one horizontal row that
//     scrolls sideways (for reference only);
//   - the player's own hand. Tap a tile to pick it, then tap an open end.
// Opponents' hands and the stock are shown as counts, not face-down rows.
//
// With two or more people on one device, each hand is covered between
// turns ("Pass the device to Player 2") so nobody sees another's tiles.
// Against the computer the human is always Player 1.

const DOMINO_SAVE_KEY = "einkchess_save_domino";

const AppStateDomino = {
  mode: "vs-ai",       // "vs-ai" | "hotseat"
  numPlayers: 2,
  aiLevel: 2,
  state: null,
  started: false,
  gameOver: false,
  selected: null,      // hand index picked by the player to move
  revealed: true,      // hotseat: whether the current hand is uncovered
  lastPlaced: null,    // { side } of the latest tile, for the last-move mark
  busy: false,         // a computer move is scheduled
  result: null         // final message, kept for re-rendering
};

function playerNameDomino(i) {
  return "Player " + (i + 1);
}

function isAiPlayerDomino(i) {
  return AppStateDomino.mode === "vs-ai" && i !== 0;
}

// Whose hand is shown: the human's against the computer, otherwise the
// player to move.
function viewerDomino() {
  return AppStateDomino.mode === "vs-ai" ? 0 : AppStateDomino.state.turn;
}

function tileTextDomino(tile) {
  return tile[0] + "-" + tile[1];
}

function setStatusDomino(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultDomino(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveDominoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(DOMINO_SAVE_KEY, {
    mode: AppStateDomino.mode,
    numPlayers: AppStateDomino.numPlayers,
    aiLevel: AppStateDomino.aiLevel,
    state: AppStateDomino.state,
    lastPlaced: AppStateDomino.lastPlaced
  });
}

function clearSavedDominoGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(DOMINO_SAVE_KEY);
}

function recordStatsDomino(outcome) {
  if (typeof GameStats === "undefined" || AppStateDomino.mode !== "vs-ai") return;
  GameStats.record("domino", outcome);
}

/*** Tile drawing ***/

// Pip centres inside one 50x50 half.
const DOMINO_PIP_LAYOUT = {
  0: [],
  1: [[25, 25]],
  2: [[13, 13], [37, 37]],
  3: [[13, 13], [25, 25], [37, 37]],
  4: [[13, 13], [37, 13], [13, 37], [37, 37]],
  5: [[13, 13], [37, 13], [25, 25], [13, 37], [37, 37]],
  6: [[13, 13], [37, 13], [13, 25], [37, 25], [13, 37], [37, 37]]
};

function pipsSvgDomino(value, dx, dy) {
  return DOMINO_PIP_LAYOUT[value].map((p) =>
    '<circle class="domino-pip" cx="' + (p[0] + dx) + '" cy="' + (p[1] + dy) + '" r="5"/>').join("");
}

// A tile as inline SVG in the page's text colour. Doubles in the line
// stand crosswise, as they traditionally do.
function tileSvgDomino(tile, vertical) {
  if (vertical) {
    return '<svg class="domino-svg domino-svg-v" viewBox="0 0 50 100" aria-hidden="true" focusable="false">' +
      '<rect class="domino-face" x="1.5" y="1.5" width="47" height="97" rx="6"/>' +
      '<line class="domino-divider" x1="6" y1="50" x2="44" y2="50"/>' +
      pipsSvgDomino(tile[0], 0, 0) + pipsSvgDomino(tile[1], 0, 50) + "</svg>";
  }
  return '<svg class="domino-svg" viewBox="0 0 100 50" aria-hidden="true" focusable="false">' +
    '<rect class="domino-face" x="1.5" y="1.5" width="97" height="47" rx="6"/>' +
    '<line class="domino-divider" x1="50" y1="6" x2="50" y2="44"/>' +
    pipsSvgDomino(tile[0], 0, 0) + pipsSvgDomino(tile[1], 50, 0) + "</svg>";
}

/*** Game flow ***/

function initDominoApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("domino-level-wrap");
  const levelSelect = document.getElementById("domino-level-inline");
  const playersSelect = document.getElementById("domino-num-players");
  const startBtn = document.getElementById("start-domino-game");
  const resignBtn = document.getElementById("resign-button");
  let pendingMode = "vs-ai";

  function setMode(mode) {
    pendingMode = mode;
    if (modeOffline) modeOffline.classList.toggle("active-mode", mode === "hotseat");
    if (modeOfflineAi) modeOfflineAi.classList.toggle("active-mode", mode === "vs-ai");
    if (levelWrap) levelWrap.classList.toggle("hidden", mode !== "vs-ai");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeOffline) modeOffline.addEventListener("click", () => setMode("hotseat"));
  if (modeOfflineAi) modeOfflineAi.addEventListener("click", () => setMode("vs-ai"));

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const n = playersSelect ? parseInt(playersSelect.value, 10) : 2;
      const level = levelSelect ? parseInt(levelSelect.value, 10) : 2;
      startNewGameDomino(pendingMode, n, level);
      const status = document.getElementById("offline-domino-status");
      if (status) {
        const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
        I18n.setMsg(status, pendingMode === "vs-ai"
          ? "You play Player 1, computer level: " + levelNames[level] + "."
          : "Local " + n + "-player hotseat game (no computer).");
      }
    });
  }

  if (resignBtn) resignBtn.addEventListener("click", resignDomino);

  document.getElementById("domino-end-left").addEventListener("click", () => onEndClickDomino("left"));
  document.getElementById("domino-end-right").addEventListener("click", () => onEndClickDomino("right"));
  document.getElementById("domino-stock-button").addEventListener("click", onDrawClickDomino);
  document.getElementById("domino-pass-button").addEventListener("click", onPassClickDomino);
  document.getElementById("domino-show-hand").addEventListener("click", () => {
    AppStateDomino.revealed = true;
    renderDomino();
    promptHumanDomino();
  });

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(DOMINO_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver) {
    AppStateDomino.mode = saved.mode;
    AppStateDomino.numPlayers = saved.numPlayers;
    AppStateDomino.aiLevel = saved.aiLevel;
    AppStateDomino.state = saved.state;
    AppStateDomino.lastPlaced = saved.lastPlaced || null;
    AppStateDomino.started = true;
    AppStateDomino.gameOver = false;
    AppStateDomino.selected = null;
    AppStateDomino.revealed = saved.mode !== "hotseat";
    setMode(saved.mode);
    showBoardDomino();
    renderDomino();
    continueTurnDomino();
  }
}

function showBoardDomino() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startNewGameDomino(mode, numPlayers, level) {
  AppStateDomino.mode = mode;
  AppStateDomino.numPlayers = numPlayers;
  AppStateDomino.aiLevel = level;
  AppStateDomino.state = DominoCore.createInitialState(numPlayers);
  AppStateDomino.started = true;
  AppStateDomino.gameOver = false;
  AppStateDomino.selected = null;
  AppStateDomino.lastPlaced = null;
  AppStateDomino.result = null;
  AppStateDomino.busy = false;
  setGameResultDomino("");
  showBoardDomino();

  // The opening tile is forced, so it is played straight away.
  const s = AppStateDomino.state;
  const opener = s.turn;
  const index = s.hands[opener].findIndex((t) => DominoCore.sameTile(t, s.openingTile));
  const r = DominoCore.applyMove(s, index, "right");
  AppStateDomino.state = r.state;
  AppStateDomino.lastPlaced = { side: "right" };
  AppStateDomino.revealed = mode !== "hotseat";
  afterActionDomino(opener, playerNameDomino(opener) + " opens with " + tileTextDomino(r.tile) + ".");
}

// Starts whatever the player to move has to do next.
function continueTurnDomino() {
  if (AppStateDomino.gameOver || !AppStateDomino.started) return;
  const s = AppStateDomino.state;
  if (isAiPlayerDomino(s.turn)) {
    if (AppStateDomino.busy) return;
    AppStateDomino.busy = true;
    setTimeout(aiTurnDomino, AiPacing.delay(700));
    return;
  }
  if (AppStateDomino.mode === "hotseat" && !AppStateDomino.revealed) {
    renderDomino();
    return;
  }
  promptHumanDomino();
}

function promptHumanDomino() {
  const s = AppStateDomino.state;
  const action = DominoCore.requiredAction(s);
  const who = playerNameDomino(s.turn);
  if (action === "play") setStatusDomino(who + "'s turn. Choose a tile, then an open end.");
  else if (action === "draw") setStatusDomino(who + "'s turn. No tile fits - draw from the stock.");
  else if (action === "pass") setStatusDomino(who + "'s turn. No tile fits and the stock is empty - pass.");
  renderDomino();
}

function aiTurnDomino() {
  AppStateDomino.busy = false;
  if (AppStateDomino.gameOver || !AppStateDomino.started) return;
  let s = AppStateDomino.state;
  if (!isAiPlayerDomino(s.turn)) return;
  const who = playerNameDomino(s.turn);
  let action = DominoCore.requiredAction(s);
  let drawn = 0;
  while (action === "draw") {
    s = DominoCore.drawTile(s).state;
    drawn++;
    action = DominoCore.requiredAction(s);
  }
  AppStateDomino.state = s;
  if (action === "pass") {
    finishPassDomino(who, drawn);
    return;
  }
  const move = DominoAi.chooseMove(s, AppStateDomino.aiLevel);
  playMoveDomino(move.index, move.side, drawn);
}

function drawNoteDomino(who, drawn) {
  if (!drawn) return "";
  return drawn === 1 ? who + " drew 1 tile. " : who + " drew " + drawn + " tiles. ";
}

function playMoveDomino(index, side, drawn) {
  const s = AppStateDomino.state;
  const player = s.turn;
  const who = playerNameDomino(player);
  const r = DominoCore.applyMove(s, index, side);
  AppStateDomino.state = r.state;
  AppStateDomino.lastPlaced = { side: side };
  AppStateDomino.selected = null;
  const msg = drawNoteDomino(who, drawn) + who + " played " + tileTextDomino(r.tile) + ".";
  afterActionDomino(player, msg);
}

function finishPassDomino(who, drawn) {
  const player = AppStateDomino.state.turn;
  AppStateDomino.state = DominoCore.pass(AppStateDomino.state);
  AppStateDomino.selected = null;
  afterActionDomino(player, drawNoteDomino(who, drawn) + who + " passed.");
}

function afterActionDomino(player, msg) {
  const s = AppStateDomino.state;
  if (s.gameOver) {
    renderDomino();
    endGameDomino(msg);
    return;
  }
  if (AppStateDomino.mode === "hotseat") {
    AppStateDomino.revealed = false;
    msg += " Pass the device to " + playerNameDomino(s.turn) + ".";
  }
  if (AppStateDomino.mode === "vs-ai" && !isAiPlayerDomino(s.turn)) msg += " " + statusPromptDomino();
  setStatusDomino(msg);
  renderDomino();
  saveDominoGame();
  if (isAiPlayerDomino(s.turn)) continueTurnDomino();
}

function statusPromptDomino() {
  const action = DominoCore.requiredAction(AppStateDomino.state);
  if (action === "draw") return "No tile fits - draw from the stock.";
  if (action === "pass") return "No tile fits and the stock is empty - pass.";
  return "Choose a tile, then an open end.";
}

function endGameDomino(lastMsg) {
  const s = AppStateDomino.state;
  AppStateDomino.gameOver = true;
  AppStateDomino.selected = null;
  let title;
  let msg;
  if (s.blocked) {
    msg = lastMsg + " The line is blocked.";
    if (s.draw) msg += " The lowest pip total is shared - it's a draw.";
    else msg += " " + playerNameDomino(s.winner) + " wins with the lowest pip total.";
  } else {
    msg = lastMsg + " " + playerNameDomino(s.winner) + " played their last tile.";
  }
  if (s.draw) {
    title = "Draw";
    recordStatsDomino("draw");
  } else if (AppStateDomino.mode === "vs-ai") {
    title = s.winner === 0 ? "You win!" : "You lose";
    recordStatsDomino(s.winner === 0 ? "win" : "loss");
  } else {
    title = playerNameDomino(s.winner) + " wins";
  }
  AppStateDomino.result = msg;
  setGameResultDomino(msg);
  setStatusDomino(msg);
  if (window.ResultModal) window.ResultModal.show(title, msg);
  clearSavedDominoGame();
  renderDomino();
}

function resignDomino() {
  if (AppStateDomino.gameOver || !AppStateDomino.started) return;
  const s = AppStateDomino.state;
  const loser = AppStateDomino.mode === "vs-ai" ? 0 : s.turn;
  // The others' lowest pip total decides who is left as winner.
  let winner = null;
  let low = Infinity;
  s.hands.forEach((h, i) => {
    if (i === loser) return;
    const total = DominoCore.pipTotal(h);
    if (total < low) { low = total; winner = i; }
  });
  s.gameOver = true;
  s.winner = winner;
  AppStateDomino.gameOver = true;
  const msg = playerNameDomino(loser) + " resigned. " + playerNameDomino(winner) + " wins.";
  const title = AppStateDomino.mode === "vs-ai" ? "You lose" : playerNameDomino(winner) + " wins";
  recordStatsDomino("loss");
  setGameResultDomino(msg);
  setStatusDomino(msg);
  if (window.ResultModal) window.ResultModal.show(title, msg);
  clearSavedDominoGame();
  renderDomino();
}

/*** Human input ***/

function humanCanActDomino() {
  const s = AppStateDomino.state;
  if (!AppStateDomino.started || AppStateDomino.gameOver) return false;
  if (isAiPlayerDomino(s.turn)) {
    setStatusDomino("Computer thinking…");
    return false;
  }
  if (AppStateDomino.mode === "hotseat" && !AppStateDomino.revealed) return false;
  return true;
}

function onHandTileClickDomino(index) {
  if (!humanCanActDomino()) return;
  const s = AppStateDomino.state;
  const tile = s.hands[s.turn][index];
  if (!tile) return;
  if (AppStateDomino.selected === index) {
    AppStateDomino.selected = null;
    renderDomino();
    return;
  }
  const sides = DominoCore.sidesForTile(s, tile);
  if (!sides.length) {
    AppStateDomino.selected = null;
    setStatusDomino("That tile doesn't fit on either end.");
    renderDomino();
    return;
  }
  AppStateDomino.selected = index;
  setStatusDomino(sides.length === 2
    ? "Tile " + tileTextDomino(tile) + " fits on both ends - tap one."
    : "Tap the highlighted end to place tile " + tileTextDomino(tile) + ".");
  renderDomino();
}

function onEndClickDomino(side) {
  if (!humanCanActDomino()) return;
  const s = AppStateDomino.state;
  if (AppStateDomino.selected === null) {
    setStatusDomino("Choose a tile from your hand first.");
    return;
  }
  const tile = s.hands[s.turn][AppStateDomino.selected];
  if (DominoCore.sidesForTile(s, tile).indexOf(side) === -1) {
    setStatusDomino("That tile doesn't fit on this end.");
    return;
  }
  playMoveDomino(AppStateDomino.selected, side, 0);
}

function onDrawClickDomino() {
  if (!humanCanActDomino()) return;
  let s = AppStateDomino.state;
  if (DominoCore.requiredAction(s) !== "draw") {
    setStatusDomino(DominoCore.canPlay(s, s.turn) ? "You have a tile that fits - no need to draw." : "The stock is empty.");
    return;
  }
  const who = playerNameDomino(s.turn);
  let drawn = 0;
  while (DominoCore.requiredAction(s) === "draw") {
    s = DominoCore.drawTile(s).state;
    drawn++;
  }
  AppStateDomino.state = s;
  AppStateDomino.selected = null;
  const note = drawNoteDomino(who, drawn);
  if (DominoCore.requiredAction(s) === "pass") setStatusDomino(note + "No tile fits and the stock is empty - pass.");
  else setStatusDomino(note + "Choose a tile, then an open end.");
  renderDomino();
  saveDominoGame();
}

function onPassClickDomino() {
  if (!humanCanActDomino()) return;
  const s = AppStateDomino.state;
  if (DominoCore.requiredAction(s) !== "pass") {
    setStatusDomino(DominoCore.canPlay(s, s.turn) ? "You have a tile that fits - no need to pass." : "Draw from the stock first.");
    return;
  }
  finishPassDomino(playerNameDomino(s.turn), 0);
}

/*** Rendering ***/

function renderDomino() {
  const s = AppStateDomino.state;
  if (!s) return;
  renderPlayersDomino(s);
  renderEndsDomino(s);
  renderLineDomino(s);
  renderHandDomino(s);
  renderButtonsDomino(s);
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateDomino.gameOver || !AppStateDomino.started);
}

function renderPlayersDomino(s) {
  const el = document.getElementById("domino-players");
  if (!el) return;
  el.innerHTML = "";
  s.hands.forEach((hand, i) => {
    const row = document.createElement("div");
    row.className = "game-player" + (i === s.turn && !AppStateDomino.gameOver ? " game-player-active" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    let label = playerNameDomino(i);
    if (AppStateDomino.mode === "vs-ai") label += i === 0 ? " (you)" : " (computer)";
    I18n.setMsg(name, label);
    const count = document.createElement("span");
    count.className = "game-player-count";
    if (AppStateDomino.gameOver) {
      const total = DominoCore.pipTotal(hand);
      I18n.setMsg(count, hand.length + " tiles, " + total + " pips");
    } else {
      I18n.setMsg(count, hand.length === 1 ? "1 tile" : hand.length + " tiles");
    }
    row.appendChild(name);
    row.appendChild(count);
    el.appendChild(row);
  });
  const stock = document.createElement("div");
  stock.className = "game-player game-player-stock";
  const sName = document.createElement("span");
  sName.className = "game-player-name";
  I18n.setMsg(sName, "Stock: " + s.stock.length + " tiles");
  stock.appendChild(sName);
  el.appendChild(stock);
}

function renderEndsDomino(s) {
  const ends = DominoCore.openEnds(s);
  const sel = AppStateDomino.selected;
  const selTile = sel !== null ? s.hands[s.turn][sel] : null;
  const fitting = selTile ? DominoCore.sidesForTile(s, selTile) : [];
  const last = AppStateDomino.lastPlaced ? AppStateDomino.lastPlaced.side : null;
  ["left", "right"].forEach((side) => {
    const btn = document.getElementById("domino-end-" + side);
    if (!btn) return;
    const value = ends ? ends[side] : null;
    btn.textContent = value === null ? "" : String(value);
    // On an empty line only the end the opening tile may go on is live.
    const canOpen = !ends && DominoCore.legalMoves(s, s.turn).some((m) => m.side === side);
    btn.disabled = AppStateDomino.gameOver || (!ends && !canOpen);
    btn.classList.toggle("domino-end-fits", fitting.indexOf(side) !== -1);
    btn.classList.toggle("domino-end-last", last === side);
    let label = (side === "left" ? "Left end " : "Right end ") + (value === null ? "" : value);
    if (fitting.indexOf(side) !== -1) label += ", fits";
    I18n.setAria(btn, label.trim());
  });
}

function renderLineDomino(s) {
  const el = document.getElementById("domino-line");
  if (!el) return;
  el.innerHTML = "";
  const last = AppStateDomino.lastPlaced ? AppStateDomino.lastPlaced.side : null;
  s.line.forEach((tile, i) => {
    const span = document.createElement("span");
    const dbl = DominoCore.isDouble(tile);
    span.className = "domino-tile domino-line-tile" + (dbl ? " domino-tile-double" : "");
    const isLast = (last === "left" && i === 0) || (last === "right" && i === s.line.length - 1);
    if (isLast) span.classList.add("domino-tile-last");
    span.innerHTML = tileSvgDomino(tile, dbl);
    el.appendChild(span);
  });
  // Keep the end that just changed in view.
  if (last === "left") el.scrollLeft = 0;
  else el.scrollLeft = el.scrollWidth;
}

function renderHandDomino(s) {
  const handEl = document.getElementById("domino-hand");
  const cover = document.getElementById("domino-hand-cover");
  const coverText = document.getElementById("domino-hand-cover-text");
  if (!handEl) return;
  const hidden = AppStateDomino.mode === "hotseat" && !AppStateDomino.revealed && !AppStateDomino.gameOver;
  if (cover) cover.classList.toggle("hidden", !hidden);
  if (hidden && coverText) I18n.setMsg(coverText, "Pass the device to " + playerNameDomino(s.turn) + ".");
  handEl.classList.toggle("hidden", hidden);
  handEl.innerHTML = "";
  if (hidden) return;
  const viewer = viewerDomino();
  const myTurn = s.turn === viewer && !AppStateDomino.gameOver;
  s.hands[viewer].forEach((tile, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "domino-tile domino-hand-tile";
    const fits = myTurn && DominoCore.sidesForTile(s, tile).length > 0;
    if (!fits) btn.classList.add("domino-tile-unplayable");
    if (AppStateDomino.selected === i) btn.classList.add("domino-tile-selected");
    btn.innerHTML = tileSvgDomino(tile, false);
    let label = "Tile " + tileTextDomino(tile);
    if (AppStateDomino.selected === i) label += ", selected";
    I18n.setAria(btn, label);
    btn.addEventListener("click", () => onHandTileClickDomino(i));
    handEl.appendChild(btn);
  });
}

function renderButtonsDomino(s) {
  const drawBtn = document.getElementById("domino-stock-button");
  const passBtn = document.getElementById("domino-pass-button");
  const humanTurn = AppStateDomino.started && !AppStateDomino.gameOver && !isAiPlayerDomino(s.turn) &&
    (AppStateDomino.mode !== "hotseat" || AppStateDomino.revealed);
  const action = DominoCore.requiredAction(s);
  if (drawBtn) {
    drawBtn.disabled = !(humanTurn && action === "draw");
    drawBtn.classList.toggle("hidden", !humanTurn || action !== "draw");
  }
  if (passBtn) {
    passBtn.disabled = !(humanTurn && action === "pass");
    passBtn.classList.toggle("hidden", !humanTurn || action !== "pass");
  }
}

document.addEventListener("DOMContentLoaded", initDominoApp);
