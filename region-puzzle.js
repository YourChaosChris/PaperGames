// region-puzzle.js
// Shared page logic for the digit puzzles drawn on a grid split into
// regions - Calcudoku, Number Blocks and Killer Sudoku. Each game's
// <slug>-app.js passes its rules (generate, conflicts, completion) and
// labels to RegionPuzzle.init(); everything else - the board, the number
// pad, saving, undo, the result popup - works the same way it does in
// sudoku-app.js and lives here once.
//
// The board is a float-grid of square cells (JS-enforced height, since
// CSS `aspect-ratio` is unreliable on E-Ink browsers). Regions are told
// apart by line shape, never by grey: with style "solid" a region border
// is a thick line and a cell border inside a region a thin one; with
// style "dashed" (Killer Sudoku) the 3x3 boxes keep Sudoku's thick lines
// and each cage is traced by a dashed line just inside its cells. A
// region's clue sits small in the top-left corner of its first cell.
//
// A puzzle handed over by config.generate() looks like:
//   { rows, cols, maxDigit, regions: [[cellIndex...]...], labels:
//     [text per region, "" for none], givens: [digit or 0 per cell],
//     style: "solid" | "dashed", boxes: bool (draw 3x3 box lines) }

const RegionPuzzle = (function () {
  let cfg = null;
  const state = {
    options: null,
    puzzle: null,
    grid: null,
    selected: null,
    gameOver: false,
    moveCount: 0,
    undoStack: [],
    regionOf: null,
    hinted: false,     // the hint button was used on this puzzle
    hintCells: [],     // cells the current hint marks
    hintModel: null,   // HintEngine model, built on the first hint
    hintSolution: null
  };
  const hintSession = typeof HintEngine !== "undefined" ? HintEngine.createSession() : null;

  function tr(key, fallback) {
    return (window.I18n && I18n.t(key)) || fallback;
  }

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
    return tr(cfg.prefix + "_hint", "Select a cell, then pick a number.");
  }

  function save() {
    if (typeof GameStorage === "undefined" || !state.puzzle) return;
    GameStorage.save(cfg.saveKey, {
      options: state.options,
      puzzle: state.puzzle,
      grid: state.grid,
      moveCount: state.moveCount,
      hinted: state.hinted
    });
  }

  function clearSave() {
    if (typeof GameStorage !== "undefined") GameStorage.clear(cfg.saveKey);
  }

  function computeRegionOf(puzzle) {
    const regionOf = new Array(puzzle.rows * puzzle.cols).fill(-1);
    puzzle.regions.forEach((cells, id) => cells.forEach((i) => { regionOf[i] = id; }));
    return regionOf;
  }

  function showBoard() {
    const section = document.getElementById("board-section");
    if (section) section.classList.remove("hidden");
    const placeholder = document.getElementById("board-placeholder");
    const container = document.getElementById("board-container");
    if (placeholder) placeholder.classList.add("hidden");
    if (container) container.classList.remove("hidden");
  }

  function load(puzzle, grid, options, moveCount, hinted) {
    state.puzzle = puzzle;
    state.options = options;
    state.grid = grid || puzzle.givens.slice();
    state.regionOf = computeRegionOf(puzzle);
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

  // daily: today's puzzle (cfg.daily.options, seeded from the UTC date
  // via DailyChallenge) instead of the options picked on the page.
  function startNewGame(daily) {
    const isDaily = daily === true && !!cfg.daily && typeof DailyChallenge !== "undefined";
    const options = isDaily ? Object.assign({}, cfg.daily.options) : cfg.readOptions();
    const rng = isDaily ? DailyChallenge.makeTodaysRng(cfg.statsKey) : undefined;
    const generating = tr(cfg.prefix + "_generating", "Generating puzzle…");
    setStatus(cfg.statusId, generating);
    setStatus("board-info", generating);
    // Yield a tick first so "Generating…" is visible; generate() itself
    // calls back later (Killer Sudoku works in small steps).
    setTimeout(() => {
      cfg.generate(options, (puzzle) => {
        load(puzzle, null, options, 0);
        setStatus(cfg.statusId, "");
        setStatus("board-info", isDaily ? "Daily Challenge (" + DailyChallenge.todayKey() + "). " + hint() : hint());
      }, rng);
    }, 10);
  }

  /*** Board ***/

  function buildBoard() {
    const boardEl = document.getElementById("rp-board");
    if (!boardEl) return;
    const p = state.puzzle;
    boardEl.innerHTML = "";
    boardEl.classList.toggle("rp-board-dashed", p.style === "dashed");
    const regionOf = state.regionOf;
    const widthPct = 100 / p.cols;
    for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) {
        const i = r * p.cols + c;
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "square rp-cell";
        cell.dataset.index = i;
        cell.style.width = widthPct + "%";
        if (c === 0) cell.classList.add("rp-edge-l");
        if (r === 0) cell.classList.add("rp-edge-t");
        const differsLeft = c > 0 && regionOf[i - 1] !== regionOf[i];
        const differsTop = r > 0 && regionOf[i - p.cols] !== regionOf[i];
        if (p.style === "dashed") {
          if (p.boxes && c > 0 && c % 3 === 0) cell.classList.add("rp-thick-l");
          if (p.boxes && r > 0 && r % 3 === 0) cell.classList.add("rp-thick-t");
          // The cage outline: dashed on every side facing another cage,
          // reaching to the cell edge on sides that continue the cage.
          const outline = document.createElement("span");
          outline.className = "rp-cage";
          const sides = [
            ["top", r === 0 || regionOf[i - p.cols] !== regionOf[i]],
            ["bottom", r === p.rows - 1 || regionOf[i + p.cols] !== regionOf[i]],
            ["left", c === 0 || regionOf[i - 1] !== regionOf[i]],
            ["right", c === p.cols - 1 || regionOf[i + 1] !== regionOf[i]]
          ];
          sides.forEach(([side, edge]) => {
            if (edge) outline.classList.add("rp-cage-" + side);
            else outline.style[side] = "0";
          });
          outline.setAttribute("aria-hidden", "true");
          cell.appendChild(outline);
        } else {
          if (differsLeft) cell.classList.add("rp-thick-l");
          if (differsTop) cell.classList.add("rp-thick-t");
        }
        const region = regionOf[i];
        if (p.regions[region][0] === i && p.labels[region]) {
          const label = document.createElement("span");
          label.className = "rp-label";
          label.setAttribute("aria-hidden", "true");
          label.textContent = p.labels[region];
          cell.appendChild(label);
        }
        const value = document.createElement("span");
        value.className = "rp-value";
        cell.appendChild(value);
        cell.addEventListener("click", () => onCellClick(i));
        boardEl.appendChild(cell);
      }
    }
    boardEl.dataset.cols = String(p.cols);
    fitCells();
    if (window.requestAnimationFrame) window.requestAnimationFrame(fitCells);
    else setTimeout(fitCells, 0);
    attachResize();
  }

  function fitCells() {
    const boardEl = document.getElementById("rp-board");
    if (!boardEl || !state.puzzle) return;
    const rect = boardEl.getBoundingClientRect();
    if (!rect || !rect.width) return;
    // clientWidth excludes the board's own border.
    const size = boardEl.clientWidth / state.puzzle.cols;
    boardEl.querySelectorAll(".rp-cell").forEach((el) => { el.style.height = size + "px"; });
  }

  let resizeAttached = false;
  let resizeTimer = null;
  function attachResize() {
    if (resizeAttached) return;
    resizeAttached = true;
    window.addEventListener("resize", () => {
      if (resizeTimer !== null) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeTimer = null; fitCells(); }, 150);
    });
  }

  function buildNumpad() {
    const el = document.getElementById("rp-numpad");
    if (!el) return;
    el.innerHTML = "";
    for (let d = 1; d <= state.puzzle.maxDigit; d++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sudoku-numpad-btn";
      btn.textContent = String(d);
      btn.addEventListener("click", () => enterDigit(d));
      el.appendChild(btn);
    }
  }

  function updateBoard() {
    const boardEl = document.getElementById("rp-board");
    if (!boardEl || !state.puzzle) return;
    const p = state.puzzle;
    const conflicts = cfg.findConflicts(p, state.grid);
    boardEl.querySelectorAll(".rp-cell").forEach((cell) => {
      const i = parseInt(cell.dataset.index, 10);
      const v = state.grid[i];
      const given = !!p.givens[i];
      const valueEl = cell.querySelector(".rp-value");
      if (valueEl) valueEl.textContent = v ? String(v) : "";
      cell.classList.toggle("rp-given", given);
      cell.classList.toggle("selected", state.selected === i);
      cell.classList.toggle("rp-conflict", conflicts.has(i));
      cell.classList.toggle("hint-cell", state.hintCells.indexOf(i) !== -1);
      let aria = "Row " + (Math.floor(i / p.cols) + 1) + ", column " + (i % p.cols + 1);
      aria += v ? ", " + v + (given ? " (given)" : "") : ", empty";
      const regionText = cfg.regionAria(p, state.regionOf[i]);
      if (regionText) aria += ", " + regionText;
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
    const eraseBtn = document.getElementById("rp-erase-button");
    if (eraseBtn) eraseBtn.classList.toggle("hidden", state.gameOver || !state.puzzle);
    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) hintBtn.classList.toggle("hidden", state.gameOver || !state.puzzle || !cfg.hint || !hintSession);
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
    if (d > state.puzzle.maxDigit) return;
    if (state.grid[i] === d) return;
    state.undoStack.push({ grid: state.grid.slice(), moveCount: state.moveCount });
    if (!fromHint) clearHint();
    state.grid[i] = d;
    state.moveCount++;
    updateBoard();
    if (cfg.isComplete(state.puzzle, state.grid)) {
      state.gameOver = true;
      state.selected = null;
      updateBoard();
      const message = tr(cfg.prefix + "_win_message", "Puzzle solved! Well done.");
      setResult(message);
      setStatus("board-info", message);
      if (window.ResultModal) window.ResultModal.show(tr(cfg.prefix + "_win_title", "Solved!"), message);
      if (typeof GameStats !== "undefined") GameStats.record(cfg.statsKey, "win", { hinted: state.hinted });
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
    setStatus("board-info", tr(cfg.prefix + "_undone", "Move undone."));
  }

  /*** Hint (hint-engine.js) ***/

  function clearHint() {
    state.hintCells = [];
    if (hintSession) hintSession.reset();
  }

  // Each press goes one stage further: 1 marks the cell, 2 gives the
  // reason, 3 enters the number. A wrong entry or a broken rule is
  // reported instead; with no step left that follows without trying
  // things out, the hint says so rather than guessing.
  function onHint() {
    if (!state.puzzle || state.gameOver || !cfg.hint || !hintSession) return;
    const p = state.puzzle;
    if (!state.hintModel) state.hintModel = cfg.hint.model(p);
    const model = state.hintModel;
    state.hinted = true;
    const res = hintSession.next(state.grid.join(","), () => {
      if (!state.hintSolution) state.hintSolution = HintEngine.solve(model, p.givens);
      return HintEngine.findHint(model, state.grid, p.givens, state.hintSolution);
    });
    const h = res.hint;
    const text = HintEngine.describe(h, res.stage, {
      cols: p.cols,
      flavor: cfg.hint.flavor,
      cageLabel: (cage) => {
        const k = p.regions.findIndex((cells) => cells.length === cage.cells.length && cells.every((x) => cage.cells.indexOf(x) !== -1));
        return k === -1 ? "" : p.labels[k];
      }
    });
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

  function init(config) {
    cfg = config;
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
    const startBtn = document.getElementById(cfg.startButtonId);
    if (startBtn) startBtn.addEventListener("click", () => startNewGame(false));
    const dailyBtn = cfg.daily ? document.getElementById(cfg.daily.buttonId) : null;
    if (dailyBtn) dailyBtn.addEventListener("click", () => startNewGame(true));
    const eraseBtn = document.getElementById("rp-erase-button");
    if (eraseBtn) eraseBtn.addEventListener("click", () => enterDigit(0));
    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) hintBtn.addEventListener("click", onHint);

    document.addEventListener("keydown", (e) => {
      if (state.selected === null || state.gameOver) return;
      if (e.key >= "1" && e.key <= "9") enterDigit(parseInt(e.key, 10));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") enterDigit(0);
    });

    const saved = typeof GameStorage !== "undefined" ? GameStorage.load(cfg.saveKey) : null;
    if (saved && saved.puzzle && saved.grid) {
      if (cfg.applyOptions && saved.options) cfg.applyOptions(saved.options);
      load(saved.puzzle, saved.grid, saved.options, saved.moveCount, saved.hinted);
      setStatus("board-info", hint());
    }
    // Otherwise no puzzle is pre-generated: the placeholder shows until
    // the player picks the options and presses New puzzle.
  }

  // For tests and the page's own undo button.
  return { init, undo, enterDigit, hint: onHint, state };
})();

if (typeof window !== "undefined") {
  window.RegionPuzzle = RegionPuzzle;
  // The shared Undo button (confirm-actions.js / board-actions markup)
  // calls a global undoLastMove(), like every other game page.
  window.undoLastMove = function () { RegionPuzzle.undo(); };
}
