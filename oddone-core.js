// oddone-core.js
// "Find the Misfit" - a few pictures, all alike in one way except
// one: tap the one that does not belong. Dependency-free, no DOM; the
// drawings of the "group" rounds come from kidspics.js (KidsPics), random
// numbers only from a seedable generator (makeRng).
//
// A game is ROUNDS rounds. A round:
//   { type, cards: [card, ...], correct }
// type "group": a card is { id } (a drawing from kidspics.js); all cards
//   but one come from the same group (animals, vehicles, plants, things
//   at home), the card at `correct` from another group.
// type "attr": a card is { s, f, n } - shape (0..5, SHAPES), filling (0..2,
//   FILLS: solid, outline, outline with a small shape inside) and number
//   of copies (1..3). All cards but one share one of the three features,
//   the card at `correct` has another value of it. The other features
//   vary from card to card (one of them in medium, two in hard).
// A round is certain: exactly one card is "odd" - its value of some feature
// is the only one of its kind while all the others share a value (oddOnes
// finds those cards; the tests check that it is just the right one).
//   easy    6 group rounds of 4 cards
//   medium  3 group rounds (5 cards) and 3 attr rounds (5 cards), mixed
//   hard    3 group rounds (6 cards) and 3 attr rounds (6 cards), mixed

const OddOneCore = (function () {
  const ROUNDS = 6;
  const SHAPES = ["circle", "square", "triangle", "star", "heart", "diamond"];
  const FILLS = ["solid", "outline", "inner"];
  const NUMBERS = [1, 2, 3];
  const DOMAIN = { s: SHAPES.length, f: FILLS.length, n: NUMBERS.length };
  const LEVELS = {
    easy: { cards: 4, group: 6, attr: 0, vary: 0 },
    medium: { cards: 5, group: 3, attr: 3, vary: 1 },
    hard: { cards: 6, group: 3, attr: 3, vary: 2 }
  };
  let Pics = null;
  function pics() {
    if (!Pics) Pics = typeof KidsPics !== "undefined" ? KidsPics : require("./kidspics.js");
    return Pics;
  }

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(rng, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function features(type, card) {
    return type === "group" ? [pics().OBJECTS[card.id] ? pics().OBJECTS[card.id].cat : null] : [card.s, card.f, card.n];
  }

  function cardKey(type, card) {
    return type === "group" ? card.id : card.s + "/" + card.f + "/" + card.n;
  }

  // The cards that are the only one of their kind in some feature while
  // all the others agree in it.
  function oddOnes(type, cards) {
    const out = [];
    const n = cards.length;
    const fs = cards.map((c) => features(type, c));
    for (let k = 0; k < fs[0].length; k++) {
      const counts = {};
      fs.forEach((f) => { counts[f[k]] = (counts[f[k]] || 0) + 1; });
      const vals = Object.keys(counts);
      if (vals.length !== 2) continue;
      const lone = vals.filter((v) => counts[v] === 1);
      if (lone.length !== 1 || n < 3) continue;
      const idx = fs.findIndex((f) => String(f[k]) === lone[0]);
      if (out.indexOf(idx) === -1) out.push(idx);
    }
    return out.sort((a, b) => a - b);
  }

  function isValidRound(r) {
    if (!r || (r.type !== "group" && r.type !== "attr") || !Array.isArray(r.cards)) return false;
    const P = pics();
    if (r.cards.length < 3 || r.correct < 0 || r.correct >= r.cards.length) return false;
    for (const c of r.cards) {
      if (!c) return false;
      if (r.type === "group") { if (!P.OBJECTS[c.id]) return false; }
      else if (!(c.s >= 0 && c.s < DOMAIN.s && c.f >= 0 && c.f < DOMAIN.f && c.n >= 1 && c.n <= DOMAIN.n)) return false;
    }
    // Group rounds show every drawing once; attribute rounds may repeat a
    // card (only the odd one out matters).
    if (r.type === "group" && new Set(r.cards.map((c) => cardKey(r.type, c))).size !== r.cards.length) return false;
    const odd = oddOnes(r.type, r.cards);
    return odd.length === 1 && odd[0] === r.correct;
  }

  function makeGroupRound(rng, count, usedCats) {
    const P = pics();
    const cats = P.CATEGORY_NAMES.filter((c) => usedCats.indexOf(c) === -1);
    const cat = cats[Math.floor(rng() * cats.length)];
    const others = P.CATEGORY_NAMES.filter((c) => c !== cat);
    const oddCat = others[Math.floor(rng() * others.length)];
    const same = shuffle(rng, P.CATEGORIES[cat]).slice(0, count - 1);
    const oddId = P.CATEGORIES[oddCat][Math.floor(rng() * P.CATEGORIES[oddCat].length)];
    const cards = shuffle(rng, same.map((id) => ({ id })).concat([{ id: oddId, odd: true }]));
    const correct = cards.findIndex((c) => c.odd);
    cards.forEach((c) => { delete c.odd; });
    return { cat, round: { type: "group", cards, correct } };
  }

  function makeAttrRound(rng, count, vary) {
    const names = ["s", "f", "n"];
    for (let attempt = 0; attempt < 500; attempt++) {
      const a = names[Math.floor(rng() * 3)];
      const rest = shuffle(rng, names.filter((x) => x !== a));
      const varying = rest.slice(0, vary), fixed = rest.slice(vary);
      const v = Math.floor(rng() * DOMAIN[a]);
      let w = Math.floor(rng() * (DOMAIN[a] - 1));
      if (w >= v) w++;
      const base = {};
      fixed.forEach((x) => { base[x] = Math.floor(rng() * DOMAIN[x]); });
      const cards = [];
      for (let i = 0; i < count; i++) {
        const c = { s: 0, f: 0, n: 1 };
        const put = (x, val) => { c[x] = x === "n" ? val + 1 : val; };
        put(a, i === count - 1 ? w : v);
        fixed.forEach((x) => put(x, base[x]));
        varying.forEach((x) => put(x, Math.floor(rng() * DOMAIN[x])));
        cards.push(c);
      }
      const ok = varying.every((x) => new Set(cards.map((c) => c[x])).size >= 2);
      if (!ok) continue;
      const mixed = shuffle(rng, cards.map((c, i) => ({ c, odd: i === count - 1 })));
      const round = { type: "attr", cards: mixed.map((m) => m.c), correct: mixed.findIndex((m) => m.odd) };
      if (isValidRound(round)) return round;
    }
    return null;
  }

  function generatePuzzle(level, seed) {
    const lv = LEVELS[level] ? level : "easy";
    const L = LEVELS[lv];
    const rng = makeRng(seed === undefined || seed === null ? Math.floor(Math.random() * 4294967296) : seed);
    const kinds = [];
    for (let i = 0; i < L.group; i++) kinds.push("group");
    for (let i = 0; i < L.attr; i++) kinds.push("attr");
    const order = shuffle(rng, kinds);
    const rounds = [];
    const usedCats = [];
    order.forEach((kind) => {
      if (kind === "group") {
        const g = makeGroupRound(rng, L.cards, usedCats.length >= 4 ? [] : usedCats);
        usedCats.push(g.cat);
        rounds.push(g.round);
      } else {
        rounds.push(makeAttrRound(rng, L.cards, L.vary));
      }
    });
    return { level: lv, rounds };
  }

  return { ROUNDS, SHAPES, FILLS, NUMBERS, LEVELS, makeRng, oddOnes, isValidRound, generatePuzzle };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = OddOneCore;
}
if (typeof window !== "undefined") {
  window.OddOneCore = OddOneCore;
}
