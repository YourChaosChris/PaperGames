// dotsandboxes-ai.js
// Offline Dots and Boxes opponent, three strength levels built on
// dotsandboxes-core.js, mirroring the plain heuristic-tiers structure of
// wallmaze-ai.js/mancala-ai.js rather than a full minimax search - the
// game's real skill (chain/"double-cross" control) doesn't come from
// searching deeper, it comes from not handing the opponent a free box.
//   1 = easy   - random legal move, no lookahead at all
//   2 = medium - take any free box, otherwise avoid setting up a free
//                box for the opponent, otherwise play randomly
//   3 = hard   - same, but when forced to open a box up (no safe move
//                exists), picks whichever sacrifice lets the opponent
//                capture the fewest boxes in their immediate follow-up
//                run, instead of picking one at random

const DotsAndBoxesAi = (function () {
  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Among a set of capturing moves, prefers one that completes two
  // boxes at once (the line sits between two boxes that were both
  // already at 3 sides) over one that only completes a single box -
  // not because it scores differently in the end, but because it's the
  // more natural, alert-looking capture when the choice is free.
  function preferDoubleCaptures(state, captures) {
    const doubles = captures.filter((m) =>
      DotsAndBoxesCore.adjacentBoxes(m).filter(([br, bc]) =>
        state.boxes[br][bc] == null && DotsAndBoxesCore.boxSidesDrawn(state, br, bc) === 3
      ).length === 2
    );
    return doubles.length ? doubles : captures;
  }

  // Plays out ONLY the opponent's side of a greedy capture run starting
  // from `state`: as long as it's their turn and a free box is sitting
  // there for the taking, they take it (always taking the first one
  // found is fine here - this is just measuring how costly a sacrifice
  // is, not planning the AI's own future moves). Returns how many boxes
  // they grab before either the game ends or a free box runs out and
  // the turn would pass back.
  function simulateOpponentGreedyRun(state, sacrificingPlayer) {
    let current = state;
    let captured = 0;
    const opponent = DotsAndBoxesCore.otherPlayer(sacrificingPlayer);
    while (!current.gameOver && current.turn === opponent) {
      const captures = DotsAndBoxesCore.capturingMoves(current);
      if (!captures.length) break;
      const result = DotsAndBoxesCore.applyMove(current, captures[0]);
      captured += result.boxesCompleted.length;
      current = result.state;
    }
    return captured;
  }

  // Only called once no safe move exists, i.e. every remaining line
  // opens up at least one box for the opponent. A one-ply lookahead per
  // candidate approximates the real "open the shortest chain" idea from
  // double-cross strategy without implementing full chain analysis:
  // for each candidate, simulate the opponent grabbing everything they
  // can afterward, and play whichever candidate gives away the least.
  function chooseLeastCostlySacrifice(state, moves) {
    let bestMove = moves[0];
    let bestLoss = Infinity;
    moves.forEach((move) => {
      const { state: afterMove } = DotsAndBoxesCore.applyMove(state, move);
      const loss = simulateOpponentGreedyRun(afterMove, state.turn);
      if (loss < bestLoss) {
        bestLoss = loss;
        bestMove = move;
      }
    });
    return bestMove;
  }

  function chooseMove(state, player, level) {
    const moves = DotsAndBoxesCore.getLegalMoves(state);
    if (!moves.length) return null;
    if (typeof level !== "number" || level < 1) level = 1;

    if (level === 1) {
      return pickRandom(moves);
    }

    const captures = DotsAndBoxesCore.capturingMoves(state);
    if (captures.length) {
      return pickRandom(preferDoubleCaptures(state, captures));
    }

    const safe = DotsAndBoxesCore.safeMoves(state);
    if (safe.length) {
      return pickRandom(safe);
    }

    // Every remaining move opens a box. Medium just accepts that and
    // plays randomly; hard tries to lose as little territory as
    // possible.
    if (level <= 2) {
      return pickRandom(moves);
    }
    return chooseLeastCostlySacrifice(state, moves);
  }

  return {
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DotsAndBoxesAi;
}
if (typeof window !== "undefined") {
  window.DotsAndBoxesAi = DotsAndBoxesAi;
}
