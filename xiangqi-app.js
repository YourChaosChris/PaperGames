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

// Symbol style: General/Horse/Chariot/Soldier reuse the app's own
// cburnett chess artwork (pieces.js) for pieces whose role genuinely
// matches - King for General (the piece you must protect), Knight for
// Horse (identical move shape), Rook for Chariot (its historical
// ancestor really is a war chariot), Pawn for Soldier. Advisor,
// Elephant and Cannon have no equivalent in Western chess, so they get
// three small custom SVGs drawn to actually look like what they are
// (a shield, an elephant, a cannon on wheels) rather than borrowing an
// unrelated chess piece.
const XQ_CUSTOM_SVG = {
  A: '<svg viewBox="0 0 45 45"><path fill="{c}" stroke="#000" stroke-width="1.5" stroke-linejoin="round" d="M22.5 6 34 11v9c0 10.5-6 18-11.5 21C17 44 11 33.5 11 26v-9z"/></svg>',
  E: '<svg viewBox="0 0 45 45"><g fill="{c}" stroke="#000" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><path d="M31 39c1.5-1 2.5-3 2.5-5.5 0-3-2-5-2-9 0-6-4.5-11-11-11-6 0-10 4-11.5 9-1 3.5.5 6-1 8.5-1 2 0 5.5 2 6.5"/><path d="M9 28c-2 0-3.5-1.5-3.5-4 0-2 1.2-3.6 2.7-5.6"/><circle cx="24" cy="16" r="1.4" fill="#000" stroke="none"/></g></svg>',
  C: '<svg viewBox="0 0 45 45"><g fill="{c}" stroke="#000" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><rect x="9" y="15" width="26" height="8" rx="3"/><circle cx="15" cy="30" r="7" fill="none" stroke-width="2.2"/><circle cx="15" cy="30" r="1.6" fill="#000" stroke="none"/><path d="M31 15v-5h4v5" fill="none"/></g></svg>'
};

function xqRecolor(svg, hex) {
  return svg.replace(/fill="#fff"/g, 'fill="' + hex + '"').replace("{c}", hex);
}

const XQ_RED = "#b3261e";
const XQ_SYMBOL_SVG = {
  r: {
    G: xqRecolor(PieceIcons.K, XQ_RED),
    A: xqRecolor(XQ_CUSTOM_SVG.A, XQ_RED),
    E: xqRecolor(XQ_CUSTOM_SVG.E, XQ_RED),
    H: xqRecolor(PieceIcons.N, XQ_RED),
    R: xqRecolor(PieceIcons.R, XQ_RED),
    C: xqRecolor(XQ_CUSTOM_SVG.C, XQ_RED),
    P: xqRecolor(PieceIcons.P, XQ_RED)
  },
  b: {
    G: PieceIcons.k,
    A: xqRecolor(XQ_CUSTOM_SVG.A, "#111"),
    E: xqRecolor(XQ_CUSTOM_SVG.E, "#111"),
    H: PieceIcons.n,
    R: PieceIcons.r,
    C: xqRecolor(XQ_CUSTOM_SVG.C, "#111"),
    P: PieceIcons.p
  }
};

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
  pieceStyle: "classic"   // "classic" | "symbols"
};

const XQ_STYLE_KEY = "einkchess_xiangqi_piece_style";

function colorNameXq(color) {
  return color === "r" ? "Red" : "Black";
}

function setStatusXq(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultXq(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultXq(resultCode, message) {
  setGameResultXq(message);
  setStatusXq("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackXq() {
  AppStateXiangqi.undoStack = [];
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
    if (menuToggle) menuToggle.textContent = "☰ Menu";
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) menuToggle.textContent = "✕ Close";
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
    setGameResultXq("");
    showBoardSectionXq();
    buildXiangqiBoardDOM();
    updateXiangqiBoard();
    updateGameLabelsXq();

    if (mode === "offline-ai" && humanColor !== "r") {
      setStatusXq("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineXq, 300);
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
    const humanColor = colorInput && colorInput.value === "black" ? "b" : "r";

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
      "You play " + colorNameXq(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateXiangqi.gameOver) return;
      const loser = AppStateXiangqi.turn;
      const winner = XiangqiCore.otherColor(loser);
      AppStateXiangqi.gameOver = true;
      announceGameResultXq(colorNameXq(winner) + " wins", colorNameXq(winner) + " wins by resignation.");
      updateGameLabelsXq();
    });
  }

  updateColorChoiceVisibilityXq();
  // No mode is pre-selected and no game auto-starts: the placeholder
  // shows until the player picks 2-player or configures vs-computer and
  // presses New game, matching chess.html's behavior.
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

  applyXiangqiMove(match);

  if (AppStateXiangqi.mode === "offline-ai" && !AppStateXiangqi.gameOver && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
    setStatusXq("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineXq, 10);
  }
}

function applyXiangqiMove(move) {
  pushUndoSnapshotXq();
  const mover = AppStateXiangqi.turn;
  AppStateXiangqi.board = XiangqiCore.applyMove(AppStateXiangqi.board, move);
  AppStateXiangqi.lastMove = { from: move.from, to: move.to };
  AppStateXiangqi.selected = null;
  AppStateXiangqi.moveCount++;
  AppStateXiangqi.turn = XiangqiCore.otherColor(mover);
  updateXiangqiBoard();
  updateGameLabelsXq();

  const end = XiangqiCore.detectGameEnd(AppStateXiangqi.board, AppStateXiangqi.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameXq(end.winner);
    const reason = end.status === "checkmate" ? "checkmate" : "no legal moves";
    AppStateXiangqi.gameOver = true;
    announceGameResultXq(winnerName + " wins", winnerName + " wins (" + reason + ").");
    updateGameLabelsXq();
    return;
  }

  const inCheck = XiangqiCore.isInCheck(AppStateXiangqi.board, AppStateXiangqi.turn);
  setStatusXq("board-info", colorNameXq(mover) + " played." + (inCheck ? " Check!" : "") + " " + colorNameXq(AppStateXiangqi.turn) + " to move.");
}

function aiMoveOfflineXq() {
  if (AppStateXiangqi.mode !== "offline-ai" || AppStateXiangqi.gameOver) return;
  const aiColor = XiangqiCore.otherColor(AppStateXiangqi.humanColor);
  if (AppStateXiangqi.turn !== aiColor) return;

  const move = XiangqiAi.chooseMove(AppStateXiangqi.board, aiColor, AppStateXiangqi.aiLevel);
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
  setGameResultXq("");
  updateXiangqiBoard();
  updateGameLabelsXq();
  setStatusXq("board-info", "Move undone.");
}

function showBoardSectionXq() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) menuToggle.textContent = "☰ Menu";
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

  [[0, 2], [7, 9]].forEach(([r0, r1]) => {
    const palace = document.createElement("div");
    palace.className = "xq-palace";
    palace.style.top = (r0 * stepY) + "%";
    palace.style.height = ((r1 - r0) * stepY) + "%";
    palace.style.left = (3 * stepX) + "%";
    palace.style.width = (2 * stepX) + "%";
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
    pt.classList.toggle("xq-point-selected", !!(AppStateXiangqi.selected && AppStateXiangqi.selected[0] === r && AppStateXiangqi.selected[1] === c));
    pt.classList.toggle("xq-point-movable", destSet.has(r + "," + c));
    pt.classList.toggle("xq-point-last-move", !!(AppStateXiangqi.lastMove &&
      ((AppStateXiangqi.lastMove.from[0] === r && AppStateXiangqi.lastMove.from[1] === c) ||
       (AppStateXiangqi.lastMove.to[0] === r && AppStateXiangqi.lastMove.to[1] === c))));
  });

  ensureXiangqiBoardSquare();
}

function updateGameLabelsXq() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateXiangqi.moveCount ? "Move " + AppStateXiangqi.moveCount : "";
  updateUndoButtonVisibilityXq();
  updateResignVisibilityXq();
}

function updateUndoButtonVisibilityXq() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateXiangqi.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateXiangqi.gameOver));
}

function updateResignVisibilityXq() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateXiangqi.gameOver);
}

document.addEventListener("DOMContentLoaded", initXiangqiApp);
