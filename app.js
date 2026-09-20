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
  account: null,
  humanColor: "white",
  aiLevel: 2,
  gameOver: false,

  positionHistory: [],
  moveHistory: [],
  undoStack: [],
  viewColor: "white",    // Perspektive des Bretts: "white" oder "black"
  pieceStyle: "unicode"  // "unicode" (♟) oder "letters" (P,N,B,R,Q,K)
};

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
    gameOver: AppState.gameOver
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
  if (!el) return;
  el.textContent = text || "";
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
  recordCurrentPosition();
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
  const loginBtn = document.getElementById("login-button");
  const logoutBtn = document.getElementById("logout-button");
  const userStatus = document.getElementById("user-status");
  const toggleMovesBtn = document.getElementById("toggle-moves");
  const highContrastToggle = document.getElementById("high-contrast-toggle");
  const pieceStyleToggle = document.getElementById("toggle-piece-style");

  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const modeOnline = document.getElementById("mode-online");
  const onlineControls = document.getElementById("online-controls");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const aiInlineControls = document.getElementById("ai-inline-controls");
  const aiLevelInline = document.getElementById("ai-level-inline");
  const startSeekBtn = document.getElementById("start-seek-button");
  const attachBtn = document.getElementById("attach-button");
  const startAiGameBtn = document.getElementById("start-ai-game");
  const resignBtn = document.getElementById("resign-button");
  const offerDrawBtn = document.getElementById("offer-draw-button");



  function updateActionButtonsVisibility() {
    const isOnline = AppState.mode === "online";
    if (resignBtn) {
      if (isOnline) {
        resignBtn.classList.remove("hidden");
      } else {
        resignBtn.classList.add("hidden");
      }
    }
    if (offerDrawBtn) {
      if (isOnline) {
        offerDrawBtn.classList.remove("hidden");
      } else {
        offerDrawBtn.classList.add("hidden");
      }
    }
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
  if (aiInlineControls) {
    aiInlineControls.classList.add("hidden");
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
    if (aiInlineControls) {
      aiInlineControls.classList.remove("hidden");
    }
  if (aiLevelInline) {
      const lvl = (typeof AppState.aiLevel === "number") ? AppState.aiLevel : 2;
      aiLevelInline.value = String(lvl);
    }
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
    if (aiInlineControls) {
      aiInlineControls.classList.remove("hidden");
    }
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
    1: "~600 Elo (~1s/move)",
    2: "~900 Elo (~2s/move)",
    3: "~1200 Elo (~4s/move)",
    4: "~1400 Elo (~4–6s/move)",
    5: "~1600 Elo (~6–10s/move)"
  };
  const hintText = thinkHints[level] || "";

  AppState.board = ChessCore.createInitialBoard();
  if (aiInlineControls) {
    aiInlineControls.classList.remove("hidden");
  }
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
    if (aiInlineControls) {
      aiInlineControls.classList.add("hidden");
    }
    setGameResult("");
    resetMoveHistory();
    setStatus("board-info", "Online mode: log in and start a game.");
    updateGameLabels();
  });

  if (aiLevelInline) {

aiLevelInline.addEventListener("change", () => {
      const level = parseInt(aiLevelInline.value, 10) || AppState.aiLevel || 2;
      AppState.aiLevel = level;
      updateGameLabels();
      if (AppState.mode === "offline-ai") {


const thinkHints = {
  1: "~600 Elo (~1s/move)",
  2: "~900 Elo (~2s/move)",
  3: "~1200 Elo (~4s/move)",
  4: "~1400 Elo (~4–6s/move)",
  5: "~1600 Elo (~6–10s/move)"
};
        const hintText = thinkHints[level] || "";
        setStatus("offline-ai-status", "Computer level " + level + (hintText ? " (" + hintText + ")." : " active."));
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


  if (highContrastToggle) {
    const body = document.body;
    // Initialzustand im Button widerspiegeln
    highContrastToggle.textContent = body.classList.contains("high-contrast") ? "Standard" : "Kontrast";
    highContrastToggle.addEventListener("click", () => {
      const enabled = body.classList.toggle("high-contrast");
      highContrastToggle.textContent = enabled ? "Standard" : "Kontrast";
    });
  }

  if (pieceStyleToggle) {
    pieceStyleToggle.addEventListener("click", () => {
      AppState.pieceStyle =
        AppState.pieceStyle === "unicode" ? "letters" : "unicode";
      updateBoard();
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
          setGameResult(result);
          setStatus("board-info", "You resigned.");
          AppState.gameOver = true;
        } catch (e) {
          setStatus("board-info", "Resign failed: " + (e && e.message ? e.message : "Unknown error."));
        }
        return;
      }

      // Offline & Computer
      const loser = AppState.turn || "white";
      const result = loser === "white" ? "0-1" : "1-0";
      setGameResult(result);
      setStatus("board-info", "Resigned. " + (loser === "white" ? "Black" : "White") + " wins.");
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
      setGameResult("½-½");
      setStatus("board-info", "Game drawn by agreement.");
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
        await LichessApi.challengeAi({ level, color, timeMinutes: 15, incrementSeconds: 10 });
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

  // Versuchen, bestehenden Login aus Redirect zu vervollständigen
  LichessAuth.maybeFinishLoginFromRedirect()
    .then((didLogin) => refreshAccount(!!didLogin))
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

  const token = (window.LichessAuth && window.LichessAuth.getAccessToken) ? window.LichessAuth.getAccessToken() : null;
  if (!token) {
    userStatus.textContent = extraError || "Online account not connected.";
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  } else if (AppState.account) {
    const a = AppState.account;
    const rapid = a.perfs && a.perfs.rapid ? a.perfs.rapid.rating : null;
    const classical = a.perfs && a.perfs.classical ? a.perfs.classical.rating : null;
    let txt = "Signed in as " + a.username;
    if (rapid) txt += " · Rapid " + rapid;
    if (classical) txt += " · Classical " + classical;
    userStatus.textContent = txt;
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    userStatus.textContent = "Online account connected, loading profile…";
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

  // Figuren-Design-Umschalter erst zeigen, wenn ein Brett aktiv ist
  const pieceStyleToggle = document.getElementById("toggle-piece-style");
  if (pieceStyleToggle) {
    pieceStyleToggle.classList.remove("hidden");
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
function updateBoard() {
  const boardEl = document.getElementById("board");
  if (!boardEl) return;
  const squares = boardEl.querySelectorAll(".square");
  squares.forEach(sq => {
    const coord = sq.dataset.coord;
    const idx = ChessCore.coordToIndex(coord);
    const piece = AppState.board[idx.rank][idx.file];

    const glyph = (AppState.pieceStyle === "letters")
      ? ChessCore.pieceToLetter(piece)
      : ChessCore.pieceToGlyph(piece);

    // Auf E‑Ink unnötige Text-Updates vermeiden
    if (sq.textContent !== glyph) {
      sq.textContent = glyph;
    }

    sq.classList.remove("selected", "last-move", "piece-white", "piece-black");
    if (piece) {
      if (ChessCore.isWhitePiece(piece)) {
        sq.classList.add("piece-white");
      } else {
        sq.classList.add("piece-black");
      }
    }
    if (AppState.selected === coord) {
      sq.classList.add("selected");
    }
    if (AppState.lastMove &&
        (AppState.lastMove.from === coord || AppState.lastMove.to === coord)) {
      sq.classList.add("last-move");
    }
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
  btn.style.display = shouldShow ? "" : "none";
}


function formatSecondsToClock(seconds) {
  if (typeof seconds !== "number" || !isFinite(seconds)) return "–";
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins + ":" + (secs < 10 ? "0" + secs : secs);
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
      pushUndoSnapshot();
      ChessCore.applyMove(AppState.board, legal.from, legal.to, legal.promotion);
      AppState.lastMove = { from: legal.from, to: legal.to };
      recordMove(movingColor, legal.from, legal.to);
      AppState.selected = null;
      AppState.turn = AppState.turn === "white" ? "black" : "white";
      updateBoard();
      updateGameLabels();

      // Save position after the move and check for repetition
      recordCurrentPosition();
      if (isThreefoldRepetition()) {
        setStatus("board-info", "Draw by repetition.");
        setGameResult("½-½");
        return;
      }

      const end = AiEngine.detectGameEnd(AppState.board, AppState.turn);
      if (end.status === "checkmate") {
        const winner = end.winner === "white" ? "White" : "Black";
        const result = winner === "White" ? "1-0" : "0-1";
        setGameResult(result);
        setStatus("board-info", "Checkmate! " + winner + " wins.");
      } else if (end.status === "stalemate") {
        setGameResult("½-½");
        setStatus("board-info", "Draw (stalemate).");
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
      pushUndoSnapshot();
      ChessCore.applyMove(AppState.board, legal.from, legal.to, legal.promotion);
      recordMove(AppState.humanColor, legal.from, legal.to);
      AppState.selected = null;
      AppState.turn = AppState.humanColor === "white" ? "black" : "white";
      updateBoard();
      updateGameLabels();

      // Save position after the human move and check for repetition
      recordCurrentPosition();
      if (isThreefoldRepetition()) {
        setStatus("board-info", "Draw by repetition.");
        setGameResult("½-½");
        return;
      }

      const endAfterHuman = AiEngine.detectGameEnd(AppState.board, AppState.turn);
      if (endAfterHuman.status === "checkmate") {
        const winner = endAfterHuman.winner === "white" ? "White" : "Black";
        const result = winner === "White" ? "1-0" : "0-1";
        setGameResult(result);
        setStatus("board-info", "Checkmate! You win.");
        return;
      } else if (endAfterHuman.status === "stalemate") {
        setGameResult("½-½");
        setStatus("board-info", "Draw (stalemate).");
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
    const game = await LichessApi.getCurrentPlaying();
    if (!game) {
      if (AppState.currentGame) {
        setStatus("online-status", "Game finished or no active game.");
      }
      AppState.currentGame = null;
      updateGameLabels();
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

    attachGame(game);
  } catch (e) {
    setStatus("online-status", "Polling error: " + e.message);
  }
}


function attachGame(game) {
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
      setStatus("board-info", "Checkmate! The computer is mated.");
      const result = aiColor === "white" ? "0-1" : "1-0";
      setGameResult(result);
    } else if (end.status === "stalemate") {
      setStatus("board-info", "Draw (stalemate).");
      setGameResult("½-½");
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
  pushUndoSnapshot();
  ChessCore.applyMove(AppState.board, move.from, move.to, move.promotion);
  AppState.lastMove = { from: move.from, to: move.to };
  recordMove(aiColor, move.from, move.to);
  AppState.turn = aiColor === "white" ? "black" : "white";
  AppState.selected = null;
  updateBoard();
  updateGameLabels();

  // Save position after the AI move and check for repetition
  recordCurrentPosition();
  if (isThreefoldRepetition()) {
    setStatus("board-info", "Draw by repetition.");
    setGameResult("½-½");
    return;
  }

  const endForHuman = AiEngine.detectGameEnd(AppState.board, AppState.turn);
  if (endForHuman.status === "checkmate") {
    setStatus("board-info", "Checkmate! The computer wins.");
    const result = aiColor === "white" ? "0-1" : "1-0";
    setGameResult(result);
  } else if (endForHuman.status === "stalemate") {
    setStatus("board-info", "Draw (stalemate).");
    setGameResult("½-½");
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
  AppState.selected = null;
  AppState.lastMove = null; // Last-move-Markierung im Brett entfernen
  updateBoard();
  updateGameLabels();
  setStatus("board-info", "Move undone.");
}


document.addEventListener("DOMContentLoaded", initApp);
