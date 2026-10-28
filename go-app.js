// go-app.js
// Wires GoCore/GoAi to the go.html UI. Mirrors app.js's structure and
// conventions (settings panel, undo stack, board-fit handling) but Go's
// own flow: click-to-place stones, Pass to end a game, area scoring.
// Board size and colour (Black, White, Random) sit under the board
// (#go-setup, task 160), because the page starts a game at once and the
// settings panel is closed then. Saves keep their old format.

const AppStateGo = {
  mode: "offline",        // "offline" | "offline-ai"
  size: 9,
  board: GoCore.createEmptyBoard(9),
  turn: "b",              // "b" | "w" - Black always moves first
  koPoint: null,
  lastMove: null,         // { r, c } | { pass: true, color } | null
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  consecutivePasses: 0,
  moveCount: 0,
  undoStack: [],
  captures: { b: 0, w: 0 }, // stones captured BY black / BY white
  // GoCore.boardKey() of every position the game has had so far, for the
  // positional superko rule (no move may recreate an earlier position).
  boardHistory: [],
  colorDrawn: false,      // chance chose the human colour of this game
  colorChanged: false     // ... or it differs from the last game against the computer
};

function goHistorySet() {
  return new Set(AppStateGo.boardHistory || []);
}

let einkGoResizeHandlerAttached = false;
let einkGoResizeTimeoutId = null;

const GO_SAVE_KEY = "einkchess_save_go";

// Board size and colour for the next game, chosen under the board (task 160).
// color: "b" | "w" | "random". Kept on the device like the other settings.
const GO_SETUP_KEY = "papergames_go_setup";
const GO_SIZES = [9, 13, 19];
const GoSetup = { size: 9, color: "b", last: null };  // last: colour of the last game against the computer

// Without an own choice yet, the shared "who moves first: random" setting
// shows up as a pressed Random button, so the reason for a colour is visible.
function loadGoSetup() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(GO_SETUP_KEY) || "null"); } catch (e) { /* storage unavailable - defaults */ }
  if (raw && GO_SIZES.indexOf(raw.size) !== -1) GoSetup.size = raw.size;
  if (raw && ["b", "w", "random"].indexOf(raw.color) !== -1) GoSetup.color = raw.color;
  else if (RandomStart.enabled()) GoSetup.color = "random";
  if (raw && (raw.last === "b" || raw.last === "w")) GoSetup.last = raw.last;
}

function saveGoSetup() {
  try { localStorage.setItem(GO_SETUP_KEY, JSON.stringify({ size: GoSetup.size, color: GoSetup.color, last: GoSetup.last })); } catch (e) {}
}

// The human's colour for a new game against the computer: Random draws one,
// Black or White stay as chosen (task 161: no silent change of colour).
function pickHumanColorGo() {
  if (GoSetup.color === "random") return { color: RandomStart.pick(["b", "w"]), drawn: true };
  return { color: GoSetup.color, drawn: false };
}

// "You play White (second move)." above the board, with the reason when
// chance decided and a note when the colour differs from the last game.
function renderGoYou() {
  const el = document.getElementById("go-you");
  if (!el) return;
  const vsAi = AppStateGo.mode === "offline-ai" && AppStateGo.board && document.getElementById("board-container") &&
    !document.getElementById("board-container").classList.contains("hidden");
  el.classList.toggle("hidden", !vsAi);
  if (!vsAi) { el.textContent = ""; return; }
  const parts = [];
  if (AppStateGo.colorDrawn) parts.push(I18n.t("go_you_drawn"));
  parts.push(I18n.t(AppStateGo.humanColor === "w" ? "go_you_white" : "go_you_black"));
  if (AppStateGo.colorChanged) parts.push(I18n.t("go_you_changed"));
  el.textContent = parts.join(" ");
}

function renderGoSetup() {
  document.querySelectorAll("#go-setup .go-pick").forEach((b) => {
    const on = b.dataset.size ? Number(b.dataset.size) === GoSetup.size : b.dataset.color === GoSetup.color;
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const colorRow = document.getElementById("go-color-row");
  if (colorRow) colorRow.classList.toggle("hidden", AppStateGo.mode === "offline");
  const next = document.getElementById("go-setup-next");
  if (next) next.classList.toggle("hidden", !(AppStateGo.moveCount > 0 && !AppStateGo.gameOver));
  renderGoYou();
}

function saveGoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(GO_SAVE_KEY, {
    mode: AppStateGo.mode,
    size: AppStateGo.size,
    board: AppStateGo.board,
    turn: AppStateGo.turn,
    koPoint: AppStateGo.koPoint,
    lastMove: AppStateGo.lastMove,
    humanColor: AppStateGo.humanColor,
    aiLevel: AppStateGo.aiLevel,
    consecutivePasses: AppStateGo.consecutivePasses,
    moveCount: AppStateGo.moveCount,
    captures: AppStateGo.captures,
    colorDrawn: AppStateGo.colorDrawn,
    colorChanged: AppStateGo.colorChanged,
    boardHistory: AppStateGo.boardHistory,
    undoStack: AppStateGo.undoStack.slice(-50),
  });
}

function clearSavedGoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(GO_SAVE_KEY);
}

function recordGoStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateGo.mode !== "offline-ai") return;
  GameStats.record("go", outcome);
}

function colorNameGo(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusGo(elementId, text) {
  if (((AppStateGo.mode === "offline-ai")) && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateGo);
  }
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultGo(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// Sets the compact result badge (#game-result) and the status line, and
// shows a centered popup with the same description - so the outcome is
// impossible to miss regardless of mode (2-player or vs-computer).
// Go's own resultCode is scoring notation ("B+7", "W+R") - clear to a Go
// player but not a useful modal title at a glance, so the title is built
// from the winner color plus the same you/computer distinction the rest of
// the app uses instead.
function resultTitleGo(winner) {
  if (AppStateGo.mode === "offline-ai") {
    return winner === AppStateGo.humanColor ? "You win!" : I18n.t("ui_status_computer_wins");
  }
  return colorNameGo(winner) + " wins";
}

function announceGameResultGo(resultCode, message) {
  setGameResultGo(message);
  setStatusGo("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackGo() {
  AppStateGo.undoStack = [];
}

function pushUndoSnapshotGo() {
  AppStateGo.undoStack.push({
    board: GoCore.cloneBoard(AppStateGo.board),
    turn: AppStateGo.turn,
    koPoint: AppStateGo.koPoint,
    gameOver: AppStateGo.gameOver,
    consecutivePasses: AppStateGo.consecutivePasses,
    moveCount: AppStateGo.moveCount,
    captures: { b: AppStateGo.captures.b, w: AppStateGo.captures.w },
    lastMove: AppStateGo.lastMove,
    historyLength: (AppStateGo.boardHistory || []).length
  });
}

function recordPassGo(color) {
  AppStateGo.consecutivePasses = (AppStateGo.consecutivePasses || 0) + 1;
  AppStateGo.lastMove = { pass: true, color };
  AppStateGo.moveCount++;
}

function endGameByScoreGo() {
  AppStateGo.gameOver = true;
  const score = GoCore.scoreArea(AppStateGo.board, AppStateGo.size, GoCore.DEFAULT_KOMI);
  const margin = Math.abs(score.blackScore - score.whiteScore);
  announceGameResultGo(resultTitleGo(score.winner),
    "Both passed. " + colorNameGo(score.winner) + " wins by " + margin +
    " (Black " + score.blackScore + " – White " + score.whiteScore + ").");
  recordGoStatsIfVsAi(score.winner === AppStateGo.humanColor ? "win" : "loss");
  updateGameLabelsGo();
}

function explainIllegalGoMove(reason) {
  if (reason === "occupied") return "Invalid move: that point is already occupied.";
  if (reason === "suicide") return "Invalid move: that would leave your stones with no liberties.";
  if (reason === "ko") return "Invalid move: forbidden by the ko rule (recaptures immediately).";
  if (reason === "superko") return "Invalid move: it would repeat an earlier board position (superko rule).";
  return "Invalid move.";
}

function initGoApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const goLevelInline = document.getElementById("go-level-inline");
  const startGoGameBtn = document.getElementById("start-go-game");
  const passBtn = document.getElementById("pass-button");
  const resignBtn = document.getElementById("resign-button");
  loadGoSetup();
  if (typeof I18n.onChange === "function") I18n.onChange(renderGoYou);

  function setActiveModeButtonGo(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  // Same collapsible-settings pattern as chess.html: open until a game is
  // actually running, then out of the way but reachable via the menu button.
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

  function startNewGame(size, mode, humanColor, level, drawn) {
    AppStateGo.colorDrawn = mode === "offline-ai" && !!drawn;
    AppStateGo.colorChanged = mode === "offline-ai" && !!GoSetup.last && GoSetup.last !== humanColor;
    if (mode === "offline-ai") { GoSetup.last = humanColor; saveGoSetup(); }
    AppStateGo.mode = mode;
    AppStateGo.size = size;
    AppStateGo.board = GoCore.createEmptyBoard(size);
    AppStateGo.turn = "b";
    AppStateGo.koPoint = null;
    AppStateGo.lastMove = null;
    AppStateGo.humanColor = humanColor;
    AppStateGo.aiLevel = level;
    AppStateGo.gameOver = false;
    AppStateGo.consecutivePasses = 0;
    AppStateGo.moveCount = 0;
    AppStateGo.captures = { b: 0, w: 0 };
    AppStateGo.boardHistory = [GoCore.boardKey(AppStateGo.board)];
    resetUndoStackGo();
    setGameResultGo("");
    showBoardSectionGo();
    buildGoBoardDOM();
    updateGoBoard();
    updateGameLabelsGo();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusGo("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineGo, AiPacing.delay(10));
    } else {
      setStatusGo("board-info", colorNameGo(AppStateGo.turn) + " to move.");
    }
  }

  function startTwoPlayerGo() {
    setActiveModeButtonGo("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame(GoSetup.size, "offline", "b", 0);
    setStatusGo("offline-go-status", "Local 2-player game (no computer).");
  }

  function startVsComputerGo(level) {
    setActiveModeButtonGo("offline-ai");
    const pick = pickHumanColorGo();
    startNewGame(GoSetup.size, "offline-ai", pick.color, level, pick.drawn);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    const text = "You play " + colorNameGo(pick.color) + ", computer level: " + (levelNames[level] || level) + ".";
    setStatusGo("offline-go-status", pick.drawn ? text.replace(/^You play /, "Chance decided: you play ") : text);
  }

  modeOffline.addEventListener("click", startTwoPlayerGo);

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonGo("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (goLevelInline) goLevelInline.value = String(AppStateGo.aiLevel || 2);
    setStatusGo("board-info", "");
  });

  // "New game" (also the one next to the board) keeps the current mode: a
  // 2-player game stays one until "Against the computer" is picked.
  startGoGameBtn.addEventListener("click", () => {
    const level = goLevelInline ? parseInt(goLevelInline.value, 10) : 2;
    const twoPlayerShown = AppStateGo.mode === "offline" && !document.getElementById("board-container").classList.contains("hidden");
    if (level === 0 || (twoPlayerShown && offlineAiControls.classList.contains("hidden"))) {
      startTwoPlayerGo();
      return;
    }
    startVsComputerGo(level);
  });

  // Size and colour buttons under the board: while no stone is on the
  // board they start the game again at once, otherwise they count for the
  // next new game.
  document.querySelectorAll("#go-setup .go-pick").forEach((b) => {
    b.addEventListener("click", () => {
      if (b.dataset.size) GoSetup.size = Number(b.dataset.size);
      else GoSetup.color = b.dataset.color;
      saveGoSetup();
      if (AppStateGo.moveCount === 0 && !AppStateGo.gameOver) {
        if (AppStateGo.mode === "offline") startTwoPlayerGo();
        else startVsComputerGo(AppStateGo.aiLevel || 2);
      }
      renderGoSetup();
    });
  });

  if (passBtn) {
    passBtn.addEventListener("click", () => {
      if (AppStateGo.gameOver) return;
      if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) return;

      pushUndoSnapshotGo();
      const passer = AppStateGo.turn;
      recordPassGo(passer);
      AppStateGo.turn = passer === "b" ? "w" : "b";
      updateGameLabelsGo();

      if (AppStateGo.consecutivePasses >= 2) {
        endGameByScoreGo();
        return;
      }
      setStatusGo("board-info", colorNameGo(passer) + " passed. " + colorNameGo(AppStateGo.turn) + " to move.");

      if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) {
        setStatusGo("board-info", "Computer thinking…");
        setTimeout(aiMoveOfflineGo, AiPacing.delay(10));
      }
    });
  }

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateGo.gameOver) return;
      const loser = UiStatus.resigner(AppStateGo);
      const winner = loser === "b" ? "w" : "b";
      AppStateGo.gameOver = true;
      announceGameResultGo(resultTitleGo(winner), colorNameGo(winner) + " wins by resignation.");
      recordGoStatsIfVsAi("loss");
      updateGameLabelsGo();
    });
  }

  renderGoSetup();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(GO_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateGo.mode = savedGame.mode;
    AppStateGo.size = savedGame.size;
    AppStateGo.board = savedGame.board;
    AppStateGo.turn = savedGame.turn;
    AppStateGo.koPoint = savedGame.koPoint;
    AppStateGo.lastMove = savedGame.lastMove;
    AppStateGo.humanColor = savedGame.humanColor;
    AppStateGo.aiLevel = savedGame.aiLevel;
    AppStateGo.consecutivePasses = savedGame.consecutivePasses;
    AppStateGo.moveCount = savedGame.moveCount;
    AppStateGo.captures = savedGame.captures;
    AppStateGo.colorDrawn = !!savedGame.colorDrawn;
    AppStateGo.colorChanged = !!savedGame.colorChanged;
    AppStateGo.boardHistory = Array.isArray(savedGame.boardHistory) && savedGame.boardHistory.length
      ? savedGame.boardHistory
      : [GoCore.boardKey(AppStateGo.board)];
    AppStateGo.gameOver = false;
    AppStateGo.undoStack = Array.isArray(savedGame.undoStack) ? savedGame.undoStack : [];
    setActiveModeButtonGo(AppStateGo.mode);
    offlineAiControls.classList.toggle("hidden", AppStateGo.mode !== "offline-ai");
    if (goLevelInline && AppStateGo.mode === "offline-ai") goLevelInline.value = String(AppStateGo.aiLevel || 2);
    setGameResultGo("");
    showBoardSectionGo();
    buildGoBoardDOM();
    updateGoBoard();
    updateGameLabelsGo();
    if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) {
      setStatusGo("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineGo, AiPacing.delay(10));
    } else {
      setStatusGo("board-info", colorNameGo(AppStateGo.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function onGoPointClick(e) {
  if (AppStateGo.gameOver) {
    setStatusGo("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) {
    setStatusGo("board-info", "Computer to move.");
    return;
  }

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const result = GoCore.tryMove(AppStateGo.board, AppStateGo.size, r, c, AppStateGo.turn, AppStateGo.koPoint, goHistorySet());
  if (!result.legal) {
    setStatusGo("board-info", explainIllegalGoMove(result.reason));
    return;
  }

  applyGoMove(result, r, c);

  if (AppStateGo.mode === "offline-ai" && !AppStateGo.gameOver && AppStateGo.turn !== AppStateGo.humanColor) {
    setStatusGo("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineGo, AiPacing.delay(10));
  }
}

function applyGoMove(result, r, c) {
  pushUndoSnapshotGo();
  const mover = AppStateGo.turn;
  AppStateGo.board = result.board;
  AppStateGo.koPoint = result.koPoint;
  AppStateGo.boardHistory.push(GoCore.boardKey(result.board));
  AppStateGo.captures[mover] += result.captured.length;
  AppStateGo.lastMove = { r, c };
  AppStateGo.consecutivePasses = 0;
  AppStateGo.moveCount++;
  AppStateGo.turn = mover === "b" ? "w" : "b";
  updateGoBoard();
  updateGameLabelsGo();
  setStatusGo("board-info", colorNameGo(mover) + " played. " + colorNameGo(AppStateGo.turn) + " to move.");
}

function aiMoveOfflineGo() {
  if (AppStateGo.mode !== "offline-ai" || AppStateGo.gameOver) return;
  const aiColor = AppStateGo.humanColor === "b" ? "w" : "b";
  if (AppStateGo.turn !== aiColor) return;

  const move = GoAi.chooseMove(AppStateGo.board, AppStateGo.size, aiColor, AppStateGo.aiLevel, AppStateGo.koPoint, goHistorySet());

  if (!move) {
    pushUndoSnapshotGo();
    recordPassGo(aiColor);
    AppStateGo.turn = aiColor === "b" ? "w" : "b";
    updateGameLabelsGo();
    if (AppStateGo.consecutivePasses >= 2) {
      endGameByScoreGo();
      return;
    }
    setStatusGo("board-info", "Computer passes. Your move.");
    return;
  }

  pushUndoSnapshotGo();
  AppStateGo.board = move.result.board;
  AppStateGo.koPoint = move.result.koPoint;
  AppStateGo.boardHistory.push(GoCore.boardKey(move.result.board));
  AppStateGo.captures[aiColor] += move.result.captured.length;
  AppStateGo.lastMove = { r: move.r, c: move.c };
  AppStateGo.consecutivePasses = 0;
  AppStateGo.moveCount++;
  AppStateGo.turn = aiColor === "b" ? "w" : "b";
  updateGoBoard();
  updateGameLabelsGo();
  setStatusGo("board-info", "Computer played. Your move.");
}

function undoLastMove() {
  if (!AppStateGo.undoStack || !AppStateGo.undoStack.length) return;
  let prev = AppStateGo.undoStack.pop();
  if (AppStateGo.mode === "offline-ai") {
    // Undo the human's own last move, not just one ply - keep popping
    // until it's the human's turn again.
    while (prev.turn !== AppStateGo.humanColor && AppStateGo.undoStack.length) {
      prev = AppStateGo.undoStack.pop();
    }
  }
  AppStateGo.board = prev.board;
  AppStateGo.turn = prev.turn;
  AppStateGo.koPoint = prev.koPoint;
  AppStateGo.gameOver = prev.gameOver;
  AppStateGo.consecutivePasses = prev.consecutivePasses;
  AppStateGo.moveCount = prev.moveCount;
  AppStateGo.captures = prev.captures;
  AppStateGo.lastMove = prev.lastMove;
  if (typeof prev.historyLength === "number") AppStateGo.boardHistory.length = prev.historyLength;
  setGameResultGo("");
  updateGoBoard();
  updateGameLabelsGo();
  setStatusGo("board-info", "Move undone.");
  if (UiStatus.computerToMove(AppStateGo)) {
    setStatusGo("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineGo, AiPacing.delay(10));
  }
}

function showBoardSectionGo() {
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

/*** Board rendering ***/

function buildGoBoardDOM() {
  const grid = document.getElementById("go-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const n = AppStateGo.size;
  const step = 100 / (n - 1);

  for (let i = 0; i < n; i++) {
    const hLine = document.createElement("div");
    hLine.className = "go-line go-line-h";
    hLine.style.top = (i * step) + "%";
    grid.appendChild(hLine);

    const vLine = document.createElement("div");
    vLine.className = "go-line go-line-v";
    vLine.style.left = (i * step) + "%";
    grid.appendChild(vLine);
  }

  GoCore.hoshiPoints(n).forEach(([r, c]) => {
    const dot = document.createElement("div");
    dot.className = "go-hoshi";
    dot.style.top = (r * step) + "%";
    dot.style.left = (c * step) + "%";
    grid.appendChild(dot);
  });

  const pointSize = step * 0.92;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const pt = document.createElement("button");
      pt.className = "go-point";
      pt.style.top = (r * step) + "%";
      pt.style.left = (c * step) + "%";
      pt.style.width = pointSize + "%";
      pt.style.height = pointSize + "%";
      pt.dataset.row = r;
      pt.dataset.col = c;
      const stone = document.createElement("span");
      stone.className = "go-stone";
      pt.appendChild(stone);
      pt.addEventListener("click", onGoPointClick);
      grid.appendChild(pt);
    }
  }

  // Fallback if `aspect-ratio` isn't supported (seen on real E-Ink browsers,
  // e.g. older Tolino WebViews): without it, #go-board's height comes only
  // from its percentage padding, and #go-grid - sized 100%/100% of that -
  // collapses to near zero, squashing the whole grid onto one line. Setting
  // an explicit pixel height mirrors app.js's ensureSquareAspectRatio().
  ensureGoBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureGoBoardSquare);
  } else {
    setTimeout(ensureGoBoardSquare, 0);
  }
  ensureGoResizeHandler();
}

function ensureGoBoardSquare() {
  const boardEl = document.getElementById("go-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureGoResizeHandler() {
  if (einkGoResizeHandlerAttached) return;
  einkGoResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkGoResizeTimeoutId !== null) clearTimeout(einkGoResizeTimeoutId);
    einkGoResizeTimeoutId = setTimeout(() => {
      einkGoResizeTimeoutId = null;
      ensureGoBoardSquare();
    }, 150);
  });
}

function updateGoBoard() {
  const grid = document.getElementById("go-grid");
  if (!grid) return;
  const points = grid.querySelectorAll(".go-point");
  points.forEach((pt) => {
    const r = parseInt(pt.dataset.row, 10);
    const c = parseInt(pt.dataset.col, 10);
    const stone = AppStateGo.board[r][c];
    const stoneEl = pt.querySelector(".go-stone");
    stoneEl.classList.remove("go-stone-black", "go-stone-white");
    if (stone === "b") stoneEl.classList.add("go-stone-black");
    else if (stone === "w") stoneEl.classList.add("go-stone-white");

    pt.classList.toggle(
      "last-move",
      !!(AppStateGo.lastMove && !AppStateGo.lastMove.pass &&
         AppStateGo.lastMove.r === r && AppStateGo.lastMove.c === c)
    );

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += stone ? ", " + (stone === "b" ? "Black" : "White") + " stone" : ", empty";
    I18n.setAria(pt, label);
  });
  ensureGoBoardSquare();
  updateScoreLineGo();
}

function updateScoreLineGo() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const active = AppStateGo.moveCount > 0 || AppStateGo.captures.b > 0 || AppStateGo.captures.w > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(capturesEl, "Captured – Black: " + AppStateGo.captures.b + " · White: " + AppStateGo.captures.w);
}

function updateGameLabelsGo() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateGo.moveCount ? "Move " + AppStateGo.moveCount : "");
  updateUndoButtonVisibilityGo();
  updatePassResignVisibilityGo();
  renderGoSetup();

  if (AppStateGo.gameOver) clearSavedGoGame();
  else saveGoGame();
}

function updateUndoButtonVisibilityGo() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateGo.undoStack || []).length > 0;
  btn.disabled = !(hasUndo);
}

function updatePassResignVisibilityGo() {
  const passBtn = document.getElementById("pass-button");
  const resignBtn = document.getElementById("resign-button");
  const show = !AppStateGo.gameOver &&
    (AppStateGo.mode === "offline" || AppStateGo.turn === AppStateGo.humanColor);
  if (passBtn) passBtn.classList.toggle("hidden", !show);
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateGo.gameOver);
}

document.addEventListener("DOMContentLoaded", initGoApp);
