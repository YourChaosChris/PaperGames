// oldmaid-core.js
// "Old Maid" (Schwarzer Peter) with animal cards. Dependency-free, no DOM.
//
// The pack holds pairs of animals (two equal cards each, animal index
// 0..17 as in pairs-animals.js) and exactly one Black Peter card (-1).
// Everyone lays down their pairs after the deal. Then, in turn, each
// player draws one hidden card from the next player to the left who still
// has cards; a card that makes a pair is laid down at once. A player
// without cards is out and safe. When only one player has cards left,
// that player holds the Black Peter alone and loses.

const OldMaidCore = (function () {
  const PETER = -1;
  // Pairs in the pack per number of players: 27, 31 and 37 cards.
  const PAIRS = { 2: 13, 3: 15, 4: 18 };

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function buildPack(numPlayers) {
    const pack = [];
    for (let a = 0; a < PAIRS[numPlayers]; a++) pack.push(a, a);
    pack.push(PETER);
    return pack;
  }

  // Lays down every pair in a hand; returns how many pairs went.
  function removePairs(hand) {
    let pairs = 0;
    for (let i = 0; i < hand.length; i++) {
      if (hand[i] === PETER) continue;
      const j = hand.indexOf(hand[i], i + 1);
      if (j !== -1) {
        hand.splice(j, 1);
        hand.splice(i, 1);
        pairs++;
        i--;
      }
    }
    return pairs;
  }

  function activePlayers(s) {
    const out = [];
    for (let p = 0; p < s.numPlayers; p++) if (s.hands[p].length) out.push(p);
    return out;
  }

  // The next player after p (to the left) who still has cards, or -1.
  function nextWithCards(s, p) {
    for (let k = 1; k < s.numPlayers; k++) {
      const q = (p + k) % s.numPlayers;
      if (s.hands[q].length) return q;
    }
    return -1;
  }

  // The player whose cards the player on turn draws from.
  function giver(s) {
    return nextWithCards(s, s.turn);
  }

  function checkEnd(s) {
    const active = activePlayers(s);
    if (active.length <= 1) {
      s.gameOver = true;
      s.loser = active.length ? active[0] : -1;
    }
  }

  // rng: () => [0, 1). Player 0 is dealt first and draws first.
  function createInitialState(numPlayers, rng) {
    const rnd = rng || Math.random;
    const n = PAIRS[numPlayers] ? numPlayers : 2;
    const pack = shuffle(buildPack(n), rnd);
    const hands = [];
    for (let p = 0; p < n; p++) hands.push([]);
    pack.forEach((card, i) => hands[i % n].push(card));
    const pairs = hands.map((h) => removePairs(h));
    const s = { numPlayers: n, hands, pairs, turn: 0, gameOver: false, loser: -1, moves: 0 };
    hands.forEach((h) => shuffle(h, rnd));
    if (!s.hands[0].length) s.turn = nextWithCards(s, 0);
    checkEnd(s);
    return s;
  }

  function cloneState(s) {
    return { numPlayers: s.numPlayers, hands: s.hands.map((h) => h.slice()), pairs: s.pairs.slice(), turn: s.turn, gameOver: s.gameOver, loser: s.loser, moves: s.moves };
  }

  // The player on turn draws card `index` from the giver.
  // Returns { ok, state, taker, from, card, pair, takerOut, giverOut }.
  // Afterwards every hand except `keepOrder` (the human's, shown face up)
  // is shuffled, so the order of the hidden cards tells nothing.
  function draw(s0, index, rng, keepOrder) {
    if (s0.gameOver) return { ok: false };
    const s = cloneState(s0);
    const taker = s.turn, from = giver(s);
    if (from < 0 || index < 0 || index >= s.hands[from].length) return { ok: false };
    const card = s.hands[from].splice(index, 1)[0];
    const hand = s.hands[taker];
    let pair = false;
    const j = card === PETER ? -1 : hand.indexOf(card);
    if (j !== -1) {
      hand.splice(j, 1);
      s.pairs[taker]++;
      pair = true;
    } else {
      hand.push(card);
    }
    s.moves++;
    const rnd = rng || Math.random;
    for (let p = 0; p < s.numPlayers; p++) if (p !== keepOrder) shuffle(s.hands[p], rnd);
    const takerOut = !s.hands[taker].length, giverOut = !s.hands[from].length;
    checkEnd(s);
    if (!s.gameOver) s.turn = nextWithCards(s, taker);
    return { ok: true, state: s, taker, from, card, pair, takerOut, giverOut };
  }

  function cardCount(s) {
    return s.hands.reduce((n, h) => n + h.length, 0) + 2 * s.pairs.reduce((a, b) => a + b, 0);
  }

  return { PETER, PAIRS, buildPack, removePairs, activePlayers, nextWithCards, giver, createInitialState, draw, cardCount };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = OldMaidCore;
}
if (typeof window !== "undefined") {
  window.OldMaidCore = OldMaidCore;
}
