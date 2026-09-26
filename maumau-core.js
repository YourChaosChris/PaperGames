// maumau-core.js
// Dependency-free rules engine for Mau Mau, the traditional shedding card
// game played with an ordinary 32-card pack. No DOM code lives here -
// pure state plus legal-move generation, shared by maumau-app.js (human
// interaction) and maumau-ai.js (computer players).
//
// Cards follow klondike-core.js's model: { rank, suit }, rank 1 = Ace,
// 7-10 as printed, 11 Jack, 12 Queen, 13 King; suit "S", "H", "D", "C".
//
// Rules implemented:
//   - 32 cards (Seven to Ace in four suits), 2-4 players, 5 cards each.
//     One card is turned face up to start the discard pile (it has no
//     special effect); the rest is the stock.
//   - Play a card matching the top card's suit or rank. A Jack fits on
//     anything.
//   - Seven: the next player draws two cards - unless they play a Seven
//     themselves, which passes the penalty on, two more per Seven. Taking
//     the penalty ends that player's turn.
//   - Eight: the next player misses their turn.
//   - Jack: the player names a suit, which the next card must follow
//     (another Jack also fits).
//   - Ace: the same player goes again straight away.
//   - Whoever can't play draws one card; if it fits they may play it at
//     once, otherwise their turn ends.
//   - When the stock runs out, the discard pile except its top card is
//     shuffled to become the new stock.
//   - The first player to get rid of their last card wins. The game calls
//     "Mau" for a player down to one card by itself - there is no penalty
//     for forgetting, since there's nothing to forget.

const MauMauCore = (function () {
  const SUITS = ["S", "H", "D", "C"];
  const RANKS = [7, 8, 9, 10, 11, 12, 13, 1];
  const SEVEN = 7;
  const EIGHT = 8;
  const JACK = 11;
  const ACE = 1;
  const HAND_SIZE = 5;
  const DECK_SIZE = 32;
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 4;

  function createDeck() {
    const deck = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => deck.push({ rank, suit })));
    return deck;
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

  function createInitialState(numPlayers, rng) {
    const n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, numPlayers || 2));
    const deck = shuffle(createDeck(), rng);
    const hands = [];
    for (let p = 0; p < n; p++) hands.push(deck.splice(0, HAND_SIZE));
    const discard = [deck.pop()];
    return {
      numPlayers: n,
      hands,
      stock: deck,
      discard,
      turn: 0,
      wishSuit: null,     // suit named with the last Jack, while it applies
      pendingDraw: 0,     // cards owed from stacked Sevens
      drawnIndex: null,   // hand index of a card just drawn that may be played
      // Per player, suits they were seen unable to follow (they had to
      // draw while that suit was asked for). Public table information.
      missingSuits: hands.map(() => []),
      gameOver: false,
      winner: null
    };
  }

  function cloneCard(c) {
    return { rank: c.rank, suit: c.suit };
  }

  function cloneState(state) {
    return {
      numPlayers: state.numPlayers,
      hands: state.hands.map((h) => h.map(cloneCard)),
      stock: state.stock.map(cloneCard),
      discard: state.discard.map(cloneCard),
      turn: state.turn,
      wishSuit: state.wishSuit,
      pendingDraw: state.pendingDraw,
      drawnIndex: state.drawnIndex,
      missingSuits: state.missingSuits.map((m) => m.slice()),
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  function topCard(state) {
    return state.discard[state.discard.length - 1];
  }

  // The suit the next card has to follow (the wished suit while a Jack's
  // wish applies, otherwise the top card's suit).
  function requiredSuit(state) {
    return state.wishSuit || topCard(state).suit;
  }

  function fits(state, card) {
    if (state.pendingDraw > 0) return card.rank === SEVEN;
    if (card.rank === JACK) return true;
    if (state.wishSuit) return card.suit === state.wishSuit;
    const top = topCard(state);
    return card.suit === top.suit || card.rank === top.rank;
  }

  // Hand indices the player to move may play right now.
  function legalMoves(state) {
    if (state.gameOver) return [];
    const hand = state.hands[state.turn];
    if (state.drawnIndex !== null) {
      return fits(state, hand[state.drawnIndex]) ? [state.drawnIndex] : [];
    }
    const out = [];
    hand.forEach((card, i) => { if (fits(state, card)) out.push(i); });
    return out;
  }

  function nextIndex(state, from, steps) {
    return (from + steps) % state.numPlayers;
  }

  // Refills an empty stock from the discard pile (all but the top card).
  function replenish(state) {
    if (state.stock.length || state.discard.length < 2) return false;
    const top = state.discard.pop();
    state.stock = shuffle(state.discard);
    state.discard = [top];
    return true;
  }

  function takeCards(state, player, count) {
    let taken = 0;
    let reshuffled = false;
    for (let i = 0; i < count; i++) {
      if (!state.stock.length && replenish(state)) reshuffled = true;
      if (!state.stock.length) break;
      state.hands[player].push(state.stock.pop());
      taken++;
    }
    return { taken, reshuffled };
  }

  // Plays hand[index]. `wish` is the suit named when the card is a Jack
  // (ignored otherwise; defaults to the suit the player holds most of).
  // Returns { state, card, effect } where effect is one of null, "seven",
  // "eight", "jack", "ace", "win".
  function applyMove(state, index, wish) {
    const next = cloneState(state);
    const player = next.turn;
    const card = next.hands[player].splice(index, 1)[0];
    next.discard.push(card);
    next.drawnIndex = null;
    next.wishSuit = null;
    next.missingSuits[player] = next.missingSuits[player].filter((s) => s !== card.suit);
    let effect = null;

    if (!next.hands[player].length) {
      next.gameOver = true;
      next.winner = player;
      return { state: next, card, effect: "win" };
    }

    if (card.rank === SEVEN) {
      next.pendingDraw += 2;
      next.turn = nextIndex(next, player, 1);
      effect = "seven";
    } else if (card.rank === EIGHT) {
      next.turn = nextIndex(next, player, 2);
      effect = "eight";
    } else if (card.rank === JACK) {
      next.wishSuit = SUITS.indexOf(wish) !== -1 ? wish : bestSuit(next.hands[player]);
      next.turn = nextIndex(next, player, 1);
      effect = "jack";
    } else if (card.rank === ACE) {
      effect = "ace"; // same player again
    } else {
      next.turn = nextIndex(next, player, 1);
    }
    return { state: next, card, effect };
  }

  // The suit a hand holds most of (Jacks don't count - they fit anyway).
  function bestSuit(hand) {
    const counts = { S: 0, H: 0, D: 0, C: 0 };
    hand.forEach((c) => { if (c.rank !== JACK) counts[c.suit]++; });
    let best = SUITS[0];
    SUITS.forEach((s) => { if (counts[s] > counts[best]) best = s; });
    return best;
  }

  // The player to move draws: the whole Seven penalty if one is owed
  // (which ends their turn), otherwise one card, which they may play at
  // once if it fits. Returns { state, count, playable, penalty, reshuffled }.
  function draw(state) {
    const next = cloneState(state);
    const player = next.turn;
    if (next.pendingDraw > 0) {
      const owed = next.pendingDraw;
      const r = takeCards(next, player, owed);
      next.pendingDraw = 0;
      next.turn = nextIndex(next, player, 1);
      return { state: next, count: r.taken, playable: false, penalty: true, reshuffled: r.reshuffled };
    }
    const asked = requiredSuit(next);
    if (next.missingSuits[player].indexOf(asked) === -1) next.missingSuits[player].push(asked);
    const r = takeCards(next, player, 1);
    if (!r.taken) {
      // Nothing left to draw anywhere: the turn simply passes.
      next.turn = nextIndex(next, player, 1);
      return { state: next, count: 0, playable: false, penalty: false, reshuffled: r.reshuffled };
    }
    const idx = next.hands[player].length - 1;
    if (fits(next, next.hands[player][idx])) {
      next.drawnIndex = idx;
      return { state: next, count: 1, playable: true, penalty: false, reshuffled: r.reshuffled };
    }
    next.turn = nextIndex(next, player, 1);
    return { state: next, count: 1, playable: false, penalty: false, reshuffled: r.reshuffled };
  }

  // Keeps a just-drawn playable card instead of playing it; ends the turn.
  function keepDrawn(state) {
    const next = cloneState(state);
    next.drawnIndex = null;
    next.turn = nextIndex(next, next.turn, 1);
    return next;
  }

  // What the player to move has to do: "play" (some card fits), "draw",
  // or "keep-or-play" right after drawing a card that fits.
  function requiredAction(state) {
    if (state.gameOver) return null;
    if (state.drawnIndex !== null) return "keep-or-play";
    return legalMoves(state).length ? "play" : "draw";
  }

  function cardCount(state) {
    return state.stock.length + state.discard.length + state.hands.reduce((s, h) => s + h.length, 0);
  }

  return {
    SUITS,
    RANKS,
    SEVEN,
    EIGHT,
    JACK,
    ACE,
    HAND_SIZE,
    DECK_SIZE,
    MIN_PLAYERS,
    MAX_PLAYERS,
    createDeck,
    shuffle,
    createInitialState,
    cloneState,
    topCard,
    requiredSuit,
    fits,
    legalMoves,
    applyMove,
    bestSuit,
    draw,
    keepDrawn,
    requiredAction,
    cardCount
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MauMauCore;
}
