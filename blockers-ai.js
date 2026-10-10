// blockers-ai.js
// Computer players for "Path Blockers" (blockers-core.js).
//
// Easy picks any move and puts a taken stone on any free field. Medium
// scores moves by progress towards the goal, reaching the goal and
// sending back other tokens, and puts stones in the way of the leading
// opponent. Hard also prefers moves that bring its most advanced token
// on, sends back advanced opponents first, and never blocks its own
// leading token if another spot stops the opponent just as well.

const BlockersAi = (function () {
  const C = (typeof BlockersCore !== "undefined") ? BlockersCore : require("./blockers-core.js");

  function bfsFrom(start) {
    const dist = { [start]: 0 };
    const queue = [start];
    while (queue.length) {
      const f = queue.shift();
      C.neighbours[f].forEach((n) => { if (dist[n] === undefined) { dist[n] = dist[f] + 1; queue.push(n); } });
    }
    return dist;
  }

  function distAfter(s, player, token, to) {
    if (to === C.goal) return 0;
    return C.distToGoal[to];
  }

  function scoreMove(s, m, level) {
    const p = s.turn;
    if (m.to === C.goal) return 100000;
    const before = C.tokenDistance(s, p, m.token);
    const after = distAfter(s, p, m.token, m.to);
    let score = (before - after) * 10;
    const o = C.ownerAt(s, m.to);
    if (o && o.player !== p) {
      const od = C.tokenDistance(s, o.player, o.token);
      score += (level >= 3 ? 3 : 2) * Math.max(0, 40 - od);
    }
    if (s.stones.indexOf(m.to) !== -1) score += 6;
    if (level >= 3) {
      let best = after;
      for (let k = 0; k < C.TOKENS; k++) if (k !== m.token) best = Math.min(best, C.tokenDistance(s, p, k));
      score += Math.max(0, 30 - best) * 2;
      if (after <= 6) score += 15; // close enough to reach the goal with one roll
    }
    return score;
  }

  function chooseMove(s, level, rng) {
    const rnd = rng || Math.random;
    const moves = C.legalMoves(s);
    if (!moves.length) return null;
    if (level <= 1) {
      const win = moves.find((m) => m.to === C.goal);
      return win || moves[Math.floor(rnd() * moves.length)];
    }
    let best = null, bestScore = -Infinity;
    moves.forEach((m) => {
      const sc = scoreMove(s, m, level) + rnd() * 0.5;
      if (sc > bestScore) { bestScore = sc; best = m; }
    });
    return best;
  }

  // The most advanced token of another player: { player, token, at, dist }.
  function leaderOf(s, me) {
    let lead = null;
    for (let p = 0; p < s.numPlayers; p++) {
      if (p === me) continue;
      for (let k = 0; k < C.TOKENS; k++) {
        const d = C.tokenDistance(s, p, k);
        if (!lead || d < lead.dist) lead = { player: p, token: k, at: s.tokens[p][k], dist: d };
      }
    }
    return lead;
  }

  function chooseStone(s, level, rng) {
    const rnd = rng || Math.random;
    const free = C.stoneTargets(s);
    if (!free.length) return null;
    if (level <= 1) return free[Math.floor(rnd() * free.length)];
    const me = s.turn;
    const lead = leaderOf(s, me);
    const start = lead.at === -1 ? C.entryOf(s, lead.player) : lead.at;
    const fromLead = bfsFrom(start);
    const startDist = C.distToGoal[start];
    // Fields on a shortest route of the leader, ahead of it.
    let options = free.filter((f) => fromLead[f] !== undefined && fromLead[f] > 0 && fromLead[f] + C.distToGoal[f] === startDist);
    if (!options.length) options = free;
    if (level >= 3) {
      // Not in the way of my own leading token, if that can be avoided.
      let mine = null;
      for (let k = 0; k < C.TOKENS; k++) {
        const d = C.tokenDistance(s, me, k);
        if (!mine || d < mine.dist) mine = { at: s.tokens[me][k], dist: d };
      }
      const myStart = mine.at === -1 ? C.entryOf(s, me) : mine.at;
      const fromMine = bfsFrom(myStart);
      const myDist = C.distToGoal[myStart];
      const notMine = options.filter((f) => !(fromMine[f] + C.distToGoal[f] === myDist));
      if (notMine.length) options = notMine;
    }
    // Close in front of the leader (but at least 2 steps away, so a
    // throw of 1 does not simply take it).
    options.sort((a, b) => {
      const da = Math.abs((fromLead[a] || 99) - 3), db = Math.abs((fromLead[b] || 99) - 3);
      return da - db || C.distToGoal[b] - C.distToGoal[a];
    });
    return options[0];
  }

  return { chooseMove, chooseStone, scoreMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BlockersAi;
}
if (typeof window !== "undefined") {
  window.BlockersAi = BlockersAi;
}
