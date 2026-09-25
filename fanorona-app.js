// fanorona-app.js
// Wires FanoronaCore/FanoronaAi to the fanorona.html UI. The board isn't a
// plain rectangular grid - points sit on a 5x9 grid where roughly half of
// them ("strong" points) also connect diagonally - so it's rendered with
// the same percentage-based absolute-positioning technique used for
// Quoridor/Hex/Go (a JS-enforced non-square aspect ratio, since the board
// is noticeably wider than tall), with the point-to-point connections
// drawn as a single non-interactive SVG layer UNDER the point buttons,
// the way morris-app.js draws Nine Men's Morris's fixed board lines (SVG
// rather than rotated divs, since about half of Fanorona's lines are
// diagonal).
//
// Fanorona's capture rules are unusual enough to need their own
// interaction model beyond plain tap-to-select-then-tap-to-move:
//   - A single slide can be legal as BOTH an approach and a withdrawal
//     capture at once; when that happens the player is asked to choose
//     one explicitly (see AppStateFanorona.pendingChoice).
//   - After a capture, the same piece may - but, verified against the
//     real rules (see fanorona-core.js's header comment), is never
//     forced to - keep capturing further in a new direction. While a
//     chain is in progress (AppStateFanorona.chain), only that piece's
//     further legal captures are highlighted, and a "Done capturing"
//     button lets the player stop; tapping a highlighted destination
//     instead continues the chain.

const AppStateFanorona = {
  mode: "offline",        // "offline" | "offline-ai"
  board: FanoronaCore.createInitialBoard(),
  turn: "w",              // "b" | "w" - White always moves first in Fanorona
  selected: null,         // point index while choosing a move's destination
  chain: null,            // { atIndex, visited: [idx,...], lastDirIndex, steps: [...] } while a capture chain is in progress
  pendingChoice: null,    // { isFirstStep, options: [move, move] } when a slide is both an approach and a withdrawal
  lastMove: null,         // { from, to } for highlighting
  humanColor: "w",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  captures: { b: 0, w: 0 } // pieces captured BY black / BY white
};

const FANORONA_SAVE_KEY = "einkchess_save_fanorona";

function saveFanoronaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(FANORONA_SAVE_KEY, {
    mode: AppStateFanorona.mode,
    board: AppStateFanorona.board,
    turn: AppStateFanorona.turn,
    chain: AppStateFanorona.chain,
    pendingChoice: AppStateFanorona.pendingChoice,
    lastMove: AppStateFanorona.lastMove,
    humanColor: AppStateFanorona.humanColor,
    aiLevel: AppStateFanorona.aiLevel,
    moveCount: AppStateFanorona.moveCount,
    captures: AppStateFanorona.captures
  });
}

function clearSavedFanoronaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(FANORONA_SAVE_KEY);
}

function recordFanoronaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateFanorona.mode !== "offline-ai") return;
  GameStats.record("fanorona", outcome);
}

function colorNameFanorona(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusFanorona(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultFanorona(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// Builds a short, prominent modal title. In local 2-player games there's no
// single "you", so it's color-based; against the built-in AI it's framed
// from the human's perspective, which is more immediately meaningful -
// the same resultTitle<Game> convention every 2-player game here follows.
function resultTitleFanorona(winner) {
  if (AppStateFanorona.mode === "offline-ai") {
    return winner === AppStateFanorona.humanColor ? "You win!" : "You lose";
  }
  return colorNameFanorona(winner) + " wins";
}

function announceGameResultFanorona(resultCode, message) {
  setGameResultFanorona(message);
  setStatusFanorona("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackFanorona() {
  AppStateFanorona.undoStack = [];
}

function pushUndoSnapshotFanorona() {
  AppStateFanorona.undoStack.push({
    board: FanoronaCore.cloneBoard(AppStateFanorona.board),
    turn: AppStateFanorona.turn,
    gameOver: AppStateFanorona.gameOver,
    moveCount: AppStateFanorona.moveCount,
    captures: { b: AppStateFanorona.captures.b, w: AppStateFanorona.captures.w },
    lastMove: AppStateFanorona.lastMove
  });
}

function initFanoronaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("fanorona-color-choice");
  const levelInline = document.getElementById("fanorona-level-inline");
  const startGameBtn = document.getElementById("start-fanorona-game");
  const resignBtn = document.getElementById("resign-button");
  const doneCapturingBtn = document.getElementById("fanorona-done-capturing-btn");
  const approachBtn = document.getElementById("fanorona-approach-btn");
  const withdrawalBtn = document.getElementById("fanorona-withdrawal-btn");

  function updateColorChoiceVisibility() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
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

  function startNewGame(mode, humanColor, level) {
    AppStateFanorona.mode = mode;
    AppStateFanorona.board = FanoronaCore.createInitialBoard();
    AppStateFanorona.turn = "w";
    AppStateFanorona.selected = null;
    AppStateFanorona.chain = null;
    AppStateFanorona.pendingChoice = null;
    AppStateFanorona.lastMove = null;
    AppStateFanorona.humanColor = humanColor;
    AppStateFanorona.aiLevel = level;
    AppStateFanorona.gameOver = false;
    AppStateFanorona.moveCount = 0;
    AppStateFanorona.captures = { b: 0, w: 0 };
    resetUndoStackFanorona();
    setGameResultFanorona("");
    showBoardSectionFanorona();
    buildFanoronaBoardDOM();
    updateFanoronaBoard();
    updateGameLabelsFanorona();

    if (mode === "offline-ai" && humanColor !== "w") {
      setStatusFanorona("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineFanorona, AiPacing.delay(10));
    } else {
      setStatusFanorona("board-info", colorNameFanorona(AppStateFanorona.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "w", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateFanorona.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusFanorona("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='fanorona-color']:checked");
    const humanColor = colorInput && colorInput.value === "black" ? "b" : "w";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "w", 0);
      setStatusFanorona("offline-fanorona-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusFanorona("offline-fanorona-status",
      "You play " + colorNameFanorona(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateFanorona.gameOver) return;
      const loser = AppStateFanorona.turn;
      const winner = FanoronaCore.otherColor(loser);
      AppStateFanorona.gameOver = true;
      AppStateFanorona.chain = null;
      AppStateFanorona.pendingChoice = null;
      announceGameResultFanorona(resultTitleFanorona(winner), colorNameFanorona(winner) + " wins by resignation.");
      recordFanoronaStatsIfVsAi("loss");
      updateGameLabelsFanorona();
    });
  }

  if (doneCapturingBtn) {
    doneCapturingBtn.addEventListener("click", doneCapturingFanorona);
  }
  if (approachBtn) {
    approachBtn.addEventListener("click", () => {
      const choice = AppStateFanorona.pendingChoice;
      if (!choice) return;
      const option = choice.options.find((o) => o.type === "approach");
      if (option) resolveFanoronaCaptureChoice(option);
    });
  }
  if (withdrawalBtn) {
    withdrawalBtn.addEventListener("click", () => {
      const choice = AppStateFanorona.pendingChoice;
      if (!choice) return;
      const option = choice.options.find((o) => o.type === "withdrawal");
      if (option) resolveFanoronaCaptureChoice(option);
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(FANORONA_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateFanorona.mode = savedGame.mode;
    AppStateFanorona.board = savedGame.board;
    AppStateFanorona.turn = savedGame.turn;
    AppStateFanorona.selected = null;
    AppStateFanorona.chain = savedGame.chain || null;
    AppStateFanorona.pendingChoice = savedGame.pendingChoice || null;
    AppStateFanorona.lastMove = savedGame.lastMove;
    AppStateFanorona.humanColor = savedGame.humanColor;
    AppStateFanorona.aiLevel = savedGame.aiLevel;
    AppStateFanorona.moveCount = savedGame.moveCount;
    AppStateFanorona.captures = savedGame.captures;
    AppStateFanorona.gameOver = false;
    resetUndoStackFanorona();
    setActiveModeButton(AppStateFanorona.mode);
    setGameResultFanorona("");
    showBoardSectionFanorona();
    buildFanoronaBoardDOM();
    updateFanoronaBoard();
    updateGameLabelsFanorona();
    if (AppStateFanorona.chain) {
      setStatusFanorona("board-info", colorNameFanorona(AppStateFanorona.turn) + " can continue capturing, or press Done.");
    } else if (AppStateFanorona.pendingChoice) {
      setStatusFanorona("board-info", colorNameFanorona(AppStateFanorona.turn) + " must choose approach or withdrawal above.");
    } else if (AppStateFanorona.mode === "offline-ai" && AppStateFanorona.turn !== AppStateFanorona.humanColor) {
      setStatusFanorona("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineFanorona, AiPacing.delay(10));
    } else {
      setStatusFanorona("board-info", colorNameFanorona(AppStateFanorona.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching checkers.html's behavior.
}

function isHumanTurnFanorona() {
  if (AppStateFanorona.gameOver) return false;
  if (AppStateFanorona.mode === "offline-ai" && AppStateFanorona.turn !== AppStateFanorona.humanColor) return false;
  return true;
}

function onFanoronaPointClick(i) {
  if (AppStateFanorona.gameOver) {
    setStatusFanorona("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnFanorona()) {
    setStatusFanorona("board-info", "Computer to move.");
    return;
  }
  if (AppStateFanorona.pendingChoice) {
    setStatusFanorona("board-info", "Choose approach or withdrawal above first.");
    return;
  }

  const board = AppStateFanorona.board;
  const turn = AppStateFanorona.turn;

  if (AppStateFanorona.chain) {
    const chain = AppStateFanorona.chain;
    if (i === chain.atIndex) return; // tapping the active piece itself does nothing
    const continuations = FanoronaCore.getChainContinuations(board, chain.atIndex, turn, new Set(chain.visited), chain.lastDirIndex);
    const matches = continuations.filter((c) => c.to === i);
    if (!matches.length) {
      setStatusFanorona("board-info", "Invalid move: continue capturing with the highlighted piece, or press Done.");
      return;
    }
    if (matches.length === 1) {
      applyChainStep(matches[0]);
    } else {
      AppStateFanorona.pendingChoice = { isFirstStep: false, options: matches };
      updateFanoronaBoard();
      setStatusFanorona("board-info", "Both an approach and a withdrawal capture are available - choose one above.");
    }
    return;
  }

  if (AppStateFanorona.selected === null) {
    if (board[i] !== turn) return;
    AppStateFanorona.selected = i;
    updateFanoronaBoard();
    return;
  }

  if (AppStateFanorona.selected === i) {
    AppStateFanorona.selected = null;
    updateFanoronaBoard();
    return;
  }

  if (board[i] === turn) {
    AppStateFanorona.selected = i;
    updateFanoronaBoard();
    return;
  }

  const legalMoves = FanoronaCore.getLegalMoves(board, turn);
  const matches = legalMoves.filter((m) => m.from === AppStateFanorona.selected && m.to === i);
  if (!matches.length) {
    const hadCaptures = legalMoves.some((m) => m.type !== "paika");
    setStatusFanorona("board-info", hadCaptures
      ? "Invalid move: a capture is available and must be taken."
      : "Invalid move.");
    AppStateFanorona.selected = null;
    updateFanoronaBoard();
    return;
  }

  AppStateFanorona.selected = null;
  pushUndoSnapshotFanorona();
  if (matches.length === 1) {
    applyFirstStep(matches[0]);
  } else {
    AppStateFanorona.pendingChoice = { isFirstStep: true, options: matches };
    updateFanoronaBoard();
    setStatusFanorona("board-info", "Both an approach and a withdrawal capture are available - choose one above.");
  }
}

function resolveFanoronaCaptureChoice(option) {
  const wasFirstStep = AppStateFanorona.pendingChoice && AppStateFanorona.pendingChoice.isFirstStep;
  AppStateFanorona.pendingChoice = null;
  if (wasFirstStep) {
    applyFirstStep(option);
  } else {
    applyChainStep(option);
  }
}

function applyFirstStep(move) {
  const mover = AppStateFanorona.turn;
  AppStateFanorona.board = FanoronaCore.applyStep(AppStateFanorona.board, move.from, move.to, move.captured);
  AppStateFanorona.captures[mover] += move.captured.length;
  if (move.type === "paika") {
    finalizeFanoronaTurn([move]);
    return;
  }
  AppStateFanorona.chain = { atIndex: move.to, visited: [move.from, move.to], lastDirIndex: move.dirIndex, steps: [move] };
  continueOrFinalizeFanoronaChain();
}

function applyChainStep(move) {
  const mover = AppStateFanorona.turn;
  const chain = AppStateFanorona.chain;
  AppStateFanorona.board = FanoronaCore.applyStep(AppStateFanorona.board, chain.atIndex, move.to, move.captured);
  AppStateFanorona.captures[mover] += move.captured.length;
  chain.steps.push(move);
  chain.visited.push(move.to);
  chain.lastDirIndex = move.dirIndex;
  chain.atIndex = move.to;
  continueOrFinalizeFanoronaChain();
}

// After every capturing step: if the same piece has a further legal
// capture, the chain stays open (the player may continue or press Done -
// continuing is never forced, per the verified real rules); otherwise the
// turn ends automatically since there is nothing left to choose.
function continueOrFinalizeFanoronaChain() {
  const chain = AppStateFanorona.chain;
  const continuations = FanoronaCore.getChainContinuations(
    AppStateFanorona.board, chain.atIndex, AppStateFanorona.turn, new Set(chain.visited), chain.lastDirIndex
  );
  if (!continuations.length) {
    const steps = chain.steps;
    AppStateFanorona.chain = null;
    finalizeFanoronaTurn(steps);
    return;
  }
  updateFanoronaBoard();
  updateGameLabelsFanorona();
  saveFanoronaGame();
  setStatusFanorona("board-info", colorNameFanorona(AppStateFanorona.turn) + " captured - continue with this piece, or press Done.");
}

function doneCapturingFanorona() {
  if (!AppStateFanorona.chain) return;
  const steps = AppStateFanorona.chain.steps;
  AppStateFanorona.chain = null;
  finalizeFanoronaTurn(steps);
}

function finalizeFanoronaTurn(steps) {
  const mover = AppStateFanorona.turn;
  AppStateFanorona.lastMove = { from: steps[0].from, to: steps[steps.length - 1].to };
  AppStateFanorona.moveCount++;
  AppStateFanorona.turn = FanoronaCore.otherColor(mover);
  updateFanoronaBoard();
  updateGameLabelsFanorona();

  const end = FanoronaCore.detectGameEnd(AppStateFanorona.board, AppStateFanorona.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameFanorona(end.winner);
    const reason = end.status === "no-pieces" ? "no pieces left" : "no legal moves";
    AppStateFanorona.gameOver = true;
    announceGameResultFanorona(resultTitleFanorona(end.winner), winnerName + " wins (" + reason + ").");
    recordFanoronaStatsIfVsAi(end.winner === AppStateFanorona.humanColor ? "win" : "loss");
    updateGameLabelsFanorona();
    return;
  }

  setStatusFanorona("board-info", colorNameFanorona(mover) + " played. " + colorNameFanorona(AppStateFanorona.turn) + " to move.");

  if (AppStateFanorona.mode === "offline-ai" && !AppStateFanorona.gameOver && AppStateFanorona.turn !== AppStateFanorona.humanColor) {
    setStatusFanorona("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineFanorona, AiPacing.delay(250));
  }
}

function aiMoveOfflineFanorona() {
  if (AppStateFanorona.mode !== "offline-ai" || AppStateFanorona.gameOver) return;
  const aiColor = FanoronaCore.otherColor(AppStateFanorona.humanColor);
  if (AppStateFanorona.turn !== aiColor) return;

  const move = FanoronaAi.chooseMove(AppStateFanorona.board, aiColor, AppStateFanorona.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss

  pushUndoSnapshotFanorona();
  let board = AppStateFanorona.board;
  move.steps.forEach((step) => {
    board = FanoronaCore.applyStep(board, step.from, step.to, step.captured);
    AppStateFanorona.captures[aiColor] += step.captured.length;
  });
  AppStateFanorona.board = board;
  finalizeFanoronaTurn(move.steps);
}

function undoLastMove() {
  if (!AppStateFanorona.undoStack || !AppStateFanorona.undoStack.length) return;
  let prev = AppStateFanorona.undoStack.pop();
  if (AppStateFanorona.mode === "offline-ai") {
    while (prev.turn !== AppStateFanorona.humanColor && AppStateFanorona.undoStack.length) {
      prev = AppStateFanorona.undoStack.pop();
    }
  }
  AppStateFanorona.board = prev.board;
  AppStateFanorona.turn = prev.turn;
  AppStateFanorona.gameOver = prev.gameOver;
  AppStateFanorona.moveCount = prev.moveCount;
  AppStateFanorona.captures = prev.captures;
  AppStateFanorona.lastMove = prev.lastMove;
  AppStateFanorona.selected = null;
  AppStateFanorona.chain = null;
  AppStateFanorona.pendingChoice = null;
  setGameResultFanorona("");
  updateFanoronaBoard();
  updateGameLabelsFanorona();
  setStatusFanorona("board-info", "Move undone.");
}

function showBoardSectionFanorona() {
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

/*** Board geometry and rendering ***
 * Percentage-based absolute positioning (the same technique as Go's/
 * Quoridor's/Hex's boards): points sit on a UNIT-spaced grid with a PAD
 * margin on every side, so a point never touches the board's own edge.
 * Because the board is 9 columns by 5 rows (wider than tall), the width
 * and height percentages are computed against different totals - the
 * same trick hex-app.js uses for its own non-square board - which keeps
 * points circular and diagonals at their true angle once the container's
 * own height is JS-enforced to TOTAL_H/TOTAL_W times its width.
 */
const FANORONA_UNIT = 100;
const FANORONA_PAD = 55;
const FANORONA_TOTAL_W = (FanoronaCore.COLS - 1) * FANORONA_UNIT + FANORONA_PAD * 2;
const FANORONA_TOTAL_H = (FanoronaCore.ROWS - 1) * FANORONA_UNIT + FANORONA_PAD * 2;
const FANORONA_ASPECT = FANORONA_TOTAL_H / FANORONA_TOTAL_W;
const FANORONA_POINT_SIZE = 62;

function fanoronaPointX(c) {
  return FANORONA_PAD + c * FANORONA_UNIT;
}
function fanoronaPointY(r) {
  return FANORONA_PAD + r * FANORONA_UNIT;
}
function fanoronaPct(value, total) {
  return (value / total * 100) + "%";
}

const SVG_NS = "http://www.w3.org/2000/svg";

function buildFanoronaBoardDOM() {
  const boardEl = document.getElementById("fanorona-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "fanorona-lines");
  svg.setAttribute("viewBox", "0 0 " + FANORONA_TOTAL_W + " " + FANORONA_TOTAL_H);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  const seenEdges = new Set();
  for (let i = 0; i < FanoronaCore.TOTAL_POINTS; i++) {
    FanoronaCore.NEIGHBORS[i].forEach(({ to }) => {
      if (to <= i) return;
      const key = i + "-" + to;
      if (seenEdges.has(key)) return;
      seenEdges.add(key);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", fanoronaPointX(FanoronaCore.colOf(i)));
      line.setAttribute("y1", fanoronaPointY(FanoronaCore.rowOf(i)));
      line.setAttribute("x2", fanoronaPointX(FanoronaCore.colOf(to)));
      line.setAttribute("y2", fanoronaPointY(FanoronaCore.rowOf(to)));
      svg.appendChild(line);
    });
  }
  boardEl.appendChild(svg);

  for (let i = 0; i < FanoronaCore.TOTAL_POINTS; i++) {
    const r = FanoronaCore.rowOf(i), c = FanoronaCore.colOf(i);
    const point = document.createElement("button");
    point.type = "button";
    point.className = "fanorona-point";
    point.style.left = fanoronaPct(fanoronaPointX(c), FANORONA_TOTAL_W);
    point.style.top = fanoronaPct(fanoronaPointY(r), FANORONA_TOTAL_H);
    point.style.width = fanoronaPct(FANORONA_POINT_SIZE, FANORONA_TOTAL_W);
    point.style.height = fanoronaPct(FANORONA_POINT_SIZE, FANORONA_TOTAL_H);
    point.dataset.point = i;
    const piece = document.createElement("span");
    piece.className = "fanorona-piece";
    point.appendChild(piece);
    point.addEventListener("click", () => onFanoronaPointClick(i));
    boardEl.appendChild(point);
  }

  ensureFanoronaBoardAspect();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureFanoronaBoardAspect);
  } else {
    setTimeout(ensureFanoronaBoardAspect, 0);
  }
  ensureFanoronaResizeHandler();
}

let einkFanoronaResizeHandlerAttached = false;
let einkFanoronaResizeTimeoutId = null;

function ensureFanoronaBoardAspect() {
  const boardEl = document.getElementById("fanorona-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * FANORONA_ASPECT) + "px";
}

function ensureFanoronaResizeHandler() {
  if (einkFanoronaResizeHandlerAttached) return;
  einkFanoronaResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkFanoronaResizeTimeoutId !== null) clearTimeout(einkFanoronaResizeTimeoutId);
    einkFanoronaResizeTimeoutId = setTimeout(() => {
      einkFanoronaResizeTimeoutId = null;
      ensureFanoronaBoardAspect();
    }, 150);
  });
}

function updateFanoronaBoard() {
  const boardEl = document.getElementById("fanorona-board");
  if (!boardEl) return;

  const board = AppStateFanorona.board;
  const turn = AppStateFanorona.turn;
  const chain = AppStateFanorona.chain;
  const pendingChoice = AppStateFanorona.pendingChoice;

  let highlightSet = new Set();
  let activeIndex = null;

  if (AppStateFanorona.gameOver) {
    // no highlighting once the game has ended
  } else if (pendingChoice) {
    highlightSet = new Set(pendingChoice.options.map((o) => o.to));
    activeIndex = pendingChoice.isFirstStep ? AppStateFanorona.selected : (chain ? chain.atIndex : null);
  } else if (chain) {
    activeIndex = chain.atIndex;
    const continuations = FanoronaCore.getChainContinuations(board, chain.atIndex, turn, new Set(chain.visited), chain.lastDirIndex);
    highlightSet = new Set(continuations.map((c) => c.to));
  } else if (AppStateFanorona.selected !== null && isHumanTurnFanorona()) {
    activeIndex = AppStateFanorona.selected;
    const legalMoves = FanoronaCore.getLegalMoves(board, turn);
    highlightSet = new Set(legalMoves.filter((m) => m.from === AppStateFanorona.selected).map((m) => m.to));
  } else if (isHumanTurnFanorona()) {
    const legalMoves = FanoronaCore.getLegalMoves(board, turn);
    highlightSet = new Set(legalMoves.map((m) => m.from));
  }

  boardEl.querySelectorAll(".fanorona-point").forEach((pt) => {
    const i = parseInt(pt.dataset.point, 10);
    const piece = board[i];
    const pieceEl = pt.querySelector(".fanorona-piece");
    if (pieceEl) {
      pieceEl.classList.remove("fanorona-piece-black", "fanorona-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "fanorona-piece-black" : "fanorona-piece-white");
    }

    const isActive = activeIndex === i;
    pt.classList.toggle("fanorona-point-selected", isActive);
    pt.classList.toggle("fanorona-point-movable", highlightSet.has(i));
    pt.classList.toggle("last-move", !!(AppStateFanorona.lastMove &&
      (AppStateFanorona.lastMove.from === i || AppStateFanorona.lastMove.to === i)));

    const r = FanoronaCore.rowOf(i), c = FanoronaCore.colOf(i);
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      label += ", " + (piece === "b" ? "Black" : "White") + " piece";
    } else {
      label += ", empty";
    }
    if (isActive) label += ", selected";
    else if (highlightSet.has(i)) label += ", movable";
    I18n.setAria(pt, label);
  });

  ensureFanoronaBoardAspect();
  updateFanoronaCaptureChoiceUI();
  updateFanoronaChainControlsUI();
  updateScoreLineFanorona();
}

function updateFanoronaCaptureChoiceUI() {
  const container = document.getElementById("fanorona-capture-choice");
  const approachBtn = document.getElementById("fanorona-approach-btn");
  const withdrawalBtn = document.getElementById("fanorona-withdrawal-btn");
  if (!container || !approachBtn || !withdrawalBtn) return;
  const choice = AppStateFanorona.pendingChoice;
  container.classList.toggle("hidden", !choice);
  if (!choice) return;
  const t = window.I18n ? window.I18n.t : (key) => key;
  approachBtn.textContent = t("fanorona_capture_approach_btn");
  withdrawalBtn.textContent = t("fanorona_capture_withdrawal_btn");
}

function updateFanoronaChainControlsUI() {
  const container = document.getElementById("fanorona-chain-controls");
  if (!container) return;
  const show = !!AppStateFanorona.chain && !AppStateFanorona.pendingChoice && !AppStateFanorona.gameOver;
  container.classList.toggle("hidden", !show);
  const label = document.getElementById("fanorona-chain-label");
  const doneBtn = document.getElementById("fanorona-done-capturing-btn");
  if (label && window.I18n) label.textContent = window.I18n.t("fanorona_continue_capturing");
  if (doneBtn && window.I18n) doneBtn.textContent = window.I18n.t("fanorona_done_capturing_btn");
}

function updateScoreLineFanorona() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const active = AppStateFanorona.moveCount > 0 || AppStateFanorona.captures.b > 0 || AppStateFanorona.captures.w > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(capturesEl, "Captured – Black: " + AppStateFanorona.captures.b + " · White: " + AppStateFanorona.captures.w);
}

function updateGameLabelsFanorona() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateFanorona.moveCount ? "Move " + AppStateFanorona.moveCount : "");
  updateUndoButtonVisibilityFanorona();
  updateResignVisibilityFanorona();

  if (AppStateFanorona.gameOver) clearSavedFanoronaGame();
  else saveFanoronaGame();
}

function updateUndoButtonVisibilityFanorona() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateFanorona.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateFanorona.gameOver));
}

function updateResignVisibilityFanorona() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateFanorona.gameOver);
}

document.addEventListener("DOMContentLoaded", initFanoronaApp);
