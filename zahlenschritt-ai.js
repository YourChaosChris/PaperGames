// zahlenschritt-ai.js
// Computer side of Step Numbers. Turning up a card and writing it in leave no
// real choice (every fitting field needs the same number), so the strength
// lies in the middle column: the cards a sheet needs are the middle numbers
// minus one and plus one, a number at the edge needs only one card, and the
// same card needed many times is slow to come.
//   1 = easy   - random numbers
//   2 = medium - the better of two random numbers
//   3 = hard   - the number that keeps the need smallest and most even

const ZahlenschrittAi = (function () {
  // How slowly the sheet will fill: the most often needed card dominates, then
  // the number of fields, then how uneven the need is. Lower is better.
  function cost(mids, max) {
    const need = new Array(max + 1).fill(0);
    mids.forEach((m) => {
      if (m - 1 >= 0) need[m - 1]++;
      if (m + 1 <= max) need[m + 1]++;
    });
    let top = 0;
    let fields = 0;
    let squares = 0;
    need.forEach((c) => { if (c > top) top = c; fields += c; squares += c * c; });
    return top * 1000 + fields * 10 + squares;
  }

  function chooseNumber(state, level, rng) {
    const r = rng || Math.random;
    const mids = state.mids[state.turn];
    const pick = () => Math.floor(r() * (state.max + 1));
    if (level <= 1) return pick();
    if (level === 2) {
      const a = pick();
      const b = pick();
      return cost(mids.concat(a), state.max) <= cost(mids.concat(b), state.max) ? a : b;
    }
    let best = [];
    let bestCost = Infinity;
    for (let n = 0; n <= state.max; n++) {
      const c = cost(mids.concat(n), state.max);
      if (c < bestCost) { bestCost = c; best = [n]; } else if (c === bestCost) best.push(n);
    }
    return best[Math.floor(r() * best.length)];
  }

  function chooseMove(state, level, rng) {
    if (state.result) return null;
    if (state.phase === "setup") return { kind: "num", n: chooseNumber(state, level, rng) };
    if (state.phase === "draw") return { kind: "draw" };
    const list = ZahlenschrittCore.fits(state);
    if (!list.length) return null;
    const f = level <= 1 ? list[Math.floor((rng || Math.random)() * list.length)] : list[0];
    return { kind: "cell", row: f.row, col: f.col };
  }

  return { chooseMove, chooseNumber, cost };
})();

if (typeof module !== "undefined" && module.exports) {
  if (typeof ZahlenschrittCore === "undefined") global.ZahlenschrittCore = require("./zahlenschritt-core.js");
  module.exports = ZahlenschrittAi;
}
if (typeof window !== "undefined") {
  window.ZahlenschrittAi = ZahlenschrittAi;
}
