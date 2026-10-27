// teufelsieben-core.js
// Rules of "Devilish Seven" (Teuflische Sieben), a push-your-luck card game made for
// PaperGames (task 121, own rules since task 134), without any DOM or
// browser feature. File names, keys and the save slot keep the old slug
// "teufelsieben"; states of the old rules (no `rules: 2`) are not loaded.
//
// The deck (DECK, 60 cards): numbers 1 to 10 after an own table (COUNTS:
// 3, 4, 5, 6, 6, 6, 6, 5, 4, 3 = 48 cards) and two each of six special
// cards: Courage (saves its owner once from going bust, costs 5 points),
// Strike (takes the last number of the turn away), Pass (the next player
// starts the turn with one card turned up), Bridge (fills one gap of a
// run), Collector (+1 point per number card) and Peek (shows the next card).
//
// A round: one after another, every player has one whole turn and turns up
// card after card; after the first card they may stop at any time. A number
// they already have makes them go bust: no points this round. When every
// player had a turn, the round ends; the first player moves on by one seat
// every round. Round points: the sum of the numbers, plus 5 x (L - 2) for
// the longest run of L >= 4 numbers in a row (Bridges fill gaps), plus the
// Collectors, minus 5 per Courage used. The game ends after the round in
// which somebody reaches the target (60, 90 or 120); the most points win,
// a tie lets all of them win.
//
// The computer counts only open cards (never the hidden order of the deck)
// or the card a Peek showed: level 1 and 2 stop at a fixed round score or
// risk, level 3 compares the expected gain of the next card with the risk
// of losing the round points.
//
// The state is plain JSON data; actions return a new state, or the same
// object when the action is not allowed.

const TeufelSiebenCore = (() => {
  const COUNTS = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 6, 6: 6, 7: 6, 8: 5, 9: 4, 10: 3 };
  // "Wild Chain" (task 133, own cards after decision 34): the numbers 11 to
  // 14 twice each, no number with a role of its own; Link (+2 points per
  // number of the longest row) and Mirror (the last number n turns into 15 - n).
  const EXTREME_COUNTS = { 11: 2, 12: 2, 13: 2, 14: 2 };
  const SPECIALS = ["courage", "strike", "pass", "bridge", "collector", "peek"];
  const EXTREME_SPECIALS = [["link", 2], ["mirror", 2]];
  const MAX_NUMBER = 14, MIRROR_SUM = 15, LINK_POINTS = 2;
  const TARGETS = [60, 90, 120];
  const EXTREME_TARGETS = [250, 500];
  const EXTREME_DEFAULT = 250;
  const DEFAULT_TARGET = 90;
  const RUN_MIN = 4;
  const LEVELS = { 1: { aim: 14, risk: 0.18 }, 2: { aim: 22, risk: 0.27 }, 3: { aim: 0, risk: 0 } };
  const LEVELS_EXTREME = { 1: { aim: 18, risk: 0.18 }, 2: { aim: 28, risk: 0.27 }, 3: { aim: 0, risk: 0 } };

  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function buildDeck() {
    const d = [];
    Object.keys(COUNTS).forEach((v) => { for (let i = 0; i < COUNTS[v]; i++) d.push(Number(v)); });
    SPECIALS.forEach((v) => { d.push(v, v); });
    return d;
  }
  const DECK = buildDeck();
  function deckOf(mode) {
    if (mode !== "extreme") return DECK.slice();
    const d = DECK.slice();
    Object.keys(EXTREME_COUNTS).forEach((v) => { for (let i = 0; i < EXTREME_COUNTS[v]; i++) d.push(Number(v)); });
    EXTREME_SPECIALS.forEach(([card, count]) => { for (let i = 0; i < count; i++) d.push(card); });
    return d;
  }
  function shuffle(list, rng) {
    const a = list.slice(), r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function isNumber(card) { return typeof card === "number" && Number.isInteger(card) && card >= 1 && card <= MAX_NUMBER; }
  function newHand() { return { numbers: [], courage: false, courageUsed: 0, bridges: 0, collectors: 0, links: 0, mirrored: [], status: "wait", drawn: 0 }; }
  // A mirrored number is still the card that was turned up (`from`): that
  // card goes back to the discard pile, so the deck never gains a card.
  function cardOfNumber(h, v) {
    const list = h.mirrored || [], k = list.findIndex((m) => m.to === v);
    if (k < 0) return v;
    const from = list[k].from; list.splice(k, 1); return from;
  }
  function physicalNumbers(h) {
    const out = h.numbers.slice();
    (h.mirrored || []).forEach((m) => { const k = out.indexOf(m.to); if (k >= 0) out[k] = m.from; });
    return out;
  }
  function note(s, type, player, card, extra) {
    s.seq += 1;
    s.last = Object.assign({ seq: s.seq, type, player }, card === undefined ? {} : { card }, extra || {});
  }
  function newGame(opts, rng) {
    const o = opts || {}, n = Math.max(2, Math.min(6, Math.floor(o.players || 2)));
    const mode = o.mode === "extreme" ? "extreme" : "normal";
    const targets = mode === "extreme" ? EXTREME_TARGETS : TARGETS;
    const s = { game: "teufelsieben", rules: 2, mode, n, computer: [], levels: [], totals: [], target: targets.indexOf(o.target) >= 0 ? o.target : (mode === "extreme" ? EXTREME_DEFAULT : DEFAULT_TARGET),
      deck: shuffle(deckOf(mode), rng), discard: [], hands: [], dealer: n - 1, current: 0, turnsLeft: [], forced: 0, peek: null, phase: "turn", round: 0, roundPoints: null, winners: null, last: null, seq: 0 };
    for (let i = 0; i < n; i++) { s.computer.push(!!(o.computer && o.computer[i])); s.levels.push(o.levels && o.levels[i] >= 1 && o.levels[i] <= 3 ? o.levels[i] : 2); s.totals.push(0); }
    beginRound(s);
    return s;
  }
  function beginRound(s) {
    s.round += 1; s.hands = Array.from({ length: s.n }, newHand); s.hands.forEach((h) => { h.mode = s.mode || "normal"; }); s.forced = 0; s.peek = null;
    s.turnsLeft = Array.from({ length: s.n }, (_, k) => (s.dealer + 1 + k) % s.n); s.current = s.turnsLeft[0];
    s.hands[s.current].status = "in"; s.phase = "turn";
    return s;
  }
  function recycle(s, rng) {
    if (!s.deck.length && s.discard.length) { s.deck = shuffle(s.discard, rng); s.discard = []; }
  }
  function takeCard(s, rng) { recycle(s, rng); return s.deck.length ? s.deck.shift() : null; }
  function runLength(numbers, bridges, maxNumber) {
    const have = new Set(numbers.filter(isNumber));
    const limit = maxNumber || ([...have].some((v) => v > 10) ? MAX_NUMBER : 10);
    let best = 0;
    for (let start = 1; start <= limit; start++) for (let end = start; end <= limit; end++) {
      const missing = end - start + 1 - [...have].filter((v) => v >= start && v <= end).length;
      if (missing <= bridges && missing < end - start + 1) best = Math.max(best, end - start + 1);
    }
    return best;
  }
  function handPoints(h) {
    if (h.status === "bust") return 0;
    const count = h.numbers.length, l = runLength(h.numbers, h.bridges, h.mode === "extreme" ? MAX_NUMBER : undefined);
    const bonus = l >= RUN_MIN ? 5 * (l - 2) : 0;
    const sum = h.numbers.reduce((a, b) => a + b, 0);
    return Math.max(0, sum + bonus + linkPoints(h.links, l) + h.collectors * count - 5 * h.courageUsed);
  }
  // Link: +2 points for every number of the longest row (2 or more in a row).
  function linkPoints(links, run) { return links && run >= 2 ? LINK_POINTS * links * run : 0; }
  // Mirror: the number turned up last becomes 15 - n (1 and 14, 2 and 13 ...),
  // unless the hand already holds that number. Returns the new number or null.
  function mirrorOf(h) {
    if (!h.numbers.length) return null;
    const to = MIRROR_SUM - h.numbers[h.numbers.length - 1];
    return isNumber(to) && !h.numbers.includes(to) ? to : null;
  }
  function resolveDraw(s, p, rng) {
    const h = s.hands[p], card = takeCard(s, rng);
    if (card === null) { h.status = "stop"; note(s, "empty", p); return false; }
    h.drawn += 1;
    if (isNumber(card)) {
      if (h.numbers.includes(card)) {
        if (h.courage) { h.courage = false; h.courageUsed += 1; s.discard.push(card, "courage"); note(s, "saved", p, card); return true; }
        h.numbers.push(card); h.status = "bust"; note(s, "bust", p, card); return false;
      }
      h.numbers.push(card); note(s, "number", p, card); return true;
    }
    if (card === "courage") {
      if (h.courage) { s.discard.push(card); note(s, "void", p, card); }
      else { h.courage = true; note(s, "courage", p, card); }
    } else if (card === "strike") {
      if (h.numbers.length) s.discard.push(cardOfNumber(h, h.numbers.pop()));
      s.discard.push(card); note(s, "strike", p, card);
    } else if (card === "pass") {
      const next = s.turnsLeft.slice(1).find((i) => s.hands[i].status === "wait");
      if (next !== undefined) s.forced += 1;
      s.discard.push(card); note(s, "pass", p, card, { forced: s.forced, next: next === undefined ? null : next });
    } else if (card === "bridge") { h.bridges += 1; note(s, "bridge", p, card); }
    else if (card === "collector") { h.collectors += 1; note(s, "collector", p, card); }
    else if (card === "peek") {
      recycle(s, rng); s.peek = s.deck.length ? s.deck[0] : null;
      s.discard.push(card); note(s, "peek", p, card, { shown: s.peek });
    }
    else if (card === "link") { h.links = (h.links || 0) + 1; note(s, "link", p, card); }
    else if (card === "mirror") {
      const to = mirrorOf(h), from = h.numbers.length ? h.numbers[h.numbers.length - 1] : null;
      if (to !== null) { h.numbers[h.numbers.length - 1] = to; h.mirrored = (h.mirrored || []).concat({ from: cardOfNumber(h, from), to }); }
      s.discard.push(card); note(s, to === null ? "mirrornone" : "mirror", p, card, { from, to });
    }
    return true;
  }
  // The cards of a finished round stay in front of the players (the screen
  // shows them with the round's points) until the next round clears them.
  function clearHands(s) {
    s.hands.forEach((h) => {
      s.discard.push(...physicalNumbers(h));
      if (h.courage) s.discard.push("courage");
      for (let k = 0; k < h.bridges; k++) s.discard.push("bridge");
      for (let k = 0; k < h.collectors; k++) s.discard.push("collector");
      for (let k = 0; k < (h.links || 0); k++) s.discard.push("link");
      h.numbers = []; h.courage = false; h.bridges = 0; h.collectors = 0; h.links = 0; h.mirrored = [];
    });
  }
  function endRound(s) {
    s.roundPoints = s.hands.map(handPoints);
    s.roundPoints.forEach((v, i) => { s.totals[i] += v; });
    s.phase = "roundover"; s.turnsLeft = []; s.forced = 0; s.peek = null;
    const best = Math.max(...s.totals);
    if (best >= s.target) { s.phase = "over"; s.winners = s.totals.map((v, i) => v === best ? i : -1).filter((i) => i >= 0); }
    note(s, s.phase === "over" ? "gameover" : "roundover", null);
    return s;
  }
  function activateNext(s, rng) {
    if (!s.turnsLeft.length) return endRound(s);
    s.current = s.turnsLeft[0]; const h = s.hands[s.current]; h.status = "in"; s.peek = null;
    let forcedNow = s.forced;
    s.forced = 0;
    // A card turned up because of a Pass is marked, so the page can say why.
    while (forcedNow > 0 && h.status === "in") {
      forcedNow -= 1;
      const alive = resolveDraw(s, s.current, rng);
      if (s.last) s.last.forced = true;
      if (!alive) break;
    }
    if (h.status !== "in") { s.turnsLeft.shift(); return activateNext(s, rng); }
    return s;
  }
  function finishTurn(s, p, rng) {
    s.peek = null;
    if (s.turnsLeft[0] === p) s.turnsLeft.shift();
    return activateNext(s, rng);
  }
  function draw(s0, rng) {
    if (s0.phase !== "turn" || s0.hands[s0.current].status !== "in") return s0;
    const s = clone(s0), p = s.current;
    s.peek = null;
    const alive = resolveDraw(s, p, rng);
    if (!alive) return finishTurn(s, p, rng);
    return s;
  }
  function stop(s0, rng) {
    if (s0.phase !== "turn" || s0.hands[s0.current].status !== "in" || s0.hands[s0.current].drawn < 1) return s0;
    const s = clone(s0), p = s.current; s.hands[p].status = "stop"; note(s, "stop", p, undefined, { points: handPoints(s.hands[p]) });
    return finishTurn(s, p, rng);
  }
  function nextRound(s0, rng) {
    if (s0.phase !== "roundover") return s0;
    const s = clone(s0); clearHands(s); s.dealer = (s.dealer + 1) % s.n; return beginRound(s);
  }
  function unseen(s) {
    const counts = {};
    deckOf(s.mode || "normal").forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
    const open = s.discard.slice();
    s.hands.forEach((h) => { open.push(...physicalNumbers(h)); if (h.courage) open.push("courage"); for (let i = 0; i < h.bridges; i++) open.push("bridge"); for (let i = 0; i < h.collectors; i++) open.push("collector"); for (let i = 0; i < (h.links || 0); i++) open.push("link"); });
    open.forEach((c) => { if (counts[c]) counts[c]--; });
    return counts;
  }
  function bustChance(s, p) {
    const h = s.hands[p]; if (h.courage) return 0;
    // A Peek shows the very next card: the chance is then 0 or 1.
    if (s.peek !== null && s.peek !== undefined) return isNumber(s.peek) && h.numbers.includes(s.peek) ? 1 : 0;
    const counts = unseen(s); let total = 0, bad = 0;
    Object.keys(counts).forEach((k) => { total += counts[k]; if (isNumber(Number(k)) && h.numbers.includes(Number(k))) bad += counts[k]; });
    return total ? bad / total : 0;
  }
  function wantsToStop(s) {
    const p = s.current, h = s.hands[p], level = s.levels[p], points = handPoints(h);
    const levels = s.mode === "extreme" ? LEVELS_EXTREME : LEVELS;
    if (h.drawn === 0) return false;
    if (level >= 2 && s.totals[p] + points >= s.target) return true;
    const pOthers = s.turnsLeft.length === 1;
    const reached = s.totals.some((v, i) => i !== p && v >= s.target);
    if (level === 3 && pOthers && reached) return points + s.totals[p] > Math.max(...s.totals.filter((_, i) => i !== p));
    if (level === 1) return points >= levels[1].aim || bustChance(s, p) > levels[1].risk;
    if (level === 2) return points >= levels[2].aim || bustChance(s, p) > levels[2].risk;
    const pBust = bustChance(s, p);
    if (pBust >= 1) return true;
    if (s.peek !== null && s.peek !== undefined) return false;
    const unseenCards = unseen(s), total = Object.values(unseenCards).reduce((a, b) => a + b, 0);
    let gainTotal = 0;
    Object.keys(unseenCards).forEach((key) => {
      const copies = unseenCards[key];
      if (!copies) return;
      const card = isNumber(Number(key)) ? Number(key) : key;
      let gain = 0;
      if (isNumber(card)) {
        if (h.numbers.includes(card)) return;
        const next = Object.assign({}, h, { numbers: h.numbers.concat(card) });
        gain = handPoints(next) - points;
      } else if (card === "bridge") gain = handPoints(Object.assign({}, h, { bridges: h.bridges + 1 })) - points;
      else if (card === "collector") gain = handPoints(Object.assign({}, h, { collectors: h.collectors + 1 })) - points;
      else if (card === "strike" && h.numbers.length) gain = handPoints(Object.assign({}, h, { numbers: h.numbers.slice(0, -1) })) - points;
      else if (card === "link") gain = handPoints(Object.assign({}, h, { links: (h.links || 0) + 1 })) - points;
      else if (card === "mirror") { const to = mirrorOf(h); if (to !== null) gain = handPoints(Object.assign({}, h, { numbers: h.numbers.slice(0, -1).concat(to) })) - points; }
      gainTotal += gain * copies;
    });
    const expectedGain = gainTotal / Math.max(1, total - Object.keys(unseenCards).reduce((a, k) => a + (isNumber(Number(k)) && h.numbers.includes(Number(k)) ? unseenCards[k] : 0), 0));
    const gain = s.mode === "extreme" ? expectedGain : Math.max(0, expectedGain);
    return (1 - pBust) * gain <= pBust * points;
  }
  function aiStep(s, rng) { if (s.phase !== "turn" || !s.computer[s.current]) return s; return wantsToStop(s) ? stop(s, rng) : draw(s, rng); }
  function actor(s) { return s.current; }
  function outcomeFor(s, p) { if (s.phase !== "over") return null; if (!s.winners.includes(p)) return "loss"; return s.winners.length > 1 ? "draw" : "win"; }
  function isCurrentState(s) {
    if (!s || s.game !== "teufelsieben" || s.rules !== 2 || !Number.isInteger(s.n) || s.n < 2 || s.n > 6) return false;
    if (s.mode !== undefined && s.mode !== "normal" && s.mode !== "extreme") return false;
    if (![s.computer, s.levels, s.totals, s.hands].every((a) => Array.isArray(a) && a.length === s.n)) return false;
    if (!Array.isArray(s.deck) || !Array.isArray(s.discard) || !Array.isArray(s.turnsLeft) || !Number.isInteger(s.current)) return false;
    if (!["turn", "roundover", "over"].includes(s.phase) || !Number.isInteger(s.round) || !Number.isInteger(s.dealer) || !Number.isInteger(s.seq)) return false;
    if (!Number.isInteger(s.target) || !Number.isInteger(s.forced) || !Object.prototype.hasOwnProperty.call(s, "peek") || !Object.prototype.hasOwnProperty.call(s, "last")) return false;
    if (s.phase === "turn" && (!Array.isArray(s.roundPoints) && s.roundPoints !== null)) return false;
    if ((s.phase === "roundover" || s.phase === "over") && (!Array.isArray(s.roundPoints) || s.roundPoints.length !== s.n)) return false;
    return s.hands.every((h) => h && Array.isArray(h.numbers) && typeof h.courage === "boolean" && Number.isInteger(h.courageUsed) && Number.isInteger(h.bridges) && Number.isInteger(h.collectors) && Number.isInteger(h.drawn) && ["wait", "in", "stop", "bust"].includes(h.status));
  }
  return { DECK, COUNTS, SPECIALS, TARGETS, DEFAULT_TARGET, EXTREME_COUNTS, EXTREME_SPECIALS, EXTREME_TARGETS, EXTREME_DEFAULT, LEVELS_EXTREME, MAX_NUMBER, MIRROR_SUM, LINK_POINTS, deckOf, mirrorOf, linkPoints, RUN_MIN, LEVELS, makeRng, newGame, draw, stop, nextRound, handPoints, runLength, bustChance, unseen, wantsToStop, aiStep, actor, outcomeFor, isNumber, isCurrentState };
})();

if (typeof module !== "undefined") module.exports = TeufelSiebenCore;
if (typeof window !== "undefined") window.TeufelSiebenCore = TeufelSiebenCore;
