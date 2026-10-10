// schafkopf-ai.js
// Computer players for Schafkopf (schafkopf-core.js).
//
// Announcing: each possible game is rated by a hand count (Obers,
// Unters, trumps, Sows, Tens, missing suits); the computer names the
// highest kind of game it dares and is allowed to play. For a Sauspiel
// it calls the Sow of its shortest suit. Easy dares more and plays any
// allowed card. Medium plays by rules of thumb: the playing side draws
// trumps, the others search the called Sow and cash their Sows; a player
// gives points ("schmiert") to a known friend who is winning the trick
// and otherwise wins cheaply or throws a card of little value. Hard
// deals the unknown cards at random many times - keeping to what it
// knows, such as which suits a player could not follow - and plays each
// candidate card out with the Medium rules. No computer looks at cards it
// could not see; who holds the called Sow stays unknown until it is
// played (except to its holder).

const SchafkopfAi = (function () {
  const C = (typeof SchafkopfCore !== "undefined") ? SchafkopfCore : require("./schafkopf-core.js");

  /*** Ratings ***/

  function soloRating(hand, suit) {
    const g = { type: "solo", suit };
    const trumps = hand.filter((c) => C.isTrump(g, c));
    let score = 0;
    trumps.forEach((c) => {
      if (c.rank === 12) score += c.suit === "C" ? 3 : 2.5;
      else if (c.rank === 11) score += 1.6;
      else if (c.rank === 14) score += 1.2;
      else if (c.rank === 10) score += 1;
      else score += 0.6;
    });
    C.SUITS.forEach((s) => {
      if (s === suit) return;
      const side = hand.filter((c) => c.suit === s && !C.isTrump(g, c));
      if (side.some((c) => c.rank === 14)) score += 1.3;
      if (!side.length && trumps.length >= 6) score += 0.4;
    });
    return { score, trumps: trumps.length };
  }

  function wenzRating(hand) {
    const unters = hand.filter((c) => c.rank === 11);
    let score = unters.length * 2.5 + (unters.some((c) => c.suit === "C") ? 0.7 : 0);
    C.SUITS.forEach((s) => {
      const side = hand.filter((c) => c.suit === s && c.rank !== 11);
      const ace = side.some((c) => c.rank === 14), ten = side.some((c) => c.rank === 10);
      if (ace) score += 2;
      if (ace && ten) score += 1.2;
      if (ace && side.length >= 3) score += 0.5;
    });
    return { score, unters: unters.length };
  }

  function sauRating(hand) {
    const g = { type: "sau" };
    const trumps = hand.filter((c) => C.isTrump(g, c));
    let score = 0;
    trumps.forEach((c) => {
      if (c.rank === 12) score += 1.5;
      else if (c.rank === 11) score += 1;
      else if (c.rank === 14) score += 0.9;
      else score += 0.5;
    });
    ["C", "S", "D"].forEach((s) => { if (hand.some((c) => c.suit === s && c.rank === 14)) score += 1; });
    return { score, trumps: trumps.length };
  }

  // The game to announce (or null), among the allowed ones.
  function announceChoice(s, level) {
    const hand = s.hands[s.announceTurn];
    const allowed = C.allowedGames(s);
    const dare = level <= 1 ? 1 : (level >= 3 ? -0.2 : 0);
    const ok = (t, suit) => allowed.some((g) => g.type === t && (suit === undefined || g.suit === suit));
    let best = null;
    C.SUITS.forEach((suit) => {
      if (!ok("solo", suit)) return;
      const r = soloRating(hand, suit);
      if (r.trumps >= 6 && r.score + dare >= 12.5 && (!best || r.score - 12.5 > best.margin)) best = { type: "solo", suit, margin: r.score - 12.5 };
    });
    if (best) return { type: best.type, suit: best.suit };
    if (ok("wenz")) {
      const w = wenzRating(hand);
      if (w.unters >= 2 && w.score + dare >= 11) return { type: "wenz" };
    }
    const sauOpts = allowed.filter((g) => g.type === "sau");
    if (sauOpts.length) {
      const r = sauRating(hand);
      if (r.trumps >= 4 && r.score + dare >= 4.5) {
        // Call the Sow of the shortest suit.
        sauOpts.sort((a, b) => hand.filter((c) => c.suit === a.suit && c.rank !== 12 && c.rank !== 11).length -
          hand.filter((c) => c.suit === b.suit && c.rank !== 12 && c.rank !== 11).length);
        return { type: "sau", suit: sauOpts[0].suit };
      }
    }
    return null;
  }

  /*** Play ***/

  // What the viewer knows about p: "friend", "foe" or null (unknown).
  function knownSide(s, viewer, p) {
    if (p === viewer) return "friend";
    const sow = C.calledSow(s);
    if (!sow) return C.team(s, p) === C.team(s, viewer) ? "friend" : "foe";
    const sowPlayed = s.played.some((e) => C.same(e.card, sow));
    const iAmPartner = viewer === s.partner;
    if (sowPlayed || iAmPartner) return C.team(s, p) === C.team(s, viewer) ? "friend" : "foe";
    if (viewer === s.player) return null;
    // A defender who does not hold the Sow: the player is a foe, the rest unknown.
    if (p === s.player) return "foe";
    return null;
  }

  function highestLeft(s, card) {
    const g = s.game;
    const grp = C.group(g, card);
    const gone = s.played.map((e) => e.card);
    return C.newDeck().filter((c) => C.group(g, c) === grp && !gone.some((x) => C.same(x, c))).every((c) => C.strength(g, c, grp) <= C.strength(g, card, grp));
  }

  function byPoints(cards, desc) {
    return cards.slice().sort((a, b) => (desc ? -1 : 1) * (C.POINTS[a.rank] - C.POINTS[b.rank]));
  }

  function ruleCard(s) {
    const p = s.turn, g = s.game;
    const legal = C.legalCards(s, p);
    if (legal.length === 1) return legal[0];
    const mySide = C.team(s, p);
    const iAmPlayingSide = mySide === "player" && (p === s.player || p === s.partner);
    if (!s.trick.length) {
      const trumps = legal.filter((c) => C.isTrump(g, c));
      if (iAmPlayingSide && trumps.length) {
        const top = trumps.slice().sort((a, b) => C.strength(g, b, "T") - C.strength(g, a, "T"))[0];
        return highestLeft(s, top) ? top : trumps.slice().sort((a, b) => C.strength(g, a, "T") - C.strength(g, b, "T"))[0];
      }
      const sow = C.calledSow(s);
      if (!iAmPlayingSide && sow && !s.calledSought) {
        const search = legal.filter((c) => !C.isTrump(g, c) && c.suit === sow.suit);
        if (search.length) return byPoints(search)[0];
      }
      const aces = legal.filter((c) => !C.isTrump(g, c) && c.rank === 14);
      if (aces.length) return aces[0];
      const side = legal.filter((c) => !C.isTrump(g, c));
      if (side.length) return byPoints(side)[0];
      return byPoints(legal)[0];
    }
    const led = C.group(g, s.trick[0].card);
    const w = C.trickWinner(g, s.trick);
    const last = s.trick.length === 3;
    const friendWins = knownSide(s, p, w) === "friend";
    const winCard = s.trick.find((e) => e.player === w).card;
    if (friendWins && (last || highestLeft(s, winCard))) {
      const plain = legal.filter((c) => !(C.isTrump(g, c) && (c.rank === 12 || c.rank === 11)));
      return byPoints(plain.length ? plain : legal, true)[0];
    }
    const winners = legal.filter((c) => C.trickWinner(g, s.trick.concat([{ player: p, card: c }])) === p);
    const pts = C.pointsOf(s.trick.map((e) => e.card));
    if (winners.length && (last || pts >= 4 || iAmPlayingSide)) {
      if (last) {
        const plain = winners.filter((c) => c.rank !== 12 && c.rank !== 11);
        return byPoints(plain.length ? plain : winners, true)[0];
      }
      return winners.slice().sort((a, b) => C.strength(g, a, led) - C.strength(g, b, led))[0];
    }
    return byPoints(legal)[0];
  }

  /*** Hard ***/

  function sampleWorld(s, me, r) {
    const sow = C.calledSow(s);
    const known = s.hands[me].concat(s.played.map((e) => e.card));
    const unknown = C.newDeck().filter((c) => !known.some((k) => C.same(k, c)));
    const others = [0, 1, 2, 3].filter((p) => p !== me);
    for (let attempt = 0; attempt < 40; attempt++) {
      C.shuffle(unknown, r);
      const w = JSON.parse(JSON.stringify(s));
      let k = 0, ok = true;
      others.forEach((p) => {
        w.hands[p] = unknown.slice(k, k + s.hands[p].length);
        k += s.hands[p].length;
        if (w.hands[p].some((c) => s.voids[p][C.group(s.game, c)])) ok = false;
      });
      if (sow && !s.played.some((e) => C.same(e.card, sow))) {
        const holder = [0, 1, 2, 3].find((p) => w.hands[p].some((c) => C.same(c, sow)));
        if (holder === s.player) ok = false;
        w.partner = holder === undefined ? s.partner : holder;
      }
      if (ok || attempt === 39) return w;
    }
    return null;
  }

  function playOut(w) {
    let s = w;
    let guard = 0;
    while (s.phase === "play" && guard++ < 40) {
      const c = ruleCard(s);
      const n = C.playCard(s, c);
      if (!n) return null;
      s = n;
    }
    return s;
  }

  function chooseCard(s, level, rng, opts) {
    const r = rng || Math.random;
    const legal = C.legalCards(s, s.turn);
    if (legal.length === 1) return legal[0];
    if (level <= 1) return legal[Math.floor(r() * legal.length)];
    if (level === 2) return ruleCard(s);
    const me = s.turn;
    const samples = (opts && opts.samples) || 20;
    const scores = legal.map(() => 0);
    for (let k = 0; k < samples; k++) {
      const w = sampleWorld(s, me, r);
      if (!w) break;
      const mine = C.team(w, me);
      legal.forEach((c, i) => {
        const n = C.playCard(w, c);
        const end = n && playOut(n);
        if (!end || !end.result) return;
        const pts = end.result.points;
        const v = (end.result.won ? 2 : -2) + (pts - 60) / 60;
        scores[i] += mine === "player" ? v : -v;
      });
    }
    let bi = 0;
    scores.forEach((v, i) => { if (v > scores[bi]) bi = i; });
    return legal[bi];
  }

  return { announceChoice, chooseCard, ruleCard, knownSide, soloRating, wenzRating, sauRating };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SchafkopfAi;
}
if (typeof window !== "undefined") {
  window.SchafkopfAi = SchafkopfAi;
}
