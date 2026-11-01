// suchbild-core.js
// Rules and pictures of "Suchbild" (en "Hidden Odd Ones", task 171): a page
// full of the same small sign, and among them 1 to 10 that are different
// (the odd ones). Tap all odd ones. No timer, no opponent.
//
// Every sign is an own simple form drawn here (circles, squares, simple
// faces of lines, letters and digits in the page's sans-serif font): no
// known figures, mascots, logos or persons.
//
// The signs stand on a grid (cols x rows), each in its own cell, moved a
// little inside the cell by chance - so no two signs ever overlap. A round is
// made from a fixed seed (SEEDS): the pair of signs, which of the two fills
// the page, how many odd ones there are and where they stand. So round r of
// a level is the same on every device and a saved game can be loaded again.
//
//   easy    5 x 6 cells,  1 to 3 odd ones, clearly different signs
//   medium  7 x 9 cells,  2 to 5, similar forms
//   hard    10 x 12,      3 to 7, letters that differ in one stroke
//   expert  13 x 16,      5 to 10, mirrored letters and digits (d/b, p/q)
//
// The state is a plain serialisable object; functions return a new state.

const SuchbildCore = (() => {
  const LEVELS = ["easy", "medium", "hard", "expert"];
  const GRID = {
    easy: { cols: 5, rows: 6, min: 1, max: 3 },
    medium: { cols: 7, rows: 9, min: 2, max: 5 },
    hard: { cols: 10, rows: 12, min: 3, max: 7 },
    expert: { cols: 13, rows: 16, min: 5, max: 10 }
  };
  const ROUNDS = 5;
  const SEEDS = { easy: 5100, medium: 5200, hard: 5300, expert: 5400 };
  // Sign pairs per level, one per round. Either sign may fill the page.
  const PAIRS = {
    easy: [["dog", "cat"], ["circle", "square"], ["star", "heart"], ["house", "tree"], ["sun", "moon"]],
    medium: [["triup", "tridown"], ["smile", "frown"], ["arrowl", "arrowr"], ["ring", "ringdot"], ["square", "diamond"]],
    hard: [["O", "Q"], ["E", "F"], ["C", "G"], ["M", "N"], ["8", "B"]],
    expert: [["d", "b"], ["p", "q"], ["u", "n"], ["6", "9"], ["1", "7"]]
  };
  // How far a sign may move inside its cell (part of the cell size), the
  // size a sign is drawn at, and the largest half size of any sign in its own
  // units: SIGN_HALF * SIGN_SCALE + JITTER * UNIT stays below half a cell,
  // so every sign stays inside its own cell and no two signs touch.
  const UNIT = 24;
  const JITTER = 0.1;
  const SIGN_SCALE = 0.8;
  const SIGN_HALF = 11;

  // mulberry32: small, fast, the same on every browser.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const cache = {};

  // Round r of a level: { cols, rows, base, odd, items: [{ x, y, odd }] }
  // with x, y the centre in cell units (0.5 = middle of the first cell).
  function round(level, r) {
    const id = level + ":" + r;
    if (cache[id]) return cache[id];
    const g = GRID[level];
    const rand = rng(SEEDS[level] + r);
    const pair = PAIRS[level][r % PAIRS[level].length];
    const flip = rand() < 0.5;
    const base = flip ? pair[1] : pair[0];
    const odd = flip ? pair[0] : pair[1];
    const total = g.cols * g.rows;
    const count = g.min + Math.floor(rand() * (g.max - g.min + 1));
    // Odd places: a shuffled list of cells, the first `count`.
    const cells = [];
    for (let i = 0; i < total; i++) cells.push(i);
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = cells[i]; cells[i] = cells[j]; cells[j] = t;
    }
    const oddSet = new Set(cells.slice(0, count));
    const items = [];
    for (let i = 0; i < total; i++) {
      const cx = i % g.cols, cy = (i - cx) / g.cols;
      items.push({ x: cx + 0.5 + (rand() * 2 - 1) * JITTER, y: cy + 0.5 + (rand() * 2 - 1) * JITTER, odd: oddSet.has(i) });
    }
    cache[id] = { cols: g.cols, rows: g.rows, base, odd, count, items };
    return cache[id];
  }

  function roundOf(s) {
    return round(s.level, s.r);
  }

  function oddIndexes(rd) {
    const out = [];
    rd.items.forEach((it, i) => { if (it.odd) out.push(i); });
    return out;
  }

  function newGame(level, r) {
    const lv = LEVELS.indexOf(level) >= 0 ? level : "easy";
    const rr = Number.isInteger(r) && r >= 0 && r < ROUNDS ? r : 0;
    return { game: "suchbild", rules: 1, level: lv, r: rr, found: [], wrong: 0, solved: false };
  }

  function valid(s) {
    if (!s || s.game !== "suchbild" || s.rules !== 1 || LEVELS.indexOf(s.level) < 0) return false;
    if (!Number.isInteger(s.r) || s.r < 0 || s.r >= ROUNDS || !Array.isArray(s.found) || !Number.isInteger(s.wrong)) return false;
    const rd = roundOf(s);
    return s.found.every((i) => Number.isInteger(i) && rd.items[i] && rd.items[i].odd) && new Set(s.found).size === s.found.length;
  }

  // The sign closest to (x, y) in cell units within `reach` cells, or -1.
  // Only the 3 x 3 cells round the point are looked at.
  function itemAt(rd, x, y, reach) {
    const cx = Math.floor(x), cy = Math.floor(y);
    let best = -1, bd = Infinity;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const gx = cx + dx, gy = cy + dy;
      if (gx < 0 || gy < 0 || gx >= rd.cols || gy >= rd.rows) continue;
      const i = gy * rd.cols + gx;
      const d = Math.hypot(rd.items[i].x - x, rd.items[i].y - y);
      if (d < bd) { bd = d; best = i; }
    }
    return bd <= (reach || 0.75) ? best : -1;
  }

  // A tap on sign i. Results: "found" (a new odd one), "again" (found
  // before), "wrong" (a normal sign; counted, nothing else changes).
  function tap(s, i) {
    if (s.solved) return { state: s, ok: false, reason: "solved" };
    const rd = roundOf(s);
    if (!rd.items[i]) return { state: s, ok: false, reason: "none" };
    if (!rd.items[i].odd) return { state: Object.assign({}, s, { wrong: s.wrong + 1 }), ok: false, reason: "wrong" };
    if (s.found.indexOf(i) >= 0) return { state: s, ok: false, reason: "again" };
    const found = s.found.concat([i]);
    return { state: Object.assign({}, s, { found, solved: found.length === rd.count }), ok: true, reason: "found" };
  }

  // "Hint": an area of cells (x, y, w, h in cells) holding an odd one not
  // found yet - about a third of the page wide and high, never the whole page.
  function hintArea(s) {
    const rd = roundOf(s);
    const left = oddIndexes(rd).filter((i) => s.found.indexOf(i) < 0);
    if (!left.length) return null;
    const i = left[0];
    const w = Math.max(2, Math.ceil(rd.cols / 3)), h = Math.max(2, Math.ceil(rd.rows / 3));
    const cx = i % rd.cols, cy = (i - cx) / rd.cols;
    // The area is placed on a fixed raster, so it does not point at the cell.
    const x = Math.min(rd.cols - w, Math.floor(cx / w) * w);
    const y = Math.min(rd.rows - h, Math.floor(cy / h) * h);
    return { x, y, w, h, item: i };
  }

  function nextRound(r) {
    return (r + 1) % ROUNDS;
  }

  /*** Signs ***/

  const K = "#141413";
  // Markup of a sign centred on (0, 0), about 20 units wide (a cell is 24).
  function sign(name) {
    const L = 'fill="none" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const F = 'fill="#fff" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"';
    const dot = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + K + '"/>';
    const txt = (t) => '<text x="0" y="6.5" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="19" fill="' + K + '">' + t + "</text>";
    switch (name) {
      // A dog: round face, long ears hanging down, nose.
      case "dog": return '<path d="M-6-6C-11-7-11 2-8 5" ' + L + '/><path d="M6-6C11-7 11 2 8 5" ' + L + '/><circle cx="0" cy="0" r="7" ' + F + "/>" + dot(-2.6, -1.5, 1.1) + dot(2.6, -1.5, 1.1) + '<ellipse cx="0" cy="2.6" rx="2" ry="1.4" fill="' + K + '"/>';
      // A cat: round face, pointed ears on top, whiskers.
      case "cat": return '<path d="M-6.5-3L-6-10L-1.5-6.2M6.5-3L6-10L1.5-6.2" ' + F + '/><circle cx="0" cy="0" r="7" ' + F + "/>" + dot(-2.6, -1.5, 1.1) + dot(2.6, -1.5, 1.1) + '<path d="M-1 2H1M-3 3L-9 2.5M-3 4.5L-9 5.5M3 3L9 2.5M3 4.5L9 5.5" ' + L + "/>";
      case "circle": return '<circle cx="0" cy="0" r="7.5" ' + L + "/>";
      case "square": return '<rect x="-7" y="-7" width="14" height="14" ' + L + "/>";
      case "diamond": return '<path d="M0-9L9 0L0 9L-9 0Z" ' + L + "/>";
      case "star": return '<path d="M0-9L2.6-3.2L9-2.8L4.1 1.4L5.6 7.8L0 4.4L-5.6 7.8L-4.1 1.4L-9-2.8L-2.6-3.2Z" ' + L + "/>";
      case "heart": return '<path d="M0 8C-11 0-8-9 0-4C8-9 11 0 0 8Z" ' + L + "/>";
      case "house": return '<path d="M-7 8V-1L0-8L7-1V8Z M-2 8V3H2V8" ' + L + "/>";
      case "tree": return '<path d="M0-9L7 3H-7Z M0 3V9" ' + L + "/>";
      case "sun": return '<circle cx="0" cy="0" r="4.5" ' + L + '/><path d="M0-9V-7M0 7V9M-9 0H-7M7 0H9M-6.4-6.4L-5-5M5 5L6.4 6.4M-6.4 6.4L-5 5M5-5L6.4-6.4" ' + L + "/>";
      case "moon": return '<path d="M3-8A8 8 0 1 0 3 8A6 6 0 1 1 3-8Z" ' + L + "/>";
      case "triup": return '<path d="M0-8L8 7H-8Z" ' + L + "/>";
      case "tridown": return '<path d="M0 8L8-7H-8Z" ' + L + "/>";
      case "smile": return '<circle cx="0" cy="0" r="8" ' + L + "/>" + dot(-3, -2, 1.1) + dot(3, -2, 1.1) + '<path d="M-3.5 2.5Q0 6 3.5 2.5" ' + L + "/>";
      case "frown": return '<circle cx="0" cy="0" r="8" ' + L + "/>" + dot(-3, -2, 1.1) + dot(3, -2, 1.1) + '<path d="M-3.5 5Q0 1.5 3.5 5" ' + L + "/>";
      case "arrowl": return '<path d="M8 0H-7M-2-5L-7 0L-2 5" ' + L + "/>";
      case "arrowr": return '<path d="M-8 0H7M2-5L7 0L2 5" ' + L + "/>";
      case "ring": return '<circle cx="0" cy="0" r="7.5" ' + L + "/>";
      case "ringdot": return '<circle cx="0" cy="0" r="7.5" ' + L + "/>" + dot(0, 0, 1.6);
      default: return txt(name);
    }
  }

  // The names of all signs (for the tests).
  function signNames() {
    const out = [];
    LEVELS.forEach((lv) => PAIRS[lv].forEach((p) => p.forEach((n) => { if (out.indexOf(n) < 0) out.push(n); })));
    return out;
  }

  return { LEVELS, GRID, ROUNDS, SEEDS, PAIRS, UNIT, JITTER, SIGN_SCALE, SIGN_HALF, rng, round, roundOf, oddIndexes, newGame, valid, itemAt, tap, hintArea, nextRound, sign, signNames };
})();

if (typeof module !== "undefined") module.exports = SuchbildCore;
if (typeof window !== "undefined") window.SuchbildCore = SuchbildCore;
