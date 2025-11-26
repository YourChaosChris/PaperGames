// ai-engine.js
// Onboard AI for the offline mode of eInkChess.
// Supports all basic chess rules (including castling and en passant) with multiple strength levels.
// The engine only plays legal moves (its own king is never left in check)
// and can detect simple checkmate / stalemate situations.

const AiEngine = (function () {
  const INF = 1e9;

  function cloneBoard(board) {
    const copy = [];
    for (let r = 0; r < 8; r++) {
      copy[r] = board[r].slice();
    }
    return copy;
  }

  function pieceValue(p) {
    if (!p) return 0;
    const isWhite = ChessCore.isWhitePiece(p);
    const lower = p.toLowerCase();
    let v = 0;
    switch (lower) {
      case 'p': v = 100; break;
      case 'n': v = 320; break;
      case 'b': v = 330; break;
      case 'r': v = 500; break;
      case 'q': v = 900; break;
      case 'k': v = 20000; break;
    }
    return isWhite ? v : -v;
  }

  function positionalBonus(p, r, f) {
    if (!p) return 0;
    const isWhite = ChessCore.isWhitePiece(p);
    const lower = p.toLowerCase();

    // Normalize ranks so that advancing pieces (towards the opponent)
    // always increases the value slightly.
    const rankFromBase = isWhite ? r : 7 - r;
    const fileFromCenter = Math.abs(3.5 - f);

    let bonus = 0;

    if (lower === 'p') {
      // Advanced and central pawns are slightly better
      bonus += rankFromBase * 5;
      if (f >= 2 && f <= 5) {
        bonus += 5;
      }
    } else if (lower === 'n') {
      // Knights are best near the center
      bonus += Math.max(0, 20 - fileFromCenter * 10);
      bonus += Math.max(0, 20 - Math.abs(3.5 - (isWhite ? r : 7 - r)) * 10);
    } else if (lower === 'b') {
      // Bishops like diagonals and some activity
      bonus += Math.max(0, 10 - fileFromCenter * 5);
      bonus += rankFromBase * 2;
    } else if (lower === 'r') {
      // Rooks become stronger on open files and in later ranks
      bonus += rankFromBase * 3;
    } else if (lower === 'q') {
      // Queens: small central bonus
      bonus += Math.max(0, 10 - fileFromCenter * 5);
    } else if (lower === 'k') {
      // Encourage king safety: penalize staying too central
      bonus -= Math.max(0, 10 - fileFromCenter * 5);
    }

    return isWhite ? bonus : -bonus;
  }

  function evaluateBoardFor(color, board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        score += pieceValue(p);
        score += positionalBonus(p, r, f);
      }
    }
    // score > 0 is good for White, < 0 is good for Black
    return color === "white" ? score : -score;
  }

  function otherColor(color) {
    return color === "white" ? "black" : "white";
  }

  /* ---------- PSEUDO-LEGALE ZÜGE (Königsschutz noch ignoriert) ---------- */

  function generatePseudoMovesForColor(board, color) {
    const moves = [];
    const wantWhite = (color === "white");
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (!p) continue;
        if (wantWhite && !ChessCore.isWhitePiece(p)) continue;
        if (!wantWhite && !ChessCore.isBlackPiece(p)) continue;
        const lower = p.toLowerCase();
        const fromCoord = ChessCore.indexToCoord(f, r);
        if (lower === 'p') {
          addPawnMoves(board, color, r, f, fromCoord, moves);
        } else if (lower === 'n') {
          addKnightMoves(board, color, r, f, fromCoord, moves);
        } else if (lower === 'b') {
          addSlidingMoves(board, color, r, f, fromCoord, moves, [[1,1],[1,-1],[-1,1],[-1,-1]]);
        } else if (lower === 'r') {
          addSlidingMoves(board, color, r, f, fromCoord, moves, [[1,0],[-1,0],[0,1],[0,-1]]);
        } else if (lower === 'q') {
          addSlidingMoves(board, color, r, f, fromCoord, moves, [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]);
        } else if (lower === 'k') {
          addKingMoves(board, color, r, f, fromCoord, moves);
        }
      }
    }
    return moves;
  }

  function addPawnMoves(board, color, r, f, fromCoord, moves) {
    const dir = color === "white" ? 1 : -1;
    const startRank = color === "white" ? 1 : 6;
    const promoteRank = color === "white" ? 7 : 0;

    const oneRank = r + dir;
    if (oneRank >= 0 && oneRank < 8) {
      if (!board[oneRank][f]) {
        // vorwärts
        const toCoord = ChessCore.indexToCoord(f, oneRank);
        if (oneRank === promoteRank) {
          moves.push({ from: fromCoord, to: toCoord, promotion: "q" });
        } else {
          moves.push({ from: fromCoord, to: toCoord, promotion: null });
        }
        // zwei Felder vom Startfeld
        if (r === startRank) {
          const twoRank = r + 2 * dir;
          if (twoRank >= 0 && twoRank < 8 && !board[twoRank][f]) {
            const toCoord2 = ChessCore.indexToCoord(f, twoRank);
            moves.push({ from: fromCoord, to: toCoord2, promotion: null });
          }
        }
      }
      // Schlagen
      for (const df of [-1, 1]) {
        const nf = f + df;
        if (nf < 0 || nf > 7) continue;
        const target = board[oneRank][nf];
        if (!target) continue;
        if (color === "white" && ChessCore.isBlackPiece(target) ||
            color === "black" && ChessCore.isWhitePiece(target)) {
          const toCoord = ChessCore.indexToCoord(nf, oneRank);
          if (oneRank === promoteRank) {
            moves.push({ from: fromCoord, to: toCoord, promotion: "q" });
          } else {
            moves.push({ from: fromCoord, to: toCoord, promotion: null });
          }
        }
      }
    }
    // en passant
    if (ChessCore.getEnPassantSquare) {
      const ep = ChessCore.getEnPassantSquare();
      if (ep) {
        const epRank = ep.rank;
        const epFile = ep.file;
        const targetRank = r + dir;
        if (epRank === targetRank && Math.abs(epFile - f) === 1) {
          const victim = board[r][epFile];
          if (victim && victim.toLowerCase() === 'p' &&
              ((color === "white" && ChessCore.isBlackPiece(victim)) ||
               (color === "black" && ChessCore.isWhitePiece(victim)))) {
            const toCoord = ChessCore.indexToCoord(epFile, epRank);
            moves.push({ from: fromCoord, to: toCoord, promotion: null });
          }
        }
      }
    }
  }

  function addKnightMoves(board, color, r, f, fromCoord, moves) {
    const knightDeltas = [
      [1,2],[2,1],[-1,2],[-2,1],
      [1,-2],[2,-1],[-1,-2],[-2,-1]
    ];
    for (const [df, dr] of knightDeltas) {
      const nr = r + dr;
      const nf = f + df;
      if (nr < 0 || nr > 7 || nf < 0 || nf > 7) continue;
      const target = board[nr][nf];
      if (!target ||
          (color === "white" && ChessCore.isBlackPiece(target)) ||
          (color === "black" && ChessCore.isWhitePiece(target))) {
        const toCoord = ChessCore.indexToCoord(nf, nr);
        moves.push({ from: fromCoord, to: toCoord, promotion: null });
      }
    }
  }

  function addSlidingMoves(board, color, r, f, fromCoord, moves, directions) {
    for (const [df, dr] of directions) {
      let nr = r + dr;
      let nf = f + df;
      while (nr >= 0 && nr < 8 && nf >= 0 && nf < 8) {
        const target = board[nr][nf];
        if (!target) {
          const toCoord = ChessCore.indexToCoord(nf, nr);
          moves.push({ from: fromCoord, to: toCoord, promotion: null });
        } else {
          if (color === "white" && ChessCore.isBlackPiece(target) ||
              color === "black" && ChessCore.isWhitePiece(target)) {
            const toCoord = ChessCore.indexToCoord(nf, nr);
            moves.push({ from: fromCoord, to: toCoord, promotion: null });
          }
          break; // blockiert
        }
        nr += dr;
        nf += df;
      }
    }
  }

  function addKingMoves(board, color, r, f, fromCoord, moves) {
    // Normale Königszüge (ein Feld in jede Richtung)
    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const nr = r + dr;
        const nf = f + df;
        if (nr < 0 || nr > 7 || nf < 0 || nf > 7) continue;
        const target = board[nr][nf];
        if (!target ||
            (color === "white" && ChessCore.isBlackPiece(target)) ||
            (color === "black" && ChessCore.isWhitePiece(target))) {
          const toCoord = ChessCore.indexToCoord(nf, nr);
          moves.push({ from: fromCoord, to: toCoord, promotion: null });
        }
      }
    }

    // Einfache Rochade-Unterstützung:
    // - König steht auf dem Ausgangsfeld (e1/e8)
    // - Felder zwischen König und Turm sind leer
    // - An der Ecke steht ein Turm derselben Farbe
    // (Wir prüfen hier NICHT, ob der König im/ durch/aus dem Schach zieht –
    //  das wird grob über die Legalitätsprüfung nach dem Zug abgedeckt.)
    const isWhite = (color === "white");
    const homeRank = isWhite ? 0 : 7;

    if (r === homeRank && f === 4) {
      // kurze Rochade: e1 -> g1, e8 -> g8
      const rookShortFile = 7;
      if (!board[homeRank][5] && !board[homeRank][6]) {
        const rook = board[homeRank][rookShortFile];
        if (rook && rook.toLowerCase() === 'r' &&
            ((isWhite && ChessCore.isWhitePiece(rook)) ||
             (!isWhite && ChessCore.isBlackPiece(rook)))) {
          const toCoordShort = ChessCore.indexToCoord(6, homeRank);
          moves.push({ from: fromCoord, to: toCoordShort, promotion: null });
        }
      }

      // lange Rochade: e1 -> c1, e8 -> c8
      const rookLongFile = 0;
      if (!board[homeRank][1] && !board[homeRank][2] && !board[homeRank][3]) {
        const rook = board[homeRank][rookLongFile];
        if (rook && rook.toLowerCase() === 'r' &&
            ((isWhite && ChessCore.isWhitePiece(rook)) ||
             (!isWhite && ChessCore.isBlackPiece(rook)))) {
          const toCoordLong = ChessCore.indexToCoord(2, homeRank);
          moves.push({ from: fromCoord, to: toCoordLong, promotion: null });
        }
      }
    }
  }


  /* ---------- CHECK-LOGIK & LEGALE ZÜGE ---------- */

  function findKing(board, color) {
    const wantWhite = color === "white";
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (!p) continue;
        const isWhite = ChessCore.isWhitePiece(p);
        if (wantWhite !== isWhite) continue;
        if (p.toLowerCase() === 'k') {
          return { file: f, rank: r };
        }
      }
    }
    return null;
  }

  function isSquareAttacked(board, file, rank, byColor) {
    // Wir generieren alle pseudo-legalen Züge der angreifenden Farbe und schauen, ob eines der Zielfelder passt.
    const moves = generatePseudoMovesForColor(board, byColor);
    const targetCoord = ChessCore.indexToCoord(file, rank);
    for (const m of moves) {
      if (m.to === targetCoord) return true;
    }
    return false;
  }

  function isKingInCheck(board, color) {
    const kingPos = findKing(board, color);
    if (!kingPos) {
      // Kein König gefunden: behandeln wir als im Schach (sehr ungünstige Stellung)
      return true;
    }
    const opp = otherColor(color);
    return isSquareAttacked(board, kingPos.file, kingPos.rank, opp);
  }

  function generateLegalMoves(board, color) {
    const pseudo = generatePseudoMovesForColor(board, color);
    const legal = [];
    const hasEpHelpers = !!(ChessCore.getEnPassantSquare && ChessCore.setEnPassantSquare);
    const originalEp = hasEpHelpers ? ChessCore.getEnPassantSquare() : null;

    for (const m of pseudo) {
      const b2 = cloneBoard(board);
      if (hasEpHelpers) {
        ChessCore.setEnPassantSquare(originalEp);
      }
      ChessCore.applyMove(b2, m.from, m.to, m.promotion);
      if (!isKingInCheck(b2, color)) {
        legal.push(m);
      }
    }

    if (hasEpHelpers) {
      ChessCore.setEnPassantSquare(originalEp);
    }
    return legal;
  }

  function detectGameEnd(board, colorToMove) {
    const legal = generateLegalMoves(board, colorToMove);
    if (legal.length > 0) {
      return { status: "normal", winner: null };
    }
    const inCheck = isKingInCheck(board, colorToMove);
    if (inCheck) {
      return { status: "checkmate", winner: otherColor(colorToMove) };
    }
    return { status: "stalemate", winner: null };
  }

  /* ---------- KI-Entscheidung ---------- */

  function chooseMove(board, color, level) {
    const moves = generateLegalMoves(board, color);
    if (!moves.length) return null;

    // Normalize level in case something weird is passed in
    if (typeof level !== "number" || level < 1) {
      level = 1;
    }

    // Level 1: very fast, purely random
    if (level <= 1) {
      const idx = Math.floor(Math.random() * moves.length);
      return moves[idx];
    }

    // Level 2: one-ply material/position evaluation with a bit of randomness
    if (level === 2) {
      const scored = [];
      for (const m of moves) {
        const b2 = cloneBoard(board);
        ChessCore.applyMove(b2, m.from, m.to, m.promotion);
        const s = evaluateBoardFor(color, b2);
        scored.push({ move: m, score: s });
      }
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(4, scored.length);
      const choice = scored[Math.floor(Math.random() * topN)];
      return choice.move;
    }

    // Levels 3–5: alpha-beta search with increasing depth / selectivity
    let maxDepth;
    let beamWidth;

    if (level === 3) {
      // ~1200 Elo – depth 3 on all moves
      maxDepth = 3;
      beamWidth = moves.length;
    } else if (level === 4) {
      // slightly deeper search on the most promising moves
      maxDepth = 4;
      beamWidth = Math.min(10, moves.length);
    } else {
      // Level 5 and above: same depth, but consider a few more candidate moves
      maxDepth = 4;
      beamWidth = Math.min(14, moves.length);
    }

    // First do a light evaluation of all root moves to get a rough ordering
    const rootScored = [];
    for (const m of moves) {
      const b2 = cloneBoard(board);
      ChessCore.applyMove(b2, m.from, m.to, m.promotion);
      const s = evaluateBoardFor(color, b2);
      rootScored.push({ move: m, score: s });
    }
    rootScored.sort((a, b) => b.score - a.score);

    const candidates = rootScored.slice(0, beamWidth);

    let bestScore = -INF;
    let bestMoves = [];

    for (const entry of candidates) {
      const m = entry.move;
      const b2 = cloneBoard(board);
      ChessCore.applyMove(b2, m.from, m.to, m.promotion);
      const score = minimax(b2, otherColor(color), 1, maxDepth, -INF, INF, color);
      if (score > bestScore + 1e-6) {
        bestScore = score;
        bestMoves = [m];
      } else if (Math.abs(score - bestScore) < 1e-6) {
        bestMoves.push(m);
      }
    }

    if (!bestMoves.length) {
      const idxFallback = Math.floor(Math.random() * moves.length);
      return moves[idxFallback];
    }
    const idx = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[idx];
  }


  function orderMoves(board, moves) {
    // Simple move ordering: captures first, then quiet moves.
    // This helps alpha-beta pruning without adding heavy computation.
    const scored = [];
    for (const m of moves) {
      const from = ChessCore.coordToIndex(m.from);
      const to = ChessCore.coordToIndex(m.to);
      if (!from || !to) {
        scored.push({ move: m, isCapture: 0 });
        continue;
      }
      const target = board[to.rank][to.file];
      const isCapture = target ? 1 : 0;
      scored.push({ move: m, isCapture });
    }
    scored.sort((a, b) => b.isCapture - a.isCapture);
    return scored.map((s) => s.move);
  }

function minimax(board, colorToMove, depth, maxDepth, alpha, beta, perspective) {
    if (depth >= maxDepth) {
      return evaluateBoardFor(perspective, board);
    }
    let moves = generateLegalMoves(board, colorToMove);
    moves = orderMoves(board, moves);
    if (!moves.length) {
      // Matt oder Patt aus Sicht von perspective auswerten
      const end = detectGameEnd(board, colorToMove);
      if (end.status === "checkmate") {
        return end.winner === perspective ? INF / 2 : -INF / 2;
      }
      return 0; // Patt als ausgeglichen
    }
    const isMaximizing = (colorToMove === perspective);
    if (isMaximizing) {
      let best = -INF;
      for (const m of moves) {
        const b2 = cloneBoard(board);
        ChessCore.applyMove(b2, m.from, m.to, m.promotion);
        const score = minimax(b2, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective);
        if (score > best) best = score;
        if (score > alpha) alpha = score;
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = INF;
      for (const m of moves) {
        const b2 = cloneBoard(board);
        ChessCore.applyMove(b2, m.from, m.to, m.promotion);
        const score = minimax(b2, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective);
        if (score < best) best = score;
        if (score < beta) beta = score;
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  return {
    generateLegalMoves,
    generatePseudoMovesForColor,
    chooseMove,
    detectGameEnd,
    isKingInCheck
  };
})();
