// zahlenschritt-app.js
// Wires ZahlenschrittCore/ZahlenschrittAi to zahlenschritt.html (Step Numbers).
// Two sheets side by side (Black left, White right), three fields per row.
// Setup: tap numbers to fill the middle column. Play: "Draw a card", then tap
// a highlighted field to write the card in. Against the computer the person
// plays Black.

const AppStateZahlenschritt = {
  mode: "offline",        // "offline" | "offline-ai"
  state: ZahlenschrittCore.createInitialState(2),
  turn: "b",              // mirrors state.turn - Black always begins
  humanColor: "b",
  aiLevel: 2,
  gameOver: false
};

const ZAHLENSCHRITT_SAVE_KEY = "einkchess_save_zahlenschritt";

function setStateZahlenschritt(state) {
  AppStateZahlenschritt.state = state;
  AppStateZahlenschritt.turn = state.turn;
  AppStateZahlenschritt.gameOver = !!state.result;
}

function saveZahlenschrittGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(ZAHLENSCHRITT_SAVE_KEY, {
    mode: AppStateZahlenschritt.mode,
    state: AppStateZahlenschritt.state,
    aiLevel: AppStateZahlenschritt.aiLevel
  });
}

function clearSavedZahlenschrittGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(ZAHLENSCHRITT_SAVE_KEY);
}

function isZahlenschrittState(s) {
  return !!s && ZahlenschrittCore.LEVELS[s.level] && ZahlenschrittCore.LEVELS[s.level].rows === s.rows &&
    ["setup", "draw", "place", "over"].indexOf(s.phase) !== -1 && (s.turn === "b" || s.turn === "w") &&
    !!s.mids && !!s.cells && Array.isArray(s.deck) &&
    ["b", "w"].every((c) => Array.isArray(s.mids[c]) && Array.isArray(s.cells[c]) && s.mids[c].length === s.cells[c].length && s.mids[c].length <= s.rows);
}

function recordZahlenschrittStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateZahlenschritt.mode !== "offline-ai") return;
  GameStats.record("zahlenschritt", outcome);
}

function colorNameZahlenschritt(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusZahlenschritt(elementId, text) {
  if (AppStateZahlenschritt.mode === "offline-ai" && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateZahlenschritt);
  }
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultZahlenschritt(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleZahlenschritt(winner) {
  if (AppStateZahlenschritt.mode === "offline-ai") {
    return winner === AppStateZahlenschritt.humanColor ? "You win!" : "You lose";
  }
  return colorNameZahlenschritt(winner) + " wins";
}

function humanCanActZahlenschritt() {
  const A = AppStateZahlenschritt;
  if (A.gameOver) return false;
  return !(A.mode === "offline-ai" && A.turn !== A.humanColor);
}

// The sentence that says what the side to move does next.
function promptZahlenschritt() {
  const st = AppStateZahlenschritt.state;
  const name = colorNameZahlenschritt(st.turn);
  if (st.phase === "setup") return name + ": choose a number for your middle column (" + (st.mids[st.turn].length + 1) + " of " + st.rows + ").";
  if (st.phase === "place") return name + " drew " + st.card + ": tap a highlighted field to write it in.";
  return name + ": draw a card.";
}

// What just happened, from the state, so a reloaded game shows it too.
function eventZahlenschritt() {
  const last = AppStateZahlenschritt.state.last;
  if (!last || AppStateZahlenschritt.state.phase === "setup") return "";
  const name = colorNameZahlenschritt(last.side);
  return last.fit ? name + " wrote " + last.card + " in." : name + " drew " + last.card + ": no field fits, the card is out.";
}

function showPromptZahlenschritt() {
  const A = AppStateZahlenschritt;
  const thinking = A.mode === "offline-ai" && A.turn !== A.humanColor && !A.gameOver;
  setStatusZahlenschritt("board-info", thinking ? "Computer thinking…" : promptZahlenschritt());
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, eventZahlenschritt());
}

function initZahlenschrittApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const levelInline = document.getElementById("zahlenschritt-level-inline");
  const startGameBtn = document.getElementById("start-zahlenschritt-game");
  const boardEl = document.getElementById("zahlenschritt-board");

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

  function currentLevel() {
    return levelInline ? parseInt(levelInline.value, 10) || 2 : 2;
  }

  function startNewGameZahlenschritt(mode) {
    const level = currentLevel();
    AppStateZahlenschritt.mode = mode;
    AppStateZahlenschritt.aiLevel = level;
    AppStateZahlenschritt.humanColor = "b";
    setStateZahlenschritt(ZahlenschrittCore.createInitialState(level));
    setGameResultZahlenschritt("");
    showBoardSectionZahlenschritt();
    updateZahlenschrittBoard();
    showPromptZahlenschritt();
    maybeTriggerAiTurnZahlenschritt();
  }

  // The mode the next new game uses; picking "Against the computer" only shows
  // the level and "New game", like the other games here.
  let pendingMode = "offline";

  modeOffline.addEventListener("click", () => {
    pendingMode = "offline";
    setActiveModeButton("offline");
    startNewGameZahlenschritt("offline");
  });

  modeOfflineAi.addEventListener("click", () => {
    pendingMode = "offline-ai";
    setActiveModeButton("offline-ai");
    setStatusZahlenschritt("board-info", "");
  });

  startGameBtn.addEventListener("click", () => {
    const mode = pendingMode;
    setActiveModeButton(mode);
    startNewGameZahlenschritt(mode);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    if (mode === "offline-ai") {
      setStatusZahlenschritt("offline-zahlenschritt-status", "You play Black, computer level: " + (levelNames[currentLevel()] || currentLevel()) + ".");
    }
  });

  if (levelInline) levelInline.value = String(AppStateZahlenschritt.aiLevel);
  boardEl.addEventListener("click", onZahlenschrittClick);

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ZAHLENSCHRITT_SAVE_KEY) : null;
  if (saved && isZahlenschrittState(saved.state) && !saved.state.result) {
    AppStateZahlenschritt.mode = saved.mode === "offline-ai" ? "offline-ai" : "offline";
    pendingMode = AppStateZahlenschritt.mode;
    AppStateZahlenschritt.aiLevel = ZahlenschrittCore.LEVELS[saved.aiLevel] ? saved.aiLevel : saved.state.level;
    AppStateZahlenschritt.humanColor = "b";
    setStateZahlenschritt(saved.state);
    if (levelInline) levelInline.value = String(AppStateZahlenschritt.aiLevel);
    setActiveModeButton(AppStateZahlenschritt.mode);
    setGameResultZahlenschritt("");
    showBoardSectionZahlenschritt();
    updateZahlenschrittBoard();
    showPromptZahlenschritt();
    maybeTriggerAiTurnZahlenschritt();
  }
  // Otherwise no game starts by itself: the placeholder shows until the
  // player picks a mode, like the other games here.
}

function onZahlenschrittClick(e) {
  const A = AppStateZahlenschritt;
  const t = e.target.closest("button");
  if (!t || t.disabled) return;
  if (A.gameOver) {
    setStatusZahlenschritt("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!humanCanActZahlenschritt()) {
    setStatusZahlenschritt("board-info", "Computer to move.");
    return;
  }
  const st = A.state;
  if (t.dataset.zsNum !== undefined) {
    applyZahlenschrittMove({ kind: "num", n: parseInt(t.dataset.zsNum, 10) });
  } else if (t.id === "zs-random") {
    let s = st;
    while (s.phase === "setup" && s.turn === st.turn) s = ZahlenschrittCore.addMid(s, ZahlenschrittAi.chooseNumber(s, 1));
    commitZahlenschritt(s);
  } else if (t.id === "zs-remove") {
    const s = ZahlenschrittCore.removeLastMid(st);
    if (s) commitZahlenschritt(s);
  } else if (t.id === "zs-draw") {
    applyZahlenschrittMove({ kind: "draw" });
  } else if (t.dataset.side) {
    applyZahlenschrittMove({ kind: "cell", row: parseInt(t.dataset.row, 10), col: parseInt(t.dataset.col, 10) });
  }
}

function nextStateZahlenschritt(state, m) {
  if (m.kind === "num") return ZahlenschrittCore.addMid(state, m.n);
  if (m.kind === "draw") return ZahlenschrittCore.draw(state);
  return ZahlenschrittCore.place(state, m.row, m.col);
}

function applyZahlenschrittMove(m) {
  const next = nextStateZahlenschritt(AppStateZahlenschritt.state, m);
  if (next) commitZahlenschritt(next);
}

function commitZahlenschritt(next) {
  const A = AppStateZahlenschritt;
  setStateZahlenschritt(next);
  updateZahlenschrittBoard();
  if (next.result) {
    const w = next.result.winner;
    const message = colorNameZahlenschritt(w) + " wins - every field is filled!";
    setGameResultZahlenschritt(message);
    setStatusZahlenschritt("board-info", message);
    if (window.ResultModal) window.ResultModal.show(resultTitleZahlenschritt(w), message);
    recordZahlenschrittStatsIfVsAi(w === A.humanColor ? "win" : "loss");
    updateZahlenschrittBoard();
    return;
  }
  showPromptZahlenschritt();
  maybeTriggerAiTurnZahlenschritt();
}

function maybeTriggerAiTurnZahlenschritt() {
  const A = AppStateZahlenschritt;
  if (A.gameOver || A.mode !== "offline-ai" || A.turn === A.humanColor) return;
  // The position this step is for: if it has changed by the time the pause is
  // over (new game), the computer must not move.
  const scheduledFor = A.state;
  setTimeout(() => {
    if (A.gameOver || A.state !== scheduledFor || A.turn === A.humanColor) return;
    const m = ZahlenschrittAi.chooseMove(A.state, A.aiLevel);
    if (m) applyZahlenschrittMove(m);
  }, AiPacing.delay(A.state.phase === "setup" ? 150 : 600));
}

function showBoardSectionZahlenschritt() {
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

/*** Rendering ***/

function zsEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

function updateZahlenschrittBoard() {
  const boardEl = document.getElementById("zahlenschritt-board");
  if (!boardEl) return;
  const A = AppStateZahlenschritt;
  const st = A.state;
  const active = humanCanActZahlenschritt();
  const fitKeys = new Set(ZahlenschrittCore.fits(st).map((f) => st.turn + "," + f.row + "," + f.col));
  const last = st.last && st.last.fit ? st.last : null;
  boardEl.innerHTML = "";

  const sheets = zsEl("div", "zs-sheets");
  ["b", "w"].forEach((side) => {
    const sheet = zsEl("div", "zs-sheet" + (side === st.turn && !st.result ? " zs-sheet-active" : "") + (st.result && st.result.winner === side ? " zs-win" : ""));
    const title = zsEl("div", "zs-sheet-title");
    I18n.setKey(title, side === "b" ? "a11y_black" : "a11y_white");
    sheet.appendChild(title);
    const name = colorNameZahlenschritt(side);
    for (let row = 0; row < st.rows; row++) {
      const line = zsEl("div", "zs-row");
      const mid = st.mids[side][row];
      [0, 1, 2].forEach((col) => {
        const cell = zsEl("button", "zs-cell");
        cell.type = "button";
        if (col === 1) {
          cell.classList.add("zs-mid");
          cell.disabled = true;
          if (mid !== undefined) {
            cell.textContent = String(mid);
            I18n.setAria(cell, name + ", row " + (row + 1) + ": middle number " + mid);
          } else {
            cell.setAttribute("aria-hidden", "true");
          }
        } else {
          const c = col === 0 ? 0 : 1;
          const v = mid === undefined ? null : st.cells[side][row][c];
          cell.dataset.side = side;
          cell.dataset.row = row;
          cell.dataset.col = c;
          const fit = fitKeys.has(side + "," + row + "," + c);
          if (v === ZahlenschrittCore.BLOCKED) {
            cell.classList.add("zs-blocked");
            cell.textContent = "–";
            I18n.setAria(cell, name + ", row " + (row + 1) + ": field not needed");
          } else if (v !== null) {
            cell.textContent = String(v);
            I18n.setAria(cell, name + ", row " + (row + 1) + ": " + v + " written in");
          } else if (mid !== undefined) {
            I18n.setAria(cell, name + ", row " + (row + 1) + ": field for " + (c === 0 ? mid - 1 : mid + 1));
          } else {
            cell.setAttribute("aria-hidden", "true");
          }
          cell.classList.toggle("zs-fit", fit);
          if (last && last.side === side && last.row === row && last.col === c) cell.classList.add("zs-last");
          cell.disabled = !(active && fit);
        }
        line.appendChild(cell);
      });
      sheet.appendChild(line);
    }
    sheets.appendChild(sheet);
  });
  boardEl.appendChild(sheets);

  const controls = zsEl("div", "zs-controls");
  if (st.phase === "setup") {
    const palette = zsEl("div", "zs-palette");
    for (let n = 0; n <= st.max; n++) {
      const b = zsEl("button", "secondary zs-num", String(n));
      b.type = "button";
      b.dataset.zsNum = n;
      b.disabled = !active;
      palette.appendChild(b);
    }
    controls.appendChild(palette);
    const random = zsEl("button", "secondary small");
    random.type = "button";
    random.id = "zs-random";
    I18n.setKey(random, "zs_random");
    random.disabled = !active;
    const remove = zsEl("button", "secondary small");
    remove.type = "button";
    remove.id = "zs-remove";
    I18n.setKey(remove, "undo_button");
    remove.disabled = !active || !st.mids[st.turn].length;
    controls.appendChild(random);
    controls.appendChild(document.createTextNode(" "));
    controls.appendChild(remove);
  } else {
    const line = zsEl("div", "zs-card-line");
    const label = zsEl("span");
    I18n.setKey(label, "zs_card_label");
    line.appendChild(label);
    line.appendChild(document.createTextNode(" "));
    line.appendChild(zsEl("span", "zs-card-value", st.card === null ? "–" : String(st.card)));
    controls.appendChild(line);
    const draw = zsEl("button", "primary");
    draw.type = "button";
    draw.id = "zs-draw";
    I18n.setKey(draw, "zs_draw_button");
    draw.disabled = !(active && st.phase === "draw");
    controls.appendChild(draw);
  }
  boardEl.appendChild(controls);

  if (A.gameOver) clearSavedZahlenschrittGame();
  else saveZahlenschrittGame();
}

document.addEventListener("DOMContentLoaded", initZahlenschrittApp);

// Hint button - the number the hard computer would write into the middle
// column, the draw button, or the field to write the card into.
document.addEventListener("DOMContentLoaded", () => {
  MoveHint.init({
    button: "zahlenschritt-hint", board: "zahlenschritt-board", app: AppStateZahlenschritt,
    move: () => ZahlenschrittAi.chooseMove(AppStateZahlenschritt.state, 3),
    marks: (m) => (m.kind === "num" ? ['[data-zs-num="' + m.n + '"]'] : m.kind === "draw" ? ["#zs-draw"] :
      ['[data-side="' + AppStateZahlenschritt.state.turn + '"][data-row="' + m.row + '"][data-col="' + m.col + '"]'])
  });
});
