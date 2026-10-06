// futoshiki-app.js
// Wires FutoshikiCore to futoshiki.html. It follows region-puzzle.js
// (Calcudoku's page logic) closely - same number pad, Undo, Erase, Hint,
// Daily Challenge, Print, saving and result popup - but stands on its
// own, so Calcudoku and its siblings stay untouched.
//
// The board: square cells with a gap between them, all placed by
// percentage in a box whose height JS sets from its width. The "less
// than" signs sit in those gaps as inline SVG triangles - the narrow tip
// points at the smaller number, the wide end at the larger one, exactly
// like "<" - so they never depend on the device's font, and they are
// drawn large: on 6 x 6 at 632 px they are still well over 20 px.

(function () {
  const SAVE_KEY = "einkchess_save_futoshiki";
  const GAP = 0.5; // gap between cells, as a share of a cell

  const state = {
    options: null,
    puzzle: null,
    grid: null,
    selected: null,
    gameOver: false,
    moveCount: 0,
    undoStack: [],
    hinted: false,
    hintCells: [],
    hintModel: null,
    hintSolution: null
  };
  const hintSession = typeof HintEngine !== "undefined" ? HintEngine.createSession() : null;

  function setStatus(id, text) {
    const el = document.getElementById(id);
    if (el) I18n.setMsg(el, text || "");
  }
  function setResult(text) {
    const el = document.getElementById("game-result");
    if (el) I18n.setMsg(el, text || "");
    if (!text && window.ResultModal) window.ResultModal.hide();
  }
  function hint() {
    return "Select a cell, then pick a number.";
  }

  function readOptions() {
    const el = document.getElementById("futoshiki-size-inline");
    return { size: el ? parseInt(el.value, 10) : FutoshikiCore.DEFAULT_SIZE };
  }
  function applyOptions(options) {
    const el = document.getElementById("futoshiki-size-inline");
    if (el && options && options.size) el.value = String(options.size);
  }

  function save() {
    if (typeof GameStorage === "undefined" || !state.puzzle) return;
    GameStorage.save(SAVE_KEY, {
      options: state.options,
      puzzle: state.puzzle,
      grid: state.grid,
      moveCount: state.moveCount,
      hinted: state.hinted
    });
  }
  function clearSave() {
    if (typeof GameStorage !== "undefined") GameStorage.clear(SAVE_KEY);
  }

  function generate(options, rng) {
    // Only puzzles the hint can finish without trying things out (see
    // FutoshikiCore.generatePuzzle and hint-engine.js).
    const accept = typeof HintEngine !== "undefined"
      ? (p) => HintEngine.solvable(FutoshikiCore.hintModel(p), p.givens)
      : null;
    return FutoshikiCore.generatePuzzle(options.size, rng, accept);
  }

  function showBoard() {
    const placeholder = document.getElementById("board-placeholder");
    const container = document.getElementById("board-container");
    if (placeholder) placeholder.classList.add("hidden");
    if (container) container.classList.remove("hidden");
  }

  function load(puzzle, grid, options, moveCount, hinted) {
    state.puzzle = puzzle;
    state.options = options;
    state.grid = grid || puzzle.givens.slice();
    state.selected = null;
    state.gameOver = false;
    state.moveCount = moveCount || 0;
    state.undoStack = [];
    state.hinted = !!hinted;
    clearHint();
    state.hintModel = null;
    state.hintSolution = null;
    setResult("");
    showBoard();
    buildBoard();
    buildNumpad();
    updateBoard();
    updateLabels();
  }

  function startNewGame(daily) {
    const isDaily = daily === true && typeof DailyChallenge !== "undefined";
    const options = isDaily ? { size: 5 } : readOptions();
    const rng = isDaily ? DailyChallenge.makeTodaysRng("futoshiki") : undefined;
    setStatus("offline-futoshiki-status", "Generating puzzle…");
    setStatus("board-info", "Generating puzzle…");
    setTimeout(() => {
      load(generate(options, rng), null, options, 0);
      setStatus("offline-futoshiki-status", "");
      if (window.PrintPuzzle) PrintPuzzle.setDaily(isDaily);
      setStatus("board-info", isDaily ? "Daily Challenge (" + DailyChallenge.todayKey() + "). " + hint() : hint());
    }, 10);
  }

  /*** Board ***/

  function cellBox(p, i) {
    const n = p.size;
    const unit = 100 / (n + (n - 1) * GAP);
    const r = Math.floor(i / n), c = i % n;
    return { left: c * unit * (1 + GAP), top: r * unit * (1 + GAP), size: unit };
  }

  // The triangle for sign a < b: tip towards a, wide end towards b.
  function signSvg(dir) {
    // dir: "left" | "right" | "up" | "down" - where the tip (smaller side) points
    const pts = {
      left: "8,50 92,10 92,90",
      right: "92,50 8,10 8,90",
      up: "50,8 10,92 90,92",
      down: "50,92 10,8 90,8"
    }[dir];
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><polygon points="' + pts + '"/></svg>';
  }

  function buildBoard() {
    const boardEl = document.getElementById("futoshiki-board");
    const p = state.puzzle;
    if (!boardEl || !p) return;
    boardEl.innerHTML = "";
    const n = p.size;
    for (let i = 0; i < n * n; i++) {
      const box = cellBox(p, i);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "fs-cell";
      cell.dataset.index = i;
      cell.style.left = box.left + "%";
      cell.style.top = box.top + "%";
      cell.style.width = box.size + "%";
      cell.style.height = box.size + "%";
      const value = document.createElement("span");
      value.className = "fs-value";
      cell.appendChild(value);
      cell.addEventListener("click", () => onCellClick(i));
      boardEl.appendChild(cell);
    }
    p.ineq.forEach(({ a, b }) => {
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const box = cellBox(p, lo);
      const horizontal = hi === lo + 1;
      // tip points from the larger cell towards the smaller one (a)
      const dir = horizontal ? (a === lo ? "left" : "right") : (a === lo ? "up" : "down");
      const sign = document.createElement("span");
      sign.className = "fs-sign";
      sign.setAttribute("aria-hidden", "true");
      const s = box.size * GAP;
      if (horizontal) {
        sign.style.left = (box.left + box.size) + "%";
        sign.style.top = (box.top + box.size / 2 - s / 2) + "%";
      } else {
        sign.style.left = (box.left + box.size / 2 - s / 2) + "%";
        sign.style.top = (box.top + box.size) + "%";
      }
      sign.style.width = s + "%";
      sign.style.height = s + "%";
      sign.innerHTML = signSvg(dir);
      boardEl.appendChild(sign);
    });
    fitBoard();
    if (window.requestAnimationFrame) window.requestAnimationFrame(fitBoard);
    else setTimeout(fitBoard, 0);
    attachResize();
  }

  function fitBoard() {
    const boardEl = document.getElementById("futoshiki-board");
    if (!boardEl || !state.puzzle) return;
    const rect = boardEl.getBoundingClientRect();
    if (!rect || !rect.width) return;
    boardEl.style.height = boardEl.clientWidth + "px";
  }

  let resizeAttached = false;
  let resizeTimer = null;
  function attachResize() {
    if (resizeAttached) return;
    resizeAttached = true;
    window.addEventListener("resize", () => {
      if (resizeTimer !== null) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeTimer = null; fitBoard(); }, 150);
    });
  }

  function buildNumpad() {
    const el = document.getElementById("futoshiki-numpad");
    if (!el) return;
    el.innerHTML = "";
    for (let d = 1; d <= state.puzzle.size; d++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sudoku-numpad-btn";
      btn.textContent = String(d);
      btn.addEventListener("click", () => enterDigit(d));
      el.appendChild(btn);
    }
  }

  function updateBoard() {
    const boardEl = document.getElementById("futoshiki-board");
    const p = state.puzzle;
    if (!boardEl || !p) return;
    const conflicts = FutoshikiCore.findConflicts(p, state.grid);
    boardEl.querySelectorAll(".fs-cell").forEach((cell) => {
      const i = parseInt(cell.dataset.index, 10);
      const v = state.grid[i];
      const given = !!p.givens[i];
      const valueEl = cell.querySelector(".fs-value");
      if (valueEl) valueEl.textContent = v ? String(v) : "";
      cell.classList.toggle("fs-given", given);
      cell.classList.toggle("selected", state.selected === i);
      cell.classList.toggle("fs-conflict", conflicts.has(i));
      cell.classList.toggle("hint-cell", state.hintCells.indexOf(i) !== -1);
      let aria = "Row " + (Math.floor(i / p.size) + 1) + ", column " + (i % p.size + 1);
      aria += v ? ", " + v + (given ? " (given)" : "") : ", empty";
      if (conflicts.has(i)) aria += ", conflict";
      I18n.setAria(cell, aria);
    });
  }

  function updateLabels() {
    const meta = document.getElementById("game-meta");
    if (meta) {
      if (state.puzzle) {
        const filled = state.grid.filter((v) => v !== 0).length;
        I18n.setMsg(meta, filled + " / " + state.grid.length + " filled");
      } else {
        meta.textContent = "";
      }
    }
    const undoBtn = document.getElementById("undo-btn");
    if (undoBtn) undoBtn.classList.toggle("hidden", !(state.undoStack.length && !state.gameOver));
    const eraseBtn = document.getElementById("futoshiki-erase-button");
    if (eraseBtn) eraseBtn.classList.toggle("hidden", state.gameOver || !state.puzzle);
    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) hintBtn.classList.toggle("hidden", state.gameOver || !state.puzzle || !hintSession);
    if (state.gameOver) clearSave();
    else save();
  }

  function onCellClick(i) {
    if (state.gameOver || !state.puzzle) return;
    state.selected = state.puzzle.givens[i] ? null : i;
    updateBoard();
  }

  function enterDigit(d, fromHint) {
    const i = state.selected;
    if (i === null || state.gameOver || !state.puzzle) return;
    if (state.puzzle.givens[i]) return;
    if (d > state.puzzle.size) return;
    if (state.grid[i] === d) return;
    state.undoStack.push({ grid: state.grid.slice(), moveCount: state.moveCount });
    if (!fromHint) clearHint();
    state.grid[i] = d;
    state.moveCount++;
    updateBoard();
    if (FutoshikiCore.isComplete(state.puzzle, state.grid)) {
      state.gameOver = true;
      state.selected = null;
      updateBoard();
      const message = "Puzzle solved! Well done.";
      setResult(message);
      setStatus("board-info", message);
      if (window.ResultModal) window.ResultModal.show("Solved!", message);
      if (typeof GameStats !== "undefined") GameStats.record("futoshiki", "win", { hinted: state.hinted });
    } else {
      setStatus("board-info", hint());
    }
    updateLabels();
  }

  function undo() {
    if (!state.undoStack.length) return;
    const prev = state.undoStack.pop();
    state.grid = prev.grid;
    state.moveCount = prev.moveCount;
    state.gameOver = false;
    clearHint();
    setResult("");
    updateBoard();
    updateLabels();
    setStatus("board-info", "Move undone.");
  }

  /*** Hint (hint-engine.js) ***/

  function clearHint() {
    state.hintCells = [];
    if (hintSession) hintSession.reset();
  }

  // The engine treats every sign as a two-cell rule ("cage"); that step
  // gets its own wording here, everything else reads as in Calcudoku.
  function describe(h, stage) {
    const p = state.puzzle;
    if (h.kind === "step" && h.tech === "cage" && stage < 3) {
      const r = Math.floor(h.cell / p.size) + 1, c = h.cell % p.size + 1;
      if (stage === 1) return "A sign next to the marked cell (row " + r + ", column " + c + ") leaves only one number for it.";
      return "The sign between this cell and its neighbour, together with the numbers still possible there, allows only the " + h.value + " here.";
    }
    return HintEngine.describe(h, stage, { cols: p.size, flavor: "calcudoku", cageLabel: () => "" });
  }

  function onHint() {
    if (!state.puzzle || state.gameOver || !hintSession) return;
    const p = state.puzzle;
    if (!state.hintModel) state.hintModel = FutoshikiCore.hintModel(p);
    const model = state.hintModel;
    state.hinted = true;
    const res = hintSession.next(state.grid.join(","), () => {
      if (!state.hintSolution) state.hintSolution = HintEngine.solve(model, p.givens);
      return HintEngine.findHint(model, state.grid, p.givens, state.hintSolution);
    });
    const h = res.hint;
    const text = describe(h, res.stage);
    if (h.kind === "step" && res.stage === 3) {
      state.selected = h.cell;
      state.hintCells = [h.cell];
      enterDigit(h.value, true);
      if (!state.gameOver) setStatus("board-info", text);
      updateBoard();
      return;
    }
    if (h.kind === "conflict") state.hintCells = h.cells.slice();
    else if (h.kind === "wrong" || h.kind === "step") state.hintCells = [h.cell];
    else state.hintCells = [];
    updateBoard();
    setStatus("board-info", text);
    save();
  }

  function init() {
    if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
    const menuToggle = document.getElementById("menu-toggle");
    const settingsPanel = document.getElementById("settings-panel");
    if (menuToggle && settingsPanel) {
      menuToggle.addEventListener("click", () => {
        const opening = settingsPanel.classList.contains("hidden");
        settingsPanel.classList.toggle("hidden", !opening);
        I18n.setKey(menuToggle, opening ? "menu_close" : "menu_toggle");
      });
    }
    const startBtn = document.getElementById("start-futoshiki-game");
    if (startBtn) startBtn.addEventListener("click", () => startNewGame(false));
    const dailyBtn = document.getElementById("daily-futoshiki-button");
    if (dailyBtn) dailyBtn.addEventListener("click", () => startNewGame(true));
    const eraseBtn = document.getElementById("futoshiki-erase-button");
    if (eraseBtn) eraseBtn.addEventListener("click", () => enterDigit(0));
    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) hintBtn.addEventListener("click", onHint);

    document.addEventListener("keydown", (e) => {
      if (state.selected === null || state.gameOver) return;
      if (e.key >= "1" && e.key <= "9") enterDigit(parseInt(e.key, 10));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") enterDigit(0);
    });

    const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SAVE_KEY) : null;
    if (saved && saved.puzzle && saved.grid) {
      applyOptions(saved.options);
      load(saved.puzzle, saved.grid, saved.options, saved.moveCount, saved.hinted);
      setStatus("board-info", hint());
    }
  }

  window.FutoshikiApp = { state, enterDigit, hint: onHint, undo };
  window.undoLastMove = function () { undo(); };
  document.addEventListener("DOMContentLoaded", init);
})();
