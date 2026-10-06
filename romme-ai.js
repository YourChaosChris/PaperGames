// romme-ai.js
// Computer player for Rommé (see romme-core.js), three levels after the
// pattern of concan-ai.js:
//   1 (easy)   - lays out whatever melds it finds and discards a random
//                card it can't use.
//   2 (medium) - lays out the biggest melds first (the best split of its
//                hand into melds), adds cards to melds on the table, swaps
//                jokers, and discards the card that helps it least.
//   3 (hard)   - like medium, also keeps track of the cards already
//                discarded (a card whose partners are gone is worth less)
//                and never discards a card that could be added to a meld
//                on the table - the next player could use it.
// With the house rule "take cards from melds" switched on, every level
// takes a table card when it forms a new meld with two of its own cards.
// With the house rule "split runs" switched on, every level splits a run
// with a card it can neither lay out in a meld nor add anywhere.
// chooseMove returns one step at a time; the page calls it until the
// computer has discarded or the round is over.

const RommeAi = (function () {
  const C = typeof RommeCore !== "undefined" ? RommeCore : require("./romme-core.js");

  function pickRandom(list, random) { return list[Math.floor((random || Math.random)() * list.length)]; }

  // Candidate melds from a hand: { ids, meld, value }.
  function candidates(hand) {
    const out = [];
    const seen = new Set();
    const jokers = hand.filter((c) => c.joker);
    const add = (cards) => {
      const meld = C.buildMeld(cards);
      if (!meld) return;
      const key = cards.map((c) => c.id).sort((a, b) => a - b).join(",");
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ ids: cards.map((c) => c.id), meld, value: C.meldValue(meld) });
    };
    // Sets: one card per suit of a rank, 2-4 naturals plus up to 2 jokers.
    for (let rank = 1; rank <= 13; rank++) {
      const bySuit = {};
      hand.forEach((c) => { if (!c.joker && c.rank === rank && !bySuit[c.suit]) bySuit[c.suit] = c; });
      const nat = Object.values(bySuit);
      const subsets = (arr, k, start, acc, res) => {
        if (acc.length === k) { res.push(acc.slice()); return; }
        for (let i = start; i < arr.length; i++) { acc.push(arr[i]); subsets(arr, k, i + 1, acc, res); acc.pop(); }
      };
      for (let k = 2; k <= Math.min(4, nat.length); k++) {
        const res = []; subsets(nat, k, 0, [], res);
        res.forEach((sub) => {
          if (k >= 3) add(sub);
          for (let j = 1; j <= jokers.length && k + j <= 4; j++) add(sub.concat(jokers.slice(0, j)));
        });
      }
    }
    // Runs: windows over each suit with at most two jokers filling gaps.
    C.SUITS.forEach((suit) => {
      const byRank = {};
      hand.forEach((c) => { if (!c.joker && c.suit === suit && !byRank[c.rank]) byRank[c.rank] = c; });
      const at = (r) => byRank[r === 14 ? 1 : r];
      for (let lo = 1; lo <= 12; lo++) {
        for (let hi = lo + 2; hi <= 14 && hi - lo < 13; hi++) {
          const cards = [];
          let need = 0;
          for (let r = lo; r <= hi; r++) { const c = at(r); if (c && !(r === 14 && lo === 1)) cards.push(c); else need++; }
          if (need > jokers.length || cards.length < 2) continue;
          add(cards.concat(jokers.slice(0, need)));
        }
      }
    });
    return out;
  }

  // The best set of disjoint melds (most points, then most cards).
  function bestSplit(hand, budget) {
    const cands = candidates(hand).sort((a, b) => b.value - a.value);
    let best = { melds: [], value: 0, cards: 0 };
    let nodes = 0;
    const limit = budget || 4000;
    (function dfs(start, used, chosen, value, cards) {
      if (++nodes > limit) return;
      if (value > best.value || (value === best.value && cards > best.cards)) best = { melds: chosen.slice(), value, cards };
      for (let i = start; i < cands.length; i++) {
        const c = cands[i];
        if (c.ids.some((id) => used.has(id))) continue;
        c.ids.forEach((id) => used.add(id));
        chosen.push(c);
        dfs(i + 1, used, chosen, value + c.value, cards + c.ids.length);
        chosen.pop();
        c.ids.forEach((id) => used.delete(id));
      }
    })(0, new Set(), [], 0, 0);
    return best;
  }

  // The first melds found, without searching for the best split (easy).
  function greedySplit(hand) {
    const used = new Set(), melds = [];
    let value = 0;
    candidates(hand).forEach((c) => {
      if (c.ids.some((id) => used.has(id))) return;
      c.ids.forEach((id) => used.add(id));
      melds.push(c);
      value += c.value;
    });
    return { melds, value };
  }

  // Ids of a new meld from `card` and two other hand cards, or null.
  function meldWith(hand, card) {
    const others = hand.filter((c) => c.id !== card.id);
    for (let a = 0; a < others.length; a++) {
      for (let b = a + 1; b < others.length; b++) {
        if (C.buildMeld([card, others[a], others[b]])) return [card.id, others[a].id, others[b].id];
      }
    }
    return null;
  }

  // Before the first meld: does the staging plan (made from the whole hand
  // incl. staged cards) reach the minimum and hold card `id`?
  function planHolds(s, hand, id, level) {
    const staged = s.pending.reduce((a, m) => a.concat(m.entries.map((e) => e.card)), []);
    const whole = hand.concat(staged).sort((a, b) => a.id - b.id);
    const plan = level <= 1 ? greedySplit(whole) : bestSplit(whole);
    return plan.value >= s.threshold && plan.melds.some((m) => m.ids.includes(id));
  }

  // Variant: could `top` be laid out this turn after taking it?
  function canLayOut(s, hand, top, level) {
    const pl = s.players[s.turn];
    if (pl.opened) return !!meldWith(hand.concat([top]), top) || canExtendAny(s, top);
    return planHolds(s, hand.concat([top]), top.id, level);
  }

  function canExtendAny(s, card) {
    return s.melds.some((m) => C.extendMeld(m, card));
  }

  // How much a card helps the hand: partners for sets and runs, less if
  // the cards it would need are already gone (hard level).
  function usefulness(card, hand, seen) {
    if (card.joker) return 100;
    let score = 0;
    const gone = (rank, suit) => (seen ? seen.filter((c) => !c.joker && c.rank === rank && (suit === null || c.suit === suit)).length : 0);
    hand.forEach((c) => {
      if (c.id === card.id || c.joker) return;
      if (c.rank === card.rank && c.suit !== card.suit) score += 3;
      if (c.suit === card.suit) {
        const d = Math.abs(c.rank - card.rank);
        if (d === 1 || d === 12) score += 3;
        else if (d === 2 || d === 11) score += 1;
      }
    });
    if (seen) {
      // Both copies of a neighbour discarded: a run through it is unlikely.
      const lowDead = gone(card.rank - 1, card.suit) >= 2, highDead = gone(card.rank + 1, card.suit) >= 2;
      if (lowDead && highDead) score -= 2;
      if (gone(card.rank, null) >= 4) score -= 2;
    }
    return score;
  }

  function chooseMove(s, level, rng) {
    const random = rng || Math.random;
    const p = s.turn;
    const pl = s.players[p];
    const hand = pl.hand;

    if (s.phase === "draw") {
      const top = C.topDiscard(s);
      if (top && level >= 2 && s.discardRule) {
        // Variant: take the discard only if it can be laid out this turn.
        return { type: canLayOut(s, hand, top, level) ? "takeDiscard" : "draw" };
      }
      if (top && level >= 2) {
        if (pl.opened && (canExtendAny(s, top) || top.joker)) return { type: "takeDiscard" };
        const withTop = bestSplit(hand.concat([top]), 2000), without = bestSplit(hand, 2000);
        if (pl.opened ? withTop.cards > without.cards : (withTop.value >= s.threshold && without.value < s.threshold)) return { type: "takeDiscard" };
      }
      return { type: "draw" };
    }

    // A swapped joker has to go into a new meld right away.
    if (s.pendingJoker !== null) {
      const joker = hand.find((c) => c.id === s.pendingJoker);
      const others = hand.filter((c) => c.id !== joker.id);
      for (let a = 0; a < others.length; a++) {
        for (let b = a + 1; b < others.length; b++) {
          if (C.buildMeld([joker, others[a], others[b]])) return { type: "meld", ids: [joker.id, others[a].id, others[b].id] };
        }
      }
    }

    // Variant: the discard taken this turn has to go on the table; if it
    // can't, put it back and draw from the stock.
    if (C.discardCardOpen(s)) {
      const card = hand.find((c) => c.id === s.discardTakenId) ||
        s.pending.reduce((a, m) => a.concat(m.entries.map((e) => e.card)), []).find((c) => c.id === s.discardTakenId);
      if (pl.opened) {
        const meldIds = meldWith(hand, card);
        if (meldIds) return { type: "meld", ids: meldIds };
        for (let i = 0; i < s.melds.length; i++) if (C.extendMeld(s.melds[i], card)) return { type: "extend", meld: i, id: card.id };
        return { type: "returnDiscard" };
      }
      else if (!planHolds(s, hand, card.id, level)) return { type: "returnDiscard" };
    }

    // House rule: a card taken from the table goes into a new meld first;
    // if none can be built after all, take everything back.
    if (s.takenIds && s.takenIds.length) {
      const taken = s.takenIds[0];
      const others = hand.filter((c) => c.id !== taken);
      const card = hand.find((c) => c.id === taken);
      for (let a = 0; a < others.length; a++) {
        for (let b = a + 1; b < others.length; b++) {
          if (C.buildMeld([card, others[a], others[b]])) return { type: "meld", ids: [taken, others[a].id, others[b].id] };
        }
      }
      return { type: "cancelPending" };
    }

    if (!pl.opened) {
      // Stage the melds of the best split one by one, then lay them out
      // together once they reach the threshold.
      // The plan is made from the whole hand including the staged cards
      // (sorted, so it comes out the same every step); otherwise a fresh
      // split of the rest could fall short and the staging would be taken
      // back and repeated forever.
      const staged = C.pendingValue(s);
      if (s.pending.length && staged >= s.threshold) return { type: "confirmOpen" };
      const stagedCards = s.pending.reduce((a, m) => a.concat(m.entries.map((e) => e.card)), []);
      const whole = hand.concat(stagedCards).sort((a, b) => a.id - b.id);
      const plan = level <= 1 ? greedySplit(whole) : bestSplit(whole);
      const inHand = new Set(hand.map((c) => c.id));
      const rest = plan.melds.filter((m) => m.ids.every((id) => inHand.has(id)));
      const restValue = rest.reduce((a, m) => a + m.value, 0);
      if (rest.length && staged + restValue >= s.threshold) return { type: "meld", ids: rest[0].ids };
      if (s.pending.length) return { type: "cancelPending" };
    } else {
      const split = level <= 1 ? greedySplit(hand) : bestSplit(hand);
      if (split.melds.length) return { type: "meld", ids: split.melds[0].ids };
      for (let i = 0; i < s.melds.length; i++) {
        for (const card of hand) {
          // Keep jokers for own melds - unless the hand is nearly empty,
          // or the round could never end.
          if (card.joker && level >= 2 && hand.length > 3) continue;
          if (C.extendMeld(s.melds[i], card)) return { type: "extend", meld: i, id: card.id };
        }
      }
      if (level >= 2) {
        for (let i = 0; i < s.melds.length; i++) {
          for (const card of hand) {
            if (C.jokerSlotFor(s.melds[i], card) !== -1) {
              const joker = s.melds[i].entries[C.jokerSlotFor(s.melds[i], card)].card;
              if (C.jokerUsable(hand.filter((c) => c.id !== card.id).concat([joker]), joker)) return { type: "swapJoker", meld: i, id: card.id };
            }
          }
        }
      }
    }

    // House rule (only when switched on): split a run with a card that
    // fits nowhere else. Reached only when no meld, extension or joker
    // swap was found above, so every hand card here is otherwise stuck.
    if (s.splitRule && pl.opened && s.pendingJoker === null) {
      for (let i = 0; i < s.melds.length; i++) {
        for (const card of hand) {
          if ((s.takenIds || []).includes(card.id)) continue;
          if (C.splitIndex(s.melds[i], card) !== -1) return { type: "split", meld: i, id: card.id };
        }
      }
    }

    // House rule (only when switched on): take a card from the table if
    // it makes a new meld with two cards from the hand.
    if (s.takeRule && pl.opened) {
      const opts = C.takeOptions(s);
      for (const o of opts) {
        const card = s.melds[o.meld].entries.find((e) => e.card.id === o.id).card;
        const plain = hand.filter((c) => !c.joker);
        for (let a = 0; a < plain.length; a++) {
          for (let b = a + 1; b < plain.length; b++) {
            if (C.buildMeld([card, plain[a], plain[b]])) return { type: "take", meld: o.meld, id: o.id };
          }
        }
      }
    }

    if (C.discardCardOpen(s)) return { type: "returnDiscard" };

    // Discard. A joker that fits nowhere is useless at the very end: with
    // every meld on the table full it would block going out for good.
    const stuckJoker = hand.length <= 2 ? hand.find((c) => c.joker && !canExtendAny(s, c)) : null;
    if (stuckJoker && hand.length === 2) return { type: "discard", id: stuckJoker.id };
    let pool = hand.slice();
    if (level >= 3) {
      const safe = pool.filter((c) => !c.joker && !canExtendAny(s, c));
      if (safe.length) pool = safe;
    }
    if (level <= 1) {
      const nonJoker = pool.filter((c) => !c.joker);
      return { type: "discard", id: pickRandom(nonJoker.length ? nonJoker : pool, random).id };
    }
    const seen = level >= 3 ? s.seen.concat(s.melds.reduce((a, m) => a.concat(m.entries.map((e) => e.card)), [])) : null;
    pool.sort((a, b) => usefulness(a, hand, seen) - usefulness(b, hand, seen) || C.handValue(b) - C.handValue(a));
    return { type: "discard", id: pool[0].id };
  }

  return { chooseMove, bestSplit, candidates };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = RommeAi;
}
if (typeof window !== "undefined") {
  window.RommeAi = RommeAi;
}
