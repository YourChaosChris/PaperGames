// schafkopf-core.js
// Bavarian Schafkopf for four players (the long game, 32 cards, 8 each).
// Dependency-free, no DOM.
//
// Cards use { rank, suit }: suits C = Acorns (Eichel), S = Leaves/Grass
// (Gras), H = Hearts (Herz), D = Bells (Schellen); ranks 14 Sow (Ace),
// 10, 13 King, 12 Ober, 11 Unter, 9, 8, 7.
// Announcing: from the player after the dealer, each player in turn
// passes or names a game; a later player can only take over with a
// higher kind of game (Solo before Wenz before Sauspiel). If all pass,
// the cards are thrown in.
// Sauspiel (call game): Obers, Unters and Hearts are trumps; the player
// calls the Sow of Acorns, Grass or Bells - he must hold a card of that
// suit and not the Sow - and whoever holds it is his partner. Wenz: only
// the four Unters are trumps. Suit Solo: Obers, Unters and the chosen
// suit. The playing side needs 61 of the 120 points.
// Score in points: Sauspiel 10, Solo and Wenz 50, plus 10 each for
// Schneider, Schwarz and each "Laufender" (from 3, in the Wenz from 2).
// In a Sauspiel both losers pay both winners; in a Solo or Wenz the
// three others pay or get from the soloist.

const SchafkopfCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [14, 10, 13, 12, 11, 9, 8, 7];
  const POINTS = { 14: 11, 10: 10, 13: 4, 12: 3, 11: 2, 9: 0, 8: 0, 7: 0 };
  const TARIFF = { sau: 10, solo: 50, wenz: 50, extra: 10 };
  const RANK_OF_GAME = { sau: 1, wenz: 2, solo: 3 };
  const SUIT_ORDER = { C: 4, S: 3, H: 2, D: 1 };

  function newDeck() {
    const d = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => d.push({ rank, suit })));
    return d;
  }

  function shuffle(a, rng) {
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  const same = (a, b) => a.rank === b.rank && a.suit === b.suit;
  const pointsOf = (cards) => cards.reduce((t, c) => t + POINTS[c.rank], 0);

  /*** Trumps and order ***/

  function trumpSuit(game) {
    if (game.type === "sau") return "H";
    if (game.type === "solo") return game.suit;
    return null;
  }

  function isTrump(game, c) {
    if (game.type === "wenz") return c.rank === 11;
    return c.rank === 12 || c.rank === 11 || c.suit === trumpSuit(game);
  }

  function group(game, c) { return isTrump(game, c) ? "T" : c.suit; }

  const PLAIN = { 14: 8, 10: 7, 13: 6, 12: 5, 9: 3, 8: 2, 7: 1, 11: 4 };

  function strength(game, c, led) {
    if (isTrump(game, c)) {
      if (c.rank === 12 && game.type !== "wenz") return 300 + SUIT_ORDER[c.suit];
      if (c.rank === 11) return 200 + SUIT_ORDER[c.suit];
      return 100 + PLAIN[c.rank];
    }
    return c.suit === led ? PLAIN[c.rank] : 0;
  }

  // All trumps from the highest down (for the Laufende).
  function trumpLadder(game) {
    const out = [];
    if (game.type !== "wenz") ["C", "S", "H", "D"].forEach((s) => out.push({ rank: 12, suit: s }));
    ["C", "S", "H", "D"].forEach((s) => out.push({ rank: 11, suit: s }));
    if (game.type !== "wenz") [14, 10, 13, 9, 8, 7].forEach((r) => out.push({ rank: r, suit: trumpSuit(game) }));
    return out;
  }

  function trickWinner(game, trick) {
    const led = group(game, trick[0].card);
    let best = 0;
    for (let i = 1; i < trick.length; i++) if (strength(game, trick[i].card, led) > strength(game, trick[best].card, led)) best = i;
    return trick[best].player;
  }

  /*** Deal and announcing ***/

  function deal(dealer, rng) {
    const d = shuffle(newDeck(), rng);
    return {
      dealer, hands: [0, 1, 2, 3].map((i) => d.slice(i * 8, i * 8 + 8)), phase: "announce",
      announceTurn: (dealer + 1) % 4, announced: [null, null, null, null], asked: 0,
      game: null, player: -1, partner: -1, trick: [], turn: -1, tricks: [[], [], [], []], trickCount: [0, 0, 0, 0],
      lastTrick: null, played: [], calledSought: false, ranAway: false, voids: [{}, {}, {}, {}], result: null
    };
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  function gameRank(g) { return g ? RANK_OF_GAME[g.type] : 0; }

  // Can this hand call the given Sow? (not Hearts, holds a plain card of
  // that suit, does not hold the Sow)
  function canCall(hand, suit) {
    if (suit === "H") return false;
    const g = { type: "sau" };
    if (hand.some((c) => c.suit === suit && c.rank === 14)) return false;
    return hand.some((c) => c.suit === suit && !isTrump(g, c));
  }

  // The highest game announced so far: { player, game }.
  function highest(s) {
    let best = null;
    for (let k = 0; k < 4; k++) {
      const p = (s.dealer + 1 + k) % 4;
      const g = s.announced[p];
      if (g && (!best || gameRank(g) > gameRank(best.game))) best = { player: p, game: g };
    }
    return best;
  }

  // Games the player on turn may announce now: [{ type, suit }].
  function allowedGames(s) {
    const p = s.announceTurn;
    const hand = s.hands[p];
    const best = highest(s);
    const min = best ? gameRank(best.game) + 1 : 1;
    const out = [];
    if (min <= 1) ["C", "S", "D"].forEach((suit) => { if (canCall(hand, suit)) out.push({ type: "sau", suit }); });
    if (min <= 2) out.push({ type: "wenz" });
    if (min <= 3) SUITS.forEach((suit) => out.push({ type: "solo", suit }));
    return out;
  }

  // game: null = pass ("weiter"), else { type, suit }.
  function announce(s0, game) {
    if (s0.phase !== "announce") return null;
    if (game && !allowedGames(s0).some((g) => g.type === game.type && (g.suit || null) === (game.suit || null))) return null;
    const s = clone(s0);
    s.announced[s.announceTurn] = game ? { type: game.type, suit: game.suit || null } : null;
    s.asked++;
    if (s.asked < 4) { s.announceTurn = (s.announceTurn + 1) % 4; return s; }
    const best = highest(s);
    if (!best) { s.phase = "over"; s.result = { thrownIn: true, deltas: [0, 0, 0, 0] }; return s; }
    s.game = best.game;
    s.player = best.player;
    s.partner = -1;
    if (s.game.type === "sau") {
      for (let p = 0; p < 4; p++) if (s.hands[p].some((c) => c.suit === s.game.suit && c.rank === 14)) s.partner = p;
    }
    s.phase = "play";
    s.turn = (s.dealer + 1) % 4;
    return s;
  }

  /*** Play ***/

  function calledSow(s) { return s.game.type === "sau" ? { rank: 14, suit: s.game.suit } : null; }

  function legalCards(s, p) {
    if (s.phase !== "play" || s.turn !== p) return [];
    const hand = s.hands[p];
    const g = s.game;
    const sow = calledSow(s);
    const holdsSow = sow && hand.some((c) => same(c, sow));
    const restricted = holdsSow && !s.calledSought && !s.ranAway && hand.length > 1;
    if (!s.trick.length) {
      if (!restricted) return hand.slice();
      // The Sow holder may lead the called suit only with the Sow,
      // unless he has four or more cards of it (then he may run away).
      const ofSuit = hand.filter((c) => !isTrump(g, c) && c.suit === sow.suit);
      if (ofSuit.length >= 4) return hand.slice();
      return hand.filter((c) => same(c, sow) || isTrump(g, c) || c.suit !== sow.suit);
    }
    const led = group(g, s.trick[0].card);
    const follow = hand.filter((c) => group(g, c) === led);
    if (follow.length) {
      // Called suit led: the holder must play the Sow.
      if (holdsSow && led === sow.suit) return follow.filter((c) => same(c, sow));
      return follow;
    }
    // Cannot follow: any card, but the Sow may not be thrown away before
    // its suit has been led.
    if (restricted) {
      const rest = hand.filter((c) => !same(c, sow));
      if (rest.length) return rest;
    }
    return hand.slice();
  }

  function team(s, p) {
    if (s.game.type === "sau") return p === s.player || p === s.partner ? "player" : "others";
    return p === s.player ? "player" : "others";
  }

  function playCard(s0, card) {
    const p = s0.turn;
    if (!legalCards(s0, p).some((c) => same(c, card))) return null;
    const s = clone(s0);
    const g = s.game;
    const sow = calledSow(s);
    if (!s.trick.length && sow && !same(card, sow) && !isTrump(g, card) && card.suit === sow.suit) {
      if (s.hands[p].some((c) => same(c, sow))) s.ranAway = true;
    }
    if (s.trick.length) {
      const led = group(g, s.trick[0].card);
      if (group(g, card) !== led) s.voids[p][led] = true;
    } else if (sow && !isTrump(g, card) && card.suit === sow.suit) {
      s.calledSought = true;
    }
    s.hands[p] = s.hands[p].filter((c) => !same(c, card));
    s.trick.push({ player: p, card: { rank: card.rank, suit: card.suit } });
    s.played.push({ player: p, card: { rank: card.rank, suit: card.suit } });
    if (s.trick.length < 4) { s.turn = (p + 1) % 4; return s; }
    const w = trickWinner(g, s.trick);
    s.trick.forEach((e) => s.tricks[w].push(e.card));
    s.trickCount[w]++;
    s.lastTrick = { cards: s.trick, winner: w };
    s.trick = [];
    s.turn = w;
    if (s.hands.every((h) => h.length === 0)) finish(s);
    return s;
  }

  // Laufende: top trumps held by the playing side without a gap, or
  // missing from it without a gap. Counted from 3 (Wenz from 2).
  function laufende(game, sideCards) {
    const ladder = trumpLadder(game);
    const has = (c) => sideCards.some((x) => same(x, c));
    const first = has(ladder[0]);
    let n = 0;
    while (n < ladder.length && has(ladder[n]) === first) n++;
    const min = game.type === "wenz" ? 2 : 3;
    return n >= min ? n : 0;
  }

  // The score from the facts: { won, schneider, schwarz, laufende, tariff, deltas }.
  function score(game, player, partner, playerPoints, playerTricks, laufendeCount) {
    const won = playerPoints >= 61;
    const schneider = won ? playerPoints >= 91 : playerPoints <= 30;
    const schwarz = won ? playerTricks === 8 : playerTricks === 0;
    const base = game.type === "sau" ? TARIFF.sau : TARIFF[game.type];
    const tariff = base + (schneider ? TARIFF.extra : 0) + (schwarz ? TARIFF.extra : 0) + laufendeCount * TARIFF.extra;
    const deltas = [0, 0, 0, 0];
    const sign = won ? 1 : -1;
    for (let p = 0; p < 4; p++) {
      if (game.type === "sau") deltas[p] = (p === player || p === partner ? 1 : -1) * sign * tariff;
      else deltas[p] = (p === player ? 3 : -1) * sign * tariff;
    }
    return { won, schneider, schwarz, laufende: laufendeCount, tariff, deltas };
  }

  function finish(s) {
    const side = [0, 1, 2, 3].filter((p) => team(s, p) === "player");
    const pts = side.reduce((t, p) => t + pointsOf(s.tricks[p]), 0);
    const tricks = side.reduce((t, p) => t + s.trickCount[p], 0);
    // The Laufende count the cards the playing side was dealt.
    const dealt = [];
    s.played.forEach((e) => { if (side.indexOf(e.player) !== -1) dealt.push(e.card); });
    const r = score(s.game, s.player, s.partner, pts, tricks, laufende(s.game, dealt));
    s.result = Object.assign(r, { points: pts, otherPoints: 120 - pts, tricks });
    s.phase = "over";
    s.turn = -1;
  }

  function gameKey(game) {
    if (game.type === "wenz") return "wenz";
    return game.type + "-" + game.suit;
  }

  return {
    SUITS, RANKS, POINTS, TARIFF, newDeck, shuffle, same, pointsOf, trumpSuit, isTrump, group, strength, trumpLadder,
    trickWinner, deal, canCall, highest, allowedGames, announce, legalCards, team, playCard, laufende, score, gameKey, calledSow, gameRank
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SchafkopfCore;
}
if (typeof window !== "undefined") {
  window.SchafkopfCore = SchafkopfCore;
}
