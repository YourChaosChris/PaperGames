// shadowmatch-core.js
// "Whose Shadow Is It?" - a picture is shown, and below it a few black
// shadows: which one belongs to the picture? Dependency-free, no DOM;
// the drawings come from kidspics.js (KidsPics), random numbers only from
// a seedable generator (makeRng).
//
// A game is ROUNDS rounds. A round:
//   { id, options: [{ id, tr }, ...], correct }
// id is the drawing shown, an option is a shadow of the drawing `id` shown
// in the turn `tr` ("none", "mirror", "flip", "rot" - see kidspics.js).
// options[correct] is { id, tr: "none" }, the shadow of the picture as it
// is; all options are different.
//   easy    3 shadows; the others are drawings from other groups
//           (a cup next to an animal).
//   medium  4 shadows; the others are drawings from the same group
//           (animals beside animals).
//   hard    4 shadows; two of them are the same drawing, mirrored or
//           turned upside down or on its side, and one is another drawing
//           of the same group.
// The six pictures of a game are all different drawings.

const ShadowMatchCore = (function () {
  const ROUNDS = 6;
  const LEVELS = { easy: { options: 3 }, medium: { options: 4 }, hard: { options: 4 } };
  const TR = ["none", "mirror", "flip", "rot"];
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

  function key(o) { return o.id + "/" + o.tr; }

  function makeRound(level, rng, usedIds) {
    const P = pics();
    const ids = P.IDS.filter((id) => usedIds.indexOf(id) === -1);
    const id = ids[Math.floor(rng() * ids.length)];
    const cat = P.OBJECTS[id].cat;
    const n = LEVELS[level].options;
    let wrong = [];
    if (level === "easy") {
      const others = shuffle(rng, P.IDS.filter((x) => P.OBJECTS[x].cat !== cat));
      const seenCats = [];
      for (const x of others) {
        if (wrong.length === n - 1) break;
        const c = P.OBJECTS[x].cat;
        if (seenCats.indexOf(c) !== -1) continue;
        seenCats.push(c);
        wrong.push({ id: x, tr: "none" });
      }
    } else if (level === "medium") {
      shuffle(rng, P.CATEGORIES[cat].filter((x) => x !== id)).slice(0, n - 1).forEach((x) => wrong.push({ id: x, tr: "none" }));
    } else {
      const turns = shuffle(rng, TR.filter((t) => t !== "none" && P.canTransform(id, t)));
      turns.slice(0, 2).forEach((t) => wrong.push({ id, tr: t }));
      const rest = shuffle(rng, P.CATEGORIES[cat].filter((x) => x !== id));
      for (const x of rest) {
        if (wrong.length === n - 1) break;
        wrong.push({ id: x, tr: "none" });
      }
    }
    const right = { id, tr: "none" };
    const options = shuffle(rng, wrong.concat([right]));
    return { id, options, correct: options.findIndex((o) => key(o) === key(right)) };
  }

  function generatePuzzle(level, seed) {
    const lv = LEVELS[level] ? level : "easy";
    const rng = makeRng(seed === undefined || seed === null ? Math.floor(Math.random() * 4294967296) : seed);
    const rounds = [];
    const used = [];
    while (rounds.length < ROUNDS) {
      const r = makeRound(lv, rng, used);
      used.push(r.id);
      rounds.push(r);
    }
    return { level: lv, rounds };
  }

  // Well formed: a known drawing, distinct options, exactly one of them
  // the unturned shadow of the picture.
  function isValidRound(r) {
    const P = pics();
    if (!r || !P.OBJECTS[r.id] || !Array.isArray(r.options) || r.options.length < 2) return false;
    if (!r.options.every((o) => o && P.OBJECTS[o.id] && TR.indexOf(o.tr) !== -1 && P.canTransform(o.id, o.tr))) return false;
    if (new Set(r.options.map(key)).size !== r.options.length) return false;
    const rights = r.options.filter((o) => o.id === r.id && o.tr === "none");
    return rights.length === 1 && r.options[r.correct] === rights[0];
  }

  return { ROUNDS, LEVELS, TR, makeRng, makeRound, generatePuzzle, isValidRound };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ShadowMatchCore;
}
if (typeof window !== "undefined") {
  window.ShadowMatchCore = ShadowMatchCore;
}
