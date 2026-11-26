// dreitafeln-ai.js
// Computer side of Three Grids. A move is scored by the position after it:
// boards won, and on every open board the lines still free of the other
// side, weighted by how many of their fields are already marked.
//   1 = easy   - takes a board it can win at once, otherwise mostly random
//   2 = medium - the best move by that score, now and then a random one
//   3 = hard   - also looks at the best answer with the two cards left open

const DreitafelnAi = (function () {
  const Core = typeof DreitafelnCore !== "undefined" ? DreitafelnCore : require("./dreitafeln-core.js");

  // A line two marks deep: worth almost a board when its owner moves next and
  // the missing number lies face up, less when the card is still hidden.
  function threat(s, board, line, side) {
    const free = line.find((i) => board[i] === null);
    const open = s.open.indexOf(free + 1) !== -1;
    if (open && s.turn === side) return 600;
    return open ? 60 : 30;
  }

  function evaluate(s, me) {
    if (s.result) return s.result.draw ? 0 : (s.result.winner === me ? 100000 : -100000);
    const opp = Core.other(me);
    let score = (Core.count(s, me) - Core.count(s, opp)) * 1000;
    for (let b = 0; b < Core.BOARDS; b++) {
      if (s.won[b]) continue;
      const board = s.boards[b];
      for (const l of Core.LINES) {
        let mine = 0, theirs = 0;
        l.forEach((i) => { if (board[i] === me) mine++; else if (board[i] === opp) theirs++; });
        if (theirs === 0 && mine) score += mine === 2 ? threat(s, board, l, me) : 4;
        if (mine === 0 && theirs) score -= theirs === 2 ? threat(s, board, l, opp) : 4;
      }
    }
    return score;
  }

  // The worst score the other side can leave after its best answer. The card
  // that just came up is the computer's guess: it only knows which numbers
  // are still in the stack (the free fields minus the face-up cards), not
  // their order, so it averages over them.
  function bestReply(s, me) {
    let worst = Infinity;
    for (const m of Core.getLegalMoves(s)) {
      const v = evaluate(Core.applyMove(s, m), me);
      if (v < worst) worst = v;
    }
    return worst === Infinity ? evaluate(s, me) : worst;
  }

  function hiddenCards(s) {
    const left = new Array(10).fill(0);
    s.boards.forEach((b) => b.forEach((v, i) => { if (v === null) left[i + 1]++; }));
    s.open.forEach((c) => { if (c !== null) left[c]--; });
    return left;
  }

  function expectedReply(state, m, me) {
    const after = Core.applyMove(state, m);
    if (after.result || state.deck.length === 0) return bestReply(after, me);
    // Undo the peek at the real next card: try every number still hidden.
    const left = hiddenCards(state);
    let total = 0, weight = 0;
    for (let n = 1; n <= 9; n++) {
      if (left[n] <= 0) continue;
      const guess = Core.copy(after);
      guess.open[m.slot] = n;
      total += left[n] * bestReply(guess, me);
      weight += left[n];
    }
    return weight ? total / weight : bestReply(after, me);
  }

  function chooseMove(state, level, rng) {
    const r = rng || Math.random;
    const me = state.turn;
    const moves = Core.getLegalMoves(state);
    if (!moves.length) return null;
    const scored = moves.map((m) => {
      const next = Core.applyMove(state, m);
      const v = level >= 3 && !next.result ? expectedReply(state, m, me) : evaluate(next, me);
      return { m: m, v: v + r() * 0.5 };
    });
    if (level === 2 && r() < 0.2) return moves[Math.floor(r() * moves.length)];
    if (level <= 1) {
      const win = scored.filter((x) => x.v >= 900 + (Core.count(state, me) - Core.count(state, Core.other(me))) * 1000);
      if (win.length && r() < 0.7) return win[0].m;
      if (r() < 0.75) return moves[Math.floor(r() * moves.length)];
    }
    scored.sort((a, b) => b.v - a.v);
    return scored[0].m;
  }

  return { chooseMove, evaluate };
})();

if (typeof module !== "undefined") module.exports = DreitafelnAi;
