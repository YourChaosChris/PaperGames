// poker-core.js
// Texas Hold'em with fixed bet steps (limit): you against 1 to 3
// computers. Dependency-free, no DOM.
//
// Every player starts with 200 chips; the blinds are fixed (5 and 10).
// Each hand: two face-down cards per player, then up to five shared cards
// (flop 3, turn 1, river 1) with a betting round before the flop and
// after each step. In a betting round a player can fold, check or call,
// and bet or raise by a fixed step: 10 before the flop and on the flop,
// 20 on the turn and the river, at most 4 bets per round. A player who
// cannot pay the whole amount goes all in; side pots are kept apart.
// At the showdown the best five of seven cards win. A player with no
// chips left is out; the game ends when one player has all the chips.
// Chips are only points in the game.

const PokerCore = (function () {
  const START_CHIPS = 200;
  const SMALL_BLIND = 5;
  const BIG_BLIND = 10;
  const MAX_BETS = 4;
  const SUITS = ["S", "H", "D", "C"];
  // Hand categories, weakest first.
  const HAND_NAMES = ["High card", "One pair", "Two pair", "Three of a kind", "Straight", "Flush", "Full house",
    "Four of a kind", "Straight flush", "Royal flush"];

  function newDeck() {
    const d = [];
    SUITS.forEach((suit) => { for (let rank = 2; rank <= 14; rank++) d.push({ rank, suit }); });
    return d;
  }

  function shuffle(deck, rng) {
    const r = rng || Math.random;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    return deck;
  }

  /*** Hand values ***/

  // Score of the best five-card hand among 5 to 7 cards, as one number:
  // category in the top bits, then up to five ranks that break ties.
  function score(cat, ranks) {
    let s = cat;
    for (let i = 0; i < 5; i++) s = s * 16 + (ranks[i] || 0);
    return s;
  }

  function topStraight(mask) {
    for (let high = 14; high >= 5; high--) {
      let ok = true;
      for (let r = high; r > high - 5; r--) {
        const bit = r === 1 ? 14 : r;
        if (!(mask & (1 << bit))) { ok = false; break; }
      }
      if (ok) return high;
    }
    return 0;
  }

  function evaluate(cards) {
    const count = new Array(15).fill(0);
    const suitCount = { S: 0, H: 0, D: 0, C: 0 };
    const suitMask = { S: 0, H: 0, D: 0, C: 0 };
    let mask = 0;
    cards.forEach((c) => { count[c.rank]++; suitCount[c.suit]++; suitMask[c.suit] |= 1 << c.rank; mask |= 1 << c.rank; });
    // Flush and straight flush.
    let flushSuit = null;
    SUITS.forEach((s) => { if (suitCount[s] >= 5) flushSuit = s; });
    if (flushSuit) {
      const sf = topStraight(suitMask[flushSuit]);
      if (sf) return score(sf === 14 ? 9 : 8, [sf]);
    }
    const quads = [], trips = [], pairs = [], singles = [];
    for (let r = 14; r >= 2; r--) {
      if (count[r] === 4) quads.push(r);
      else if (count[r] === 3) trips.push(r);
      else if (count[r] === 2) pairs.push(r);
      else if (count[r] === 1) singles.push(r);
    }
    const highest = (exclude, n) => {
      const out = [];
      for (let r = 14; r >= 2 && out.length < n; r--) if (count[r] && exclude.indexOf(r) === -1) out.push(r);
      return out;
    };
    if (quads.length) return score(7, [quads[0]].concat(highest([quads[0]], 1)));
    if (trips.length && (trips.length > 1 || pairs.length)) {
      const pair = Math.max(trips[1] || 0, pairs[0] || 0);
      return score(6, [trips[0], pair]);
    }
    if (flushSuit) {
      const fr = [];
      for (let r = 14; r >= 2 && fr.length < 5; r--) if (suitMask[flushSuit] & (1 << r)) fr.push(r);
      return score(5, fr);
    }
    const st = topStraight(mask);
    if (st) return score(4, [st]);
    if (trips.length) return score(3, [trips[0]].concat(highest([trips[0]], 2)));
    if (pairs.length >= 2) return score(2, [pairs[0], pairs[1]].concat(highest([pairs[0], pairs[1]], 1)));
    if (pairs.length) return score(1, [pairs[0]].concat(highest([pairs[0]], 3)));
    return score(0, highest([], 5));
  }

  function categoryOf(sc) {
    return Math.floor(sc / Math.pow(16, 5));
  }

  // The best five cards themselves (for showing them): the five-card
  // subset with the highest score.
  function bestFive(cards) {
    let best = cards.slice(0, 5), bestScore = -1;
    const n = cards.length, idx = [0, 1, 2, 3, 4];
    if (n >= 5) {
      // Every five-card subset, in lexicographic order of the indices.
      for (;;) {
        const five = idx.map((k) => cards[k]);
        const sc = evaluate(five);
        if (sc > bestScore) { bestScore = sc; best = five; }
        let k = 4;
        while (k >= 0 && idx[k] === n - 5 + k) k--;
        if (k < 0) break;
        idx[k]++;
        for (let m = k + 1; m < 5; m++) idx[m] = idx[m - 1] + 1;
      }
    } else {
      bestScore = evaluate(best);
    }
    // Sort for display: cards of the bigger groups first, then by rank.
    const cnt = {};
    best.forEach((c) => { cnt[c.rank] = (cnt[c.rank] || 0) + 1; });
    best = best.slice().sort((x, y) => (cnt[y.rank] - cnt[x.rank]) || (y.rank - x.rank));
    const cat = categoryOf(bestScore);
    if (cat === 4 || cat === 8) {
      // A five-high straight shows the Ace last.
      const ranks = best.map((c) => c.rank);
      if (ranks.indexOf(14) !== -1 && ranks.indexOf(2) !== -1 && ranks.indexOf(13) === -1) best = best.slice(1).concat(best.slice(0, 1));
    }
    return { cards: best, score: bestScore, category: cat, name: HAND_NAMES[cat] };
  }

  /*** Game ***/

  function createGame(numComputers, rng) {
    const n = Math.max(1, Math.min(3, numComputers || 1)) + 1;
    const players = [];
    for (let i = 0; i < n; i++) players.push({ chips: START_CHIPS, hole: [], bet: 0, total: 0, folded: false, allIn: false, out: false, needsAct: false, lastAction: "" });
    return {
      players, dealer: n - 1, deck: [], board: [], street: 0, toAct: -1, currentBet: 0, bets: 0,
      phase: "handover",    // handover (waiting for the next hand), betting, gameover
      hand: 0, result: null, rngSeed: 0
    };
  }

  function clone(s) {
    return Object.assign({}, s, {
      players: s.players.map((p) => Object.assign({}, p, { hole: p.hole.slice() })),
      deck: s.deck.slice(), board: s.board.slice(), result: s.result ? JSON.parse(JSON.stringify(s.result)) : null
    });
  }

  function nextLive(s, i) {
    const n = s.players.length;
    for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (!s.players[j].out) return j; }
    return -1;
  }

  function inHand(s) { return s.players.map((p, i) => i).filter((i) => !s.players[i].out && !s.players[i].folded); }
  function canAct(s, i) { const p = s.players[i]; return !p.out && !p.folded && !p.allIn; }

  function pay(s, i, amount) {
    const p = s.players[i];
    const a = Math.min(amount, p.chips);
    p.chips -= a; p.bet += a; p.total += a;
    if (p.chips === 0) p.allIn = true;
    return a;
  }

  function potOf(s) { return s.players.reduce((t, p) => t + p.total, 0); }

  function startHand(s0, rng) {
    if (s0.phase !== "handover") return null;
    const s = clone(s0);
    const r = rng || Math.random;
    s.hand++;
    s.result = null;
    s.board = [];
    s.street = 0;
    s.players.forEach((p) => { p.hole = []; p.bet = 0; p.total = 0; p.folded = p.out; p.allIn = false; p.needsAct = false; p.lastAction = ""; });
    s.dealer = nextLive(s, s.dealer);
    const live = s.players.filter((p) => !p.out).length;
    const sb = live === 2 ? s.dealer : nextLive(s, s.dealer);
    const bb = nextLive(s, sb);
    s.deck = shuffle(newDeck(), r);
    for (let round = 0; round < 2; round++) {
      for (let k = 1; k <= s.players.length; k++) {
        const i = (s.dealer + k) % s.players.length;
        if (!s.players[i].out) s.players[i].hole.push(s.deck.pop());
      }
    }
    pay(s, sb, SMALL_BLIND); s.players[sb].lastAction = "small blind";
    pay(s, bb, BIG_BLIND); s.players[bb].lastAction = "big blind";
    s.sb = sb; s.bb = bb;
    s.currentBet = Math.max(s.players[sb].bet, s.players[bb].bet, BIG_BLIND);
    s.bets = 1;
    s.players.forEach((p, i) => { p.needsAct = canAct(s, i); });
    s.phase = "betting";
    s.toAct = nextLive(s, bb);
    advance(s, r);
    return s;
  }

  function stepSize(s) { return s.street >= 2 ? 2 * BIG_BLIND : BIG_BLIND; }

  // What the player on turn may do: { fold, check, call, raise,
  // callAmount, raiseAmount (what the player pays for the raise), raiseTo }.
  function legal(s) {
    const i = s.toAct;
    if (s.phase !== "betting" || i < 0) return null;
    const p = s.players[i];
    const toCall = Math.max(0, s.currentBet - p.bet);
    // Raising makes sense only while another player can still answer.
    const others = s.players.some((q, j) => j !== i && canAct(s, j));
    return {
      fold: toCall > 0,
      check: toCall === 0,
      call: toCall > 0,
      callAmount: Math.min(toCall, p.chips),
      raise: p.chips > toCall && s.bets < MAX_BETS && others,
      raiseAmount: Math.min(toCall + stepSize(s), p.chips),
      raiseTo: p.bet + Math.min(toCall + stepSize(s), p.chips),
      bet: s.currentBet === 0
    };
  }

  // Applies "fold", "check", "call" or "raise" for the player on turn.
  function act(s0, action, rng) {
    const L = legal(s0);
    if (!L) return null;
    if ((action === "fold" && !L.fold) || (action === "check" && !L.check) || (action === "call" && !L.call) || (action === "raise" && !L.raise)) return null;
    const s = clone(s0);
    const i = s.toAct, p = s.players[i];
    if (action === "fold") { p.folded = true; p.lastAction = "fold"; }
    else if (action === "check") { p.lastAction = "check"; }
    else if (action === "call") { pay(s, i, L.callAmount); p.lastAction = p.allIn ? "call all in" : "call"; }
    else {
      const before = s.currentBet;
      pay(s, i, L.raiseAmount);
      if (p.bet > before) {
        s.currentBet = p.bet;
        s.bets++;
        s.players.forEach((q, j) => { if (j !== i && canAct(s, j)) q.needsAct = true; });
      }
      p.lastAction = (before === 0 ? "bet" : "raise") + (p.allIn ? " all in" : "");
    }
    p.needsAct = false;
    s.toAct = nextLive(s, i);
    advance(s, rng);
    return s;
  }

  // Moves the hand on: next player to act, next street or the end.
  function advance(s, rng) {
    for (;;) {
      const live = inHand(s);
      if (live.length === 1) { finishHand(s, live, false); return; }
      const actors = s.players.map((p, i) => i).filter((i) => canAct(s, i));
      const pending = actors.filter((i) => s.players[i].needsAct);
      const roundOver = !pending.length || (actors.length === 1 && s.players[actors[0]].bet >= s.currentBet);
      if (!roundOver) {
        // The next player who still has to act.
        let j = s.toAct;
        for (let k = 0; k < s.players.length; k++) {
          if (canAct(s, j) && s.players[j].needsAct) { s.toAct = j; return; }
          j = (j + 1) % s.players.length;
        }
      }
      // The betting round is over.
      s.players.forEach((p) => { p.bet = 0; p.needsAct = false; });
      s.currentBet = 0;
      s.bets = 0;
      if (s.street === 3) { finishHand(s, live, true); return; }
      s.street++;
      if (s.street === 1) s.board.push(s.deck.pop(), s.deck.pop(), s.deck.pop());
      else s.board.push(s.deck.pop());
      s.players.forEach((p, i) => { p.needsAct = canAct(s, i); if (canAct(s, i)) p.lastAction = ""; });
      s.toAct = nextLive(s, s.dealer);
      // With at most one player who can still bet, the rest of the board
      // is simply dealt.
      if (s.players.filter((p, i) => canAct(s, i)).length <= 1) {
        s.players.forEach((p) => { p.needsAct = false; });
      }
    }
  }

  // Shares out the pot (with side pots) and ends the hand.
  function finishHand(s, live, showdown) {
    const n = s.players.length;
    const won = new Array(n).fill(0);
    const hands = {};
    if (showdown) live.forEach((i) => { hands[i] = bestFive(s.players[i].hole.concat(s.board)); });
    if (!showdown) {
      won[live[0]] = potOf(s);
    } else {
      const levels = Array.from(new Set(s.players.map((p) => p.total).filter((t) => t > 0))).sort((a, b) => a - b);
      let prev = 0;
      levels.forEach((level) => {
        let slice = 0;
        s.players.forEach((p) => { slice += Math.max(0, Math.min(p.total, level) - prev); });
        let eligible = live.filter((i) => s.players[i].total >= level);
        if (!eligible.length) {
          const top = Math.max.apply(null, live.map((i) => s.players[i].total));
          eligible = live.filter((i) => s.players[i].total === top);
        }
        const best = Math.max.apply(null, eligible.map((i) => hands[i].score));
        const winners = eligible.filter((i) => hands[i].score === best);
        const share = Math.floor(slice / winners.length);
        let rest = slice - share * winners.length;
        winners.forEach((i) => { won[i] += share; });
        // Odd chips go to the first winner after the dealer.
        for (let k = 1; k <= n && rest > 0; k++) {
          const j = (s.dealer + k) % n;
          if (winners.indexOf(j) !== -1) { won[j] += rest; rest = 0; }
        }
        prev = level;
      });
    }
    const pot = potOf(s);
    won.forEach((w, i) => { s.players[i].chips += w; });
    s.players.forEach((p) => { p.bet = 0; p.needsAct = false; });
    s.result = {
      showdown,
      pot,
      won,
      hands: Object.keys(hands).map((k) => ({ player: +k, name: hands[k].name, category: hands[k].category, cards: hands[k].cards }))
    };
    s.players.forEach((p) => { if (p.chips === 0) p.out = true; });
    s.toAct = -1;
    s.phase = s.players.filter((p) => !p.out).length <= 1 ? "gameover" : "handover";
  }

  return {
    START_CHIPS, SMALL_BLIND, BIG_BLIND, MAX_BETS, HAND_NAMES, newDeck, shuffle, evaluate, categoryOf, bestFive,
    createGame, startHand, legal, act, potOf, inHand, canAct, stepSize
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PokerCore;
}
if (typeof window !== "undefined") {
  window.PokerCore = PokerCore;
}
