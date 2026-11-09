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
//                and not to leave a token where it can be captured next
//
// Arrow Ludo (task 191): every arrow square flies a token across the
// middle - 26 squares forward on the first half of its lap, 26 back on
// the second half. Medium and Hard take a forward flight right after a
// capture and avoid a flight back whenever another move is possible.

const LudoAi = (function () {
  // Is `color`'s token `tokenIndex` currently sitting somewhere an
  // opponent could capture it with their very next roll (1-6)? Only
  // matters on the shared track - the home column is exclusive.
  // The track numbers come from the state's board (4 or 6 arms).
  function isTokenInDanger(state, color, tokenIndex) {
    const g = LudoCore.geometry(state);
    const token = state.tokens[color][tokenIndex];
    if (token.state !== "active" || token.rel > g.lastTrackRel) return false;
    const abs = LudoCore.absTrackIndex(color, token.rel, state);
    if (LudoCore.isSafeAbs(abs, state)) return false;

    return state.activeColors.some((oc) => {
      if (oc === color) return false;
      return state.tokens[oc].some((ot) => {
        if (ot.state !== "active" || ot.rel > g.lastTrackRel) return false;
        const oppAbs = LudoCore.absTrackIndex(oc, ot.rel, state);
        const distance = (abs - oppAbs + g.trackLength) % g.trackLength;
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
      const after = result.state.tokens[color][tokenIndex];
      // How far the token got: the roll, plus or minus a flight.
      const gain = wasHome ? 0 : result.finished ? roll : after.rel - token.rel;
      return {
        tokenIndex,
        captured: result.captured.length,
        finished: result.finished,
        jumped: !!result.jumped,
        flewBack: !!result.jumped && gain < 0,
        gain,
        wasHome,
        wasInDanger,
        endsInDanger: after.state === "active" && isTokenInDanger(result.state, color, tokenIndex),
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

    const all = describeMoves(state, color, roll, legalMoves);
    // A flight back costs half a lap: only when nothing else is left.
    const forward = all.filter((m) => !m.flewBack);
    if (!forward.length) {
      all.sort((a, b) => b.captured - a.captured || b.gain - a.gain);
      return all[0].tokenIndex;
    }
    let moves = forward;

    const captureMoves = moves.filter((m) => m.captured > 0);
    if (captureMoves.length) {
      captureMoves.sort((a, b) => b.captured - a.captured || b.gain - a.gain);
      return captureMoves[0].tokenIndex;
    }

    // Arrow Ludo: a flight forward is worth 26 squares.
    const jumpMoves = moves.filter((m) => m.jumped);
    if (jumpMoves.length) return jumpMoves[0].tokenIndex;

    const leaveHomeMoves = moves.filter((m) => m.wasHome);
    if (leaveHomeMoves.length) return pickRandom(leaveHomeMoves).tokenIndex;

    if (level === 3) {
      const dangerMoves = moves.filter((m) => m.wasInDanger && !m.endsInDanger);
      if (dangerMoves.length) {
        dangerMoves.sort((a, b) => b.progress - a.progress);
        return dangerMoves[0].tokenIndex;
      }
    }

    const finishMoves = moves.filter((m) => m.finished);
    if (finishMoves.length) return finishMoves[0].tokenIndex;

    if (level === 3) {
      const safeMoves = moves.filter((m) => !m.endsInDanger);
      if (safeMoves.length) moves = safeMoves;
    }

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
