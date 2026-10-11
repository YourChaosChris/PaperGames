// domino-core.js
// Dependency-free rules engine for Domino, the classic "draw game" played
// with a double-six set. No DOM code lives here - pure state plus legal
// move generation, shared by domino-app.js (human interaction) and
// domino-ai.js (computer players).
//
// Rules implemented:
//   - A double-six set: 28 tiles, every pair of pips 0-6 exactly once.
//   - 2-4 players; 7 tiles each with two players, 5 each with three or
//     four. The rest stays face down as the stock.
//   - Whoever holds the highest double opens with it; if nobody holds a
//     double, the highest tile opens (most pips, then the higher half).
//   - A tile is played on either open end of the line, matching pips.
//   - A player who can't play draws from the stock until they can; with
//     the stock empty they pass.
//   - The round ends when someone plays their last tile (they win), or
//     when every player has passed in a row (the line is blocked): then
//     the lowest pip total in hand wins, and a shared lowest total is a
//     draw. Only one round is played - no running score.
//
// A tile is a two-element array [a, b]. In a hand it is stored as dealt
// (a <= b); in the line it is stored oriented left-to-right, so the
// line's open ends are always line[0][0] and line[line.length-1][1].
//
// Variant "triangle" (state.variant; older saves have none and are
// classic): triangular tiles with a number 0-5 in each corner, every
// combination once (56 tiles, [a, b, c] with a <= b <= c), laid on a
// grid of triangles pointing up and down in turn. Triangle (r, c) points
// up when r + c is even; its corners are grid points (see triCorners).
// A tile may go on any free triangle that shares a side with one already
// laid, turned (and flipped) so that every corner it shares with laid
// tiles has the same number - so both numbers match on every shared
// side. A move is { index, slot } with slot "r,c". state.board maps slot
// to the tile's corner numbers (in triCorners order), state.corners maps
// grid point to its number, state.slots lists the slots in the order
// they were filled (state.line the tiles in the same order). Hands: 9
// tiles each with two players, 7 with three or four. A player who can't
// play draws at most 3 tiles (state.drawn), then passes even with tiles
// left in the stock; only passes with an empty stock count towards a
// blocked board. Opening and the end are as in the classic game, a
// "double" being a tile with three equal numbers and pips the sum of all
// three numbers.

const DominoCore = (function () {
  const MAX_PIP = 6;
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 4;

  const TRI_MAX = 5;
  const TRI_DRAWS = 3;

  function createTileSet(variant) {
    const tiles = [];
    if (variant === "triangle") {
      for (let a = 0; a <= TRI_MAX; a++) {
        for (let b = a; b <= TRI_MAX; b++) {
          for (let c = b; c <= TRI_MAX; c++) tiles.push([a, b, c]);
        }
      }
      return tiles;
    }
    for (let a = 0; a <= MAX_PIP; a++) {
      for (let b = a; b <= MAX_PIP; b++) tiles.push([a, b]);
    }
    return tiles;
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function handSize(numPlayers, variant) {
    if (variant === "triangle") return numPlayers === 2 ? 9 : 7;
    return numPlayers === 2 ? 7 : 5;
  }

  // A double (classic) or a tile with three equal numbers (triangle).
  function isDouble(tile) {
    return tile.every((v) => v === tile[0]);
  }

  function pips(tile) {
    return tile.reduce((sum, v) => sum + v, 0);
  }

  function pipTotal(hand) {
    return hand.reduce((sum, t) => sum + pips(t), 0);
  }

  // Higher-ranked tile for choosing who opens: any double beats any
  // non-double, then more pips, then the higher half.
  function compareOpening(x, y) {
    const dx = isDouble(x) ? 1 : 0;
    const dy = isDouble(y) ? 1 : 0;
    if (dx !== dy) return dx - dy;
    if (pips(x) !== pips(y)) return pips(x) - pips(y);
    return Math.max.apply(null, x) - Math.max.apply(null, y);
  }

  function findOpening(hands) {
    let best = null;
    hands.forEach((hand, player) => {
      hand.forEach((tile, index) => {
        if (!best || compareOpening(tile, best.tile) > 0) best = { player, index, tile };
      });
    });
    return best;
  }

  function createInitialState(numPlayers, rng, variant) {
    const n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, numPlayers || 2));
    const tri = variant === "triangle";
    const tiles = shuffle(createTileSet(tri ? "triangle" : null), rng);
    const size = handSize(n, tri ? "triangle" : null);
    const hands = [];
    for (let p = 0; p < n; p++) hands.push(tiles.splice(0, size));
    const opening = findOpening(hands);
    const state = {
      numPlayers: n,
      hands,
      stock: tiles,
      line: [],
      turn: opening.player,
      openingTile: opening.tile.slice(),
      passesInRow: 0,
      // Per player, the pip values they were seen unable to play (they
      // had to draw or pass while those were the open ends). Public
      // information anyone at the table could have noticed.
      missing: hands.map(() => []),
      gameOver: false,
      winner: null,   // player index, or null
      draw: false,
      blocked: false
    };
    if (tri) {
      state.variant = "triangle";
      state.board = {};
      state.corners = {};
      state.slots = [];
      state.drawn = 0;
    }
    return state;
  }

  function isTriangle(state) {
    return state.variant === "triangle";
  }

  function cloneState(state) {
    const out = {
      numPlayers: state.numPlayers,
      hands: state.hands.map((h) => h.map((t) => t.slice())),
      stock: state.stock.map((t) => t.slice()),
      line: state.line.map((t) => t.slice()),
      turn: state.turn,
      openingTile: state.openingTile ? state.openingTile.slice() : null,
      passesInRow: state.passesInRow,
      missing: state.missing.map((m) => m.slice()),
      gameOver: state.gameOver,
      winner: state.winner,
      draw: state.draw,
      blocked: state.blocked
    };
    if (isTriangle(state)) {
      out.variant = "triangle";
      out.board = {};
      Object.keys(state.board).forEach((k) => { out.board[k] = state.board[k].slice(); });
      out.corners = Object.assign({}, state.corners);
      out.slots = state.slots.slice();
      out.drawn = state.drawn || 0;
    }
    return out;
  }

  /*** Triangle grid ***/

  function slotKey(r, c) { return r + "," + c; }
  function parseSlot(slot) { const p = slot.split(","); return [+p[0], +p[1]]; }
  function pointsUp(r, c) { return ((r + c) % 2 + 2) % 2 === 0; }

  // The grid points ("row,x") at the corners of triangle (r, c): up -
  // top, bottom left, bottom right; down - top left, top right, bottom.
  function triCorners(r, c) {
    if (pointsUp(r, c)) return [slotKey(r, c + 1), slotKey(r + 1, c), slotKey(r + 1, c + 2)];
    return [slotKey(r, c), slotKey(r, c + 2), slotKey(r + 1, c + 1)];
  }

  // The three triangles sharing a side with (r, c).
  function triNeighbours(r, c) {
    return [[r, c - 1], [r, c + 1], pointsUp(r, c) ? [r + 1, c] : [r - 1, c]];
  }

  const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

  // The tile's numbers for the slot's corners (triCorners order) so that
  // every corner already numbered keeps its number, or null.
  function placement(state, tile, slot) {
    const rc = parseSlot(slot);
    const pts = triCorners(rc[0], rc[1]);
    for (const p of PERMS) {
      const nums = [tile[p[0]], tile[p[1]], tile[p[2]]];
      if (pts.every((pt, i) => state.corners[pt] === undefined || state.corners[pt] === nums[i])) return nums;
    }
    return null;
  }

  // Free triangles next to a laid tile (or the starting triangle "0,0"
  // while the board is empty).
  function openSlots(state) {
    if (!state.slots.length) return ["0,0"];
    const seen = {}, out = [];
    state.slots.forEach((slot) => {
      const rc = parseSlot(slot);
      triNeighbours(rc[0], rc[1]).forEach((nb) => {
        const k = slotKey(nb[0], nb[1]);
        if (!state.board[k] && !seen[k]) { seen[k] = true; out.push(k); }
      });
    });
    return out;
  }

  // The slots a tile may go on (triangle).
  function slotsForTile(state, tile) {
    if (!state.slots.length) return state.openingTile && sameTile(tile, state.openingTile) ? ["0,0"] : [];
    return openSlots(state).filter((slot) => placement(state, tile, slot) !== null);
  }

  // How many laid tiles share a side with the slot.
  function touching(state, slot) {
    const rc = parseSlot(slot);
    return triNeighbours(rc[0], rc[1]).filter((nb) => state.board[slotKey(nb[0], nb[1])]).length;
  }

  // The two open ends, or null while the line is still empty.
  function openEnds(state) {
    if (!state.line.length) return null;
    return { left: state.line[0][0], right: state.line[state.line.length - 1][1] };
  }

  function sameTile(x, y) {
    if (x.length !== y.length) return false;
    const a = x.slice().sort(), b = y.slice().sort();
    return a.every((v, i) => v === b[i]);
  }

  // Which ends ("left"/"right") a tile could be played on.
  function sidesForTile(state, tile) {
    const ends = openEnds(state);
    if (!ends) return state.openingTile && sameTile(tile, state.openingTile) ? ["right"] : [];
    const sides = [];
    if (tile[0] === ends.left || tile[1] === ends.left) sides.push("left");
    if (tile[0] === ends.right || tile[1] === ends.right) sides.push("right");
    return sides;
  }

  // Every legal { index, side } for the player whose hand it is. On the
  // empty line only the opening tile may be played.
  function legalMoves(state, player) {
    const moves = [];
    if (state.gameOver) return moves;
    if (isTriangle(state)) {
      state.hands[player].forEach((tile, index) => {
        slotsForTile(state, tile).forEach((slot) => moves.push({ index, slot }));
      });
      return moves;
    }
    state.hands[player].forEach((tile, index) => {
      sidesForTile(state, tile).forEach((side) => moves.push({ index, side }));
    });
    return moves;
  }

  function canPlay(state, player) {
    return legalMoves(state, player).length > 0;
  }

  // What the player to move has to do: "play", "draw" (no legal tile but
  // the stock has some left) or "pass" (no legal tile, empty stock).
  function requiredAction(state) {
    if (state.gameOver) return null;
    if (canPlay(state, state.turn)) return "play";
    if (isTriangle(state) && (state.drawn || 0) >= TRI_DRAWS) return "pass";
    return state.stock.length ? "draw" : "pass";
  }

  function noteMissing(state, player) {
    if (isTriangle(state)) return;
    const ends = openEnds(state);
    if (!ends) return;
    [ends.left, ends.right].forEach((v) => {
      if (state.missing[player].indexOf(v) === -1) state.missing[player].push(v);
    });
  }

  function nextPlayer(state) {
    return (state.turn + 1) % state.numPlayers;
  }

  // Plays hand[index] on `side` ("left"/"right"; triangle: the slot).
  // Returns { state, tile, side } with the tile as it now lies (oriented;
  // triangle: its corner numbers in triCorners order).
  function applyMove(state, index, side) {
    const next = cloneState(state);
    const player = next.turn;
    const tile = next.hands[player][index];
    const ends = isTriangle(next) ? null : openEnds(next);
    let placed;
    if (isTriangle(next)) {
      const slot = next.slots.length ? side : "0,0";
      placed = next.slots.length ? placement(next, tile, slot) : tile.slice().sort();
      const rc = parseSlot(slot);
      triCorners(rc[0], rc[1]).forEach((pt, i) => { next.corners[pt] = placed[i]; });
      next.board[slot] = placed;
      next.slots.push(slot);
      next.line.push(placed);
      next.openingTile = null;
      next.drawn = 0;
      side = slot;
    } else if (!ends) {
      placed = tile.slice();
      next.line.push(placed);
      next.openingTile = null;
    } else if (side === "left") {
      placed = tile[1] === ends.left ? [tile[0], tile[1]] : [tile[1], tile[0]];
      next.line.unshift(placed);
    } else {
      placed = tile[0] === ends.right ? [tile[0], tile[1]] : [tile[1], tile[0]];
      next.line.push(placed);
    }
    next.hands[player].splice(index, 1);
    next.passesInRow = 0;
    if (!next.hands[player].length) {
      next.gameOver = true;
      next.winner = player;
    } else {
      next.turn = nextPlayer(next);
    }
    return { state: next, tile: placed, side };
  }

  // The player to move takes one tile from the stock. Returns { state,
  // tile } (tile null if the stock was empty).
  function drawTile(state) {
    const next = cloneState(state);
    noteMissing(next, next.turn);
    const tile = next.stock.length ? next.stock.pop() : null;
    if (tile) next.hands[next.turn].push(tile);
    if (tile && isTriangle(next)) next.drawn = (next.drawn || 0) + 1;
    return { state: next, tile };
  }

  // The player to move passes (only legal with no playable tile and an
  // empty stock). Once every player has passed in a row the line is
  // blocked and the round is scored by pip totals.
  function pass(state) {
    const next = cloneState(state);
    noteMissing(next, next.turn);
    // Only passes with an empty stock count towards a blocked line (in the
    // triangle variant a player may pass with tiles left in the stock).
    if (next.stock.length) next.passesInRow = 0;
    else next.passesInRow++;
    if (isTriangle(next)) next.drawn = 0;
    if (next.passesInRow >= next.numPlayers) {
      next.gameOver = true;
      next.blocked = true;
      const totals = next.hands.map(pipTotal);
      const low = Math.min.apply(null, totals);
      const lowest = totals.map((t, i) => (t === low ? i : -1)).filter((i) => i !== -1);
      if (lowest.length === 1) next.winner = lowest[0];
      else next.draw = true;
    } else {
      next.turn = nextPlayer(next);
    }
    return next;
  }

  function tileCount(state) {
    return state.stock.length + state.line.length + state.hands.reduce((s, h) => s + h.length, 0);
  }

  return {
    MAX_PIP,
    MIN_PLAYERS,
    MAX_PLAYERS,
    TRI_MAX,
    TRI_DRAWS,
    createTileSet,
    isTriangle,
    pointsUp,
    triCorners,
    triNeighbours,
    parseSlot,
    placement,
    openSlots,
    slotsForTile,
    touching,
    shuffle,
    handSize,
    isDouble,
    pips,
    pipTotal,
    compareOpening,
    createInitialState,
    cloneState,
    openEnds,
    sameTile,
    sidesForTile,
    legalMoves,
    canPlay,
    requiredAction,
    applyMove,
    drawTile,
    pass,
    tileCount
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DominoCore;
}
