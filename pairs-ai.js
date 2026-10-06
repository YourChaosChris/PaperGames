// pairs-ai.js
// Computer player for Pairs. Its whole skill is recall - which cards it
// has seen face up, anywhere in the game, by either player:
//   1 = easy   - recalls nothing, turns over random face-down cards
//   2 = medium - recalls the last six cards it saw
//   3 = hard   - recalls every card that has ever been face up and never
//                forgets one, which makes it very strong (the rules page
//                and the quick rules say so)
// The app keeps the list of seen cards (`seen`, card indices in the
// order they were last shown) and passes it in.

const PairsAi = (function () {
  const RECALL = { 1: 0, 2: 6, 3: Infinity };

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // The cards the computer still knows: the most recent `limit` distinct
  // entries of `seen`, minus anything already taken.
  function remembered(state, seen, level) {
    const limit = RECALL[level] === undefined ? Infinity : RECALL[level];
    const out = [];
    for (let k = seen.length - 1; k >= 0 && out.length < limit; k--) {
      const i = seen[k];
      if (out.indexOf(i) === -1) out.push(i);
    }
    return out.filter((i) => state.taken[i] === null);
  }

  // The next card to turn over (first or second of the turn).
  function chooseCard(state, seen, level) {
    const hidden = PairsCore.hiddenCards(state);
    if (!hidden.length) return null;
    const known = remembered(state, seen, level).filter((i) => state.open.indexOf(i) === -1);

    if (state.open.length === 1) {
      const first = state.open[0];
      const partner = known.find((i) => i !== first && state.cards[i] === state.cards[first]);
      if (partner !== undefined) return partner;
      const unknown = hidden.filter((i) => known.indexOf(i) === -1);
      return pickRandom(unknown.length ? unknown : hidden);
    }

    // First card: a remembered pair if there is one...
    for (let x = 0; x < known.length; x++) {
      for (let y = x + 1; y < known.length; y++) {
        if (state.cards[known[x]] === state.cards[known[y]]) return known[x];
      }
    }
    // ...otherwise a card it hasn't seen, to learn something new.
    const unknown = hidden.filter((i) => known.indexOf(i) === -1);
    return pickRandom(unknown.length ? unknown : hidden);
  }

  return { RECALL, remembered, chooseCard };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PairsAi;
}
if (typeof window !== "undefined") {
  window.PairsAi = PairsAi;
}
