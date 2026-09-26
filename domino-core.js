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

const DominoCore = (function () {
  const MAX_PIP = 6;
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 4;

  function createTileSet() {
    const tiles = [];
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

  function handSize(numPlayers) {
    return numPlayers === 2 ? 7 : 5;
  }

  function isDouble(tile) {
    return tile[0] === tile[1];
  }

  function pips(tile) {
    return tile[0] + tile[1];
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
    return Math.max(x[0], x[1]) - Math.max(y[0], y[1]);
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

  function createInitialState(numPlayers, rng) {
    const n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, numPlayers || 2));
    const tiles = shuffle(createTileSet(), rng);
    const size = handSize(n);
    const hands = [];
    for (let p = 0; p < n; p++) hands.push(tiles.splice(0, size));
    const opening = findOpening(hands);
    return {
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
  }

  function cloneState(state) {
    return {
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
  }

  // The two open ends, or null while the line is still empty.
  function openEnds(state) {
    if (!state.line.length) return null;
    return { left: state.line[0][0], right: state.line[state.line.length - 1][1] };
  }

  function sameTile(x, y) {
    return (x[0] === y[0] && x[1] === y[1]) || (x[0] === y[1] && x[1] === y[0]);
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
    return state.stock.length ? "draw" : "pass";
  }

  function noteMissing(state, player) {
    const ends = openEnds(state);
    if (!ends) return;
    [ends.left, ends.right].forEach((v) => {
      if (state.missing[player].indexOf(v) === -1) state.missing[player].push(v);
    });
  }

  function nextPlayer(state) {
    return (state.turn + 1) % state.numPlayers;
  }

  // Plays hand[index] on `side`. Returns { state, tile, side } with the
  // tile as it now lies in the line (oriented).
  function applyMove(state, index, side) {
    const next = cloneState(state);
    const player = next.turn;
    const tile = next.hands[player][index];
    const ends = openEnds(next);
    let placed;
    if (!ends) {
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
    return { state: next, tile };
  }

  // The player to move passes (only legal with no playable tile and an
  // empty stock). Once every player has passed in a row the line is
  // blocked and the round is scored by pip totals.
  function pass(state) {
    const next = cloneState(state);
    noteMissing(next, next.turn);
    next.passesInRow++;
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
    createTileSet,
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
