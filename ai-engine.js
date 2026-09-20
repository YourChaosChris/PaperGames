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

  // Cheap (no move generation) structural terms - pawn shield in front of
  // each king, doubled pawns, and the bishop pair - added on top of the
  // material/positional score above without the cost of legal-move
  // generation, so stronger levels play more soundly without a large
  // per-node performance hit.
  function structuralBonus(board) {
    let score = 0;
    const pawnFileCount = { white: new Array(8).fill(0), black: new Array(8).fill(0) };
    let whiteBishops = 0;
    let blackBishops = 0;
    let whiteKing = null;
    let blackKing = null;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (!p) continue;
        const isWhite = ChessCore.isWhitePiece(p);
        const lower = p.toLowerCase();
        if (lower === 'p') {
          pawnFileCount[isWhite ? "white" : "black"][f]++;
        } else if (lower === 'b') {
          if (isWhite) whiteBishops++; else blackBishops++;
        } else if (lower === 'k') {
          if (isWhite) whiteKing = { r, f }; else blackKing = { r, f };
        }
      }
    }

    // Doubled pawns: small penalty per extra pawn sharing a file.
    for (let f = 0; f < 8; f++) {
      if (pawnFileCount.white[f] > 1) score -= (pawnFileCount.white[f] - 1) * 12;
      if (pawnFileCount.black[f] > 1) score += (pawnFileCount.black[f] - 1) * 12;
    }

    // Bishop pair: a real, well-known small advantage.
    if (whiteBishops >= 2) score += 25;
    if (blackBishops >= 2) score -= 25;

    // Pawn shield: friendly pawns on the two ranks in front of the king,
    // across its file and the two adjacent files. Cheap proxy for king
    // safety without needing attack-map generation.
    function shieldScore(king, isWhite) {
      if (!king) return 0;
      let shield = 0;
      const dir = isWhite ? 1 : -1;
      for (let df = -1; df <= 1; df++) {
        const f = king.f + df;
        if (f < 0 || f > 7) continue;
        for (let dr = 1; dr <= 2; dr++) {
          const r = king.r + dir * dr;
          if (r < 0 || r > 7) continue;
          const p = board[r][f];
          if (p && p.toLowerCase() === 'p' && ChessCore.isWhitePiece(p) === isWhite) {
            shield += 4;
            break;
          }
        }
      }
      return shield;
    }
    score += shieldScore(whiteKing, true);
    score -= shieldScore(blackKing, false);

    return score;
  }

  // Cheap mobility proxy: pseudo-legal move counts (no check filtering, so
  // far cheaper than generateLegalMoves) rewarding sides with more options.
  function mobilityBonus(board) {
    const whiteMoves = generatePseudoMovesForColor(board, "white").length;
    const blackMoves = generatePseudoMovesForColor(board, "black").length;
    return (whiteMoves - blackMoves) * 2;
  }

  function evaluateBoardFor(color, board, includeMobility) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        score += pieceValue(p);
        score += positionalBonus(p, r, f);
      }
    }
    score += structuralBonus(board);
    if (includeMobility) {
      score += mobilityBonus(board);
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

  const DIAGONAL_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const STRAIGHT_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const KNIGHT_DELTAS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

  function isFromColor(piece, wantWhite) {
    return wantWhite ? ChessCore.isWhitePiece(piece) : ChessCore.isBlackPiece(piece);
  }

  // Prüft direkt vom Zielfeld aus (Sprung-/Strahl-Muster), ob eine Figur von
  // byColor dieses Feld angreift - ohne für jede Prüfung alle pseudo-legalen
  // Züge des gesamten Bretts zu erzeugen. Das ist der heiße Pfad der
  // Legalitätsprüfung (wird bei jedem Zugkandidaten in jedem Suchknoten
  // aufgerufen), daher lohnt sich die direkte, allokationsfreie Variante.
  function isSquareAttacked(board, file, rank, byColor) {
    const wantWhite = byColor === "white";

    // Bauern: ein angreifender Bauer steht diagonal "hinter" dem Zielfeld
    // aus seiner eigenen Laufrichtung gesehen.
    const pawnRank = rank + (wantWhite ? -1 : 1);
    if (pawnRank >= 0 && pawnRank < 8) {
      for (const df of [-1, 1]) {
        const pf = file + df;
        if (pf < 0 || pf > 7) continue;
        const p = board[pawnRank][pf];
        if (p && p.toLowerCase() === "p" && isFromColor(p, wantWhite)) return true;
      }
    }

    // Springer
    for (const [df, dr] of KNIGHT_DELTAS) {
      const nr = rank + dr, nf = file + df;
      if (nr < 0 || nr > 7 || nf < 0 || nf > 7) continue;
      const p = board[nr][nf];
      if (p && p.toLowerCase() === "n" && isFromColor(p, wantWhite)) return true;
    }

    // König (angrenzende Felder)
    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const nr = rank + dr, nf = file + df;
        if (nr < 0 || nr > 7 || nf < 0 || nf > 7) continue;
        const p = board[nr][nf];
        if (p && p.toLowerCase() === "k" && isFromColor(p, wantWhite)) return true;
      }
    }

    // Gleitende Figuren: Läufer/Dame diagonal, Turm/Dame gerade
    function scan(dirs, matchTypes) {
      for (const [df, dr] of dirs) {
        let nr = rank + dr, nf = file + df;
        while (nr >= 0 && nr < 8 && nf >= 0 && nf < 8) {
          const p = board[nr][nf];
          if (p) {
            if (isFromColor(p, wantWhite) && matchTypes.indexOf(p.toLowerCase()) !== -1) return true;
            break; // blockiert, unabhängig von der Farbe
          }
          nr += dr;
          nf += df;
        }
      }
      return false;
    }

    if (scan(DIAGONAL_DIRS, ["b", "q"])) return true;
    if (scan(STRAIGHT_DIRS, ["r", "q"])) return true;

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

  function generateLegalMoves(board, color, pseudoFilter) {
    let pseudo = generatePseudoMovesForColor(board, color);
    if (pseudoFilter) {
      pseudo = pseudo.filter(pseudoFilter);
    }
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

  function isCaptureOrPromotion(board, m) {
    const to = ChessCore.coordToIndex(m.to);
    return !!board[to.rank][to.file] || !!m.promotion;
  }

  // Wie generateLegalMoves, aber verwirft Nicht-Schlagzüge schon vor dem
  // teuren Klon-und-Legalitätscheck. Für die Quiescence-Suche, wo ohnehin nur
  // Schlagzüge/Umwandlungen relevant sind, spart das die meisten der sonst
  // nötigen Board-Klone (in einer normalen Stellung sind nur wenige der
  // pseudo-legalen Züge Schlagzüge).
  function generateLegalCaptures(board, color) {
    return generateLegalMoves(board, color, (m) => isCaptureOrPromotion(board, m));
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

  // Level ladder matches Lichess's own AI spacing (levels 1-5: ~800/1100/
  // 1400/1700/2000 Elo) so the offline and online options read the same way.
  // These labels are necessarily approximate - there's no way to rate a
  // client-side engine against a real pool without playing it out - but the
  // depth/budget below are tuned to close the gap as much as is practical
  // on E-Ink-class hardware. nodeBudget bounds worst-case search time via
  // the iterative-deepening cutoff in searchBestMove(): a slow device still
  // gets an answer, just from a shallower completed depth.
  const LEVEL_CONFIG = {
    1: { style: "greedy", topN: 5 },
    2: { style: "search", maxDepth: 2, nodeBudget: 40000 },
    3: { style: "search", maxDepth: 3, nodeBudget: 150000 },
    4: { style: "search", maxDepth: 4, nodeBudget: 400000 },
    5: { style: "search", maxDepth: 5, nodeBudget: 600000 }
  };

  function chooseMove(board, color, level) {
    const moves = generateLegalMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) {
      level = 1;
    }
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[5];

    if (config.style === "greedy") {
      // ~800 Elo: a real (if shallow) look at the position rather than a
      // purely random mover, which plays far weaker than any human
      // beginner since it hangs pieces every single move.
      const scored = [];
      for (const m of moves) {
        const b2 = cloneBoard(board);
        ChessCore.applyMove(b2, m.from, m.to, m.promotion);
        scored.push({ move: m, score: evaluateBoardFor(color, b2) });
      }
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget);
  }

  // Iterative deepening: searches depth 1, 2, 3, ... up to maxDepth,
  // re-using each completed depth's best move(s) to order the next
  // iteration's root moves (principal-variation-first ordering, which
  // makes alpha-beta pruning far more effective at deeper depths). If the
  // shared node budget is exhausted mid-depth, that depth's incomplete
  // result is discarded and the last fully completed depth's move is kept -
  // this bounds worst-case time on slow hardware instead of the search
  // just taking however long a given position happens to need.
  function searchBestMove(board, color, moves, maxDepth, nodeBudget) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false };
    let orderedMoves = moves.slice();

    const rootScored = orderedMoves.map((m) => {
      const b2 = cloneBoard(board);
      ChessCore.applyMove(b2, m.from, m.to, m.promotion);
      return { move: m, score: evaluateBoardFor(color, b2) };
    });
    // Small jitter on the initial ordering only, so otherwise-tied opening
    // choices still vary between games without needing to track exact
    // ties through the (now root-alpha-tightened) deep search below.
    rootScored.forEach((e) => { e.score += (Math.random() - 0.5) * 2; });
    rootScored.sort((a, b) => b.score - a.score);
    orderedMoves = rootScored.map((e) => e.move);

    let lastCompleteBestMove = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF; // tightened after each root move - real alpha-beta pruning between siblings, not just within one
      let depthAborted = false;

      for (const m of orderedMoves) {
        const b2 = cloneBoard(board);
        ChessCore.applyMove(b2, m.from, m.to, m.promotion);
        const score = minimax(b2, otherColor(color), 1, depth, alpha, INF, color, searchState);
        if (searchState.aborted) {
          depthAborted = true;
          break;
        }
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
          if (score > alpha) alpha = score;
        }
      }

      if (depthAborted || !bestMove) break;

      lastCompleteBestMove = bestMove;
      // Principal-variation-first ordering for the next (deeper) iteration.
      orderedMoves = [bestMove].concat(orderedMoves.filter((m) => m !== bestMove));
    }

    return lastCompleteBestMove || moves[Math.floor(Math.random() * moves.length)];
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

  const QUIESCENCE_MAX_DEPTH = 2;

  // Sucht über den Suchhorizont hinaus weiter, aber nur Schlagzüge (und
  // Umwandlungen), bis die Stellung "ruhig" ist. Vermeidet den Horizont-Effekt,
  // bei dem die Engine mitten in einer Schlagserie abbricht und z. B. eine
  // Dame für einen Bauern hergibt, weil der Rückschlag erst einen Halbzug
  // später sichtbar wäre.
  function quiescence(board, colorToMove, alpha, beta, perspective, qDepth, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget) {
        searchState.aborted = true;
        return 0;
      }
    }

    const standPat = evaluateBoardFor(perspective, board, true);
    const isMaximizing = (colorToMove === perspective);

    if (isMaximizing) {
      if (standPat >= beta) return standPat;
      if (standPat > alpha) alpha = standPat;
    } else {
      if (standPat <= alpha) return standPat;
      if (standPat < beta) beta = standPat;
    }

    if (qDepth <= 0) return standPat;

    const captures = generateLegalCaptures(board, colorToMove);
    if (!captures.length) return standPat;

    const ordered = orderMoves(board, captures);
    let best = standPat;
    for (const m of ordered) {
      const b2 = cloneBoard(board);
      ChessCore.applyMove(b2, m.from, m.to, m.promotion);
      const score = quiescence(b2, otherColor(colorToMove), alpha, beta, perspective, qDepth - 1, searchState);
      if (searchState && searchState.aborted) return best;
      if (isMaximizing) {
        if (score > best) best = score;
        if (score > alpha) alpha = score;
      } else {
        if (score < best) best = score;
        if (score < beta) beta = score;
      }
      if (beta <= alpha) break;
    }
    return best;
  }

  // searchState (optional) bounds total node count across an entire
  // iterative-deepening run (see searchBestMove) so a slow device gets a
  // timely answer from the last fully completed depth instead of the
  // search running as long as a given position happens to demand.
  function minimax(board, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget) {
        searchState.aborted = true;
        return 0;
      }
    }

    if (depth >= maxDepth) {
      return quiescence(board, colorToMove, alpha, beta, perspective, QUIESCENCE_MAX_DEPTH, searchState);
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
        const score = minimax(b2, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
        if (searchState && searchState.aborted) return best;
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
        const score = minimax(b2, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
        if (searchState && searchState.aborted) return best;
        if (score < best) best = score;
        if (score < beta) beta = score;
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  // Remis wegen unzureichenden Materials: nur Könige, K+Springer/Läufer vs. K,
  // oder K+Läufer vs. K+Läufer mit gleichfarbigen Läufern.
  function hasInsufficientMaterial(board) {
    const rest = { white: [], black: [] };
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (!p || p.toLowerCase() === "k") continue;
        const color = ChessCore.isWhitePiece(p) ? "white" : "black";
        rest[color].push({ type: p.toLowerCase(), file: f, rank: r });
      }
    }

    const all = rest.white.concat(rest.black);
    if (all.some((p) => p.type === "p" || p.type === "r" || p.type === "q")) {
      return false;
    }

    if (rest.white.length === 0 && rest.black.length === 0) return true; // K vs K
    if (rest.white.length + rest.black.length === 1) return true; // K+minor vs K

    if (rest.white.length === 1 && rest.black.length === 1 &&
        rest.white[0].type === "b" && rest.black[0].type === "b") {
      const whiteSquareColor = (rest.white[0].file + rest.white[0].rank) % 2;
      const blackSquareColor = (rest.black[0].file + rest.black[0].rank) % 2;
      return whiteSquareColor === blackSquareColor;
    }

    return false;
  }

  return {
    generateLegalMoves,
    generatePseudoMovesForColor,
    chooseMove,
    detectGameEnd,
    isKingInCheck,
    hasInsufficientMaterial
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AiEngine;
}
if (typeof window !== "undefined") {
  window.AiEngine = AiEngine;
}
