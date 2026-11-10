// yut-core.js
// Dependency-free rules engine for Yut (Yunnori), the Korean traditional
// race game (public domain folk game). Rules only, no DOM/UI.
// Draft written by Gemini (gemini-flash-lite-latest), reviewed and
// corrected by Claude (center passing, extra-throw bookkeeping).
//
// Board: ring nodes 1..19 (0 = start/finish), corners 5, 10, 15.
// Diagonal A: 5-20-21-22-23-24-15. Diagonal B: 10-25-26-22-27-28-finish.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.YutCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Next node; prev = node before (null when the move starts here).
  // A piece that stopped on the centre after coming down diagonal A may
  // go home by the shortcut (27) or straight on towards corner 15
  // (choice "straight", task 192); without a choice it takes the shortcut.
  function nextNode(node, prev, choice) {
    if (node === 5) return choice === "diag" && prev === null ? 20 : 6;
    if (node === 10) return choice === "diag" && prev === null ? 25 : 11;
    if (node === 22) return prev === 21 || (prev === null && choice === "straight") ? 23 : 27;
    if (node === 19 || node === 28) return "finish";
    if (node === 20) return 21;
    if (node === 21) return 22;
    if (node === 23) return 24;
    if (node === 24) return 15;
    if (node === 25) return 26;
    if (node === 26) return 22;
    if (node === 27) return 28;
    return node + 1; // ring 1..18
  }

  // Walk n steps forward from a piece. Returns {nodes, finished}.
  function walk(piece, steps, choice) {
    if (piece.route.length === 0) return { nodes: [steps], finished: false };
    let node = piece.route[piece.route.length - 1];
    let prev = null;
    const nodes = [];
    for (let i = 0; i < steps; i++) {
      const nx = nextNode(node, prev, choice);
      if (nx === "finish") return { nodes, finished: true };
      nodes.push(nx);
      prev = node;
      node = nx;
    }
    return { nodes, finished: false };
  }

  function throwSticks(rng) {
    let flat = 0;
    let markedFlat = false;
    for (let i = 0; i < 4; i++) {
      if (rng() < 0.5) {
        flat++;
        if (i === 0) markedFlat = true; // stick 0 carries the mark
      }
    }
    if (flat === 1) return markedFlat ? { name: "backdo", steps: -1, extraThrow: false } : { name: "do", steps: 1, extraThrow: false };
    if (flat === 2) return { name: "gae", steps: 2, extraThrow: false };
    if (flat === 3) return { name: "geol", steps: 3, extraThrow: false };
    if (flat === 4) return { name: "yut", steps: 4, extraThrow: true };
    return { name: "mo", steps: 5, extraThrow: true };
  }

  function createGame(opts) {
    const players = (opts && opts.players) || 2;
    const per = (opts && opts.piecesPerPlayer) || 4;
    const pieces = [];
    for (let p = 0; p < players; p++) {
      for (let i = 0; i < per; i++) pieces.push({ id: p * per + i, player: p, route: [], done: false });
    }
    return { players, piecesPerPlayer: per, pieces, turn: 0, pending: [], owed: 1, winner: null };
  }

  const clone = (s) => JSON.parse(JSON.stringify(s));
  const pos = (pc) => (pc.route.length ? pc.route[pc.route.length - 1] : -1);

  function nextTurn(s) {
    s.turn = (s.turn + 1) % s.players;
    s.owed = 1;
    s.pending = [];
  }

  function addThrow(state, t) {
    const s = clone(state);
    s.owed = Math.max(0, s.owed - 1);
    s.pending.push(t.steps);
    if (t.extraThrow) s.owed++;
    return s;
  }

  function legalMoves(state, steps) {
    if (state.winner !== null) return [];
    const p = state.turn;
    const mine = state.pieces.filter((pc) => pc.player === p && !pc.done);
    const groups = [];
    let waitingAdded = false;
    const byNode = {};
    mine.forEach((pc) => {
      const at = pos(pc);
      if (at === -1) {
        if (!waitingAdded && steps > 0) { groups.push({ from: -1, ids: [pc.id], rep: pc }); waitingAdded = true; }
      } else {
        (byNode[at] = byNode[at] || { from: at, ids: [], rep: pc }).ids.push(pc.id);
      }
    });
    Object.keys(byNode).forEach((k) => groups.push(byNode[k]));
    const moves = [];
    groups.forEach((g) => {
      if (steps === -1) {
        if (g.from === -1) return;
        const back = g.rep.route.length > 1 ? g.rep.route[g.rep.route.length - 2] : -1;
        moves.push({ pieceIds: g.ids, from: g.from, to: back, steps, captures: [], finishes: false });
        return;
      }
      const cameFrom = g.rep.route.length > 1 ? g.rep.route[g.rep.route.length - 2] : null;
      const choices = g.from === 5 || g.from === 10 ? ["ring", "diag"]
        : g.from === 22 && cameFrom === 21 ? ["diag", "straight"] : [undefined];
      choices.forEach((choice) => {
        const w = walk(g.rep, steps, choice);
        const to = w.finished ? "finish" : w.nodes[w.nodes.length - 1];
        const captures = [];
        if (!w.finished) {
          state.pieces.forEach((pc) => { if (pc.player !== p && !pc.done && pos(pc) === to) captures.push(pc.id); });
        }
        const m = { pieceIds: g.ids, from: g.from, to, steps, captures, finishes: w.finished };
        if (choice) m.choice = choice;
        moves.push(m);
      });
    });
    return moves;
  }

  function applyMove(state, move) {
    const s = clone(state);
    const idx = s.pending.indexOf(move.steps);
    if (idx === -1) throw new Error("throw not pending");
    s.pending.splice(idx, 1);
    const p = s.turn;
    const rep = s.pieces.find((pc) => pc.id === move.pieceIds[0]);
    let newRoute;
    let finished = false;
    if (move.steps === -1) {
      newRoute = rep.route.slice(0, -1);
    } else {
      const w = walk(rep, move.steps, move.choice);
      finished = w.finished;
      newRoute = w.finished ? rep.route.slice() : (rep.route.length === 0 ? w.nodes : rep.route.concat(w.nodes));
    }
    move.pieceIds.forEach((id) => {
      const pc = s.pieces.find((x) => x.id === id);
      pc.route = newRoute.slice();
      if (finished) { pc.done = true; pc.route = []; }
    });
    if (!finished && move.steps > 0) {
      const to = newRoute[newRoute.length - 1];
      s.pieces.forEach((pc) => {
        if (pc.player === p && !pc.done && !move.pieceIds.includes(pc.id) && pos(pc) === to) pc.route = newRoute.slice(); // merge stacks
      });
    }
    if (move.captures && move.captures.length) {
      move.captures.forEach((id) => { s.pieces.find((x) => x.id === id).route = []; });
      s.owed++;
    }
    if (s.pieces.filter((pc) => pc.player === p).every((pc) => pc.done)) { s.winner = p; return s; }
    if (s.pending.length === 0 && s.owed === 0) nextTurn(s);
    return s;
  }

  function canMove(state) {
    return state.pending.some((st) => legalMoves(state, st).length > 0);
  }

  function skipUnusable(state) {
    const s = clone(state);
    s.pending = s.pending.filter((st) => legalMoves(s, st).length > 0);
    if (s.winner === null && s.pending.length === 0 && s.owed === 0) nextTurn(s);
    return s;
  }

  return {
    createGame, throwSticks, addThrow, legalMoves, applyMove, canMove, skipUnusable,
    isOver: (s) => s.winner !== null,
    winner: (s) => s.winner,
  };
});
