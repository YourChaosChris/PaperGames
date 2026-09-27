// durak-core.js
// Rules engine for Durak in its common "podkidnoi" form (throw-in
// Durak), the Russian folk card game. No DOM here - the page is
// durak-app.js, the computer player durak-ai.js.
//
// 36 cards (Six to Ace), 2-4 players, six cards each. The next card is
// laid face up under the stock; its suit is trump for the whole game and
// it is the last card to be drawn. The player with the lowest trump
// starts. A round: the attacker leads a card; the defender (the next
// player) must beat it with a higher card of the same suit, or with a
// trump if the attack isn't a trump. Once the first card is down the
// attacker and then the other players may throw in more cards, but only
// ranks already on the table; the defender must beat each. At most six
// attack cards per round, and never more than the defender held when the
// round began. If everything is beaten, the cards leave the game and the
// defender attacks next. If the defender gives up, they take every card
// on the table and the attack passes to the player after them. Then
// everybody refills to six from the stock - attacker first, round the
// table, defender last. With the stock empty, a player without cards is
// out; the last one holding cards is the "durak" (the fool). If the last
// players run out together, the game is a draw.
//
// Optional rule "transfer" (perevodnoi): before beating anything, the
// defender may add a card of the attack cards' rank and so pass the whole
// attack on to the next player.
//
// Decisions are serialised so the page, the computer and a hotseat game
// always know whose move it is (state.actor):
//   - phase "lead": the attacker must lead a card;
//   - phase "defend": the defender beats the oldest unbeaten card, takes,
//     or (transfer rule) transfers;
//   - phase "throw": every card is beaten (or the defender is taking);
//     the players who may throw in are asked one after another, starting
//     with the attacker; a card resets the round of asking, a pass moves
//     on. When everyone has passed, the round ends.
//
// Cards are { rank, suit } with rank 6..14 (14 = Ace).

const DurakCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [6, 7, 8, 9, 10, 11, 12, 13, 14];
  const HAND_SIZE = 6;
  const MAX_ATTACKS = 6;

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function sameCard(a, b) {
    return !!a && !!b && a.rank === b.rank && a.suit === b.suit;
  }

  function beats(defense, attack, trumpSuit) {
    if (defense.suit === attack.suit) return defense.rank > attack.rank;
    return defense.suit === trumpSuit && attack.suit !== trumpSuit;
  }

  function isOut(s, p) {
    return s.outPlayers.indexOf(p) !== -1;
  }

  function nextPlayer(s, p) {
    for (let k = 1; k <= s.numPlayers; k++) {
      const q = (p + k) % s.numPlayers;
      if (!isOut(s, q)) return q;
    }
    return p;
  }

  function activePlayers(s) {
    const list = [];
    for (let p = 0; p < s.numPlayers; p++) if (!isOut(s, p)) list.push(p);
    return list;
  }

  function createInitialState(numPlayers, options, rng) {
    const deck = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => deck.push({ rank, suit })));
    shuffle(deck, rng);
    const hands = [];
    for (let p = 0; p < numPlayers; p++) hands.push(deck.splice(0, HAND_SIZE));
    const trumpCard = deck.shift();
    deck.push(trumpCard); // the face-up trump is the last card of the stock
    const s = {
      numPlayers,
      transfer: !!(options && options.transfer),
      hands,
      stock: deck,
      trumpSuit: trumpCard.suit,
      trumpCard,
      discardCount: 0,
      discardSeen: [],
      attacker: 0,
      defender: 1 % numPlayers,
      table: [],
      maxAttacks: 0,
      phase: "lead",
      actor: 0,
      throwQueue: [],
      taking: false,
      outPlayers: [],
      gameOver: false,
      loser: null,
      draw: false,
      lastEvent: null
    };
    // The lowest trump starts; without any trump, Player 1 starts.
    let starter = 0, low = Infinity;
    hands.forEach((h, p) => h.forEach((c) => {
      if (c.suit === s.trumpSuit && c.rank < low) { low = c.rank; starter = p; }
    }));
    startRound(s, starter);
    s.firstAttacker = starter;
    s.firstTrump = low === Infinity ? null : { rank: low, suit: s.trumpSuit };
    return s;
  }

  function startRound(s, attacker) {
    s.attacker = attacker;
    s.defender = nextPlayer(s, attacker);
    s.table = [];
    s.taking = false;
    s.phase = "lead";
    s.actor = attacker;
    s.throwQueue = [];
    s.maxAttacks = Math.min(MAX_ATTACKS, s.hands[s.defender].length);
  }

  function tableRanks(s) {
    const ranks = {};
    s.table.forEach((pair) => {
      ranks[pair.attack.rank] = true;
      if (pair.defense) ranks[pair.defense.rank] = true;
    });
    return ranks;
  }

  function unbeatenIndex(s) {
    for (let i = 0; i < s.table.length; i++) if (!s.table[i].defense) return i;
    return -1;
  }

  function unbeatenCount(s) {
    return s.table.filter((pair) => !pair.defense).length;
  }

  // Players who may throw in this round, in asking order: the attacker
  // first, then round the table, never the defender.
  function throwers(s) {
    const list = [];
    let p = s.attacker;
    for (let k = 0; k < s.numPlayers; k++) {
      if (p !== s.defender && !isOut(s, p) && list.indexOf(p) === -1) list.push(p);
      p = (p + 1) % s.numPlayers;
    }
    return list;
  }

  // Why player p may not throw `card` in now, or null if they may.
  function throwProblem(s, p, card) {
    if (s.table.length >= s.maxAttacks) return "limit";
    // The defender must be able to answer every card on the table.
    if (!s.taking && unbeatenCount(s) + 1 > s.hands[s.defender].length) return "limit";
    if (s.taking && s.table.length + 1 > s.maxAttacks) return "limit";
    if (!tableRanks(s)[card.rank]) return "rank";
    return null;
  }

  function canThrowAny(s, p) {
    return s.hands[p].some((c) => !throwProblem(s, p, c));
  }

  // Why the defender may not beat the oldest unbeaten card with `card`.
  function defendProblem(s, card) {
    const i = unbeatenIndex(s);
    if (i === -1) return "nothing";
    return beats(card, s.table[i].attack, s.trumpSuit) ? null : "weak";
  }

  function canTransfer(s, card) {
    if (!s.transfer || s.taking) return false;
    if (!s.table.length || s.table.some((pair) => pair.defense)) return false;
    if (s.table.some((pair) => pair.attack.rank !== card.rank)) return false;
    const next = nextPlayer(s, s.defender);
    return s.hands[next].length >= s.table.length + 1;
  }

  function beginThrowPhase(s) {
    s.phase = "throw";
    s.throwQueue = throwers(s);
    advanceThrow(s);
  }

  // Moves to the next player who is asked to throw in; ends the round
  // when nobody is left to ask.
  function advanceThrow(s) {
    while (s.throwQueue.length) {
      const p = s.throwQueue[0];
      if (canThrowAny(s, p)) {
        s.actor = p;
        return;
      }
      s.throwQueue.shift(); // can't add anything: counts as a pass
    }
    endRound(s);
  }

  function drawUp(s, order) {
    order.forEach((p) => {
      while (s.hands[p].length < HAND_SIZE && s.stock.length) s.hands[p].push(s.stock.shift());
    });
  }

  function endRound(s) {
    const defended = !s.taking;
    const cards = [];
    s.table.forEach((pair) => { cards.push(pair.attack); if (pair.defense) cards.push(pair.defense); });
    if (defended) {
      s.discardCount += cards.length;
      s.discardSeen = s.discardSeen.concat(cards);
    } else {
      s.hands[s.defender] = s.hands[s.defender].concat(cards);
    }
    // Refill: attacker first, then round the table, defender last.
    const order = [];
    let p = s.attacker;
    for (let k = 0; k < s.numPlayers; k++) {
      if (p !== s.defender && !isOut(s, p)) order.push(p);
      p = (p + 1) % s.numPlayers;
    }
    order.push(s.defender);
    drawUp(s, order);
    s.lastEvent = { type: defended ? "defended" : "took", defender: s.defender, count: cards.length, drawOrder: order };
    const oldDefender = s.defender;
    // Out: nothing in hand and nothing left to draw.
    if (!s.stock.length) {
      for (let q = 0; q < s.numPlayers; q++) {
        if (!isOut(s, q) && !s.hands[q].length) s.outPlayers.push(q);
      }
    }
    const left = activePlayers(s);
    if (left.length <= 1) {
      s.gameOver = true;
      s.table = [];
      s.phase = "over";
      s.actor = null;
      if (left.length === 1) s.loser = left[0];
      else s.draw = true;
      return;
    }
    // Who attacks next: the defender if they held (or the next player if
    // they are out); after a take, the player after the defender.
    let next;
    if (defended) next = isOut(s, oldDefender) ? nextPlayer(s, oldDefender) : oldDefender;
    else next = nextPlayer(s, oldDefender);
    startRound(s, next);
  }

  function removeFromHand(hand, card) {
    const i = hand.findIndex((c) => sameCard(c, card));
    if (i !== -1) hand.splice(i, 1);
    return i !== -1;
  }

  // Applies a move for s.actor. Moves:
  //   { type: "lead", card } | { type: "throw", card } | { type: "pass" }
  //   { type: "defend", card } | { type: "take" } | { type: "transfer", card }
  // Returns { ok, state, reason }.
  function applyMove(state, move) {
    if (state.gameOver) return { ok: false, state, reason: "over" };
    const s = clone(state);
    const p = s.actor;
    const hand = s.hands[p];
    const has = move.card ? hand.some((c) => sameCard(c, move.card)) : true;
    if (!has) return { ok: false, state, reason: "not-in-hand" };

    if (s.phase === "lead") {
      if (move.type !== "lead") return { ok: false, state, reason: "must-lead" };
      removeFromHand(hand, move.card);
      s.table.push({ attack: move.card, defense: null, by: p });
      s.phase = "defend";
      s.actor = s.defender;
      s.lastEvent = { type: "lead", player: p, card: move.card };
      return { ok: true, state: s };
    }

    if (s.phase === "defend") {
      if (move.type === "take") {
        s.taking = true;
        s.lastEvent = { type: "take", player: p };
        beginThrowPhase(s);
        return { ok: true, state: s };
      }
      if (move.type === "transfer") {
        if (!canTransfer(s, move.card)) return { ok: false, state, reason: "no-transfer" };
        removeFromHand(hand, move.card);
        s.table.push({ attack: move.card, defense: null, by: p });
        const newDefender = nextPlayer(s, s.defender);
        s.attacker = s.defender;
        s.defender = newDefender;
        s.maxAttacks = Math.min(MAX_ATTACKS, s.hands[newDefender].length);
        s.actor = newDefender;
        s.lastEvent = { type: "transfer", player: p, card: move.card, to: newDefender };
        return { ok: true, state: s };
      }
      if (move.type !== "defend") return { ok: false, state, reason: "must-defend" };
      const problem = defendProblem(s, move.card);
      if (problem) return { ok: false, state, reason: problem };
      removeFromHand(hand, move.card);
      const i = unbeatenIndex(s);
      s.table[i].defense = move.card;
      s.lastEvent = { type: "defend", player: p, card: move.card, against: s.table[i].attack };
      if (unbeatenIndex(s) === -1) beginThrowPhase(s);
      return { ok: true, state: s };
    }

    if (s.phase === "throw") {
      if (move.type === "pass") {
        s.throwQueue.shift();
        s.lastEvent = { type: "pass", player: p };
        advanceThrow(s);
        return { ok: true, state: s };
      }
      if (move.type !== "throw") return { ok: false, state, reason: "must-throw-or-pass" };
      const problem = throwProblem(s, p, move.card);
      if (problem) return { ok: false, state, reason: problem };
      removeFromHand(hand, move.card);
      s.table.push({ attack: move.card, defense: null, by: p });
      s.lastEvent = { type: "throw", player: p, card: move.card };
      if (s.taking) {
        // The taker keeps collecting; ask everyone again.
        s.throwQueue = throwers(s);
        advanceThrow(s);
      } else {
        s.phase = "defend";
        s.actor = s.defender;
      }
      return { ok: true, state: s };
    }
    return { ok: false, state, reason: "bad-phase" };
  }

  // Every move the actor could make right now (for the computer and for
  // the "is anything possible" checks).
  function legalMoves(s) {
    if (s.gameOver) return [];
    const p = s.actor;
    const hand = s.hands[p];
    const moves = [];
    if (s.phase === "lead") {
      hand.forEach((card) => moves.push({ type: "lead", card }));
    } else if (s.phase === "defend") {
      hand.forEach((card) => { if (!defendProblem(s, card)) moves.push({ type: "defend", card }); });
      hand.forEach((card) => { if (canTransfer(s, card)) moves.push({ type: "transfer", card }); });
      moves.push({ type: "take" });
    } else if (s.phase === "throw") {
      hand.forEach((card) => { if (!throwProblem(s, p, card)) moves.push({ type: "throw", card }); });
      moves.push({ type: "pass" });
    }
    return moves;
  }

  return {
    SUITS,
    RANKS,
    HAND_SIZE,
    MAX_ATTACKS,
    beats,
    sameCard,
    createInitialState,
    applyMove,
    legalMoves,
    throwProblem,
    defendProblem,
    canTransfer,
    unbeatenIndex,
    activePlayers,
    nextPlayer
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DurakCore;
}
if (typeof window !== "undefined") {
  window.DurakCore = DurakCore;
}
