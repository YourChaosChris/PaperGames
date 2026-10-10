// canasta-ai.js
// Computer player for Canasta (canasta-core.js). chooseMove returns one
// move at a time: draw or take the pile, then one meld move (all melds
// of the turn at once), then the discard.
//
// Easy takes the pile only now and then, melds what it can and throws
// away a random card. Medium takes the pile whenever it can and the pile
// holds more than the top card, keeps wild cards for pairs and canastas,
// goes out as soon as it may, and discards black Threes first, then
// single cards the opponent can't add to a meld. Hard also remembers
// which cards the opponent picked up with the pile (everybody saw them),
// estimates for each card how likely the opponent could take the pile
// after it, and plays the hand on a few times after each of its three
// best discards (the unseen cards dealt at random, both sides with the
// Medium rules) to pick the discard. No computer looks at cards it could
// not see.

const CanastaAi = (function () {
  const C = (typeof CanastaCore !== "undefined") ? CanastaCore : require("./canasta-core.js");

  function tryMove(s, m) { const r = C.applyMove(s, m); return r.ok ? r : null; }

  /*** Taking the pile ***/

  function takeOption(s, level) {
    const p = s.turn, top = C.topDiscard(s);
    if (!top || !C.isNatural(top)) return null;
    const hand = s.hands[p];
    const nat = hand.filter((c) => C.isNatural(c) && c.rank === top.rank);
    const wild = hand.filter(C.isWild).sort((a, b) => C.value(a) - C.value(b));
    const opts = [];
    if (s.melds[p].length) {
      if (!C.frozenFor(s, p) && C.ownMeld(s, p, top.rank)) opts.push({ type: "takePile", groups: [{ ids: nat.map((c) => c.id) }] });
      if (nat.length >= 2) opts.push({ type: "takePile", groups: [{ ids: nat.map((c) => c.id) }] });
      if (nat.length === 1 && wild.length) opts.push({ type: "takePile", groups: [{ ids: [nat[0].id, wild[0].id] }] });
    } else {
      const b = C.bestMelds(hand, top, { frozen: true });
      if (b) {
        const g = b.groups.slice();
        const ti = g.findIndex((x) => x.top);
        const first = g.splice(ti, 1)[0];
        opts.push({ type: "takePile", groups: [{ ids: first.ids }].concat(g.map((x) => ({ ids: x.ids }))) });
      }
    }
    for (const m of opts) if (tryMove(s, m)) return m;
    return null;
  }

  /*** Melding ***/

  function meldPlan(s, level) {
    const p = s.turn;
    const hand = s.hands[p];
    if (!s.melds[p].length) {
      const tries = level >= 2 ? [{ saveWild: true, noPairs: true }, { saveWild: true }, {}] : [{}];
      for (const o of tries) {
        const b = C.bestMelds(hand, null, o);
        if (!b) continue;
        const m = { type: "meld", groups: b.groups.map((g) => ({ ids: g.ids })) };
        const r = tryMove(s, m);
        if (r) return m;
        // Too few points or no card left: try fewer groups (keeps cards).
        for (let k = b.groups.length - 1; k >= 1; k--) {
          const m2 = { type: "meld", groups: b.groups.slice(0, k).map((g) => ({ ids: g.ids })) };
          if (tryMove(s, m2)) return m2;
        }
      }
      return null;
    }
    const groups = [];
    const used = new Set();
    const byRank = {};
    hand.forEach((c) => { if (C.isNatural(c)) (byRank[c.rank] = byRank[c.rank] || []).push(c); });
    const wilds = hand.filter(C.isWild).sort((a, b) => C.value(a) - C.value(b));
    const size = {};
    s.melds[p].forEach((m) => { size[m.rank] = { n: m.cards.length, w: C.wildCount(m.cards) }; });
    // Naturals onto own melds and new natural melds.
    Object.keys(byRank).map(Number).forEach((r) => {
      const cs = byRank[r];
      if (size[r]) { groups.push({ ids: cs.map((c) => c.id), target: r }); size[r].n += cs.length; cs.forEach((c) => used.add(c.id)); }
      else if (cs.length >= 3) { groups.push({ ids: cs.map((c) => c.id) }); size[r] = { n: cs.length, w: 0 }; cs.forEach((c) => used.add(c.id)); }
    });
    let wi = 0;
    // Pairs with a wild card.
    if (level >= 2) {
      Object.keys(byRank).map(Number).forEach((r) => {
        const cs = byRank[r];
        if (!size[r] && cs.length === 2 && wilds.length - wi >= 1 && hand.length - used.size > 4) {
          groups.push({ ids: cs.map((c) => c.id).concat([wilds[wi].id]) });
          size[r] = { n: 3, w: 1 }; cs.forEach((c) => used.add(c.id)); used.add(wilds[wi].id); wi++;
        }
      });
      // Wild cards to finish a canasta.
      Object.keys(size).map(Number).forEach((r) => {
        const z = size[r];
        if (z.n >= 7 || r === 3) return;
        const need = 7 - z.n;
        if (need <= wilds.length - wi && z.w + need <= 3) {
          const ids = wilds.slice(wi, wi + need).map((c) => c.id);
          wi += need;
          ids.forEach((id) => used.add(id));
          const g = groups.find((x) => (x.target === r) || (x.target === undefined && hand.find((c) => c.id === x.ids[0]).rank === r));
          if (g) g.ids = g.ids.concat(ids); else groups.push({ ids, target: r });
          z.n += need; z.w += need;
        }
      });
    } else {
      Object.keys(byRank).map(Number).forEach((r) => {
        const cs = byRank[r];
        if (!size[r] && cs.length === 2 && wi < wilds.length) {
          groups.push({ ids: cs.map((c) => c.id).concat([wilds[wi].id]) });
          size[r] = { n: 3, w: 1 }; wi++;
        }
      });
    }
    // Going out: with two canastas (after these melds), lay out what is
    // left if at most one card remains.
    if (level >= 2) {
      const out = goOutPlan(s, p, groups);
      if (out) return out;
    }
    if (groups.length) {
      if (tryMove(s, { type: "meld", groups })) return { type: "meld", groups };
      // Drop groups from the end until it works.
      for (let k = groups.length - 1; k >= 1; k--) {
        const m = { type: "meld", groups: groups.slice(0, k) };
        if (tryMove(s, m)) return m;
      }
    }
    return null;
  }

  function goOutPlan(s, p, groups) {
    const base = groups.length ? tryMove(s, { type: "meld", groups }) : { state: s };
    if (!base || base.state.phase === "over") return null;
    const t = base.state;
    if (!C.canGoOut(t, p)) return null;
    const left = t.hands[p];
    const extra = [];
    const usedIds = new Set();
    const wildsLeft = left.filter(C.isWild);
    const wcount = {};
    t.melds[p].forEach((m) => { wcount[m.rank] = C.wildCount(m.cards); });
    // Pairs (and more) of a rank without a meld, with a wild card.
    const byRank = {};
    left.forEach((c) => { if (C.isNatural(c)) (byRank[c.rank] = byRank[c.rank] || []).push(c); });
    Object.keys(byRank).map(Number).forEach((r) => {
      const cs = byRank[r];
      if (wcount[r] !== undefined) return;
      if (cs.length === 2 && wildsLeft.length) {
        const w = wildsLeft.shift();
        extra.push({ ids: cs.map((c) => c.id).concat([w.id]) });
        wcount[r] = 1;
        cs.forEach((c) => usedIds.add(c.id)); usedIds.add(w.id);
      }
    });
    wildsLeft.forEach((c) => {
      const r = Object.keys(wcount).map(Number).find((k) => wcount[k] < 3 && k !== 3);
      if (r !== undefined) {
        const g = extra.find((e) => e.target === r);
        if (g) g.ids.push(c.id); else extra.push({ ids: [c.id], target: r });
        wcount[r]++;
        usedIds.add(c.id);
      }
    });
    const b3 = left.filter(C.isBlackThree);
    if (b3.length >= 3) { extra.push({ ids: b3.map((c) => c.id) }); b3.forEach((c) => usedIds.add(c.id)); }
    if (left.length - usedIds.size > 1) return null;
    if (!extra.length) return groups.length ? { type: "meld", groups } : null;
    // Pair groups need their rank; a group of wild cards needs a target
    // that is a meld before this move or one of `groups`.
    const all = { type: "meld", groups: groups.concat(extra) };
    return tryMove(s, all) ? all : null;
  }

  /*** Discard ***/

  function discardChoice(s, level, r, opts) {
    const p = s.turn, opp = 1 - p;
    const hand = s.hands[p];
    if (hand.length === 1) return hand[0];
    const nonWild = hand.filter((c) => !C.isWild(c));
    const pool = nonWild.length ? nonWild : hand;
    if (level <= 1) return pool[Math.floor(r() * pool.length)];
    const count = {};
    hand.forEach((c) => { if (!C.isWild(c)) count[c.rank] = (count[c.rank] || 0) + 1; });
    const oppMeld = {};
    s.melds[opp].forEach((m) => { oppMeld[m.rank] = true; });
    const knownOpp = {};
    if (level >= 3) s.known[opp].forEach((id) => {
      const c = s.hands[opp].find((x) => x.id === id);
      if (c && C.isNatural(c)) knownOpp[c.rank] = (knownOpp[c.rank] || 0) + 1;
    });
    const inPile = {};
    s.discard.forEach((c) => { if (C.isNatural(c)) inPile[c.rank] = (inPile[c.rank] || 0) + 1; });
    const frozen = C.pileFrozen(s) || !s.melds[opp].length;
    const score = (c) => {
      if (C.isBlackThree(c)) return -100;
      if (C.isWild(c)) return 500;
      let v = 0;
      if (oppMeld[c.rank] && !frozen) v += 60;
      if (C.ownMeld(s, p, c.rank)) v += 40;
      v += (count[c.rank] - 1) * 25;
      if (level >= 3) {
        v += (knownOpp[c.rank] || 0) * (frozen ? 35 : 25);
        v -= Math.min(2, inPile[c.rank] || 0) * 6;
      }
      v -= C.value(c) * 0.4;
      return v;
    };
    let extra = () => 0;
    if (level >= 3) {
      // How likely could the opponent take the pile after this discard?
      // Their hand is dealt at random from the unseen cards many times,
      // keeping the cards everybody saw them pick up.
      const seen = new Set();
      hand.forEach((c) => seen.add(c.id));
      s.discard.forEach((c) => seen.add(c.id));
      [0, 1].forEach((q) => { s.melds[q].forEach((m) => m.cards.forEach((c) => seen.add(c.id))); s.red3[q].forEach((c) => seen.add(c.id)); });
      const known = s.known[opp].map((id) => s.hands[opp].find((c) => c.id === id)).filter(Boolean);
      known.forEach((c) => seen.add(c.id));
      const unseen = C.newDeck().filter((c) => !seen.has(c.id) && !C.isRedThree(c));
      const worth = C.sum(s.discard.filter((c) => !C.isRedThree(c))) + s.discard.length * 8;
      const risk = {};
      const N = 24;
      const cand = pool.filter((c) => !C.isBlackThree(c) && !C.isWild(c));
      for (let k = 0; k < N; k++) {
        C.shuffle(unseen, r);
        const oppHand = known.concat(unseen.slice(0, Math.max(0, s.hands[opp].length - known.length)));
        cand.forEach((c) => {
          const w = { hands: [[], []], melds: s.melds, discard: s.discard.concat([c]), req: s.req };
          w.hands[opp] = oppHand;
          if (C.canTakePile(w, opp)) risk[c.id] = (risk[c.id] || 0) + 1;
        });
      }
      extra = (c) => ((risk[c.id] || 0) / N) * (worth + 40);
    }
    const total = (c) => score(c) + extra(c);
    const sorted = pool.slice().sort((a, b) => total(a) - total(b));
    if (level >= 3 && sorted.length > 1 && !(opts && opts.samples === 0)) {
      // Play the hand on a few times after each of the best candidates
      // (unseen cards dealt at random, both sides with the Medium rules).
      const cands = sorted.slice(0, 3);
      const samples = (opts && opts.samples) || 6;
      let best = null, bestV = -Infinity;
      cands.forEach((c, i) => {
        let v = 0;
        for (let k = 0; k < samples; k++) v += rollout(s, p, c, r, (opts && opts.depth) || 36);
        v = v / samples - i * 5;
        if (v > bestV) { bestV = v; best = c; }
      });
      if (best) return best;
    }
    return sorted[0];
  }

  // A random world that fits what player p knows: the opponent's hand
  // holds the cards they were seen to pick up, the rest is dealt from the
  // unseen cards; the stock is shuffled.
  function sampleWorld(s, p, r) {
    const opp = 1 - p;
    const w = C.clone(s);
    const known = new Set(s.known[opp]);
    // The cards p can't see: the stock and the opponent's other cards.
    const unseen = C.shuffle(s.stock.concat(s.hands[opp].filter((c) => !known.has(c.id))), r);
    const nUnknown = s.hands[opp].length - s.hands[opp].filter((c) => known.has(c.id)).length;
    const oppNew = [], stock = [];
    unseen.forEach((c) => { if (oppNew.length < nUnknown && !C.isRedThree(c)) oppNew.push(c); else stock.push(c); });
    w.hands[opp] = s.hands[opp].filter((c) => known.has(c.id)).concat(oppNew.map((c) => C.clone(c)));
    w.stock = stock.map((c) => C.clone(c));
    return w;
  }

  function rollout(s, p, card, r, depth) {
    let w = sampleWorld(s, p, r);
    const d = C.applyMove(w, { type: "discard", id: card.id });
    if (!d.ok) return -1e6;
    w = d.state;
    let guard = 0;
    while (w.phase !== "over" && guard++ < depth) {
      const m = chooseMove(w, 2, r);
      const n = C.applyMove(w, m);
      if (!n.ok) break;
      w = n.state;
    }
    if (w.phase === "over") return w.result.parts[p].total - w.result.parts[1 - p].total;
    return C.sideScore(w, p, null).total - C.sideScore(w, 1 - p, null).total;
  }

  function chooseMove(s, level, rng, opts) {
    const r = rng || Math.random;
    const p = s.turn;
    if (s.phase === "draw") {
      const take = takeOption(s, level);
      if (!s.stock.length) return take || { type: "draw" };
      if (take) {
        if (level <= 1 && r() < 0.5) return take;
        if (level >= 2 && (s.discard.length >= 2 || s.melds[p].length)) return take;
      }
      return { type: "draw" };
    }
    if (s.hands[p].length === 1 && !C.canGoOut(s, p)) {
      // Melded down to the last card: it goes on a meld and makes the
      // second canasta (the rules allow that only then).
      const c = s.hands[p][0];
      for (const meld of s.melds[p]) {
        const mv = { type: "meld", groups: [{ ids: [c.id], target: meld.rank }] };
        if (tryMove(s, mv)) return mv;
      }
    }
    const m = meldPlan(s, level);
    if (m) return m;
    return { type: "discard", id: discardChoice(s, level, r, opts).id };
  }

  return { chooseMove, takeOption, meldPlan, discardChoice };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CanastaAi;
}
if (typeof window !== "undefined") {
  window.CanastaAi = CanastaAi;
}
