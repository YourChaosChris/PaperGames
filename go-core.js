// go-core.js
// Dependency-free Go rules engine: board state, captures, suicide/ko
// legality, and Chinese-style area scoring. Mirrors the separation of
// concerns in chess-core.js (rules only, no DOM/UI).
//
// Board representation: size x size array of rows, each cell is
// null | "b" | "w". Coordinates are [row, col], both 0-indexed.

const GoCore = (function () {
  const SIZES = [9, 13, 19];
  const DEFAULT_KOMI = 7.5; // Chinese-style area scoring komi

  const HOSHI = {
    9: [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]],
    13: [[3, 3], [3, 9], [9, 3], [9, 9], [6, 6]],
    19: [
      [3, 3], [3, 9], [3, 15],
      [9, 3], [9, 9], [9, 15],
      [15, 3], [15, 9], [15, 15]
    ]
  };

  function createEmptyBoard(size) {
    const board = [];
    for (let r = 0; r < size; r++) {
      board.push(new Array(size).fill(null));
    }
    return board;
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function inBounds(size, r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  function neighbors(size, r, c) {
    const result = [];
    if (r > 0) result.push([r - 1, c]);
    if (r < size - 1) result.push([r + 1, c]);
    if (c > 0) result.push([r, c - 1]);
    if (c < size - 1) result.push([r, c + 1]);
    return result;
  }

  function hoshiPoints(size) {
    return HOSHI[size] || [];
  }

  // Flood-fills the connected group of same-colored stones touching (r, c).
  function getGroup(board, size, r, c) {
    const color = board[r][c];
    const stones = [];
    const seen = new Set([r + "," + c]);
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      stones.push([cr, cc]);
      neighbors(size, cr, cc).forEach(([nr, nc]) => {
        const key = nr + "," + nc;
        if (!seen.has(key) && board[nr][nc] === color) {
          seen.add(key);
          stack.push([nr, nc]);
        }
      });
    }
    return { color, stones };
  }

  function getLiberties(board, size, group) {
    const libs = new Set();
    group.stones.forEach(([r, c]) => {
      neighbors(size, r, c).forEach(([nr, nc]) => {
        if (board[nr][nc] === null) libs.add(nr + "," + nc);
      });
    });
    return libs;
  }

  function countLiberties(board, size, r, c) {
    if (!board[r][c]) return 0;
    return getLiberties(board, size, getGroup(board, size, r, c)).size;
  }

  // Attempts to play `color` at (r, c). Does not mutate `board`.
  // Returns { legal: false, reason } or
  // { legal: true, board, captured: [[r,c], ...], koPoint: {r,c}|null }.
  function tryMove(board, size, r, c, color, koPoint) {
    if (!inBounds(size, r, c)) {
      return { legal: false, reason: "out_of_bounds" };
    }
    if (board[r][c]) {
      return { legal: false, reason: "occupied" };
    }
    if (koPoint && koPoint.r === r && koPoint.c === c) {
      return { legal: false, reason: "ko" };
    }

    const newBoard = cloneBoard(board);
    newBoard[r][c] = color;
    const opponent = color === "b" ? "w" : "b";
    const captured = [];

    neighbors(size, r, c).forEach(([nr, nc]) => {
      if (newBoard[nr][nc] === opponent) {
        const group = getGroup(newBoard, size, nr, nc);
        if (getLiberties(newBoard, size, group).size === 0) {
          group.stones.forEach(([gr, gc]) => {
            newBoard[gr][gc] = null;
          });
          captured.push(...group.stones);
        }
      }
    });

    const ownGroup = getGroup(newBoard, size, r, c);
    if (getLiberties(newBoard, size, ownGroup).size === 0) {
      return { legal: false, reason: "suicide" };
    }

    // Simple-ko approximation: a single-stone capture of a single-stone
    // group creates a ko point where immediate recapture is forbidden
    // for one move. Does not detect longer superko cycles.
    let newKoPoint = null;
    if (captured.length === 1 && ownGroup.stones.length === 1) {
      newKoPoint = { r: captured[0][0], c: captured[0][1] };
    }

    return { legal: true, board: newBoard, captured, koPoint: newKoPoint };
  }

  function hasAnyLegalMove(board, size, color, koPoint) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c]) continue;
        if (tryMove(board, size, r, c, color, koPoint).legal) return true;
      }
    }
    return false;
  }

  // Chinese-style area scoring: stones on the board plus empty regions
  // that border only one color. A region bordering both colors (dame)
  // counts for neither side. Assumes no dead stones remain on the board -
  // players are expected to play out captures before passing.
  function scoreArea(board, size, komi) {
    const k = typeof komi === "number" ? komi : DEFAULT_KOMI;
    let blackStones = 0;
    let whiteStones = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === "b") blackStones++;
        else if (board[r][c] === "w") whiteStones++;
      }
    }

    const visited = createEmptyBoard(size).map((row) => row.map(() => false));
    let blackTerritory = 0;
    let whiteTerritory = 0;
    let dame = 0;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] !== null || visited[r][c]) continue;
        const region = [];
        const borders = new Set();
        const stack = [[r, c]];
        visited[r][c] = true;
        while (stack.length) {
          const [cr, cc] = stack.pop();
          region.push([cr, cc]);
          neighbors(size, cr, cc).forEach(([nr, nc]) => {
            const val = board[nr][nc];
            if (val === null) {
              if (!visited[nr][nc]) {
                visited[nr][nc] = true;
                stack.push([nr, nc]);
              }
            } else {
              borders.add(val);
            }
          });
        }
        if (borders.size === 1) {
          if (borders.has("b")) blackTerritory += region.length;
          else whiteTerritory += region.length;
        } else {
          dame += region.length;
        }
      }
    }

    const blackScore = blackStones + blackTerritory;
    const whiteScore = whiteStones + whiteTerritory + k;
    let winner = null;
    if (blackScore > whiteScore) winner = "b";
    else if (whiteScore > blackScore) winner = "w";

    return {
      blackStones, whiteStones,
      blackTerritory, whiteTerritory,
      dame, komi: k,
      blackScore, whiteScore,
      winner
    };
  }

  return {
    SIZES,
    DEFAULT_KOMI,
    createEmptyBoard,
    cloneBoard,
    inBounds,
    neighbors,
    hoshiPoints,
    getGroup,
    getLiberties,
    countLiberties,
    tryMove,
    hasAnyLegalMove,
    scoreArea
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GoCore;
}
if (typeof window !== "undefined") {
  window.GoCore = GoCore;
}
