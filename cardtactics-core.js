// cardtactics-core.js
// Dependency-free rules engine for Card Tactics (rules 2, task 151).
// Rules only, no DOM/UI. Rules 3 (task 151, decision 33): the card pile is
// face down; older saves are dropped.
//
// Board: 7 rows x 6 columns. Black starts on the bottom row (row 6), White
// on the top row (row 0), six identical stones each. A card's moves are
// written from Black's point of view (negative dr = up the board =
// "forward" for Black); White uses the same card turned round (every
// offset negated).
//
// Cards: twelve original cards, all of them in play. Three lie open in a
// shared row (the "display") that both players choose from; the other
// nine lie face down in a pile (`queue`, never shown). On your turn you
// pick one display card and move one of your stones by one of its moves
// (onto an empty square or an enemy stone, which is captured). The top
// card of the pile takes the used card's place, and the used card is
// slipped back into the pile at a hidden place (from `drawSeed`), so the
// order of the cards cannot be foreseen.
// Search states of the computer carry `blind: true`: a used card is then
// replaced by an unknown card (null), so the computer never looks into
// the pile.
//
// Goal: a stone that lands on the opponent's back row has crossed and
// leaves the board ("home"). The first player with two stones home
// wins. A player whose stones on the board plus stones home can no
// longer reach two loses. A player without a legal move passes and puts
// the first display card at the end of the queue. After MAX_PLIES moves
// the game ends: more stones home wins, then more stones on the board,
// otherwise it is a draw.

const CardTacticsCore = (function () {
  const RULES = 3;
  const ROWS = 7;
  const COLS = 6;
  const STONES = 6;
  const GOAL = 2;
  const DISPLAY = 3;
  const MAX_PLIES = 120;

  const CARDS = {
    arrow: { moves: [[-1, 0], [-2, 0]] },
    fork: { moves: [[-1, -1], [-1, 1]] },
    hook: { moves: [[-1, 0], [-2, -1]] },
    bow: { moves: [[-2, -1], [-2, 1]] },
    stairs: { moves: [[-1, -1], [-2, -2]] },
    fan: { moves: [[-1, -1], [-1, 0], [-1, 1]] },
    wave: { moves: [[-1, -2], [-1, 2], [-2, 0]] },
    zigzag: { moves: [[0, -1], [-2, 1]] },
    ladder: { moves: [[-2, 0], [0, -1], [0, 1]] },
    anchor: { moves: [[-2, 0], [1, -1], [1, 1]] },
    bridge: { moves: [[-1, -2], [-1, 2], [1, 0]] },
    key: { moves: [[-1, 1], [-1, -2]] }
  };
  const CARD_IDS = Object.keys(CARDS);

  function otherPlayer(player) {
    return player === "black" ? "white" : "black";
  }

  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function cardMovesFor(cardId, player) {
    const base = CARDS[cardId].moves;
    if (player === "black") return base;
    return base.map(([dr, dc]) => [-dr, -dc]);
  }

  // The row a player's stones must reach (the opponent's back row).
  function goalRow(player) {
    return player === "black" ? 0 : ROWS - 1;
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < ROWS; r++) board.push(new Array(COLS).fill(null));
    for (let c = 0; c < STONES; c++) {
      board[0][c] = { color: "white" };
      board[ROWS - 1][c] = { color: "black" };
    }
    return board;
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

  // Small seeded generator for tests and measurements.
  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createInitialState(rng, starter) {
    const order = shuffle(CARD_IDS, rng);
    return {
      rules: RULES,
      board: createInitialBoard(),
      display: order.slice(0, DISPLAY),
      queue: order.slice(DISPLAY),
      drawSeed: Math.floor((rng || Math.random)() * 2147483646) + 1,
      home: { black: 0, white: 0 },
      currentPlayer: starter === "white" ? "white" : "black",
      starter: starter === "white" ? "white" : "black",
      ply: 0,
      gameOver: false,
      winner: null,
      winReason: null
    };
  }

  function cloneState(state) {
    return {
      rules: state.rules,
      board: state.board.map((row) => row.map((cell) => (cell ? { color: cell.color } : null))),
      display: state.display.slice(),
      queue: state.queue.slice(),
      drawSeed: state.drawSeed,
      blind: state.blind,
      home: { black: state.home.black, white: state.home.white },
      currentPlayer: state.currentPlayer,
      starter: state.starter,
      ply: state.ply,
      gameOver: state.gameOver,
      winner: state.winner,
      winReason: state.winReason
    };
  }

  // True for a saved state that follows these rules (older saves - rules 1
  // without a `rules` field, rules 2 with an open queue - are dropped).
  function isCurrentState(state) {
    if (!state || state.rules !== RULES || state.blind) return false;
    if (!Number.isInteger(state.drawSeed) || state.drawSeed < 1) return false;
    if (!Array.isArray(state.board) || state.board.length !== ROWS) return false;
    if (!state.board.every((row) => Array.isArray(row) && row.length === COLS)) return false;
    if (!Array.isArray(state.display) || !Array.isArray(state.queue)) return false;
    const all = state.display.concat(state.queue);
    if (all.length !== CARD_IDS.length || !all.every((id) => CARDS[id])) return false;
    if (new Set(all).size !== all.length) return false;
    if (!state.home || typeof state.home.black !== "number" || typeof state.home.white !== "number") return false;
    return state.currentPlayer === "black" || state.currentPlayer === "white";
  }

  function countStones(state, player) {
    let n = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = state.board[r][c];
      if (p && p.color === player) n++;
    }
    return n;
  }

  // Every legal move for `player`: { from:[r,c], to:[r,c], card, home }.
  function getLegalMoves(state, player) {
    const moves = [];
    const goal = goalRow(player);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const piece = state.board[r][c];
        if (!piece || piece.color !== player) continue;
        state.display.forEach((cardId) => {
          if (!cardId) return; // an unknown card in a search state
          cardMovesFor(cardId, player).forEach(([dr, dc]) => {
            if (state.ply === 0 && Math.abs(dr) > 1) return; // balance: the opening move goes one row at most
            const tr = r + dr, tc = c + dc;
            if (!inBounds(tr, tc)) return;
            const target = state.board[tr][tc];
            if (target && target.color === player) return;
            moves.push({ from: [r, c], to: [tr, tc], card: cardId, home: tr === goal });
          });
        });
      }
    }
    return moves;
  }

  // The used card leaves the display; the top card of the pile takes its
  // place and the used card goes back into the pile at a hidden place.
  function cycleCard(next, cardId) {
    const slot = next.display.indexOf(cardId);
    if (next.blind) { next.display[slot] = null; return; }
    next.display[slot] = next.queue.shift();
    next.drawSeed = (next.drawSeed * 48271) % 2147483647;
    next.queue.splice(next.drawSeed % (next.queue.length + 1), 0, cardId);
  }

  function finish(next, winner, reason) {
    next.gameOver = true;
    next.winner = winner;
    next.winReason = reason;
  }

  function checkEnd(next, mover) {
    const opp = otherPlayer(mover);
    if (next.home[mover] >= GOAL) return finish(next, mover, "home");
    if (countStones(next, opp) + next.home[opp] < GOAL) return finish(next, mover, "captured");
    if (next.ply >= MAX_PLIES) {
      if (next.home.black !== next.home.white) return finish(next, next.home.black > next.home.white ? "black" : "white", "limit-home");
      const b = countStones(next, "black"), w = countStones(next, "white");
      if (b !== w) return finish(next, b > w ? "black" : "white", "limit-stones");
      return finish(next, "draw", "limit-draw");
    }
  }

  // Applies a legal move (validated by the caller via getLegalMoves) and
  // returns the new state: stone moved or taken home, capture, card
  // cycled, game end checked.
  function applyMove(state, player, move) {
    const next = cloneState(state);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const moving = next.board[fr][fc];
    next.board[fr][fc] = null;
    if (tr === goalRow(player)) {
      next.board[tr][tc] = null; // a stone standing there is captured
      next.home[player]++;
    } else {
      next.board[tr][tc] = moving;
    }
    cycleCard(next, move.card);
    next.ply++;
    next.currentPlayer = otherPlayer(player);
    checkEnd(next, player);
    return next;
  }

  // No legal move: the player passes and the first open card goes back
  // into the pile, so the display changes.
  function applyPass(state, player) {
    const next = cloneState(state);
    const first = next.display.find((id) => id);
    if (first) cycleCard(next, first);
    next.ply++;
    next.currentPlayer = otherPlayer(player);
    checkEnd(next, player);
    return next;
  }

  // A copy for the computer's search: the pile stays unknown.
  function blindState(state) {
    const s = cloneState(state);
    s.blind = true;
    s.queue = [];
    return s;
  }

  return {
    RULES,
    ROWS,
    COLS,
    STONES,
    GOAL,
    DISPLAY,
    MAX_PLIES,
    CARDS,
    CARD_IDS,
    otherPlayer,
    inBounds,
    cardMovesFor,
    goalRow,
    createInitialBoard,
    createInitialState,
    cloneState,
    isCurrentState,
    countStones,
    getLegalMoves,
    applyMove,
    applyPass,
    blindState,
    makeRng,
    shuffle
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CardTacticsCore;
}
if (typeof window !== "undefined") {
  window.CardTacticsCore = CardTacticsCore;
}
