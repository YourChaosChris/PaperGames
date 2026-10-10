// bridge-ai.js
// Computer players for bridge (bridge-core.js): bidding and card play.
//
// Bidding follows a simple, common natural system (Standard American with
// five-card majors, explained on the rules page): open with 12 or more
// high-card points (A 4, K 3, Q 2, J 1) - 1NT with 15-17 balanced, 2NT
// with 20-21 balanced, otherwise one of the longer major with five cards,
// else one of the better minor; weak two (6-card suit, 6-10 points) and
// three-level preempts (7 cards). Responses: raise partner's major with
// three-card support (6-9 to two, 10-12 to three, 13+ to game), a new
// suit, or no trump by strength. Over an opening by the opponents:
// overcall with a five-card suit, 1NT with 15-18 balanced, or a takeout
// double. After that each player adds what partner has shown (a range of
// points and suit lengths) to the own hand and bids the contract the two
// hands are worth: game with about 26 points together, small slam with
// 33, grand slam with 37; in a suit with eight trumps together, else in
// no trump. Penalty doubles when the side has clearly more points and the
// opponents are high.
//
// Easy bids only the openings and simple raises and plays any allowed
// card. Medium plays by rules of thumb (second hand low, third hand high,
// win cheaply, ruff when partner is not winning, declarer draws trumps,
// lead back partner's suit). Hard deals the unseen cards at random many
// times - keeping to what is known, such as suits a player could not
// follow - and plays each candidate card out with the Medium rules (a
// simple double-dummy estimate); it bids like Medium but checks game and
// slam with such an estimate on a few dealt hands for partner. No computer
// looks at cards it could not see: only its own hand, the dummy once it
// is down, and the cards played.

const BridgeAi = (function () {
  const B = (typeof BridgeCore !== "undefined") ? BridgeCore : require("./bridge-core.js");
  const STR = B.STRAINS;

  /*** Hand evaluation ***/

  function lengths(hand) {
    const L = { C: 0, D: 0, H: 0, S: 0 };
    hand.forEach((c) => { L[c.suit]++; });
    return L;
  }

  // No void, no singleton, at most one doubleton.
  function balanced(L) {
    const v = [L.C, L.D, L.H, L.S].sort((a, b) => a - b);
    return v[0] >= 2 && v[1] >= 3;
  }

  function shortness(L, trump) {
    let p = 0;
    ["C", "D", "H", "S"].forEach((s) => { if (s !== trump) p += L[s] === 0 ? 3 : L[s] === 1 ? 2 : L[s] === 2 ? 1 : 0; });
    return p;
  }

  function stopper(hand, suit) {
    const cs = hand.filter((c) => c.suit === suit);
    return cs.some((c) => c.rank === 14) || (cs.some((c) => c.rank === 13) && cs.length >= 2) || (cs.some((c) => c.rank === 12) && cs.length >= 3);
  }

  /*** What partner has shown ***/

  // { min, max, len: {C,D,H,S} (minimum lengths), bal } for seat p.
  function shown(s, p) {
    const info = { min: 0, max: 37, len: { C: 0, D: 0, H: 0, S: 0 }, bal: false };
    const calls = s.auction.map((x, i) => Object.assign({ i }, x));
    const mine = calls.filter((x) => x.seat === p);
    if (!mine.length) return info;
    const pp = B.partner(p);
    let first = true;
    mine.forEach((x) => {
      const before = calls.slice(0, x.i);
      const bidsBefore = before.filter((y) => y.call.type === "bid");
      const partnerBid = bidsBefore.filter((y) => y.seat === pp);
      const oppBid = bidsBefore.filter((y) => B.side(y.seat) !== B.side(p));
      const c = x.call;
      if (c.type === "pass") {
        if (first && !bidsBefore.length) info.max = Math.min(info.max, 11);
        else if (first && partnerBid.length && !oppBid.length) info.max = Math.min(info.max, 5);
        first = false;
        return;
      }
      if (c.type === "double") {
        if (first && oppBid.length && !partnerBid.length) { info.min = Math.max(info.min, 12); }
        first = false;
        return;
      }
      if (c.type !== "bid") { first = false; return; }
      const nt = c.strain === "N";
      if (first && !bidsBefore.length) {
        // Opening.
        if (nt && c.level === 1) Object.assign(info, { min: 15, max: 17, bal: true });
        else if (nt && c.level === 2) Object.assign(info, { min: 20, max: 21, bal: true });
        else if (c.level === 1) { info.min = 12; info.max = 21; info.len[c.strain] = c.strain === "H" || c.strain === "S" ? 5 : 3; }
        else if (c.level === 2) { info.min = 6; info.max = 10; info.len[c.strain] = 6; }
        else { info.min = 5; info.max = 10; info.len[c.strain] = 7; }
      } else if (first && partnerBid.length && !oppBid.length) {
        // Response to partner's opening.
        const pb = partnerBid[0].call;
        if (!nt && c.strain === pb.strain) {
          const jump = c.level - pb.level;
          info.len[c.strain] = c.strain === "H" || c.strain === "S" ? 3 : 4;
          if (jump <= 1) { info.min = 6; info.max = 9; }
          else if (jump === 2) { info.min = 10; info.max = 12; }
          else { info.min = 13; info.max = 17; }
        } else if (nt) {
          info.bal = true;
          if (c.level === 1) { info.min = 6; info.max = 10; }
          else if (c.level === 2) { info.min = pb.strain === "N" ? 8 : 11; info.max = pb.strain === "N" ? 9 : 12; }
          else { info.min = pb.strain === "N" ? 10 : 13; info.max = 15; }
        } else {
          info.len[c.strain] = 4;
          info.min = c.level >= 2 ? 10 : 6;
          info.max = 17;
          if (pb.strain === "N") { info.len[c.strain] = 5; info.min = c.level >= 4 ? 10 : c.level === 3 ? 10 : 0; info.max = c.level === 2 ? 7 : 15; }
        }
      } else if (first && oppBid.length && !partnerBid.length) {
        // Overcall.
        if (nt) Object.assign(info, { min: 15, max: 18, bal: true });
        else { info.len[c.strain] = 5; info.min = c.level >= 2 ? 11 : 8; info.max = 16; }
      } else if (!nt) {
        info.len[c.strain] = Math.max(info.len[c.strain], 4);
        info.min = Math.min(info.max, info.min + 2);
      } else {
        info.min = Math.min(info.max, info.min + 1);
      }
      first = false;
    });
    return info;
  }

  /*** Choosing the contract ***/

  function cheapest(s, strain) {
    const lb = B.lastBid(s);
    for (let level = 1; level <= 7; level++) {
      const b = { type: "bid", level, strain };
      if (!lb || B.bidValue(b) > B.bidValue(lb.call)) return b;
    }
    return null;
  }

  function bidOrPass(s, b) {
    return b && B.legalCall(s, b) ? b : { type: "pass" };
  }

  function openingCall(hand, level) {
    const H = B.hcp(hand), L = lengths(hand), bal = balanced(L);
    if (level <= 1) {
      if (H < 13) return { type: "pass" };
      const best = ["S", "H", "D", "C"].sort((a, b) => L[b] - L[a])[0];
      return { type: "bid", level: 1, strain: best };
    }
    if (bal && H >= 15 && H <= 17) return { type: "bid", level: 1, strain: "N" };
    if (bal && H >= 20 && H <= 21) return { type: "bid", level: 2, strain: "N" };
    const long = ["S", "H", "D", "C"].sort((a, b) => L[b] - L[a])[0];
    if (H >= 12 || (H >= 11 && L[long] >= 6)) {
      if (L.S >= 5 && L.S >= L.H) return { type: "bid", level: 1, strain: "S" };
      if (L.H >= 5) return { type: "bid", level: 1, strain: "H" };
      if (L.D > L.C || (L.D === L.C && L.D >= 4)) return { type: "bid", level: 1, strain: "D" };
      return { type: "bid", level: 1, strain: "C" };
    }
    if (H >= 5 && H <= 10 && L[long] >= 7) return { type: "bid", level: 3, strain: long };
    if (H >= 6 && H <= 10 && L[long] === 6 && long !== "C") return { type: "bid", level: 2, strain: long };
    return { type: "pass" };
  }

  // The contract the two hands are worth: { level, strain } or null.
  function target(hand, info, s, level) {
    const H = B.hcp(hand), L = lengths(hand);
    const mid = Math.round((info.min + Math.min(info.max, info.min + 6)) / 2);
    let best = null;
    ["S", "H", "D", "C"].forEach((x) => {
      const fit = L[x] + info.len[x];
      if (fit >= 8 && (!best || fit > best.fit || (fit === best.fit && (x === "S" || x === "H")))) best = { strain: x, fit };
    });
    const strain = best ? best.strain : "N";
    const pts = H + mid + (best ? Math.min(shortness(L, strain), 3) : 0);
    let lvl;
    if (pts >= 37) lvl = 7;
    else if (pts >= 33) lvl = 6;
    else if (pts >= 26 || (strain === "N" && pts >= 25)) lvl = strain === "N" ? 3 : (strain === "S" || strain === "H") ? 4 : (pts >= 29 ? 5 : 3);
    else lvl = 0;
    let st = strain;
    if (lvl === 3 && (strain === "C" || strain === "D")) st = "N";
    if (lvl === 0) {
      // Part-score: the fit at the cheapest level, if the side has the
      // majority of points.
      if (pts < 20) return null;
      const b = cheapest(s, strain);
      if (!b || b.level > (pts >= 23 ? 3 : 2)) return null;
      return { level: b.level, strain };
    }
    if (level >= 3 && lvl >= 4 && lvl <= 6) lvl = hardCheck(hand, info, s, st, lvl);
    return lvl ? { level: lvl, strain: st } : null;
  }

  // Hard: deal partner's hand a few times to fit what partner has shown
  // and play it out quickly; step the level down when the tricks are not
  // there, or up to a slam when they are.
  function hardCheck(hand, info, s, strain, lvl) {
    const me = s.turn, pp = B.partner(me);
    const others = B.newDeck().filter((c) => !hand.some((h) => B.same(h, c)));
    let total = 0, n = 0;
    const r = mulberry(hand.reduce((t, c) => t * 31 + c.rank * 4 + "CDHS".indexOf(c.suit), 7) >>> 0);
    for (let k = 0; k < 60 && n < 8; k++) {
      B.shuffle(others, r);
      const ph = others.slice(0, 13), H = B.hcp(ph), L = lengths(ph);
      if (H < info.min || H > info.max) continue;
      if (["C", "D", "H", "S"].some((x) => L[x] < info.len[x])) continue;
      const rest = others.slice(13);
      const hands = [];
      hands[me] = hand; hands[pp] = ph;
      hands[(me + 1) % 4] = rest.slice(0, 13); hands[(me + 3) % 4] = rest.slice(13, 26);
      total += quickTricks(hands, me, strain);
      n++;
    }
    if (!n) return lvl;
    const avg = total / n;
    if (avg >= 12.5 && lvl < 6) return 6;
    if (avg < 10.5 && lvl === 4) return 3;
    if (avg < 11.3 && lvl === 6) return strain === "C" || strain === "D" ? 5 : strain === "N" ? 3 : 4;
    return lvl;
  }

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Plays a deal out with the Medium rules, all hands open; returns the
  // tricks of the declarer's side.
  function quickTricks(hands, declarer, strain) {
    let s = B.deal({ dealer: declarer });
    s.hands = hands.map((h) => B.sortHand(h));
    s.original = s.hands.map((h) => h.slice());
    s.phase = "play";
    s.contract = { level: 1, strain, doubled: 0 };
    s.declarer = declarer;
    s.dummy = B.partner(declarer);
    s.turn = (declarer + 1) % 4;
    s.leader = s.turn;
    let guard = 0;
    while (s.phase === "play" && guard++ < 60) {
      const n = B.playCard(s, ruleCard(s));
      if (!n) break;
      s = n;
    }
    return s.tricksWon[B.side(declarer)];
  }

  function chooseCall(s, level, rng) {
    const r = rng || Math.random;
    const me = s.turn, pp = B.partner(me);
    const hand = s.hands[me];
    const H = B.hcp(hand), L = lengths(hand), bal = balanced(L);
    const bids = s.auction.filter((x) => x.call.type === "bid");
    const lb = B.lastBid(s), la = B.lastAction(s);
    const ours = (x) => B.side(x.seat) === B.side(me);
    const partnerCalls = s.auction.filter((x) => x.seat === pp && x.call.type !== "pass");
    const myCalls = s.auction.filter((x) => x.seat === me && x.call.type !== "pass");
    const oppBids = bids.filter((x) => !ours(x));
    const ourBids = bids.filter(ours);

    // Opening.
    if (!bids.length) return openingCall(hand, level);
    if (level <= 1) {
      // Easy: raise partner's suit with support and points, else pass.
      if (partnerCalls.length && lb && ours(lb) && lb.call.strain !== "N" && L[lb.call.strain] >= 3 && H >= 8 && lb.call.level < 3 && r() < 0.8) return bidOrPass(s, cheapest(s, lb.call.strain));
      if (!ourBids.length && oppBids.length && H >= 13) {
        const long = ["S", "H", "D", "C"].sort((a, b) => L[b] - L[a])[0];
        if (L[long] >= 5) return bidOrPass(s, cheapest(s, long));
      }
      return { type: "pass" };
    }

    const info = shown(s, pp);
    // Redouble with clearly more points after the opponents doubled.
    if (la && la.call.type === "redouble") return { type: "pass" };
    if (la && la.call.type === "double" && !ours(la) && lb && ours(lb)) {
      if (H + info.min >= 25 && B.legalCall(s, { type: "redouble" })) return { type: "redouble" };
    }

    // First call of the side over an opening by the opponents.
    if (!ourBids.length && !partnerCalls.length && !myCalls.length && oppBids.length) {
      const opp = oppBids[0].call;
      if (oppBids.length === 1 && opp.level === 1) {
        if (bal && H >= 15 && H <= 18 && opp.strain !== "N" && stopper(hand, opp.strain)) return bidOrPass(s, { type: "bid", level: 1, strain: "N" });
        const long = ["S", "H", "D", "C"].filter((x) => x !== opp.strain).sort((a, b) => L[b] - L[a])[0];
        const b = cheapest(s, long);
        if (L[long] >= 5 && b && ((b.level === 1 && H >= 8) || (b.level === 2 && H >= 11)) && H <= 16) return b;
        const others = ["C", "D", "H", "S"].filter((x) => x !== opp.strain);
        if (opp.strain !== "N" && H >= 12 && L[opp.strain] <= 2 && others.every((x) => L[x] >= 3)) return { type: "double" };
        if (H >= 17 && B.legalCall(s, { type: "double" })) return { type: "double" };
      }
      return penaltyOrPass(s, hand, info);
    }

    // Partner made a takeout double, we have not bid: name the best unbid suit.
    const pDouble = s.auction.find((x) => x.seat === pp && x.call.type === "double");
    if (pDouble && !myCalls.length && lb && !ours(lb)) {
      const unbid = ["S", "H", "D", "C"].filter((x) => !oppBids.some((o) => o.call.strain === x));
      const best = unbid.sort((a, b) => L[b] - L[a] || (b === "S" || b === "H" ? 1 : 0) - (a === "S" || a === "H" ? 1 : 0))[0];
      if (H >= 9 && bal && oppBids.every((o) => o.call.strain === "N" || stopper(hand, o.call.strain))) {
        const nt = cheapest(s, "N");
        if (nt && nt.level <= 2) return nt;
      }
      let b = cheapest(s, best);
      if (b && H >= 10 && b.level < 4) b = { type: "bid", level: b.level + 1, strain: best };
      if (b && b.level <= 3) return b;
      return { type: "pass" };
    }

    // Responding to partner's opening when the opponents are silent.
    if (partnerCalls.length === 1 && !myCalls.length && !oppBids.length && bids.length === 1) {
      const pb = bids[0].call;
      return bidOrPass(s, response(hand, pb, s));
    }

    // Later: bid the contract the hands are worth, or stop.
    const t = target(hand, info, s, level);
    if (t) {
      const want = { type: "bid", level: t.level, strain: t.strain };
      if (lb && ours(lb) && lb.call.strain === t.strain && lb.call.level >= t.level) return { type: "pass" };
      if (B.legalCall(s, want)) return want;
      // Already higher: compete one more in the fit only if it is ours.
      if (lb && !ours(lb) && t.strain !== "N") {
        const b = cheapest(s, t.strain);
        if (b && b.level <= Math.max(t.level, 2) && B.legalCall(s, b)) return b;
      }
    }
    // Opener's natural rebid when partner made a forcing new-suit response.
    if (myCalls.length === 1 && partnerCalls.length === 1 && lb && lb.seat === pp && lb.call.strain !== "N" && !oppBids.length) {
      const pStrain = lb.call.strain;
      if (L[pStrain] >= 4) return bidOrPass(s, cheapest(s, pStrain));
      const mine = myCalls[0].call;
      if (mine.strain !== "N" && L[mine.strain] >= 6) return bidOrPass(s, cheapest(s, mine.strain));
      if (bal) return bidOrPass(s, cheapest(s, "N"));
      const other = ["S", "H", "D", "C"].filter((x) => x !== mine.strain && x !== pStrain && L[x] >= 4)[0];
      if (other) { const b = cheapest(s, other); if (b && b.level <= 2) return b; }
      return bidOrPass(s, cheapest(s, mine.strain === "N" ? pStrain : mine.strain));
    }
    return penaltyOrPass(s, hand, info);
  }

  function response(hand, pb, s) {
    const H = B.hcp(hand), L = lengths(hand), bal = balanced(L);
    const major = (x) => x === "H" || x === "S";
    if (pb.strain === "N") {
      if (pb.level === 1) {
        const m = L.S >= L.H ? "S" : "H";
        if (H <= 7) return L[m] >= 5 ? { type: "bid", level: 2, strain: m } : { type: "pass" };
        if (H <= 9) return { type: "bid", level: 2, strain: "N" };
        if (H <= 15) return L[m] >= 6 ? { type: "bid", level: 4, strain: m } : L[m] === 5 ? { type: "bid", level: 3, strain: m } : { type: "bid", level: 3, strain: "N" };
        if (H <= 17) return { type: "bid", level: 4, strain: "N" };
        return { type: "bid", level: 6, strain: "N" };
      }
      if (pb.level === 2) {
        if (H <= 3) return { type: "pass" };
        if (H >= 12) return { type: "bid", level: 6, strain: "N" };
        const m = L.S >= L.H ? "S" : "H";
        return L[m] >= 6 ? { type: "bid", level: 4, strain: m } : { type: "bid", level: 3, strain: "N" };
      }
      return { type: "pass" };
    }
    if (pb.level >= 2) {
      // Weak two or preempt: game only with a lot.
      if (L[pb.strain] >= 3 && H >= 16) return major(pb.strain) ? { type: "bid", level: 4, strain: pb.strain } : (bal ? { type: "bid", level: 3, strain: "N" } : { type: "bid", level: 5, strain: pb.strain });
      if (L[pb.strain] >= 3 && H >= 10 && pb.level === 2) return { type: "bid", level: 3, strain: pb.strain };
      return { type: "pass" };
    }
    if (H < 6) return { type: "pass" };
    const sup = L[pb.strain];
    if (major(pb.strain) && sup >= 3) {
      const pts = H + Math.min(shortness(L, pb.strain), 3);
      if (pts >= 21) return { type: "bid", level: 6, strain: pb.strain };
      if (pts >= 13) return { type: "bid", level: 4, strain: pb.strain };
      if (pts >= 10) return { type: "bid", level: 3, strain: pb.strain };
      return { type: "bid", level: 2, strain: pb.strain };
    }
    // A four-card major at the one level, hearts first.
    for (const m of ["H", "S"]) {
      if (L[m] >= 4 && STR.indexOf(m) > STR.indexOf(pb.strain)) return { type: "bid", level: 1, strain: m };
    }
    if (!major(pb.strain) && sup >= (pb.strain === "C" ? 5 : 4) && !bal) {
      if (H <= 9) return { type: "bid", level: 2, strain: pb.strain };
      if (H <= 12) return { type: "bid", level: 3, strain: pb.strain };
    }
    if (H >= 10) {
      const long = ["S", "H", "D", "C"].filter((x) => x !== pb.strain).sort((a, b) => L[b] - L[a])[0];
      if (L[long] >= (major(long) ? 5 : 4) && !bal) {
        const b = cheapest(s, long);
        if (b && b.level <= 2) return b;
      }
    }
    if (H >= 13 && H <= 15 && bal) return { type: "bid", level: 3, strain: "N" };
    if (H >= 11 && H <= 12 && bal) return { type: "bid", level: 2, strain: "N" };
    return { type: "bid", level: 1, strain: "N" };
  }

  // Double the opponents when the side has clearly more and they are high.
  function penaltyOrPass(s, hand, info) {
    const lb = B.lastBid(s);
    if (!lb || B.side(lb.seat) === B.side(s.turn) || !B.legalCall(s, { type: "double" })) return { type: "pass" };
    const H = B.hcp(hand);
    const L = lengths(hand);
    const trumps = lb.call.strain === "N" ? 0 : L[lb.call.strain];
    const ours = H + info.min;
    const lv = lb.call.level;
    if ((lv >= 3 && ours >= 24) || (lv >= 2 && ours >= 23 && trumps >= 4) || (lv >= 5 && ours >= 20)) return { type: "double" };
    return { type: "pass" };
  }

  /*** Card play ***/

  function highestLeft(s, card, viewerCards) {
    // Is `card` the highest card of its suit still out (cards already
    // played and the viewer's own cards don't count)?
    const gone = s.played.map((e) => e.card).concat(viewerCards || []);
    for (let r = card.rank + 1; r <= 14; r++) {
      if (!gone.some((c) => c.suit === card.suit && c.rank === r)) return false;
    }
    return true;
  }

  function lowest(cards) { return cards.slice().sort((a, b) => a.rank - b.rank)[0]; }
  function highest(cards) { return cards.slice().sort((a, b) => b.rank - a.rank)[0]; }

  function ruleCard(s) {
    const seat = s.turn;
    const legal = B.legalCards(s, seat);
    if (legal.length === 1) return legal[0];
    const trump = B.trumpOf(s);
    const decSide = B.side(s.declarer);
    const mySide = B.side(seat);
    const declaring = mySide === decSide;
    const dummyDown = s.played.length > 0;
    const myCards = s.hands[seat].concat(dummyDown && declaring ? s.hands[B.partner(seat)] : []);
    if (!s.trick.length) {
      // Leading.
      if (!s.played.length) return openingLead(s, seat, legal);
      if (declaring && trump) {
        const ourTrumps = s.hands[seat].concat(s.hands[B.partner(seat)]).filter((c) => c.suit === trump).length;
        const gone = s.played.filter((e) => e.card.suit === trump).length;
        const outstanding = 13 - gone - ourTrumps;
        const mine = legal.filter((c) => c.suit === trump);
        if (outstanding > 0 && ourTrumps >= 7 && mine.length) {
          const top = highest(mine);
          return highestLeft(s, top, myCards) ? top : lowest(mine);
        }
      }
      if (!declaring) {
        const pLead = s.played.find((e) => e.seat === B.partner(seat) && s.played.indexOf(e) % 4 === 0);
        if (pLead) {
          const back = legal.filter((c) => c.suit === pLead.card.suit);
          if (back.length) return back.length <= 2 ? highest(back) : lowest(back);
        }
      }
      const winners = legal.filter((c) => highestLeft(s, c, myCards) && (c.suit !== trump || declaring));
      if (winners.length) return winners[0];
      const side = legal.filter((c) => c.suit !== trump);
      const pool = side.length ? side : legal;
      const L = lengths(pool);
      const long = ["S", "H", "D", "C"].filter((x) => L[x]).sort((a, b) => L[b] - L[a])[0];
      return lowest(pool.filter((c) => c.suit === long));
    }
    const led = s.trick[0].card.suit;
    const w = B.trickWinner(trump, s.trick);
    const winCard = s.trick.find((e) => e.seat === w).card;
    const partnerWins = B.side(w) === mySide;
    const pos = s.trick.length; // 1 = second hand, 2 = third, 3 = fourth
    const beats = (c) => B.trickWinner(trump, s.trick.concat([{ seat, card: c }])) === seat;
    const following = legal[0].suit === led;
    if (partnerWins && (pos === 3 || highestLeft(s, winCard, myCards))) return lowest(following ? legal : discardPool(legal, trump));
    const winning = legal.filter(beats);
    if (following) {
      if (!winning.length) return lowest(legal);
      if (pos === 3) return lowest(winning);
      if (pos === 1) {
        const sure = winning.filter((c) => highestLeft(s, c, myCards));
        return sure.length && (winCard.rank >= 11 || s.trick[0].card.rank >= 10) ? lowest(sure) : lowest(legal);
      }
      const top = highest(winning);
      const cheapest = lowest(winning);
      return highestLeft(s, cheapest, myCards) ? cheapest : top;
    }
    // Void in the suit led.
    if (winning.length && trump && !partnerWins) return lowest(winning);
    return lowest(discardPool(legal, trump));
  }

  function discardPool(legal, trump) {
    const side = legal.filter((c) => c.suit !== trump);
    if (!side.length) return legal;
    const L = lengths(side);
    // Throw from the longest side suit (keeps short-suit honours guarded less, but simple).
    const suit = ["S", "H", "D", "C"].filter((x) => L[x]).sort((a, b) => L[b] - L[a])[0];
    return side.filter((c) => c.suit === suit);
  }

  function openingLead(s, seat, legal) {
    const trump = B.trumpOf(s);
    const pp = B.partner(seat);
    const pBid = s.auction.filter((x) => x.seat === pp && x.call.type === "bid" && x.call.strain !== "N").map((x) => x.call.strain);
    for (const st of pBid) {
      const cs = legal.filter((c) => c.suit === st);
      if (cs.length) return cs.length <= 2 ? highest(cs) : lowest(cs);
    }
    const bySuit = {};
    legal.forEach((c) => { (bySuit[c.suit] = bySuit[c.suit] || []).push(c); });
    const suits = Object.keys(bySuit).filter((x) => x !== trump || Object.keys(bySuit).length === 1);
    // Top of a sequence (A-K, K-Q, Q-J, J-10).
    for (const st of suits) {
      const cs = bySuit[st].slice().sort((a, b) => b.rank - a.rank);
      if (cs.length >= 2 && cs[0].rank >= 10 && cs[0].rank - cs[1].rank === 1) return cs[0];
    }
    if (trump) {
      const single = suits.filter((st) => bySuit[st].length === 1 && bySuit[st][0].rank < 14 && (bySuit[trump] || []).length >= 2);
      if (single.length) return bySuit[single[0]][0];
    }
    const long = suits.sort((a, b) => bySuit[b].length - bySuit[a].length)[0];
    const cs = bySuit[long].slice().sort((a, b) => b.rank - a.rank);
    return cs.length >= 4 ? cs[3] : cs[cs.length - 1];
  }

  /*** Hard: sampling ***/

  function viewerOf(s) { return B.controller(s, s.turn); }

  function sampleWorld(s, viewer, r) {
    const dummyDown = s.played.length > 0;
    const known = new Set([viewer]);
    if (dummyDown) known.add(s.dummy);
    if (viewer === s.dummy) known.add(s.declarer);
    const hidden = [0, 1, 2, 3].filter((p) => !known.has(p));
    const pool = [];
    hidden.forEach((p) => s.hands[p].forEach((c) => pool.push(c)));
    for (let attempt = 0; attempt < 30; attempt++) {
      B.shuffle(pool, r);
      const w = B.clone(s);
      let k = 0, ok = true;
      hidden.forEach((p) => {
        w.hands[p] = pool.slice(k, k + s.hands[p].length);
        k += s.hands[p].length;
        if (w.hands[p].some((c) => s.voids[p][c.suit])) ok = false;
      });
      if (ok || attempt === 29) return w;
    }
    return null;
  }

  function playOut(w) {
    let s = w, guard = 0;
    while (s.phase === "play" && guard++ < 60) {
      const n = B.playCard(s, ruleCard(s));
      if (!n) return null;
      s = n;
    }
    return s;
  }

  function chooseCard(s, level, rng, opts) {
    const r = rng || Math.random;
    const legal = B.legalCards(s, s.turn);
    if (legal.length === 1) return legal[0];
    if (level <= 1) return legal[Math.floor(r() * legal.length)];
    if (level === 2) return ruleCard(s);
    const viewer = viewerOf(s);
    const mySide = B.side(viewer);
    const samples = (opts && opts.samples) || 16;
    const scores = legal.map(() => 0);
    for (let k = 0; k < samples; k++) {
      const w = sampleWorld(s, viewer, r);
      if (!w) break;
      legal.forEach((c, i) => {
        const n = B.playCard(w, c);
        const end = n && playOut(n);
        if (end) scores[i] += end.tricksWon[mySide];
      });
    }
    let bi = 0;
    scores.forEach((v, i) => { if (v > scores[bi] || (v === scores[bi] && legal[i].rank < legal[bi].rank && legal[i].suit === legal[bi].suit)) bi = i; });
    return legal[bi];
  }

  return { chooseCall, chooseCard, ruleCard, shown, openingCall, response, target, lengths, balanced, quickTricks };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BridgeAi;
}
if (typeof window !== "undefined") {
  window.BridgeAi = BridgeAi;
}
