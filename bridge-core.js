// bridge-core.js
// Rules engine for contract bridge - no DOM here; the page is
// bridge-app.js, the computer players bridge-ai.js.
//
// Four players, North-South against East-West; seats 0 North, 1 East,
// 2 South, 3 West (clockwise). Rules after the English Wikipedia
// ("Contract bridge", "Bridge scoring", "Chicago (bridge card game)",
// "Rubber bridge"):
//   - 52 cards, 13 each. The dealer calls first, then clockwise: a bid
//     (level 1 to 7 and a strain: clubs, diamonds, hearts, spades, no
//     trump - each bid higher than the last), pass, double (the last bid,
//     made by an opponent, not yet doubled) or redouble (the opponents
//     doubled your side's last bid). Three passes after a bid end the
//     auction; four passes at the start pass the deal out.
//   - The contract is the last bid; the declarer is the player of that
//     side who first named its strain. The player on the declarer's left
//     leads; then the declarer's partner (dummy) lays the cards face up
//     and the declarer plays them. Follow suit if you can; the highest
//     trump wins, otherwise the highest card of the suit led.
//   - Score of a deal: contract points (per trick over six: clubs and
//     diamonds 20, hearts and spades 30, no trump 40 for the first and 30
//     for each further; doubled x2, redoubled x4), overtricks, the
//     "insult" bonus for a doubled (50) or redoubled (100) contract made,
//     slams (small 500/750, grand 1000/1500 not vulnerable/vulnerable),
//     undertricks (not vulnerable 50 each; doubled 100, 200, 200, then
//     300 each; vulnerable 100 each; doubled 200, then 300 each;
//     redoubled twice the doubled), honours (four of the five trump
//     honours in one hand 100, all five or all four aces in no trump 150,
//     to the side holding them).
//   - Chicago: four deals; deal 1 nobody vulnerable, deals 2 and 3 only
//     the dealer's side, deal 4 both. Contract points add up to a game
//     (100); a game brings 300 (not vulnerable) or 500 (vulnerable). A
//     part-score on the fourth deal that does not complete a game brings
//     100. A passed-out deal is dealt again by the same dealer and does
//     not count.
//   - Rubber: a side is vulnerable once it has won a game; the first side
//     with two games wins the rubber: 700 if the other side has no game,
//     500 if it has one.
// After a game both sides start again from 0 towards the next game ("a
// new line drawn underneath all previous points", Wikipedia "Rubber
// bridge").
//
// Card: { rank 2..14 (14 = Ace), suit "C"|"D"|"H"|"S" }.
// Call: { type: "bid", level, strain } | { type: "pass" } |
//       { type: "double" } | { type: "redouble" }; strain "C"|"D"|"H"|"S"|"N".

const BridgeCore = (function () {
  const SUITS = ["C", "D", "H", "S"];
  const STRAINS = ["C", "D", "H", "S", "N"];

  function side(seat) { return seat % 2; }          // 0 = North-South, 1 = East-West
  function partner(seat) { return (seat + 2) % 4; }
  function same(a, b) { return a.rank === b.rank && a.suit === b.suit; }
  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  function newDeck() {
    const d = [];
    SUITS.forEach((suit) => { for (let r = 2; r <= 14; r++) d.push({ rank: r, suit }); });
    return d;
  }

  function shuffle(a, rng) {
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sortHand(h) {
    const order = { S: 0, H: 1, C: 2, D: 3 };
    return h.slice().sort((a, b) => order[a.suit] - order[b.suit] || b.rank - a.rank);
  }

  function hcp(hand) {
    return hand.reduce((t, c) => t + (c.rank > 10 ? c.rank - 10 : 0), 0);
  }

  function deal(opts, rng) {
    const o = opts || {};
    const deck = shuffle(newDeck(), rng);
    const hands = [0, 1, 2, 3].map((p) => sortHand(deck.slice(p * 13, p * 13 + 13)));
    return {
      dealer: o.dealer || 0,
      vul: (o.vul || [false, false]).slice(),
      hands,
      original: hands.map((h) => h.slice()),
      auction: [],
      phase: "auction",
      turn: o.dealer || 0,
      contract: null,
      declarer: null,
      dummy: null,
      trick: [],
      tricksWon: [0, 0],
      played: [],
      voids: [{}, {}, {}, {}],
      lastTrick: null,
      result: null
    };
  }

  /*** Auction ***/

  function bidValue(b) { return (b.level - 1) * 5 + STRAINS.indexOf(b.strain); }

  function lastBid(s) {
    for (let i = s.auction.length - 1; i >= 0; i--) if (s.auction[i].call.type === "bid") return s.auction[i];
    return null;
  }

  // The last call other than pass.
  function lastAction(s) {
    for (let i = s.auction.length - 1; i >= 0; i--) if (s.auction[i].call.type !== "pass") return s.auction[i];
    return null;
  }

  function legalCall(s, call) {
    if (s.phase !== "auction") return false;
    const seat = s.turn;
    if (call.type === "pass") return true;
    if (call.type === "bid") {
      if (!(call.level >= 1 && call.level <= 7) || STRAINS.indexOf(call.strain) === -1) return false;
      const lb = lastBid(s);
      return !lb || bidValue(call) > bidValue(lb.call);
    }
    const la = lastAction(s);
    if (!la) return false;
    if (call.type === "double") return la.call.type === "bid" && side(la.seat) !== side(seat);
    if (call.type === "redouble") return la.call.type === "double" && side(la.seat) !== side(seat);
    return false;
  }

  function legalCalls(s) {
    const out = [{ type: "pass" }];
    if (legalCall(s, { type: "double" })) out.push({ type: "double" });
    if (legalCall(s, { type: "redouble" })) out.push({ type: "redouble" });
    for (let level = 1; level <= 7; level++) STRAINS.forEach((strain) => {
      const b = { type: "bid", level, strain };
      if (legalCall(s, b)) out.push(b);
    });
    return out;
  }

  function auctionOver(s) {
    const a = s.auction;
    if (a.length >= 4 && a.every((x) => x.call.type === "pass")) return "passed";
    if (a.length >= 4 && lastBid(s) && a.slice(-3).every((x) => x.call.type === "pass")) return "contract";
    return null;
  }

  function makeContract(s) {
    const lb = lastBid(s);
    const decSide = side(lb.seat);
    let doubled = 0;
    const la = lastAction(s);
    if (la.call.type === "double") doubled = 1;
    if (la.call.type === "redouble") doubled = 2;
    const first = s.auction.find((x) => x.call.type === "bid" && x.call.strain === lb.call.strain && side(x.seat) === decSide);
    s.contract = { level: lb.call.level, strain: lb.call.strain, doubled };
    s.declarer = first.seat;
    s.dummy = partner(first.seat);
    s.phase = "play";
    s.turn = (first.seat + 1) % 4;
    s.leader = s.turn;
  }

  function applyCall(state, call) {
    if (!legalCall(state, call)) return null;
    const s = clone(state);
    s.auction.push({ seat: s.turn, call: Object.assign({}, call) });
    const end = auctionOver(s);
    if (end === "passed") { s.phase = "over"; s.result = { passedOut: true }; return s; }
    if (end === "contract") { makeContract(s); return s; }
    s.turn = (s.turn + 1) % 4;
    return s;
  }

  /*** Play ***/

  function trumpOf(s) { return s.contract && s.contract.strain !== "N" ? s.contract.strain : null; }

  function trickWinner(trump, trick) {
    let best = trick[0];
    trick.forEach((e) => {
      const c = e.card, b = best.card;
      if (c.suit === b.suit) { if (c.rank > b.rank) best = e; }
      else if (trump && c.suit === trump) best = e;
    });
    return best.seat;
  }

  function legalCards(s, seat) {
    const hand = s.hands[seat];
    if (!s.trick.length) return hand.slice();
    const led = s.trick[0].card.suit;
    const follow = hand.filter((c) => c.suit === led);
    return follow.length ? follow : hand.slice();
  }

  // Who chooses the card for `seat`: the declarer plays the dummy's cards.
  function controller(s, seat) { return seat === s.dummy ? s.declarer : seat; }

  function playCard(state, card) {
    if (state.phase !== "play") return null;
    const seat = state.turn;
    if (!legalCards(state, seat).some((c) => same(c, card))) return null;
    const s = clone(state);
    s.hands[seat] = s.hands[seat].filter((c) => !same(c, card));
    if (s.trick.length && card.suit !== s.trick[0].card.suit) s.voids[seat][s.trick[0].card.suit] = true;
    s.trick.push({ seat, card: { rank: card.rank, suit: card.suit } });
    s.played.push({ seat, card: { rank: card.rank, suit: card.suit } });
    if (s.trick.length < 4) { s.turn = (seat + 1) % 4; return s; }
    const w = trickWinner(trumpOf(s), s.trick);
    s.tricksWon[side(w)]++;
    s.lastTrick = { cards: s.trick, winner: w };
    s.trick = [];
    s.turn = w;
    s.leader = w;
    if (s.played.length === 52) finish(s);
    return s;
  }

  function finish(s) {
    s.phase = "over";
    const decSide = side(s.declarer);
    const tricks = s.tricksWon[decSide];
    const sc = dealScore(s.contract, s.vul[decSide], tricks);
    s.result = { declarer: s.declarer, contract: s.contract, tricks, score: sc, honours: honours(s.original, s.contract) };
  }

  /*** Scoring ***/

  function contractPoints(contract) {
    const { level, strain, doubled } = contract;
    let base;
    if (strain === "N") base = 40 + 30 * (level - 1);
    else if (strain === "H" || strain === "S") base = 30 * level;
    else base = 20 * level;
    return base * (doubled === 2 ? 4 : doubled === 1 ? 2 : 1);
  }

  function undertrickPenalty(down, vul, doubled) {
    if (!doubled) return down * (vul ? 100 : 50);
    let t = 0;
    for (let i = 1; i <= down; i++) {
      if (vul) t += i === 1 ? 200 : 300;
      else t += i === 1 ? 100 : i <= 3 ? 200 : 300;
    }
    return doubled === 2 ? t * 2 : t;
  }

  // The score of one deal without game/part-score/rubber bonuses (those
  // depend on the match). Returns contract points ("below the line") and
  // the other points for the declaring side, or the penalty for the
  // defenders.
  function dealScore(contract, vul, tricks) {
    const need = contract.level + 6;
    if (tricks >= need) {
      const over = tricks - need;
      let overPts;
      if (!contract.doubled) overPts = over * (contract.strain === "C" || contract.strain === "D" ? 20 : 30);
      else overPts = over * (vul ? 200 : 100) * (contract.doubled === 2 ? 2 : 1);
      const insult = contract.doubled === 2 ? 100 : contract.doubled === 1 ? 50 : 0;
      let slam = 0;
      if (contract.level === 6) slam = vul ? 750 : 500;
      if (contract.level === 7) slam = vul ? 1500 : 1000;
      return { made: true, over, below: contractPoints(contract), overtricks: overPts, insult, slam, penalty: 0 };
    }
    const down = need - tricks;
    return { made: false, down, below: 0, overtricks: 0, insult: 0, slam: 0, penalty: undertrickPenalty(down, vul, contract.doubled) };
  }

  // Honours held in one hand: { side, points } or null.
  function honours(hands, contract) {
    if (!contract) return null;
    for (let p = 0; p < 4; p++) {
      const h = hands[p];
      if (contract.strain === "N") {
        if (h.filter((c) => c.rank === 14).length === 4) return { seat: p, side: side(p), points: 150 };
      } else {
        const n = h.filter((c) => c.suit === contract.strain && c.rank >= 10).length;
        if (n === 5) return { seat: p, side: side(p), points: 150 };
        if (n === 4) return { seat: p, side: side(p), points: 100 };
      }
    }
    return null;
  }

  /*** Match: Chicago or rubber ***/

  function newMatch(type, firstDealer) {
    return { type: type === "rubber" ? "rubber" : "chicago", deal: 0, dealer: firstDealer || 0, totals: [0, 0], below: [0, 0], games: [0, 0], log: [], over: false, winner: null };
  }

  function vulnerability(m) {
    if (m.type === "rubber") return [m.games[0] > 0, m.games[1] > 0];
    const k = m.deal % 4;
    if (k === 0) return [false, false];
    if (k === 3) return [true, true];
    const v = [false, false];
    v[side(m.dealer)] = true;
    return v;
  }

  // Adds a finished deal to the match. Returns { match, entry }.
  function scoreDeal(match, s) {
    const m = clone(match);
    const vul = vulnerability(m);
    const entry = { deal: m.deal + 1, dealer: m.dealer, vul, points: [0, 0], parts: [] };
    if (s.result.passedOut) {
      entry.passedOut = true;
      m.log.push(entry);
      return { match: m, entry };  // same dealer again, the deal does not count
    }
    const decSide = side(s.declarer), def = 1 - decSide;
    const sc = s.result.score;
    entry.contract = s.contract;
    entry.declarer = s.declarer;
    entry.tricks = s.result.tricks;
    const add = (sd, label, v) => { if (v) { entry.points[sd] += v; entry.parts.push({ side: sd, label, value: v }); } };
    if (sc.made) {
      add(decSide, "contract", sc.below);
      add(decSide, "overtricks", sc.overtricks);
      add(decSide, "insult", sc.insult);
      add(decSide, "slam", sc.slam);
      const total = m.below[decSide] + sc.below;
      if (total >= 100) {
        if (m.type === "chicago") add(decSide, "game", vul[decSide] ? 500 : 300);
        m.games[decSide]++;
        m.below = [0, 0];
        entry.game = decSide;
      } else {
        m.below[decSide] = total;
        if (m.type === "chicago" && m.deal % 4 === 3) add(decSide, "partscore", 100);
      }
    } else {
      add(def, "undertricks", sc.penalty);
    }
    const hon = s.result.honours;
    if (hon) add(hon.side, "honours", hon.points);
    if (m.type === "rubber" && m.games[decSide] === 2 && entry.game === decSide) {
      add(decSide, "rubber", m.games[def] === 0 ? 700 : 500);
      m.over = true;
    }
    m.totals[0] += entry.points[0];
    m.totals[1] += entry.points[1];
    m.log.push(entry);
    m.deal++;
    m.dealer = (m.dealer + 1) % 4;
    if (m.type === "chicago" && m.deal === 4) m.over = true;
    if (m.over) m.winner = m.totals[0] > m.totals[1] ? 0 : m.totals[1] > m.totals[0] ? 1 : -1;
    return { match: m, entry };
  }

  function dealFor(match, rng) {
    return deal({ dealer: match.dealer, vul: vulnerability(match) }, rng);
  }

  return {
    SUITS, STRAINS, side, partner, same, clone, newDeck, shuffle, sortHand, hcp, deal, bidValue, lastBid, lastAction,
    legalCall, legalCalls, auctionOver, applyCall, trumpOf, trickWinner, legalCards, controller, playCard,
    contractPoints, undertrickPenalty, dealScore, honours, newMatch, vulnerability, scoreDeal, dealFor
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BridgeCore;
}
if (typeof window !== "undefined") {
  window.BridgeCore = BridgeCore;
}
