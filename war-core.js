// war-core.js
// "War" (Krieg), the card game of pure chance. Dependency-free, no DOM.
//
// 32 cards (7 to Ace in four suits, Ace high), 16 to each player as a
// face-down pile. Each round both turn up their top card; the higher card
// wins both, and they go under the winner's pile. On a tie there is a
// war: each puts one card face down and one face up, and the higher
// face-up card takes everything; a tie repeats the war. A player with
// only one card left in a war turns it up without a face-down card; a
// player with no card left to turn up loses. Won cards go under the pile
// in random order, so the game cannot run in a circle forever.
//
// Modes: "short" ends after 30 rounds (more cards wins, equal is a
// draw); "full" plays until one player has all cards, with a stop after
// 2000 rounds as a draw.
//
// Cards: { suit: "S" | "H" | "D" | "C", rank: 7..14 } (14 = Ace).

const WarCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [7, 8, 9, 10, 11, 12, 13, 14];
  const SHORT_ROUNDS = 30;
  const MAX_ROUNDS = 2000;

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function buildPack() {
    const pack = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => pack.push({ suit, rank })));
    return pack;
  }

  // rng: () => [0, 1). piles[p][0] is the top card.
  function createInitialState(mode, rng) {
    const rnd = rng || Math.random;
    const pack = shuffle(buildPack(), rnd);
    return {
      mode: mode === "full" ? "full" : "short",
      piles: [pack.slice(0, 16), pack.slice(16)],
      round: 0,
      gameOver: false,
      winner: null,      // 0, 1, or -1 for a draw
      endReason: null,   // "cards" | "rounds" | "limit" | "empty"
      last: null
    };
  }

  function cloneState(s) {
    return { mode: s.mode, piles: s.piles.map((p) => p.slice()), round: s.round, gameOver: s.gameOver, winner: s.winner, endReason: s.endReason, last: s.last };
  }

  function cardCount(s) {
    return s.piles[0].length + s.piles[1].length;
  }

  function finish(s) {
    const a = s.piles[0].length, b = s.piles[1].length;
    if (!a || !b) {
      s.gameOver = true;
      s.winner = a ? 0 : (b ? 1 : -1);
      s.endReason = "cards";
      return;
    }
    if (s.mode === "short" && s.round >= SHORT_ROUNDS) {
      s.gameOver = true;
      s.winner = a > b ? 0 : (b > a ? 1 : -1);
      s.endReason = "rounds";
      return;
    }
    if (s.round >= MAX_ROUNDS) {
      s.gameOver = true;
      s.winner = -1;
      s.endReason = "limit";
    }
  }

  // One round. Returns the new state; state.last describes it:
  //   { up: [[cards turned up by player 0, in order], [... player 1]],
  //     down: [count face down by 0, by 1],
  //     hidden: per player, per war: was a card put face down first?,
  //     wars, winner, won }
  function playRound(s0, rng) {
    if (s0.gameOver) return s0;
    const rnd = rng || Math.random;
    const s = cloneState(s0);
    const pot = [];
    const up = [[], []], down = [0, 0], hidden = [[], []];
    let wars = 0, winner = null;
    for (;;) {
      // Turn up one card each (in a war, one face down first if possible).
      if (up[0].length) {
        for (let p = 0; p < 2; p++) {
          const has = s.piles[p].length > 1;
          if (has) { pot.push(s.piles[p].shift()); down[p]++; }
          hidden[p].push(has);
        }
      }
      const a = s.piles[0].shift(), b = s.piles[1].shift();
      if (!a || !b) {
        // Someone had no card left to turn up: the other takes the pot.
        if (a) { pot.push(a); up[0].push(a); }
        if (b) { pot.push(b); up[1].push(b); }
        winner = a ? 0 : (b ? 1 : -1);
        break;
      }
      pot.push(a, b);
      up[0].push(a); up[1].push(b);
      if (a.rank !== b.rank) { winner = a.rank > b.rank ? 0 : 1; break; }
      wars++;
    }
    if (winner === 0 || winner === 1) s.piles[winner].push(...shuffle(pot, rnd));
    s.round++;
    s.last = { up, down, hidden, wars, winner, won: pot.length };
    if (winner === -1) {
      s.gameOver = true;
      s.winner = -1;
      s.endReason = "empty";
    } else {
      finish(s);
    }
    return s;
  }

  return { SUITS, RANKS, SHORT_ROUNDS, MAX_ROUNDS, buildPack, createInitialState, playRound, cardCount };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = WarCore;
}
if (typeof window !== "undefined") {
  window.WarCore = WarCore;
}
