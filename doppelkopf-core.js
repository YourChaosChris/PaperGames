// doppelkopf-core.js
// Rules engine for Doppelkopf, the German four-player trick-taking game.
// No DOM here - the page is doppelkopf-app.js, the computer player
// doppelkopf-ai.js.
//
// Only the normal game is played (doppelkopf-rules.html says so too):
// no solos, no Re/Kontra announcements, no poverty rule, no tournament
// rules. What is covered:
//   - 48 cards: Nine, Ten, Jack, Queen, King, Ace in four suits, each
//     card twice. Four players get twelve cards each.
//   - Trumps from high to low: Heart Ten, the Queens (Clubs, Spades,
//     Hearts, Diamonds), the Jacks (same suit order), then Diamond Ace,
//     Ten, King, Nine. Of two equal cards the one played first wins -
//     except the Heart Ten, where the second one beats the first.
//   - Plain suits: Clubs and Spades (Ace, Ten, King, Nine) and Hearts
//     (Ace, King, Nine - the Heart Ten is a trump).
//   - You must follow the suit led; trump counts as one suit of its own.
//   - The two holders of the Queen of Clubs play together ("Re") against
//     the other two ("Kontra"). Nobody knows the partnership until a
//     Queen of Clubs is played.
//   - Marriage: one player holding both Queens of Clubs. The first trick
//     within the first three that is led with a plain suit and won by
//     another player makes that player the partner. If there is none,
//     the marriage player plays alone against the other three.
//   - Card points: Ace 11, Ten 10, King 4, Queen 3, Jack 2, Nine 0 -
//     240 in total. Re needs 121 to win, Kontra wins with 120.
//   - Game value: 1 for winning, 1 more when Kontra wins ("against the
//     Queens of Clubs"), 1 each when the losers have under 90, under 60,
//     under 30 points, and 1 when they took no trick at all.
//   - Extra points (only when two play against two): a trick worth 40 or
//     more ("Doppelkopf"), catching an opponent's Diamond Ace ("fox"),
//     and winning the last trick with the Jack of Clubs ("Charlie").
//
// Cards are { rank, suit, copy } with rank 9..14 (14 = Ace, drawn as "A"
// by card-faces.js) and copy 0 or 1 for the two identical cards.

const DoppelkopfCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [9, 10, 11, 12, 13, 14];
  const PLAYERS = 4;
  const HAND_SIZE = 12;
  const POINTS = { 9: 0, 10: 10, 11: 2, 12: 3, 13: 4, 14: 11 };

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
    for (let copy = 0; copy < 2; copy++) {
      SUITS.forEach((suit) => RANKS.forEach((rank) => deck.push({ rank, suit, copy })));
    }
    return deck;
  }

  function sameCard(a, b) {
    return !!a && !!b && a.rank === b.rank && a.suit === b.suit && a.copy === b.copy;
  }

  function sameKind(a, b) {
    return a.rank === b.rank && a.suit === b.suit;
  }

  function cardPoints(card) {
    return POINTS[card.rank];
  }

  function isDulle(card) {
    return card.suit === "H" && card.rank === 10;
  }

  function isClubQueen(card) {
    return card.suit === "C" && card.rank === 12;
  }

  function isTrump(card) {
    return card.suit === "D" || card.rank === 11 || card.rank === 12 || isDulle(card);
  }

  // Trump strength, higher is stronger; 0 for plain cards.
  function trumpStrength(card) {
    if (!isTrump(card)) return 0;
    if (isDulle(card)) return 100;
    const suitOrder = { C: 3, S: 2, H: 1, D: 0 };
    if (card.rank === 12) return 90 + suitOrder[card.suit];
    if (card.rank === 11) return 80 + suitOrder[card.suit];
    return { 14: 74, 10: 73, 13: 72, 9: 71 }[card.rank];
  }

  // The kinds of trump from highest to lowest (one of each), for the
  // trump order list on the page.
  const TRUMP_ORDER = [
    { rank: 10, suit: "H" },
    { rank: 12, suit: "C" }, { rank: 12, suit: "S" }, { rank: 12, suit: "H" }, { rank: 12, suit: "D" },
    { rank: 11, suit: "C" }, { rank: 11, suit: "S" }, { rank: 11, suit: "H" }, { rank: 11, suit: "D" },
    { rank: 14, suit: "D" }, { rank: 10, suit: "D" }, { rank: 13, suit: "D" }, { rank: 9, suit: "D" }
  ];

  const PLAIN_ORDER = { 14: 4, 10: 3, 13: 2, 9: 1 };

  // "T" for trump, otherwise the plain suit.
  function suitOf(card) {
    return isTrump(card) ? "T" : card.suit;
  }

  // Does `card` (played later) beat `best` (currently winning), with
  // `led` the suit of the trick?
  function beats(card, best, led) {
    const ct = isTrump(card), bt = isTrump(best);
    if (ct && !bt) return true;
    if (!ct && bt) return false;
    if (ct && bt) {
      if (isDulle(card) && isDulle(best)) return true; // second Heart Ten wins
      return trumpStrength(card) > trumpStrength(best);
    }
    if (card.suit !== led) return false;
    if (best.suit !== led) return true;
    return PLAIN_ORDER[card.rank] > PLAIN_ORDER[best.rank];
  }

  // Index (into trick) of the card winning so far.
  function winningIndex(trick) {
    if (!trick.length) return -1;
    const led = suitOf(trick[0].card);
    let best = 0;
    for (let i = 1; i < trick.length; i++) {
      if (beats(trick[i].card, trick[best].card, led)) best = i;
    }
    return best;
  }

  function trickPoints(cards) {
    return cards.reduce((n, c) => n + cardPoints(c.card || c), 0);
  }

  function legalCards(s, p) {
    const hand = s.hands[p];
    if (!s.trick.length) return hand.slice();
    const led = suitOf(s.trick[0].card);
    const follow = hand.filter((c) => suitOf(c) === led);
    return follow.length ? follow : hand.slice();
  }

  // Why `card` can't be played now, or null.
  function playProblem(s, card) {
    if (s.dealOver) return "over";
    const hand = s.hands[s.turn];
    if (!hand.some((c) => sameCard(c, card))) return "not-in-hand";
    if (!s.trick.length) return null;
    const led = suitOf(s.trick[0].card);
    if (suitOf(card) !== led && hand.some((c) => suitOf(c) === led)) return "follow";
    return null;
  }

  // Deals a new game. `dealer` is the player who dealt; the player after
  // the dealer leads the first trick.
  function createDeal(dealer, rng) {
    const deck = shuffle(createDeck(), rng);
    const hands = [];
    for (let p = 0; p < PLAYERS; p++) hands.push(deck.slice(p * HAND_SIZE, (p + 1) * HAND_SIZE));
    const clubQueens = hands.map((h) => h.filter(isClubQueen).length);
    const party = clubQueens.map((n) => (n > 0 ? "re" : "kontra"));
    let marriage = null;
    const m = clubQueens.indexOf(2);
    if (m !== -1) marriage = { player: m, partner: null, open: true, alone: false };
    const revealed = [false, false, false, false];
    if (marriage) revealed[m] = true; // a marriage is announced
    const s = {
      dealer,
      hands,
      party,                 // "re" | "kontra" for every player (the truth)
      revealed,              // whose party is public knowledge
      marriage,
      clubQueensPlayed: 0,
      turn: (dealer + 1) % PLAYERS,
      leader: (dealer + 1) % PLAYERS,
      trick: [],             // [{ player, card }]
      trickNo: 0,            // completed tricks
      won: [[], [], [], []], // per player: tricks won, each [{ player, card }]
      lastTrick: null,       // { cards, winner, points }
      dealOver: false,
      result: null
    };
    updateRevealed(s);
    return s;
  }

  // Makes parties public once they can be told from the table: a Queen of
  // Clubs played, both played, a settled marriage.
  function updateRevealed(s) {
    if (s.marriage && !s.marriage.open) {
      for (let p = 0; p < PLAYERS; p++) s.revealed[p] = true;
      return;
    }
    if (!s.marriage && s.clubQueensPlayed >= 2) {
      for (let p = 0; p < PLAYERS; p++) s.revealed[p] = true;
      return;
    }
    // With both Re players known the other two must be Kontra.
    const reKnown = s.party.filter((x, p) => x === "re" && s.revealed[p]).length;
    const reTotal = s.party.filter((x) => x === "re").length;
    if (!s.marriage && reKnown === reTotal) {
      for (let p = 0; p < PLAYERS; p++) s.revealed[p] = true;
    }
  }

  // Plays `card` for s.turn. Returns { ok, state, reason, trickDone }.
  function playCard(state, card) {
    const problem = playProblem(state, card);
    if (problem) return { ok: false, state, reason: problem };
    const s = clone(state);
    const p = s.turn;
    const hand = s.hands[p];
    const i = hand.findIndex((c) => sameCard(c, card));
    hand.splice(i, 1);
    s.trick.push({ player: p, card });
    if (isClubQueen(card) && !s.marriage) {
      s.clubQueensPlayed++;
      s.revealed[p] = true;
      updateRevealed(s);
    } else if (isClubQueen(card)) {
      s.clubQueensPlayed++;
    }
    if (s.trick.length < PLAYERS) {
      s.turn = (p + 1) % PLAYERS;
      return { ok: true, state: s, trickDone: false };
    }
    finishTrick(s);
    return { ok: true, state: s, trickDone: true };
  }

  function finishTrick(s) {
    const w = s.trick[winningIndex(s.trick)].player;
    const cards = s.trick;
    s.won[w].push(cards);
    s.trickNo++;
    s.lastTrick = { cards, winner: w, points: trickPoints(cards), no: s.trickNo };
    // Marriage: the first plain-suit trick won by someone else.
    const mar = s.marriage;
    if (mar && mar.open) {
      if (!isTrump(cards[0].card) && w !== mar.player) {
        mar.partner = w;
        mar.open = false;
        s.party[w] = "re";
        s.lastTrick.partnerFound = w;
      } else if (s.trickNo >= 3) {
        mar.open = false;
        mar.alone = true;
        s.lastTrick.marriageAlone = true;
      }
      if (!mar.open) updateRevealed(s);
    }
    s.trick = [];
    s.leader = w;
    s.turn = w;
    if (s.trickNo === HAND_SIZE) scoreDeal(s);
  }

  function partyPoints(s, party) {
    let n = 0;
    for (let p = 0; p < PLAYERS; p++) {
      if (s.party[p] === party) s.won[p].forEach((t) => { n += trickPoints(t); });
    }
    return n;
  }

  function partyTricks(s, party) {
    let n = 0;
    for (let p = 0; p < PLAYERS; p++) if (s.party[p] === party) n += s.won[p].length;
    return n;
  }

  // Works out the result of a finished deal (mutates s).
  function scoreDeal(s) {
    s.dealOver = true;
    for (let p = 0; p < PLAYERS; p++) s.revealed[p] = true;
    const re = partyPoints(s, "re");
    const kontra = 240 - re;
    const winner = re >= 121 ? "re" : "kontra";
    const loser = winner === "re" ? "kontra" : "re";
    const loserPts = winner === "re" ? kontra : re;
    const items = [{ key: "won", party: winner }];
    if (winner === "kontra") items.push({ key: "against", party: "kontra" });
    if (loserPts < 90) items.push({ key: "no90", party: winner });
    if (loserPts < 60) items.push({ key: "no60", party: winner });
    if (loserPts < 30) items.push({ key: "no30", party: winner });
    if (partyTricks(s, loser) === 0) items.push({ key: "black", party: winner });
    const alone = !!(s.marriage && s.marriage.alone);
    // Extra points only when two play against two.
    if (!alone) {
      s.won.forEach((tricks, w) => {
        tricks.forEach((t, k) => {
          if (trickPoints(t) >= 40) items.push({ key: "doppelkopf", party: s.party[w] });
          t.forEach((e) => {
            if (e.card.suit === "D" && e.card.rank === 14 && s.party[e.player] !== s.party[w]) {
              items.push({ key: "fox", party: s.party[w] });
            }
          });
        });
      });
      const last = s.lastTrick;
      const lastWin = last.cards[winningIndex(last.cards)].card;
      if (lastWin.suit === "C" && lastWin.rank === 11) items.push({ key: "charlie", party: s.party[last.winner] });
    }
    // Value from Re's point of view.
    let reValue = 0;
    items.forEach((it) => { reValue += it.party === "re" ? 1 : -1; });
    const deltas = [];
    const reCount = s.party.filter((x) => x === "re").length;
    for (let p = 0; p < PLAYERS; p++) {
      if (reCount === 1) deltas.push(s.party[p] === "re" ? 3 * reValue : -reValue);
      else deltas.push(s.party[p] === "re" ? reValue : -reValue);
    }
    s.result = { re, kontra, winner, items, reValue, deltas, alone };
  }

  // What `viewer` may know about p's party: their own (unknown while an
  // open marriage may still pick them), the others' once public. null
  // means unknown.
  function knownParty(s, viewer, p) {
    if (p === viewer) {
      if (s.marriage && s.marriage.open && viewer !== s.marriage.player) return null;
      return s.party[p];
    }
    if (s.revealed[p]) return s.party[p];
    // A Re player whose partner has shown the other Queen of Clubs knows
    // the two left are Kontra.
    if (!s.marriage && s.party[viewer] === "re") {
      const partnerKnown = s.party.some((x, q) => q !== viewer && x === "re" && s.revealed[q]);
      if (partnerKnown) return s.party[p];
    }
    return null;
  }

  return {
    SUITS,
    RANKS,
    PLAYERS,
    HAND_SIZE,
    TRUMP_ORDER,
    createDeck,
    sameCard,
    sameKind,
    cardPoints,
    isTrump,
    isDulle,
    isClubQueen,
    trumpStrength,
    suitOf,
    beats,
    winningIndex,
    trickPoints,
    legalCards,
    playProblem,
    createDeal,
    playCard,
    knownParty,
    partyPoints
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DoppelkopfCore;
}
if (typeof window !== "undefined") {
  window.DoppelkopfCore = DoppelkopfCore;
}
