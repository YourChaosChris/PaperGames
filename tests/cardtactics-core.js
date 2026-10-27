#!/usr/bin/env node
// Card Tactics core (rules 4, task 151, decision 41): board, own cards per
// side (three open, three in the own face-down pile; the used card goes
// back at a hidden place; blind search states), crossing home, captures,
// passing, move limit, saves, and computer-vs-computer games for the
// levels and the first-move balance.
//   GAMES=500 node tests/cardtactics-core.js   (default 40 per pairing)
global.CardTacticsCore = require("../cardtactics-core.js");
const C = global.CardTacticsCore;
const Ai = require("../cardtactics-ai.js");

const argGames = process.argv.indexOf("--games");
const GAMES = parseInt((argGames > 0 && process.argv[argGames + 1]) || process.env.GAMES || "40", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

function empty(state) {
  state.board = state.board.map((row) => row.map(() => null));
  return state;
}
// Black gets `open` as its open cards; the other nine cards are dealt in
// table order: three to Black's pile, three open and three in the pile for White.
function deal(state, open) {
  const rest = C.CARD_IDS.filter((id) => !open.includes(id));
  state.hands = { black: open.slice(), white: rest.slice(3, 6) };
  state.piles = { black: rest.slice(0, 3), white: rest.slice(6, 9) };
  return state;
}
const allCards = (st) => st.hands.black.concat(st.piles.black, st.hands.white, st.piles.white);

// --- Setup ---
let s = C.createInitialState(C.makeRng(1));
check("rules version 4", s.rules === 4 && C.isCurrentState(s) && Number.isInteger(s.drawSeed));
check("7 rows x 6 columns", s.board.length === 7 && s.board.every((row) => row.length === 6));
check("six stones each on the back rows", C.countStones(s, "black") === 6 && C.countStones(s, "white") === 6
  && s.board[6].every((p) => p && p.color === "black") && s.board[0].every((p) => p && p.color === "white"));
check("twelve cards, six per side: 3 open and 3 in the own pile", C.CARD_IDS.length === 12
  && ["black", "white"].every((p) => s.hands[p].length === 3 && s.piles[p].length === 3)
  && new Set(allCards(s)).size === 12);
check("no shared display any more", s.display === undefined && s.queue === undefined);
check("the deal differs between games", new Set([1, 2, 3, 4, 5, 6].map((k) => C.createInitialState(C.makeRng(k)).hands.black.join())).size >= 4);
check("black starts by default", s.currentPlayer === "black" && C.createInitialState(C.makeRng(2), "white").currentPlayer === "white");
check("cards have two or three moves, none twice", C.CARD_IDS.every((id) => {
  const m = C.CARDS[id].moves; return m.length >= 2 && m.length <= 3 && new Set(m.map(String)).size === m.length;
}));
check("no two cards alike", new Set(C.CARD_IDS.map((id) => C.CARDS[id].moves.map(String).sort().join("|"))).size === 12);
check("white's cards point towards black", String(C.cardMovesFor("hook", "white")) === String([[1, 0], [2, 1]]));

check("the starter's second move: not two rows straight ahead, other two-row moves allowed", (() => {
  const o = deal(empty(C.createInitialState(C.makeRng(12))), ["arrow", "bow", "fork"]); o.ply = 2; o.board[5][2] = { color: "black" };
  const ms = C.getLegalMoves(o, "black"), to = (r, c, card) => ms.some((m) => m.to[0] === r && m.to[1] === c && m.card === card);
  return !to(3, 2, "arrow") && to(4, 2, "arrow") && to(3, 1, "bow");
})());
check("opening move goes one row at most", (() => { const o = C.createInitialState(C.makeRng(11)); const ms = C.getLegalMoves(o, "black"); return ms.length > 0 && ms.every((m) => m.from[0] - m.to[0] <= 1); })());

// --- Moves and card cycle ---
s = deal(empty(C.createInitialState(C.makeRng(3))), ["arrow", "fork", "bow"]); s.ply = 4;
s.board[4][2] = { color: "black" }; s.board[3][3] = { color: "white" }; s.board[1][0] = { color: "white" };
let moves = C.getLegalMoves(s, "black");
const has = (ms, fr, fc, tr, tc, card) => ms.some((m) => m.from[0] === fr && m.from[1] === fc && m.to[0] === tr && m.to[1] === tc && m.card === card);
check("arrow: one or two forward", has(moves, 4, 2, 3, 2, "arrow") && has(moves, 4, 2, 2, 2, "arrow"));
check("fork: diagonal capture allowed", has(moves, 4, 2, 3, 3, "fork") && has(moves, 4, 2, 3, 1, "fork"));
check("only own open cards are used", moves.every((m) => s.hands.black.includes(m.card)));
check("white moves only with white's cards", C.getLegalMoves(s, "white").every((m) => s.hands.white.includes(m.card)));
const firstPiled = s.piles.black[0];
let n = C.applyMove(s, "black", { from: [4, 2], to: [3, 3], card: "fork" });
check("capture removes the stone", C.countStones(n, "white") === 1 && n.board[3][3].color === "black");
check("top of the own pile takes the used card's slot, the used card is back in the own pile",
  n.hands.black[1] === firstPiled && n.piles.black.includes("fork") && n.piles.black.length === 3 && !n.piles.black.includes(firstPiled));
check("white's cards stay untouched by black's move", n.hands.white.join() === s.hands.white.join() && n.piles.white.join() === s.piles.white.join());
check("the used card goes back at different places", (() => {
  const spots = new Set();
  for (let k = 1; k <= 40; k++) {
    const t = C.cloneState(s); t.drawSeed = k * 7919;
    spots.add(C.applyMove(t, "black", { from: [4, 2], to: [3, 3], card: "fork" }).piles.black.indexOf("fork"));
  }
  return spots.size >= 3;
})());
check("a blind search state does not show the piles", (() => {
  const b = C.blindState(s); const bn = C.applyMove(b, "black", { from: [4, 2], to: [3, 3], card: "fork" });
  return b.piles.black.length === 0 && b.piles.white.length === 0 && bn.hands.black[1] === null && bn.hands.black.filter(Boolean).length === 2 && !C.isCurrentState(b) &&
    C.getLegalMoves(bn, "black").every((m) => m.card);
})());
check("turn passes", n.currentPlayer === "white" && n.ply === 5);
moves = C.getLegalMoves(n, "white");
check("white moves down the board", moves.every((m) => m.to[0] >= m.from[0] || C.CARDS[m.card].moves.some(([dr]) => dr > 0)));
check("own stones block", (() => {
  const t = deal(empty(C.createInitialState(C.makeRng(4))), ["arrow", "fork", "bow"]); t.ply = 4;
  t.board[4][2] = { color: "black" }; t.board[3][2] = { color: "black" };
  return !has(C.getLegalMoves(t, "black"), 4, 2, 3, 2, "arrow") && has(C.getLegalMoves(t, "black"), 4, 2, 2, 2, "arrow");
})());

// --- Crossing home and winning ---
s = deal(empty(C.createInitialState(C.makeRng(5))), ["arrow", "fork", "bow"]);
s.board[1][2] = { color: "black" }; s.board[2][4] = { color: "black" }; s.board[0][2] = { color: "white" }; s.board[5][0] = { color: "white" }; s.board[5][5] = { color: "white" };
moves = C.getLegalMoves(s, "black");
check("a move onto the goal row is marked home", moves.some((m) => m.home && m.to[0] === 0));
n = C.applyMove(s, "black", { from: [1, 2], to: [0, 2], card: "arrow" });
check("the stone leaves the board and captures on the goal row", n.home.black === 1 && n.board[0][2] === null && C.countStones(n, "white") === 2 && !n.gameOver);
n.currentPlayer = "black";
deal(n, ["arrow", "fork", "bow"]);
n = C.applyMove(n, "black", { from: [2, 4], to: [0, 4], card: "arrow" });
check("second stone home wins", n.gameOver && n.winner === "black" && n.winReason === "home");
s = deal(empty(C.createInitialState(C.makeRng(6))), ["arrow", "fork", "bow"]);
s.board[4][2] = { color: "black" }; s.board[3][3] = { color: "white" }; s.home.white = 0;
s.board[5][5] = { color: "white" }; // white: 2 stones, needs 2
n = C.applyMove(s, "black", { from: [4, 2], to: [3, 3], card: "fork" });
check("opponent below two stones (board + home) loses", n.gameOver && n.winner === "black" && n.winReason === "captured");

// --- Pass and limit ---
s = deal(empty(C.createInitialState(C.makeRng(7))), ["arrow", "hook", "stairs"]);
s.board[0][0] = { color: "black" }; s.board[0][1] = { color: "black" }; s.board[5][5] = { color: "white" }; s.board[5][4] = { color: "white" };
// black stones on row 0 cannot happen in play, but they have no forward room
check("no legal move found", C.getLegalMoves(s, "black").length === 0);
n = C.applyPass(s, "black");
check("pass puts the first own open card back into the own pile", n.piles.black.includes("arrow") && n.hands.black[0] === s.piles.black[0] && n.currentPlayer === "white" && n.hands.white.join() === s.hands.white.join());
s = C.createInitialState(C.makeRng(8)); s.ply = C.MAX_PLIES - 1; s.home.white = 1;
n = C.applyMove(s, "black", C.getLegalMoves(s, "black").find((m) => !m.home));
check("move limit: more stones home wins", n.gameOver && n.winner === "white" && n.winReason === "limit-home");
s = C.createInitialState(C.makeRng(9)); s.ply = C.MAX_PLIES - 1;
n = C.applyMove(s, "black", C.getLegalMoves(s, "black").find((m) => !m.home && !s.board[m.to[0]][m.to[1]]));
check("move limit: equal is a draw", n.gameOver && n.winner === "draw");

// --- Saves ---
check("old rules state rejected", !C.isCurrentState({ board: [], cards: { blue: ["wind", "wave"], red: ["stone", "flame"], neutral: "mist" }, currentPlayer: "blue" }));
check("rules 3 state (shared display) rejected", (() => { const o = JSON.parse(JSON.stringify(C.createInitialState())); o.rules = 3; o.display = o.hands.black; o.queue = []; delete o.hands; delete o.piles; return !C.isCurrentState(o); })());
check("broken state rejected", !C.isCurrentState(Object.assign(C.createInitialState(), { hands: { black: ["arrow", "arrow", "fork"], white: ["bow", "hook", "fan"] } })));
check("JSON round trip accepted", C.isCurrentState(JSON.parse(JSON.stringify(C.createInitialState()))));

// --- Computer games ---
function play(levels, starter, seed) {
  const rng = C.makeRng(seed);
  let st = C.createInitialState(rng, starter);
  let guard = 0;
  while (!st.gameOver && guard++ < C.MAX_PLIES + 5) {
    const who = st.currentPlayer;
    const m = Ai.chooseMove(st, who, levels[who], rng);
    if (m && !C.getLegalMoves(st, who).some((x) => x === m || (String(x.from) === String(m.from) && String(x.to) === String(m.to) && x.card === m.card))) return { illegal: true };
    st = m ? C.applyMove(st, who, m) : C.applyPass(st, who);
    const all = allCards(st);
    if (all.length !== 12 || new Set(all).size !== 12) return { cards: true };
  }
  return { winner: st.winner, reason: st.winReason, plies: st.ply, hung: !st.gameOver };
}

const t0 = Date.now();
let seed = 1000, illegal = 0, cardErr = 0, hung = 0;
const reasons = {};
function series(a, b, games) {
  // Level a against level b, a plays black in half the games; starter alternates.
  let aWins = 0, bWins = 0, draws = 0, plies = 0;
  for (let g = 0; g < games; g++) {
    const aBlack = g % 2 === 0;
    const starter = Math.floor(g / 2) % 2 === 0 ? "black" : "white";
    const levels = aBlack ? { black: a, white: b } : { black: b, white: a };
    const r = play(levels, starter, seed++);
    if (r.illegal) { illegal++; continue; }
    if (r.cards) { cardErr++; continue; }
    if (r.hung) hung++;
    reasons[r.reason] = (reasons[r.reason] || 0) + 1;
    plies += r.plies;
    if (r.winner === "draw") draws++;
    else if ((r.winner === "black") === aBlack) aWins++;
    else bWins++;
  }
  return { aWins, bWins, draws, plies: plies / games };
}
const pct = (x, n) => (100 * x / n).toFixed(1) + "%";
const pairs = process.argv.includes("--seat-only") ? [] : [[2, 1], [3, 1], [3, 2]];
const results = pairs.map(([a, b]) => ({ a, b, r: series(a, b, GAMES) }));
results.forEach(({ a, b, r }) => {
  console.log(`level ${a} vs level ${b}: ${pct(r.aWins, GAMES)} / ${pct(r.bWins, GAMES)} / draws ${pct(r.draws, GAMES)}, ${r.plies.toFixed(1)} moves per game`);
});
if (results.length) {
  check("level 2 clearly beats level 1", results[0].r.aWins > results[0].r.bWins * 2);
  check("level 3 clearly beats level 1", results[1].r.aWins > results[1].r.bWins * 3);
  check("level 3 beats level 2", results[2].r.aWins > results[2].r.bWins * 1.3);
}

// Seat balance: same level on both sides, who starts?
const seat = {};
[2, 3].forEach((lvl) => {
  let first = 0, second = 0, draws = 0, plies = 0;
  for (let g = 0; g < GAMES; g++) {
    const starter = g % 2 === 0 ? "black" : "white";
    const r = play({ black: lvl, white: lvl }, starter, seed++);
    if (r.illegal) { illegal++; continue; }
    if (r.cards) { cardErr++; continue; }
    if (r.hung) hung++;
    reasons[r.reason] = (reasons[r.reason] || 0) + 1;
    plies += r.plies;
    if (r.winner === "draw") draws++;
    else if (r.winner === starter) first++;
    else second++;
  }
  const decided = first + second;
  seat[lvl] = { first, second, draws, plies: plies / GAMES, share: decided ? 100 * first / decided : 50 };
  console.log(`first-move balance level ${lvl}: starter ${pct(first, GAMES)}, second ${pct(second, GAMES)}, draws ${pct(draws, GAMES)} (starter share of decided games ${seat[lvl].share.toFixed(1)}%), ${seat[lvl].plies.toFixed(1)} moves per game`);
});
console.log("end reasons: " + Object.keys(reasons).sort().map((k) => k + " " + reasons[k]).join(", "));
console.log(`illegal moves ${illegal}, card errors ${cardErr}, unfinished ${hung}, time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
check("no illegal computer move", illegal === 0);
check("cards always complete", cardErr === 0);
check("every game ends", hung === 0);
if (GAMES >= 200) {
  [2, 3].forEach((lvl) => check(`first-move advantage at most 5 points (level ${lvl}: ${seat[lvl].share.toFixed(1)}%)`, Math.abs(seat[lvl].share - 50) <= 5));
}

fails.forEach((f) => console.log("FAIL " + f));
console.log(`=== CARD TACTICS CORE: rules 4, own cards per side, home, pass, limit, saves, ${GAMES} games per pairing, ${fails.length} failure(s) ===`);
process.exit(fails.length ? 1 : 0);
