// xiangqi-app.js
// Wires XiangqiCore/XiangqiAi to the xiangqi.html UI. The board is a
// 9x10 point grid rendered the same way go-app.js renders its points
// and lines (absolute top/left percentages, never the `inset`
// shorthand, plus a JS-enforced square-per-cell height since
// `aspect-ratio` alone is silently ignored on some E-Ink browsers) -
// pieces sit ON intersections here too, not inside squares.
//
// The one feature unique to this game: a toggle between each piece's
// traditional Chinese character (which some E-Ink browsers may lack a
// CJK font for) and a Western-style pictorial symbol as a safe,
// always-legible fallback/preference. Both styles render the same
// neutral disc with red or black content - only what's inside changes -
// so switching styles never reflows the board.

const XQ_CLASSIC_CHARS = {
  r: { G: "帥", A: "仕", E: "相", H: "傌", R: "俥", C: "炮", P: "兵" },
  b: { G: "將", A: "士", E: "象", H: "馬", R: "車", C: "砲", P: "卒" }
};

const XQ_PIECE_NAMES = { G: "General", A: "Advisor", E: "Elephant", H: "Horse", R: "Chariot", C: "Cannon", P: "Soldier" };

// The symbol-style drawings (XQ_SYMBOL_SVG) are in xiangqi-pieces.js,
// which keeps their own license (CC BY-SA 4.0) apart from this file.

const AppStateXiangqi = {
  mode: "offline",        // "offline" | "offline-ai"
  board: XiangqiCore.createInitialBoard(),
  turn: "r",              // "r" | "b" - Red always moves first in Xiangqi
  selected: null,         // [r, c] | null
  lastMove: null,         // { from: [r,c], to: [r,c] } | null
  humanColor: "r",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  pieceStyle: "classic",  // "classic" | "symbols"
  moveHistory: [],
  // One entry per position reached, for the perpetual check/chase rule
  // (see repetitionVerdictXq): { ply, key, mover, forcing } where
  // forcing is "check", "chase" or null. Seeded with the position the
  // game (or a loaded game) starts from; undo trims it by ply.
  plyLog: []
};

const XQ_STYLE_KEY = "einkchess_xiangqi_piece_style";
const XQ_SAVE_KEY = "einkchess_save_xiangqi";

function xqCoord(rc) {
  return "abcdefghi".charAt(rc[1]) + (rc[0] + 1);
}

function recordMoveXq(color, from, to) {
  AppStateXiangqi.moveHistory.push({ color: color, from: xqCoord(from), to: xqCoord(to) });
  renderMoveListXq();
}

function resetMoveHistoryXq() {
  AppStateXiangqi.moveHistory = [];
  renderMoveListXq();
}

function renderMoveListXq() {
  const el = document.getElementById("moves-list");
  if (!el) return;
  const moves = AppStateXiangqi.moveHistory || [];
  if (!moves.length) {
    el.textContent = "";
    return;
  }
  el.textContent = moves.map((m) => m.from + "–" + m.to).join("; ");
  el.scrollLeft = el.scrollWidth;
}

function saveXiangqiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(XQ_SAVE_KEY, {
    mode: AppStateXiangqi.mode,
    board: AppStateXiangqi.board,
    turn: AppStateXiangqi.turn,
    lastMove: AppStateXiangqi.lastMove,
    humanColor: AppStateXiangqi.humanColor,
    aiLevel: AppStateXiangqi.aiLevel,
    moveCount: AppStateXiangqi.moveCount,
    moveHistory: AppStateXiangqi.moveHistory,
    undoStack: AppStateXiangqi.undoStack.slice(-50),
  });
}

function clearSavedXiangqiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(XQ_SAVE_KEY);
}

function recordXiangqiStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateXiangqi.mode !== "offline-ai") return;
  GameStats.record("xiangqi", outcome);
}

function colorNameXq(color) {
  return color === "r" ? "Red" : "Black";
}

function setStatusXq(elementId, text) {
  if (((AppStateXiangqi.mode === "offline-ai")) && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateXiangqi);
  }
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultXq(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleXq(winner) {
  if (AppStateXiangqi.mode === "offline-ai") {
    return winner === AppStateXiangqi.humanColor ? "You win!" : "You lose";
  }
  return colorNameXq(winner) + " wins";
}

function announceGameResultXq(resultCode, message) {
  setGameResultXq(message);
  setStatusXq("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackXq() {
  AppStateXiangqi.undoStack = [];
}

function resetPositionHistoryXq() {
  AppStateXiangqi.plyLog = [{
    ply: AppStateXiangqi.moveCount,
    key: XiangqiCore.positionKey(AppStateXiangqi.board, AppStateXiangqi.turn),
    mover: null,
    forcing: null
  }];
}

// The perpetual check / perpetual chase rule, in the simplified form most
// Xiangqi programs use: when `move` would bring about the same position a
// third time, look at every move since its first occurrence. A side that
// gave check or started chasing an undefended piece with each of its moves
// there - while the other side did not - must vary, so the move is
// refused. If both sides or neither side kept forcing, it's a draw.
// Returns null (play on), { forbidden: "check" | "chase" } or { draw: true }.
function repetitionVerdictXq(move, mover) {
  const log = AppStateXiangqi.plyLog || [];
  const other = XiangqiCore.otherColor(mover);
  const next = XiangqiCore.applyMove(AppStateXiangqi.board, move);
  const key = XiangqiCore.positionKey(next, other);
  let firstIdx = -1;
  let occurrences = 1;
  for (let i = 0; i < log.length; i++) {
    if (log[i].key !== key) continue;
    if (firstIdx < 0) firstIdx = i;
    occurrences++;
  }
  if (occurrences < 3) return null;

  const span = log.slice(firstIdx + 1).concat([{ mover, forcing: XiangqiCore.forcingKind(AppStateXiangqi.board, move, mover) }]);
  const forcingMoves = (color) => {
    const own = span.filter((e) => e.mover === color);
    return own.length && own.every((e) => e.forcing) ? own : null;
  };
  const moverForcing = forcingMoves(mover);
  const otherForcing = forcingMoves(other);
  if (moverForcing && !otherForcing) {
    return { forbidden: moverForcing.every((e) => e.forcing === "check") ? "check" : "chase" };
  }
  if (otherForcing && !moverForcing) return null;
  return { draw: true };
}

function isMoveAllowedXq(move, mover) {
  const verdict = repetitionVerdictXq(move, mover);
  return !(verdict && verdict.forbidden);
}

function pushUndoSnapshotXq() {
  AppStateXiangqi.undoStack.push({
    board: XiangqiCore.cloneBoard(AppStateXiangqi.board),
    turn: AppStateXiangqi.turn,
    gameOver: AppStateXiangqi.gameOver,
    moveCount: AppStateXiangqi.moveCount,
    lastMove: AppStateXiangqi.lastMove
  });
}

function loadPieceStylePref() {
  try {
    const saved = window.localStorage && window.localStorage.getItem(XQ_STYLE_KEY);
    if (saved === "classic" || saved === "symbols") AppStateXiangqi.pieceStyle = saved;
  } catch (e) { /* ignore - default style is fine */ }
}

function savePieceStylePref() {
  try {
    if (window.localStorage) window.localStorage.setItem(XQ_STYLE_KEY, AppStateXiangqi.pieceStyle);
  } catch (e) { /* ignore */ }
}

function initXiangqiApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("xiangqi-color-choice");
  const levelInline = document.getElementById("xiangqi-level-inline");
  const startGameBtn = document.getElementById("start-xiangqi-game");
  const resignBtn = document.getElementById("resign-button");
  const styleToggleBtn = document.getElementById("xiangqi-style-toggle");

  loadPieceStylePref();
  updateStyleToggleLabel();

  function updateColorChoiceVisibilityXq() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonXq(mode) {
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

  if (styleToggleBtn) {
    styleToggleBtn.addEventListener("click", () => {
      AppStateXiangqi.pieceStyle = AppStateXiangqi.pieceStyle === "classic" ? "symbols" : "classic";
      savePieceStylePref();
      updateStyleToggleLabel();
      updateXiangqiBoard();
    });
  }

  function updateStyleToggleLabel() {
    if (!styleToggleBtn) return;
    const key = AppStateXiangqi.pieceStyle === "classic" ? "xiangqi_style_show_symbols" : "xiangqi_style_show_classic";
    const fallback = AppStateXiangqi.pieceStyle === "classic" ? "Switch to symbols" : "Switch to characters";
    styleToggleBtn.textContent = (window.I18n ? window.I18n.t(key) : fallback) || fallback;
  }

  function startNewGameXq(mode, humanColor, level) {
    AppStateXiangqi.mode = mode;
    AppStateXiangqi.board = XiangqiCore.createInitialBoard();
    AppStateXiangqi.turn = "r";
    AppStateXiangqi.selected = null;
    AppStateXiangqi.lastMove = null;
    AppStateXiangqi.humanColor = humanColor;
    AppStateXiangqi.aiLevel = level;
    AppStateXiangqi.gameOver = false;
    AppStateXiangqi.moveCount = 0;
    resetUndoStackXq();
    resetMoveHistoryXq();
    resetPositionHistoryXq();
    setGameResultXq("");
    showBoardSectionXq();
    buildXiangqiBoardDOM();
    updateXiangqiBoard();
    updateGameLabelsXq();

    if (mode === "offline-ai" && humanColor !== "r") {
      setStatusXq("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineXq, AiPacing.delay(300));
    } else {
      setStatusXq("board-info", colorNameXq(AppStateXiangqi.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonXq("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameXq("offline", "r", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonXq("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateXiangqi.aiLevel || 2);
    updateColorChoiceVisibilityXq();
    setStatusXq("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityXq);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='xiangqi-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "black" ? "b" : "r", ["b", "r"]);

    if (level === 0) {
      setActiveModeButtonXq("offline-ai");
      startNewGameXq("offline", "r", 0);
      setStatusXq("offline-xiangqi-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonXq("offline-ai");
    startNewGameXq("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusXq("offline-xiangqi-status",
      RandomStart.label("You play " + colorNameXq(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateXiangqi.gameOver) return;
      const loser = UiStatus.resigner(AppStateXiangqi);
      const winner = XiangqiCore.otherColor(loser);
      AppStateXiangqi.gameOver = true;
      announceGameResultXq(resultTitleXq(winner), colorNameXq(winner) + " wins by resignation.");
      recordXiangqiStatsIfVsAi("loss");
      updateGameLabelsXq();
    });
  }

  const toggleMovesBtn = document.getElementById("toggle-moves");
  if (toggleMovesBtn) {
    toggleMovesBtn.addEventListener("click", () => {
      const list = document.getElementById("moves-list");
      if (!list) return;
      const isHidden = list.classList.contains("hidden");
      if (isHidden) {
        list.classList.remove("hidden");
        renderMoveListXq();
      } else {
        list.classList.add("hidden");
      }
    });
  }

  updateColorChoiceVisibilityXq();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(XQ_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateXiangqi.mode = savedGame.mode;
    AppStateXiangqi.board = savedGame.board;
    AppStateXiangqi.turn = savedGame.turn;
    AppStateXiangqi.selected = null;
    AppStateXiangqi.lastMove = savedGame.lastMove;
    AppStateXiangqi.humanColor = savedGame.humanColor;
    AppStateXiangqi.aiLevel = savedGame.aiLevel;
    AppStateXiangqi.moveCount = savedGame.moveCount;
    AppStateXiangqi.moveHistory = savedGame.moveHistory || [];
    AppStateXiangqi.gameOver = false;
    AppStateXiangqi.undoStack = Array.isArray(savedGame.undoStack) ? savedGame.undoStack : [];
    resetPositionHistoryXq();
    renderMoveListXq();
    setActiveModeButtonXq(AppStateXiangqi.mode);
    setGameResultXq("");
    showBoardSectionXq();
    buildXiangqiBoardDOM();
    updateXiangqiBoard();
    updateGameLabelsXq();
    if (AppStateXiangqi.mode === "offline-ai" && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
      setStatusXq("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineXq, AiPacing.delay(300));
    } else {
      setStatusXq("board-info", colorNameXq(AppStateXiangqi.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isPieceOfTurnXq(piece, turn) {
  return !!piece && piece.color === turn;
}

function onXiangqiPointClick(r, c) {
  if (AppStateXiangqi.gameOver) {
    setStatusXq("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateXiangqi.mode === "offline-ai" && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
    setStatusXq("board-info", "Computer to move.");
    return;
  }

  const board = AppStateXiangqi.board;
  const turn = AppStateXiangqi.turn;

  if (!AppStateXiangqi.selected) {
    const piece = board[r][c];
    if (!isPieceOfTurnXq(piece, turn)) return;
    AppStateXiangqi.selected = [r, c];
    updateXiangqiBoard();
    return;
  }

  const [sr, sc] = AppStateXiangqi.selected;
  if (sr === r && sc === c) {
    AppStateXiangqi.selected = null;
    updateXiangqiBoard();
    return;
  }

  const clickedPiece = board[r][c];
  if (isPieceOfTurnXq(clickedPiece, turn)) {
    AppStateXiangqi.selected = [r, c];
    updateXiangqiBoard();
    return;
  }

  const legalMoves = XiangqiCore.getLegalMoves(board, turn);
  const match = legalMoves.find((m) => m.from[0] === sr && m.from[1] === sc && m.to[0] === r && m.to[1] === c);
  if (!match) {
    setStatusXq("board-info", "Invalid move.");
    AppStateXiangqi.selected = null;
    updateXiangqiBoard();
    return;
  }

  const verdict = repetitionVerdictXq(match, turn);
  if (verdict && verdict.forbidden) {
    setStatusXq("board-info", verdict.forbidden === "check"
      ? "Perpetual check is not allowed - this move would repeat the position a third time. Choose another move."
      : "Perpetual chase is not allowed - this move would repeat the position a third time. Choose another move.");
    AppStateXiangqi.selected = null;
    updateXiangqiBoard();
    return;
  }

  applyXiangqiMove(match);

  if (AppStateXiangqi.mode === "offline-ai" && !AppStateXiangqi.gameOver && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
    setStatusXq("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineXq, AiPacing.delay(10));
  }
}

function applyXiangqiMove(move) {
  pushUndoSnapshotXq();
  const mover = AppStateXiangqi.turn;
  const verdict = repetitionVerdictXq(move, mover);
  const forcing = XiangqiCore.forcingKind(AppStateXiangqi.board, move, mover);
  AppStateXiangqi.board = XiangqiCore.applyMove(AppStateXiangqi.board, move);
  AppStateXiangqi.lastMove = { from: move.from, to: move.to };
  recordMoveXq(mover, move.from, move.to);
  AppStateXiangqi.selected = null;
  AppStateXiangqi.moveCount++;
  AppStateXiangqi.turn = XiangqiCore.otherColor(mover);
  AppStateXiangqi.plyLog.push({
    ply: AppStateXiangqi.moveCount,
    key: XiangqiCore.positionKey(AppStateXiangqi.board, AppStateXiangqi.turn),
    mover,
    forcing
  });
  updateXiangqiBoard();
  updateGameLabelsXq();

  const end = XiangqiCore.detectGameEnd(AppStateXiangqi.board, AppStateXiangqi.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameXq(end.winner);
    const reason = end.status === "checkmate" ? "checkmate" : "no legal moves";
    AppStateXiangqi.gameOver = true;
    announceGameResultXq(resultTitleXq(end.winner), winnerName + " wins (" + reason + ").");
    recordXiangqiStatsIfVsAi(end.winner === AppStateXiangqi.humanColor ? "win" : "loss");
    updateGameLabelsXq();
    return;
  }

  if (verdict && verdict.draw) {
    AppStateXiangqi.gameOver = true;
    announceGameResultXq("Draw", "Draw by repetition: the same position occurred three times.");
    recordXiangqiStatsIfVsAi("draw");
    updateGameLabelsXq();
    return;
  }

  // Every legal move of the side to move would break the perpetual rule:
  // like having no legal move at all, that loses.
  const toMove = AppStateXiangqi.turn;
  if (!XiangqiCore.getLegalMoves(AppStateXiangqi.board, toMove).some((m) => isMoveAllowedXq(m, toMove))) {
    AppStateXiangqi.gameOver = true;
    announceGameResultXq(resultTitleXq(mover), colorNameXq(mover) + " wins: " + colorNameXq(toMove) + " has no move left that avoids perpetual check or chase.");
    recordXiangqiStatsIfVsAi(mover === AppStateXiangqi.humanColor ? "win" : "loss");
    updateGameLabelsXq();
    return;
  }

  const inCheck = XiangqiCore.isInCheck(AppStateXiangqi.board, AppStateXiangqi.turn);
  const message = colorNameXq(mover) + " played." + (inCheck ? " Check!" : "") + " " + colorNameXq(AppStateXiangqi.turn) + " to move.";
  setStatusXq("board-info", message);
}

function aiMoveOfflineXq() {
  if (AppStateXiangqi.mode !== "offline-ai" || AppStateXiangqi.gameOver) return;
  const aiColor = XiangqiCore.otherColor(AppStateXiangqi.humanColor);
  if (AppStateXiangqi.turn !== aiColor) return;

  const move = XiangqiAi.chooseMove(AppStateXiangqi.board, aiColor, AppStateXiangqi.aiLevel, (m) => isMoveAllowedXq(m, aiColor));
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss

  applyXiangqiMove(move);
}

function undoLastMove() {
  if (!AppStateXiangqi.undoStack || !AppStateXiangqi.undoStack.length) return;
  let prev = AppStateXiangqi.undoStack.pop();
  if (AppStateXiangqi.mode === "offline-ai") {
    while (prev.turn !== AppStateXiangqi.humanColor && AppStateXiangqi.undoStack.length) {
      prev = AppStateXiangqi.undoStack.pop();
    }
  }
  AppStateXiangqi.board = prev.board;
  AppStateXiangqi.turn = prev.turn;
  AppStateXiangqi.gameOver = prev.gameOver;
  AppStateXiangqi.moveCount = prev.moveCount;
  AppStateXiangqi.lastMove = prev.lastMove;
  AppStateXiangqi.selected = null;
  AppStateXiangqi.moveHistory.length = AppStateXiangqi.moveCount;
  AppStateXiangqi.plyLog = (AppStateXiangqi.plyLog || []).filter((e) => e.ply <= AppStateXiangqi.moveCount);
  if (!AppStateXiangqi.plyLog.length) resetPositionHistoryXq();
  renderMoveListXq();
  setGameResultXq("");
  updateXiangqiBoard();
  updateGameLabelsXq();
  setStatusXq("board-info", "Move undone.");

  if (UiStatus.computerToMove(AppStateXiangqi)) {
    setStatusXq("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineXq, AiPacing.delay(300));
  }
}

function showBoardSectionXq() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  const movesList = document.getElementById("moves-list");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
  if (movesList) movesList.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Board rendering (point-and-line grid, mirrors go-app.js's technique) ***/

function buildXiangqiBoardDOM() {
  const grid = document.getElementById("xiangqi-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const stepX = 100 / (XiangqiCore.COLS - 1);
  const stepY = 100 / (XiangqiCore.ROWS - 1);

  for (let r = 0; r < XiangqiCore.ROWS; r++) {
    const hLine = document.createElement("div");
    hLine.className = "xq-line xq-line-h";
    hLine.style.top = (r * stepY) + "%";
    grid.appendChild(hLine);
  }
  for (let c = 0; c < XiangqiCore.COLS; c++) {
    const vLine = document.createElement("div");
    vLine.className = "xq-line xq-line-v";
    vLine.style.left = (c * stepX) + "%";
    grid.appendChild(vLine);
  }

  // Subtle river band and palace tints, purely decorative.
  const river = document.createElement("div");
  river.className = "xq-river";
  river.style.top = (4 * stepY) + "%";
  river.style.height = stepY + "%";
  grid.appendChild(river);

  // The palace's own diagonals ("the cross") - drawn as an inline SVG
  // rather than rotated divs, since a viewBox-based line always hits
  // the rectangle's exact corners regardless of pixel rounding. The
  // palace itself is pixel-square (ensureXiangqiBoardSquare() forces
  // the board's aspect ratio to match the grid's row/col count), so
  // the two diagonals are true 45-degree lines, not a skewed X.
  [[0, 2], [7, 9]].forEach(([r0, r1]) => {
    const palace = document.createElement("div");
    palace.className = "xq-palace";
    palace.style.top = (r0 * stepY) + "%";
    palace.style.height = ((r1 - r0) * stepY) + "%";
    palace.style.left = (3 * stepX) + "%";
    palace.style.width = (2 * stepX) + "%";
    palace.innerHTML =
      '<svg class="xq-palace-diag" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
        '<line x1="0" y1="0" x2="100" y2="100" vector-effect="non-scaling-stroke"></line>' +
        '<line x1="100" y1="0" x2="0" y2="100" vector-effect="non-scaling-stroke"></line>' +
      '</svg>';
    grid.appendChild(palace);
  });

  for (let r = 0; r < XiangqiCore.ROWS; r++) {
    for (let c = 0; c < XiangqiCore.COLS; c++) {
      const pt = document.createElement("button");
      pt.type = "button";
      pt.className = "xq-point";
      pt.style.top = (r * stepY) + "%";
      pt.style.left = (c * stepX) + "%";
      pt.dataset.row = r;
      pt.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "xq-piece";
      pt.appendChild(piece);
      pt.addEventListener("click", () => onXiangqiPointClick(r, c));
      grid.appendChild(pt);
    }
  }

  ensureXiangqiBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureXiangqiBoardSquare);
  } else {
    setTimeout(ensureXiangqiBoardSquare, 0);
  }
  ensureXiangqiResizeHandler();
}

let einkXiangqiResizeHandlerAttached = false;
let einkXiangqiResizeTimeoutId = null;

function ensureXiangqiBoardSquare() {
  const boardEl = document.getElementById("xiangqi-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  // Keep cells roughly square: 8 column-gaps wide, 9 row-gaps tall.
  boardEl.style.height = (rect.width * (XiangqiCore.ROWS - 1) / (XiangqiCore.COLS - 1)) + "px";
}

function ensureXiangqiResizeHandler() {
  if (einkXiangqiResizeHandlerAttached) return;
  einkXiangqiResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkXiangqiResizeTimeoutId !== null) clearTimeout(einkXiangqiResizeTimeoutId);
    einkXiangqiResizeTimeoutId = setTimeout(() => {
      einkXiangqiResizeTimeoutId = null;
      ensureXiangqiBoardSquare();
    }, 150);
  });
}

function updateXiangqiBoard() {
  const grid = document.getElementById("xiangqi-grid");
  if (!grid) return;
  const legalMoves = AppStateXiangqi.selected
    ? XiangqiCore.getLegalMoves(AppStateXiangqi.board, AppStateXiangqi.turn).filter(
        (m) => m.from[0] === AppStateXiangqi.selected[0] && m.from[1] === AppStateXiangqi.selected[1]
      )
    : [];
  const destSet = new Set(legalMoves.map((m) => m.to.join(",")));

  grid.querySelectorAll(".xq-point").forEach((pt) => {
    const r = parseInt(pt.dataset.row, 10);
    const c = parseInt(pt.dataset.col, 10);
    const piece = AppStateXiangqi.board[r][c];
    const pieceEl = pt.querySelector(".xq-piece");
    if (pieceEl) {
      pieceEl.classList.remove("xq-piece-red", "xq-piece-black", "xq-piece-filled");
      if (piece) {
        pieceEl.classList.add(piece.color === "r" ? "xq-piece-red" : "xq-piece-black", "xq-piece-filled");
        if (AppStateXiangqi.pieceStyle === "classic") {
          pieceEl.textContent = XQ_CLASSIC_CHARS[piece.color][piece.type];
        } else {
          pieceEl.innerHTML = XQ_SYMBOL_SVG[piece.color][piece.type];
        }
      } else {
        pieceEl.textContent = "";
      }
    }
    const isSelected = !!(AppStateXiangqi.selected && AppStateXiangqi.selected[0] === r && AppStateXiangqi.selected[1] === c);
    const isMovable = destSet.has(r + "," + c);
    pt.classList.toggle("xq-point-selected", isSelected);
    pt.classList.toggle("xq-point-movable", isMovable);
    pt.classList.toggle("xq-point-last-move", !!(AppStateXiangqi.lastMove &&
      ((AppStateXiangqi.lastMove.from[0] === r && AppStateXiangqi.lastMove.from[1] === c) ||
       (AppStateXiangqi.lastMove.to[0] === r && AppStateXiangqi.lastMove.to[1] === c))));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      const color = piece.color === "r" ? "Red" : "Black";
      label += ", " + color + " " + (XQ_PIECE_NAMES[piece.type] || "piece");
    } else {
      label += ", empty";
    }
    if (isSelected) label += ", selected";
    else if (isMovable) label += ", movable";
    I18n.setAria(pt, label);
  });

  ensureXiangqiBoardSquare();
}

function updateGameLabelsXq() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateXiangqi.moveCount ? "Move " + AppStateXiangqi.moveCount : "");
  updateUndoButtonVisibilityXq();
  updateResignVisibilityXq();

  if (AppStateXiangqi.gameOver) clearSavedXiangqiGame();
  else saveXiangqiGame();
}

function updateUndoButtonVisibilityXq() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateXiangqi.undoStack || []).length > 0;
  btn.disabled = !(hasUndo);
}

function updateResignVisibilityXq() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateXiangqi.gameOver);
}

document.addEventListener("DOMContentLoaded", initXiangqiApp);
