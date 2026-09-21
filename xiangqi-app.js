// xiangqi-app.js
// Wires XiangqiCore/XiangqiAi to the xiangqi.html UI. The board is a
// 9x10 point grid rendered the same way go-app.js renders its points
// and lines (absolute top/left percentages, never the `inset`
// shorthand, plus a JS-enforced square-per-cell height since
// `aspect-ratio` alone is silently ignored on some E-Ink browsers) -
// pieces sit ON intersections here too, not inside squares.
//
// The one feature unique to this game: a toggle between each piece's
// traditional Chinese character (which some E-Ink browsers may lack a
// CJK font for) and a Western-style pictorial symbol as a safe,
// always-legible fallback/preference. Both styles render the same
// neutral disc with red or black content - only what's inside changes -
// so switching styles never reflows the board.

const XQ_CLASSIC_CHARS = {
  r: { G: "帥", A: "仕", E: "相", H: "傌", R: "俥", C: "炮", P: "兵" },
  b: { G: "將", A: "士", E: "象", H: "馬", R: "車", C: "砲", P: "卒" }
};

const XQ_PIECE_NAMES = { G: "General", A: "Advisor", E: "Elephant", H: "Horse", R: "Chariot", C: "Cannon", P: "Soldier" };

// Symbol style: all seven piece types use one consistent Xiangqi-native
// pictorial set, not a mix of borrowed Western chess glyphs (King/
// Knight/Rook/Pawn) for some pieces and Xiangqi-specific line art for
// others - that mix used to read as two unrelated styles on the same
// board. The set is adapted from the Xiangqi piece drawings originally
// by Inductiveload (Wikimedia Commons, CC BY-SA), as cleaned up and
// resplit per-piece by Kadagaden (github.com/Kadagaden/chess-pieces,
// "xiangqi_wikipedia_intl_modded", CC BY 4.0). Each source file draws
// its own background disc and ring; both are stripped here so every
// piece instead sits on this app's own `.xq-piece-filled` board-square
// disc, keeping only the line art (plus, for Cannon, its two small
// wheel-hub circles, which are the barrel's own decoration and not the
// piece's outer ring). See about.html for the required attribution.
const XQ_GENERAL_SVG = {
  r: '<svg viewBox="0 0 92 92"><g><g fill="none" stroke="#000"><g stroke-width="1.010084" transform="matrix(-.53812597093 1.79183667635 -1.79183667635 -.53812597093 878.14369067998 -424.73287422343)"><path d="m378.25463 342.35677c-6.15812-1.89574-26.27581-4.43582-13.98614 10.57576"/><path d="m375.15587 341.89173 5.33321 17.72168"/><path d="m377.0299 349.03315-14.29067 4.06422"/><path d="m378.39052 352.59164-14.35136 4.24992"/><path d="m358.85038 354.86948c-.37247-.76392-.74495-1.52783-1.11743-2.29175 1.12757-.30123 2.08147-.58618 3.20905-.88742.15011.92355.23394 1.54428.38405 2.46783l1.61096-1.51447c.42075 1.52823.8415 3.05646 1.26225 4.58468-.84274-.1665-1.28389-.41775-2.12662-.58426.45056.94077.49945 1.60774.95002 2.54851-1.02142.21136-2.04609.53127-3.06751.74263-.0975-.90859-.22629-1.5568-.32382-2.46539-.68309.43359-1.33158.85681-2.01467 1.2904l-1.20748-4.02063c.7409.0532 1.7003.0766 2.4412.12987z" stroke-linejoin="round"/></g><path d="m31.703728 68.833207c-6.710701-10.014198-21.936773-44.458981 11.574917-30.51602" stroke-width="1.889764"/><path d="m62.325685 68.199341-31.816182.02238" stroke-width="1.889764"/></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd"><g fill="none"><g stroke-width="1.010084" transform="matrix(-.53812597093 1.79183667635 -1.79183667635 -.53812597093 878.14369067998 -424.73287422343)"><path d="m378.25463 342.35677c-6.15812-1.89574-26.27581-4.43582-13.98614 10.57576"/><path d="m375.15587 341.89173 5.33321 17.72168"/><path d="m377.0299 349.03315-14.29067 4.06422"/><path d="m378.39052 352.59164-14.35136 4.24992"/><path d="m358.85038 354.86948c-.37247-.76392-.74495-1.52783-1.11743-2.29175 1.12757-.30123 2.08147-.58618 3.20905-.88742.15011.92355.23394 1.54428.38405 2.46783l1.61096-1.51447c.42075 1.52823.8415 3.05646 1.26225 4.58468-.84274-.1665-1.28389-.41775-2.12662-.58426.45056.94077.49945 1.60774.95002 2.54851-1.02142.21136-2.04609.53127-3.06751.74263-.0975-.90859-.22629-1.5568-.32382-2.46539-.68309.43359-1.33158.85681-2.01467 1.2904l-1.20748-4.02063c.7409.0532 1.7003.0766 2.4412.12987z" stroke-linejoin="round"/></g><path d="m31.703728 68.833207c-6.710701-10.014198-21.936773-44.458981 11.574917-30.51602" stroke-width="1.889764"/><path d="m62.325685 68.199341-31.816182.02238" stroke-width="1.889764"/></g></g></svg>'
};
const XQ_ADVISOR_SVG = {
  r: '<svg viewBox="0 0 92 92"><g><g stroke="#000"><g fill="none" stroke-width="1.3" transform="matrix(1.7646 0 0 1.7646 -704.6273 -672.2753)"><path d="m419.5 403.59375c-.86079 1.1323-1.34375 2.53337-1.34375 4.03125 0 1.86072.79538 3.54695 2.0625 4.78125-2.50925 1.48035-4.31127 4.02565-4.84375 7h20c-.53248-2.97435-2.3345-5.51965-4.84375-7 1.26712-1.2343 2.03125-2.92053 2.03125-4.78125 0-1.43388-.49195-2.77029-1.28125-3.875z" stroke-linecap="round" stroke-linejoin="round"/><path d="m431.42341 403.68264-12.32701-.0975-2.79029-6.74796 6.48273 1.47375 2.75068-3.63455 2.44584 3.97189 7.06889-1.30416-3.63084 6.33852z" stroke-linejoin="round"/><g stroke-linecap="round"><path d="m428.90115 406.53666-1.96869 1.97952"/><path d="m421.82763 406.45315 1.96869 1.97952"/></g></g></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd"><g fill="none" stroke-width="1.3" transform="matrix(1.7646 0 0 1.7646 -704.6273 -672.2753)"><path d="m419.5 403.59375c-.86079 1.1323-1.34375 2.53337-1.34375 4.03125 0 1.86072.79538 3.54695 2.0625 4.78125-2.50925 1.48035-4.31127 4.02565-4.84375 7h20c-.53248-2.97435-2.3345-5.51965-4.84375-7 1.26712-1.2343 2.03125-2.92053 2.03125-4.78125 0-1.43388-.49195-2.77029-1.28125-3.875z" stroke-linecap="round" stroke-linejoin="round"/><path d="m431.42341 403.68264-12.32701-.0975-2.79029-6.74796 6.48273 1.47375 2.75068-3.63455 2.44584 3.97189 7.06889-1.30416-3.63084 6.33852z" stroke-linejoin="round"/><g stroke-linecap="round"><path d="m428.90115 406.53666-1.96869 1.97952"/><path d="m421.82763 406.45315 1.96869 1.97952"/></g></g></g></svg>'
};
const XQ_ELEPHANT_SVG = {
  r: '<svg viewBox="0 0 92 92"><g><g stroke="#000"><g stroke-linejoin="round" transform="translate(2.29 -1.33)"><g fill="none"><path d="m47.064588 53.683811c1.948125 2.351345 2.686542 6.462037 1.885289 10.220845l-25.32568-.268075c-5.1869-.05498 1.57106-13.907083 1.57106-13.907083" stroke-width="2.3"/><path d="m40.277558 45.037955s-1.164733 5.674796-4.713215 7.204877c-3.548483 1.530081-14.453877-3.015986-14.453877-3.015986s7.963534-18.259428 10.211988-19.436405 8.012468.502671 8.012468.502671c13.712891-7.82814 16.862772 6.982704 18.77669 17.349531.527326 4.989282 9.782247 14.906139 6.424641 18.200979l-2.912033.234291c-8.56514 2.630333 9.675021-1.123141-9.473328-13.467284 0 0-3.140326.923427-5.71457.732219-2.574227-.191228-6.158764-8.304932-6.158764-8.304932z" stroke-width="2.3"/><path d="m50.174012 48.390196c4.939804 4.666342 13.152163 5.105119 19.048856 6.256559-6.758428-2.053547-14.465314-4.630902-17.016322-9.753045z" stroke-width="1.5"/></g><ellipse cx="38.41" cy="-50.4" fill="#a00" rx=".85" ry=".8" stroke-linecap="round" stroke-width="1.8" transform="rotate(90)"/></g></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd"><g stroke-linejoin="round" transform="translate(2.29 -1.33)"><g fill="none"><path d="m47.064588 53.683811c1.948125 2.351345 2.686542 6.462037 1.885289 10.220845l-25.32568-.268075c-5.1869-.05498 1.57106-13.907083 1.57106-13.907083" stroke-width="2.3"/><path d="m40.277558 45.037955s-1.164733 5.674796-4.713215 7.204877c-3.548483 1.530081-14.453877-3.015986-14.453877-3.015986s7.963534-18.259428 10.211988-19.436405 8.012468.502671 8.012468.502671c13.712891-7.82814 16.862772 6.982704 18.77669 17.349531.527326 4.989282 9.782247 14.906139 6.424641 18.200979l-2.912033.234291c-8.56514 2.630333 9.675021-1.123141-9.473328-13.467284 0 0-3.140326.923427-5.71457.732219-2.574227-.191228-6.158764-8.304932-6.158764-8.304932z" stroke-width="2.3"/><path d="m50.174012 48.390196c4.939804 4.666342 13.152163 5.105119 19.048856 6.256559-6.758428-2.053547-14.465314-4.630902-17.016322-9.753045z" stroke-width="1.5"/></g><ellipse cx="38.41" cy="-50.4" fill="#fdfdfd" rx=".85" ry=".8" stroke-linecap="round" stroke-width="1.8" transform="rotate(90)"/></g></g></svg>'
};
const XQ_HORSE_SVG = {
  r: '<svg viewBox="0 0 92 92"><g><g fill="none" stroke="#000"><path d="m48.126905 28.604819c-13.656691 3.102688-21.868938 19.514614-20.318437 36.218646l31.650794.109794c-1.41985-5.2227-6.910806-9.204753-10.406802-15.229199 5.252819 1.906163 4.779834-3.023286 15.854082 5.694581.15549-1.142318.411515-1.998535.727367-2.648056 1.825383-3.75373 5.648987-.603904 3.613556-5.877595l-11.245871-11.285664-1.323794-5.55288" stroke-width="2.27194"/><ellipse cx="19.805824" cy="-67.816071" rx=".570748" ry="1.777606" stroke-width="1.822844" transform="matrix(-.35490661 .93490176 -.9421121 -.33529807 0 0)"/><path d="m54.510583 34.393639 5.61951-10.248603c-4.926278.121702-13.065563 3.547108-15.532595 8.370546" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.123167"/><ellipse cx="23.253637" cy="-77.650299" rx=".345173" ry="1.07505" stroke-width="1.102409" transform="matrix(-.35490661 .93490176 -.9421121 -.33529807 0 0)"/></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd"><g fill="none"><path d="m48.126905 28.604819c-13.656691 3.102688-21.868938 19.514614-20.318437 36.218646l31.650794.109794c-1.41985-5.2227-6.910806-9.204753-10.406802-15.229199 5.252819 1.906163 4.779834-3.023286 15.854082 5.694581.15549-1.142318.411515-1.998535.727367-2.648056 1.825383-3.75373 5.648987-.603904 3.613556-5.877595l-11.245871-11.285664-1.323794-5.55288" stroke-width="2.27194"/><ellipse cx="19.805824" cy="-67.816071" rx=".570748" ry="1.777606" stroke-width="1.822844" transform="matrix(-.35490661 .93490176 -.9421121 -.33529807 0 0)"/><path d="m54.510583 34.393639 5.61951-10.248603c-4.926278.121702-13.065563 3.547108-15.532595 8.370546" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.123167"/><ellipse cx="23.253637" cy="-77.650299" rx=".345173" ry="1.07505" stroke-width="1.102409" transform="matrix(-.35490661 .93490176 -.9421121 -.33529807 0 0)"/></g></g></svg>'
};
const XQ_CHARIOT_SVG = {
  r: '<svg viewBox="0 0 92 92"><g stroke-linecap="round"><g fill="none" stroke="#000"><g stroke-linejoin="round" stroke-width="1.128305" transform="matrix(1.67486901022 0 0 1.67486901022 -826.99957399526 -1041.24764075241)"><path d="m515.18573 643.56158h12.097403v11.620048h-12.097403z"/><g><path d="m512.62168 655.491947h17.225668v2.690011h-17.225668z"/><path d="m510.74347 658.363815h20.982143v2.410714h-20.982143z"/></g><path d="m530.25 637.53314h-3.875v2.46875h-3.21875v-2.46875h-3.84375v2.46875h-3.21875v-2.46875h-3.875l.0312 5.6875h17.96875v-2.25z"/></g></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd" stroke-linecap="round"><g fill="none"><g stroke-linejoin="round" stroke-width="1.128305" transform="matrix(1.67486901022 0 0 1.67486901022 -826.99957399526 -1041.24764075241)"><path d="m515.18573 643.56158h12.097403v11.620048h-12.097403z"/><g><path d="m512.62168 655.491947h17.225668v2.690011h-17.225668z"/><path d="m510.74347 658.363815h20.982143v2.410714h-20.982143z"/></g><path d="m530.25 637.53314h-3.875v2.46875h-3.21875v-2.46875h-3.84375v2.46875h-3.21875v-2.46875h-3.875l.0312 5.6875h17.96875v-2.25z"/></g></g></g></svg>'
};
const XQ_CANNON_SVG = {
  r: '<svg viewBox="0 0 92 92"><g transform="matrix(1.136 0 0 1.136 -95.663 -3.011)"><g fill="none" stroke="#000"><g stroke-width="1.2" transform="matrix(0 1.6096 -1.6897 0 1021.1269 -482.7349)"><circle cx="328.36" cy="530.18" r="3.09" stroke-linecap="round" stroke-linejoin="round"/><circle cx="328.36" cy="530.18" r="5.11" stroke-linecap="round" stroke-linejoin="round"/><path d="m328.93092 525.18882c.10522-1.45209-.29463-5.24017-.56821-8.27062l-3.34613-.0631c-2.82833 7.30933-5.75997 14.2007-4.9245 18.18274.83548 3.98203 5.1928 5.53828 7.95496 2.46225l1.95717 2.77791.00003 3.72494 2.27284.18944-.0631-4.35629-2.90419-4.48254"/></g></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd" transform="matrix(1.136 0 0 1.136 -251.88 -1.4045)"><g fill="none"><g stroke-width="1.2" transform="matrix(0 1.6096 -1.6897 0 1158.6451 -484.1491)"><circle cx="328.36" cy="530.18" r="3.09" stroke-linecap="round" stroke-linejoin="round"/><circle cx="328.36" cy="530.18" r="5.11" stroke-linecap="round" stroke-linejoin="round"/><path d="m328.93092 525.18882c.10522-1.45209-.29463-5.24017-.56821-8.27062l-3.34613-.0631c-2.82833 7.30933-5.75997 14.2007-4.9245 18.18274.83548 3.98203 5.1928 5.53828 7.95496 2.46225l1.95717 2.77791.00003 3.72494 2.27284.18944-.0631-4.35629-2.90419-4.48254"/></g></g></g></svg>'
};
const XQ_SOLDIER_SVG = {
  r: '<svg viewBox="0 0 92 92"><g stroke-linecap="round" transform="matrix(1.1359702 0 0 1.1359702 -84.819407 -4.215927)"><g fill="none" stroke="#000"><path d="m131.55335 63.633336c-1.14775-4.810578-4.32372-8.844906-8.59691-11.073971 2.73224-2.255935 4.46845-5.660679 4.46845-9.471167 0-5.39964-3.50743-9.969975-8.35407-11.608238.36338-.650448.58286-1.387658.58286-2.185651 0-2.492928-2.02412-4.517003-4.51702-4.517003-2.49291 0-4.51701 2.024075-4.51701 4.517003 0 .8024.26432 1.532689.63143 2.185651-4.86355 1.62871-8.35407 6.196496-8.35407 11.608238 0 3.810488 1.74965 7.215232 4.46845 9.471167-4.27321 2.229065-7.449179 6.263393-8.59691 11.073971z" stroke-linejoin="round" stroke-width="2"/></g></g></svg>',
  b: '<svg viewBox="0 0 92 92"><g stroke="#fdfdfd" stroke-linecap="round" transform="matrix(1.1359701 0 0 1.1359701 -191.63605 .60359)"><g fill="none"><path d="m225.58457 59.390695c-1.14775-4.810578-4.32372-8.844906-8.59691-11.073971 2.73224-2.255935 4.46845-5.660679 4.46845-9.471167 0-5.39964-3.50743-9.969975-8.35407-11.608238.36338-.650448.58286-1.387658.58286-2.185651 0-2.492928-2.02412-4.517003-4.51702-4.517003-2.49291 0-4.51701 2.024075-4.51701 4.517003 0 .8024.26432 1.532689.63143 2.185651-4.86355 1.62871-8.35407 6.196496-8.35407 11.608238 0 3.810488 1.74965 7.215232 4.46845 9.471167-4.27321 2.229065-7.44918 6.263393-8.59691 11.073971z" stroke-linejoin="round" stroke-width="2"/></g></g></svg>'
};

const XQ_SYMBOL_SVG = {
  r: {
    G: XQ_GENERAL_SVG.r,
    A: XQ_ADVISOR_SVG.r,
    E: XQ_ELEPHANT_SVG.r,
    H: XQ_HORSE_SVG.r,
    R: XQ_CHARIOT_SVG.r,
    C: XQ_CANNON_SVG.r,
    P: XQ_SOLDIER_SVG.r
  },
  b: {
    G: XQ_GENERAL_SVG.b,
    A: XQ_ADVISOR_SVG.b,
    E: XQ_ELEPHANT_SVG.b,
    H: XQ_HORSE_SVG.b,
    R: XQ_CHARIOT_SVG.b,
    C: XQ_CANNON_SVG.b,
    P: XQ_SOLDIER_SVG.b
  }
};

const AppStateXiangqi = {
  mode: "offline",        // "offline" | "offline-ai"
  board: XiangqiCore.createInitialBoard(),
  turn: "r",              // "r" | "b" - Red always moves first in Xiangqi
  selected: null,         // [r, c] | null
  lastMove: null,         // { from: [r,c], to: [r,c] } | null
  humanColor: "r",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  pieceStyle: "classic",  // "classic" | "symbols"
  moveHistory: []
};

const XQ_STYLE_KEY = "einkchess_xiangqi_piece_style";
const XQ_SAVE_KEY = "einkchess_save_xiangqi";

function xqCoord(rc) {
  return "abcdefghi".charAt(rc[1]) + (rc[0] + 1);
}

function recordMoveXq(color, from, to) {
  AppStateXiangqi.moveHistory.push({ color: color, from: xqCoord(from), to: xqCoord(to) });
  renderMoveListXq();
}

function resetMoveHistoryXq() {
  AppStateXiangqi.moveHistory = [];
  renderMoveListXq();
}

function renderMoveListXq() {
  const el = document.getElementById("moves-list");
  if (!el) return;
  const moves = AppStateXiangqi.moveHistory || [];
  if (!moves.length) {
    el.textContent = "";
    return;
  }
  el.textContent = moves.map((m) => m.from + "–" + m.to).join("; ");
  el.scrollLeft = el.scrollWidth;
}

function saveXiangqiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(XQ_SAVE_KEY, {
    mode: AppStateXiangqi.mode,
    board: AppStateXiangqi.board,
    turn: AppStateXiangqi.turn,
    lastMove: AppStateXiangqi.lastMove,
    humanColor: AppStateXiangqi.humanColor,
    aiLevel: AppStateXiangqi.aiLevel,
    moveCount: AppStateXiangqi.moveCount,
    moveHistory: AppStateXiangqi.moveHistory
  });
}

function clearSavedXiangqiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(XQ_SAVE_KEY);
}

function recordXiangqiStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateXiangqi.mode !== "offline-ai") return;
  GameStats.record("xiangqi", outcome);
}

function colorNameXq(color) {
  return color === "r" ? "Red" : "Black";
}

function setStatusXq(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultXq(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultXq(resultCode, message) {
  setGameResultXq(message);
  setStatusXq("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackXq() {
  AppStateXiangqi.undoStack = [];
}

function pushUndoSnapshotXq() {
  AppStateXiangqi.undoStack.push({
    board: XiangqiCore.cloneBoard(AppStateXiangqi.board),
    turn: AppStateXiangqi.turn,
    gameOver: AppStateXiangqi.gameOver,
    moveCount: AppStateXiangqi.moveCount,
    lastMove: AppStateXiangqi.lastMove
  });
}

function loadPieceStylePref() {
  try {
    const saved = window.localStorage && window.localStorage.getItem(XQ_STYLE_KEY);
    if (saved === "classic" || saved === "symbols") AppStateXiangqi.pieceStyle = saved;
  } catch (e) { /* ignore - default style is fine */ }
}

function savePieceStylePref() {
  try {
    if (window.localStorage) window.localStorage.setItem(XQ_STYLE_KEY, AppStateXiangqi.pieceStyle);
  } catch (e) { /* ignore */ }
}

function initXiangqiApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("xiangqi-color-choice");
  const levelInline = document.getElementById("xiangqi-level-inline");
  const startGameBtn = document.getElementById("start-xiangqi-game");
  const resignBtn = document.getElementById("resign-button");
  const styleToggleBtn = document.getElementById("xiangqi-style-toggle");

  loadPieceStylePref();
  updateStyleToggleLabel();

  function updateColorChoiceVisibilityXq() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonXq(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) menuToggle.textContent = "☰ Menu";
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) menuToggle.textContent = "✕ Close";
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  if (styleToggleBtn) {
    styleToggleBtn.addEventListener("click", () => {
      AppStateXiangqi.pieceStyle = AppStateXiangqi.pieceStyle === "classic" ? "symbols" : "classic";
      savePieceStylePref();
      updateStyleToggleLabel();
      updateXiangqiBoard();
    });
  }

  function updateStyleToggleLabel() {
    if (!styleToggleBtn) return;
    const key = AppStateXiangqi.pieceStyle === "classic" ? "xiangqi_style_show_symbols" : "xiangqi_style_show_classic";
    const fallback = AppStateXiangqi.pieceStyle === "classic" ? "Switch to symbols" : "Switch to characters";
    styleToggleBtn.textContent = (window.I18n ? window.I18n.t(key) : fallback) || fallback;
  }

  function startNewGameXq(mode, humanColor, level) {
    AppStateXiangqi.mode = mode;
    AppStateXiangqi.board = XiangqiCore.createInitialBoard();
    AppStateXiangqi.turn = "r";
    AppStateXiangqi.selected = null;
    AppStateXiangqi.lastMove = null;
    AppStateXiangqi.humanColor = humanColor;
    AppStateXiangqi.aiLevel = level;
    AppStateXiangqi.gameOver = false;
    AppStateXiangqi.moveCount = 0;
    resetUndoStackXq();
    resetMoveHistoryXq();
    setGameResultXq("");
    showBoardSectionXq();
    buildXiangqiBoardDOM();
    updateXiangqiBoard();
    updateGameLabelsXq();

    if (mode === "offline-ai" && humanColor !== "r") {
      setStatusXq("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineXq, 300);
    } else {
      setStatusXq("board-info", colorNameXq(AppStateXiangqi.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonXq("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameXq("offline", "r", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonXq("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateXiangqi.aiLevel || 2);
    updateColorChoiceVisibilityXq();
    setStatusXq("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityXq);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='xiangqi-color']:checked");
    const humanColor = colorInput && colorInput.value === "black" ? "b" : "r";

    if (level === 0) {
      setActiveModeButtonXq("offline-ai");
      startNewGameXq("offline", "r", 0);
      setStatusXq("offline-xiangqi-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonXq("offline-ai");
    startNewGameXq("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusXq("offline-xiangqi-status",
      "You play " + colorNameXq(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateXiangqi.gameOver) return;
      const loser = AppStateXiangqi.turn;
      const winner = XiangqiCore.otherColor(loser);
      AppStateXiangqi.gameOver = true;
      announceGameResultXq(colorNameXq(winner) + " wins", colorNameXq(winner) + " wins by resignation.");
      recordXiangqiStatsIfVsAi("loss");
      updateGameLabelsXq();
    });
  }

  const toggleMovesBtn = document.getElementById("toggle-moves");
  if (toggleMovesBtn) {
    toggleMovesBtn.addEventListener("click", () => {
      const list = document.getElementById("moves-list");
      if (!list) return;
      const isHidden = list.classList.contains("hidden");
      if (isHidden) {
        list.classList.remove("hidden");
        renderMoveListXq();
      } else {
        list.classList.add("hidden");
      }
    });
  }

  updateColorChoiceVisibilityXq();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(XQ_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateXiangqi.mode = savedGame.mode;
    AppStateXiangqi.board = savedGame.board;
    AppStateXiangqi.turn = savedGame.turn;
    AppStateXiangqi.selected = null;
    AppStateXiangqi.lastMove = savedGame.lastMove;
    AppStateXiangqi.humanColor = savedGame.humanColor;
    AppStateXiangqi.aiLevel = savedGame.aiLevel;
    AppStateXiangqi.moveCount = savedGame.moveCount;
    AppStateXiangqi.moveHistory = savedGame.moveHistory || [];
    AppStateXiangqi.gameOver = false;
    resetUndoStackXq();
    renderMoveListXq();
    setActiveModeButtonXq(AppStateXiangqi.mode);
    setGameResultXq("");
    showBoardSectionXq();
    buildXiangqiBoardDOM();
    updateXiangqiBoard();
    updateGameLabelsXq();
    if (AppStateXiangqi.mode === "offline-ai" && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
      setStatusXq("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineXq, 300);
    } else {
      setStatusXq("board-info", colorNameXq(AppStateXiangqi.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isPieceOfTurnXq(piece, turn) {
  return !!piece && piece.color === turn;
}

function onXiangqiPointClick(r, c) {
  if (AppStateXiangqi.gameOver) {
    setStatusXq("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateXiangqi.mode === "offline-ai" && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
    setStatusXq("board-info", "Computer to move.");
    return;
  }

  const board = AppStateXiangqi.board;
  const turn = AppStateXiangqi.turn;

  if (!AppStateXiangqi.selected) {
    const piece = board[r][c];
    if (!isPieceOfTurnXq(piece, turn)) return;
    AppStateXiangqi.selected = [r, c];
    updateXiangqiBoard();
    return;
  }

  const [sr, sc] = AppStateXiangqi.selected;
  if (sr === r && sc === c) {
    AppStateXiangqi.selected = null;
    updateXiangqiBoard();
    return;
  }

  const clickedPiece = board[r][c];
  if (isPieceOfTurnXq(clickedPiece, turn)) {
    AppStateXiangqi.selected = [r, c];
    updateXiangqiBoard();
    return;
  }

  const legalMoves = XiangqiCore.getLegalMoves(board, turn);
  const match = legalMoves.find((m) => m.from[0] === sr && m.from[1] === sc && m.to[0] === r && m.to[1] === c);
  if (!match) {
    setStatusXq("board-info", "Invalid move.");
    AppStateXiangqi.selected = null;
    updateXiangqiBoard();
    return;
  }

  applyXiangqiMove(match);

  if (AppStateXiangqi.mode === "offline-ai" && !AppStateXiangqi.gameOver && AppStateXiangqi.turn !== AppStateXiangqi.humanColor) {
    setStatusXq("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineXq, 10);
  }
}

function applyXiangqiMove(move) {
  pushUndoSnapshotXq();
  const mover = AppStateXiangqi.turn;
  AppStateXiangqi.board = XiangqiCore.applyMove(AppStateXiangqi.board, move);
  AppStateXiangqi.lastMove = { from: move.from, to: move.to };
  recordMoveXq(mover, move.from, move.to);
  AppStateXiangqi.selected = null;
  AppStateXiangqi.moveCount++;
  AppStateXiangqi.turn = XiangqiCore.otherColor(mover);
  updateXiangqiBoard();
  updateGameLabelsXq();

  const end = XiangqiCore.detectGameEnd(AppStateXiangqi.board, AppStateXiangqi.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameXq(end.winner);
    const reason = end.status === "checkmate" ? "checkmate" : "no legal moves";
    AppStateXiangqi.gameOver = true;
    announceGameResultXq(winnerName + " wins", winnerName + " wins (" + reason + ").");
    recordXiangqiStatsIfVsAi(end.winner === AppStateXiangqi.humanColor ? "win" : "loss");
    updateGameLabelsXq();
    return;
  }

  const inCheck = XiangqiCore.isInCheck(AppStateXiangqi.board, AppStateXiangqi.turn);
  setStatusXq("board-info", colorNameXq(mover) + " played." + (inCheck ? " Check!" : "") + " " + colorNameXq(AppStateXiangqi.turn) + " to move.");
}

function aiMoveOfflineXq() {
  if (AppStateXiangqi.mode !== "offline-ai" || AppStateXiangqi.gameOver) return;
  const aiColor = XiangqiCore.otherColor(AppStateXiangqi.humanColor);
  if (AppStateXiangqi.turn !== aiColor) return;

  const move = XiangqiAi.chooseMove(AppStateXiangqi.board, aiColor, AppStateXiangqi.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss

  applyXiangqiMove(move);
}

function undoLastMove() {
  if (!AppStateXiangqi.undoStack || !AppStateXiangqi.undoStack.length) return;
  let prev = AppStateXiangqi.undoStack.pop();
  if (AppStateXiangqi.mode === "offline-ai") {
    while (prev.turn !== AppStateXiangqi.humanColor && AppStateXiangqi.undoStack.length) {
      prev = AppStateXiangqi.undoStack.pop();
    }
  }
  AppStateXiangqi.board = prev.board;
  AppStateXiangqi.turn = prev.turn;
  AppStateXiangqi.gameOver = prev.gameOver;
  AppStateXiangqi.moveCount = prev.moveCount;
  AppStateXiangqi.lastMove = prev.lastMove;
  AppStateXiangqi.selected = null;
  AppStateXiangqi.moveHistory.length = AppStateXiangqi.moveCount;
  renderMoveListXq();
  setGameResultXq("");
  updateXiangqiBoard();
  updateGameLabelsXq();
  setStatusXq("board-info", "Move undone.");
}

function showBoardSectionXq() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  const movesList = document.getElementById("moves-list");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
  if (movesList) movesList.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) menuToggle.textContent = "☰ Menu";
}

/*** Board rendering (point-and-line grid, mirrors go-app.js's technique) ***/

function buildXiangqiBoardDOM() {
  const grid = document.getElementById("xiangqi-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const stepX = 100 / (XiangqiCore.COLS - 1);
  const stepY = 100 / (XiangqiCore.ROWS - 1);

  for (let r = 0; r < XiangqiCore.ROWS; r++) {
    const hLine = document.createElement("div");
    hLine.className = "xq-line xq-line-h";
    hLine.style.top = (r * stepY) + "%";
    grid.appendChild(hLine);
  }
  for (let c = 0; c < XiangqiCore.COLS; c++) {
    const vLine = document.createElement("div");
    vLine.className = "xq-line xq-line-v";
    vLine.style.left = (c * stepX) + "%";
    grid.appendChild(vLine);
  }

  // Subtle river band and palace tints, purely decorative.
  const river = document.createElement("div");
  river.className = "xq-river";
  river.style.top = (4 * stepY) + "%";
  river.style.height = stepY + "%";
  grid.appendChild(river);

  [[0, 2], [7, 9]].forEach(([r0, r1]) => {
    const palace = document.createElement("div");
    palace.className = "xq-palace";
    palace.style.top = (r0 * stepY) + "%";
    palace.style.height = ((r1 - r0) * stepY) + "%";
    palace.style.left = (3 * stepX) + "%";
    palace.style.width = (2 * stepX) + "%";
    grid.appendChild(palace);
  });

  for (let r = 0; r < XiangqiCore.ROWS; r++) {
    for (let c = 0; c < XiangqiCore.COLS; c++) {
      const pt = document.createElement("button");
      pt.type = "button";
      pt.className = "xq-point";
      pt.style.top = (r * stepY) + "%";
      pt.style.left = (c * stepX) + "%";
      pt.dataset.row = r;
      pt.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "xq-piece";
      pt.appendChild(piece);
      pt.addEventListener("click", () => onXiangqiPointClick(r, c));
      grid.appendChild(pt);
    }
  }

  ensureXiangqiBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureXiangqiBoardSquare);
  } else {
    setTimeout(ensureXiangqiBoardSquare, 0);
  }
  ensureXiangqiResizeHandler();
}

let einkXiangqiResizeHandlerAttached = false;
let einkXiangqiResizeTimeoutId = null;

function ensureXiangqiBoardSquare() {
  const boardEl = document.getElementById("xiangqi-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  // Keep cells roughly square: 8 column-gaps wide, 9 row-gaps tall.
  boardEl.style.height = (rect.width * (XiangqiCore.ROWS - 1) / (XiangqiCore.COLS - 1)) + "px";
}

function ensureXiangqiResizeHandler() {
  if (einkXiangqiResizeHandlerAttached) return;
  einkXiangqiResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkXiangqiResizeTimeoutId !== null) clearTimeout(einkXiangqiResizeTimeoutId);
    einkXiangqiResizeTimeoutId = setTimeout(() => {
      einkXiangqiResizeTimeoutId = null;
      ensureXiangqiBoardSquare();
    }, 150);
  });
}

function updateXiangqiBoard() {
  const grid = document.getElementById("xiangqi-grid");
  if (!grid) return;
  const legalMoves = AppStateXiangqi.selected
    ? XiangqiCore.getLegalMoves(AppStateXiangqi.board, AppStateXiangqi.turn).filter(
        (m) => m.from[0] === AppStateXiangqi.selected[0] && m.from[1] === AppStateXiangqi.selected[1]
      )
    : [];
  const destSet = new Set(legalMoves.map((m) => m.to.join(",")));

  grid.querySelectorAll(".xq-point").forEach((pt) => {
    const r = parseInt(pt.dataset.row, 10);
    const c = parseInt(pt.dataset.col, 10);
    const piece = AppStateXiangqi.board[r][c];
    const pieceEl = pt.querySelector(".xq-piece");
    if (pieceEl) {
      pieceEl.classList.remove("xq-piece-red", "xq-piece-black", "xq-piece-filled");
      if (piece) {
        pieceEl.classList.add(piece.color === "r" ? "xq-piece-red" : "xq-piece-black", "xq-piece-filled");
        if (AppStateXiangqi.pieceStyle === "classic") {
          pieceEl.textContent = XQ_CLASSIC_CHARS[piece.color][piece.type];
        } else {
          pieceEl.innerHTML = XQ_SYMBOL_SVG[piece.color][piece.type];
        }
      } else {
        pieceEl.textContent = "";
      }
    }
    const isSelected = !!(AppStateXiangqi.selected && AppStateXiangqi.selected[0] === r && AppStateXiangqi.selected[1] === c);
    const isMovable = destSet.has(r + "," + c);
    pt.classList.toggle("xq-point-selected", isSelected);
    pt.classList.toggle("xq-point-movable", isMovable);
    pt.classList.toggle("xq-point-last-move", !!(AppStateXiangqi.lastMove &&
      ((AppStateXiangqi.lastMove.from[0] === r && AppStateXiangqi.lastMove.from[1] === c) ||
       (AppStateXiangqi.lastMove.to[0] === r && AppStateXiangqi.lastMove.to[1] === c))));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      const color = piece.color === "r" ? "Red" : "Black";
      label += ", " + color + " " + (XQ_PIECE_NAMES[piece.type] || "piece");
    } else {
      label += ", empty";
    }
    if (isSelected) label += ", selected";
    else if (isMovable) label += ", movable";
    pt.setAttribute("aria-label", label);
  });

  ensureXiangqiBoardSquare();
}

function updateGameLabelsXq() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateXiangqi.moveCount ? "Move " + AppStateXiangqi.moveCount : "";
  updateUndoButtonVisibilityXq();
  updateResignVisibilityXq();

  if (AppStateXiangqi.gameOver) clearSavedXiangqiGame();
  else saveXiangqiGame();
}

function updateUndoButtonVisibilityXq() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateXiangqi.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateXiangqi.gameOver));
}

function updateResignVisibilityXq() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateXiangqi.gameOver);
}

document.addEventListener("DOMContentLoaded", initXiangqiApp);
