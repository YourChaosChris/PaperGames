// cratepusher-app.js
// Wires CratePusherCore to cratepusher.html.
//
// The board is a grid of buttons, one per cell, sized from the width
// available (never under 32 px so a finger still hits it on a reader).
// Every cell shows its state as an inline SVG so it reads without colour
// or grey: wall solid black, floor white, target a small hollow square,
// crate a framed square with a diagonal cross, crate on a target a solid
// square (with the target mark in white, so it never looks like a wall),
// the pusher a filled circle. A move only redraws the cells that
// changed; nothing is animated.
//
// Tap a neighbouring cell to step (and push) that way, or a floor cell
// further off to walk there when that is possible without pushing any
// crate. Arrow keys and W/A/S/D work too (board-a11y.js). "Undo move"
// takes back as many moves as you like; "Restart level" asks first
// (confirm-actions.js). The level in progress is saved after every move.
//
// "Hint" runs the core's solver from the current position - in small
// steps like the level generator, so a slow reader never freezes - and
// shows the first push of a shortest solution: the crate's cell and its
// destination get the shared last-move frames (.lm-from dashed, .lm-to
// solid) and #board-info names row, column and direction. It only shows
// the push, never makes it. Any move, undo, restart or new level bumps
// AppStateCp.token, which drops a hint still being worked out. Hints are
// neither saved nor counted in the statistics.

const CP_SAVE_KEY = "einkchess_save_cratepusher";
const CP_MIN_CELL = 32;
const CP_MAX_CELL = 60;

const CP_SVG = {
  wall: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="0" y="0" width="100" height="100" fill="#141413"/></svg>',
  floor: "",
  target: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="36" y="36" width="28" height="28" fill="none" stroke="#141413" stroke-width="5"/></svg>',
  crate: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="14" y="14" width="72" height="72" fill="#ffffff" stroke="#141413" stroke-width="8"/><path d="M14 14 L86 86 M86 14 L14 86" stroke="#141413" stroke-width="6"/></svg>',
  crateOnTarget: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="14" y="14" width="72" height="72" fill="#141413" stroke="#141413" stroke-width="8"/><rect x="38" y="38" width="24" height="24" fill="none" stroke="#ffffff" stroke-width="5"/></svg>',
  pusher: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="30" fill="#141413"/></svg>',
  pusherOnTarget: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="16" y="16" width="68" height="68" fill="none" stroke="#141413" stroke-width="5"/><circle cx="50" cy="50" r="24" fill="#141413"/></svg>'
};

const CP_CELL_LABEL = {
  wall: "Wall",
  floor: "Floor",
  target: "Target",
  crate: "Crate",
  crateOnTarget: "Crate on target",
  pusher: "You",
  pusherOnTarget: "You on a target"
};

const AppStateCp = {
  difficulty: "medium",
  level: null,
  crates: [],
  pusher: 0,
  steps: 0,
  pushes: 0,
  undo: [],
  solved: false,
  generating: false,
  token: 0,
  kinds: [],
  cells: [],
  cellSize: 0,
  hinting: false,
  hintCells: [],
  hint: null // { row, col, dir } while a hint sentence is shown
};

function setStatusCp(text) {
  const el = document.getElementById("board-info");
  AppStateCp.hint = null;
  if (el) I18n.setMsg(el, text || "");
}

// A fixed hint sentence, by key, so a language change retranslates it.
function setStatusKeyCp(key) {
  const el = document.getElementById("board-info");
  AppStateCp.hint = null;
  if (el) I18n.setKey(el, key);
}

function saveCp() {
  if (typeof GameStorage === "undefined") return;
  const s = AppStateCp;
  if (!s.level || s.solved) {
    GameStorage.clear(CP_SAVE_KEY);
    return;
  }
  GameStorage.save(CP_SAVE_KEY, {
    difficulty: s.difficulty,
    level: s.level,
    crates: s.crates,
    pusher: s.pusher,
    steps: s.steps,
    pushes: s.pushes,
    undo: s.undo
  });
}

/*** Setup ***/

function initCratePusherApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-cratepusher-game").addEventListener("click", () => {
    newLevelCp(document.getElementById("cratepusher-level-inline").value);
  });
  const dailyBtn = document.getElementById("daily-cratepusher-button");
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => {
      newLevelCp("medium", DailyChallenge.makeTodaysRng("cratepusher"), true);
    });
  }
  document.getElementById("undo-btn").addEventListener("click", undoCp);
  document.getElementById("cp-restart").addEventListener("click", restartCp);
  document.getElementById("cp-hint").addEventListener("click", hintCp);
  if (I18n.onChange) I18n.onChange(renderHintCp);
  if (typeof BoardA11y !== "undefined" && BoardA11y.enableDirectionKeys) {
    BoardA11y.enableDirectionKeys((dir) => {
      if (!AppStateCp.level || AppStateCp.solved || AppStateCp.generating) return false;
      if (document.getElementById("board-container").classList.contains("hidden")) return false;
      stepCp(dir);
      return true;
    });
  }
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resizeTimer = null; if (AppStateCp.level) sizeBoardCp(); }, 150);
  });

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(CP_SAVE_KEY) : null;
  if (saved && saved.level) {
    AppStateCp.difficulty = saved.difficulty || "medium";
    AppStateCp.level = saved.level;
    AppStateCp.crates = saved.crates;
    AppStateCp.pusher = saved.pusher;
    AppStateCp.steps = saved.steps || 0;
    AppStateCp.pushes = saved.pushes || 0;
    AppStateCp.undo = saved.undo || [];
    AppStateCp.solved = false;
    document.getElementById("cratepusher-level-inline").value = AppStateCp.difficulty;
    showBoardCp();
    buildBoardCp();
    afterChangeCp("");
  }
}

function showBoardCp() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

// rng/isDaily: today's level (seeded from the UTC date) instead of a random one.
function newLevelCp(difficulty, rng, isDaily) {
  const token = ++AppStateCp.token;
  AppStateCp.difficulty = difficulty;
  AppStateCp.generating = true;
  AppStateCp.hinting = false;
  document.getElementById("cp-hint").disabled = true;
  setStatusCp("Building a level…");
  const status = document.getElementById("offline-cratepusher-status");
  if (status) I18n.setMsg(status, "Building a level…");
  // Let the status text reach the screen before the work starts.
  setTimeout(() => {
    CratePusherCore.generateLevelAsync(difficulty, rng || null, (level) => {
      if (token !== AppStateCp.token) return; // a newer request replaced this one
      AppStateCp.generating = false;
      if (status) I18n.setMsg(status, isDaily ? "Daily Challenge (" + DailyChallenge.todayKey() + ")." : "");
      startLevelCp(level);
    });
  }, 30);
}

function startLevelCp(level) {
  const s = AppStateCp;
  s.level = level;
  s.crates = level.crates.slice();
  s.pusher = level.pusher;
  s.steps = 0;
  s.pushes = 0;
  s.undo = [];
  s.solved = false;
  showBoardCp();
  buildBoardCp();
  afterChangeCp("Push every crate onto a target.");
}

function restartCp() {
  const s = AppStateCp;
  if (!s.level) return;
  s.crates = s.level.crates.slice();
  s.pusher = s.level.pusher;
  s.steps = 0;
  s.pushes = 0;
  s.undo = [];
  s.solved = false;
  afterChangeCp("The level starts again.");
}

/*** Moving ***/

const CP_DIRS = ["up", "down", "left", "right"];

function stepCp(dir) {
  const s = AppStateCp;
  if (!s.level || s.solved || s.generating) return;
  const r = CratePusherCore.move(s.level, { crates: s.crates, pusher: s.pusher }, dir);
  if (!r.ok) {
    if (r.reason === "crate-wall") setStatusCp("That crate can't move: there is a wall behind it.");
    else if (r.reason === "crate-crate") setStatusCp("That crate can't move: there is another crate behind it.");
    else setStatusCp("There is a wall in the way.");
    return;
  }
  const entry = { p: s.pusher, s: 1, u: 0, c: null };
  if (r.pushed) {
    entry.c = [s.crates.indexOf(r.pushed.from), r.pushed.from, r.pushed.to];
    entry.u = 1;
  }
  s.undo.push(entry);
  s.crates = r.crates;
  s.pusher = r.pusher;
  s.steps += 1;
  s.pushes += entry.u;
  afterChangeCp("");
}

function onCellCp(cell) {
  const s = AppStateCp;
  if (!s.level || s.solved || s.generating) return;
  const w = s.level.width;
  const d = cell - s.pusher;
  const dir = d === -w ? "up" : d === w ? "down" : d === -1 ? "left" : d === 1 ? "right" : null;
  if (dir) {
    stepCp(dir);
    return;
  }
  if (cell === s.pusher || s.level.walls[cell]) return;
  if (s.crates.indexOf(cell) !== -1) {
    setStatusCp("To push a crate, stand right next to it and tap it.");
    return;
  }
  const path = CratePusherCore.walkPath(s.level, { crates: s.crates, pusher: s.pusher }, cell);
  if (!path) {
    setStatusCp("There is no way there without pushing a crate.");
    return;
  }
  s.undo.push({ p: s.pusher, s: path.length, u: 0, c: null });
  s.pusher = cell;
  s.steps += path.length;
  afterChangeCp("");
}

function undoCp() {
  const s = AppStateCp;
  if (!s.level || s.generating) return;
  const e = s.undo.pop();
  if (!e) {
    setStatusCp("Nothing to undo.");
    return;
  }
  if (e.c) {
    const crates = s.crates.slice();
    crates[e.c[0]] = e.c[1];
    s.crates = crates;
  }
  s.pusher = e.p;
  s.steps -= e.s;
  s.pushes -= e.u;
  s.solved = false;
  afterChangeCp("Move undone.");
}

/*** After every change ***/

function afterChangeCp(message) {
  const s = AppStateCp;
  const lvl = s.level;
  // The position changed: a hint still being worked out no longer fits.
  // (While a level is being built the token belongs to the generator.)
  if (!s.generating) s.token++;
  s.hinting = false;
  clearHintMarksCp();
  updateCellsCp();
  const total = s.crates.length;
  const on = CratePusherCore.cratesOnTargets(lvl, s.crates);
  I18n.setMsg(document.getElementById("cp-steps"), "Steps: " + s.steps);
  I18n.setMsg(document.getElementById("cp-pushes"), "Pushes: " + s.pushes);
  I18n.setMsg(document.getElementById("cp-on-target"), "On target: " + on + " of " + total);
  I18n.setMsg(document.getElementById("cp-best"), "Shortest solution: " + lvl.minPushes + " pushes");
  const undoBtn = document.getElementById("undo-btn");
  const restartBtn = document.getElementById("cp-restart");
  const hintBtn = document.getElementById("cp-hint");
  undoBtn.classList.remove("hidden");
  restartBtn.classList.remove("hidden");
  hintBtn.classList.remove("hidden");
  undoBtn.disabled = s.undo.length === 0;
  hintBtn.disabled = s.generating || CratePusherCore.isSolved(lvl, s.crates);
  // Ask before throwing away a level in progress.
  const startBtn = document.getElementById("start-cratepusher-game");
  const inProgress = s.undo.length > 0 && !s.solved;
  if (inProgress) {
    restartBtn.setAttribute("data-confirm", "cp_restart_confirm");
    startBtn.setAttribute("data-confirm", "cp_new_level_confirm");
  } else {
    restartBtn.removeAttribute("data-confirm");
    startBtn.removeAttribute("data-confirm");
  }

  if (CratePusherCore.isSolved(lvl, s.crates)) {
    s.solved = true;
    let text = "Solved in " + s.steps + " steps and " + s.pushes + " pushes.";
    if (s.pushes === lvl.minPushes) text += " That is the fewest pushes possible.";
    setStatusCp(text);
    if (typeof GameStats !== "undefined") GameStats.record("cratepusher", "win");
    if (window.ResultModal) window.ResultModal.show("Solved!", text);
    saveCp();
    return;
  }
  const stuck = CratePusherCore.cornerStuck(lvl, s.crates);
  if (stuck.length) {
    setStatusCp("A crate is stuck in a corner that is not a target, so this level can no longer be solved. Use \"Undo move\" to go back.");
  } else {
    setStatusCp(message);
  }
  saveCp();
}

/*** Hint ***/

function hintCp() {
  const s = AppStateCp;
  if (!s.level || s.solved || s.generating || s.hinting) return;
  const lvl = s.level;
  // Cheap check first: a crate in a non-target corner can never move.
  if (CratePusherCore.cornerStuck(lvl, s.crates).length) {
    setStatusKeyCp("cp_hint_stuck");
    return;
  }
  const token = s.token;
  const cfg = CratePusherCore.LEVELS[lvl.difficulty] || CratePusherCore.LEVELS[s.difficulty] || CratePusherCore.LEVELS.medium;
  const solver = CratePusherCore.createSolver(CratePusherCore.roomOf(lvl), lvl.targets,
    { crates: s.crates.slice(), pusher: s.pusher }, cfg.solveBudget);
  const hintBtn = document.getElementById("cp-hint");
  s.hinting = true;
  hintBtn.disabled = true;
  setStatusKeyCp("cp_hint_thinking");
  function tick() {
    if (token !== s.token) return; // the position changed - drop this hint
    if (!solver.run(CratePusherCore.STEP_NODES)) {
      setTimeout(tick, 0);
      return;
    }
    s.hinting = false;
    hintBtn.disabled = false;
    const res = solver.result;
    if (res.solvable && res.first) showHintCp(res.first);
    else if (res.solvable) setStatusCp("");
    else setStatusKeyCp(res.aborted ? "cp_hint_unknown" : "cp_hint_stuck");
  }
  // Let "Thinking…" reach the screen before the work starts.
  setTimeout(tick, 30);
}

function showHintCp(first) {
  const s = AppStateCp;
  const w = s.level.width;
  const d = first.to - first.from;
  const dir = d === -w ? "up" : d === w ? "down" : d === -1 ? "left" : "right";
  clearHintMarksCp();
  s.cells[first.from].classList.add("lm-from");
  s.cells[first.to].classList.add("lm-to");
  s.hintCells = [first.from, first.to];
  // Row and column as a person reads the board: the outer wall ring is
  // not counted, so the first floor row is row 1.
  s.hint = { row: Math.floor(first.from / w), col: first.from % w, dir };
  renderHintCp();
}

// Writes the hint sentence in the current language (again after a
// language change, as long as the hint is still showing).
function renderHintCp() {
  const h = AppStateCp.hint;
  const el = document.getElementById("board-info");
  if (!h || !el) return;
  el.removeAttribute("data-i18n");
  el.removeAttribute("data-i18n-msg");
  el.textContent = I18n.t("cp_hint_move")
    .replace("{row}", h.row)
    .replace("{col}", h.col)
    .replace("{dir}", I18n.t("cp_dir_" + h.dir));
}

function clearHintMarksCp() {
  const s = AppStateCp;
  s.hintCells.forEach((i) => {
    if (s.cells[i]) s.cells[i].classList.remove("lm-from", "lm-to");
  });
  s.hintCells = [];
}

/*** Board ***/

function kindAt(cell) {
  const s = AppStateCp;
  const lvl = s.level;
  if (lvl.walls[cell]) return "wall";
  const target = lvl.targets.indexOf(cell) !== -1;
  if (s.crates.indexOf(cell) !== -1) return target ? "crateOnTarget" : "crate";
  if (cell === s.pusher) return target ? "pusherOnTarget" : "pusher";
  return target ? "target" : "floor";
}

function buildBoardCp() {
  const s = AppStateCp;
  const lvl = s.level;
  const board = document.getElementById("cratepusher-board");
  board.innerHTML = "";
  s.cells = [];
  s.kinds = [];
  s.hintCells = [];
  for (let y = 0; y < lvl.height; y++) {
    const row = document.createElement("div");
    row.className = "cp-row";
    for (let x = 0; x < lvl.width; x++) {
      const cell = y * lvl.width + x;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cp-cell";
      btn.addEventListener("click", () => onCellCp(cell));
      if (lvl.walls[cell]) btn.tabIndex = -1;
      row.appendChild(btn);
      s.cells.push(btn);
      s.kinds.push(null);
    }
    board.appendChild(row);
  }
  sizeBoardCp();
}

function sizeBoardCp() {
  const s = AppStateCp;
  const board = document.getElementById("cratepusher-board");
  const avail = (board.parentElement && board.parentElement.clientWidth) || 320;
  let size = Math.floor(avail / s.level.width);
  size = Math.max(CP_MIN_CELL, Math.min(CP_MAX_CELL, size));
  s.cellSize = size;
  board.style.width = size * s.level.width + "px";
  s.cells.forEach((btn) => {
    btn.style.width = size + "px";
    btn.style.height = size + "px";
  });
}

// Redraws only the cells whose content changed.
function updateCellsCp() {
  const s = AppStateCp;
  for (let i = 0; i < s.cells.length; i++) {
    const kind = kindAt(i);
    if (s.kinds[i] === kind) continue;
    s.kinds[i] = kind;
    const btn = s.cells[i];
    btn.innerHTML = CP_SVG[kind];
    btn.className = "cp-cell cp-" + kind;
    const x = i % s.level.width + 1, y = Math.floor(i / s.level.width) + 1;
    I18n.setAria(btn, CP_CELL_LABEL[kind] + ", row " + y + ", column " + x);
  }
}

document.addEventListener("DOMContentLoaded", initCratePusherApp);
