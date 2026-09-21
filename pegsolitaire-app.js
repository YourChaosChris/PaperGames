// pegsolitaire-app.js
// Wires PegSolitaireCore to the pegsolitaire.html UI. Solitaire, like
// Sudoku - no opponent, no color, no difficulty even: the classic
// 33-hole board always starts the same way, so the only control is
// "New game" (to try again) alongside Undo.
//
// The board is a 7x7 float-grid (same JS-enforced square cell size
// technique as the chess/checkers/Connect Four boards), with the four
// off-board corners left as invisible gaps - the same approach used for
// the Royal Game of Ur's H-shaped board, just without needing a
// clip-path border since Peg Solitaire's cross silhouette isn't the
// point of emphasis the way Ur's physical board shape was.
//
// Click a peg to select it and see its legal landing holes highlighted,
// then click one of those holes to jump - removing the peg that was
// jumped over, same as the physical game.

const AppStatePegSolitaire = {
  board: null,
  selected: null,   // [r, c] or null
  legalTargets: {}, // "r,c" -> the move that lands there
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const PEGSOLITAIRE_SAVE_KEY = "einkchess_save_pegsolitaire";

function savePegSolitaireGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(PEGSOLITAIRE_SAVE_KEY, {
    board: AppStatePegSolitaire.board,
    moveCount: AppStatePegSolitaire.moveCount
  });
}

function clearSavedPegSolitaireGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(PEGSOLITAIRE_SAVE_KEY);
}

function recordPegSolitaireStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("pegsolitaire", outcome);
}

function setStatusPegSolitaire(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultPegSolitaire(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultPegSolitaire(title, message) {
  setGameResultPegSolitaire(message);
  setStatusPegSolitaire("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackPegSolitaire() {
  AppStatePegSolitaire.undoStack = [];
}

function pushUndoSnapshotPegSolitaire() {
  AppStatePegSolitaire.undoStack.push({
    board: PegSolitaireCore.cloneBoard(AppStatePegSolitaire.board),
    moveCount: AppStatePegSolitaire.moveCount
  });
}

function initPegSolitaireApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-pegsolitaire-game");

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

  function startNewGamePegSolitaire() {
    AppStatePegSolitaire.board = PegSolitaireCore.createInitialBoard();
    AppStatePegSolitaire.selected = null;
    AppStatePegSolitaire.legalTargets = {};
    AppStatePegSolitaire.gameOver = false;
    AppStatePegSolitaire.moveCount = 0;
    resetUndoStackPegSolitaire();
    setGameResultPegSolitaire("");
    showBoardSectionPegSolitaire();
    buildPegSolitaireBoardDOM();
    updatePegSolitaireBoard();
    updateGameLabelsPegSolitaire();
    setStatusPegSolitaire("board-info", "Select a peg, then choose a hole to jump into.");
  }

  startGameBtn.addEventListener("click", startNewGamePegSolitaire);

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(PEGSOLITAIRE_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStatePegSolitaire.board = savedGame.board;
    AppStatePegSolitaire.moveCount = savedGame.moveCount;
    AppStatePegSolitaire.selected = null;
    AppStatePegSolitaire.legalTargets = {};
    AppStatePegSolitaire.gameOver = false;
    resetUndoStackPegSolitaire();
    setGameResultPegSolitaire("");
    showBoardSectionPegSolitaire();
    buildPegSolitaireBoardDOM();
    updatePegSolitaireBoard();
    updateGameLabelsPegSolitaire();
    setStatusPegSolitaire("board-info", "Select a peg, then choose a hole to jump into.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".
}

function targetKeyPeg(r, c) {
  return r + "," + c;
}

function computeLegalTargetsPegSolitaire(r, c) {
  const targets = {};
  PegSolitaireCore.getLegalMoves(AppStatePegSolitaire.board)
    .filter((m) => m.from[0] === r && m.from[1] === c)
    .forEach((m) => { targets[targetKeyPeg(m.to[0], m.to[1])] = m; });
  return targets;
}

function onPegSolitaireCellClick(r, c) {
  if (AppStatePegSolitaire.gameOver) return;
  const key = targetKeyPeg(r, c);
  const cellValue = AppStatePegSolitaire.board[r][c];

  if (AppStatePegSolitaire.selected && AppStatePegSolitaire.legalTargets[key]) {
    applyPegSolitaireMove(AppStatePegSolitaire.legalTargets[key]);
    return;
  }

  if (cellValue === true) {
    const sameSelection = AppStatePegSolitaire.selected
      && AppStatePegSolitaire.selected[0] === r && AppStatePegSolitaire.selected[1] === c;
    if (sameSelection) {
      AppStatePegSolitaire.selected = null;
      AppStatePegSolitaire.legalTargets = {};
    } else {
      AppStatePegSolitaire.selected = [r, c];
      AppStatePegSolitaire.legalTargets = computeLegalTargetsPegSolitaire(r, c);
    }
  } else {
    AppStatePegSolitaire.selected = null;
    AppStatePegSolitaire.legalTargets = {};
  }
  updatePegSolitaireBoard();
}

function applyPegSolitaireMove(move) {
  pushUndoSnapshotPegSolitaire();
  AppStatePegSolitaire.board = PegSolitaireCore.applyMove(AppStatePegSolitaire.board, move);
  AppStatePegSolitaire.moveCount++;
  AppStatePegSolitaire.selected = null;
  AppStatePegSolitaire.legalTargets = {};
  updatePegSolitaireBoard();
  updateGameLabelsPegSolitaire();

  const result = PegSolitaireCore.evaluateBoard(AppStatePegSolitaire.board);
  if (result.over) {
    AppStatePegSolitaire.gameOver = true;
    if (result.won) {
      announceGameResultPegSolitaire("Solved!", "Down to the last peg - solved!");
      recordPegSolitaireStats("win");
    } else {
      announceGameResultPegSolitaire("No moves left",
        "No more jumps available, with " + result.pegs + " pegs left. Try again!");
      recordPegSolitaireStats("loss");
    }
    updateGameLabelsPegSolitaire();
  } else {
    setStatusPegSolitaire("board-info", result.pegs + " pegs left. Select a peg, then choose a hole to jump into.");
  }
}

function undoLastMove() {
  if (!AppStatePegSolitaire.undoStack || !AppStatePegSolitaire.undoStack.length) return;
  const prev = AppStatePegSolitaire.undoStack.pop();
  AppStatePegSolitaire.board = prev.board;
  AppStatePegSolitaire.moveCount = prev.moveCount;
  AppStatePegSolitaire.selected = null;
  AppStatePegSolitaire.legalTargets = {};
  AppStatePegSolitaire.gameOver = false;
  setGameResultPegSolitaire("");
  updatePegSolitaireBoard();
  updateGameLabelsPegSolitaire();
  setStatusPegSolitaire("board-info", "Move undone.");
}

function showBoardSectionPegSolitaire() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as chess/checkers/Ur) ***/

function buildPegSolitaireBoardDOM() {
  const boardEl = document.getElementById("pegsolitaire-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < PegSolitaireCore.SIZE; r++) {
    for (let c = 0; c < PegSolitaireCore.SIZE; c++) {
      const cell = document.createElement("button");
      cell.className = "square peg-square";
      cell.type = "button";
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (!PegSolitaireCore.isOnBoard(r, c)) {
        cell.classList.add("peg-square-gap");
        cell.disabled = true;
        cell.setAttribute("aria-hidden", "true");
        boardEl.appendChild(cell);
        continue;
      }

      const piece = document.createElement("span");
      piece.className = "peg-piece";
      cell.appendChild(piece);
      cell.addEventListener("click", () => onPegSolitaireCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  ensurePegSolitaireSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensurePegSolitaireSquareAspectRatio);
  } else {
    setTimeout(ensurePegSolitaireSquareAspectRatio, 0);
  }
  ensurePegSolitaireResizeHandler();
}

let einkPegSolitaireResizeHandlerAttached = false;
let einkPegSolitaireResizeTimeoutId = null;

function ensurePegSolitaireSquareAspectRatio() {
  const boardEl = document.getElementById("pegsolitaire-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / PegSolitaireCore.SIZE;
  boardEl.querySelectorAll(".peg-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensurePegSolitaireResizeHandler() {
  if (einkPegSolitaireResizeHandlerAttached) return;
  einkPegSolitaireResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkPegSolitaireResizeTimeoutId !== null) clearTimeout(einkPegSolitaireResizeTimeoutId);
    einkPegSolitaireResizeTimeoutId = setTimeout(() => {
      einkPegSolitaireResizeTimeoutId = null;
      ensurePegSolitaireSquareAspectRatio();
    }, 150);
  });
}

function updatePegSolitaireBoard() {
  const boardEl = document.getElementById("pegsolitaire-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".peg-square").forEach((sq) => {
    if (sq.classList.contains("peg-square-gap")) return;
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const value = AppStatePegSolitaire.board[r][c];
    const pieceEl = sq.querySelector(".peg-piece");
    if (pieceEl) pieceEl.classList.toggle("peg-piece-filled", value === true);

    const isSelected = AppStatePegSolitaire.selected
      && AppStatePegSolitaire.selected[0] === r && AppStatePegSolitaire.selected[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("peg-square-movable", !!AppStatePegSolitaire.legalTargets[targetKeyPeg(r, c)]);

    let label = "Row " + (r + 1) + ", column " + (c + 1) + (value ? ", peg" : ", empty hole");
    sq.setAttribute("aria-label", label);
  });
}

function updateGameLabelsPegSolitaire() {
  const meta = document.getElementById("game-meta");
  if (meta && AppStatePegSolitaire.board) {
    meta.textContent = PegSolitaireCore.countPegs(AppStatePegSolitaire.board) + " pegs";
  }
  updateUndoButtonVisibilityPegSolitaire();

  if (AppStatePegSolitaire.gameOver) clearSavedPegSolitaireGame();
  else savePegSolitaireGame();
}

function updateUndoButtonVisibilityPegSolitaire() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStatePegSolitaire.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStatePegSolitaire.gameOver));
}

document.addEventListener("DOMContentLoaded", initPegSolitaireApp);
