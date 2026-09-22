// fleetbattle-app.js
// Wires FleetBattleCore/FleetBattleAi to the fleetbattle.html UI.
//
// Unlike this repo's other vs-AI games, Fleet Battle has two distinct
// phases before the game is actually "playing": a placement phase (the
// player arranges their own five ships, with a rotate control and a
// random-placement shortcut - loosely following how kakuro.html/
// kakuro-app.js keep the board hidden behind a placeholder until "New
// game" is pressed, just with an extra step in between) and the battle
// phase itself (two 10x10 grids: your own fleet plus incoming shots, and
// your view of the enemy's waters). "New game" starts placement, not
// battle directly.
//
// The computer's fleet (AppStateFleetBattle.computer) is placed once
// battle begins and is never rendered - renderEnemyGrid only ever reads
// state.humanShots plus, for a cell that's already a confirmed hit, which
// one of the computer's ships sits there (needed to detect and reveal a
// sunk ship). No unhit computer ship cell is ever read by any rendering
// code. window.__fleetBattleTestHooks exposes the full state for
// automated testing only - it is never referenced by any player-facing
// UI code path.

const AppStateFleetBattle = {
  phase: "placement",   // "placement" | "battle" | "over"
  aiLevel: "medium",
  orientation: "h",      // "h" | "v" - applies to whichever ship is placed next
  human: null,           // { ships: [...] }
  computer: null,        // { ships: [...] } - hidden from rendering until sunk
  humanShots: null,      // shots the human fired at the computer's fleet
  computerShots: null,   // shots the computer fired at the human's fleet
  turn: "human",         // "human" | "computer"
  winner: null,          // null | "human" | "computer"
  aiState: null,
  lastHumanShot: null,   // [r,c] | null
  lastComputerShot: null // [r,c] | null
};

const FLEETBATTLE_SAVE_KEY = "einkchess_save_fleetbattle";

const FB_REASON_KEYS = {
  bounds: "fleetbattle_reason_bounds",
  overlap: "fleetbattle_reason_overlap",
  adjacent: "fleetbattle_reason_adjacent"
};

const FB_CELL_STATE_KEYS = {
  ship: "fleetbattle_cell_ship",
  hit: "fleetbattle_cell_hit",
  miss: "fleetbattle_cell_miss",
  sunk: "fleetbattle_cell_sunk"
};

let einkFleetBattleResizeHandlerAttached = false;
let einkFleetBattleResizeTimeoutId = null;

function saveFleetBattleGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(FLEETBATTLE_SAVE_KEY, {
    phase: AppStateFleetBattle.phase,
    aiLevel: AppStateFleetBattle.aiLevel,
    orientation: AppStateFleetBattle.orientation,
    human: AppStateFleetBattle.human,
    computer: AppStateFleetBattle.computer,
    humanShots: AppStateFleetBattle.humanShots,
    computerShots: AppStateFleetBattle.computerShots,
    turn: AppStateFleetBattle.turn,
    winner: AppStateFleetBattle.winner,
    aiState: AppStateFleetBattle.aiState,
    lastHumanShot: AppStateFleetBattle.lastHumanShot,
    lastComputerShot: AppStateFleetBattle.lastComputerShot
  });
}

function clearSavedFleetBattleGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(FLEETBATTLE_SAVE_KEY);
}

function recordFleetBattleStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("fleetbattle", outcome);
}

function t18nFb(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

function fbShipName(id) {
  return t18nFb("fleetbattle_ship_" + id);
}

function setStatusFb(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultFb(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultFb(title, message) {
  setGameResultFb(message);
  setStatusFb("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function fbCellCoordLabel(r, c) {
  return String.fromCharCode(65 + c) + (r + 1);
}

function fbCellAriaLabel(r, c, cellState) {
  const coord = fbCellCoordLabel(r, c);
  if (!cellState) return coord;
  const key = FB_CELL_STATE_KEYS[cellState];
  return key ? coord + ", " + t18nFb(key) : coord;
}

function initFleetBattleApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");

  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("fleetbattle-level-inline");
  const startGameBtn = document.getElementById("start-fleetbattle-game");
  const rotateBtn = document.getElementById("fb-rotate-btn");
  const randomBtn = document.getElementById("fb-random-btn");
  const resetBtn = document.getElementById("fb-reset-btn");
  const startBattleBtn = document.getElementById("fb-start-battle-btn");
  const resignBtn = document.getElementById("fb-resign-btn");

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

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? levelInline.value : "medium";
    startNewGameFleetBattle(level);
  });

  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      AppStateFleetBattle.orientation = AppStateFleetBattle.orientation === "h" ? "v" : "h";
      updatePlacementStatusFb();
      saveFleetBattleGame();
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const fleet = FleetBattleCore.randomPlacement();
      if (fleet) AppStateFleetBattle.human = fleet;
      renderFbOwnGrid();
      updatePlacementStatusFb();
      saveFleetBattleGame();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      AppStateFleetBattle.human = FleetBattleCore.createEmptyFleet();
      renderFbOwnGrid();
      updatePlacementStatusFb();
      saveFleetBattleGame();
    });
  }

  if (startBattleBtn) {
    startBattleBtn.addEventListener("click", () => {
      if (!FleetBattleCore.isPlacementComplete(AppStateFleetBattle.human)) return;
      startBattlePhaseFb();
    });
  }

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateFleetBattle.phase !== "battle" || AppStateFleetBattle.winner) return;
      AppStateFleetBattle.winner = "computer";
      AppStateFleetBattle.phase = "over";
      renderFbOwnGrid();
      renderFbEnemyGrid();
      announceGameResultFb(t18nFb("fleetbattle_lose_title"), t18nFb("fleetbattle_resigned_message"));
      recordFleetBattleStats("loss");
      clearSavedFleetBattleGame();
      updateFbResignVisibility();
    });
  }

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (!AppStateFleetBattle.human) return;
      if (AppStateFleetBattle.phase === "placement") updatePlacementStatusFb();
      renderFbOwnGrid();
      renderFbEnemyGrid();
      updateFbMeta();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(FLEETBATTLE_SAVE_KEY) : null;
  if (savedGame && savedGame.human && savedGame.phase) {
    AppStateFleetBattle.phase = savedGame.phase;
    AppStateFleetBattle.aiLevel = FleetBattleAi.normalizeLevel(savedGame.aiLevel);
    AppStateFleetBattle.orientation = savedGame.orientation === "v" ? "v" : "h";
    AppStateFleetBattle.human = savedGame.human;
    AppStateFleetBattle.computer = savedGame.computer || null;
    AppStateFleetBattle.humanShots = savedGame.humanShots || FleetBattleCore.createShots();
    AppStateFleetBattle.computerShots = savedGame.computerShots || FleetBattleCore.createShots();
    AppStateFleetBattle.turn = savedGame.turn === "computer" ? "computer" : "human";
    AppStateFleetBattle.winner = savedGame.winner || null;
    AppStateFleetBattle.aiState = savedGame.aiState || FleetBattleAi.createState();
    AppStateFleetBattle.lastHumanShot = savedGame.lastHumanShot || null;
    AppStateFleetBattle.lastComputerShot = savedGame.lastComputerShot || null;

    if (levelInline) levelInline.value = AppStateFleetBattle.aiLevel;
    setGameResultFb("");
    showBoardSectionFb();
    buildFbGridDOM("fb-own-grid", "own");
    buildFbGridDOM("fb-enemy-grid", "enemy");

    if (AppStateFleetBattle.phase === "placement") {
      showFbPlacementUI();
      renderFbOwnGrid();
      updatePlacementStatusFb();
    } else {
      showFbBattleUI();
      renderFbOwnGrid();
      renderFbEnemyGrid();
      updateFbMeta();
      if (AppStateFleetBattle.winner) {
        const msg = AppStateFleetBattle.winner === "human" ? t18nFb("fleetbattle_win_message") : t18nFb("fleetbattle_lose_message");
        setStatusFb("board-info", msg);
      } else if (AppStateFleetBattle.turn === "computer") {
        setStatusFb("board-info", t18nFb("fleetbattle_computer_thinking"));
        setTimeout(computerTakesTurnFb, 350);
      } else {
        setStatusFb("board-info", t18nFb("fleetbattle_your_turn"));
      }
    }
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses New game.
}

function startNewGameFleetBattle(level) {
  AppStateFleetBattle.aiLevel = FleetBattleAi.normalizeLevel(level);
  AppStateFleetBattle.phase = "placement";
  AppStateFleetBattle.orientation = "h";
  AppStateFleetBattle.human = FleetBattleCore.createEmptyFleet();
  AppStateFleetBattle.computer = null;
  AppStateFleetBattle.humanShots = FleetBattleCore.createShots();
  AppStateFleetBattle.computerShots = FleetBattleCore.createShots();
  AppStateFleetBattle.turn = "human";
  AppStateFleetBattle.winner = null;
  AppStateFleetBattle.aiState = FleetBattleAi.createState();
  AppStateFleetBattle.lastHumanShot = null;
  AppStateFleetBattle.lastComputerShot = null;

  setGameResultFb("");
  showBoardSectionFb();
  buildFbGridDOM("fb-own-grid", "own");
  buildFbGridDOM("fb-enemy-grid", "enemy");
  showFbPlacementUI();
  renderFbOwnGrid();
  updatePlacementStatusFb();
  saveFleetBattleGame();
}

function startBattlePhaseFb() {
  AppStateFleetBattle.computer = FleetBattleAi.placeFleet();
  AppStateFleetBattle.humanShots = FleetBattleCore.createShots();
  AppStateFleetBattle.computerShots = FleetBattleCore.createShots();
  AppStateFleetBattle.aiState = FleetBattleAi.createState();
  AppStateFleetBattle.turn = "human";
  AppStateFleetBattle.winner = null;
  AppStateFleetBattle.lastHumanShot = null;
  AppStateFleetBattle.lastComputerShot = null;
  AppStateFleetBattle.phase = "battle";

  showFbBattleUI();
  renderFbOwnGrid();
  renderFbEnemyGrid();
  updateFbMeta();
  setStatusFb("board-info", t18nFb("fleetbattle_your_turn"));
  saveFleetBattleGame();
}

function updatePlacementStatusFb() {
  const startBattleBtn = document.getElementById("fb-start-battle-btn");
  const next = FleetBattleCore.nextShipToPlace(AppStateFleetBattle.human);
  if (next) {
    const orientationLabel = AppStateFleetBattle.orientation === "h"
      ? t18nFb("fleetbattle_orientation_horizontal")
      : t18nFb("fleetbattle_orientation_vertical");
    const text = t18nFb("fleetbattle_place_prompt") + " " + fbShipName(next.id) +
      " (" + next.length + " " + t18nFb("fleetbattle_cells_suffix") + ") - " + orientationLabel;
    setStatusFb("board-info", text);
    if (startBattleBtn) startBattleBtn.disabled = true;
  } else {
    setStatusFb("board-info", t18nFb("fleetbattle_placement_ready"));
    if (startBattleBtn) startBattleBtn.disabled = false;
  }
}

function onFbOwnCellClick(r, c) {
  if (AppStateFleetBattle.phase !== "placement") return;
  const next = FleetBattleCore.nextShipToPlace(AppStateFleetBattle.human);
  if (!next) return;

  const cells = FleetBattleCore.shipCells(r, c, next.length, AppStateFleetBattle.orientation);
  const check = FleetBattleCore.canPlaceShip(AppStateFleetBattle.human.ships, cells);
  if (!check.valid) {
    setStatusFb("board-info", t18nFb(FB_REASON_KEYS[check.reason]));
    return;
  }

  AppStateFleetBattle.human = FleetBattleCore.addShip(AppStateFleetBattle.human, next.id, next.length, cells);
  renderFbOwnGrid();
  updatePlacementStatusFb();
  saveFleetBattleGame();
}

function onFbEnemyCellClick(r, c) {
  if (AppStateFleetBattle.phase !== "battle" || AppStateFleetBattle.winner) return;
  if (AppStateFleetBattle.turn !== "human") return;
  if (FleetBattleCore.hasShot(AppStateFleetBattle.humanShots, r, c)) return;

  const result = FleetBattleCore.fireShot(AppStateFleetBattle.computer, AppStateFleetBattle.humanShots, r, c);
  AppStateFleetBattle.humanShots = result.shots;
  AppStateFleetBattle.lastHumanShot = [r, c];

  if (result.hit) {
    if (result.sunk) {
      setStatusFb("board-info", t18nFb("fleetbattle_you_sank") + " " + fbShipName(result.ship.id) + "!");
    } else {
      setStatusFb("board-info", t18nFb("fleetbattle_hit"));
    }
  } else {
    setStatusFb("board-info", t18nFb("fleetbattle_miss"));
  }

  renderFbEnemyGrid();
  updateFbMeta();

  if (result.allSunk) {
    finishGameFb("human");
    return;
  }

  AppStateFleetBattle.turn = "computer";
  renderFbEnemyGrid();
  saveFleetBattleGame();
  setStatusFb("board-info", t18nFb("fleetbattle_computer_thinking"));
  setTimeout(computerTakesTurnFb, 350);
}

function computerTakesTurnFb() {
  if (AppStateFleetBattle.phase !== "battle" || AppStateFleetBattle.winner) return;
  if (AppStateFleetBattle.turn !== "computer") return;

  const cell = FleetBattleAi.chooseShot(AppStateFleetBattle.computerShots, AppStateFleetBattle.aiState, AppStateFleetBattle.aiLevel);
  if (!cell) return;
  const r = cell[0], c = cell[1];

  const result = FleetBattleCore.fireShot(AppStateFleetBattle.human, AppStateFleetBattle.computerShots, r, c);
  AppStateFleetBattle.computerShots = result.shots;
  AppStateFleetBattle.lastComputerShot = [r, c];
  AppStateFleetBattle.aiState = FleetBattleAi.updateStateAfterShot(
    AppStateFleetBattle.aiState, AppStateFleetBattle.aiLevel, r, c, result.hit, result.sunk
  );

  renderFbOwnGrid();
  updateFbMeta();

  if (result.allSunk) {
    finishGameFb("computer");
    return;
  }

  AppStateFleetBattle.turn = "human";
  renderFbEnemyGrid();
  setStatusFb("board-info", t18nFb("fleetbattle_your_turn"));
  saveFleetBattleGame();
}

function finishGameFb(winner) {
  AppStateFleetBattle.winner = winner;
  AppStateFleetBattle.phase = "over";
  renderFbOwnGrid();
  renderFbEnemyGrid();

  if (winner === "human") {
    announceGameResultFb(t18nFb("fleetbattle_win_title"), t18nFb("fleetbattle_win_message"));
    recordFleetBattleStats("win");
  } else {
    announceGameResultFb(t18nFb("fleetbattle_lose_title"), t18nFb("fleetbattle_lose_message"));
    recordFleetBattleStats("loss");
  }

  clearSavedFleetBattleGame();
  updateFbResignVisibility();
}

function showBoardSectionFb() {
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

function showFbPlacementUI() {
  const placementControls = document.getElementById("fb-placement-controls");
  const enemyBlock = document.getElementById("fb-enemy-block");
  const resignBtn = document.getElementById("fb-resign-btn");
  if (placementControls) placementControls.classList.remove("hidden");
  if (enemyBlock) enemyBlock.classList.add("hidden");
  if (resignBtn) resignBtn.classList.add("hidden");
}

function showFbBattleUI() {
  const placementControls = document.getElementById("fb-placement-controls");
  const enemyBlock = document.getElementById("fb-enemy-block");
  if (placementControls) placementControls.classList.add("hidden");
  if (enemyBlock) enemyBlock.classList.remove("hidden");
  updateFbResignVisibility();
}

function updateFbResignVisibility() {
  const resignBtn = document.getElementById("fb-resign-btn");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateFleetBattle.phase !== "battle" || !!AppStateFleetBattle.winner);
}

/*** Board rendering ***/

function buildFbGridDOM(gridId, role) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = "";
  const size = FleetBattleCore.BOARD_SIZE;

  const corner = document.createElement("div");
  corner.className = "fb-corner";
  corner.setAttribute("aria-hidden", "true");
  grid.appendChild(corner);

  for (let c = 0; c < size; c++) {
    const label = document.createElement("div");
    label.className = "fb-label";
    label.setAttribute("aria-hidden", "true");
    label.textContent = String.fromCharCode(65 + c);
    grid.appendChild(label);
  }

  for (let r = 0; r < size; r++) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "fb-label";
    rowLabel.setAttribute("aria-hidden", "true");
    rowLabel.textContent = String(r + 1);
    grid.appendChild(rowLabel);

    for (let c = 0; c < size; c++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fb-cell";
      btn.dataset.row = String(r);
      btn.dataset.col = String(c);
      btn.disabled = true;
      if (role === "own") {
        btn.addEventListener("click", () => onFbOwnCellClick(r, c));
      } else {
        btn.addEventListener("click", () => onFbEnemyCellClick(r, c));
      }
      grid.appendChild(btn);
    }
  }

  ensureFbSquareCells(grid);
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => ensureFbSquareCells(grid));
  } else {
    setTimeout(() => ensureFbSquareCells(grid), 0);
  }
  ensureFbResizeHandler();
}

function ensureFbSquareCells(gridEl) {
  if (!gridEl) return;
  const cell = gridEl.querySelector(".fb-cell");
  if (!cell) return;
  const rect = cell.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const size = rect.width;
  gridEl.querySelectorAll(".fb-cell").forEach((c) => { c.style.height = size + "px"; });
}

function ensureFbResizeHandler() {
  if (einkFleetBattleResizeHandlerAttached) return;
  einkFleetBattleResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkFleetBattleResizeTimeoutId !== null) clearTimeout(einkFleetBattleResizeTimeoutId);
    einkFleetBattleResizeTimeoutId = setTimeout(() => {
      einkFleetBattleResizeTimeoutId = null;
      ensureFbSquareCells(document.getElementById("fb-own-grid"));
      ensureFbSquareCells(document.getElementById("fb-enemy-grid"));
    }, 150);
  });
}

// Own-board cell state: reads only AppStateFleetBattle.human (the
// player's own fleet, always fine to show in full) plus computerShots
// (what the opponent has fired at it so far).
function fbCellStateOwn(r, c) {
  const shipHere = FleetBattleCore.findShipAt(AppStateFleetBattle.human, r, c);
  if (AppStateFleetBattle.phase === "placement") {
    return shipHere ? "ship" : "";
  }
  const shotVal = AppStateFleetBattle.computerShots[FleetBattleCore.cellKey(r, c)];
  if (shotVal === "hit") {
    return (shipHere && FleetBattleCore.isShipSunk(shipHere, AppStateFleetBattle.computerShots)) ? "sunk" : "hit";
  }
  if (shotVal === "miss") return "miss";
  return shipHere ? "ship" : "";
}

// Enemy-board cell state: only ever consults AppStateFleetBattle.computer
// (the hidden fleet) for a cell the human has ALREADY fired at and hit -
// enough to tell a plain hit from a fully sunk ship, but never reveals an
// untried cell's contents.
function fbCellStateEnemy(r, c) {
  if (AppStateFleetBattle.phase === "placement" || !AppStateFleetBattle.computer) return "";
  const shotVal = AppStateFleetBattle.humanShots[FleetBattleCore.cellKey(r, c)];
  if (!shotVal) return "";
  if (shotVal === "miss") return "miss";
  const shipHere = FleetBattleCore.findShipAt(AppStateFleetBattle.computer, r, c);
  return (shipHere && FleetBattleCore.isShipSunk(shipHere, AppStateFleetBattle.humanShots)) ? "sunk" : "hit";
}

function renderFbOwnGrid() {
  const grid = document.getElementById("fb-own-grid");
  if (!grid || !AppStateFleetBattle.human) return;
  const isPlacementPhase = AppStateFleetBattle.phase === "placement";

  grid.querySelectorAll(".fb-cell").forEach((btn) => {
    const r = parseInt(btn.dataset.row, 10);
    const c = parseInt(btn.dataset.col, 10);
    const cellState = fbCellStateOwn(r, c);

    btn.classList.remove("fb-ship", "fb-hit", "fb-miss", "fb-sunk", "fb-last", "fb-clickable");
    if (cellState) btn.classList.add("fb-" + cellState);

    if (!isPlacementPhase && AppStateFleetBattle.lastComputerShot &&
        AppStateFleetBattle.lastComputerShot[0] === r && AppStateFleetBattle.lastComputerShot[1] === c) {
      btn.classList.add("fb-last");
    }

    btn.disabled = !isPlacementPhase;
    if (isPlacementPhase) btn.classList.add("fb-clickable");

    btn.setAttribute("aria-label", fbCellAriaLabel(r, c, cellState));
  });

  ensureFbSquareCells(grid);
}

function renderFbEnemyGrid() {
  const grid = document.getElementById("fb-enemy-grid");
  if (!grid) return;

  grid.querySelectorAll(".fb-cell").forEach((btn) => {
    const r = parseInt(btn.dataset.row, 10);
    const c = parseInt(btn.dataset.col, 10);
    const cellState = fbCellStateEnemy(r, c);

    btn.classList.remove("fb-ship", "fb-hit", "fb-miss", "fb-sunk", "fb-last", "fb-clickable");
    if (cellState) btn.classList.add("fb-" + cellState);

    if (AppStateFleetBattle.lastHumanShot &&
        AppStateFleetBattle.lastHumanShot[0] === r && AppStateFleetBattle.lastHumanShot[1] === c) {
      btn.classList.add("fb-last");
    }

    const alreadyShot = !!(AppStateFleetBattle.humanShots && AppStateFleetBattle.humanShots[FleetBattleCore.cellKey(r, c)]);
    const canFire = AppStateFleetBattle.phase === "battle" && AppStateFleetBattle.turn === "human" &&
      !AppStateFleetBattle.winner && !alreadyShot;
    btn.disabled = !canFire;
    if (canFire) btn.classList.add("fb-clickable");

    btn.setAttribute("aria-label", fbCellAriaLabel(r, c, cellState));
  });

  ensureFbSquareCells(grid);
}

function updateFbMeta() {
  const meta = document.getElementById("game-meta");
  if (!meta) return;
  if (AppStateFleetBattle.phase === "placement" || !AppStateFleetBattle.computer || !AppStateFleetBattle.human) {
    meta.textContent = "";
    return;
  }
  const humanAfloat = AppStateFleetBattle.human.ships.length -
    FleetBattleCore.sunkShips(AppStateFleetBattle.human, AppStateFleetBattle.computerShots).length;
  const computerAfloat = AppStateFleetBattle.computer.ships.length -
    FleetBattleCore.sunkShips(AppStateFleetBattle.computer, AppStateFleetBattle.humanShots).length;
  meta.textContent = t18nFb("fleetbattle_your_fleet") + ": " + humanAfloat + "/5   " +
    t18nFb("fleetbattle_enemy_waters") + ": " + computerAfloat + "/5";
}

document.addEventListener("DOMContentLoaded", initFleetBattleApp);

// Test-only accessor. Not referenced by any player-facing UI code path -
// see the file header comment above for why that separation matters for
// a hidden-information game.
if (typeof window !== "undefined") {
  window.__fleetBattleTestHooks = {
    getState: () => AppStateFleetBattle,
    forceFinish: (winner) => finishGameFb(winner)
  };
}
