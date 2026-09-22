// app.js

// Verknüpft UI, ChessCore und LichessApi zu einer kleinen Demo-App.

const AppState = {
  mode: "offline",      // "offline" | "offline-ai" | "online"
  board: ChessCore.createInitialBoard(),
  turn: "white",
  selected: null,       // e.g. "e2"
  lastMove: null,       // { from, to }
  pollingIntervalId: null,
  currentGame: null,    // online game object (e.g. from Lichess)
  awaitedGameId: null,   // set right after /api/challenge/ai: the exact game we're waiting to see appear
  seekBaselineIds: null, // set right after /api/board/seek: gameIds already playing before the seek, so we can spot the new one
  account: null,
  humanColor: "white",
  aiLevel: 2,
  gameOver: false,

  positionHistory: [],
  halfmoveClock: 0,   // Halbzüge seit letztem Bauernzug/letzter Schlagaktion (50-Züge-Regel)
  moveHistory: [],
  undoStack: [],
  viewColor: "white"    // Perspektive des Bretts: "white" oder "black"
};

const CHESS_SAVE_KEY = "einkchess_save_chess";

function saveChessGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(CHESS_SAVE_KEY, {
    mode: AppState.mode,
    board: AppState.board,
    turn: AppState.turn,
    lastMove: AppState.lastMove,
    humanColor: AppState.humanColor,
    aiLevel: AppState.aiLevel,
    viewColor: AppState.viewColor,
    positionHistory: AppState.positionHistory,
    halfmoveClock: AppState.halfmoveClock,
    moveHistory: AppState.moveHistory
  });
}

function clearSavedChessGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(CHESS_SAVE_KEY);
}

// Records a game's outcome from the human player's perspective, but only
// when actually playing the built-in AI - local 2-player and online games
// (already tracked by Lichess itself) aren't counted.
function recordChessStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppState.mode !== "offline-ai") return;
  GameStats.record("chess", outcome);
}

// Debounced Resize-Handling für langsame E‑Ink-Displays
let einkResizeHandlerAttached = false;
let einkResizeTimeoutId = null;


// Fallback: Einfaches LichessAuth für Geräte, auf denen lichess-auth.js nicht funktioniert (z.B. ältere E-Ink-Browser).
(function ensureLichessAuthFallback() {
  try {
    if (typeof window === "undefined") return;
  } catch (e) {
    return;
  }
  if (window.LichessAuth) {
    // Es existiert bereits eine "echte" Implementierung – nichts tun.
    return;
  }
  var TOKEN_KEY = "einkchess_lichess_manual_token";
  LichessAuth = window.LichessAuth = {
    getAccessToken: function () {
      try {
        if (window.localStorage) {
          return window.localStorage.getItem(TOKEN_KEY) || null;
        }
      } catch (e) {}
      return null;
    },
    login: function () {
      return new Promise(function (resolve, reject) {
        var msg = "Please enter your Lichess API token with the permission 'board:play'.\n" +
                  "You can create it on lichess.org under Settings → API access tokens.";
        var token = window.prompt(msg, "");
        if (token && token.trim()) {
          try {
            if (window.localStorage) {
              window.localStorage.setItem(TOKEN_KEY, token.trim());
            }
          } catch (e) {}
          resolve();
        } else {
          reject(new Error("No token entered."));
        }
      });
    },
    maybeFinishLoginFromRedirect: function () {
      // Auf Geräten ohne vollwertiges OAuth-Handling gibt es nichts zu tun.
      return Promise.resolve(false);
    },
    logout: function () {
      try {
        if (window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      } catch (e) {}
    }
  };
})();


;
function resetMoveHistory() {
  AppState.moveHistory = [];
  renderMoveList();
}


function resetUndoStack() {
  AppState.undoStack = [];
}

function pushUndoSnapshot() {
  if (!AppState.undoStack) AppState.undoStack = [];
  const boardCopy = AppState.board.map(row => row.slice());
  AppState.undoStack.push({
    board: boardCopy,
    turn: AppState.turn,
    gameOver: AppState.gameOver,
    halfmoveClock: AppState.halfmoveClock,
    positionHistory: (AppState.positionHistory || []).slice()
  });
}

function recordMove(color, from, to) {
  if (!AppState.moveHistory) AppState.moveHistory = [];
  AppState.moveHistory.push({ color: color, from: from, to: to });
  renderMoveList();
}

function renderMoveList() {
  const el = document.getElementById("moves-list");
  if (!el) return;
  const moves = AppState.moveHistory || [];
  if (!moves.length) {
    el.textContent = "";
    return;
  }
  const parts = moves.map(m => m.from + "–" + m.to);
  el.textContent = parts.join("; ");
  // Immer ans Ende scrollen, damit die neuesten Züge sichtbar sind
  el.scrollLeft = el.scrollWidth;
}
function setGameResult(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    // A fresh game starting should dismiss any popup left over from the
    // previous one, in case the player started a new game without
    // closing it first.
    window.ResultModal.hide();
  }
}

// Sets the compact result badge (#game-result) and the status line, and
// shows a centered popup with the same description - so the outcome is
// impossible to miss regardless of mode (offline, vs-computer, or online).
// Builds a short, prominent modal title from the chess notation result code
// ("1-0", "0-1", "½-½"). That code alone would be a confusing title for a
// casual player, so it's translated using the same you/computer/color
// distinction the message text already uses for each mode.
function chessResultTitle(resultCode) {
  if (resultCode === "½-½") return "Draw";
  const winnerColor = resultCode === "1-0" ? "white" : "black";
  if (AppState.mode === "offline-ai") {
    return winnerColor === AppState.humanColor ? "You win!" : "The computer wins";
  }
  if (AppState.mode === "online") {
    return winnerColor === AppState.viewColor ? "You win!" : "You lose";
  }
  return (winnerColor === "white" ? "White" : "Black") + " wins";
}

function announceGameResult(resultCode, message) {
  AppState.gameOver = true;
  if (AppState.mode === "offline" || AppState.mode === "offline-ai") {
    clearSavedChessGame();
  }
  setGameResult(message);
  setStatus("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(chessResultTitle(resultCode), message);
  }
}


function explainIllegalMove(movingColor, from, to) {
  const idxFrom = ChessCore.coordToIndex(from);
  const idxTo = ChessCore.coordToIndex(to);
  if (!idxFrom || !idxTo) {
    setStatus("board-info", "Invalid move: coordinates not understood.");
    return;
  }
  const board = AppState.board;
  const piece = board[idxFrom.rank][idxFrom.file];
  const colorName = movingColor === "white" ? "White" : "Black";

  if (!piece) {
    setStatus("board-info", "Invalid move: no piece on " + from + ".");
    return;
  }
  const isWhitePiece = ChessCore.isWhitePiece(piece);
  const pieceColor = isWhitePiece ? "white" : "black";
  if (pieceColor !== movingColor) {
    setStatus("board-info", "Invalid move: the piece on " + from + " is not yours.");
    return;
  }

  const target = board[idxTo.rank][idxTo.file];

  let pseudoMoves = [];
  if (AiEngine.generatePseudoMovesForColor) {
    pseudoMoves = AiEngine.generatePseudoMovesForColor(board, movingColor);
  }
  const fromMoves = pseudoMoves.filter(m => m.from === from);
  const pseudoTo = fromMoves.find(m => m.to === to);

  if (!fromMoves.length) {
    setStatus("board-info", "Invalid move: this piece currently has no legal destination squares.");
    return;
  }

  if (!pseudoTo) {
    if (target && ((movingColor === "white" && ChessCore.isWhitePiece(target)) ||
                   (movingColor === "black" && ChessCore.isBlackPiece(target)))) {
      setStatus("board-info", "Invalid move: you cannot capture your own piece on " + to + ".");
    } else {
      setStatus("board-info", "Invalid move: " + from + " cannot move to " + to + " by normal chess movement.");
    }
    return;
  }

  // If we get here, the move matches pseudo-legal movement, but was rejected by the legal-move generator:
  // that means it would leave the king in check.
  setStatus("board-info", "Invalid move: your king would be in check after " + from + "–" + to + ".");
}


function computePositionKey(board, turn) {
  // Einfache Repräsentation: Reihen von 8x8 plus Side-to-move
  const rows = [];
  for (let r = 0; r < 8; r++) {
    let row = "";
    for (let f = 0; f < 8; f++) {
      row += board[r][f] ? board[r][f] : ".";
    }
    rows.push(row);
  }
  return rows.join("/") + " " + turn;
}

function resetPositionHistory() {
  AppState.positionHistory = [];
  AppState.halfmoveClock = 0;
  recordCurrentPosition();
}

// Vor dem Ziehen aufrufen: true, wenn der Zug ein Bauernzug oder ein Schlag ist
// (dann wird der 50-Züge-Zähler zurückgesetzt), sonst false.
function isPawnMoveOrCapture(board, from, to) {
  const fromIdx = ChessCore.coordToIndex(from);
  const toIdx = ChessCore.coordToIndex(to);
  const piece = board[fromIdx.rank][fromIdx.file];
  if (!piece) return false;
  const isPawn = piece.toLowerCase() === "p";
  const isCapture = board[toIdx.rank][toIdx.file] != null || (isPawn && fromIdx.file !== toIdx.file);
  return isPawn || isCapture;
}

// Prüft Remisbedingungen, die nicht vom Zuganzahl-basierten Schachmatt/Patt abhängen.
// Setzt bei einem Remis Status und Ergebnis und gibt true zurück.
function checkAutoDraw() {
  if (isThreefoldRepetition()) {
    announceGameResult("½-½", "Draw by repetition.");
    recordChessStatsIfVsAi("draw");
    return true;
  }
  if (AppState.halfmoveClock >= 100) {
    announceGameResult("½-½", "Draw (50-move rule).");
    recordChessStatsIfVsAi("draw");
    return true;
  }
  if (AiEngine.hasInsufficientMaterial(AppState.board)) {
    announceGameResult("½-½", "Draw (insufficient material).");
    recordChessStatsIfVsAi("draw");
    return true;
  }
  return false;
}

function recordCurrentPosition() {
  if (!AppState.positionHistory) {
    AppState.positionHistory = [];
  }
  const key = computePositionKey(AppState.board, AppState.turn);
  AppState.positionHistory.push(key);
  return key;
}

function isThreefoldRepetition() {
  if (!AppState.positionHistory || AppState.positionHistory.length === 0) {
    return false;
  }
  const lastKey = AppState.positionHistory[AppState.positionHistory.length - 1];
  let count = 0;
  for (const k of AppState.positionHistory) {
    if (k === lastKey) count++;
  }
  return count >= 3;
}

function initApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");

  const loginBtn = document.getElementById("login-button");
  const logoutBtn = document.getElementById("logout-button");
  const userStatus = document.getElementById("user-status");
  const toggleMovesBtn = document.getElementById("toggle-moves");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");

  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const modeOnline = document.getElementById("mode-online");
  const onlineControls = document.getElementById("online-controls");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const aiColorChoice = document.getElementById("ai-color-choice");
  const aiLevelInline = document.getElementById("ai-level-inline");
  const startSeekBtn = document.getElementById("start-seek-button");
  const attachBtn = document.getElementById("attach-button");
  const startAiGameBtn = document.getElementById("start-ai-game");
  const resignBtn = document.getElementById("resign-button");
  const offerDrawBtn = document.getElementById("offer-draw-button");
  const onlineTabHuman = document.getElementById("online-tab-human");
  const onlineTabAi = document.getElementById("online-tab-ai");
  const onlineHumanRow = document.getElementById("online-human-row");
  const onlineAiRow = document.getElementById("online-ai-row");

  function updateAiColorChoiceVisibility() {
    if (!aiColorChoice || !aiLevelInline) return;
    const isTwoPlayer = aiLevelInline.value === "0";
    aiColorChoice.classList.toggle("hidden", isTwoPlayer);
  }

  function setOnlineTab(tab) {
    if (!onlineTabHuman || !onlineTabAi || !onlineHumanRow || !onlineAiRow) return;
    const isHuman = tab === "human";
    onlineTabHuman.classList.toggle("active-mode", isHuman);
    onlineTabAi.classList.toggle("active-mode", !isHuman);
    onlineHumanRow.classList.toggle("hidden", !isHuman);
    onlineAiRow.classList.toggle("hidden", isHuman);
  }

  if (onlineTabHuman) {
    onlineTabHuman.addEventListener("click", () => setOnlineTab("human"));
  }
  if (onlineTabAi) {
    onlineTabAi.addEventListener("click", () => setOnlineTab("ai"));
  }



  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi || !modeOnline) return;
    modeOffline.classList.remove("active-mode");
    modeOfflineAi.classList.remove("active-mode");
    modeOnline.classList.remove("active-mode");
    if (mode === "offline") modeOffline.classList.add("active-mode");
    else if (mode === "offline-ai") modeOfflineAi.classList.add("active-mode");
    else if (mode === "online") modeOnline.classList.add("active-mode");
  }

  // Die Spieleinstellungen (Modus wählen, neue Partie starten, Login) sind ein
  // aufklappbares Menü: vor dem ersten Zug offen, damit man loslegen kann,
  // während einer laufenden Partie eingeklappt, damit das Brett den Bildschirm
  // dominiert - aber über den Menü-Button jederzeit wieder erreichbar.
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
      if (settingsPanel.classList.contains("hidden")) {
        openSettingsPanel();
      } else {
        closeSettingsPanel();
      }
    });
  }

loginBtn.addEventListener("click", async () => {
    try {
      if (window.LichessAuth && typeof window.LichessAuth.login === "function") {
        await window.LichessAuth.login();
      } else {
        // Fallback: öffne die Lichess-Loginseite, wenn die API nicht verfügbar ist.
        window.location.href = "https://lichess.org/login";
      }
    } catch (e) {
      alert("Login failed: " + e.message);
    }
  });

modeOffline.addEventListener("click", () => {
  AppState.mode = "offline";
  updateActionButtonsVisibility();
  AppState.gameOver = false;
  AppState.viewColor = "white";
  setActiveModeButton("offline");
  AppState.board = ChessCore.createInitialBoard();
  AppState.turn = "white";
  AppState.selected = null;
  AppState.lastMove = null;
  resetPositionHistory();
  resetMoveHistory();
  resetUndoStack();
  setGameResult("");
  stopPolling();
  onlineControls.classList.add("hidden");
  if (offlineAiControls) {
    offlineAiControls.classList.add("hidden");
  }
  showBoardSection();
  buildBoardDOM();
  updateBoard();
  updateGameLabels();
  // Offline-Modus: Statuszeile erst nach Start einer Partie füllen
  setStatus("board-info", "");
});

  // Offline AI mode with color & level selection
  modeOfflineAi.addEventListener("click", () => {
    AppState.mode = "offline-ai";
    updateActionButtonsVisibility();
    setActiveModeButton("offline-ai");
    AppState.currentGame = null;
    stopPolling();
    onlineControls.classList.add("hidden");
    if (offlineAiControls) {
      offlineAiControls.classList.remove("hidden");
    }
  if (aiLevelInline) {
      const lvl = (typeof AppState.aiLevel === "number") ? AppState.aiLevel : 2;
      aiLevelInline.value = String(lvl);
    }
    updateAiColorChoiceVisibility();
    updateGameLabels();
    // Offline-AI: Board-Status leeren, bis eine Partie gestartet wird
    setStatus("board-info", "");
  });

startAiGameBtn.addEventListener("click", () => {
  AppState.gameOver = false;
  const colorInput = document.querySelector("input[name='ai-color']:checked");
  const color = colorInput ? colorInput.value : "white";
  let level = (typeof AppState.aiLevel === "number") ? AppState.aiLevel : 2;
  if (aiLevelInline) {
    const parsed = parseInt(aiLevelInline.value, 10);
    if (!Number.isNaN(parsed)) {
      level = parsed;
    }
  }

  AppState.humanColor = color;
  AppState.aiLevel = level;
  AppState.viewColor = color; // Brett-Perspektive an Spielerfarbe anpassen

  if (level === 0) {
    // Lokaler 2‑Spieler‑Modus, aber über das Computer-Panel gestartet.
    AppState.mode = "offline";
    updateActionButtonsVisibility();
    setActiveModeButton("offline-ai");
    AppState.board = ChessCore.createInitialBoard();
    updateAiColorChoiceVisibility();
    AppState.turn = "white";
    AppState.selected = null;
    AppState.lastMove = null;
    AppState.currentGame = null;
    resetPositionHistory();
    resetMoveHistory();
    resetUndoStack();
    setGameResult("");
    showBoardSection();
    buildBoardDOM();
    updateBoard();
    updateGameLabels();

    setStatus("offline-ai-status", "Local 2‑player game (no computer).");
    setStatus("board-info", "White to move.");
    return;
  }

  AppState.mode = "offline-ai";
  updateActionButtonsVisibility();
  const thinkHints = {
    1: "~800 Elo (instant)",
    2: "~1100 Elo (~1s/move)",
    3: "~1400 Elo (~2–4s/move)",
    4: "~1700 Elo (~5–10s/move)",
    5: "~2000 Elo (~10–20s/move)"
  };
  const hintText = thinkHints[level] || "";

  AppState.board = ChessCore.createInitialBoard();
  updateAiColorChoiceVisibility();
  AppState.turn = "white";
  AppState.selected = null;
  AppState.lastMove = null;
  AppState.currentGame = null;
  resetPositionHistory();
  resetMoveHistory();
  resetUndoStack();
  setGameResult("");
  showBoardSection();
  buildBoardDOM();
  updateBoard();
  updateGameLabels();

  const humanText = (color === "white" ? "White" : "Black");
  const statusText = "You play " + humanText + ", computer level " + level + (hintText ? " (" + hintText + ")." : ".");
  setStatus("offline-ai-status", statusText);

  if (color === "black") {
    // AI starts as White
    setStatus("board-info", "Computer thinking…");
    setTimeout(aiMoveOffline, 10);
  } else {
    setStatus("board-info", "Your move.");
  }
});
modeOnline.addEventListener("click", () => {
    AppState.mode = "online";
    updateActionButtonsVisibility();
    AppState.gameOver = false;
    AppState.viewColor = "white"; // Standardansicht, bis Farbe aus der Partie bekannt ist
    setActiveModeButton("online");
    onlineControls.classList.remove("hidden");
    if (offlineAiControls) {
      offlineAiControls.classList.add("hidden");
    }
    setOnlineTab("human");
    setGameResult("");
    resetMoveHistory();
    setStatus("board-info", "Online mode: log in and start a game.");
    updateGameLabels();
  });

  if (aiLevelInline) {

aiLevelInline.addEventListener("change", () => {
      const parsedLevel = parseInt(aiLevelInline.value, 10);
      const level = Number.isNaN(parsedLevel) ? (AppState.aiLevel || 2) : parsedLevel;
      AppState.aiLevel = level;
      updateGameLabels();
      updateAiColorChoiceVisibility();
      if (AppState.mode === "offline-ai") {
        if (level === 0) {
          setStatus("offline-ai-status", "Local 2‑player game (no computer).");
        } else {
          const thinkHints = {
            1: "~800 Elo (instant)",
            2: "~1100 Elo (~1s/move)",
            3: "~1400 Elo (~2–4s/move)",
            4: "~1700 Elo (~5–10s/move)",
            5: "~2000 Elo (~10–20s/move)"
          };
          const hintText = thinkHints[level] || "";
          setStatus("offline-ai-status", "Computer level " + level + (hintText ? " (" + hintText + ")." : " active."));
        }
      }
    });
  }

  if (toggleMovesBtn) {
    toggleMovesBtn.addEventListener("click", () => {
      const list = document.getElementById("moves-list");
      if (!list) return;
      const isHidden = list.classList.contains("hidden");
      if (isHidden) {
        list.classList.remove("hidden");
        renderMoveList();
      } else {
        list.classList.add("hidden");
      }
    });
  }


  if (resignBtn) {
    resignBtn.addEventListener("click", async () => {
      if (AppState.gameOver) return;

      // Online: resign via Lichess API
      if (AppState.mode === "online" && AppState.currentGame && AppState.currentGame.gameId) {
        try {
          await LichessApi.resignGame(AppState.currentGame.gameId);
          const myColor = AppState.currentGame.color === "white" ? "white" : "black";
          const result = myColor === "white" ? "0-1" : "1-0";
          announceGameResult(result, "You resigned.");
          AppState.gameOver = true;
        } catch (e) {
          setStatus("board-info", "Resign failed: " + (e && e.message ? e.message : "Unknown error."));
        }
        return;
      }

      // Offline & Computer
      const loser = AppState.turn || "white";
      const result = loser === "white" ? "0-1" : "1-0";
      announceGameResult(result, "Resigned. " + (loser === "white" ? "Black" : "White") + " wins.");
      AppState.gameOver = true;
    });
  }

  if (offerDrawBtn) {
    offerDrawBtn.addEventListener("click", async () => {
      if (AppState.gameOver) return;

      if (AppState.mode === "online" && AppState.currentGame && AppState.currentGame.gameId) {
        try {
          await LichessApi.handleDraw(AppState.currentGame.gameId, true);
          setStatus("board-info", "Draw offer sent.");
        } catch (e) {
          setStatus("board-info", "Draw offer failed: " + (e && e.message ? e.message : "Unknown error."));
        }
        return;
      }

      // Offline & Computer: draw by agreement
      announceGameResult("½-½", "Game drawn by agreement.");
      AppState.gameOver = true;
    });
  }


  startSeekBtn.addEventListener("click", async () => {
    if (!window.LichessAuth || !window.LichessAuth.getAccessToken || !window.LichessAuth.getAccessToken()) {
      alert("Please connect your online account first.");
      return;
    }
    AppState.gameOver = false;
    const profile = document.getElementById("time-profile").value;
    const rated = document.getElementById("rated-checkbox").checked;
    let timeMinutes = 15;
    let incrementSeconds = 10;
    if (profile === "10+0") {
      timeMinutes = 10;
      incrementSeconds = 0;
    } else if (profile === "15+10") {
      timeMinutes = 15;
      incrementSeconds = 10;
    } else if (profile === "25+10") {
      timeMinutes = 25;
      incrementSeconds = 10;
    } else if (profile === "30+20") {
      timeMinutes = 30;
      incrementSeconds = 20;
    }
    setStatus("online-status", "Searching (" + profile + (rated ? ", rated" : ", casual") + ") …");
    try {
      // Record which games are already active before we seek, so that once
      // matched we can tell our new game apart from any other game already
      // in progress on this account instead of blindly grabbing "the first
      // currently playing game" (which could be a stale/unrelated one).
      const before = await LichessApi.getNowPlayingList();
      AppState.seekBaselineIds = before.map(g => g.gameId);
      AppState.awaitedGameId = null;
      await LichessApi.createSeek({ timeMinutes, incrementSeconds, rated });
      AppState.currentGame = null;
      startPollingForGame();
    } catch (e) {
      setStatus("online-status", "Error: " + e.message);
    }
  });

  const startAiChallengeBtn = document.getElementById("start-ai-challenge-button");
  const aiOnlineLevel = document.getElementById("ai-online-level");

  if (startAiChallengeBtn) {
    startAiChallengeBtn.addEventListener("click", async () => {
      if (!window.LichessAuth || !window.LichessAuth.getAccessToken || !window.LichessAuth.getAccessToken()) {
        alert("Please connect your online account first.");
        return;
      }
      AppState.gameOver = false;
      const level = aiOnlineLevel ? parseInt(aiOnlineLevel.value, 10) : 3;
      const colorInput = document.querySelector("input[name='ai-online-color']:checked");
      const color = colorInput ? colorInput.value : "random";
      setStatus("online-status", "Starting game vs Lichess AI (level " + level + ") …");
      try {
        const created = await LichessApi.challengeAi({ level, color, timeMinutes: 15, incrementSeconds: 10 });
        AppState.awaitedGameId = created && created.id ? created.id : null;
        AppState.seekBaselineIds = null;
        AppState.currentGame = null;
        startPollingForGame("Loading game vs Lichess AI …");
      } catch (e) {
        setStatus("online-status", "Error: " + e.message);
      }
    });
  }

  attachBtn.addEventListener("click", async () => {
    if (!window.LichessAuth || !window.LichessAuth.getAccessToken || !window.LichessAuth.getAccessToken()) {
      alert("Please connect your online account first.");
      return;
    }
    try {
      const game = await LichessApi.getCurrentPlaying();
      if (!game) {
        setStatus("online-status", "No active game found.");
        return;
      }
      attachGame(game);
      startPollingForGame();
      setStatus("online-status", "Active game loaded.");
    } catch (e) {
      setStatus("online-status", "Error: " + e.message);
    }
  });

  updateActionButtonsVisibility();
  updateAiColorChoiceVisibility();
  setOnlineTab("human");

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(CHESS_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppState.mode = savedGame.mode;
    AppState.board = savedGame.board;
    AppState.turn = savedGame.turn;
    AppState.selected = null;
    AppState.lastMove = savedGame.lastMove;
    AppState.humanColor = savedGame.humanColor;
    AppState.aiLevel = savedGame.aiLevel;
    AppState.viewColor = savedGame.viewColor || "white";
    AppState.positionHistory = savedGame.positionHistory || [];
    AppState.halfmoveClock = savedGame.halfmoveClock || 0;
    AppState.moveHistory = savedGame.moveHistory || [];
    AppState.currentGame = null;
    AppState.gameOver = false;
    resetUndoStack();
    updateActionButtonsVisibility();
    setActiveModeButton(savedGame.mode);
    onlineControls.classList.add("hidden");
    if (savedGame.mode === "offline-ai" && offlineAiControls) {
      offlineAiControls.classList.remove("hidden");
      if (aiLevelInline) aiLevelInline.value = String(savedGame.aiLevel || 2);
      updateAiColorChoiceVisibility();
    }
    setGameResult("");
    showBoardSection();
    buildBoardDOM();
    updateBoard();
    updateGameLabels();
    renderMoveList();
    if (savedGame.mode === "offline-ai" && AppState.turn !== AppState.humanColor) {
      setStatus("board-info", "Computer thinking…");
      setTimeout(aiMoveOffline, 10);
    } else {
      setStatus("board-info", (AppState.turn === "white" ? "White" : "Black") + " to move.");
    }
  }

  // Versuchen, bestehenden Login aus Redirect zu vervollständigen
  LichessAuth.maybeFinishLoginFromRedirect()
    .then(async (didLogin) => {
      await refreshAccount(!!didLogin);
      // maybeFinishLoginFromRedirect() fails silently on several distinct
      // problems (lost login session, rejected code, network error) - if
      // one happened and we're still not connected, surface the specific
      // reason instead of the generic "not connected" default.
      if (!didLogin) {
        const err = window.LichessAuth.getLastError && window.LichessAuth.getLastError();
        const stillLoggedOut = !(window.LichessAuth.getAccessToken && window.LichessAuth.getAccessToken());
        if (err && stillLoggedOut) {
          updateUserPanel(err);
        }
      }
    })
    .catch(err => console.error(err));
}

async function refreshAccount(autoSwitchOnline) {
  const token = (window.LichessAuth && window.LichessAuth.getAccessToken) ? window.LichessAuth.getAccessToken() : null;
  if (!token) {
    updateUserPanel();
    return;
  }
  try {
    const account = await LichessApi.getAccount();
    AppState.account = account;
    updateUserPanel();
    if (autoSwitchOnline) {
      const modeOnline = document.getElementById("mode-online");
      if (modeOnline) {
        modeOnline.click();
      }
    }
  } catch (e) {
    updateUserPanel("Login error: " + e.message);
  }
}

function updateUserPanel(extraError) {
  const userStatus = document.getElementById("user-status");
  const loginBtn = document.getElementById("login-button");
  const logoutBtn = document.getElementById("logout-button");

  const i18n = (key) => (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : key;
  const token = (window.LichessAuth && window.LichessAuth.getAccessToken) ? window.LichessAuth.getAccessToken() : null;
  if (!token) {
    userStatus.textContent = extraError || i18n("not_connected");
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  } else if (AppState.account) {
    const a = AppState.account;
    const rapid = a.perfs && a.perfs.rapid ? a.perfs.rapid.rating : null;
    const classical = a.perfs && a.perfs.classical ? a.perfs.classical.rating : null;
    let txt = i18n("signed_in_as") + " " + a.username;
    if (rapid) txt += " · Rapid " + rapid;
    if (classical) txt += " · Classical " + classical;
    userStatus.textContent = txt;
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    userStatus.textContent = i18n("loading_profile");
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  }
}

function setStatus(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function showBoardSection() {
  const section = document.getElementById("board-section");
  if (section) {
    section.classList.remove("hidden");
  }
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  const movesList = document.getElementById("moves-list");
  if (placeholder) {
    placeholder.classList.add("hidden");
  }
  if (boardContainer) {
    boardContainer.classList.remove("hidden");
  }
  if (movesList) {
    movesList.classList.remove("hidden");
  }

  // Sobald wirklich eine Partie läuft, das Einstellungsmenü einklappen,
  // damit das Brett den Bildschirm einnimmt - über den Menü-Button bleibt
  // es jederzeit erreichbar.
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) {
    settingsPanel.classList.add("hidden");
  }
  if (menuToggle) {
    menuToggle.textContent = "☰ Menu";
  }
}

/*** Board-Darstellung ***/

function buildBoardDOM() {
  const boardEl = document.getElementById("board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  // Welche Perspektive? Standard: Weiß unten, bei "black" wird das Brett gedreht.
  const viewColor = AppState.viewColor === "black" ? "black" : "white";

  let rankIndices = [];
  let fileIndices = [];

  if (viewColor === "white") {
    // Oben: 8, unten: 1
    rankIndices = [7, 6, 5, 4, 3, 2, 1, 0];
    fileIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  } else {
    // Aus schwarzer Sicht: unten die 8. Reihe, Dateien gespiegelt
    rankIndices = [0, 1, 2, 3, 4, 5, 6, 7];
    fileIndices = [7, 6, 5, 4, 3, 2, 1, 0];
  }

  rankIndices.forEach((rank, rowIndex) => {
    fileIndices.forEach((file, colIndex) => {
      const square = document.createElement("button");
      square.className = "square";
      const isDark = (rank + file) % 2 === 1;
      square.classList.add(isDark ? "dark" : "light");
      const coord = ChessCore.indexToCoord(file, rank);
      square.dataset.coord = coord;
      square.dataset.file = coord.charAt(0);
      square.dataset.rank = coord.charAt(1);

      // Koordinaten nur an der linken & unteren Kante anzeigen – abhängig von der aktuellen Orientierung.
      if (colIndex === 0) {
        square.dataset.showRank = "1";
      }
      if (rowIndex === rankIndices.length - 1) {
        square.dataset.showFile = "1";
      }

      square.addEventListener("click", onSquareClick);
      boardEl.appendChild(square);
    });
  });

  // Fallback if aspect-ratio is not supported: enforce squares via JS.
  // On some eInk/older browsers the immediate width can still be 0,
  // so we schedule another pass after layout.
  ensureSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSquareAspectRatio);
  } else {
    setTimeout(ensureSquareAspectRatio, 0);
  }

  // Nur einen debouncten Resize-Handler anhängen – wichtig für E‑Ink
  if (!einkResizeHandlerAttached) {
    einkResizeHandlerAttached = true;
    window.addEventListener("resize", () => {
      if (einkResizeTimeoutId !== null) {
        clearTimeout(einkResizeTimeoutId);
      }
      einkResizeTimeoutId = setTimeout(() => {
        einkResizeTimeoutId = null;
        ensureSquareAspectRatio();
      }, 150);
    });
  }
}


function ensureSquareAspectRatio() {
  const boardEl = document.getElementById("board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const size = rect.width;
  const squares = boardEl.querySelectorAll(".square");
  const squareSize = size / 8;
  squares.forEach(sq => {
    sq.style.height = squareSize + "px";
  });
}
const CHESS_PIECE_NAMES = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };

function chessSquareAriaLabel(coord, piece, selected) {
  let label = coord;
  if (piece) {
    const color = ChessCore.isWhitePiece(piece) ? "White" : "Black";
    label += ", " + color + " " + (CHESS_PIECE_NAMES[piece.toLowerCase()] || "piece");
  } else {
    label += ", empty";
  }
  if (selected) label += ", selected";
  return label;
}

function updateBoard() {
  const boardEl = document.getElementById("board");
  if (!boardEl) return;
  const squares = boardEl.querySelectorAll(".square");
  squares.forEach(sq => {
    const coord = sq.dataset.coord;
    const idx = ChessCore.coordToIndex(coord);
    const piece = AppState.board[idx.rank][idx.file];

    // Auf E‑Ink unnötige DOM-Updates vermeiden: nur neu rendern, wenn sich
    // die Figur seit dem letzten Aufruf geändert hat.
    const key = piece || "";
    if (sq.dataset.renderedPiece !== key) {
      sq.innerHTML = (piece && window.PieceIcons && window.PieceIcons[piece]) || "";
      sq.dataset.renderedPiece = key;
    }

    sq.classList.remove("selected", "last-move", "piece-white", "piece-black");
    if (piece) {
      if (ChessCore.isWhitePiece(piece)) {
        sq.classList.add("piece-white");
      } else {
        sq.classList.add("piece-black");
      }
    }
    const isSelected = AppState.selected === coord;
    if (isSelected) {
      sq.classList.add("selected");
    }
    if (AppState.lastMove &&
        (AppState.lastMove.from === coord || AppState.lastMove.to === coord)) {
      sq.classList.add("last-move");
    }
    sq.setAttribute("aria-label", chessSquareAriaLabel(coord, piece, isSelected));
  });
  // Keep squares square, in case something changed the board width
  ensureSquareAspectRatio();
  updateScoreLine();
}





function computeCapturedPieces() {
  const board = AppState.board;
  const initial = {
    white: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    black: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 }
  };
  const current = {
    white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
  };

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      if (piece === piece.toUpperCase()) {
        current.white[piece.toLowerCase()]++;
      } else {
        current.black[piece]++;
      }
    }
  }

  const whiteCaptured = [];
  const blackCaptured = [];

  for (const p in initial.black) {
    const lost = initial.black[p] - current.black[p];
    for (let i = 0; i < lost; i++) whiteCaptured.push(p);
  }
  for (const p in initial.white) {
    const lost = initial.white[p] - current.white[p];
    for (let i = 0; i < lost; i++) blackCaptured.push(p);
  }

  return { whiteCaptured, blackCaptured };
}

function pieceToUnicode(piece, color) {
  const mapWhite = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" };
  const mapBlack = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
  return color === "white" ? mapWhite[piece] : mapBlack[piece];
}

function updateScoreLine() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  const diffEl = document.getElementById("score-diff");
  if (!container || !capturesEl || !diffEl) return;

  const active =
    AppState.mode === "offline" ||
    AppState.mode === "offline-ai" ||
    AppState.currentGame;

  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    diffEl.textContent = "";
    return;
  }

  container.classList.remove("hidden");

  const caps = computeCapturedPieces();

  // Von Weiß geschlagene Figuren (schwarze Steine) als schwarze Symbole anzeigen,
  // von Schwarz geschlagene Figuren (weiße Steine) als weiße Symbole.
  const whiteStr = caps.whiteCaptured.map(p => pieceToUnicode(p, "black")).join("");
  const blackStr = caps.blackCaptured.map(p => pieceToUnicode(p, "white")).join("");

  let mid = "";
  if (whiteStr || blackStr) {
    mid = whiteStr + (whiteStr && blackStr ? "   " : "") + blackStr;
  }
  capturesEl.textContent = mid;

  // Materialdifferenz: Weiß minus Schwarz
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let whiteScore = 0;
  let blackScore = 0;
  caps.whiteCaptured.forEach(p => { whiteScore += values[p] || 0; });
  caps.blackCaptured.forEach(p => { blackScore += values[p] || 0; });
  const diff = whiteScore - blackScore;

  let diffText = "";
  if (diff > 0) diffText = "+" + diff;
  else if (diff < 0) diffText = diff.toString();
  else diffText = "0";

  diffEl.textContent = diffText;
}

function updateUndoButtonVisibility() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const stack = AppState.undoStack || [];
  const hasUndo = stack.length > 0;
  const isOfflineMode = AppState.mode === "offline" || AppState.mode === "offline-ai";
  const shouldShow = isOfflineMode && hasUndo && !AppState.gameOver;
  btn.classList.toggle("hidden", !shouldShow);
}


function formatSecondsToClock(seconds) {
  if (typeof seconds !== "number" || !isFinite(seconds)) return "–";
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins + ":" + (secs < 10 ? "0" + secs : secs);
}




function updateActionButtonsVisibility() {
  // Draw/resign only make sense once an online game is actually running -
  // showing them beforehand is just clutter with nothing to act on yet.
  const showGameActions = AppState.mode === "online" && !!AppState.currentGame;
  const resignBtn = document.getElementById("resign-button");
  const offerDrawBtn = document.getElementById("offer-draw-button");
  if (resignBtn) {
    resignBtn.classList.toggle("hidden", !showGameActions);
  }
  if (offerDrawBtn) {
    offerDrawBtn.classList.toggle("hidden", !showGameActions);
  }
}

function updateGameLabels() {
  const label = document.getElementById("game-label");
  const meta = document.getElementById("game-meta");
  const clocks = document.getElementById("game-clocks");
  if (!label || !meta) {
    updateUndoButtonVisibility();
    return;
  }

  // Im Offline- und Computer-Modus keine zusätzlichen Titelzeilen anzeigen,
  // um das Layout auf dem eInk-Display möglichst clean zu halten.
  if (AppState.mode === "offline" || AppState.mode === "offline-ai") {
    label.textContent = "";
    meta.textContent = "";
    if (clocks) clocks.textContent = "";
    updateUndoButtonVisibility();
    if (AppState.gameOver) clearSavedChessGame();
    else saveChessGame();
    return;
  }

  if (AppState.currentGame) {
    const g = AppState.currentGame;
    const opponent = g.opponent && typeof g.opponent.ai === "number"
      ? "Computer (level " + g.opponent.ai + ")"
      : g.opponent ? g.opponent.username : (g.opponent && g.opponent.user && g.opponent.user.name) || "Opponent";
    const myColor = g.color === "white" ? "White" : "Black";
    const speed = g.speed || "";
    label.textContent = "Online: " + myColor + " vs " + opponent;
    meta.textContent = "Time control: " + (g.clock && g.clock.initial ? g.clock.initial + "s" : speed);

    if (clocks) {
      // secondsLeft kommt direkt aus /api/account/playing nowPlaying[0]
      const mySeconds = (typeof g.secondsLeft === "number") ? g.secondsLeft : null;
      clocks.textContent = mySeconds !== null
        ? "Your time: " + formatSecondsToClock(mySeconds)
        : "";
    }
  } else {
    label.textContent = "No game active";
    meta.textContent = "";
    if (clocks) clocks.textContent = "";
  }

  updateUndoButtonVisibility();
}






function onSquareClick(e) {
  if (AppState.gameOver) {
    setStatus("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  const coord = e.currentTarget.dataset.coord;
  if (!coord) return;

  if (AppState.mode === "online" && !AppState.currentGame) {
    setStatus("board-info", "No online game active.");
    return;
  }

  if (!AppState.selected) {
    // Startfeld wählen
    const idx = ChessCore.coordToIndex(coord);
    const piece = AppState.board[idx.rank][idx.file];
    if (!piece) return;

    if (AppState.mode === "online" && AppState.currentGame) {
      // Nur eigene Figuren auswählen (online)
      const myColor = AppState.currentGame.color === "white" ? "white" : "black";
      const isWhitePiece = ChessCore.isWhitePiece(piece);
      const pieceColor = isWhitePiece ? "white" : "black";
      if (pieceColor !== myColor) {
        return;
      }
      if (!AppState.currentGame.isMyTurn) {
        setStatus("board-info", "It's not your turn.");
        return;
      }
    }

    if (AppState.mode === "offline-ai") {
      // Nur eigene Farbe anwählen
      const isWhite = ChessCore.isWhitePiece(piece);
      const pieceColor = isWhite ? "white" : "black";
      if (pieceColor !== AppState.humanColor) {
        return;
      }
      if (AppState.turn !== AppState.humanColor) {
        setStatus("board-info", "Computer to move.");
        return;
      }
    }

    AppState.selected = coord;
    updateBoard();
    setStatus("board-info", "Von " + coord + " ziehen …");
  } else {
    // Ziel wählen
    const from = AppState.selected;
    const to = coord;
    if (from === to) {
      AppState.selected = null;
      setStatus("board-info", "");
      updateBoard();
      return;
    }

    if (AppState.mode === "offline") {
      // Offline: 2‑Spieler-Modus mit einfacher Legalitätsprüfung
      const moves = AiEngine.generateLegalMoves(AppState.board, AppState.turn);
      const legal = moves.find(m => m.from === from && m.to === to);
      if (!legal) {
        explainIllegalMove(AppState.turn, from, to);
        AppState.selected = null;
        updateBoard();
        return;
      }
      const movingColor = AppState.turn;
      const resetsHalfmove = isPawnMoveOrCapture(AppState.board, legal.from, legal.to);
      pushUndoSnapshot();
      ChessCore.applyMove(AppState.board, legal.from, legal.to, legal.promotion);
      AppState.halfmoveClock = resetsHalfmove ? 0 : AppState.halfmoveClock + 1;
      AppState.lastMove = { from: legal.from, to: legal.to };
      recordMove(movingColor, legal.from, legal.to);
      AppState.selected = null;
      AppState.turn = AppState.turn === "white" ? "black" : "white";
      updateBoard();
      updateGameLabels();

      // Save position after the move and check for repetition/other auto-draws
      recordCurrentPosition();
      if (checkAutoDraw()) {
        return;
      }

      const end = AiEngine.detectGameEnd(AppState.board, AppState.turn);
      if (end.status === "checkmate") {
        const winner = end.winner === "white" ? "White" : "Black";
        const result = winner === "White" ? "1-0" : "0-1";
        announceGameResult(result, "Checkmate! " + winner + " wins.");
      } else if (end.status === "stalemate") {
        announceGameResult("½-½", "Draw (stalemate).");
      } else {

const side = AppState.turn === "white" ? "White" : "Black";
setStatus("board-info", "Move: " + from + "–" + to + ". " + side + " to move.");
      }

    } else if (AppState.mode === "offline-ai") {
      // Human vs AI: only legal moves for the human color
      const moves = AiEngine.generateLegalMoves(AppState.board, AppState.humanColor);
      const legal = moves.find(m => m.from === from && m.to === to);
      if (!legal) {
        explainIllegalMove(AppState.humanColor, from, to);
        AppState.selected = null;
        updateBoard();
        return;
      }
      const resetsHalfmoveHuman = isPawnMoveOrCapture(AppState.board, legal.from, legal.to);
      pushUndoSnapshot();
      ChessCore.applyMove(AppState.board, legal.from, legal.to, legal.promotion);
      AppState.halfmoveClock = resetsHalfmoveHuman ? 0 : AppState.halfmoveClock + 1;
      AppState.lastMove = { from: legal.from, to: legal.to };
      recordMove(AppState.humanColor, legal.from, legal.to);
      AppState.selected = null;
      AppState.turn = AppState.humanColor === "white" ? "black" : "white";
      updateBoard();
      updateGameLabels();

      // Save position after the human move and check for repetition/other auto-draws
      recordCurrentPosition();
      if (checkAutoDraw()) {
        return;
      }

      const endAfterHuman = AiEngine.detectGameEnd(AppState.board, AppState.turn);
      if (endAfterHuman.status === "checkmate") {
        const winner = endAfterHuman.winner === "white" ? "White" : "Black";
        const result = winner === "White" ? "1-0" : "0-1";
        announceGameResult(result, "Checkmate! You win.");
        recordChessStatsIfVsAi("win");
        return;
      } else if (endAfterHuman.status === "stalemate") {
        announceGameResult("½-½", "Draw (stalemate).");
        recordChessStatsIfVsAi("draw");
        return;
      }

      setStatus("board-info", "Computer thinking…");
      // Let AI move after allowing UI to update
      setTimeout(aiMoveOffline, 10);
    } else if (AppState.mode === "online" && AppState.currentGame) {
      // Online-Zug an Lichess senden
      const promotion = maybeAutoQueen(from, to);
      const uci = from + to + (promotion ? promotion : "");
      sendOnlineMove(uci, from, to);
    }
  }
}

function maybeAutoQueen(from, to) {
  // einfache Auto-Queen-Logik für Bauern auf der 7. Reihe
  const fromIdx = ChessCore.coordToIndex(from);
  const toIdx = ChessCore.coordToIndex(to);
  const piece = AppState.board[fromIdx.rank][fromIdx.file];
  if (!piece) return null;
  const isWhite = ChessCore.isWhitePiece(piece);
  const isPawn = piece.toLowerCase() === "p";
  if (!isPawn) return null;
  if (isWhite && toIdx.rank === 7) return "q";
  if (!isWhite && toIdx.rank === 0) return "q";
  return null;
}

async function sendOnlineMove(uci, from, to) {
  if (!AppState.currentGame) return;
  if (!AppState.currentGame.isMyTurn) {
    setStatus("board-info", "It's not your turn.");
    return;
  }
  const gameId = AppState.currentGame.gameId;
  setStatus("board-info", "Sending move " + uci + " …");
  try {
    await LichessApi.makeMove(gameId, uci);
    // Let Lichess be the source of truth and fetch the position via /account/playing
    AppState.selected = null;
    AppState.lastMove = { from, to };
    setStatus("board-info", "Move sent. Waiting for confirmation…");
    // Direkt einmal nachziehen, bevor der normale Poll greift
    await pollOnce();
  } catch (e) {
    setStatus("board-info", "Move was rejected by server: " + e.message);
    AppState.selected = null;
    updateBoard();
  }
}

/*** Polling für Online-Spiel ***/

function startPollingForGame(statusMessage) {
  stopPolling();
  setStatus("online-status", statusMessage || "Searching for opponent…");
  AppState.currentGame = null;
  AppState.mode = "online";
  updateGameLabels();
  updateActionButtonsVisibility();

  AppState.pollingIntervalId = window.setInterval(() => {
    pollOnce().catch(err => console.error(err));
  }, 3000);

  // Gleich einmal initial pollen
  pollOnce().catch(err => console.error(err));
}

function stopPolling() {
  if (AppState.pollingIntervalId) {
    clearInterval(AppState.pollingIntervalId);
    AppState.pollingIntervalId = null;
  }
}

async function pollOnce() {
  if (!window.LichessAuth || !window.LichessAuth.getAccessToken || !window.LichessAuth.getAccessToken()) return;

  try {
    const list = await LichessApi.getNowPlayingList();

    // Pick the game we actually care about instead of blindly taking
    // nowPlaying[0], which can be a stale/unrelated game already on the
    // account (e.g. one started outside this app) and not the one we just
    // sought/challenged.
    let game = null;
    if (AppState.currentGame) {
      // Already attached to a game: keep following that exact game.
      game = list.find(g => g.gameId === AppState.currentGame.gameId) || null;
    } else if (AppState.awaitedGameId) {
      // Waiting for a specific game we just created (vs Lichess AI).
      game = list.find(g => g.gameId === AppState.awaitedGameId) || null;
    } else if (AppState.seekBaselineIds) {
      // Waiting for a seek to match: the new game is whichever one wasn't
      // already playing before we sought it.
      game = list.find(g => !AppState.seekBaselineIds.includes(g.gameId)) || null;
    } else {
      game = list[0] || null;
    }

    if (!game) {
      if (AppState.currentGame) {
        setStatus("online-status", "Game finished or no active game.");
      }
      AppState.currentGame = null;
      updateGameLabels();
      updateActionButtonsVisibility();
      return;
    }

    // Wenn wir schon in derselben Partie sind, prüfen wir erst, ob sich
    // überhaupt etwas geändert hat und ob der Nutzer gerade eine Figur ausgewählt hat.
    if (AppState.currentGame && AppState.currentGame.gameId === game.gameId) {
      // Während einer aktiven Auswahl das Brett nicht neu zeichnen,
      // damit die Erstauswahl erhalten bleibt.
      if (AppState.selected) {
        return;
      }
      // Wenn sich die Stellung (FEN) nicht geändert hat, nichts tun.
      if (AppState.currentGame.fen === game.fen) {
        return;
      }
    }

    AppState.awaitedGameId = null;
    AppState.seekBaselineIds = null;
    attachGame(game);
  } catch (e) {
    setStatus("online-status", "Polling error: " + e.message);
  }
}


function attachGame(game) {
  // Once we're locked onto a real game, any still-open seek stream is done
  // its job - release it.
  LichessApi.cancelSeek();

  // Prüfen, ob es sich um eine neue Partie handelt (für Move-History-Reset)
  const prev = AppState.currentGame;
  const isNewGame = !prev || prev.gameId !== game.gameId;

  AppState.currentGame = game;
  AppState.gameOver = false;
  const fen = game.fen;
  const parsed = ChessCore.parseFEN(fen);
  AppState.board = parsed.board;
  AppState.turn = parsed.turn;
  AppState.selected = null;
  AppState.lastMove = null;

  if (isNewGame) {
    resetMoveHistory();
    resetUndoStack();
    setGameResult("");
  }

  // Letzten Zug aus der Lichess-Antwort (UCI) übernehmen, falls vorhanden.
  // nowPlaying.lastMove ist z. B. "e2e4" oder "e7e8q".
  if (game && typeof game.lastMove === "string" && game.lastMove.length >= 4) {
    const uci = game.lastMove;
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    AppState.lastMove = { from, to };

    // Move-History auch im Online-Modus fortführen:
    // Die Seite, die gerade NICHT am Zug ist, hat den letzten Zug gemacht.
    const moverColor = (parsed.turn === "white") ? "black" : "white";
    recordMove(moverColor, from, to);
  }

  // Brett-Perspektive an eigene Farbe anpassen
  AppState.viewColor = (game.color === "white" ? "white" : "black");
  showBoardSection();
  buildBoardDOM();
  updateBoard();
  updateGameLabels();
  updateActionButtonsVisibility();
  const myColor = game.color === "white" ? "White" : "Black";
  const turnText = game.isMyTurn ? "Your move." : "Opponent to move.";
  setStatus("board-info", "Online game active. You play " + myColor + ". " + turnText);
}



async function aiMoveOffline() {
  if (AppState.mode !== "offline-ai") return;
  const aiColor = AppState.humanColor === "white" ? "black" : "white";
  if (AppState.turn !== aiColor) return;

  const moves = AiEngine.generateLegalMoves(AppState.board, aiColor);
  if (!moves.length) {
    const end = AiEngine.detectGameEnd(AppState.board, aiColor);
    if (end.status === "checkmate") {
      const result = aiColor === "white" ? "0-1" : "1-0";
      announceGameResult(result, "Checkmate! The computer is mated.");
      recordChessStatsIfVsAi("win");
    } else if (end.status === "stalemate") {
      announceGameResult("½-½", "Draw (stalemate).");
      recordChessStatsIfVsAi("draw");
    } else {
      setStatus("board-info", "Computer has no moves.");
    }
    return;
  }

  const move = AiEngine.chooseMove(AppState.board, aiColor, AppState.aiLevel);
  if (!move) {
    setStatus("board-info", "Computer cannot find a move.");
    return;
  }
  const resetsHalfmoveAi = isPawnMoveOrCapture(AppState.board, move.from, move.to);
  pushUndoSnapshot();
  ChessCore.applyMove(AppState.board, move.from, move.to, move.promotion);
  AppState.halfmoveClock = resetsHalfmoveAi ? 0 : AppState.halfmoveClock + 1;
  AppState.lastMove = { from: move.from, to: move.to };
  recordMove(aiColor, move.from, move.to);
  AppState.turn = aiColor === "white" ? "black" : "white";
  AppState.selected = null;
  updateBoard();
  updateGameLabels();

  // Save position after the AI move and check for repetition/other auto-draws
  recordCurrentPosition();
  if (checkAutoDraw()) {
    return;
  }

  const endForHuman = AiEngine.detectGameEnd(AppState.board, AppState.turn);
  if (endForHuman.status === "checkmate") {
    const result = aiColor === "white" ? "0-1" : "1-0";
    announceGameResult(result, "Checkmate! The computer wins.");
    recordChessStatsIfVsAi("loss");
  } else if (endForHuman.status === "stalemate") {
    announceGameResult("½-½", "Draw (stalemate).");
    recordChessStatsIfVsAi("draw");
  } else {
    setStatus("board-info", "Computer plays " + move.from + "–" + move.to + ". Your move.");
  }
}



// Undo last move in offline modes.
// Im Offline-KI-Modus werden zwei Halbzüge zurückgenommen, sodass der Mensch wieder am Zug ist.

function undoLastMove() {
  if (AppState.mode === "online") return;
  if (!AppState.undoStack || AppState.undoStack.length === 0) return;

  const stack = AppState.undoStack;

  let prev;
  let pliesToUndo = 1;

  if (AppState.mode === "offline-ai") {
    if (stack.length >= 2) {
      // Letzte zwei Schnappschüsse verwerfen -> zurück vor dem eigenen letzten Zug.
      stack.pop(); // Zustand vor dem KI-Zug
      prev = stack.pop(); // Zustand vor dem eigenen Zug
      pliesToUndo = 2;
    } else {
      prev = stack.pop();
      pliesToUndo = 1;
    }
  } else {
    // Normaler Offline-Modus: nur einen Zug zurücknehmen.
    prev = stack.pop();
    pliesToUndo = 1;
  }

  if (!prev) return;

  // Zugliste anpassen (letzte 1 bzw. 2 Halbzüge entfernen, falls vorhanden)
  if (AppState.moveHistory && AppState.moveHistory.length) {
    for (let i = 0; i < pliesToUndo && AppState.moveHistory.length > 0; i++) {
      AppState.moveHistory.pop();
    }
    renderMoveList();
  }

  AppState.board = prev.board;
  AppState.turn = prev.turn;
  AppState.gameOver = !!prev.gameOver;
  AppState.halfmoveClock = typeof prev.halfmoveClock === "number" ? prev.halfmoveClock : 0;
  AppState.positionHistory = prev.positionHistory ? prev.positionHistory.slice() : [];
  AppState.selected = null;
  AppState.lastMove = null; // Last-move-Markierung im Brett entfernen
  updateBoard();
  updateGameLabels();
  setStatus("board-info", "Move undone.");
}


document.addEventListener("DOMContentLoaded", initApp);
