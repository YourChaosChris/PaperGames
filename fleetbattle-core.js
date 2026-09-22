// fleetbattle-core.js
// Dependency-free Fleet Battle engine: board/fleet data model, ship
// placement validation, shot resolution and win detection. No DOM code -
// same separation of concerns as every other <game>-core.js.
//
// This implements the classic grid-guessing naval combat game - the one
// most people know today under the trademarked name "Battleship" - under
// a generic name, matching how this collection already handles a few
// other games with well-known trademarked names (see fleetbattle-history.html
// for the full explanation: Reversi/Othello, Four in a Row/Connect Four,
// Wall Maze/Quoridor, Card Tactics/Onitama).
//
// Ruleset (see fleetbattle-rules.html for the player-facing version):
//  - Two 10x10 grids (columns A-J, rows 1-10), one per player.
//  - The traditional 5-ship fleet: Carrier (5), Battleship (4),
//    Cruiser (3), Submarine (3), Destroyer (2).
//  - Ships occupy a straight horizontal or vertical run of consecutive
//    cells and can NOT touch another ship, not even diagonally - the
//    strict "no touching" placement rule (some casual variants allow
//    ships to touch; this app deliberately does not).
//  - Exactly one shot per turn, regardless of hit or miss (no "go
//    again on a hit" bonus rule).
//  - First side to have all 5 of the opponent's ships fully sunk wins.

const FleetBattleCore = (function () {
  const BOARD_SIZE = 10;

  // 5,4,3,3,2 cell lengths - the traditional fleet composition.
  const SHIP_DEFS = [
    { id: "carrier", length: 5 },
    { id: "battleship", length: 4 },
    { id: "cruiser", length: 3 },
    { id: "submarine", length: 3 },
    { id: "destroyer", length: 2 }
  ];

  function shipDef(id) {
    for (let i = 0; i < SHIP_DEFS.length; i++) {
      if (SHIP_DEFS[i].id === id) return SHIP_DEFS[i];
    }
    return null;
  }

  function inBounds(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
  }

  function cellKey(r, c) {
    return r + "," + c;
  }

  // Builds the straight run of `length` cells starting at (row,col),
  // growing right for "h" (horizontal) or down for "v" (vertical).
  function shipCells(row, col, length, orientation) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      cells.push(orientation === "h" ? [row, col + i] : [row + i, col]);
    }
    return cells;
  }

  function cellsInBounds(cells) {
    for (let i = 0; i < cells.length; i++) {
      if (!inBounds(cells[i][0], cells[i][1])) return false;
    }
    return true;
  }

  function createEmptyFleet() {
    return { ships: [] };
  }

  function cloneFleet(fleet) {
    return {
      ships: fleet.ships.map((s) => ({ id: s.id, length: s.length, cells: s.cells.map((c) => [c[0], c[1]]) }))
    };
  }

  function isPlacementComplete(fleet) {
    return fleet.ships.length === SHIP_DEFS.length;
  }

  function nextShipToPlace(fleet) {
    const placedIds = fleet.ships.map((s) => s.id);
    for (let i = 0; i < SHIP_DEFS.length; i++) {
      if (placedIds.indexOf(SHIP_DEFS[i].id) === -1) return SHIP_DEFS[i];
    }
    return null;
  }

  function findShipAt(fleet, r, c) {
    for (let i = 0; i < fleet.ships.length; i++) {
      const ship = fleet.ships[i];
      for (let j = 0; j < ship.cells.length; j++) {
        if (ship.cells[j][0] === r && ship.cells[j][1] === c) return ship;
      }
    }
    return null;
  }

  // Bounds -> overlap -> adjacency (including diagonals), in that order,
  // so the caller can show a specific reason for a rejected placement.
  function canPlaceShip(existingShips, cells) {
    if (!cells.length || !cellsInBounds(cells)) return { valid: false, reason: "bounds" };

    const existingCells = {};
    existingShips.forEach((ship) => {
      ship.cells.forEach((cell) => { existingCells[cellKey(cell[0], cell[1])] = true; });
    });

    for (let i = 0; i < cells.length; i++) {
      if (existingCells[cellKey(cells[i][0], cells[i][1])]) return { valid: false, reason: "overlap" };
    }

    for (let i = 0; i < cells.length; i++) {
      const r = cells[i][0], c = cells[i][1];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          if (existingCells[cellKey(r + dr, c + dc)]) return { valid: false, reason: "adjacent" };
        }
      }
    }

    return { valid: true, reason: null };
  }

  // Returns a new fleet with the ship added. Caller must have already
  // validated the placement with canPlaceShip.
  function addShip(fleet, id, length, cells) {
    const next = cloneFleet(fleet);
    next.ships.push({ id, length, cells: cells.map((c) => [c[0], c[1]]) });
    return next;
  }

  function removeShip(fleet, id) {
    const next = cloneFleet(fleet);
    next.ships = next.ships.filter((s) => s.id !== id);
    return next;
  }

  // Randomized placement respecting the same no-touching rule as manual
  // placement. Used both by the "Random placement" convenience button
  // during human setup and by the computer's own fleet auto-placement
  // (see fleetbattle-ai.js). Retries with a fresh empty fleet if it ever
  // paints itself into a corner - vanishingly rare on a 10x10 board with
  // only 5 ships, but the outer retry loop makes it robust regardless.
  function randomPlacement(rng) {
    const random = rng || Math.random;
    for (let attempt = 0; attempt < 200; attempt++) {
      let fleet = createEmptyFleet();
      let ok = true;
      for (let s = 0; s < SHIP_DEFS.length; s++) {
        const def = SHIP_DEFS[s];
        let placed = false;
        for (let tries = 0; tries < 300; tries++) {
          const orientation = random() < 0.5 ? "h" : "v";
          const row = Math.floor(random() * BOARD_SIZE);
          const col = Math.floor(random() * BOARD_SIZE);
          const cells = shipCells(row, col, def.length, orientation);
          if (!cellsInBounds(cells)) continue;
          const check = canPlaceShip(fleet.ships, cells);
          if (check.valid) {
            fleet = addShip(fleet, def.id, def.length, cells);
            placed = true;
            break;
          }
        }
        if (!placed) { ok = false; break; }
      }
      if (ok) return fleet;
    }
    return null; // practically unreachable
  }

  /*** Shots ***/

  function createShots() {
    return {};
  }

  function hasShot(shots, r, c) {
    return !!shots[cellKey(r, c)];
  }

  function isShipSunk(ship, shots) {
    for (let i = 0; i < ship.cells.length; i++) {
      const cell = ship.cells[i];
      if (shots[cellKey(cell[0], cell[1])] !== "hit") return false;
    }
    return true;
  }

  function sunkShips(fleet, shots) {
    return fleet.ships.filter((s) => isShipSunk(s, shots));
  }

  function isFleetDefeated(fleet, shots) {
    return fleet.ships.length > 0 && sunkShips(fleet, shots).length === fleet.ships.length;
  }

  // Fires at (r,c) against `fleet`, given the shots already recorded
  // against it. Returns a new shots map plus the result of this shot;
  // never mutates the map passed in.
  function fireShot(fleet, shots, r, c) {
    const key = cellKey(r, c);
    if (shots[key]) {
      return { shots, alreadyFired: true, hit: false, ship: null, sunk: false, allSunk: isFleetDefeated(fleet, shots) };
    }
    const ship = findShipAt(fleet, r, c);
    const nextShots = Object.assign({}, shots);
    nextShots[key] = ship ? "hit" : "miss";
    const sunk = ship ? isShipSunk(ship, nextShots) : false;
    return {
      shots: nextShots,
      alreadyFired: false,
      hit: !!ship,
      ship: ship || null,
      sunk,
      allSunk: isFleetDefeated(fleet, nextShots)
    };
  }

  return {
    BOARD_SIZE,
    SHIP_DEFS,
    shipDef,
    inBounds,
    cellKey,
    shipCells,
    cellsInBounds,
    createEmptyFleet,
    cloneFleet,
    isPlacementComplete,
    nextShipToPlace,
    findShipAt,
    canPlaceShip,
    addShip,
    removeShip,
    randomPlacement,
    createShots,
    hasShot,
    isShipSunk,
    sunkShips,
    isFleetDefeated,
    fireShot
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FleetBattleCore;
}
if (typeof window !== "undefined") {
  window.FleetBattleCore = FleetBattleCore;
}
