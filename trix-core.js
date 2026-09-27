// trix-core.js
// Rules engine for Trix, the four-player card game popular in the Levant
// and around the Gulf. No DOM here - the page is trix-app.js, the
// computer player trix-ai.js.
//
// The version played here (trix-rules.html says the same):
//   - Four players, each for themselves, with the 52-card pack; everyone
//     gets 13 cards for every deal.
//   - A game has four kingdoms. Each player owns one kingdom: the holder
//     of the Seven of Hearts in the first deal owns the first, then it
//     passes to the next player. In their kingdom the owner picks the
//     five contracts one after another, in any order, each for one deal.
//   - Four contracts are trick-taking games in which you must follow
//     suit (Ace high, no trumps); the owner leads the first trick and
//     the winner of a trick leads the next:
//       King of Hearts  -75 for taking it; the deal ends when it falls.
//                       Whoever cannot follow suit and holds it must
//                       play it.
//       Queens          -25 for every Queen taken; ends when all four
//                       have been taken.
//       Diamonds        -10 for every Diamond taken; ends when all 13
//                       have been taken.
//       Tricks          -15 for every trick taken; all 13 are played.
//   - Trix: the Jacks start four rows, one per suit; a row grows up from
//     the Jack to the Ace and down to the Two, one card at a time. On
//     your turn you lay one card that fits, or pass only if nothing
//     fits. The owner begins. Finishing first scores +200, second +150,
//     third +100, last +50.
//   - Each kingdom adds up to zero: -75 -100 -130 -195 +500.
//
// Cards are { rank, suit } with rank 2..14 (14 = Ace, drawn as "A" by
// card-faces.js).

const TrixCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const PLAYERS = 4;
  const CONTRACTS = ["king", "queens", "diamonds", "tricks", "trix"];
  const TRIX_POINTS = [200, 150, 100, 50];

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

  function createDeck() {
    const deck = [];
    SUITS.forEach((suit) => { for (let r = 2; r <= 14; r++) deck.push({ rank: r, suit }); });
    return deck;
  }

  function sameCard(a, b) {
    return !!a && !!b && a.rank === b.rank && a.suit === b.suit;
  }

  function isKingOfHearts(c) {
    return c.rank === 13 && c.suit === "H";
  }

  // Penalty points a card carries in a contract (0 if none).
  function cardPenalty(contract, c) {
    if (contract === "king") return isKingOfHearts(c) ? -75 : 0;
    if (contract === "queens") return c.rank === 12 ? -25 : 0;
    if (contract === "diamonds") return c.suit === "D" ? -10 : 0;
    return 0;
  }

  function isPenaltyCard(contract, c) {
    return cardPenalty(contract, c) !== 0;
  }

  /*** The whole game ***/

  // A new game: deals the first hand to find the first kingdom's owner.
  function createGame(rng) {
    const g = {
      kingdom: 0,               // 0..3
      owner: 0,
      firstOwner: 0,
      done: [],                 // contracts finished in this kingdom
      totals: [0, 0, 0, 0],
      history: [],              // [{ kingdom, owner, contract, scores }]
      deal: null,               // the running deal, or null while choosing
      hands: null,              // dealt hands waiting for the owner's choice
      gameOver: false
    };
    g.hands = dealHands(rng);
    const seven = g.hands.findIndex((h) => h.some((c) => c.rank === 7 && c.suit === "H"));
    g.owner = seven;
    g.firstOwner = seven;
    return g;
  }

  function dealHands(rng) {
    const deck = shuffle(createDeck(), rng);
    const hands = [];
    for (let p = 0; p < PLAYERS; p++) hands.push(sortHand(deck.slice(p * 13, (p + 1) * 13)));
    return hands;
  }

  function sortHand(hand) {
    return hand.sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || a.rank - b.rank);
  }

  function remainingContracts(g) {
    return CONTRACTS.filter((c) => g.done.indexOf(c) === -1);
  }

  // The owner picks a contract for the dealt hands.
  function chooseContract(game, contract) {
    if (game.gameOver || game.deal || remainingContracts(game).indexOf(contract) === -1) {
      return { ok: false, game, reason: "not-available" };
    }
    const g = clone(game);
    g.deal = createDeal(contract, g.hands, g.owner);
    g.hands = null;
    return { ok: true, game: g };
  }

  // Records a finished deal and moves on: next contract, next kingdom or
  // the end of the game. Mutates g.
  function closeDeal(g, rng) {
    const d = g.deal;
    for (let p = 0; p < PLAYERS; p++) g.totals[p] += d.scores[p];
    g.history.push({ kingdom: g.kingdom, owner: g.owner, contract: d.contract, scores: d.scores.slice() });
    g.done.push(d.contract);
    g.deal = null;
    if (g.done.length === CONTRACTS.length) {
      g.kingdomOver = true;
      if (g.kingdom === PLAYERS - 1) g.gameOver = true;
    } else {
      g.hands = dealHands(rng);
    }
  }

  // After a finished kingdom: start the next one.
  function nextKingdom(game, rng) {
    if (!game.kingdomOver || game.gameOver) return game;
    const g = clone(game);
    g.kingdom++;
    g.owner = (g.owner + 1) % PLAYERS;
    g.done = [];
    g.kingdomOver = false;
    g.hands = dealHands(rng);
    return g;
  }

  // Ends the game early (after a kingdom, or whenever the players want).
  function endGame(game) {
    const g = clone(game);
    g.gameOver = true;
    g.endedEarly = !(g.kingdom === PLAYERS - 1 && g.kingdomOver);
    return g;
  }

  /*** One deal ***/

  function createDeal(contract, hands, owner) {
    const d = {
      contract,
      owner,
      hands: hands.map((h) => h.slice()),
      turn: owner,
      trick: [],               // [{ player, card }]
      taken: [[], [], [], []], // penalty-relevant: every card each player took
      trickCount: [0, 0, 0, 0],
      lastTrick: null,
      rows: null,              // Trix: { suit: { low, high } } once the Jack is down
      finished: [],            // Trix: players in the order they ran out
      passes: 0,
      over: false,
      scores: [0, 0, 0, 0]
    };
    if (contract === "trix") {
      d.rows = {};
    }
    return d;
  }

  function legalCards(d, p) {
    const hand = d.hands[p];
    if (d.contract === "trix") return hand.filter((c) => fitsRow(d, c));
    if (!d.trick.length) return hand.slice();
    const led = d.trick[0].card.suit;
    const follow = hand.filter((c) => c.suit === led);
    if (follow.length) return follow;
    // King of Hearts: if you can't follow and hold it, it must go.
    if (d.contract === "king") {
      const k = hand.find(isKingOfHearts);
      if (k) return [k];
    }
    return hand.slice();
  }

  function fitsRow(d, c) {
    const row = d.rows[c.suit];
    if (!row) return c.rank === 11;
    return c.rank === row.high + 1 || c.rank === row.low - 1;
  }

  // Why `card` can't be played now, or null.
  function playProblem(d, card) {
    if (d.over) return "over";
    const hand = d.hands[d.turn];
    if (!hand.some((c) => sameCard(c, card))) return "not-in-hand";
    if (d.contract === "trix") {
      if (fitsRow(d, card)) return null;
      return d.rows[card.suit] ? "row" : "jack-first";
    }
    if (d.trick.length) {
      const led = d.trick[0].card.suit;
      if (card.suit !== led && hand.some((c) => c.suit === led)) return "follow";
    }
    if (d.contract === "king" && !isKingOfHearts(card) && d.trick.length) {
      const led = d.trick[0].card.suit;
      if (!hand.some((c) => c.suit === led) && hand.some(isKingOfHearts)) return "king-must";
    }
    return null;
  }

  function winningIndex(trick) {
    const led = trick[0].card.suit;
    let best = 0;
    for (let i = 1; i < trick.length; i++) {
      const c = trick[i].card;
      if (c.suit === led && c.rank > trick[best].card.rank) best = i;
    }
    return best;
  }

  function nextPlayer(p) {
    return (p + 1) % PLAYERS;
  }

  // Plays a card (or, in Trix, { pass: true }) for d.turn.
  // Returns { ok, game, reason, trickDone, dealDone }.
  function play(game, move, rng) {
    const d0 = game.deal;
    if (!d0 || d0.over) return { ok: false, game, reason: "no-deal" };
    if (move.pass) {
      if (d0.contract !== "trix") return { ok: false, game, reason: "no-pass" };
      if (legalCards(d0, d0.turn).length) return { ok: false, game, reason: "must-play" };
    } else {
      const problem = playProblem(d0, move.card);
      if (problem) return { ok: false, game, reason: problem };
    }
    const g = clone(game);
    const d = g.deal;
    const p = d.turn;
    const res = d.contract === "trix" ? playTrix(d, p, move) : playTrick(d, p, move.card);
    if (d.over) {
      closeDeal(g, rng);
      res.dealDone = true;
    }
    res.ok = true;
    res.game = g;
    return res;
  }

  function playTrix(d, p, move) {
    if (move.pass) {
      d.lastMove = { player: p, pass: true };
    } else {
      const card = move.card;
      const hand = d.hands[p];
      hand.splice(hand.findIndex((c) => sameCard(c, card)), 1);
      const row = d.rows[card.suit];
      if (!row) d.rows[card.suit] = { low: 11, high: 11 };
      else if (card.rank === row.high + 1) row.high = card.rank;
      else row.low = card.rank;
      d.lastMove = { player: p, card };
      if (!hand.length) {
        d.finished.push(p);
        d.scores[p] = TRIX_POINTS[d.finished.length - 1];
        d.lastMove.finishedPlace = d.finished.length;
      }
    }
    // The last player holding cards gets the last place without playing on.
    if (d.finished.length === PLAYERS - 1) {
      const last = [0, 1, 2, 3].find((q) => d.finished.indexOf(q) === -1);
      d.finished.push(last);
      d.scores[last] = TRIX_POINTS[PLAYERS - 1];
      d.over = true;
      return {};
    }
    let q = nextPlayer(p);
    while (d.finished.indexOf(q) !== -1) q = nextPlayer(q);
    d.turn = q;
    return {};
  }

  function playTrick(d, p, card) {
    const hand = d.hands[p];
    hand.splice(hand.findIndex((c) => sameCard(c, card)), 1);
    d.trick.push({ player: p, card });
    if (d.trick.length < PLAYERS) {
      d.turn = nextPlayer(p);
      return { trickDone: false };
    }
    const w = d.trick[winningIndex(d.trick)].player;
    const cards = d.trick;
    cards.forEach((e) => d.taken[w].push(e.card));
    d.trickCount[w]++;
    let pts = 0;
    cards.forEach((e) => { pts += cardPenalty(d.contract, e.card); });
    if (d.contract === "tricks") pts = -15;
    d.scores[w] += pts;
    d.lastTrick = { cards, winner: w, points: pts };
    d.trick = [];
    d.turn = w;
    // Has the contract run its course?
    const left = d.hands[0].length;
    if (!left) d.over = true;
    else if (d.contract === "king" && cards.some((e) => isKingOfHearts(e.card))) d.over = true;
    else if (d.contract === "queens" && takenCount(d, (c) => c.rank === 12) === 4) d.over = true;
    else if (d.contract === "diamonds" && takenCount(d, (c) => c.suit === "D") === 13) d.over = true;
    return { trickDone: true };
  }

  function takenCount(d, pred) {
    let n = 0;
    d.taken.forEach((cards) => cards.forEach((c) => { if (pred(c)) n++; }));
    return n;
  }

  return {
    SUITS,
    PLAYERS,
    CONTRACTS,
    TRIX_POINTS,
    createDeck,
    sameCard,
    isKingOfHearts,
    cardPenalty,
    isPenaltyCard,
    createGame,
    remainingContracts,
    chooseContract,
    nextKingdom,
    endGame,
    legalCards,
    fitsRow,
    playProblem,
    winningIndex,
    play
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TrixCore;
}
if (typeof window !== "undefined") {
  window.TrixCore = TrixCore;
}
