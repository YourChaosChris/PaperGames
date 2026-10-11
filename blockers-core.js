// blockers-core.js
// "Path Blockers" (Sperrsteine), a dice race game with blocking stones.
// Dependency-free, no DOM. Board and rules are PaperGames' own.
//
// 2 to 4 players with 5 tokens each start in their houses below the board
// and race along a network of paths to the goal at the top. Blocking
// stones stand on some fields: no token may pass over one. A token that
// lands exactly on a stone takes it and puts it on any free field (not in
// the bottom row, not the goal). A token that lands exactly on another
// player's token sends it back to its house. The number rolled must be
// used in full, and a move may not visit a field twice (no turning back).
// The first player to bring one token into the goal wins - or, with the
// game end "all" (s.finish), the first to bring all 5: then a token that
// reaches the goal leaves the board at once (ARRIVED) and the goal is free
// again. States saved before this choice have no `finish` and play "one".
//
// Houses: six places below the bottom row, at the columns whose field is
// 14 steps from the goal (HOUSE_COLS) - every house equally far. The
// people playing choose their house and token shape, the computers get
// houses spread out over the free ones and the shapes left over. Who
// rolls first is chosen too: "me", "computer" or "random". States saved
// before this have no `houses`: they keep the old entry columns
// (ENTRY_COLS) and shape p for player p.

const BlockersCore = (function () {
  // The board on an 11 x 10 grid: "G" goal, "#" field, "B" field with a
  // stone at the start, "." no field. Fields next to each other
  // (horizontally or vertically) are joined.
  const MAP = [
    ".....G.....",
    ".....#.....",
    ".....B.....",
    "...#####...",
    "...B...B...",
    ".####B####.",
    ".#...#...#.",
    "###B###B###",
    "#.#.#.#.#.#",
    "###########"
  ];
  const ROWS = MAP.length, COLS = MAP[0].length;
  const TOKENS = 5;
  const ARRIVED = -2; // token position: reached the goal and left the board ("all")
  // Entry field (in the bottom row) of each player's house; with the
  // same number of players every entry is equally far from the goal.
  const ENTRY_COLS = { 2: [2, 8], 3: [3, 5, 7], 4: [1, 3, 7, 9] };
  // The six houses, left to right: entry columns all 14 steps from the goal.
  const HOUSE_COLS = [0, 2, 4, 6, 8, 10];
  const SHAPES = ["circle", "triangle", "diamond", "star"];

  const idx = (r, c) => r * COLS + c;
  const fields = [];
  let goal = -1;
  const isField = new Array(ROWS * COLS).fill(false);
  const startStones = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[r][c];
      if (ch === ".") continue;
      const i = idx(r, c);
      isField[i] = true;
      fields.push(i);
      if (ch === "G") goal = i;
      if (ch === "B") startStones.push(i);
    }
  }
  const neighbours = {};
  fields.forEach((i) => {
    const r = Math.floor(i / COLS), c = i % COLS, out = [];
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && isField[idx(rr, cc)]) out.push(idx(rr, cc));
    });
    neighbours[i] = out;
  });
  // Steps from each field to the goal, ignoring stones and tokens.
  const distToGoal = {};
  (function () {
    const queue = [goal];
    distToGoal[goal] = 0;
    while (queue.length) {
      const f = queue.shift();
      neighbours[f].forEach((n) => { if (distToGoal[n] === undefined) { distToGoal[n] = distToGoal[f] + 1; queue.push(n); } });
    }
  })();
  const bottomRow = (i) => Math.floor(i / COLS) === ROWS - 1;

  // Entry field of player p's house.
  function entryOf(s, p) {
    if (Array.isArray(s.houses)) return idx(ROWS - 1, HOUSE_COLS[s.houses[p]]);
    return idx(ROWS - 1, ENTRY_COLS[s.numPlayers][p]);
  }

  // Houses (0..5) for all seats: the people get their choices in order (a
  // house already taken goes to the next free one), each computer the
  // free house farthest from the houses already taken (the leftmost of
  // equals).
  function assignHouses(numPlayers, choices) {
    const n = ENTRY_COLS[numPlayers] ? numPlayers : 2;
    const H = HOUSE_COLS.length, out = [];
    (choices || []).slice(0, n).forEach((c) => {
      let h = c >= 0 && c < H ? c : 0;
      while (out.indexOf(h) !== -1) h = (h + 1) % H;
      out.push(h);
    });
    while (out.length < n) {
      let best = -1, bestGap = -1;
      for (let h = 0; h < H; h++) {
        if (out.indexOf(h) !== -1) continue;
        const gap = out.length ? Math.min.apply(null, out.map((o) => Math.abs(o - h))) : (h === 1 ? 99 : 0);
        if (gap > bestGap) { best = h; bestGap = gap; }
      }
      out.push(best);
    }
    return out;
  }

  // Token shapes (0..3, SHAPES) for all seats, like assignHouses: the
  // people's choices, the computers the shapes left over in order.
  function assignShapes(numPlayers, choices) {
    const n = ENTRY_COLS[numPlayers] ? numPlayers : 2;
    const out = [];
    (choices || []).slice(0, n).forEach((c) => {
      let k = c >= 0 && c < SHAPES.length ? c : 0;
      while (out.indexOf(k) !== -1) k = (k + 1) % SHAPES.length;
      out.push(k);
    });
    for (let k = 0; out.length < n; k++) if (out.indexOf(k) === -1) out.push(k);
    return out;
  }

  // Who rolls first: "me" - seat 0 (the first person), "computer" - the
  // first computer (seat `humans`; seat 0 when nobody is a computer),
  // "random" - any seat. rng: () => [0, 1).
  function firstPlayer(choice, numPlayers, humans, rng) {
    const n = ENTRY_COLS[numPlayers] ? numPlayers : 2;
    if (choice === "me") return 0;
    if (choice === "computer") return humans >= 0 && humans < n ? humans : 0;
    return Math.floor((rng || Math.random)() * n);
  }

  // opts: { houses, shapes, first, finish } - all optional (then houses
  // from assignHouses, shapes 0..n-1, seat 0 first, finish "one").
  function createInitialState(numPlayers, opts) {
    const n = ENTRY_COLS[numPlayers] ? numPlayers : 2;
    const o = opts || {};
    const tokens = [];
    for (let p = 0; p < n; p++) tokens.push(new Array(TOKENS).fill(-1)); // -1 = in the house
    const houses = Array.isArray(o.houses) && o.houses.length === n ? o.houses.slice() : assignHouses(n, []);
    const shapes = Array.isArray(o.shapes) && o.shapes.length === n ? o.shapes.slice() : assignShapes(n, []);
    const first = o.first >= 0 && o.first < n ? o.first : 0;
    const finish = o.finish === "all" ? "all" : "one";
    return { numPlayers: n, tokens, stones: startStones.slice(), houses, shapes, first, finish, turn: first, roll: 0, phase: "roll", pendingStone: false, gameOver: false, winner: -1, turns: 0 };
  }

  function cloneState(s) {
    const c = { numPlayers: s.numPlayers, tokens: s.tokens.map((t) => t.slice()), stones: s.stones.slice(), turn: s.turn, roll: s.roll, phase: s.phase, pendingStone: s.pendingStone, gameOver: s.gameOver, winner: s.winner, turns: s.turns };
    if (Array.isArray(s.houses)) c.houses = s.houses.slice();
    if (Array.isArray(s.shapes)) c.shapes = s.shapes.slice();
    if (s.first !== undefined) c.first = s.first;
    if (s.finish) c.finish = s.finish;
    return c;
  }

  function ownerAt(s, f) {
    for (let p = 0; p < s.numPlayers; p++) {
      const k = s.tokens[p].indexOf(f);
      if (k !== -1) return { player: p, token: k };
    }
    return null;
  }

  // Every field a token can end on with exactly `roll` steps:
  // [{ to, path }] - path lists the fields stepped on, in order.
  function targetsFor(s, player, token, roll) {
    const from = s.tokens[player][token];
    const stones = new Set(s.stones);
    const out = new Map();
    const startPath = from === -1 ? [entryOf(s, player)] : [];
    function allowedEnd(f) {
      const o = ownerAt(s, f);
      return !(o && o.player === player);
    }
    function walk(path, left) {
      const cur = path[path.length - 1];
      if (left === 0) {
        if (allowedEnd(cur) && !out.has(cur)) out.set(cur, path.slice());
        return;
      }
      // A stone or the goal cannot be passed over.
      if (stones.has(cur) || cur === goal) return;
      for (const n of neighbours[cur]) {
        if (path.indexOf(n) !== -1) continue;
        if (from !== -1 && n === from) continue;
        path.push(n);
        walk(path, left - 1);
        path.pop();
      }
    }
    if (from === -1) walk(startPath, roll - 1);
    else for (const n of neighbours[from]) walk([n], roll - 1);
    return Array.from(out.entries()).map(([to, path]) => ({ to, path }));
  }

  // All moves for the player on turn with the current roll:
  // [{ token, to, path }].
  function legalMoves(s) {
    const p = s.turn, moves = [];
    let houseDone = false;
    for (let k = 0; k < TOKENS; k++) {
      const at = s.tokens[p][k];
      if (at === goal || at === ARRIVED) continue;
      if (at === -1) {
        if (houseDone) continue; // tokens in the house are all alike
        houseDone = true;
      }
      targetsFor(s, p, k, s.roll).forEach((t) => moves.push({ token: k, to: t.to, path: t.path }));
    }
    return moves;
  }

  function setRoll(s0, roll) {
    const s = cloneState(s0);
    s.roll = roll;
    s.phase = "move";
    return s;
  }

  function nextTurn(s) {
    s.turn = (s.turn + 1) % s.numPlayers;
    s.phase = "roll";
    s.roll = 0;
    s.turns++;
  }

  // Applies a move. Returns { state, captured: {player, token} | null,
  // stone: true when a stone was taken (then phase is "stone": the same
  // player must call placeStone), arrived: true when a token reached the
  // goal and left the board ("all") }.
  function applyMove(s0, move) {
    const s = cloneState(s0);
    const p = s.turn;
    let captured = null, stone = false;
    const o = ownerAt(s, move.to);
    if (o && o.player !== p) {
      s.tokens[o.player][o.token] = -1;
      captured = o;
    }
    const si = s.stones.indexOf(move.to);
    if (si !== -1) {
      s.stones.splice(si, 1);
      stone = true;
    }
    s.tokens[p][move.token] = move.to;
    let arrived = false;
    if (move.to === goal && s.finish === "all") {
      // The token leaves the board; the goal is free again.
      s.tokens[p][move.token] = ARRIVED;
      arrived = true;
      if (arrivedCount(s, p) === TOKENS) {
        s.gameOver = true;
        s.winner = p;
        s.phase = "over";
      } else {
        nextTurn(s);
      }
    } else if (move.to === goal) {
      s.gameOver = true;
      s.winner = p;
      s.phase = "over";
    } else if (stone) {
      s.phase = "stone";
      s.pendingStone = true;
    } else {
      nextTurn(s);
    }
    return { state: s, captured, stone, arrived };
  }

  // Tokens of player p that have reached the goal ("all").
  function arrivedCount(s, p) {
    return s.tokens[p].filter((t) => t === ARRIVED).length;
  }

  // Players in order of the result: the winner first, then by tokens in
  // the goal, then by the steps their tokens still need, then by seat.
  function ranking(s) {
    const total = (p) => s.tokens[p].reduce((sum, t, k) => sum + tokenDistance(s, p, k), 0);
    const seats = [];
    for (let p = 0; p < s.numPlayers; p++) seats.push(p);
    return seats.sort((a, b) => (b === s.winner) - (a === s.winner) || arrivedCount(s, b) - arrivedCount(s, a) || total(a) - total(b) || a - b);
  }

  // Free fields for a taken stone: no token, no stone, not the goal, not
  // the bottom row.
  function stoneTargets(s) {
    return fields.filter((f) => f !== goal && !bottomRow(f) && !s.stones.includes(f) && !ownerAt(s, f));
  }

  function placeStone(s0, field) {
    if (s0.phase !== "stone" || stoneTargets(s0).indexOf(field) === -1) return null;
    const s = cloneState(s0);
    s.stones.push(field);
    s.pendingStone = false;
    nextTurn(s);
    return s;
  }

  // When there is no move with the roll, the turn passes.
  function pass(s0) {
    const s = cloneState(s0);
    nextTurn(s);
    return s;
  }

  // Steps to the goal for a token (house = entry distance + 1).
  function tokenDistance(s, player, token) {
    const at = s.tokens[player][token];
    if (at === goal || at === ARRIVED) return 0;
    if (at === -1) return distToGoal[entryOf(s, player)] + 1;
    return distToGoal[at];
  }

  return {
    MAP, ROWS, COLS, TOKENS, ARRIVED, HOUSE_COLS, SHAPES, fields, goal, neighbours, distToGoal, startStones, isBottomRow: bottomRow,
    entryOf, assignHouses, assignShapes, firstPlayer, createInitialState, ownerAt, targetsFor, legalMoves, setRoll, applyMove, stoneTargets, placeStone,
    pass, tokenDistance, arrivedCount, ranking, rollDie: (rng) => 1 + Math.floor((rng || Math.random)() * 6)
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BlockersCore;
}
if (typeof window !== "undefined") {
  window.BlockersCore = BlockersCore;
}
