// trix-ai.js
// Computer player for Trix. It sees only its own hand and the cards on
// the table.
//   Easy:   picks contracts and cards at random among the allowed ones.
//   Medium: picks the contract that suits its hand, ducks under the
//           winning card, throws penalty cards on other players' tricks,
//           and in Trix prefers cards it can follow up itself.
//   Hard:   as medium, and also counts which cards are still out: it
//           leads suits in which it can't be forced to take penalty cards
//           and, in Trix, avoids opening a row for the others.

const TrixAi = (function () {
  const Core = (typeof TrixCore !== "undefined") ? TrixCore
    : (typeof require !== "undefined" ? require("./trix-core.js") : null);

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /*** Choosing a contract ***/

  // Rough expected result of each contract for this hand (higher is
  // better); only the ranking matters.
  function contractValue(hand, contract) {
    const high = hand.filter((c) => c.rank >= 12).length;
    const low = hand.filter((c) => c.rank <= 6).length;
    const bySuit = (s) => hand.filter((c) => c.suit === s);
    if (contract === "king") {
      const hearts = bySuit("H");
      const hasKing = hearts.some(Core.isKingOfHearts);
      const guards = hearts.filter((c) => c.rank < 13).length;
      return hasKing ? (guards >= 4 ? -20 : -55) : -12;
    }
    if (contract === "queens") {
      let v = -25;
      hand.forEach((c) => {
        if (c.rank !== 12) return;
        const guards = bySuit(c.suit).filter((x) => x.rank < 12).length;
        v -= guards >= 3 ? 5 : 20;
      });
      return v;
    }
    if (contract === "diamonds") {
      const d = bySuit("D");
      return -32 - d.filter((c) => c.rank >= 11).length * 8 + d.filter((c) => c.rank <= 6).length * 3;
    }
    if (contract === "tricks") return -48 - high * 8 + low * 4;
    // Trix: Jacks and runs from them help to finish early.
    const jacks = hand.filter((c) => c.rank === 11).length;
    const near = hand.filter((c) => c.rank >= 9 && c.rank <= 13).length;
    return 110 + jacks * 25 + near * 5;
  }

  function chooseContract(game, level) {
    const left = Core.remainingContracts(game);
    if (level <= 1) return pick(left);
    const hand = game.hands[game.owner];
    let best = left[0], bestV = -Infinity;
    left.forEach((c) => {
      const v = contractValue(hand, c);
      if (v > bestV) { bestV = v; best = c; }
    });
    return best;
  }

  /*** Playing ***/

  function seenCards(d) {
    const out = [];
    d.taken.forEach((cards) => cards.forEach((c) => out.push(c)));
    d.trick.forEach((e) => out.push(e.card));
    return out;
  }

  function trickPenalty(d, cards) {
    if (d.contract === "tricks") return 15;
    return -cards.reduce((n, c) => n + Core.cardPenalty(d.contract, c), 0);
  }

  function chooseTrickCard(d, me, legal, level) {
    const hand = d.hands[me];
    if (!d.trick.length) return chooseLead(d, me, legal, level);
    const led = d.trick[0].card.suit;
    const best = d.trick[Core.winningIndex(d.trick)].card;
    const last = d.trick.length === 3;
    const following = legal[0].suit === led;
    if (!following) {
      // Void: throw the most expensive card, else the highest card.
      const pens = legal.filter((c) => Core.isPenaltyCard(d.contract, c));
      if (pens.length) return pens.sort((a, b) => Core.cardPenalty(d.contract, a) - Core.cardPenalty(d.contract, b) || b.rank - a.rank)[0];
      return legal.slice().sort((a, b) => b.rank - a.rank)[0];
    }
    const under = legal.filter((c) => c.rank < best.rank).sort((a, b) => b.rank - a.rank);
    // A penalty card can go now if a higher card already wins the trick.
    const safePen = under.filter((c) => Core.isPenaltyCard(d.contract, c));
    if (safePen.length) return safePen[0];
    if (under.length) return under[0];
    // Every card wins for now.
    const sorted = legal.slice().sort((a, b) => a.rank - b.rank);
    if (last) {
      // We take it anyway: take it with the highest non-penalty card.
      const plain = sorted.filter((c) => !Core.isPenaltyCard(d.contract, c));
      return plain.length ? plain[plain.length - 1] : sorted[sorted.length - 1];
    }
    // Others still to come: the lowest card gives them the chance to go
    // higher - unless it is the penalty card itself.
    const plain = sorted.filter((c) => !Core.isPenaltyCard(d.contract, c));
    return plain.length ? plain[0] : sorted[0];
  }

  function chooseLead(d, me, legal, level) {
    const hand = d.hands[me];
    const seen = level >= 3 ? seenCards(d) : [];
    const outCount = (suit) => 13 - hand.filter((c) => c.suit === suit).length -
      seen.filter((c) => c.suit === suit).length;
    // Don't lead the penalty card itself, nor (if possible) a suit whose
    // penalty card we hold.
    let pool = legal.filter((c) => !Core.isPenaltyCard(d.contract, c));
    if (!pool.length) pool = legal.slice();
    const risky = (c) => hand.some((x) => x.suit === c.suit && Core.isPenaltyCard(d.contract, x) && d.contract !== "diamonds");
    const calm = pool.filter((c) => !risky(c));
    if (calm.length) pool = calm;
    if (level >= 3) {
      // Prefer suits the others still hold plenty of, so a low lead is
      // likely to be beaten.
      pool = pool.filter((c) => outCount(c.suit) > 0).length ? pool.filter((c) => outCount(c.suit) > 0) : pool;
      if (d.contract === "king" && !hand.some(Core.isKingOfHearts)) {
        const lowHearts = pool.filter((c) => c.suit === "H" && c.rank < 13);
        if (lowHearts.length) return lowHearts.sort((a, b) => a.rank - b.rank)[0];
      }
    }
    return pool.slice().sort((a, b) => a.rank - b.rank)[0];
  }

  // Trix: prefer cards that keep our own follow-ups and open little for
  // the others.
  function chooseTrixCard(d, me, legal, level) {
    const hand = d.hands[me];
    const has = (suit, rank) => hand.some((c) => c.suit === suit && c.rank === rank);
    function score(c) {
      let s = 0;
      // What does this card expose? Up and/or down.
      const row = d.rows[c.suit];
      const next = [];
      if (!row) { next.push(10, 12); }
      else if (c.rank === row.high + 1) next.push(c.rank + 1);
      else next.push(c.rank - 1);
      next.forEach((r) => {
        if (r < 2 || r > 14) return;
        if (has(c.suit, r)) s += 3;            // we can follow up ourselves
        else s -= level >= 3 ? 2 : 1;          // it helps somebody else
      });
      // Long chains we hold in that direction are worth starting.
      return s;
    }
    let best = legal[0], bestS = -Infinity;
    legal.forEach((c) => {
      const s = score(c);
      if (s > bestS) { bestS = s; best = c; }
    });
    return best;
  }

  // The move for the player to act: { card } or { pass: true }.
  function chooseMove(game, level) {
    const d = game.deal;
    const me = d.turn;
    const legal = Core.legalCards(d, me);
    if (!legal.length) return { pass: true };
    if (legal.length === 1) return { card: legal[0] };
    if (level <= 1) return { card: pick(legal) };
    if (d.contract === "trix") return { card: chooseTrixCard(d, me, legal, level) };
    return { card: chooseTrickCard(d, me, legal, level) };
  }

  return { chooseContract, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TrixAi;
}
if (typeof window !== "undefined") {
  window.TrixAi = TrixAi;
}
