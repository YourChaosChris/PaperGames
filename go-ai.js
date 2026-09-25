// go-ai.js
// Offline Go opponent, three strength levels built on go-core.js:
//   1 = easy   - random legal move, avoids filling its own eyes
//   2 = medium - heuristic scoring (captures, atari, liberties, contact)
//   3 = hard   - heuristic shortlist + lightweight random-playout evaluation
//
// All three levels stop (return null, meaning "pass") once the board has no
// contested empty regions left (GoCore.scoreArea's `dame` is 0) - at that
// point every empty point already belongs to one side and playing on is
// either filling your own eye or invading settled territory for nothing.

const GoAi = (function () {
  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function isOnBoard(size, r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  // Simplified "real eye" test: an empty point whose orthogonal neighbors
  // are all one color, and most of its diagonal neighbors are too (or the
  // point is on an edge/corner, where all diagonals must match).
  function isSimpleEye(board, size, r, c, color) {
    if (board[r][c] !== null) return false;
    const orth = GoCore.neighbors(size, r, c);
    for (const [nr, nc] of orth) {
      if (board[nr][nc] !== color) return false;
    }
    const diagonals = [[r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1]]
      .filter(([dr, dc]) => isOnBoard(size, dr, dc));
    let friendly = 0;
    diagonals.forEach(([dr, dc]) => {
      if (board[dr][dc] === color) friendly++;
    });
    const required = diagonals.length < 4 ? diagonals.length : 3;
    return friendly >= required;
  }

  // "Settled" means no empty region touches both colors any more - i.e.
  // nothing is left to profitably contest. Requires stones of both colors
  // first, since a still-empty (or single-color) board is trivially "all
  // one region" by pure connectivity, which would otherwise look settled
  // before the game has even started.
  function isBoardSettled(board, size) {
    const score = GoCore.scoreArea(board, size, 0);
    if (score.blackStones === 0 || score.whiteStones === 0) return false;
    return score.dame === 0;
  }

  function collectLegalMoves(board, size, color, koPoint, history) {
    const moves = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c]) continue;
        const result = GoCore.tryMove(board, size, r, c, color, koPoint, history);
        if (result.legal) {
          moves.push({ r, c, result, fillsOwnEye: isSimpleEye(board, size, r, c, color) });
        }
      }
    }
    return moves;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function scoreCandidateHeuristic(board, size, color, move) {
    const opponent = otherColor(color);
    let score = 0;
    score += move.result.captured.length * 15;

    const newBoard = move.result.board;
    const ownGroup = GoCore.getGroup(newBoard, size, move.r, move.c);
    const ownLiberties = GoCore.getLiberties(newBoard, size, ownGroup).size;
    if (ownLiberties === 1 && move.result.captured.length === 0) {
      score -= 12; // self-atari with no compensating capture
    } else {
      score += Math.min(ownLiberties, 4);
    }

    GoCore.neighbors(size, move.r, move.c).forEach(([nr, nc]) => {
      if (newBoard[nr][nc] === opponent) {
        const grp = GoCore.getGroup(newBoard, size, nr, nc);
        if (GoCore.getLiberties(newBoard, size, grp).size === 1) {
          score += 8; // puts an opponent group in atari
        }
      }
    });

    let touchesStone = false;
    GoCore.neighbors(size, move.r, move.c).forEach(([nr, nc]) => {
      if (board[nr][nc]) touchesStone = true;
    });
    if (touchesStone) score += 2;

    if (move.fillsOwnEye) score -= 100;

    score += Math.random() * 3; // small jitter so play isn't fully deterministic
    return score;
  }

  function chooseEasyMove(board, size, color, koPoint, history) {
    if (isBoardSettled(board, size)) return null;
    const moves = collectLegalMoves(board, size, color, koPoint, history);
    const safe = moves.filter((m) => !m.fillsOwnEye);
    const pool = safe.length ? safe : moves;
    if (!pool.length) return null;
    return pickRandom(pool);
  }

  function chooseMediumMove(board, size, color, koPoint, history) {
    if (isBoardSettled(board, size)) return null;
    const moves = collectLegalMoves(board, size, color, koPoint, history);
    if (!moves.length) return null;
    const scored = moves
      .map((m) => ({ move: m, score: scoreCandidateHeuristic(board, size, color, m) }))
      .sort((a, b) => b.score - a.score);
    if (scored[0].score <= -50) return null;
    const topCount = Math.min(3, scored.length);
    return pickRandom(scored.slice(0, topCount)).move;
  }

  // Runtime is bounded per board size so this stays usable on slow E-Ink
  // browsers: fewer/shallower playouts and a smaller shortlist as the board
  // grows, since each playout's cost scales with the number of points.
  const HARD_PLAYOUTS_BY_SIZE = { 9: 10, 13: 6, 19: 4 };
  const HARD_MAX_PLIES_BY_SIZE = { 9: 60, 13: 90, 19: 130 };
  const HARD_SHORTLIST_BY_SIZE = { 9: 8, 13: 6, 19: 4 };
  const HARD_SAMPLE_ATTEMPTS = 12;

  function collectEmptyPoints(board, size) {
    const pts = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!board[r][c]) pts.push([r, c]);
      }
    }
    return pts;
  }

  // Cheap random rollout: samples a handful of random empty points per ply
  // instead of enumerating every legal move, so cost stays roughly linear
  // in board size rather than quadratic.
  function randomPlayoutRollout(board, size, startColor, maxPlies) {
    let current = board;
    let color = startColor;
    let koPoint = null;
    let consecutivePasses = 0;

    for (let ply = 0; ply < maxPlies && consecutivePasses < 2; ply++) {
      const emptyPoints = collectEmptyPoints(current, size);
      if (!emptyPoints.length) {
        consecutivePasses++;
        color = otherColor(color);
        continue;
      }

      let played = false;
      const attempts = Math.min(emptyPoints.length, HARD_SAMPLE_ATTEMPTS);
      const tried = new Set();
      for (let a = 0; a < attempts; a++) {
        let idx = Math.floor(Math.random() * emptyPoints.length);
        let guard = 0;
        while (tried.has(idx) && guard < emptyPoints.length) {
          idx = (idx + 1) % emptyPoints.length;
          guard++;
        }
        tried.add(idx);
        const [r, c] = emptyPoints[idx];
        if (isSimpleEye(current, size, r, c, color)) continue;
        const result = GoCore.tryMove(current, size, r, c, color, koPoint);
        if (result.legal) {
          current = result.board;
          koPoint = result.koPoint;
          played = true;
          break;
        }
      }

      consecutivePasses = played ? 0 : consecutivePasses + 1;
      color = otherColor(color);
    }
    return current;
  }

  function chooseHardMove(board, size, color, koPoint, history) {
    if (isBoardSettled(board, size)) return null;
    const moves = collectLegalMoves(board, size, color, koPoint, history);
    if (!moves.length) return null;

    const scored = moves
      .map((m) => ({ move: m, score: scoreCandidateHeuristic(board, size, color, m) }))
      .sort((a, b) => b.score - a.score);

    const shortlistSize = HARD_SHORTLIST_BY_SIZE[size] || 6;
    const shortlist = scored.slice(0, Math.min(shortlistSize, scored.length)).map((s) => s.move);
    const playouts = HARD_PLAYOUTS_BY_SIZE[size] || 6;
    const maxPlies = HARD_MAX_PLIES_BY_SIZE[size] || 80;
    const komi = GoCore.DEFAULT_KOMI;

    let best = null;
    let bestAvg = -Infinity;
    shortlist.forEach((m) => {
      let total = 0;
      for (let i = 0; i < playouts; i++) {
        const finalBoard = randomPlayoutRollout(m.result.board, size, otherColor(color), maxPlies);
        const score = GoCore.scoreArea(finalBoard, size, komi);
        const margin = color === "b"
          ? (score.blackScore - score.whiteScore)
          : (score.whiteScore - score.blackScore);
        total += margin;
      }
      const avg = total / playouts;
      if (avg > bestAvg) {
        bestAvg = avg;
        best = m;
      }
    });

    if (scored[0].score <= -50 && bestAvg < 0) return null;
    return best || scored[0].move;
  }

  // Returns { r, c, result } for the chosen move, or null to mean "pass".
  function chooseMove(board, size, color, level, koPoint, history) {
    if (level === 1) return chooseEasyMove(board, size, color, koPoint, history);
    if (level === 3) return chooseHardMove(board, size, color, koPoint, history);
    return chooseMediumMove(board, size, color, koPoint, history);
  }

  return {
    isSimpleEye,
    isBoardSettled,
    collectLegalMoves,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GoAi;
}
if (typeof window !== "undefined") {
  window.GoAi = GoAi;
}
