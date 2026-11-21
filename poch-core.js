// poch-core.js
// Rules engine for Poch, the old German card game (32 cards, 2 to 4 players
// here). No DOM: the page is poch-app.js, the computer player poch-ai.js.
//
// Every hand has three stages.
//   1. Everyone puts one chip into each of nine pools (Ace, King, Queen,
//      Jack, Ten, Marriage = King+Queen, Sequence = 7-8-9, Poch and the
//      centre pot). All cards are dealt but one, which lies face up; its
//      suit is the pay suit. Whoever holds the Ace, King, Queen, Jack or
//      Ten of the pay suit takes that pool; King and Queen together also
//      take the Marriage pool, 7-8-9 together the Sequence pool. A pool
//      nobody wins stays for the next hand.
//   2. "Pochen": players with a pair, three or four of a kind bet that
//      their best set is the best. Check, call, raise by one up to 4, or
//      fold. The best set takes all bets and the Poch pool. A pair that
//      holds the pay suit beats the same pair without it. If nobody bets
//      the Poch pool stays; a single player with a set takes it at once.
//   3. The winner of the Poch (or the player left of the dealer) leads any
//      card. Whoever holds the next higher card of that suit must play it,
//      and so on up to the Ace or until the next card is missing (played,
//      or the face-up pay card). The player who played last leads again.
//      Whoever first plays the last card takes the centre pot and one chip
//      from the others for every card they still hold.
// A game is 6 hands, or ends earlier when somebody cannot pay the 9 chips
// to start a hand. Most chips wins. Chips are only points.
//
// Cards are { rank, suit } with rank 7..13 and 1 for the Ace (the same
// numbering card-faces.js uses). Hands are kept sorted by suit and rank,
// so a card is named by its index in the hand.

const PochCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [7, 8, 9, 10, 11, 12, 13, 1];
  const POOLS = ["ace", "king", "queen", "jack", "ten", "marriage", "sequence", "poch", "centre"];
  const RANK_POOL = { 1: "ace", 13: "king", 12: "queen", 11: "jack", 10: "ten" };
  const START_CHIPS = 40;
  const ANTE = POOLS.length;
  const MAX_HANDS = 6;
  const MAX_BET = 4;
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 4;
  const SUIT_ORDER = { C: 3, S: 2, H: 1, D: 0 };
  const LOG_LIMIT = 40;

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  function createDeck() {
    const deck = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => deck.push({ rank, suit })));
    return deck;
  }
  // 7..13, Ace 14: the order of the cards from low to high.
  function order(rank) { return rank === 1 ? 14 : rank; }
  // The next higher card of a suit; the Ace has none.
  function nextRank(rank) {
    if (rank === 1) return null;
    return rank === 13 ? 1 : rank + 1;
  }
  function sortHand(hand) {
    hand.sort((a, b) => (SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)) || (order(a.rank) - order(b.rank)));
    return hand;
  }
  function same(a, b) { return a.rank === b.rank && a.suit === b.suit; }
  function holds(hand, rank, suit) { return hand.some((c) => c.rank === rank && c.suit === suit); }
  function left(s, p) { return (p + 1) % s.n; }

  function compareKeys(a, b) {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  }

  // The best set (pair, three or four of a kind) of a hand, or null. Of two
  // sets of the same size and rank the one with the pay suit wins; without
  // it the higher suit in the order clubs, spades, hearts, diamonds.
  function bestCombo(hand, paySuit) {
    let best = null;
    RANKS.forEach((rank) => {
      const cards = hand.filter((c) => c.rank === rank);
      if (cards.length < 2) return;
      const suitScore = Math.max.apply(null, cards.map((c) => (c.suit === paySuit ? 10 : 0) + SUIT_ORDER[c.suit]));
      const key = [cards.length, order(rank), suitScore];
      if (!best || compareKeys(key, best.key) > 0) best = { rank: rank, count: cards.length, key: key };
    });
    return best;
  }

  function addLog(s, ev) {
    s.log.push(ev);
    if (s.log.length > LOG_LIMIT) s.log.splice(0, s.log.length - LOG_LIMIT);
  }

  function emptyPools() {
    const pools = {};
    POOLS.forEach((k) => { pools[k] = 0; });
    return pools;
  }

  function createGame(n, rng) {
    const random = rng || Math.random;
    const players = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, n || 3));
    const s = {
      rules: 1, n: players, maxHands: MAX_HANDS,
      chips: [], pools: emptyPools(), dealer: Math.floor(random() * players), handNo: 0,
      phase: "idle", turn: 0, hands: [], payCard: null, paySuit: null, combos: [], bet: null,
      played: [], revealed: [], log: [], over: null, winners: []
    };
    for (let i = 0; i < players; i++) s.chips.push(START_CHIPS);
    return startHand(s, random);
  }

  // Ante, deal, and the payments of the first stage; then Pochen starts.
  function startHand(prev, rng) {
    const s = clone(prev);
    s.handNo += 1;
    s.log = [];
    s.played = [];
    s.revealed = [];
    s.bet = null;
    for (let p = 0; p < s.n; p++) {
      s.chips[p] -= ANTE;
      POOLS.forEach((k) => { s.pools[k] += 1; });
    }
    const deck = shuffle(createDeck(), rng);
    s.payCard = deck.pop();
    s.paySuit = s.payCard.suit;
    s.hands = [];
    for (let p = 0; p < s.n; p++) s.hands.push([]);
    let p = left(s, s.dealer);
    while (deck.length) { s.hands[p].push(deck.pop()); p = left(s, p); }
    s.hands.forEach(sortHand);
    addLog(s, { t: "hand", n: s.handNo, p: s.dealer });
    // First stage: pay-suit cards take their pools.
    function pay(player, pool) {
      const n = s.pools[pool];
      s.chips[player] += n;
      s.pools[pool] = 0;
      addLog(s, { t: "pool", p: player, pool: pool, n: n });
    }
    Object.keys(RANK_POOL).forEach((r) => {
      const rank = parseInt(r, 10);
      for (let q = 0; q < s.n; q++) if (holds(s.hands[q], rank, s.paySuit)) pay(q, RANK_POOL[rank]);
    });
    for (let q = 0; q < s.n; q++) {
      if (holds(s.hands[q], 13, s.paySuit) && holds(s.hands[q], 12, s.paySuit)) pay(q, "marriage");
      if (holds(s.hands[q], 7, s.paySuit) && holds(s.hands[q], 8, s.paySuit) && holds(s.hands[q], 9, s.paySuit)) pay(q, "sequence");
    }
    s.combos = s.hands.map((h) => {
      const c = bestCombo(h, s.paySuit);
      return c ? { rank: c.rank, count: c.count, key: c.key } : null;
    });
    beginPochen(s);
    return s;
  }

  function beginPochen(s) {
    const first = left(s, s.dealer);
    const eligible = [];
    for (let k = 0; k < s.n; k++) {
      const q = (first + k) % s.n;
      if (s.combos[q]) eligible.push(q);
    }
    if (eligible.length === 0) {
      addLog(s, { t: "pochstays" });
      beginLead(s, first);
      return;
    }
    if (eligible.length === 1) {
      const w = eligible[0];
      const n = s.pools.poch;
      s.chips[w] += n;
      s.pools.poch = 0;
      addLog(s, { t: "pool", p: w, pool: "poch", n: n });
      beginLead(s, w);
      return;
    }
    s.phase = "pochen";
    s.turn = eligible[0];
    s.bet = {
      order: eligible, high: 0, pot: 0,
      put: s.hands.map(() => 0), folded: s.hands.map(() => false), acted: s.hands.map(() => false)
    };
  }

  function beginLead(s, leader) {
    s.phase = "lead";
    s.turn = leader;
    s.bet = null;
  }

  function legalMoves(s) {
    if (!s || s.over) return [];
    if (s.phase === "lead") return s.hands[s.turn].map((c, i) => ({ type: "lead", card: i }));
    if (s.phase !== "pochen") return [];
    const p = s.turn, b = s.bet, moves = [];
    if (b.put[p] === b.high) moves.push({ type: "check" });
    else {
      if (s.chips[p] >= b.high - b.put[p]) moves.push({ type: "call" });
      moves.push({ type: "fold" });
    }
    if (b.high < MAX_BET && s.chips[p] >= b.high + 1 - b.put[p]) moves.push({ type: "raise" });
    return moves;
  }

  function isLegalMove(s, m) {
    if (!m) return false;
    return legalMoves(s).some((x) => x.type === m.type && (m.type !== "lead" || x.card === m.card));
  }

  function finishPochen(t, winner, showdown) {
    const b = t.bet;
    const n = t.pools.poch + b.pot;
    t.chips[winner] += n;
    t.pools.poch = 0;
    addLog(t, { t: "pochwin", p: winner, n: n, count: t.combos[winner].count, showdown: showdown });
    if (showdown) t.revealed = b.order.filter((q) => !b.folded[q]);
    beginLead(t, winner);
  }

  function endHand(t, winner) {
    const centre = t.pools.centre;
    t.chips[winner] += centre;
    t.pools.centre = 0;
    addLog(t, { t: "pool", p: winner, pool: "centre", n: centre });
    let cards = 0;
    for (let q = 0; q < t.n; q++) {
      if (q === winner) continue;
      const pay = Math.min(t.chips[q], t.hands[q].length);
      t.chips[q] -= pay;
      t.chips[winner] += pay;
      cards += pay;
    }
    if (cards > 0) addLog(t, { t: "cards", p: winner, n: cards });
    t.phase = "handend";
    t.turn = winner;
    t.bet = null;
    const broke = [];
    for (let q = 0; q < t.n; q++) if (t.chips[q] < ANTE) broke.push(q);
    if (t.handNo >= t.maxHands || broke.length) {
      t.phase = "over";
      t.over = { reason: broke.length ? "ante" : "hands", who: broke };
      const most = Math.max.apply(null, t.chips);
      t.winners = [];
      t.chips.forEach((c, q) => { if (c === most) t.winners.push(q); });
    }
  }

  // Returns the new state, or null if the move is not allowed.
  function applyMove(s, m) {
    if (!isLegalMove(s, m)) return null;
    const t = clone(s);
    const p = t.turn;
    if (t.phase === "lead") {
      let card = t.hands[p].splice(m.card, 1)[0];
      t.played.push(card);
      addLog(t, { t: "play", p: p, card: card, lead: true });
      let last = p;
      for (;;) {
        if (t.hands[last].length === 0) { endHand(t, last); return t; }
        const nr = nextRank(card.rank);
        if (nr === null) break;
        let holder = -1;
        for (let q = 0; q < t.n; q++) if (holds(t.hands[q], nr, card.suit)) holder = q;
        if (holder < 0) break;
        const idx = t.hands[holder].findIndex((c) => c.rank === nr && c.suit === card.suit);
        card = t.hands[holder].splice(idx, 1)[0];
        t.played.push(card);
        addLog(t, { t: "play", p: holder, card: card, lead: false });
        last = holder;
      }
      addLog(t, { t: "stuck" });
      t.turn = last;
      return t;
    }
    const b = t.bet;
    if (m.type === "check") {
      b.acted[p] = true;
      addLog(t, { t: "check", p: p });
    } else if (m.type === "call") {
      const need = b.high - b.put[p];
      t.chips[p] -= need; b.put[p] += need; b.pot += need; b.acted[p] = true;
      addLog(t, { t: "call", p: p });
    } else if (m.type === "raise") {
      const opening = b.high === 0;
      const need = b.high + 1 - b.put[p];
      t.chips[p] -= need; b.put[p] += need; b.pot += need; b.high += 1;
      b.acted = b.acted.map(() => false);
      b.acted[p] = true;
      addLog(t, { t: opening ? "bet" : "raise", p: p, n: b.high });
    } else {
      b.folded[p] = true; b.acted[p] = true;
      addLog(t, { t: "fold", p: p });
    }
    const remaining = b.order.filter((q) => !b.folded[q]);
    if (remaining.length === 1 && b.high > 0) {
      finishPochen(t, remaining[0], false);
      return t;
    }
    if (remaining.every((q) => b.acted[q] && b.put[q] === b.high)) {
      if (b.high === 0) {
        addLog(t, { t: "pochstays" });
        beginLead(t, left(t, t.dealer));
        return t;
      }
      let winner = remaining[0];
      remaining.forEach((q) => { if (compareKeys(t.combos[q].key, t.combos[winner].key) > 0) winner = q; });
      finishPochen(t, winner, true);
      return t;
    }
    let q = p;
    do { q = b.order[(b.order.indexOf(q) + 1) % b.order.length]; } while (b.folded[q]);
    t.turn = q;
    return t;
  }

  function nextHand(s, rng) {
    if (!s || s.phase !== "handend") return null;
    const t = clone(s);
    t.dealer = left(t, t.dealer);
    return startHand(t, rng);
  }

  function isCurrentState(s) {
    return !!s && s.rules === 1 && typeof s.n === "number" && s.n >= MIN_PLAYERS && s.n <= MAX_PLAYERS &&
      Array.isArray(s.hands) && s.hands.length === s.n && Array.isArray(s.chips) && s.chips.length === s.n &&
      Array.isArray(s.log) && !!s.pools && typeof s.phase === "string" && !!s.payCard;
  }

  // "win", "draw" or "loss" for one player at the end of a game.
  function outcomeFor(s, p) {
    if (!s.winners.length || s.winners.indexOf(p) === -1) return "loss";
    return s.winners.length === 1 ? "win" : "draw";
  }

  return {
    SUITS, RANKS, POOLS, RANK_POOL, START_CHIPS, ANTE, MAX_HANDS, MAX_BET, MIN_PLAYERS, MAX_PLAYERS,
    order, nextRank, holds, same, bestCombo, compareKeys, createDeck, shuffle, clone,
    createGame, startHand, nextHand, legalMoves, isLegalMove, applyMove, isCurrentState, outcomeFor
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = PochCore;
