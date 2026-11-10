// mancala-core.js
// Dependency-free rules engine for Mancala (Kalaha), using the common
// "4 seeds per pit, capture into an empty pit, extra turn on your own
// store" ruleset popularized by the trademarked Kalah(a) game. Mirrors
// the separation of concerns in the other <game>-core.js modules: rules
// only, no DOM/UI.
//
// Board layout: a single flat array of 14 slots, walked in one
// direction (counter-clockwise) for sowing:
//   0-5   player A's six pits (left to right from A's own side)
//   6     player A's store
//   7-12  player B's six pits (left to right from B's own side,
//         i.e. pit 7 sits directly opposite pit 5, pit 12 opposite pit 0)
//   13    player B's store
// Sowing wraps from 13 back to 0. A player's own store collects a seed
// every time sowing passes it; the opponent's store is always skipped
// entirely (no seed dropped, no turn consumed) rather than counted.
//
// Task 213: rule set "oware" (state.rules; a state without rules is
// Kalah). Same 12 pits, 4 seeds each; the two stores only hold captured
// seeds and are never sown into. A move with 12 or more seeds skips the
// pit it started from. The last seed in an opponent's pit that then holds
// 2 or 3 captures it, and so do the opponent's pits right before it, as
// long as they hold 2 or 3 too. A move that would capture all of the
// opponent's seeds captures nothing (grand slam). No extra turns. Hunger
// rule: when the opponent has no seeds, a move must give them some. When
// the player to move has no legal move, or after 100 moves without a
// capture, each player takes the seeds on their own side. More than 24
// seeds wins; 24 each is a draw.

const MancalaCore = (function () {
  const SEEDS_PER_PIT = 4;
  const STORE_A = 6;
  const STORE_B = 13;
  const PITS_A = [0, 1, 2, 3, 4, 5];
  const PITS_B = [7, 8, 9, 10, 11, 12];

  function otherPlayer(player) {
    return player === "a" ? "b" : "a";
  }

  function storeOf(player) {
    return player === "a" ? STORE_A : STORE_B;
  }

  function pitsOf(player) {
    return player === "a" ? PITS_A : PITS_B;
  }

  const OWARE_QUIET_LIMIT = 100;

  function isOware(state) {
    return !!state && state.rules === "oware";
  }

  function createInitialState(rules) {
    const board = new Array(14).fill(SEEDS_PER_PIT);
    board[STORE_A] = 0;
    board[STORE_B] = 0;
    if (rules === "oware") return { board, gameOver: false, rules: "oware", quiet: 0 };
    return { board, gameOver: false };
  }

  function cloneState(state) {
    const out = { board: state.board.slice(), gameOver: state.gameOver };
    if (isOware(state)) { out.rules = "oware"; out.quiet = state.quiet || 0; }
    return out;
  }

  // Oware sowing: the pits after `from`, never a store, and not `from`
  // itself on a second lap. Returns the board and the last pit.
  function sowOware(board, from) {
    let seeds = board[from];
    board[from] = 0;
    let idx = from;
    while (seeds > 0) {
      idx = (idx + 1) % 14;
      if (idx === STORE_A || idx === STORE_B || idx === from) continue;
      board[idx]++;
      seeds--;
    }
    return idx;
  }

  function sideSeeds(board, player) {
    return pitsOf(player).reduce((t, i) => t + board[i], 0);
  }

  function getLegalMovesOware(state, player) {
    const own = pitsOf(player).filter((i) => state.board[i] > 0);
    const opp = otherPlayer(player);
    if (sideSeeds(state.board, opp) > 0) return own;
    // Hunger rule: the opponent must get seeds.
    return own.filter((i) => {
      const b = state.board.slice();
      sowOware(b, i);
      return sideSeeds(b, opp) > 0;
    });
  }

  // Each player takes the seeds on their own side.
  function settleOware(board) {
    PITS_A.forEach((i) => { board[STORE_A] += board[i]; board[i] = 0; });
    PITS_B.forEach((i) => { board[STORE_B] += board[i]; board[i] = 0; });
  }

  function applyMoveOware(state, player, from) {
    const board = state.board.slice();
    const opp = otherPlayer(player);
    const last = sowOware(board, from);
    let captured = 0;
    const capturedPits = [];
    if (isOwnPit(opp, last) && (board[last] === 2 || board[last] === 3)) {
      const oppPits = pitsOf(opp);
      let k = oppPits.indexOf(last);
      const take = [];
      while (k >= 0 && (board[oppPits[k]] === 2 || board[oppPits[k]] === 3)) { take.push(oppPits[k]); k--; }
      const total = take.reduce((t, i) => t + board[i], 0);
      // Grand slam: taking every seed of the opponent captures nothing.
      if (total < sideSeeds(board, opp)) {
        take.forEach((i) => { captured += board[i]; capturedPits.push(i); board[i] = 0; });
        board[storeOf(player)] += captured;
      }
    }
    const quiet = captured ? 0 : (state.quiet || 0) + 1;
    let gameOver = board[STORE_A] > 24 || board[STORE_B] > 24 || (board[STORE_A] === 24 && board[STORE_B] === 24);
    if (!gameOver) {
      const next = { board, gameOver: false, rules: "oware", quiet };
      if (quiet >= OWARE_QUIET_LIMIT || !getLegalMovesOware(next, opp).length) {
        settleOware(board);
        gameOver = true;
      }
    }
    return { state: { board, gameOver, rules: "oware", quiet }, extraTurn: false, captured, capturedPits, landedIn: last };
  }

  // The pit directly across the board from pit `i` - only meaningful
  // for the 12 real pits, never called with a store index.
  function oppositePit(i) {
    return 12 - i;
  }

  function isOwnPit(player, i) {
    return pitsOf(player).indexOf(i) !== -1;
  }

  function getLegalMoves(state, player) {
    if (isOware(state)) return getLegalMovesOware(state, player);
    return pitsOf(player).filter((i) => state.board[i] > 0);
  }

  // Sweeps any remaining seeds into their owner's store once one side's
  // six pits are all empty, and reports whether that just ended the
  // game - the standard Kalaha ending condition.
  function settleIfOver(board) {
    const aEmpty = PITS_A.every((i) => board[i] === 0);
    const bEmpty = PITS_B.every((i) => board[i] === 0);
    if (!aEmpty && !bEmpty) return false;
    PITS_A.forEach((i) => { board[STORE_A] += board[i]; board[i] = 0; });
    PITS_B.forEach((i) => { board[STORE_B] += board[i]; board[i] = 0; });
    return true;
  }

  // Sows the seeds from pit `from` for `player`. Returns
  // { state, extraTurn, captured, landedIn } - `captured` is the total
  // number of seeds swept into the store by a capture on this move (0
  // if none), `landedIn` is the slot the last seed was dropped in, and
  // `extraTurn` is true when that slot is the mover's own store (so the
  // same player moves again next).
  function applyMove(state, player, from) {
    if (isOware(state)) return applyMoveOware(state, player, from);
    const board = state.board.slice();
    let seeds = board[from];
    board[from] = 0;
    const oppStore = storeOf(otherPlayer(player));

    let idx = from;
    while (seeds > 0) {
      idx = (idx + 1) % 14;
      if (idx === oppStore) continue; // pass over the opponent's store untouched
      board[idx]++;
      seeds--;
    }

    const ownStore = storeOf(player);
    let captured = 0;
    if (idx !== ownStore && isOwnPit(player, idx) && board[idx] === 1) {
      // Landed a first seed in one of your own empty pits: capture it
      // plus everything sitting in the pit directly opposite.
      const opp = oppositePit(idx);
      if (board[opp] > 0) {
        captured = board[opp] + 1;
        board[opp] = 0;
        board[idx] = 0;
        board[ownStore] += captured;
      }
    }

    const gameOver = settleIfOver(board);
    return {
      state: { board, gameOver },
      extraTurn: !gameOver && idx === ownStore,
      captured,
      capturedPits: captured ? [oppositePit(idx)] : [],
      landedIn: idx
    };
  }

  // null means a draw (equal seed counts in both stores).
  function getWinner(state) {
    if (state.board[STORE_A] > state.board[STORE_B]) return "a";
    if (state.board[STORE_B] > state.board[STORE_A]) return "b";
    return null;
  }

  return {
    SEEDS_PER_PIT,
    STORE_A,
    STORE_B,
    PITS_A,
    PITS_B,
    otherPlayer,
    storeOf,
    pitsOf,
    oppositePit,
    isOwnPit,
    isOware,
    OWARE_QUIET_LIMIT,
    createInitialState,
    cloneState,
    getLegalMoves,
    applyMove,
    getWinner
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MancalaCore;
}
if (typeof window !== "undefined") {
  window.MancalaCore = MancalaCore;
}
