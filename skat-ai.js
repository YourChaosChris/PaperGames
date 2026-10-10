// skat-ai.js
// Computer players for Skat (skat-core.js).
//
// Bidding: every possible game is rated by a simple hand count (jacks,
// trumps, aces, tens, short suits; for Null the risk of each card). The
// computer bids up to the value of the best game it would dare to play.
// Easy dares more and plays any legal card. Medium plays by rules of
// thumb (draw trumps as declarer, cash aces, give points to a partner who
// is winning the trick, win tricks cheaply). Hard deals the unknown
// cards at random many times - keeping to what it knows, e.g. that a
// player could not follow suit - and plays each candidate card out with
// the Medium rules; it picks the card with the best average result.
// No computer ever looks at cards it could not see at the table: only an
// Ouvert declarer's hand is open to all.

const SkatAi = (function () {
  const C = (typeof SkatCore !== "undefined") ? SkatCore : require("./skat-core.js");
  const TYPES = ["C", "S", "H", "D", "grand"];

  /*** Hand ratings ***/

  function suitRating(cards, t) {
    const game = { type: t };
    const trumps = cards.filter((c) => C.isTrump(game, c));
    const JV = { C: 3, S: 2.5, H: 2, D: 1.5 };
    let score = 0;
    trumps.forEach((c) => {
      if (c.rank === 11) score += JV[c.suit];
      else if (c.rank === 14) score += 1.5;
      else if (c.rank === 10) score += 1.1;
      else score += 0.6;
    });
    C.SUITS.forEach((s) => {
      if (s === t) return;
      const side = cards.filter((c) => c.suit === s && c.rank !== 11);
      const ace = side.some((c) => c.rank === 14), ten = side.some((c) => c.rank === 10);
      if (ace) score += 1.5;
      if (ten) score += ace ? 1 : (side.length >= 2 ? 0.4 : -0.3);
      if (!side.length && trumps.length >= 5) score += 0.6;
      if (side.length === 1 && !ace) score -= 0.2;
    });
    return { score, trumps: trumps.length };
  }

  function grandRating(cards) {
    const jacks = cards.filter((c) => c.rank === 11);
    let score = jacks.length * 2 + (jacks.some((c) => c.suit === "C") ? 0.5 : 0) + (jacks.some((c) => c.suit === "S") ? 0.3 : 0);
    C.SUITS.forEach((s) => {
      const side = cards.filter((c) => c.suit === s && c.rank !== 11);
      const ace = side.some((c) => c.rank === 14), ten = side.some((c) => c.rank === 10);
      if (ace) score += 2;
      if (ace && ten) score += 1.5;
      else if (ten && side.length >= 3) score += 0.7;
      if (side.length >= 4 && ace) score += 0.8;
    });
    return { score, jacks: jacks.length };
  }

  const NULL_RANK = { 7: 0, 8: 1, 9: 2, 10: 3, 11: 4, 12: 5, 13: 6, 14: 7 };

  // Cards that may be forced to take a trick in Null.
  function nullRisk(cards) {
    let risk = 0;
    C.SUITS.forEach((s) => {
      const ranks = cards.filter((c) => c.suit === s).map((c) => NULL_RANK[c.rank]).sort((a, b) => a - b);
      ranks.forEach((r, i) => { if (r > 2 * i + (i === 0 ? 0 : 1)) risk++; });
    });
    return risk;
  }

  // The games a hand could play, rated: [{ type, rating, value }]. With
  // 10 cards (bidding) the value counts only the matadors in the hand.
  function options(cards, level) {
    const dare = level <= 1 ? 1.5 : (level >= 3 ? -0.3 : 0);
    const out = [];
    ["C", "S", "H", "D"].forEach((t) => {
      const r = suitRating(cards, t);
      const need = cards.length >= 12 ? 9.5 : 8.2;
      if (r.trumps >= 5 || (r.trumps === 4 && r.score >= need + 1)) {
        if (r.score + dare >= need) out.push({ type: t, rating: r.score - need, value: C.gameValue({ type: t }, cards, {}) });
      }
    });
    const g = grandRating(cards);
    const gneed = cards.length >= 12 ? 10 : 8.5;
    if (g.jacks >= 2 && g.score + dare >= gneed) out.push({ type: "grand", rating: g.score - gneed + 1, value: C.gameValue({ type: "grand" }, cards, {}) });
    const risk = nullRisk(cards.length > 10 ? cards : cards);
    if (risk === 0 || (level <= 1 && risk <= 1)) out.push({ type: "null", rating: 1 - risk, value: 23 });
    return out;
  }

  function maxBid(cards, level) {
    return options(cards, level).reduce((m, o) => Math.max(m, o.value), 0);
  }

  // Bidding action for the player whose turn it is.
  function bidChoice(s, level) {
    const t = C.bidTurn(s);
    const limit = maxBid(s.hands[t.player], level);
    if (t.kind === "open") return { action: limit >= 18 ? "bid" : "pass" };
    if (t.kind === "answer") return { action: s.bidding.bid <= limit ? "hold" : "pass" };
    const next = C.nextBid(s.bidding.bid);
    return next && next <= limit ? { action: "bid", value: next } : { action: "pass" };
  }

  // Hand game only with a very strong hand.
  function wantsHand(s, level) {
    if (level <= 1) return false;
    const opts = options(s.hands[s.declarer], level);
    return opts.some((o) => o.type !== "null" && o.rating >= 4 && o.value >= s.bid);
  }

  // After taking the skat: the two cards to discard and the game.
  function discardAndGame(s, level, rng) {
    const r = rng || Math.random;
    const hand = s.hands[s.declarer];
    let best = null;
    for (let a = 0; a < hand.length; a++) for (let b = a + 1; b < hand.length; b++) {
      const keep = hand.filter((_, i) => i !== a && i !== b);
      const disc = [hand[a], hand[b]];
      const full = hand;   // matadors count hand + skat
      TYPES.concat(["null"]).forEach((t) => {
        let rating;
        if (t === "null") rating = 1.5 - nullRisk(keep) * 1.2;
        else if (t === "grand") {
          const g = grandRating(keep);
          if (g.jacks < 2) return;
          rating = g.score - 10 + 1 + C.pointsOf(disc) * 0.04;
          if (disc.some((c) => c.rank === 11)) return;
        } else {
          const sr = suitRating(keep, t);
          if (disc.some((c) => C.isTrump({ type: t }, c))) return;
          rating = sr.score - 9.5 + C.pointsOf(disc) * 0.05 + (sr.trumps >= 6 ? 0.5 : 0);
        }
        const value = t === "null" ? 23 : C.gameValue({ type: t }, full, {});
        const okValue = value >= s.bid;
        const sc = rating + (okValue ? 0 : -20) + (level <= 1 ? r() * 2 : r() * 0.1);
        if (!best || sc > best.sc) best = { sc, discard: disc, type: t, value };
      });
    }
    return best;
  }

  // Game choice for a Hand game (no skat taken).
  function handGameChoice(s, level) {
    const cards = s.hands[s.declarer];
    const opts = options(cards, Math.max(level, 2)).filter((o) => (o.type === "null" ? 35 : o.value) >= s.bid);
    opts.sort((a, b) => b.rating - a.rating);
    if (opts.length) return opts[0].type;
    // Nothing reaches the bid: the best suit by rating.
    let bestT = "grand", bestR = -99;
    ["C", "S", "H", "D"].forEach((t) => { const r = suitRating(cards, t).score; if (r > bestR) { bestR = r; bestT = t; } });
    return bestT;
  }

  /*** Card play ***/

  function partnerOf(s, p) { return p === s.declarer ? -1 : 3 - p - s.declarer; }

  function currentWinner(s) {
    return s.trick.length ? C.trickWinner(s.game, s.trick) : -1;
  }

  function lowest(game, cards) {
    return cards.slice().sort((a, b) => (C.POINTS[a.rank] - C.POINTS[b.rank]) || (C.strength(game, a, C.followGroup(game, a)) - C.strength(game, b, C.followGroup(game, b))))[0];
  }

  function highestPoints(game, cards) {
    return cards.slice().sort((a, b) => (C.POINTS[b.rank] - C.POINTS[a.rank]) || (C.strength(game, a, a.suit) - C.strength(game, b, b.suit)))[0];
  }

  function beatsNow(s, card) {
    const t = s.trick.concat([{ player: s.turn, card }]);
    return C.trickWinner(s.game, t) === s.turn;
  }

  function trumpsOut(s, p) {
    const g = s.game;
    const seen = s.played.map((e) => e.card).concat(s.hands[p]);
    if (p === s.declarer && s.discarded) seen.push.apply(seen, s.discarded);
    const total = g.type === "grand" ? 4 : 11;
    return total - seen.filter((c) => C.isTrump(g, c)).length;
  }

  // Rules of thumb (Medium, and the play-outs of Hard).
  function ruleCard(s) {
    const p = s.turn, g = s.game;
    const legal = C.legalCards(s, p);
    if (legal.length === 1) return legal[0];
    if (g.type === "null") {
      const declarer = p === s.declarer;
      if (!s.trick.length) return lowestNull(legal);
      const led = C.followGroup(g, s.trick[0].card);
      const best = s.trick.reduce((m, e) => Math.max(m, C.strength(g, e.card, led)), 0);
      if (declarer) {
        const under = legal.filter((c) => C.strength(g, c, led) < best);
        if (under.length) return highestNull(under);
        return lowestNull(legal);
      }
      // Defender: if the declarer is winning the trick, stay under him.
      const w = currentWinner(s);
      if (w === s.declarer) {
        const under = legal.filter((c) => C.strength(g, c, led) < best);
        if (under.length) return highestNull(under);
      }
      return lowestNull(legal);
    }
    const partner = partnerOf(s, p);
    if (!s.trick.length) {
      if (p === s.declarer) {
        const trumps = legal.filter((c) => C.isTrump(g, c));
        if (trumps.length && trumpsOut(s, p) > 0) {
          const top = trumps.slice().sort((a, b) => C.strength(g, b, "T") - C.strength(g, a, "T"))[0];
          return isHighestLeft(s, top) ? top : trumps.slice().sort((a, b) => C.strength(g, a, "T") - C.strength(g, b, "T"))[0];
        }
        const aces = legal.filter((c) => c.rank === 14 && !C.isTrump(g, c));
        if (aces.length) return aces[0];
        const tops = legal.filter((c) => isHighestLeft(s, c));
        if (tops.length) return tops[0];
        return lowest(g, legal);
      }
      const aces = legal.filter((c) => c.rank === 14 && !C.isTrump(g, c));
      if (aces.length) return aces[0];
      const side = legal.filter((c) => !C.isTrump(g, c));
      if (side.length) {
        // A short suit, so the partner can trump in later; low card.
        const bySuit = {};
        side.forEach((c) => { (bySuit[c.suit] = bySuit[c.suit] || []).push(c); });
        const suits = Object.keys(bySuit).sort((a, b) => bySuit[a].length - bySuit[b].length);
        return lowest(g, bySuit[suits[0]]);
      }
      return lowest(g, legal);
    }
    const w = currentWinner(s);
    const last = s.trick.length === 2;
    const friendWins = partner !== -1 && w === partner;
    if (friendWins && (last || !beatsCard(s, partner))) {
      const side = legal.filter((c) => !(C.isTrump(g, c) && c.rank === 11));
      return highestPoints(g, side.length ? side : legal);
    }
    const winners = legal.filter((c) => beatsNow(s, c));
    const pts = C.pointsOf(s.trick.map((e) => e.card));
    if (winners.length && (last || pts >= 3 || p === s.declarer)) {
      const cheap = winners.slice().sort((a, b) => C.strength(g, a, C.followGroup(g, s.trick[0].card)) - C.strength(g, b, C.followGroup(g, s.trick[0].card)));
      if (last) return pickLastWinner(g, cheap);
      return cheap[0];
    }
    return lowest(g, legal);
  }

  function pickLastWinner(g, winners) {
    // Last to play: win with the card worth most points that still wins,
    // but not with a jack if a plain card does it.
    const plain = winners.filter((c) => c.rank !== 11);
    const pool = plain.length ? plain : winners;
    return pool.slice().sort((a, b) => C.POINTS[b.rank] - C.POINTS[a.rank])[0];
  }

  // Could the player still to play after the partner beat him? Rough:
  // the partner's card is the highest of its group still in play.
  function beatsCard(s, partner) {
    const e = s.trick.find((x) => x.player === partner);
    return !isHighestLeft(s, e.card);
  }

  function isHighestLeft(s, card) {
    const g = s.game;
    const grp = C.followGroup(g, card);
    const gone = s.played.map((e) => e.card);
    const all = C.newDeck().filter((c) => C.followGroup(g, c) === grp && !gone.some((x) => C.same(x, c)));
    return all.every((c) => C.strength(g, c, grp) <= C.strength(g, card, grp));
  }

  function lowestNull(cards) {
    return cards.slice().sort((a, b) => NULL_RANK[a.rank] - NULL_RANK[b.rank])[0];
  }

  function highestNull(cards) {
    return cards.slice().sort((a, b) => NULL_RANK[b.rank] - NULL_RANK[a.rank])[0];
  }

  // Hard: random deals of the unknown cards, each candidate played out.
  function sampleWorld(s, me, r) {
    const known = s.hands[me].concat(s.played.map((e) => e.card));
    if (me === s.declarer && s.discarded) known.push.apply(known, s.discarded);
    const open = s.game.ouvert && me !== s.declarer;
    if (open) known.push.apply(known, s.hands[s.declarer]);
    const unknown = C.newDeck().filter((c) => !known.some((k) => C.same(k, c)));
    const others = [0, 1, 2].filter((p) => p !== me && !(open && p === s.declarer));
    const need = others.map((p) => s.hands[p].length);
    for (let attempt = 0; attempt < 30; attempt++) {
      C.shuffle(unknown, r);
      const w = JSON.parse(JSON.stringify(s));
      let k = 0, ok = true;
      others.forEach((p, i) => {
        w.hands[p] = unknown.slice(k, k + need[i]);
        k += need[i];
        if (w.hands[p].some((c) => s.voids[p][C.followGroup(s.game, c)])) ok = false;
      });
      if (ok || attempt === 29) return w;
    }
    return null;
  }

  function playOut(w) {
    let s = w;
    while (s.phase === "play") s = C.playCard(s, ruleCard(s));
    return s;
  }

  function outcome(s, me) {
    const r = s.result;
    const declarerSide = me === s.declarer;
    let v = r.won ? 1 : -1;
    if (s.game.type !== "null") v = v * 2 + (r.eyes - 60) / 60;
    return declarerSide ? v : -v;
  }

  function chooseCard(s, level, rng, opts) {
    const r = rng || Math.random;
    const legal = C.legalCards(s, s.turn);
    if (legal.length === 1) return legal[0];
    if (level <= 1) return legal[Math.floor(r() * legal.length)];
    if (level === 2) return ruleCard(s);
    const samples = (opts && opts.samples) || 24;
    const me = s.turn;
    const scores = legal.map(() => 0);
    for (let k = 0; k < samples; k++) {
      const w = sampleWorld(s, me, r);
      if (!w) break;
      legal.forEach((c, i) => {
        const next = C.playCard(w, c);
        scores[i] += outcome(playOut(next), me);
      });
    }
    let bi = 0;
    scores.forEach((v, i) => { if (v > scores[bi]) bi = i; });
    return legal[bi];
  }

  return { options, maxBid, bidChoice, wantsHand, discardAndGame, handGameChoice, chooseCard, ruleCard, nullRisk };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SkatAi;
}
if (typeof window !== "undefined") {
  window.SkatAi = SkatAi;
}
