// slidepuzzle-core.js
// Rules of the sliding puzzle (task 118), without any DOM or browser
// feature. Numbered tiles 1 .. size*size-1 and one gap (0) on a square
// board of 3, 4 or 5 rows. Solved: the numbers in order, row by row, and
// the gap at the bottom right.
//
// A tap on a tile in the same row or column as the gap slides that tile
// and every tile between it and the gap one place towards the gap; one tap
// counts as one move. Puzzles are mixed only by legal moves from the
// solved board (a random walk of the gap that never steps straight back),
// so every puzzle can be solved; a walk that ends on the solved board goes
// on.
// Hint: on 3 x 3 the first move of a shortest solution (a table of all
// 181,440 positions, built on first use); on 4 x 4 and 5 x 5 the
// neighbour of the gap that lowers the sum of the distances of all tiles
// to their places most (not the tile moved just before).
//
// The state is a plain serialisable object:
// { size, tiles, moves, solved, start, shuffleMoves, lastTile }.
// Every function returns a new state, or the very same object when the
// move is not allowed.

const SlidePuzzleCore = (() => {
  const SIZES = [3, 4, 5];
  const SHUFFLE = { 3: 30, 4: 80, 5: 150 };   // at least this many mixing moves
  let table3 = null;                           // 3 x 3: position -> moves to the goal

  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function solvedTiles(size) {
    const out = [];
    for (let i = 0; i < size * size; i++) out.push((i + 1) % (size * size));
    return out;
  }

  // Places next to place `index` (up, right, down, left).
  function neighbours(index, size) {
    const row = Math.floor(index / size), col = index % size, out = [];
    if (row > 0) out.push(index - size);
    if (col + 1 < size) out.push(index + 1);
    if (row + 1 < size) out.push(index + size);
    if (col > 0) out.push(index - 1);
    return out;
  }

  function isSolved(state) {
    const n = state.tiles.length;
    return state.tiles.every((v, i) => v === (i + 1) % n);
  }

  // size: 3, 4 or 5; rng: () => [0, 1); minMoves: mixing moves (default
  // SHUFFLE[size]).
  function newGame(size, rng, minMoves) {
    const s = SIZES.indexOf(size) !== -1 ? size : 4;
    const r = rng || Math.random;
    const target = Math.max(1, Math.floor(minMoves === undefined || minMoves === null ? SHUFFLE[s] : minMoves));
    const tiles = solvedTiles(s);
    let gap = tiles.length - 1, previous = -1, count = 0;
    while (count < target || isSolved({ tiles })) {
      const choices = neighbours(gap, s).filter((i) => i !== previous);
      const next = choices[Math.min(choices.length - 1, Math.floor(r() * choices.length))];
      tiles[gap] = tiles[next];
      tiles[next] = 0;
      previous = gap;
      gap = next;
      count++;
    }
    return { size: s, tiles, moves: 0, solved: false, start: tiles.slice(), shuffleMoves: count };
  }

  // Parity test: odd width - an even number of inversions; even width -
  // inversions plus the row of the gap counted from the bottom is odd.
  function isSolvable(tiles, size) {
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (!tiles[i]) continue;
      for (let j = i + 1; j < tiles.length; j++) if (tiles[j] && tiles[i] > tiles[j]) inversions++;
    }
    if (size % 2) return inversions % 2 === 0;
    const gapRowFromBottom = size - Math.floor(tiles.indexOf(0) / size);
    return (inversions + gapRowFromBottom) % 2 === 1;
  }

  // A tile in the same row or column as the gap can slide.
  function canMove(state, index) {
    if (!state || !Array.isArray(state.tiles) || !(index >= 0 && index < state.tiles.length) || state.tiles[index] === 0) return false;
    const size = state.size, gap = state.tiles.indexOf(0);
    return Math.floor(index / size) === Math.floor(gap / size) || index % size === gap % size;
  }

  // Slides the tile on `index` and every tile between it and the gap.
  function move(state, index) {
    if (state.solved || !canMove(state, index)) return state;
    const size = state.size, tiles = state.tiles.slice(), gap = tiles.indexOf(0);
    const sameCol = index % size === gap % size;
    const step = index < gap ? (sameCol ? -size : -1) : (sameCol ? size : 1);
    for (let p = gap; p !== index; p += step) tiles[p] = tiles[p + step];
    tiles[index] = 0;
    const next = Object.assign({}, state, { tiles, moves: state.moves + 1, lastTile: state.tiles[index] });
    next.solved = isSolved(next);
    return next;
  }

  // The places a tap can move on a size x size board with the gap on `gap`:
  // every other place of its row and column (a tap slides all tiles between).
  function taps(gap, size) {
    const out = [], row = Math.floor(gap / size), col = gap % size;
    for (let k = 0; k < size; k++) {
      if (k !== col) out.push(row * size + k);
      if (k !== row) out.push(k * size + col);
    }
    return out;
  }

  function slide(tiles, size, index) {
    return move({ size, tiles, moves: 0, solved: false }, index).tiles;
  }

  // Taps to the goal for every 3 x 3 position (a tap counts as one move,
  // however many tiles it slides - as in the game).
  function buildTable3() {
    if (table3) return table3;
    const goal = solvedTiles(3), dist = new Map([[goal.join(""), 0]]), queue = [goal];
    for (let q = 0; q < queue.length; q++) {
      const a = queue[q], d = dist.get(a.join(""));
      taps(a.indexOf(0), 3).forEach((i) => {
        const b = slide(a, 3, i), k = b.join("");
        if (!dist.has(k)) { dist.set(k, d + 1); queue.push(b); }
      });
    }
    table3 = dist;
    return table3;
  }

  // 3 x 3: a shortest solution, { length, path } with the places to tap one
  // after another, or null for an unsolvable position.
  function solve3(tiles) {
    const dist = buildTable3();
    let cur = tiles.slice();
    const path = [];
    let d = dist.get(cur.join(""));
    if (d === undefined) return null;
    while (d > 0) {
      for (const i of taps(cur.indexOf(0), 3)) {
        const b = slide(cur, 3, i);
        if (dist.get(b.join("")) === d - 1) {
          path.push(i);
          cur = b;
          d--;
          break;
        }
      }
    }
    return { length: path.length, path };
  }

  function manhattan(tiles, size) {
    let total = 0;
    tiles.forEach((v, i) => {
      if (!v) return;
      const goal = v - 1;
      total += Math.abs(Math.floor(i / size) - Math.floor(goal / size)) + Math.abs(i % size - goal % size);
    });
    return total;
  }

  // The place of the tile that is sensible to move next (null when solved).
  function hint(state) {
    if (state.solved || isSolved(state)) return null;
    if (state.size === 3) {
      const s = solve3(state.tiles);
      return s && s.path.length ? s.path[0] : null;
    }
    const z = state.tiles.indexOf(0), base = manhattan(state.tiles, state.size);
    let best = null, bestDrop = -Infinity;
    neighbours(z, state.size).forEach((i) => {
      if (state.tiles[i] === state.lastTile) return;
      const b = state.tiles.slice();
      b[z] = b[i];
      b[i] = 0;
      const drop = base - manhattan(b, state.size);
      if (drop > bestDrop) { bestDrop = drop; best = i; }
    });
    return best;
  }

  return { SIZES, makeRng, solvedTiles, newGame, isSolvable, isSolved, canMove, move, solve3, hint, manhattan };
})();

if (typeof module !== "undefined") module.exports = SlidePuzzleCore;
if (typeof window !== "undefined") window.SlidePuzzleCore = SlidePuzzleCore;
