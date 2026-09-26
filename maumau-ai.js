// maumau-ai.js
// Computer players for Mau Mau, three levels:
//   1 (easy)   - any card that fits, at random; a random suit for a Jack.
//   2 (medium) - keeps Jacks back until nothing else fits, saves Sevens
//                and Eights for when the next player is the one closest
//                to winning, otherwise sheds ordinary cards first; names
//                the suit it holds most of.
//   3 (hard)   - like medium, and also remembers which suits each
//                opponent was seen unable to follow (MauMauCore keeps
//                that in state.missingSuits) and which suits have mostly
//                gone already, preferring to leave the next player a suit
//                they probably don't have - both with the card it plays
//                and with the suit it names for a Jack.

const MauMauAi = (function () {
  function core() {
    return typeof MauMauCore !== "undefined" ? MauMauCore : require("./maumau-core.js");
  }

  function nextPlayer(state, steps) {
    return (state.turn + (steps || 1)) % state.numPlayers;
  }

  // True when the next player holds the fewest cards among the opponents
  // (or is close to going out) - worth hitting with a Seven or an Eight.
  function nextIsThreat(state) {
    const me = state.turn;
    const nxt = nextPlayer(state);
    let fewest = Infinity;
    state.hands.forEach((h, p) => { if (p !== me) fewest = Math.min(fewest, h.length); });
    return state.hands[nxt].length <= fewest || state.hands[nxt].length <= 2;
  }

  // How many cards of each suit are out of play for everyone (on the
  // discard pile) - a suit that's mostly gone is hard to follow.
  function goneCounts(state) {
    const counts = { S: 0, H: 0, D: 0, C: 0 };
    state.discard.forEach((c) => { counts[c.suit]++; });
    return counts;
  }

  function suitScoreAgainstNext(C, state, suit, weightMissing) {
    const nxt = nextPlayer(state);
    let s = 0;
    if ((state.missingSuits[nxt] || []).indexOf(suit) !== -1) s += weightMissing;
    s += goneCounts(state)[suit] * 2;
    return s;
  }

  function chooseWish(state, level, rng, handAfter) {
    const C = core();
    const random = rng || Math.random;
    if (level <= 1) return C.SUITS[Math.floor(random() * C.SUITS.length)];
    const counts = { S: 0, H: 0, D: 0, C: 0 };
    handAfter.forEach((c) => { if (c.rank !== C.JACK) counts[c.suit]++; });
    let best = C.bestSuit(handAfter);
    let bestScore = -Infinity;
    C.SUITS.forEach((s) => {
      let score = counts[s] * 10;
      if (level >= 3) score += suitScoreAgainstNext(C, state, s, 25);
      if (score > bestScore) { bestScore = score; best = s; }
    });
    return best;
  }

  // Returns { index, wish } for the card to play, or null if none fits.
  function chooseMove(state, level, rng) {
    const C = core();
    const random = rng || Math.random;
    const moves = C.legalMoves(state);
    if (!moves.length) return null;
    const hand = state.hands[state.turn];
    let index;
    if (level <= 1) {
      index = moves[Math.floor(random() * moves.length)];
    } else {
      const threat = nextIsThreat(state);
      let bestScore = -Infinity;
      moves.forEach((i) => {
        const card = hand[i];
        let score = 0;
        if (hand.length === 1) score += 1000; // go out
        if (card.rank === C.JACK) score -= 50;
        else if (card.rank === C.SEVEN || card.rank === C.EIGHT) score += threat ? 40 : -10;
        else if (card.rank === C.ACE) score += 15; // plays again
        // Keep the suits we're long in on the table.
        const sameSuit = hand.filter((c, k) => k !== i && c.suit === card.suit && c.rank !== C.JACK).length;
        score += sameSuit * 3;
        if (level >= 3 && card.rank !== C.JACK) score += suitScoreAgainstNext(C, state, card.suit, 20);
        score += random() * 0.5;
        if (score > bestScore) { bestScore = score; index = i; }
      });
    }
    const card = hand[index];
    let wish = null;
    if (card.rank === C.JACK) {
      const handAfter = hand.filter((c, k) => k !== index);
      wish = chooseWish(state, level, random, handAfter);
    }
    return { index, wish };
  }

  // After drawing a card that fits: play it (true) or keep it (false).
  // Everyone but a careful player just plays it; medium and hard keep a
  // drawn Jack back when they still hold other cards.
  function playDrawn(state, level) {
    const C = core();
    const card = state.hands[state.turn][state.drawnIndex];
    if (level >= 2 && card.rank === C.JACK && state.hands[state.turn].length > 1) return false;
    return true;
  }

  return { chooseMove, chooseWish, playDrawn };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MauMauAi;
}
