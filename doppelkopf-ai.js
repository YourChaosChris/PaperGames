// doppelkopf-ai.js
// Computer player for Doppelkopf (normal game). It uses only what the
// player could know at a real table: its own hand, the cards already
// played, and the parties as far as they are public.
//   Easy:   any card it is allowed to play.
//   Medium: plays plain-suit Aces early, wins tricks with the cheapest
//           card that will probably hold, gives points to a partner who
//           is winning, and otherwise throws its cheapest card.
//   Hard:   as medium, but counts the cards still out to tell whether a
//           card can still be beaten, and keeps its high trumps for
//           tricks that are worth something.

const DoppelkopfAi = (function () {
  const Core = (typeof DoppelkopfCore !== "undefined") ? DoppelkopfCore
    : (typeof require !== "undefined" ? require("./doppelkopf-core.js") : null);

  function allPlayed(s) {
    const out = [];
    s.won.forEach((tricks) => tricks.forEach((t) => t.forEach((e) => out.push(e))));
    s.trick.forEach((e) => out.push(e));
    return out;
  }

  // Cards not in `me`'s hand and not played yet (the ones the others may
  // hold).
  function unseenCards(s, me) {
    const seen = allPlayed(s).map((e) => e.card).concat(s.hands[me]);
    return Core.createDeck().filter((c) => !seen.some((x) => Core.sameCard(x, c)));
  }

  function suitLedBefore(s, suit) {
    return s.won.some((tricks) => tricks.some((t) => !Core.isTrump(t[0].card) && t[0].card.suit === suit));
  }

  // true / false / null (unknown): does q play on me's side?
  function isFriend(s, me, q) {
    const mine = Core.knownParty(s, me, me) || "kontra";
    const theirs = Core.knownParty(s, me, q);
    if (theirs === null) return null;
    return theirs === mine;
  }

  // Low values are cheap to give away: points first, then strength.
  function cheapness(c) {
    return Core.cardPoints(c) * 10 + (Core.isTrump(c) ? Core.trumpStrength(c) - 60 : 0);
  }

  function byCheapest(cards) {
    return cards.slice().sort((a, b) => cheapness(a) - cheapness(b));
  }

  // The cheapest card that wins: lowest trump strength or lowest plain rank.
  function winStrength(c) {
    return Core.isTrump(c) ? 100 + Core.trumpStrength(c) : { 9: 1, 13: 2, 10: 3, 14: 4 }[c.rank];
  }

  // Could `card`, winning now, still be beaten by the players after me?
  function canBeBeaten(s, me, card, level) {
    const after = 3 - s.trick.length;
    if (after <= 0) return false;
    const led = s.trick.length ? Core.suitOf(s.trick[0].card) : Core.suitOf(card);
    if (level >= 3) {
      const unseen = unseenCards(s, me);
      return unseen.some((c) => Core.beats(c, card, led));
    }
    // Medium: a rough rule of thumb.
    if (Core.isTrump(card)) return Core.trumpStrength(card) < 88;
    return !(card.rank === 14 && !suitLedBefore(s, card.suit));
  }

  function chooseLead(s, me, legal, level) {
    const hand = s.hands[me];
    // A plain-suit Ace the first time the suit comes round.
    const aces = legal.filter((c) => !Core.isTrump(c) && c.rank === 14 && !suitLedBefore(s, c.suit));
    if (aces.length) {
      // Prefer the suit with the most cards still out, so it is less
      // likely somebody can trump it.
      if (level >= 3) {
        const unseen = unseenCards(s, me);
        aces.sort((a, b) => unseen.filter((c) => !Core.isTrump(c) && c.suit === b.suit).length -
          unseen.filter((c) => !Core.isTrump(c) && c.suit === a.suit).length);
      }
      return aces[0];
    }
    const trumps = legal.filter(Core.isTrump);
    const plain = legal.filter((c) => !Core.isTrump(c));
    const myParty = Core.knownParty(s, me, me);
    // Strong in trumps on the Re side: draw trumps with a middle one.
    if (trumps.length >= 6 && myParty === "re") {
      const mid = trumps.filter((c) => Core.trumpStrength(c) >= 80 && Core.trumpStrength(c) < 90);
      if (mid.length) return byCheapest(mid)[0];
    }
    if (plain.length) {
      // Lead from the shortest plain suit to become free of it, cheapest
      // card first; keep Tens back when a low card is there.
      const count = (suit) => hand.filter((c) => !Core.isTrump(c) && c.suit === suit).length;
      plain.sort((a, b) => count(a.suit) - count(b.suit) || cheapness(a) - cheapness(b));
      return plain[0];
    }
    return byCheapest(trumps)[0];
  }

  function chooseFollow(s, me, legal, level) {
    const trick = s.trick;
    const led = Core.suitOf(trick[0].card);
    const wi = Core.winningIndex(trick);
    const winner = trick[wi].player;
    const best = trick[wi].card;
    const last = trick.length === 3;
    const points = Core.trickPoints(trick);
    const friend = isFriend(s, me, winner);
    const winners = legal.filter((c) => Core.beats(c, best, led));

    // Partner winning safely: give points, but keep the Heart Tens and
    // Queens back for later.
    if (friend === true && (last || !canBeBeaten(s, me, best, level))) {
      const give = legal.filter((c) => !Core.isDulle(c) && c.rank !== 12);
      const pool = give.length ? give : legal;
      return pool.slice().sort((a, b) => Core.cardPoints(b) - Core.cardPoints(a) || cheapness(a) - cheapness(b))[0];
    }

    if (winners.length) {
      const sorted = winners.slice().sort((a, b) => winStrength(a) - winStrength(b));
      if (last) {
        const cheapest = sorted[0];
        const worth = points + Core.cardPoints(cheapest);
        if (friend !== true && (worth >= 10 || Core.trumpStrength(cheapest) < 88)) return cheapest;
      } else {
        const holding = sorted.filter((c) => !canBeBeaten(s, me, c, level));
        if (holding.length && friend !== true) {
          // Hard keeps its top trumps for tricks worth taking.
          const pick = holding[0];
          if (level < 3 || points >= 10 || Core.trumpStrength(pick) < 90) return pick;
        }
        if (friend === false && points >= 14 && level >= 2) return sorted[sorted.length - 1];
      }
    }
    // Nothing worth winning: throw the cheapest card.
    return byCheapest(legal)[0];
  }

  function chooseMove(s, level) {
    const me = s.turn;
    const legal = Core.legalCards(s, me);
    if (legal.length === 1) return legal[0];
    if (level <= 1) return legal[Math.floor(Math.random() * legal.length)];
    return s.trick.length ? chooseFollow(s, me, legal, level) : chooseLead(s, me, legal, level);
  }

  return { chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DoppelkopfAi;
}
if (typeof window !== "undefined") {
  window.DoppelkopfAi = DoppelkopfAi;
}
