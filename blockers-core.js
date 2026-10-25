// blockers-core.js
// "Blocked Path" (Wegesperre), a dice race game with blocks on the paths
// (internally still called stones; ids and saved games use "blockers").
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
// With "all", each player has 3 or 5 tokens (s.tokens[p].length, chosen
// before the game); with "one" always 5.
//
// Safe half: in the lower half of the board (rows SAFE_FROM_ROW and below)
// no token can be sent back - a move may not end on another player's token
// there. Without it the players in the middle houses, reachable from both
// sides, lost far more often against computers that like to hit.
//
// With "all", no stone stands on the last NEAR_GOAL fields before the goal
// (the single lane up to it): not at the start, and a taken stone may not
// be put there. Otherwise every token had to hit a stone there exactly, and
// games ran to several hundred turns.
//
// Houses: six places below the bottom row, at the columns whose field is
// 14 steps from the goal (HOUSE_COLS) - every house equally far. The
// people playing choose their house and token shape, the computers get
// houses spread out over the free ones and the shapes left over. Who
// rolls first is chosen too: "me", "computer" or "random". States saved
// before this have no `houses`: they keep the old entry columns
// (ENTRY_COLS) and shape p for player p.
//
// Quick board (task 110, s.board === "quick"): a smaller board of our own,
// 9 x 7, with fewer forks and 9 steps from every house entry to the goal
// (14 on the normal board), 4 tokens per player, 6 stones at the start
// (with "all" the one next to the goal stays off, as on the normal board),
// 2 to 4 players in four houses. Instead of the safe half it has four rest
// fields ("R"): a token there cannot be sent back, only one token may stand
// on a rest field, and no stone may be put on one. States without `board`
// are the normal board, unchanged. The exported board numbers (MAP, ROWS,
// fields, goal, ...) describe the normal board; boardOf(s) gives the board
// of a state.

const BlockersCore = (function () {
  // The board on an 11 x 10 grid: "G" goal, "#" field, "B" field with a
  // stone at the start, "R" rest field (quick board only), "." no field.
  // Fields next to each other (horizontally or vertically) are joined.
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
  // The quick board: houses under columns 1, 3, 5 and 7, every entry 9
  // steps from the goal.
  // Two ways up to the goal and no stone on them at the start; the rest
  // field right below the goal lets a token wait there safely. (A first
  // draft with stones on the single lane below the goal made games longer
  // than on the normal board.)
  const QUICK_MAP = [
    "....G....",
    "...#R#...",
    "..R#.#R..",
    "..#B.B#..",
    "#B##R##B#",
    "#.B.#.B.#",
    "#########"
  ];
  const QUICK_TOKENS = 4;
  const TOKENS = 5;              // tokens per player with "one" (and the default)
  const TOKEN_CHOICES = [3, 5];  // tokens per player with "all"
  const SAFE_FROM_ROW = 5;
  const NEAR_GOAL = 3;
  const ARRIVED = -2; // token position: reached the goal and left the board ("all")
  // Entry field (in the bottom row) of each player's house; with the
  // same number of players every entry is equally far from the goal.
  const ENTRY_COLS = { 2: [2, 8], 3: [3, 5, 7], 4: [1, 3, 7, 9] };
  // The six houses, left to right: entry columns all 14 steps from the goal.
  const HOUSE_COLS = [0, 2, 4, 6, 8, 10];
  const QUICK_HOUSE_COLS = [1, 3, 5, 7];
  const SHAPES = ["circle", "triangle", "diamond", "star"];

  // Fields, paths and distances of a board map.
  function makeBoard(map, houseCols, quick) {
    const rows = map.length, cols = map[0].length;
    const at = (r, c) => r * cols + c;
    const b = { map, rows, cols, houseCols, quick: !!quick, fields: [], goal: -1, startStones: [], rest: [], neighbours: {}, distToGoal: {} };
    const isField = new Array(rows * cols).fill(false);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = map[r][c];
        if (ch === ".") continue;
        const i = at(r, c);
        isField[i] = true;
        b.fields.push(i);
        if (ch === "G") b.goal = i;
        if (ch === "B") b.startStones.push(i);
        if (ch === "R") b.rest.push(i);
      }
    }
    b.fields.forEach((i) => {
      const r = Math.floor(i / cols), c = i % cols, out = [];
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && isField[at(rr, cc)]) out.push(at(rr, cc));
      });
      b.neighbours[i] = out;
    });
    // Steps from each field to the goal, ignoring stones and tokens.
    const queue = [b.goal];
    b.distToGoal[b.goal] = 0;
    while (queue.length) {
      const f = queue.shift();
      b.neighbours[f].forEach((n) => { if (b.distToGoal[n] === undefined) { b.distToGoal[n] = b.distToGoal[f] + 1; queue.push(n); } });
    }
    b.entry = (houseCol) => at(rows - 1, houseCol);
    b.isBottomRow = (i) => Math.floor(i / cols) === rows - 1;
    // The safe half on the normal board; the quick board has rest fields.
    b.isSafe = quick ? () => false : (i) => Math.floor(i / cols) >= SAFE_FROM_ROW;
    const restSet = new Set(b.rest);
    b.isRest = (i) => restSet.has(i);
    return b;
  }
  const NORMAL = makeBoard(MAP, HOUSE_COLS, false);
  const QUICK = makeBoard(QUICK_MAP, QUICK_HOUSE_COLS, true);
  function boardOf(s) {
    return s && (s.board === "quick" || s === "quick") ? QUICK : NORMAL;
  }

  const ROWS = NORMAL.rows, COLS = NORMAL.cols;
  const fields = NORMAL.fields, goal = NORMAL.goal, startStones = NORMAL.startStones;
  const neighbours = NORMAL.neighbours, distToGoal = NORMAL.distToGoal;
  const bottomRow = NORMAL.isBottomRow;
  const isSafe = NORMAL.isSafe;

  // Entry field of player p's house.
  function entryOf(s, p) {
    const b = boardOf(s);
    if (Array.isArray(s.houses)) return b.entry(b.houseCols[s.houses[p]]);
    return b.entry(ENTRY_COLS[s.numPlayers][p]);
  }

  // Houses (0..5, on the quick board 0..3) for all seats: the people get
  // their choices in order (a house already taken goes to the next free
  // one), each computer the free house farthest from the houses already
  // taken (the leftmost of equals).
  function assignHouses(numPlayers, choices, board) {
    const n = ENTRY_COLS[numPlayers] ? numPlayers : 2;
    const H = boardOf(board).houseCols.length, out = [];
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

  // opts: { houses, shapes, first, finish, tokens, board } - all optional
  // (then houses from assignHouses, shapes 0..n-1, seat 0 first, finish
  // "one", 5 tokens; tokens 3 only with finish "all"; board "quick" for
  // the quick board: 2 to 4 players, always 4 tokens).
  function createInitialState(numPlayers, opts) {
    const o = opts || {};
    const quick = o.board === "quick";
    const b = quick ? QUICK : NORMAL;
    let n = ENTRY_COLS[numPlayers] ? numPlayers : 2;
    if (quick && n > b.houseCols.length) n = b.houseCols.length;
    const tokens = [];
    const count = quick ? QUICK_TOKENS : (o.finish === "all" && TOKEN_CHOICES.indexOf(o.tokens) !== -1 ? o.tokens : TOKENS);
    for (let p = 0; p < n; p++) tokens.push(new Array(count).fill(-1)); // -1 = in the house
    const housesOk = Array.isArray(o.houses) && o.houses.length === n && o.houses.every((h) => h >= 0 && h < b.houseCols.length);
    const houses = housesOk ? o.houses.slice() : assignHouses(n, [], quick ? "quick" : undefined);
    const shapes = Array.isArray(o.shapes) && o.shapes.length === n ? o.shapes.slice() : assignShapes(n, []);
    const first = o.first >= 0 && o.first < n ? o.first : 0;
    const finish = o.finish === "all" ? "all" : "one";
    const stones = b.startStones.filter((f) => finish !== "all" || b.distToGoal[f] > NEAR_GOAL);
    const s = { numPlayers: n, tokens, stones, houses, shapes, first, finish, turn: first, roll: 0, phase: "roll", pendingStone: false, gameOver: false, winner: -1, turns: 0 };
    if (quick) s.board = "quick";
    return s;
  }

  function cloneState(s) {
    const c = { numPlayers: s.numPlayers, tokens: s.tokens.map((t) => t.slice()), stones: s.stones.slice(), turn: s.turn, roll: s.roll, phase: s.phase, pendingStone: s.pendingStone, gameOver: s.gameOver, winner: s.winner, turns: s.turns };
    if (Array.isArray(s.houses)) c.houses = s.houses.slice();
    if (Array.isArray(s.shapes)) c.shapes = s.shapes.slice();
    if (s.first !== undefined) c.first = s.first;
    if (s.finish) c.finish = s.finish;
    if (s.board === "quick") c.board = "quick";
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
    const b = boardOf(s);
    const from = s.tokens[player][token];
    const stones = new Set(s.stones);
    const out = new Map();
    const startPath = from === -1 ? [entryOf(s, player)] : [];
    // Not on an own token, and not on another player's token in the safe
    // half or on a rest field (one token per rest field).
    function allowedEnd(f) {
      const o = ownerAt(s, f);
      return !(o && (o.player === player || b.isSafe(f) || b.isRest(f)));
    }
    function walk(path, left) {
      const cur = path[path.length - 1];
      if (left === 0) {
        if (allowedEnd(cur) && !out.has(cur)) out.set(cur, path.slice());
        return;
      }
      // A stone or the goal cannot be passed over.
      if (stones.has(cur) || cur === b.goal) return;
      for (const n of b.neighbours[cur]) {
        if (path.indexOf(n) !== -1) continue;
        if (from !== -1 && n === from) continue;
        path.push(n);
        walk(path, left - 1);
        path.pop();
      }
    }
    if (from === -1) walk(startPath, roll - 1);
    else for (const n of b.neighbours[from]) walk([n], roll - 1);
    return Array.from(out.entries()).map(([to, path]) => ({ to, path }));
  }

  // All moves for the player on turn with the current roll:
  // [{ token, to, path }].
  function legalMoves(s) {
    const p = s.turn, moves = [], g = boardOf(s).goal;
    let houseDone = false;
    for (let k = 0; k < s.tokens[p].length; k++) {
      const at = s.tokens[p][k];
      if (at === g || at === ARRIVED) continue;
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
    const p = s.turn, goal = boardOf(s).goal;
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
      if (arrivedCount(s, p) === s.tokens[p].length) {
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
  // the bottom row, not a rest field - and with "all" not the last
  // NEAR_GOAL fields before the goal.
  function stoneTargets(s) {
    const b = boardOf(s);
    return b.fields.filter((f) => f !== b.goal && !b.isBottomRow(f) && !b.isRest(f) && !s.stones.includes(f) && !ownerAt(s, f) &&
      !(s.finish === "all" && b.distToGoal[f] <= NEAR_GOAL));
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
    const b = boardOf(s);
    const at = s.tokens[player][token];
    if (at === b.goal || at === ARRIVED) return 0;
    if (at === -1) return b.distToGoal[entryOf(s, player)] + 1;
    return b.distToGoal[at];
  }

  return {
    MAP, ROWS, COLS, TOKENS, TOKEN_CHOICES, SAFE_FROM_ROW, NEAR_GOAL, ARRIVED, isSafe, HOUSE_COLS, SHAPES, fields, goal, neighbours, distToGoal, startStones, isBottomRow: bottomRow,
    QUICK_MAP, QUICK_TOKENS, QUICK_HOUSE_COLS, boardOf,
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
