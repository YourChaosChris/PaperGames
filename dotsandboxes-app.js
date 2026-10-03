// dotsandboxes-app.js
// Wires DotsAndBoxesCore/DotsAndBoxesAi to the dotsandboxes.html UI. Like
// WallMaze's board, this needs clickable targets BETWEEN dots (the line
// segments), not just on them, so it uses the same percentage-based
// absolute positioning technique rather than a plain float-grid. Unlike
// WallMaze's 2-cell-long walls, single-dot-to-dot lines don't overlap
// each other's candidates, so each line just gets its own plain button -
// no tap-catcher/preview step needed. The board size (4x4, 5x5 or 6x6
// boxes) is picked before a game starts and lives in the core state;
// the board is rebuilt from it on every start and restore.
//
// Players are told apart structurally, not by color alone: a completed
// box belonging to Player 1 gets a drawn cross, Player 2's a drawn
// circle - the same "structural, not color" convention used for pieces
// in every other 2-player game here. Drawn marks rather than solid or
// hatched fills, because on e-ink a black fill swallowed the lines
// around the box.

// Board size for a new game: 7 dots per side, 6x6 boxes.
const DAB_DEFAULT_DOTS = 7;

const AppStateDotsAndBoxes = {
  mode: "offline",        // "offline" | "offline-ai"
  state: DotsAndBoxesCore.createInitialState(DAB_DEFAULT_DOTS),
  humanPlayer: "1",       // "1" | "2" - which side the human plays vs. the AI
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  lastMove: null          // { type, r, c } of the latest line; not saved
};

const DOTSANDBOXES_SAVE_KEY = "einkchess_save_dotsandboxes";

function saveDotsAndBoxesGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(DOTSANDBOXES_SAVE_KEY, {
    mode: AppStateDotsAndBoxes.mode,
    state: AppStateDotsAndBoxes.state,
    humanPlayer: AppStateDotsAndBoxes.humanPlayer,
    aiLevel: AppStateDotsAndBoxes.aiLevel,
    moveCount: AppStateDotsAndBoxes.moveCount
  });
}

function clearSavedDotsAndBoxesGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(DOTSANDBOXES_SAVE_KEY);
}

function recordDotsAndBoxesStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateDotsAndBoxes.mode !== "offline-ai") return;
  GameStats.record("dotsandboxes", outcome);
}

function playerNameDotsAndBoxes(player) {
  return player === "1" ? "Player 1" : "Player 2";
}

function setStatusDotsAndBoxes(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultDotsAndBoxes(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// Builds a short, prominent modal title. In local 2-player games there's
// no single "you", so it's player-based; against the built-in AI it's
// framed from the human's perspective, which is more immediately
// meaningful. `winner` is "1" | "2" | "draw".
function resultTitleDotsAndBoxes(winner) {
  if (winner === "draw") return "Draw";
  if (AppStateDotsAndBoxes.mode === "offline-ai") {
    return winner === AppStateDotsAndBoxes.humanPlayer ? "You win!" : "You lose";
  }
  return playerNameDotsAndBoxes(winner) + " wins";
}

function announceGameResultDotsAndBoxes(resultCode, message) {
  setGameResultDotsAndBoxes(message);
  setStatusDotsAndBoxes("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackDotsAndBoxes() {
  AppStateDotsAndBoxes.undoStack = [];
}

function pushUndoSnapshotDotsAndBoxes() {
  AppStateDotsAndBoxes.undoStack.push({
    state: DotsAndBoxesCore.cloneState(AppStateDotsAndBoxes.state),
    gameOver: AppStateDotsAndBoxes.gameOver,
    moveCount: AppStateDotsAndBoxes.moveCount
  });
}

function initDotsAndBoxesApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const playerChoice = document.getElementById("dotsandboxes-player-choice");
  const levelInline = document.getElementById("dotsandboxes-level-inline");
  const startGameBtn = document.getElementById("start-dotsandboxes-game");
  const resignBtn = document.getElementById("resign-button");

  function updatePlayerChoiceVisibility() {
    if (!playerChoice || !levelInline) return;
    playerChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_close");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function chosenDots() {
    const sizeSel = document.getElementById("dotsandboxes-size-inline");
    const dots = sizeSel ? parseInt(sizeSel.value, 10) : DAB_DEFAULT_DOTS;
    return DotsAndBoxesCore.SIZES.indexOf(dots) !== -1 ? dots : DAB_DEFAULT_DOTS;
  }

  function startNewGame(mode, humanPlayer, level) {
    AppStateDotsAndBoxes.mode = mode;
    AppStateDotsAndBoxes.state = DotsAndBoxesCore.createInitialState(chosenDots());
    AppStateDotsAndBoxes.humanPlayer = humanPlayer;
    AppStateDotsAndBoxes.aiLevel = level;
    AppStateDotsAndBoxes.gameOver = false;
    AppStateDotsAndBoxes.moveCount = 0;
    AppStateDotsAndBoxes.lastMove = null;
    resetUndoStackDotsAndBoxes();
    setGameResultDotsAndBoxes("");
    showBoardSectionDotsAndBoxes();
    buildDotsAndBoxesBoardDOM();
    updateDotsAndBoxesBoard();
    updateGameLabelsDotsAndBoxes();

    if (mode === "offline-ai" && humanPlayer !== "1") {
      setStatusDotsAndBoxes("board-info", "Computer thinking…");
      setTimeout(aiTurnDotsAndBoxes, AiPacing.delay(300));
    } else {
      setStatusDotsAndBoxes("board-info", playerNameDotsAndBoxes(AppStateDotsAndBoxes.state.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "1", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateDotsAndBoxes.aiLevel || 2);
    updatePlayerChoiceVisibility();
    setStatusDotsAndBoxes("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updatePlayerChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const playerInput = document.querySelector("input[name='dotsandboxes-player']:checked");
    const humanPlayer = RandomStart.choose(playerInput && playerInput.value === "2" ? "2" : "1", ["1", "2"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "1", 0);
      setStatusDotsAndBoxes("offline-dotsandboxes-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanPlayer, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusDotsAndBoxes("offline-dotsandboxes-status",
      RandomStart.label("You play " + playerNameDotsAndBoxes(humanPlayer) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateDotsAndBoxes.gameOver) return;
      const loser = AppStateDotsAndBoxes.state.turn;
      const winner = DotsAndBoxesCore.otherPlayer(loser);
      AppStateDotsAndBoxes.gameOver = true;
      announceGameResultDotsAndBoxes(resultTitleDotsAndBoxes(winner), playerNameDotsAndBoxes(winner) + " wins by resignation.");
      recordDotsAndBoxesStatsIfVsAi("loss");
      updateGameLabelsDotsAndBoxes();
    });
  }

  updatePlayerChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(DOTSANDBOXES_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateDotsAndBoxes.mode = savedGame.mode;
    AppStateDotsAndBoxes.state = savedGame.state;
    // A game saved before board sizes existed has no `dots`: it is 5x5
    // dots (4x4 boxes) and carries on as such.
    AppStateDotsAndBoxes.state.dots = DotsAndBoxesCore.dotsOf(savedGame.state);
    const sizeSel = document.getElementById("dotsandboxes-size-inline");
    if (sizeSel) sizeSel.value = String(AppStateDotsAndBoxes.state.dots);
    AppStateDotsAndBoxes.humanPlayer = savedGame.humanPlayer;
    AppStateDotsAndBoxes.aiLevel = savedGame.aiLevel;
    AppStateDotsAndBoxes.moveCount = savedGame.moveCount;
    AppStateDotsAndBoxes.gameOver = false;
    AppStateDotsAndBoxes.lastMove = null;
    resetUndoStackDotsAndBoxes();
    setActiveModeButton(AppStateDotsAndBoxes.mode);
    setGameResultDotsAndBoxes("");
    showBoardSectionDotsAndBoxes();
    buildDotsAndBoxesBoardDOM();
    updateDotsAndBoxesBoard();
    updateGameLabelsDotsAndBoxes();
    if (AppStateDotsAndBoxes.mode === "offline-ai" && AppStateDotsAndBoxes.state.turn !== AppStateDotsAndBoxes.humanPlayer) {
      setStatusDotsAndBoxes("board-info", "Computer thinking…");
      setTimeout(aiTurnDotsAndBoxes, AiPacing.delay(300));
    } else {
      setStatusDotsAndBoxes("board-info", playerNameDotsAndBoxes(AppStateDotsAndBoxes.state.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function isHumanTurnDotsAndBoxes() {
  if (AppStateDotsAndBoxes.gameOver) return false;
  if (AppStateDotsAndBoxes.mode === "offline-ai" && AppStateDotsAndBoxes.state.turn !== AppStateDotsAndBoxes.humanPlayer) return false;
  return true;
}

function onDotsAndBoxesLineClick(move) {
  if (!isHumanTurnDotsAndBoxes()) {
    setStatusDotsAndBoxes("board-info", AppStateDotsAndBoxes.gameOver ? "Game is over. Start a new game to play again." : "Computer to move.");
    return;
  }
  if (!DotsAndBoxesCore.isLegalMove(AppStateDotsAndBoxes.state, move)) return; // already drawn - silently ignore
  applyDotsAndBoxesMove(move);
}

function applyDotsAndBoxesMove(move) {
  pushUndoSnapshotDotsAndBoxes();
  const mover = AppStateDotsAndBoxes.state.turn;
  const result = DotsAndBoxesCore.applyMove(AppStateDotsAndBoxes.state, move);
  AppStateDotsAndBoxes.state = result.state;
  AppStateDotsAndBoxes.moveCount++;
  AppStateDotsAndBoxes.lastMove = { type: move.type, r: move.r, c: move.c };
  const scored = result.boxesCompleted.length > 0;
  updateDotsAndBoxesBoard();
  updateGameLabelsDotsAndBoxes();

  if (AppStateDotsAndBoxes.state.gameOver) {
    AppStateDotsAndBoxes.gameOver = true;
    const winner = AppStateDotsAndBoxes.state.winner;
    const scores = AppStateDotsAndBoxes.state.scores;
    const scoreLine = "Player 1: " + scores["1"] + " · Player 2: " + scores["2"] + ".";
    const message = winner === "draw"
      ? "It's a draw - " + scoreLine
      : playerNameDotsAndBoxes(winner) + " wins! " + scoreLine;
    announceGameResultDotsAndBoxes(resultTitleDotsAndBoxes(winner), message);
    recordDotsAndBoxesStatsIfVsAi(winner === "draw" ? "draw" : (winner === AppStateDotsAndBoxes.humanPlayer ? "win" : "loss"));
    updateGameLabelsDotsAndBoxes();
    return;
  }

  const nextTurn = AppStateDotsAndBoxes.state.turn;
  if (scored) {
    setStatusDotsAndBoxes("board-info", playerNameDotsAndBoxes(mover) + " completed a box and goes again.");
  } else {
    setStatusDotsAndBoxes("board-info", playerNameDotsAndBoxes(mover) + " played. " + playerNameDotsAndBoxes(nextTurn) + " to move.");
  }

  maybeTriggerAiTurnDotsAndBoxes();
}

function maybeTriggerAiTurnDotsAndBoxes() {
  if (AppStateDotsAndBoxes.gameOver) return;
  if (AppStateDotsAndBoxes.mode === "offline-ai" && AppStateDotsAndBoxes.state.turn !== AppStateDotsAndBoxes.humanPlayer) {
    setStatusDotsAndBoxes("board-info", "Computer thinking…");
    setTimeout(aiTurnDotsAndBoxes, AiPacing.delay(350));
  }
}

function aiTurnDotsAndBoxes() {
  if (AppStateDotsAndBoxes.mode !== "offline-ai" || AppStateDotsAndBoxes.gameOver) return;
  const aiPlayer = DotsAndBoxesCore.otherPlayer(AppStateDotsAndBoxes.humanPlayer);
  if (AppStateDotsAndBoxes.state.turn !== aiPlayer) return;

  const move = DotsAndBoxesAi.chooseMove(AppStateDotsAndBoxes.state, aiPlayer, AppStateDotsAndBoxes.aiLevel);
  if (!move) return;
  applyDotsAndBoxesMove(move);
}

function undoLastMove() {
  if (!AppStateDotsAndBoxes.undoStack || !AppStateDotsAndBoxes.undoStack.length) return;
  let prev = AppStateDotsAndBoxes.undoStack.pop();
  if (AppStateDotsAndBoxes.mode === "offline-ai") {
    while (prev.state.turn !== AppStateDotsAndBoxes.humanPlayer && AppStateDotsAndBoxes.undoStack.length) {
      prev = AppStateDotsAndBoxes.undoStack.pop();
    }
  }
  AppStateDotsAndBoxes.state = prev.state;
  AppStateDotsAndBoxes.gameOver = prev.gameOver;
  AppStateDotsAndBoxes.moveCount = prev.moveCount;
  AppStateDotsAndBoxes.lastMove = null;
  setGameResultDotsAndBoxes("");
  updateDotsAndBoxesBoard();
  updateGameLabelsDotsAndBoxes();
  setStatusDotsAndBoxes("board-info", "Move undone. " + playerNameDotsAndBoxes(AppStateDotsAndBoxes.state.turn) + " to move.");
}

function showBoardSectionDotsAndBoxes() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Board rendering: percentage-based absolute positioning (the same
     technique as Go's and WallMaze's boards), since line segments need
     clickable targets BETWEEN dots, not just on them. The grid size
     comes from the running game's state. ***/

// Geometry of the current board, all in % of the board's width:
// step - one box; hit - thickness of a line's clickable area: 0.6 of a
// box, capped at 12 %, so neighbouring parallel lines never overlap
// (they are a whole box apart). At 632 px that is 44 px even on 8x8.
function dabGeometry() {
  const dots = DotsAndBoxesCore.dotsOf(AppStateDotsAndBoxes.state);
  const boxes = dots - 1;
  const step = 100 / boxes;
  return { dots, boxes, step, hit: Math.min(12, step * 0.6) };
}
// Marks for completed boxes: inline SVG rather than text glyphs, so they
// don't depend on the reader's font.
const DAB_MARK_X = '<svg class="dab-box-mark" viewBox="0 0 100 100" aria-hidden="true">' +
  '<line x1="28" y1="28" x2="72" y2="72"/><line x1="72" y1="28" x2="28" y2="72"/></svg>';
const DAB_MARK_O = '<svg class="dab-box-mark" viewBox="0 0 100 100" aria-hidden="true">' +
  '<circle cx="50" cy="50" r="23"/></svg>';

// Places a hit-area bar of `thickness` around the line at `centerPct`.
// Edge lines would stick out past the board, so their bar is moved
// inwards instead - full thickness, flush with the border, never
// reaching the next parallel line (the bar is at most 0.6 of a box
// thick, so it ends by 0.6 of a box; the next one starts at 0.7).
// `mid` is where the line itself sits inside the bar, in % of the bar.
function dabPlaceBar(centerPct, thickness) {
  let start = centerPct - thickness / 2;
  if (start < 0) start = 0;
  if (start + thickness > 100) start = 100 - thickness;
  return { start, size: thickness, mid: (centerPct - start) / thickness * 100 };
}

// Around every dot a horizontal and a vertical hit area cross, and the
// vertical one (added later) lies on top - left alone it would swallow
// the ends of the horizontal lines, on 8x8 most of them. So a tap that
// falls inside several hit areas goes to the undrawn line drawn closest
// to it: along a line the whole length is that line's, across its
// middle the full hit area. Keyboard activation (no pointer position)
// keeps the focused line.
function dabTapTarget(e, own) {
  if (!e || !e.detail) return own;
  const boardEl = document.getElementById("dotsandboxes-board");
  const rect = boardEl.getBoundingClientRect();
  if (!boardEl.clientWidth || !boardEl.clientHeight) return own;
  const x = (e.clientX - rect.left - boardEl.clientLeft) / boardEl.clientWidth * 100;
  const y = (e.clientY - rect.top - boardEl.clientTop) / boardEl.clientHeight * 100;
  const g = dabGeometry();
  const state = AppStateDotsAndBoxes.state;
  const candidates = [];
  // Horizontal lines of the box column under the tap and vertical lines
  // of its box row whose hit area holds the tap; distance is measured to
  // the line itself.
  const c = Math.min(g.boxes - 1, Math.max(0, Math.floor(x / g.step)));
  const r = Math.min(g.boxes - 1, Math.max(0, Math.floor(y / g.step)));
  for (let i = 0; i < g.dots; i++) {
    const bar = dabPlaceBar(i * g.step, g.hit);
    const line = i * g.step;
    if (y >= bar.start && y <= bar.start + bar.size) candidates.push({ move: { type: "h", r: i, c }, d: Math.abs(y - line) });
    if (x >= bar.start && x <= bar.start + bar.size) candidates.push({ move: { type: "v", r, c: i }, d: Math.abs(x - line) });
  }
  let best = null;
  candidates.forEach((cand) => {
    if (!DotsAndBoxesCore.isLegalMove(state, cand.move)) return;
    if (!best || cand.d < best.d) best = cand;
  });
  return best ? best.move : own;
}

function buildDotsAndBoxesBoardDOM() {
  const boardEl = document.getElementById("dotsandboxes-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const g = dabGeometry();
  const DAB_DOTS = g.dots, DAB_BOXES = g.boxes, DAB_STEP = g.step, DAB_LINE_HIT = g.hit;
  boardEl.dataset.boxes = DAB_BOXES;

  // Box fill layer first (bottom), so lines and dots draw on top of it.
  for (let br = 0; br < DAB_BOXES; br++) {
    for (let bc = 0; bc < DAB_BOXES; bc++) {
      const box = document.createElement("div");
      box.className = "dab-box";
      box.dataset.row = br;
      box.dataset.col = bc;
      box.style.left = (bc * DAB_STEP) + "%";
      box.style.top = (br * DAB_STEP) + "%";
      box.style.width = DAB_STEP + "%";
      box.style.height = DAB_STEP + "%";
      box.setAttribute("aria-hidden", "true");
      boardEl.appendChild(box);
    }
  }

  // Horizontal lines.
  for (let r = 0; r < DAB_DOTS; r++) {
    for (let c = 0; c < DAB_DOTS - 1; c++) {
      const bar = dabPlaceBar(r * DAB_STEP, DAB_LINE_HIT);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dab-line dab-line-h";
      btn.dataset.type = "h";
      btn.dataset.r = r;
      btn.dataset.c = c;
      btn.style.left = (c * DAB_STEP) + "%";
      btn.style.width = DAB_STEP + "%";
      btn.style.top = bar.start + "%";
      btn.style.height = bar.size + "%";
      const inner = document.createElement("span");
      inner.className = "dab-line-bar dab-line-bar-h";
      inner.style.top = bar.mid + "%";
      btn.appendChild(inner);
      btn.addEventListener("click", (e) => onDotsAndBoxesLineClick(dabTapTarget(e, { type: "h", r, c })));
      boardEl.appendChild(btn);
    }
  }

  // Vertical lines.
  for (let r = 0; r < DAB_DOTS - 1; r++) {
    for (let c = 0; c < DAB_DOTS; c++) {
      const bar = dabPlaceBar(c * DAB_STEP, DAB_LINE_HIT);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dab-line dab-line-v";
      btn.dataset.type = "v";
      btn.dataset.r = r;
      btn.dataset.c = c;
      btn.style.top = (r * DAB_STEP) + "%";
      btn.style.height = DAB_STEP + "%";
      btn.style.left = bar.start + "%";
      btn.style.width = bar.size + "%";
      const inner = document.createElement("span");
      inner.className = "dab-line-bar dab-line-bar-v";
      inner.style.left = bar.mid + "%";
      btn.appendChild(inner);
      btn.addEventListener("click", (e) => onDotsAndBoxesLineClick(dabTapTarget(e, { type: "v", r, c })));
      boardEl.appendChild(btn);
    }
  }

  // Dots on top of everything, purely decorative.
  for (let r = 0; r < DAB_DOTS; r++) {
    for (let c = 0; c < DAB_DOTS; c++) {
      const dot = document.createElement("span");
      dot.className = "dab-dot";
      dot.style.left = (c * DAB_STEP) + "%";
      dot.style.top = (r * DAB_STEP) + "%";
      dot.setAttribute("aria-hidden", "true");
      boardEl.appendChild(dot);
    }
  }

  ensureDotsAndBoxesBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureDotsAndBoxesBoardSquare);
  } else {
    setTimeout(ensureDotsAndBoxesBoardSquare, 0);
  }
  ensureDotsAndBoxesResizeHandler();
}

let einkDotsAndBoxesResizeHandlerAttached = false;
let einkDotsAndBoxesResizeTimeoutId = null;

function ensureDotsAndBoxesBoardSquare() {
  const boardEl = document.getElementById("dotsandboxes-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureDotsAndBoxesResizeHandler() {
  if (einkDotsAndBoxesResizeHandlerAttached) return;
  einkDotsAndBoxesResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkDotsAndBoxesResizeTimeoutId !== null) clearTimeout(einkDotsAndBoxesResizeTimeoutId);
    einkDotsAndBoxesResizeTimeoutId = setTimeout(() => {
      einkDotsAndBoxesResizeTimeoutId = null;
      ensureDotsAndBoxesBoardSquare();
    }, 150);
  });
}

function updateDotsAndBoxesBoard() {
  const boardEl = document.getElementById("dotsandboxes-board");
  if (!boardEl) return;
  const state = AppStateDotsAndBoxes.state;
  const canAct = isHumanTurnDotsAndBoxes();

  boardEl.querySelectorAll(".dab-box").forEach((box) => {
    const r = parseInt(box.dataset.row, 10);
    const c = parseInt(box.dataset.col, 10);
    const owner = state.boxes[r][c];
    const mark = owner === "1" ? "x" : owner === "2" ? "o" : "";
    if (box.dataset.mark === mark) return; // unchanged - avoid needless e-ink redraws
    box.dataset.mark = mark;
    box.classList.remove("dab-box-p1", "dab-box-p2");
    if (owner === "1") { box.classList.add("dab-box-p1"); box.innerHTML = DAB_MARK_X; }
    else if (owner === "2") { box.classList.add("dab-box-p2"); box.innerHTML = DAB_MARK_O; }
    else { box.innerHTML = ""; }
  });

  const lm = AppStateDotsAndBoxes.lastMove;

  boardEl.querySelectorAll(".dab-line").forEach((btn) => {
    const type = btn.dataset.type;
    const r = parseInt(btn.dataset.r, 10);
    const c = parseInt(btn.dataset.c, 10);
    const move = { type, r, c };
    const owner = type === "h" ? state.hLines[r][c] : state.vLines[r][c];
    btn.classList.toggle("dab-line-drawn", !!owner);
    // Who drew it, told apart by shape: solid for Player 1, dotted for 2.
    btn.classList.toggle("dab-line-p1", owner === "1");
    btn.classList.toggle("dab-line-p2", owner === "2");
    btn.classList.toggle("dab-line-last", !!lm && lm.type === type && lm.r === r && lm.c === c);
    btn.disabled = !!owner || !canAct;

    const orientation = type === "h" ? "Horizontal" : "Vertical";
    let label = orientation + " line, row " + (r + 1) + ", column " + (c + 1);
    label += owner ? ", drawn by " + playerNameDotsAndBoxes(owner) : ", empty";
    I18n.setAria(btn, label);
  });

  updateScoreLineDotsAndBoxes();
}

function updateScoreLineDotsAndBoxes() {
  const container = document.getElementById("score-line");
  const scoreEl = document.getElementById("score-captures");
  if (!container || !scoreEl) return;
  const state = AppStateDotsAndBoxes.state;
  const active = AppStateDotsAndBoxes.moveCount > 0 || state.scores["1"] > 0 || state.scores["2"] > 0;
  if (!active) {
    container.classList.add("hidden");
    scoreEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(scoreEl, "Boxes – Player 1: " + state.scores["1"] + " · Player 2: " + state.scores["2"]);
}

function updateGameLabelsDotsAndBoxes() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateDotsAndBoxes.moveCount ? "Move " + AppStateDotsAndBoxes.moveCount : "");
  updateUndoButtonVisibilityDotsAndBoxes();
  updateResignVisibilityDotsAndBoxes();

  if (AppStateDotsAndBoxes.gameOver) clearSavedDotsAndBoxesGame();
  else saveDotsAndBoxesGame();
}

function updateUndoButtonVisibilityDotsAndBoxes() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateDotsAndBoxes.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateDotsAndBoxes.gameOver));
}

function updateResignVisibilityDotsAndBoxes() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateDotsAndBoxes.gameOver);
}

document.addEventListener("DOMContentLoaded", initDotsAndBoxesApp);
