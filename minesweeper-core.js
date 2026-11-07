// minesweeper-core.js
// Dependency-free Minesweeper engine. No DOM/UI here, same separation
// of concerns as every other <game>-core.js - just no opponent, since
// Minesweeper (like Sudoku and Peg Solitaire) is solitaire.
//
// Mines aren't placed until the first reveal, and never under the
// clicked cell or any of its eight neighbors - the standard modern
// convention that guarantees the very first click always opens up a
// safe area instead of being a coin flip.
//
// A cell is { mine, revealed, flagged, adjacent } where `adjacent` is
// the number of mines in the eight surrounding cells (only meaningful
// once mines are placed).

const MinesweeperCore = (function () {
  function neighborsOf(rows, cols, r, c) {
    const result = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) result.push([nr, nc]);
      }
    }
    return result;
  }

  function createState(rows, cols, mineCount) {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({ mine: false, revealed: false, flagged: false, adjacent: 0 });
      }
      cells.push(row);
    }
    return {
      rows,
      cols,
      mineCount,
      cells,
      minesPlaced: false,
      gameOver: false,
      won: false,
      revealedCount: 0,
      flagCount: 0,
      explodedAt: null
    };
  }

  function cloneState(state) {
    return {
      rows: state.rows,
      cols: state.cols,
      mineCount: state.mineCount,
      cells: state.cells.map((row) => row.map((cell) => Object.assign({}, cell))),
      minesPlaced: state.minesPlaced,
      gameOver: state.gameOver,
      won: state.won,
      revealedCount: state.revealedCount,
      flagCount: state.flagCount,
      explodedAt: state.explodedAt
    };
  }

  function placeMines(state, safeR, safeC, rng) {
    const random = rng || Math.random;
    const { rows, cols, mineCount, cells } = state;
    const forbidden = new Set([safeR + "," + safeC]);
    neighborsOf(rows, cols, safeR, safeC).forEach(([r, c]) => forbidden.add(r + "," + c));

    const candidates = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!forbidden.has(r + "," + c)) candidates.push([r, c]);
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = candidates[i]; candidates[i] = candidates[j]; candidates[j] = tmp;
    }
    const placed = candidates.slice(0, Math.min(mineCount, candidates.length));
    placed.forEach(([r, c]) => { cells[r][c].mine = true; });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cells[r][c].mine) continue;
        cells[r][c].adjacent = neighborsOf(rows, cols, r, c).filter(([nr, nc]) => cells[nr][nc].mine).length;
      }
    }
    state.minesPlaced = true;
  }

  function checkWin(state) {
    const totalCells = state.rows * state.cols;
    return state.revealedCount === totalCells - state.mineCount;
  }

  // Reveals (r,c), flood-filling outward through connected zero-adjacency
  // cells exactly like the classic game. Returns a new state; revealing
  // a mine ends the game in a loss and reveals every mine on the board.
  function reveal(state, r, c, rng) {
    const next = cloneState(state);
    if (next.gameOver) return next;
    const cell = next.cells[r][c];
    if (cell.revealed || cell.flagged) return next;

    if (!next.minesPlaced) placeMines(next, r, c, rng);

    if (next.cells[r][c].mine) {
      next.cells.forEach((row) => row.forEach((cl) => { if (cl.mine) cl.revealed = true; }));
      next.gameOver = true;
      next.won = false;
      next.explodedAt = [r, c];
      return next;
    }

    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const cl = next.cells[cr][cc];
      if (cl.revealed || cl.flagged) continue;
      cl.revealed = true;
      next.revealedCount++;
      if (cl.adjacent === 0) {
        neighborsOf(next.rows, next.cols, cr, cc).forEach(([nr, nc]) => {
          const ncell = next.cells[nr][nc];
          if (!ncell.revealed && !ncell.flagged && !ncell.mine) stack.push([nr, nc]);
        });
      }
    }

    if (checkWin(next)) {
      next.gameOver = true;
      next.won = true;
    }
    return next;
  }

  function toggleFlag(state, r, c) {
    const next = cloneState(state);
    if (next.gameOver) return next;
    const cell = next.cells[r][c];
    if (cell.revealed) return next;
    cell.flagged = !cell.flagged;
    next.flagCount += cell.flagged ? 1 : -1;
    return next;
  }

  // "Chording": clicking an already-revealed numbered cell whose
  // adjacent flag count matches its number reveals every remaining
  // unflagged neighbor at once - exactly like a middle-click (or
  // both-buttons-click) in the classic desktop game. Just like a
  // regular reveal, this can lose the game if a flag was misplaced.
  function chord(state, r, c, rng) {
    let next = cloneState(state);
    if (next.gameOver) return next;
    const cell = next.cells[r][c];
    if (!cell.revealed || cell.adjacent === 0) return next;

    const neighbors = neighborsOf(next.rows, next.cols, r, c);
    const flagged = neighbors.filter(([nr, nc]) => next.cells[nr][nc].flagged).length;
    if (flagged !== cell.adjacent) return next;

    neighbors.forEach(([nr, nc]) => {
      if (next.gameOver) return;
      if (next.cells[nr][nc].revealed || next.cells[nr][nc].flagged) return;
      next = reveal(next, nr, nc, rng);
    });
    return next;
  }

  function countRemainingMines(state) {
    return state.mineCount - state.flagCount;
  }

  // Hint (task 181): a field that is certainly safe or certainly a mine,
  // worked out only from what is visible (the numbers of the opened fields;
  // flags are the player's guesses and are not trusted). Rules: a number
  // that equals the count of its closed neighbours makes them all mines, a
  // number already met by known mines makes the rest safe, and when one
  // number's closed neighbours lie inside another's, the difference follows.
  // Returns { r, c, kind: "safe" | "mine" } or null.
  function hintCell(state) {
    if (!state || !state.minesPlaced || state.gameOver) return null;
    const R = state.rows, C = state.cols;
    const id = (r, c) => r * C + c;
    const cons = [];
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const cell = state.cells[r][c];
        if (!cell.revealed || cell.mine) continue;
        const u = neighborsOf(R, C, r, c).filter(([nr, nc]) => !state.cells[nr][nc].revealed).map(([nr, nc]) => id(nr, nc));
        if (u.length) cons.push({ u: new Set(u), n: cell.adjacent });
      }
    }
    const mines = new Set();
    const safe = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      const live = cons.map((k) => {
        let n = k.n;
        const u = new Set();
        k.u.forEach((x) => { if (mines.has(x)) n--; else if (!safe.has(x)) u.add(x); });
        return { u, n };
      }).filter((k) => k.u.size);
      const mark = (set, list) => list.forEach((x) => { if (!set.has(x)) { set.add(x); changed = true; } });
      live.forEach((k) => {
        if (k.n === 0) mark(safe, [...k.u]);
        else if (k.n === k.u.size) mark(mines, [...k.u]);
      });
      for (let i = 0; i < live.length; i++) {
        for (let j = 0; j < live.length; j++) {
          if (i === j || live[i].u.size >= live[j].u.size) continue;
          if (![...live[i].u].every((x) => live[j].u.has(x))) continue;
          const diff = [...live[j].u].filter((x) => !live[i].u.has(x));
          const dn = live[j].n - live[i].n;
          if (dn === 0) mark(safe, diff);
          else if (dn === diff.length) mark(mines, diff);
        }
      }
    }
    const pick = (set, kind, wantFlagged) => {
      let best = null;
      set.forEach((x) => {
        const r = Math.floor(x / C), c = x % C;
        const cell = state.cells[r][c];
        if (cell.revealed || cell.flagged !== wantFlagged) return;
        if (!best || x < best.x) best = { x, r, c, kind };
      });
      return best;
    };
    const found = pick(safe, "safe", false) || pick(mines, "mine", false);
    return found ? { r: found.r, c: found.c, kind: found.kind } : null;
  }

  return {
    hintCell,
    neighborsOf,
    createState,
    cloneState,
    placeMines,
    reveal,
    toggleFlag,
    chord,
    countRemainingMines
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MinesweeperCore;
}
if (typeof window !== "undefined") {
  window.MinesweeperCore = MinesweeperCore;
}
