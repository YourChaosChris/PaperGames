#!/usr/bin/env node
// Card Tactics core (rules 3, task 151): board, cards, face-down pile
// (used card back at a hidden place, blind search states), crossing
// home, captures, passing, move limit, saves, and computer-vs-computer
// games for the levels and the first-move balance.
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

// --- Setup ---
let s = C.createInitialState(C.makeRng(1));
check("rules version 3", s.rules === 3 && C.isCurrentState(s) && Number.isInteger(s.drawSeed));
check("7 rows x 6 columns", s.board.length === 7 && s.board.every((row) => row.length === 6));
check("six stones each on the back rows", C.countStones(s, "black") === 6 && C.countStones(s, "white") === 6
  && s.board[6].every((p) => p && p.color === "black") && s.board[0].every((p) => p && p.color === "white"));
check("twelve cards, all in play: 3 open, 9 in the queue", C.CARD_IDS.length === 12 && s.display.length === 3 && s.queue.length === 9
  && new Set(s.display.concat(s.queue)).size === 12);
check("black starts by default", s.currentPlayer === "black" && C.createInitialState(C.makeRng(2), "white").currentPlayer === "white");
check("cards have two or three moves, none twice", C.CARD_IDS.every((id) => {
  const m = C.CARDS[id].moves; return m.length >= 2 && m.length <= 3 && new Set(m.map(String)).size === m.length;
}));
check("no two cards alike", new Set(C.CARD_IDS.map((id) => C.CARDS[id].moves.map(String).sort().join("|"))).size === 12);
check("white uses the card turned round", String(C.cardMovesFor("hook", "white")) === String([[1, 0], [2, 1]]));

check("opening move goes one row at most", (() => { const o = C.createInitialState(C.makeRng(11)); const ms = C.getLegalMoves(o, "black"); return ms.length > 0 && ms.every((m) => m.from[0] - m.to[0] <= 1); })());

// --- Moves and card cycle ---
s = empty(C.createInitialState(C.makeRng(3))); s.ply = 2;
s.display = ["arrow", "fork", "bow"]; s.queue = C.CARD_IDS.filter((id) => !s.display.includes(id));
s.board[4][2] = { color: "black" }; s.board[3][3] = { color: "white" }; s.board[1][0] = { color: "white" };
let moves = C.getLegalMoves(s, "black");
const has = (ms, fr, fc, tr, tc, card) => ms.some((m) => m.from[0] === fr && m.from[1] === fc && m.to[0] === tr && m.to[1] === tc && m.card === card);
check("arrow: one or two forward", has(moves, 4, 2, 3, 2, "arrow") && has(moves, 4, 2, 2, 2, "arrow"));
check("fork: diagonal capture allowed", has(moves, 4, 2, 3, 3, "fork") && has(moves, 4, 2, 3, 1, "fork"));
check("only display cards are used", moves.every((m) => s.display.includes(m.card)));
const firstQueued = s.queue[0];
let n = C.applyMove(s, "black", { from: [4, 2], to: [3, 3], card: "fork" });
check("capture removes the stone", C.countStones(n, "white") === 1 && n.board[3][3].color === "black");
check("top pile card takes the used card's slot, the used card is back in the pile", n.display[1] === firstQueued && n.queue.includes("fork") && n.queue.length === 9 && !n.queue.includes(firstQueued));
check("the used card goes back at different places", (() => {
  const spots = new Set();
  for (let k = 1; k <= 40; k++) {
    const t = C.cloneState(s); t.drawSeed = k * 7919;
    spots.add(C.applyMove(t, "black", { from: [4, 2], to: [3, 3], card: "fork" }).queue.indexOf("fork"));
  }
  return spots.size >= 5;
})());
check("a blind search state does not show the pile", (() => {
  const b = C.blindState(s); const bn = C.applyMove(b, "black", { from: [4, 2], to: [3, 3], card: "fork" });
  return b.queue.length === 0 && bn.display[1] === null && bn.display.filter(Boolean).length === 2 && !C.isCurrentState(b) &&
    C.getLegalMoves(bn, "white").every((m) => m.card);
})());
check("turn passes", n.currentPlayer === "white" && n.ply === 3);
moves = C.getLegalMoves(n, "white");
check("white moves down the board", moves.every((m) => m.to[0] >= m.from[0] || C.CARDS[m.card].moves.some(([dr]) => dr > 0)));
check("own stones block", (() => {
  const t = empty(C.createInitialState(C.makeRng(4))); t.ply = 2; t.display = ["arrow", "fork", "bow"]; t.queue = C.CARD_IDS.filter((id) => !t.display.includes(id));
  t.board[4][2] = { color: "black" }; t.board[3][2] = { color: "black" };
  return !has(C.getLegalMoves(t, "black"), 4, 2, 3, 2, "arrow") && has(C.getLegalMoves(t, "black"), 4, 2, 2, 2, "arrow");
})());

// --- Crossing home and winning ---
s = empty(C.createInitialState(C.makeRng(5)));
s.display = ["arrow", "fork", "bow"]; s.queue = C.CARD_IDS.filter((id) => !s.display.includes(id));
s.board[1][2] = { color: "black" }; s.board[2][4] = { color: "black" }; s.board[0][2] = { color: "white" }; s.board[5][0] = { color: "white" }; s.board[5][5] = { color: "white" };
moves = C.getLegalMoves(s, "black");
check("a move onto the goal row is marked home", moves.some((m) => m.home && m.to[0] === 0));
n = C.applyMove(s, "black", { from: [1, 2], to: [0, 2], card: "arrow" });
check("the stone leaves the board and captures on the goal row", n.home.black === 1 && n.board[0][2] === null && C.countStones(n, "white") === 2 && !n.gameOver);
n.currentPlayer = "black";
n.display = ["arrow", "fork", "bow"]; n.queue = C.CARD_IDS.filter((id) => !n.display.includes(id));
n = C.applyMove(n, "black", { from: [2, 4], to: [0, 4], card: "arrow" });
check("second stone home wins", n.gameOver && n.winner === "black" && n.winReason === "home");
s = empty(C.createInitialState(C.makeRng(6)));
s.display = ["arrow", "fork", "bow"]; s.queue = C.CARD_IDS.filter((id) => !s.display.includes(id));
s.board[4][2] = { color: "black" }; s.board[3][3] = { color: "white" }; s.home.white = 0;
s.board[5][5] = { color: "white" }; // white: 2 stones, needs 2
n = C.applyMove(s, "black", { from: [4, 2], to: [3, 3], card: "fork" });
check("opponent below two stones (board + home) loses", n.gameOver && n.winner === "black" && n.winReason === "captured");

// --- Pass and limit ---
s = empty(C.createInitialState(C.makeRng(7)));
s.board[0][0] = { color: "black" }; s.board[0][1] = { color: "black" }; s.board[5][5] = { color: "white" }; s.board[5][4] = { color: "white" };
s.display = ["arrow", "hook", "stairs"]; s.queue = C.CARD_IDS.filter((id) => !s.display.includes(id));
// black stones on row 0 cannot happen in play, but they have no forward room
check("no legal move found", C.getLegalMoves(s, "black").length === 0);
n = C.applyPass(s, "black");
check("pass puts the first display card back into the pile", n.queue.includes("arrow") && n.display[0] === s.queue[0] && n.currentPlayer === "white");
s = C.createInitialState(C.makeRng(8)); s.ply = C.MAX_PLIES - 1; s.home.white = 1;
n = C.applyMove(s, "black", C.getLegalMoves(s, "black").find((m) => !m.home));
check("move limit: more stones home wins", n.gameOver && n.winner === "white" && n.winReason === "limit-home");
s = C.createInitialState(C.makeRng(9)); s.ply = C.MAX_PLIES - 1;
n = C.applyMove(s, "black", C.getLegalMoves(s, "black").find((m) => !m.home && !s.board[m.to[0]][m.to[1]]));
check("move limit: equal is a draw", n.gameOver && n.winner === "draw");

// --- Saves ---
check("old rules state rejected", !C.isCurrentState({ board: [], cards: { blue: ["wind", "wave"], red: ["stone", "flame"], neutral: "mist" }, currentPlayer: "blue" }));
check("rules 2 state (open queue) rejected", (() => { const o = JSON.parse(JSON.stringify(C.createInitialState())); o.rules = 2; delete o.drawSeed; return !C.isCurrentState(o); })());
check("broken state rejected", !C.isCurrentState(Object.assign(C.createInitialState(), { display: ["arrow", "arrow", "fork"] })));
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
    const all = st.display.concat(st.queue);
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
console.log(`=== CARD TACTICS CORE: rules 3, face-down pile, home, pass, limit, saves, ${GAMES} games per pairing, ${fails.length} failure(s) ===`);
process.exit(fails.length ? 1 : 0);
