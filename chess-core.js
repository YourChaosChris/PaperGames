// chess-core.js
// Sehr einfache Board-Verwaltung und FEN-Unterstützung.
// KEINE vollständige Regelprüfung – Lichess validiert die Züge online.

const ChessCore = (function () {
  let enPassantSquare = null;
  // Rochaderechte: K/Q = Weiß kurz/lang, k/q = Schwarz kurz/lang. Gehen
  // verloren, sobald der König oder der betreffende Turm zieht oder der
  // Turm auf seinem Ausgangsfeld geschlagen wird.
  let castlingRights = { K: true, Q: true, k: true, q: true };
  const FILES = ['a','b','c','d','e','f','g','h'];

  function createInitialBoard() {
    // board[rank][file], rank 0 = 1. Reihe (weiße Grundreihe)
    const emptyRank = Array(8).fill(null);
    const board = [];
    // Rank 8 (schwarz)
    board[7] = [
      'r','n','b','q','k','b','n','r'
    ];
    board[6] = Array(8).fill('p');
    board[5] = emptyRank.slice();
    board[4] = emptyRank.slice();
    board[3] = emptyRank.slice();
    board[2] = emptyRank.slice();
    board[1] = Array(8).fill('P');
    board[0] = [
      'R','N','B','Q','K','B','N','R'
    ];
    return board;
  }

  function emptyBoard() {
    const board = [];
    for (let r = 0; r < 8; r++) {
      board[r] = Array(8).fill(null);
    }
    return board;
  }

  function coordToIndex(coord) {
    // Beispiel "e2"
    if (!coord || coord.length < 2) return null;
    const fileChar = coord[0].toLowerCase();
    const rankChar = coord[1];
    const file = FILES.indexOf(fileChar);
    const rankNum = parseInt(rankChar, 10);
    if (file < 0 || isNaN(rankNum) || rankNum < 1 || rankNum > 8) return null;
    const rank = rankNum - 1;
    return { file, rank };
  }

  function indexToCoord(file, rank) {
    // rank 0 -> "1"
    return FILES[file] + String(rank + 1);
  }

  function parseFEN(fen) {
    // Gibt { board, turn } zurück. Andere Felder werden ignoriert.
    const parts = fen.split(' ');
    const placement = parts[0];
    const turn = parts[1] === 'b' ? 'black' : 'white';

    const board = emptyBoard();
    const ranks = placement.split('/');
    if (ranks.length !== 8) {
      return { board: createInitialBoard(), turn };
    }
    // FEN: rank 8 zuerst -> board[7] bis board[0]
    for (let fenRank = 0; fenRank < 8; fenRank++) {
      const row = ranks[fenRank];
      let file = 0;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (/[1-8]/.test(ch)) {
          file += parseInt(ch, 10);
        } else {
          const boardRank = 7 - fenRank;
          if (file >= 0 && file < 8 && boardRank >= 0 && boardRank < 8) {
            board[boardRank][file] = ch;
          }
          file++;
        }
      }
    }
    return { board, turn };
  }

  function applyMove(board, fromCoord, toCoord, promotionPiece) {
    // Sehr einfache Move-Anwendung, keine Legality-Checks.
    const from = coordToIndex(fromCoord);
    const to = coordToIndex(toCoord);
    if (!from || !to) return;
    const piece = board[from.rank][from.file];
    if (!piece) return;

    // En passant capture
    // If pawn moves diagonally to empty square matching enPassantSquare
    if (piece.toLowerCase() === 'p' && from.file !== to.file && board[to.rank][to.file] == null && enPassantSquare) {
        const ep = enPassantSquare;
        if (ep.rank === to.rank && ep.file === to.file) {
            // capture pawn behind
            const dir = (piece === piece.toUpperCase()) ? 1 : -1; // white up (towards higher ranks), black down
            board[to.rank - dir][to.file] = null;
        }
    }

    // Basiszug: Figur vom Startfeld wegnehmen
    board[from.rank][from.file] = null;

    // Sonderfall: einfache Rochade-Erkennung.
    // Wenn der König zwei Felder nach links oder rechts von seinem Ausgangsfeld zieht,
    // verschieben wir automatisch den entsprechenden Turm mit.
    const isKing = piece.toLowerCase() === 'k';
    if (isKing && from.file === 4) {
      // Weißer König startet auf e1 (Rank 0), schwarzer auf e8 (Rank 7)
      const startRankWhite = 0;
      const startRankBlack = 7;
      const isWhiteKing = piece === piece.toUpperCase();
      const expectedRank = isWhiteKing ? startRankWhite : startRankBlack;
      if (from.rank === expectedRank) {
        // kurze Rochade: e1 -> g1 bzw. e8 -> g8
        if (to.file === 6) {
          const rookFromFile = 7;
          const rookToFile = 5;
          const rook = board[from.rank][rookFromFile];
          if (rook && rook.toLowerCase() === 'r') {
            board[from.rank][rookFromFile] = null;
            board[from.rank][rookToFile] = rook;
          }
        }
        // lange Rochade: e1 -> c1 bzw. e8 -> c8
        else if (to.file === 2) {
          const rookFromFile = 0;
          const rookToFile = 3;
          const rook = board[from.rank][rookFromFile];
          if (rook && rook.toLowerCase() === 'r') {
            board[from.rank][rookFromFile] = null;
            board[from.rank][rookToFile] = rook;
          }
        }
      }
    }

    let newPiece = piece;
    if (promotionPiece) {
      // promotionPiece erwartet: 'q','r','b','n' – wir übernehmen die Farbe des Bauern
      const isWhite = piece === piece.toUpperCase();
      newPiece = isWhite ? promotionPiece.toUpperCase() : promotionPiece.toLowerCase();
    }
    // Update enPassantSquare if pawn moved two squares
    enPassantSquare = null;
    if (piece.toLowerCase() === 'p') {
        const diff = to.rank - from.rank;
        if (Math.abs(diff) === 2) {
            // target square between
            enPassantSquare = {rank: from.rank + diff/2, file: from.file};
        }
    }
    board[to.rank][to.file] = newPiece;

    if (piece === 'K') { castlingRights.K = false; castlingRights.Q = false; }
    if (piece === 'k') { castlingRights.k = false; castlingRights.q = false; }
    [from, to].forEach((sq) => {
      if (sq.rank === 0 && sq.file === 0) castlingRights.Q = false;
      if (sq.rank === 0 && sq.file === 7) castlingRights.K = false;
      if (sq.rank === 7 && sq.file === 0) castlingRights.q = false;
      if (sq.rank === 7 && sq.file === 7) castlingRights.k = false;
    });
  }



  function getEnPassantSquare() {
    return enPassantSquare;
  }

  function setEnPassantSquare(ep) {
    if (ep && typeof ep.rank === "number" && typeof ep.file === "number") {
      enPassantSquare = { rank: ep.rank, file: ep.file };
    } else {
      enPassantSquare = null;
    }
  }

  function getCastlingRights() {
    return { K: castlingRights.K, Q: castlingRights.Q, k: castlingRights.k, q: castlingRights.q };
  }

  function setCastlingRights(rights) {
    if (rights && typeof rights === "object") {
      castlingRights = { K: !!rights.K, Q: !!rights.Q, k: !!rights.k, q: !!rights.q };
    } else {
      castlingRights = { K: true, Q: true, k: true, q: true };
    }
  }

  // Rochaderechte, die zur Stellung passen, wenn keine gespeichert sind
  // (Spielstände von vor dieser Regel): ein Recht besteht nur, solange
  // König und Turm noch auf ihren Ausgangsfeldern stehen.
  function rightsFromBoard(board) {
    return {
      K: board[0][4] === 'K' && board[0][7] === 'R',
      Q: board[0][4] === 'K' && board[0][0] === 'R',
      k: board[7][4] === 'k' && board[7][7] === 'r',
      q: board[7][4] === 'k' && board[7][0] === 'r'
    };
  }

  // Alles, was außer dem Brett zur Stellung gehört (En-passant-Feld und
  // Rochaderechte) - für Rücknahme, Speichern und die KI-Suche.
  function getRulesState() {
    return { ep: enPassantSquare ? { rank: enPassantSquare.rank, file: enPassantSquare.file } : null, castling: getCastlingRights() };
  }

  function setRulesState(state) {
    setEnPassantSquare(state ? state.ep : null);
    setCastlingRights(state ? state.castling : null);
  }

  function resetRulesState() {
    setRulesState(null);
  }

  function isWhitePiece(piece) {
    return !!piece && piece === piece.toUpperCase();
  }

  function isBlackPiece(piece) {
    return !!piece && piece === piece.toLowerCase();
  }

  return {
    createInitialBoard,
    emptyBoard,
    coordToIndex,
    indexToCoord,
    parseFEN,
    applyMove,
    getEnPassantSquare,
    setEnPassantSquare,
    getCastlingRights,
    setCastlingRights,
    rightsFromBoard,
    getRulesState,
    setRulesState,
    resetRulesState,
    isWhitePiece,
    isBlackPiece
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ChessCore;
}
if (typeof window !== "undefined") {
  window.ChessCore = ChessCore;
}
