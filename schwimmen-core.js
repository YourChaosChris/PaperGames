// schwimmen-core.js
// Rules engine for Schwimmen (also known as Schnauz, Knack or Thirty-One),
// the traditional card game with a 32-card pack. No DOM here - the page
// is schwimmen-app.js, the computer player schwimmen-ai.js.
//
// Everyone holds three cards; three more lie face up in the middle. On a
// turn a player does exactly one thing: swap one card with the middle,
// swap all three, pass, or knock. When every active player has passed in
// a row, the middle is replaced from the stock. After a knock every other
// player gets exactly one more turn, then all hands are shown. Whoever
// reaches exactly 31 shows at once and everybody else loses a life.
//
// A hand scores the sum of its best suit (Ace 11, face cards and Ten 10,
// the rest their pips), 31 at most; three cards of the same rank count
// 30.5, three Aces 31. After a showdown the lowest score loses a life
// (all tied lowest lose one). With no lives left a player "swims" for one
// last round; losing again means out. The last player left wins.
//
// House rule where the classic rules are silent: when the middle has to
// be replaced but fewer than three cards are left in the stock, the round
// ends with a showdown straight away.
//
// Cards are { rank, suit } with rank 7..13 and 1 for the Ace (the same
// numbering card-faces.js uses to draw them).

const SchwimmenCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [7, 8, 9, 10, 11, 12, 13, 1];
  const START_LIVES = 3;

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function createDeck() {
    const deck = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => deck.push({ rank, suit })));
    return deck;
  }

  function cardValue(card) {
    if (card.rank === 1) return 11;
    if (card.rank >= 10) return 10;
    return card.rank;
  }

  // The score of a three-card hand.
  function handScore(hand) {
    if (hand.length === 3 && hand[0].rank === hand[1].rank && hand[1].rank === hand[2].rank) {
      return hand[0].rank === 1 ? 31 : 30.5;
    }
    let best = 0;
    SUITS.forEach((suit) => {
      const sum = hand.filter((c) => c.suit === suit).reduce((s, c) => s + cardValue(c), 0);
      if (sum > best) best = sum;
    });
    return best;
  }

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function isActive(s, p) {
    return !s.out[p];
  }

  function activePlayers(s) {
    const list = [];
    for (let p = 0; p < s.numPlayers; p++) if (isActive(s, p)) list.push(p);
    return list;
  }

  function nextActive(s, p) {
    for (let k = 1; k <= s.numPlayers; k++) {
      const q = (p + k) % s.numPlayers;
      if (isActive(s, q)) return q;
    }
    return p;
  }

  function createInitialState(numPlayers, rng) {
    const s = {
      numPlayers,
      hands: [],
      table: [],
      stock: [],
      turn: 0,
      dealer: numPlayers - 1,
      lives: new Array(numPlayers).fill(START_LIVES),
      swimming: new Array(numPlayers).fill(false),
      out: new Array(numPlayers).fill(false),
      knockedBy: null,
      turnsAfterKnock: 0,
      passesInRow: 0,
      setAside: 0,
      roundOver: false,
      lastRound: null,
      round: 0,
      gameOver: false,
      winner: null
    };
    dealRound(s, rng);
    return s;
  }

  // Deals a new round into s (mutates). The player after the dealer
  // starts. A dealt 31 ends the round at once.
  function dealRound(s, rng) {
    s.round++;
    s.dealer = nextActive(s, s.dealer);
    const deck = shuffle(createDeck(), rng);
    s.hands = [];
    for (let p = 0; p < s.numPlayers; p++) s.hands.push(isActive(s, p) ? deck.splice(0, 3) : []);
    s.table = deck.splice(0, 3);
    s.stock = deck;
    s.turn = nextActive(s, s.dealer);
    s.knockedBy = null;
    s.turnsAfterKnock = 0;
    s.passesInRow = 0;
    s.setAside = 0;
    s.roundOver = false;
    s.lastRound = null;
    const hit = activePlayers(s).find((p) => handScore(s.hands[p]) === 31);
    if (hit !== undefined) finishRound(s, "thirtyone", hit);
    return s;
  }

  // Ends the round: who loses a life, who swims, who is out. Mutates s.
  function finishRound(s, reason, player) {
    const active = activePlayers(s);
    const scores = s.hands.map((h, p) => (isActive(s, p) ? handScore(h) : null));
    let losers;
    if (reason === "thirtyone") {
      losers = active.filter((p) => p !== player);
    } else {
      const low = Math.min.apply(null, active.map((p) => scores[p]));
      losers = active.filter((p) => scores[p] === low);
    }
    const events = [];
    losers.forEach((p) => {
      if (s.swimming[p]) {
        s.out[p] = true;
        events.push({ player: p, type: "out" });
      } else {
        s.lives[p]--;
        if (s.lives[p] <= 0) {
          s.lives[p] = 0;
          s.swimming[p] = true;
          events.push({ player: p, type: "swims" });
        } else {
          events.push({ player: p, type: "life" });
        }
      }
    });
    s.roundOver = true;
    s.lastRound = { reason, player: player === undefined ? null : player, scores, losers, events };
    const left = activePlayers(s);
    if (left.length <= 1) {
      s.gameOver = true;
      s.winner = left.length === 1 ? left[0] : null;
      if (left.length === 0) {
        // Everyone left went out together: nobody wins.
        s.lastRound.everyoneOut = true;
      }
    }
    return s;
  }

  function startNextRound(state, rng) {
    const s = clone(state);
    if (s.gameOver || !s.roundOver) return s;
    return dealRound(s, rng);
  }

  // Whose knock-following turns are still owed; true when the showdown
  // is due.
  function knockComplete(s) {
    return s.knockedBy !== null && s.turnsAfterKnock >= activePlayers(s).length - 1;
  }

  function afterMove(s, player) {
    if (handScore(s.hands[player]) === 31) {
      finishRound(s, "thirtyone", player);
      return s;
    }
    if (s.knockedBy !== null && s.knockedBy !== player) s.turnsAfterKnock++;
    if (knockComplete(s)) {
      finishRound(s, "knock", s.knockedBy);
      return s;
    }
    s.turn = nextActive(s, player);
    return s;
  }

  function canKnock(s) {
    return !s.roundOver && !s.gameOver && s.knockedBy === null;
  }

  // Applies a move for the player to move. move is one of
  // { type: "swap", hand, table } | { type: "swapAll" } | { type: "pass" }
  // | { type: "knock" }. Returns { ok, state, reason, refreshed }.
  function applyMove(state, move) {
    if (state.gameOver || state.roundOver) return { ok: false, state, reason: "round-over" };
    const s = clone(state);
    const p = s.turn;
    const hand = s.hands[p];
    let refreshed = false;
    if (move.type === "swap") {
      if (!(move.hand >= 0 && move.hand < 3 && move.table >= 0 && move.table < 3)) return { ok: false, state, reason: "bad-index" };
      const tmp = hand[move.hand];
      hand[move.hand] = s.table[move.table];
      s.table[move.table] = tmp;
      s.passesInRow = 0;
    } else if (move.type === "swapAll") {
      const tmp = s.hands[p];
      s.hands[p] = s.table;
      s.table = tmp;
      s.passesInRow = 0;
    } else if (move.type === "knock") {
      if (!canKnock(s)) return { ok: false, state, reason: "already-knocked" };
      s.knockedBy = p;
      s.passesInRow = 0;
      s.turnsAfterKnock = 0;
      s.turn = nextActive(s, p);
      return { ok: true, state: s, refreshed: false };
    } else if (move.type === "pass") {
      s.passesInRow++;
      if (s.passesInRow >= activePlayers(s).length) {
        // Everybody passed: new middle cards, or a showdown if the stock
        // is too thin (see the house rule above).
        if (s.stock.length >= 3) {
          s.setAside += 3; // the old middle cards are put aside
          s.table = s.stock.splice(0, 3);
          s.passesInRow = 0;
          refreshed = true;
        } else {
          finishRound(s, "stock", null);
          return { ok: true, state: s, refreshed: false, stockOut: true };
        }
      }
    } else {
      return { ok: false, state, reason: "bad-move" };
    }
    afterMove(s, p);
    return { ok: true, state: s, refreshed };
  }

  return {
    SUITS,
    RANKS,
    START_LIVES,
    createDeck,
    cardValue,
    handScore,
    activePlayers,
    nextActive,
    createInitialState,
    startNextRound,
    canKnock,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SchwimmenCore;
}
if (typeof window !== "undefined") {
  window.SchwimmenCore = SchwimmenCore;
}
