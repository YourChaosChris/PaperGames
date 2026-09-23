// daily-challenge.js
// Shared "puzzle of the day" helper for the generated puzzle games
// (Sudoku, Kakuro, Slitherlink, 2048, Nonogram). No server involved: a
// small seeded PRNG (mulberry32 - deterministic, tiny, public domain)
// takes the place of Math.random() in each game's own generator, seeded
// from today's UTC date plus the game's own slug, so every player sees
// the exact same puzzle on a given day and a different one tomorrow,
// with nothing to fetch or store server-side.
//
// Each of Sudoku/Kakuro/Slitherlink/2048's core generation functions
// already accepts an optional `rng` parameter (defaulting to
// Math.random when omitted - built that way for this project's own
// deterministic tests), so plugging in makeTodaysRng(slug) instead is a
// one-line change at each game's "start a new game" call site. Nonogram
// is different - it picks a random puzzle from a fixed pool rather than
// generating one - so nonogramIndexForToday() is used there instead of
// makeTodaysRng().

const DailyChallenge = (function () {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Simple djb2-style string hash - just needs to spread different
  // (slug, date) pairs across the 32-bit seed space, not cryptographic.
  function hashString(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  // UTC, not local time, so every player worldwide gets the same puzzle
  // at the same moment rather than it changing at each player's own
  // midnight.
  function todayKey() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function seedForToday(slug) {
    return hashString(slug + ":" + todayKey());
  }

  function makeTodaysRng(slug) {
    return mulberry32(seedForToday(slug));
  }

  // For Nonogram's fixed puzzle pool: a deterministic index in
  // [0, poolLength) for today, instead of a seeded RNG.
  function nonogramIndexForToday(slug, poolLength) {
    if (!poolLength) return 0;
    const rng = mulberry32(seedForToday(slug));
    return Math.floor(rng() * poolLength);
  }

  return { todayKey, seedForToday, makeTodaysRng, nonogramIndexForToday, mulberry32 };
})();

if (typeof window !== "undefined") {
  window.DailyChallenge = DailyChallenge;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = DailyChallenge;
}
