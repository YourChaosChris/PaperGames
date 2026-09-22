// yatzy-core.js
// Dependency-free Yatzy engine. No DOM/UI here, same separation of
// concerns as every other <game>-core.js - and like the other puzzles
// in this collection, this is solitaire: no opponent, just the dice
// and the scoresheet.
//
// Ruleset: this implements SCANDINAVIAN YATZY, not the American
// "Yahtzee" variant (Yahtzee is a Hasbro trademark for a rule set that
// differs in two concrete ways from what's implemented here):
//   1. Scandinavian Yatzy has 15 scoring categories (13 in American
//      Yahtzee) - it adds "One Pair" and "Two Pairs" as their own
//      categories, which Yahtzee's scoresheet doesn't have.
//   2. Scandinavian Yatzy's "Three of a Kind" and "Four of a Kind"
//      score only the sum of the matching dice (e.g. three 4s = 12),
//      while American Yahtzee scores the sum of ALL FIVE dice for
//      those same categories whenever the requirement is met.
//   3. The upper-section bonus threshold (63) is the same in both
//      rulesets, but the bonus itself is +50 here vs. Yahtzee's +35.
//
// A game is 15 rounds, one per category - roll up to three times a
// round (holding whichever dice you want to keep between rolls), then
// lock in one still-open category using the final dice. Every
// category must eventually be used exactly once; a bad roll still has
// to go somewhere, same as the physical scoresheet.

const YatzyCore = (function () {
  const DICE_COUNT = 5;
  const MAX_ROLLS = 3;
  const UPPER_BONUS_THRESHOLD = 63;
  const UPPER_BONUS_VALUE = 50;

  function diceCounts(dice) {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // index 0 unused, faces are 1-6
    dice.forEach((d) => { if (d >= 1 && d <= 6) counts[d]++; });
    return counts;
  }

  function sumAll(dice) {
    return dice.reduce((a, b) => a + b, 0);
  }

  function upperScore(dice, face) {
    return diceCounts(dice)[face] * face;
  }

  function onePairScore(dice) {
    const counts = diceCounts(dice);
    for (let v = 6; v >= 1; v--) {
      if (counts[v] >= 2) return v * 2;
    }
    return 0;
  }

  // Descending list of pair values found in the roll. A face appearing
  // four times yields two pairs of that same face (and five times also
  // yields two pairs, with one die left over) - that's the standard
  // Scandinavian Yatzy ruling for "Two Pairs" against a four/five of a
  // kind, not a special case this code needs to branch on separately.
  function findPairs(dice) {
    const counts = diceCounts(dice);
    const pairs = [];
    for (let v = 6; v >= 1; v--) {
      while (counts[v] >= 2) {
        pairs.push(v);
        counts[v] -= 2;
      }
    }
    return pairs;
  }

  function twoPairsScore(dice) {
    const pairs = findPairs(dice);
    if (pairs.length < 2) return 0;
    return 2 * (pairs[0] + pairs[1]);
  }

  // Sum of just the matching dice (Scandinavian rule) - NOT the sum of
  // all five dice (that's the American Yahtzee rule for this category).
  function threeOfKindScore(dice) {
    const counts = diceCounts(dice);
    for (let v = 6; v >= 1; v--) {
      if (counts[v] >= 3) return v * 3;
    }
    return 0;
  }

  function fourOfKindScore(dice) {
    const counts = diceCounts(dice);
    for (let v = 6; v >= 1; v--) {
      if (counts[v] >= 4) return v * 4;
    }
    return 0;
  }

  function smallStraightScore(dice) {
    const sorted = dice.slice().sort().join(",");
    return sorted === "1,2,3,4,5" ? 15 : 0;
  }

  function largeStraightScore(dice) {
    const sorted = dice.slice().sort().join(",");
    return sorted === "2,3,4,5,6" ? 20 : 0;
  }

  // Exactly one face with count 3 and a different face with count 2 -
  // scores the sum of all five dice (which is always 3v + 2w).
  function fullHouseScore(dice) {
    const counts = diceCounts(dice);
    let hasThree = false;
    let hasTwo = false;
    for (let v = 1; v <= 6; v++) {
      if (counts[v] === 3) hasThree = true;
      else if (counts[v] === 2) hasTwo = true;
      else if (counts[v] !== 0) return 0; // any other count (1, 4, 5) breaks a full house
    }
    return (hasThree && hasTwo) ? sumAll(dice) : 0;
  }

  function chanceScore(dice) {
    return sumAll(dice);
  }

  // Fixed 50, same value the upper-section bonus happens to use - a
  // coincidence of this particular ruleset, not the same rule.
  function yatzyScore(dice) {
    const counts = diceCounts(dice);
    return counts.some((c) => c === 5) ? 50 : 0;
  }

  const CATEGORIES = [
    { id: "ones", section: "upper", score: (d) => upperScore(d, 1) },
    { id: "twos", section: "upper", score: (d) => upperScore(d, 2) },
    { id: "threes", section: "upper", score: (d) => upperScore(d, 3) },
    { id: "fours", section: "upper", score: (d) => upperScore(d, 4) },
    { id: "fives", section: "upper", score: (d) => upperScore(d, 5) },
    { id: "sixes", section: "upper", score: (d) => upperScore(d, 6) },
    { id: "onePair", section: "lower", score: onePairScore },
    { id: "twoPairs", section: "lower", score: twoPairsScore },
    { id: "threeOfKind", section: "lower", score: threeOfKindScore },
    { id: "fourOfKind", section: "lower", score: fourOfKindScore },
    { id: "smallStraight", section: "lower", score: smallStraightScore },
    { id: "largeStraight", section: "lower", score: largeStraightScore },
    { id: "fullHouse", section: "lower", score: fullHouseScore },
    { id: "chance", section: "lower", score: chanceScore },
    { id: "yatzy", section: "lower", score: yatzyScore }
  ];

  const CATEGORY_MAP = {};
  CATEGORIES.forEach((c) => { CATEGORY_MAP[c.id] = c; });

  const UPPER_IDS = CATEGORIES.filter((c) => c.section === "upper").map((c) => c.id);
  const LOWER_IDS = CATEGORIES.filter((c) => c.section === "lower").map((c) => c.id);

  function rollOne(rng) {
    return Math.floor(rng() * 6) + 1;
  }

  function createInitialState() {
    const scores = {};
    CATEGORIES.forEach((c) => { scores[c.id] = null; });
    return {
      dice: new Array(DICE_COUNT).fill(0), // 0 = no value yet (not rolled this round)
      held: new Array(DICE_COUNT).fill(false),
      rollsUsed: 0,
      round: 1, // 1-based, up to CATEGORIES.length
      scores,
      gameOver: false
    };
  }

  // Rolls the unheld dice. A no-op (returns the same state) once the
  // round's three rolls are used up, or once the game is over.
  function roll(state, rng) {
    const random = rng || Math.random;
    if (state.gameOver || state.rollsUsed >= MAX_ROLLS) return state;
    const dice = state.dice.map((d, i) => (state.held[i] ? d : rollOne(random)));
    return Object.assign({}, state, { dice, rollsUsed: state.rollsUsed + 1 });
  }

  // Holding only matters between rolls, so toggling is a no-op before
  // the first roll of a round (nothing to hold yet) and after the
  // third (no reroll left for it to affect).
  function toggleHold(state, index) {
    if (state.gameOver) return state;
    if (state.rollsUsed < 1 || state.rollsUsed >= MAX_ROLLS) return state;
    if (index < 0 || index >= DICE_COUNT) return state;
    const held = state.held.slice();
    held[index] = !held[index];
    return Object.assign({}, state, { held });
  }

  function potentialScore(dice, categoryId) {
    const category = CATEGORY_MAP[categoryId];
    return category ? category.score(dice) : 0;
  }

  function isCategoryFilled(state, categoryId) {
    const v = state.scores[categoryId];
    return v !== null && v !== undefined;
  }

  // Locks in the given category using the current dice, then starts
  // the next round (fresh dice, no holds, no rolls used). Requires at
  // least one roll this round and an unfilled category - a no-op
  // otherwise, so a caller can always safely call this from a click
  // handler without checking state first.
  function commitCategory(state, categoryId) {
    if (state.gameOver) return state;
    if (state.rollsUsed < 1) return state;
    if (!CATEGORY_MAP[categoryId]) return state;
    if (isCategoryFilled(state, categoryId)) return state;

    const score = CATEGORY_MAP[categoryId].score(state.dice);
    const scores = Object.assign({}, state.scores, { [categoryId]: score });
    const round = state.round + 1;
    const gameOver = round > CATEGORIES.length;

    return {
      dice: new Array(DICE_COUNT).fill(0),
      held: new Array(DICE_COUNT).fill(false),
      rollsUsed: 0,
      round,
      scores,
      gameOver
    };
  }

  function computeTotals(scores) {
    let upperTotal = 0;
    UPPER_IDS.forEach((id) => { upperTotal += scores[id] || 0; });
    const bonus = upperTotal >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_VALUE : 0;
    let lowerTotal = 0;
    LOWER_IDS.forEach((id) => { lowerTotal += scores[id] || 0; });
    return {
      upperTotal,
      bonus,
      lowerTotal,
      grandTotal: upperTotal + bonus + lowerTotal
    };
  }

  return {
    DICE_COUNT,
    MAX_ROLLS,
    UPPER_BONUS_THRESHOLD,
    UPPER_BONUS_VALUE,
    CATEGORIES,
    CATEGORY_MAP,
    UPPER_IDS,
    LOWER_IDS,
    createInitialState,
    roll,
    toggleHold,
    potentialScore,
    isCategoryFilled,
    commitCategory,
    computeTotals
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YatzyCore;
}
if (typeof window !== "undefined") {
  window.YatzyCore = YatzyCore;
}
