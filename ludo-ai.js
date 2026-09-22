// ludo-ai.js
// Offline Ludo opponents, three strength levels built on ludo-core.js.
// A turn is driven by an unknown-in-advance die roll, so like the other
// race games' AIs (senet-ai.js, ur-ai.js) this doesn't search a tree of
// future rolls - it just picks the best token to move for the roll
// that's already been thrown, using the standard Ludo priority order:
//   1 = easy   - random legal move
//   2 = medium - capture > leave home on a 6 > advance the furthest token
//   3 = hard   - the same priority order, plus preferring to move a
//                token out of another token's immediate capture range

const LudoAi = (function () {
  // Is `color`'s token `tokenIndex` currently sitting somewhere an
  // opponent could capture it with their very next roll (1-6)? Only
  // matters on the shared track - the home column is exclusive.
  function isTokenInDanger(state, color, tokenIndex) {
    const token = state.tokens[color][tokenIndex];
    if (token.state !== "active" || token.rel > LudoCore.LAST_TRACK_REL) return false;
    const abs = LudoCore.absTrackIndex(color, token.rel);
    if (LudoCore.isSafeAbs(abs)) return false;

    return state.activeColors.some((oc) => {
      if (oc === color) return false;
      return state.tokens[oc].some((ot) => {
        if (ot.state !== "active" || ot.rel > LudoCore.LAST_TRACK_REL) return false;
        const oppAbs = LudoCore.absTrackIndex(oc, ot.rel);
        const distance = (abs - oppAbs + LudoCore.TRACK_LENGTH) % LudoCore.TRACK_LENGTH;
        return distance >= 1 && distance <= 6;
      });
    });
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Returns a { tokenIndex, captured, finished, wasHome, danger } summary
  // for each legal move, used to rank candidates.
  function describeMoves(state, color, roll, legalMoves) {
    return legalMoves.map((tokenIndex) => {
      const token = state.tokens[color][tokenIndex];
      const wasHome = token.state === "home";
      const wasInDanger = isTokenInDanger(state, color, tokenIndex);
      const result = LudoCore.applyMove(state, color, tokenIndex, roll);
      return {
        tokenIndex,
        captured: result.captured.length,
        finished: result.finished,
        wasHome,
        wasInDanger,
        progress: wasHome ? 0 : token.rel
      };
    });
  }

  function chooseMove(state, color, roll, level) {
    const legalMoves = LudoCore.getLegalMoves(state, color, roll);
    if (!legalMoves.length) return null;
    if (legalMoves.length === 1) return legalMoves[0];

    if (typeof level !== "number" || level < 1) level = 1;
    if (level === 1) return pickRandom(legalMoves);

    const moves = describeMoves(state, color, roll, legalMoves);

    const captureMoves = moves.filter((m) => m.captured > 0);
    if (captureMoves.length) {
      captureMoves.sort((a, b) => b.captured - a.captured);
      return captureMoves[0].tokenIndex;
    }

    const leaveHomeMoves = moves.filter((m) => m.wasHome);
    if (leaveHomeMoves.length) return pickRandom(leaveHomeMoves).tokenIndex;

    if (level === 3) {
      const dangerMoves = moves.filter((m) => m.wasInDanger);
      if (dangerMoves.length) {
        dangerMoves.sort((a, b) => b.progress - a.progress);
        return dangerMoves[0].tokenIndex;
      }
    }

    const finishMoves = moves.filter((m) => m.finished);
    if (finishMoves.length) return finishMoves[0].tokenIndex;

    // Prefer advancing whichever token is furthest along (closest to
    // finishing) - the standard "push your leader home" heuristic.
    moves.sort((a, b) => b.progress - a.progress);
    return moves[0].tokenIndex;
  }

  return { isTokenInDanger, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = LudoAi;
}
if (typeof window !== "undefined") {
  window.LudoAi = LudoAi;
}
