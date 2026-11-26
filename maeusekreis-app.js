// maeusekreis-app.js
// Wires MaeusekreisCore/MaeusekreisAi to maeusekreis.html (Mouse Ring).
// A ring of points drawn as SVG, the lines across dashed (only the cat may
// use them), one round button per point on top. The side to move taps one
// of the marked points next to its figure. Against the computer the person
// plays the cat or the mouse.

const AppStateMaeusekreis = {
  mode: "offline",        // "offline" | "offline-ai"
  state: MaeusekreisCore.createInitialState(2),
  turn: "mouse",          // mirrors state.turn - the mouse always begins
  humanColor: "cat",      // the person's side against the computer: "cat" | "mouse"
  aiLevel: 2,
  gameOver: false,
  undoStack: []
};

const MAEUSEKREIS_SAVE_KEY = "einkchess_save_maeusekreis";
const MK_SVG_NS = "http://www.w3.org/2000/svg";

// The two figures, black and white only: a black cat head with pointed ears,
// a white mouse with round ears and a tail.
const MK_FIGURES = {
  cat: '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<polygon points="7,19 9,3 20,12" fill="#141413"/><polygon points="33,19 31,3 20,12" fill="#141413"/>' +
    '<circle cx="20" cy="22" r="14" fill="#141413"/>' +
    '<ellipse cx="14.5" cy="20" rx="2.6" ry="3.2" fill="#fff"/><ellipse cx="25.5" cy="20" rx="2.6" ry="3.2" fill="#fff"/>' +
    '<polygon points="18,25.5 22,25.5 20,28" fill="#fff"/>' +
    '<g stroke="#fff" stroke-width="1.2" stroke-linecap="round"><line x1="11" y1="27" x2="4" y2="25.5"/><line x1="11" y1="29" x2="4" y2="30"/><line x1="29" y1="27" x2="36" y2="25.5"/><line x1="29" y1="29" x2="36" y2="30"/></g>' +
    '</svg>',
  mouse: '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<path d="M27 31 C 36 33, 39 25, 35 19" fill="none" stroke="#141413" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="11" cy="12" r="6.5" fill="#fff" stroke="#141413" stroke-width="2.4"/><circle cx="29" cy="12" r="6.5" fill="#fff" stroke="#141413" stroke-width="2.4"/>' +
    '<circle cx="20" cy="23" r="11.5" fill="#fff" stroke="#141413" stroke-width="2.4"/>' +
    '<circle cx="16" cy="21" r="1.9" fill="#141413"/><circle cx="24" cy="21" r="1.9" fill="#141413"/>' +
    '<circle cx="20" cy="27" r="1.8" fill="#141413"/>' +
    '</svg>'
};

function figureMaeusekreis(el) {
  const who = el.getAttribute("data-mk-figure");
  if (MK_FIGURES[who] && !el.firstChild) el.innerHTML = MK_FIGURES[who];
}

function setStateMaeusekreis(state) {
  AppStateMaeusekreis.state = state;
  AppStateMaeusekreis.turn = state.turn;
  AppStateMaeusekreis.gameOver = !!state.result;
}

function saveMaeusekreisGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MAEUSEKREIS_SAVE_KEY, {
    mode: AppStateMaeusekreis.mode,
    state: AppStateMaeusekreis.state,
    humanColor: AppStateMaeusekreis.humanColor,
    aiLevel: AppStateMaeusekreis.aiLevel,
    undoStack: AppStateMaeusekreis.undoStack.slice(-50)
  });
}

function clearSavedMaeusekreisGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(MAEUSEKREIS_SAVE_KEY);
}

function isMaeusekreisState(s) {
  if (!s || !MaeusekreisCore.BOARDS[s.level]) return false;
  const n = MaeusekreisCore.BOARDS[s.level].points;
  const point = (p) => Number.isInteger(p) && p >= 0 && p < n;
  return point(s.cat) && point(s.mouse) && (s.turn === "cat" || s.turn === "mouse") &&
    Number.isInteger(s.limit) && s.limit > 0 && Number.isInteger(s.catSteps) && s.catSteps >= 0 && s.catSteps <= s.limit;
}

function recordMaeusekreisStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateMaeusekreis.mode !== "offline-ai") return;
  GameStats.record("maeusekreis", outcome);
}

function sideNameMaeusekreis(who) {
  return who === "cat" ? "Cat" : "Mouse";
}

function otherSideMaeusekreis(who) {
  return who === "cat" ? "mouse" : "cat";
}

function setStatusMaeusekreis(elementId, text) {
  if (AppStateMaeusekreis.mode === "offline-ai" && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateMaeusekreis);
  }
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultMaeusekreis(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleMaeusekreis(winner) {
  if (AppStateMaeusekreis.mode === "offline-ai") {
    return winner === AppStateMaeusekreis.humanColor ? "You win!" : "You lose";
  }
  return winner === "cat" ? "The cat wins" : "The mouse wins";
}

function announceGameResultMaeusekreis(winner, message) {
  setGameResultMaeusekreis(message);
  setStatusMaeusekreis("board-info", message);
  if (window.ResultModal) window.ResultModal.show(resultTitleMaeusekreis(winner), message);
}

function humanCanActMaeusekreis() {
  const A = AppStateMaeusekreis;
  if (A.gameOver) return false;
  return !(A.mode === "offline-ai" && A.turn !== A.humanColor);
}

function showPromptMaeusekreis(prefix) {
  const A = AppStateMaeusekreis;
  const computer = A.mode === "offline-ai" && A.turn !== A.humanColor;
  setStatusMaeusekreis("board-info", computer ? "Computer thinking…" : (prefix ? prefix + " " : "") + sideNameMaeusekreis(A.turn) + " to move.");
}

function pushUndoSnapshotMaeusekreis() {
  AppStateMaeusekreis.undoStack.push({ state: AppStateMaeusekreis.state });
}

function initMaeusekreisApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  document.querySelectorAll("[data-mk-figure]").forEach(figureMaeusekreis);
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const levelInline = document.getElementById("maeusekreis-level-inline");
  const sideChoice = document.getElementById("maeusekreis-side-choice");
  const startGameBtn = document.getElementById("start-maeusekreis-game");
  const resignBtn = document.getElementById("resign-button");

  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
    if (sideChoice) sideChoice.classList.toggle("hidden", mode !== "offline-ai");
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

  function currentLevel() {
    const v = levelInline ? parseInt(levelInline.value, 10) : 2;
    return MaeusekreisCore.BOARDS[v] ? v : 2;
  }

  // Two players: the level picks only the board. Against the computer it
  // also sets the computer's strength; as the mouse the person gets a cat
  // with one step less, so good running gets the mouse away.
  function startNewGameMaeusekreis(mode, humanColor) {
    const level = currentLevel();
    const A = AppStateMaeusekreis;
    A.mode = mode;
    A.humanColor = humanColor;
    A.aiLevel = level;
    A.undoStack = [];
    setStateMaeusekreis(MaeusekreisCore.createInitialState(level, Math.random, mode === "offline-ai" && humanColor === "mouse"));
    setGameResultMaeusekreis("");
    showBoardSectionMaeusekreis();
    buildMaeusekreisBoardDOM();
    updateMaeusekreisBoard();
    updateGameLabelsMaeusekreis();
    showPromptMaeusekreis();
    maybeTriggerAiTurnMaeusekreis();
  }

  // The mode the next "New game" uses; picking "Against the computer" only
  // shows the side, the level and "New game", like the other games here.
  let pendingMode = "offline";

  modeOffline.addEventListener("click", () => {
    pendingMode = "offline";
    setActiveModeButton("offline");
    startNewGameMaeusekreis("offline", "cat");
  });

  modeOfflineAi.addEventListener("click", () => {
    pendingMode = "offline-ai";
    setActiveModeButton("offline-ai");
    setStatusMaeusekreis("board-info", "");
  });

  startGameBtn.addEventListener("click", () => {
    const mode = pendingMode;
    setActiveModeButton(mode);
    if (mode !== "offline-ai") {
      startNewGameMaeusekreis("offline", "cat");
      return;
    }
    const input = document.querySelector("input[name='maeusekreis-side']:checked");
    const side = RandomStart.choose(input && input.value === "mouse" ? "mouse" : "cat", ["cat", "mouse"]);
    startNewGameMaeusekreis("offline-ai", side);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    // Straight to the line, not through UiStatus.rewrite (that would make it "Your turn.").
    const startLine = document.getElementById("offline-maeusekreis-status");
    if (startLine) I18n.setMsg(startLine,
      RandomStart.label("You play the " + (side === "cat" ? "cat" : "mouse") + ", computer level: " + (levelNames[currentLevel()] || currentLevel()) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      const A = AppStateMaeusekreis;
      if (A.gameOver) return;
      const winner = otherSideMaeusekreis(UiStatus.resigner(A));
      A.gameOver = true;
      announceGameResultMaeusekreis(winner, winner === "cat" ? "The cat wins by resignation." : "The mouse wins by resignation.");
      recordMaeusekreisStatsIfVsAi("loss");
      updateMaeusekreisBoard();
      updateGameLabelsMaeusekreis();
    });
  }

  if (levelInline) levelInline.value = String(AppStateMaeusekreis.aiLevel);
  if (sideChoice) sideChoice.classList.add("hidden");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(MAEUSEKREIS_SAVE_KEY) : null;
  if (saved && isMaeusekreisState(saved.state) && !saved.state.result) {
    const A = AppStateMaeusekreis;
    A.mode = saved.mode === "offline-ai" ? "offline-ai" : "offline";
    pendingMode = A.mode;
    A.humanColor = saved.humanColor === "mouse" ? "mouse" : "cat";
    A.aiLevel = MaeusekreisCore.BOARDS[saved.aiLevel] ? saved.aiLevel : saved.state.level;
    setStateMaeusekreis(saved.state);
    A.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    A.undoStack = A.undoStack.filter((u) => u && isMaeusekreisState(u.state) && u.state.level === saved.state.level);
    if (levelInline) levelInline.value = String(A.aiLevel);
    setActiveModeButton(A.mode);
    setGameResultMaeusekreis("");
    showBoardSectionMaeusekreis();
    buildMaeusekreisBoardDOM();
    updateMaeusekreisBoard();
    updateGameLabelsMaeusekreis();
    showPromptMaeusekreis();
    maybeTriggerAiTurnMaeusekreis();
  }
  // Otherwise no game starts by itself: the placeholder shows until the
  // player picks a mode, like the other games here.
}

function onMaeusekreisPointClick(e) {
  const A = AppStateMaeusekreis;
  const to = parseInt(e.currentTarget.dataset.point, 10);
  if (A.gameOver) {
    setStatusMaeusekreis("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!humanCanActMaeusekreis()) {
    setStatusMaeusekreis("board-info", "Computer to move.");
    return;
  }
  if (MaeusekreisCore.isLegalMove(A.state, to)) applyMaeusekreisMove(to);
}

function applyMaeusekreisMove(to) {
  const A = AppStateMaeusekreis;
  pushUndoSnapshotMaeusekreis();
  const next = MaeusekreisCore.applyMove(A.state, to);
  setStateMaeusekreis(next);
  updateMaeusekreisBoard();
  updateGameLabelsMaeusekreis();
  if (next.result) {
    const w = next.result.winner;
    const caught = next.cat === next.mouse;
    announceGameResultMaeusekreis(w, w === "cat"
      ? (caught ? "The cat wins: it catches the mouse." : "The cat wins: the mouse cannot step anywhere.")
      : "The mouse wins: the cat has no steps left.");
    recordMaeusekreisStatsIfVsAi(w === A.humanColor ? "win" : "loss");
    return;
  }
  showPromptMaeusekreis();
  maybeTriggerAiTurnMaeusekreis();
}

function maybeTriggerAiTurnMaeusekreis() {
  const A = AppStateMaeusekreis;
  if (A.gameOver) return;
  if (A.mode === "offline-ai" && A.turn !== A.humanColor) setTimeout(aiTurnMaeusekreis, AiPacing.delay(400));
}

function aiTurnMaeusekreis() {
  const A = AppStateMaeusekreis;
  if (A.mode !== "offline-ai" || A.gameOver) return;
  const aiSide = otherSideMaeusekreis(A.humanColor);
  if (A.turn !== aiSide) return;
  setStatusMaeusekreis("board-info", "Computer thinking…");
  // The position this step is for: if it has changed by the time the pause
  // is over (undo, new game), the computer must not move.
  const scheduledFor = A.state;
  setTimeout(() => {
    if (A.gameOver || A.state !== scheduledFor || A.turn !== aiSide) return;
    const to = MaeusekreisAi.chooseMove(A.state, A.aiLevel);
    if (to !== null && to !== undefined) applyMaeusekreisMove(to);
  }, AiPacing.delay(300));
}

function undoLastMove() {
  const A = AppStateMaeusekreis;
  if (!A.undoStack || !A.undoStack.length) return;
  let prev = A.undoStack.pop();
  if (A.mode === "offline-ai") {
    while (prev.state.turn !== A.humanColor && A.undoStack.length) prev = A.undoStack.pop();
  }
  setStateMaeusekreis(prev.state);
  setGameResultMaeusekreis("");
  updateMaeusekreisBoard();
  updateGameLabelsMaeusekreis();
  showPromptMaeusekreis("Move undone.");
  maybeTriggerAiTurnMaeusekreis();
}

function showBoardSectionMaeusekreis() {
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

// Point i sits at the top for 0 and goes round clockwise; coordinates are
// in percent of the board (SVG viewBox 0 0 100 100).
const MK_RADIUS = 40;
function pointXYMaeusekreis(n, i) {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
  return { x: 50 + MK_RADIUS * Math.cos(a), y: 50 + MK_RADIUS * Math.sin(a) };
}

function svgElMaeusekreis(name, attrs) {
  const el = document.createElementNS(MK_SVG_NS, name);
  Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
  return el;
}

function buildMaeusekreisBoardDOM() {
  const boardEl = document.getElementById("maeusekreis-board");
  if (!boardEl) return;
  const st = AppStateMaeusekreis.state;
  const b = MaeusekreisCore.BOARDS[st.level];
  boardEl.innerHTML = "";
  boardEl.dataset.level = String(st.level);
  const svg = svgElMaeusekreis("svg", { viewBox: "0 0 100 100", class: "mk-lines", "aria-hidden": "true", focusable: "false" });
  svg.appendChild(svgElMaeusekreis("circle", { cx: 50, cy: 50, r: MK_RADIUS, fill: "none", stroke: "#141413", "stroke-width": 1.2 }));
  b.chords.forEach((c) => {
    const p = pointXYMaeusekreis(b.points, c[0]);
    const q = pointXYMaeusekreis(b.points, c[1]);
    svg.appendChild(svgElMaeusekreis("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: "#141413", "stroke-width": 1.2, "stroke-dasharray": "3 2.2", class: "mk-chord" }));
  });
  const last = svgElMaeusekreis("path", { d: "", fill: "none", stroke: "#141413", "stroke-width": 3.4, "stroke-linecap": "round", class: "mk-last-path" });
  svg.appendChild(last);
  boardEl.appendChild(svg);
  for (let i = 0; i < b.points; i++) {
    const xy = pointXYMaeusekreis(b.points, i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mk-point";
    btn.dataset.point = String(i);
    btn.style.left = xy.x + "%";
    btn.style.top = xy.y + "%";
    const dot = document.createElement("span");
    dot.className = "mk-dot";
    btn.appendChild(dot);
    const fig = document.createElement("span");
    fig.className = "mk-figure";
    btn.appendChild(fig);
    btn.addEventListener("click", onMaeusekreisPointClick);
    boardEl.appendChild(btn);
  }
}

function updateMaeusekreisBoard() {
  const boardEl = document.getElementById("maeusekreis-board");
  if (!boardEl) return;
  const A = AppStateMaeusekreis;
  const st = A.state;
  const b = MaeusekreisCore.BOARDS[st.level];
  if (boardEl.dataset.level !== String(st.level)) buildMaeusekreisBoardDOM();
  const targets = humanCanActMaeusekreis() ? MaeusekreisCore.getLegalMoves(st) : [];
  const last = st.last;

  const path = boardEl.querySelector(".mk-last-path");
  if (path) {
    let d = "";
    if (last) {
      const p = pointXYMaeusekreis(b.points, last.from);
      const q = pointXYMaeusekreis(b.points, last.to);
      if (MaeusekreisCore.distance(b.points, last.from, last.to) === 1) {
        const sweep = (last.from + 1) % b.points === last.to ? 1 : 0;
        d = "M " + p.x + " " + p.y + " A " + MK_RADIUS + " " + MK_RADIUS + " 0 0 " + sweep + " " + q.x + " " + q.y;
      } else {
        d = "M " + p.x + " " + p.y + " L " + q.x + " " + q.y;
      }
    }
    path.setAttribute("d", d);
  }

  boardEl.querySelectorAll(".mk-point").forEach((btn) => {
    const i = parseInt(btn.dataset.point, 10);
    const who = st.cat === i ? "cat" : (st.mouse === i ? "mouse" : "");
    const fig = btn.querySelector(".mk-figure");
    if (fig && fig.getAttribute("data-mk-figure") !== who) {
      fig.innerHTML = who ? MK_FIGURES[who] : "";
      if (who) fig.setAttribute("data-mk-figure", who);
      else fig.removeAttribute("data-mk-figure");
    }
    const isTarget = targets.indexOf(i) !== -1;
    btn.classList.toggle("mk-target", isTarget);
    btn.classList.toggle("mk-occupied", !!who);
    btn.classList.toggle("mk-from", !!last && last.from === i);
    btn.classList.toggle("mk-to", !!last && last.to === i);
    btn.disabled = !isTarget;

    let label = "Point " + (i + 1);
    if (who === "cat") label += ", cat";
    else if (who === "mouse") label += ", mouse";
    if (isTarget) label += ", " + (st.turn === "cat" ? "the cat can step here" : "the mouse can step here");
    I18n.setAria(btn, label);
  });
  if (typeof BoardSummary !== "undefined") {
    BoardSummary.set(boardEl, (tr) => {
      const s = tr("mk_a11y_t_positions", { cat: st.cat + 1, mouse: st.mouse + 1 });
      return s === "mk_a11y_t_positions" ? "Cat on point " + (st.cat + 1) + ", mouse on point " + (st.mouse + 1) + "." : s;
    });
  }
}

function updateGameLabelsMaeusekreis() {
  const A = AppStateMaeusekreis;
  const meta = document.getElementById("game-meta");
  const left = MaeusekreisCore.left(A.state);
  if (meta) I18n.setMsg(meta, A.gameOver ? "" : (left === 1 ? "The cat has 1 step left." : "The cat has " + left + " steps left."));
  const undo = document.getElementById("undo-btn");
  if (undo) undo.disabled = !(A.undoStack || []).length;
  const resign = document.getElementById("resign-button");
  if (resign) resign.classList.toggle("hidden", A.gameOver);
  if (A.gameOver) clearSavedMaeusekreisGame();
  else saveMaeusekreisGame();
}

document.addEventListener("DOMContentLoaded", initMaeusekreisApp);

// Hint button - marks the point the hard computer would step to.
document.addEventListener("DOMContentLoaded", () => {
  MoveHint.init({
    button: "maeusekreis-hint", board: "maeusekreis-board", app: AppStateMaeusekreis,
    move: () => MaeusekreisAi.chooseMove(AppStateMaeusekreis.state, 3),
    marks: (to) => ['[data-point="' + to + '"]']
  });
});
