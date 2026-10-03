// tictactoe-ai.js
// Offline Tic-Tac-Toe opponent, three strength levels built on
// tictactoe-core.js:
//   1 = easy   - random legal move
//   2 = medium - win if it can, otherwise block the opponent's win,
//                otherwise random
//   3 = hard   - full minimax over the whole game tree (at most 9
//                plies, so no depth limit is needed). Among equal
//                results it prefers the quicker win and the later
//                loss, and picks at random between equally good moves
//                so games don't all look the same. Tic-Tac-Toe is a
//                draw with perfect play, so this level never loses.

const TicTacToeAi = (function () {
  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // A move that would complete a line for `player` right now, or null.
  function winningMoveFor(state, player) {
    const probe = TicTacToeCore.cloneState(state);
    probe.turn = player;
    for (const cell of TicTacToeCore.getLegalMoves(probe)) {
      if (TicTacToeCore.applyMove(probe, cell).winner === player) return cell;
    }
    return null;
  }

  // Score of `state` for `me`: 10 - depth for a win, depth - 10 for a
  // loss, 0 for a draw - so faster wins and slower losses score better.
  function minimax(state, me, depth) {
    if (state.gameOver) {
      if (state.winner === me) return 10 - depth;
      if (state.winner === "draw") return 0;
      return depth - 10;
    }
    const maximizing = state.turn === me;
    let best = maximizing ? -Infinity : Infinity;
    for (const cell of TicTacToeCore.getLegalMoves(state)) {
      const score = minimax(TicTacToeCore.applyMove(state, cell), me, depth + 1);
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  function bestMoves(state, me) {
    let bestScore = -Infinity;
    let best = [];
    for (const cell of TicTacToeCore.getLegalMoves(state)) {
      const score = minimax(TicTacToeCore.applyMove(state, cell), me, 1);
      if (score > bestScore) {
        bestScore = score;
        best = [cell];
      } else if (score === bestScore) {
        best.push(cell);
      }
    }
    return best;
  }

  function chooseMove(state, player, level) {
    const moves = TicTacToeCore.getLegalMoves(state);
    if (!moves.length) return null;
    if (typeof level !== "number" || level < 1) level = 1;
    if (level === 1) return pickRandom(moves);
    if (level === 2) {
      const win = winningMoveFor(state, player);
      if (win !== null) return win;
      const block = winningMoveFor(state, TicTacToeCore.otherPlayer(player));
      if (block !== null) return block;
      return pickRandom(moves);
    }
    return pickRandom(bestMoves(state, player));
  }

  return {
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TicTacToeAi;
}
if (typeof window !== "undefined") {
  window.TicTacToeAi = TicTacToeAi;
}
