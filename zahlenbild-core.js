// zahlenbild-core.js
// Rules and pictures of "Zahlenbild" (en "Dot Picture"): numbered dots on
// the board; tap dot 1, then 2, then 3 and so on. A line joins each dot to
// the one before; after the last dot the line closes back to dot 1 and the
// finished picture shows with its name. A wrong dot changes nothing.
//
// All pictures are own, simple outlines (task 166: no known figures, logos,
// mascots or traced pictures). Coordinates are on a 100 x 100 board. Every
// picture is one closed line without crossings; `details` are extra lines
// (eye, door, wheels) that only show once the picture is finished.
//
// Four levels: easy (children, 10 to 20 big dots), medium, hard and expert
// (many dots close together, the picture only shows at the end). Each level
// has five pictures; more can be added to MOTIFS.
//
// Numbers sit next to their dot. `labels()` picks for every dot one of eight
// places so that no number covers another number or a dot, measured at the
// scale where the closest two dots are 44 px apart (`scaleFor()`); the easy
// level is drawn that way.
//
// Task 169: from medium on the app shows the whole picture, fitted to the
// board (`wholeView()`), at one fixed scale for the whole game, so the dots
// are closer together. `layout()` gives the numbers for any scale: the
// largest font (down to 8 px) at which no number covers another number or a
// dot, with the eight places as before. "Magnify" draws the picture at the
// scale where the closest dots are 30 px apart (`magnifyScale()`).
//
// The state is a plain serialisable object; functions return a new state.

const ZahlenbildCore = (() => {
  const LEVELS = ["easy", "medium", "hard", "expert"];
  const TAP_PX = 44;
  const MAG_PX = 30;      // "Magnify": the closest dots this far apart (task 169)
  const MARGIN_PX = 24;   // room for numbers round the fitted whole picture
  const MIN_FONT = 8;     // smallest number size of the fitted whole picture

  // Sizes in CSS pixels: dot radius and number height per level.
  const LOOK = {
    easy: { dot: 9, font: 18 },
    medium: { dot: 6, font: 15 },
    hard: { dot: 5.5, font: 14 },
    expert: { dot: 5, font: 14 }
  };

  const rad = (deg) => deg * Math.PI / 180;
  const round1 = (v) => Math.round(v * 10) / 10;

  // Points of a curve r(angle) around (cx, cy), stretched by sx, sy.
  function polar(cx, cy, r, from, to, steps, sx, sy) {
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const a = from + (to - from) * i / steps;
      const rr = r(rad(a));
      out.push([cx + (sx || 1) * rr * Math.cos(rad(a)), cy + (sy || 1) * rr * Math.sin(rad(a))]);
    }
    return out;
  }

  // n points spread evenly along a closed line through `pts`.
  function resample(pts, n) {
    const segs = [];
    let total = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push([a, b, len]);
      total += len;
    }
    const out = [];
    let k = 0;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const want = total * i / n;
      while (k < segs.length - 1 && acc + segs[k][2] < want) { acc += segs[k][2]; k++; }
      const [a, b, len] = segs[k];
      const t = len ? (want - acc) / len : 0;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return out;
  }

  // Keeps every corner of a closed polygon and adds points on the longest
  // sides until there are n.
  function subdivide(verts, n) {
    const lens = verts.map((a, i) => { const b = verts[(i + 1) % verts.length]; return Math.hypot(b[0] - a[0], b[1] - a[1]); });
    const parts = verts.map(() => 1);
    let count = verts.length;
    while (count < n) {
      let best = 0;
      for (let i = 1; i < verts.length; i++) if (lens[i] / parts[i] > lens[best] / parts[best]) best = i;
      parts[best]++;
      count++;
    }
    const out = [];
    verts.forEach((a, i) => {
      const b = verts[(i + 1) % verts.length];
      for (let j = 0; j < parts[i]; j++) out.push([a[0] + (b[0] - a[0]) * j / parts[i], a[1] + (b[1] - a[1]) * j / parts[i]]);
    });
    return out;
  }

  function star(cx, cy, outer, inner, spikes) {
    const out = [];
    for (let k = 0; k < 2 * spikes; k++) {
      const a = rad(-90 + 180 * k / spikes);
      const r = k % 2 ? inner : outer;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return out;
  }

  const circlePath = (x, y, r) => "M" + (x - r) + " " + y + "a" + r + " " + r + " 0 1 0 " + (2 * r) + " 0a" + r + " " + r + " 0 1 0 " + (-2 * r) + " 0";

  // ---- The pictures (all own drawings) ----
  const MOTIFS = {
    easy: [
      { id: "house", dots: () => [[18, 88], [18, 67], [18, 46], [34, 30], [50, 14], [66, 30], [82, 46], [82, 67], [82, 88], [66, 88], [50, 88], [34, 88]],
        details: ["M42 88V68H58V88", "M26 54H38V64H26Z", "M62 54H74V64H62Z"] },
      { id: "star", dots: () => star(50, 54, 42, 18, 5), details: [] },
      { id: "fish", dots: () => [[10, 50], [22, 36], [38, 28], [55, 27], [69, 33], [80, 42], [92, 30], [92, 50], [92, 70], [80, 58], [69, 67], [55, 73], [38, 72], [22, 64]],
        details: [circlePath(25, 46, 3), "M40 38Q46 50 40 62"] },
      { id: "tree", dots: () => [[50, 6], [73, 32], [59, 32], [80, 56], [65, 56], [88, 80], [57, 80], [57, 94], [43, 94], [43, 80], [12, 80], [35, 56], [20, 56], [41, 32], [27, 32]],
        details: [] },
      { id: "boat", dots: () => [[8, 64], [27, 64], [46, 64], [46, 45], [46, 26], [46, 8], [60, 27], [74, 45], [88, 64], [81, 76], [74, 88], [48, 88], [22, 88], [15, 76]],
        details: ["M46 64H88", "M46 8L36 13L46 18"] }
    ],
    medium: [
      { id: "apple", dots: () => resample(polar(50, 58, (a) => 34 - 11 * Math.exp(-Math.pow((a + Math.PI / 2) / 0.42, 2)), -90, 270, 180, 1.05, 1), 26),
        details: ["M50 30Q50 18 56 10", "M52 22Q64 10 74 16Q64 26 52 22Z"] },
      { id: "car", dots: () => subdivide([[8, 72], [8, 54], [24, 50], [36, 32], [66, 32], [80, 50], [92, 54], [92, 72]], 25),
        details: [circlePath(28, 74, 9), circlePath(72, 74, 9), "M40 36H50V50H30Z", "M54 36H64L74 50H54Z"] },
      { id: "mushroom", dots: () => subdivide(polar(50, 54, () => 1, 180, 360, 12, 42, 40).concat([[64, 54], [64, 90], [36, 90], [36, 54]]), 28),
        details: [circlePath(36, 34, 5), circlePath(60, 28, 6), circlePath(74, 44, 4)] },
      { id: "rocket", dots: () => subdivide([[50, 6], [63, 22], [66, 44], [66, 68], [80, 82], [80, 92], [62, 84], [38, 84], [20, 92], [20, 82], [34, 68], [34, 44], [37, 22]], 28),
        details: [circlePath(50, 40, 7), "M43 84L50 96L57 84"] },
      { id: "cup", dots: () => subdivide([[14, 24], [80, 24], [78, 68], [66, 84], [28, 84], [16, 68]], 25),
        details: ["M73 36C94 36 94 64 71 62", "M8 88H88", "M36 18Q32 12 36 6", "M50 18Q46 12 50 6"] }
    ],
    hard: [
      { id: "flower", dots: () => resample(polar(50, 42, (a) => 29 + 8 * Math.cos(5 * (a + Math.PI / 2)), -90, 270, 360), 40),
        details: [circlePath(50, 42, 9), "M50 73V98", "M50 90Q38 82 33 88Q40 96 50 90"] },
      { id: "sun", dots: () => subdivide(star(50, 50, 45, 31, 12), 44),
        details: [circlePath(50, 50, 22), circlePath(42, 45, 2.5), circlePath(58, 45, 2.5), "M40 56Q50 64 60 56"] },
      { id: "cloud", dots: () => resample(polar(50, 52, (a) => 27 + 6 * Math.abs(Math.cos(3 * a)), 0, 360, 360, 1.45, 0.95), 40),
        details: ["M30 86L26 94", "M50 86L46 94", "M70 86L66 94"] },
      { id: "balloon", dots: () => subdivide(polar(50, 38, () => 31, 150, 390, 12).concat([[60, 78], [61, 92], [39, 92], [40, 78]]), 42),
        details: ["M39 84H61", "M50 7Q34 36 42 65", "M50 7Q66 36 58 65"] },
      // Four wings: a notch at the left and right splits upper and lower wings.
      { id: "butterfly", dots: () => resample(polar(50, 50, (a) => (12 + 34 * Math.pow(Math.abs(Math.cos(a)), 1.2)) * (1 - 0.32 * Math.exp(-Math.pow(Math.sin(a), 2) / 0.03)) * (1 - 0.18 * Math.sin(a)), 0, 360, 720), 40),
        details: ["M47 50a3 15 0 1 0 6 0a3 15 0 1 0 -6 0", "M49 36Q44 24 38 20", "M51 36Q56 24 62 20"] }
    ],
    expert: [
      { id: "castle", dots: () => subdivide([[10, 92], [10, 24], [16.7, 24], [16.7, 30], [23.3, 30], [23.3, 24], [30, 24], [30, 44], [38, 44], [38, 50], [46, 50], [46, 44], [54, 44], [54, 50], [62, 50], [62, 44], [70, 44], [70, 24], [76.7, 24], [76.7, 30], [83.3, 30], [83.3, 24], [90, 24], [90, 92], [60, 92], [60, 76], [57, 69], [50, 66], [43, 69], [40, 76], [40, 92]], 58),
        details: ["M17 44H23V54H17Z", "M77 44H83V54H77Z", "M50 66V54", "M50 54L60 57L50 60"] },
      { id: "hedgehog", dots: () => {
        const pts = [];
        // Back with spikes from the tail (left) over the top to the head.
        for (let k = 0; k <= 30; k++) {
          const a = rad(180 + 150 * k / 30);
          const r = k % 2 ? 1.28 : 1;
          pts.push([50 + 36 * r * Math.cos(a), 64 + 26 * r * Math.sin(a)]);
        }
        pts.push([94, 64]);
        // The belly from the head back to the tail.
        polar(50, 64, () => 1, 30, 170, 16, 36, 26).forEach((p) => pts.push(p));
        return pts;
      }, details: [circlePath(82, 62, 2), "M30 88V94", "M44 89V95", "M58 89V95", "M70 87V93"] },
      { id: "lighthouse", dots: () => subdivide([[22, 94], [78, 94], [78, 86], [64, 86], [59, 38], [67, 38], [67, 32], [60, 32], [60, 20], [50, 8], [40, 20], [40, 32], [33, 32], [33, 38], [41, 38], [36, 86], [22, 86]], 50),
        details: ["M40 54H60", "M38 70H62", "M46 22H54V30H46Z"] },
      { id: "bell", dots: () => {
        const side = [];
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          side.push([50 + 7 + 23 * Math.sqrt(t) + 8 * Math.pow(t, 4), 10 + 72 * t]);
        }
        const left = side.slice().reverse().map((p) => [100 - p[0], p[1]]);
        return subdivide(side.concat(left), 48);
      }, details: [circlePath(50, 86, 5), "M44 12Q50 2 56 12"] },
      { id: "leaftree", dots: () => {
        const crown = polar(50, 40, (a) => 31 + 4 * Math.cos(9 * a), 102, 438, 336).filter((p, i) => i % 8 === 0);
        return subdivide(crown.concat([[56, 82], [56, 94], [44, 94], [44, 82]]), 52);
      }, details: ["M50 94V76", "M50 80L58 72", "M50 84L42 76"] }
    ]
  };

  const cache = {};
  function dotsOf(level, id) {
    const key = level + ":" + id;
    if (!cache[key]) {
      const m = motif(level, id);
      cache[key] = m ? m.dots().map((p) => [round1(p[0]), round1(p[1])]) : [];
    }
    return cache[key];
  }

  function motif(level, id) {
    return (MOTIFS[level] || []).find((m) => m.id === id) || null;
  }

  function minSpacing(dots) {
    let best = Infinity;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) best = Math.min(best, Math.hypot(dots[i][0] - dots[j][0], dots[i][1] - dots[j][1]));
    }
    return best;
  }

  // Pixels per board unit at which the two closest dots are a tap target apart.
  function scaleFor(level, id) {
    return TAP_PX / minSpacing(dotsOf(level, id));
  }

  // Do the segments ab and cd cross (touching at an end does not count)?
  function crosses(a, b, c, d) {
    const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }

  // Number of crossings of the closed line (0 for every picture).
  function crossings(dots) {
    const n = dots.length;
    let count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        if (crosses(dots[i], dots[(i + 1) % n], dots[j], dots[(j + 1) % n])) count++;
      }
    }
    return count;
  }

  // Size of the number box of dot i (1-based numbers), in pixels.
  function labelBox(i, font) {
    return { w: String(i + 1).length * 0.62 * font + 4, h: font + 2 };
  }

  const DIRS = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];

  // Centre offset (pixels) of the number of a dot for direction d.
  function offsetFor(d, box, dot) {
    const [ux, uy] = DIRS[d];
    return [ux * (dot + 3 + box.w / 2), uy * (dot + 3 + box.h / 2)];
  }

  function boxHitsCircle(cx, cy, box, px, py, r) {
    const nx = Math.max(cx - box.w / 2, Math.min(px, cx + box.w / 2));
    const ny = Math.max(cy - box.h / 2, Math.min(py, cy + box.h / 2));
    return Math.hypot(nx - px, ny - py) < r;
  }

  function boxesOverlap(a, b) {
    return Math.abs(a.x - b.x) * 2 < a.w + b.w + 2 && Math.abs(a.y - b.y) * 2 < a.h + b.h + 2;
  }

  function boxHitsSegment(c, box, p, q) {
    // Sample the segment; good enough for a few pixels.
    for (let t = 0; t <= 1; t += 0.05) {
      const x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t;
      if (Math.abs(x - c.x) * 2 < box.w && Math.abs(y - c.y) * 2 < box.h) return true;
    }
    return false;
  }

  // For every dot the direction (0 to 7) of its number. Prefers places away
  // from the middle of the picture and off the line; never on another number
  // or dot at `scale` pixels per unit.
  const labelCache = {};
  function labels(level, id) {
    const key = level + ":" + id;
    if (labelCache[key]) return labelCache[key];
    const look = LOOK[level];
    labelCache[key] = placeAt(dotsOf(level, id), scaleFor(level, id), look.font, look.dot).dirs;
    return labelCache[key];
  }

  // The places of all numbers at s pixels per unit with the given number size
  // and dot radius; `bad` counts the numbers that found no free place. With
  // `bounds` ({ x, y, size } in board units) a number must also lie inside.
  function placeAt(dots, s, font, dot, bounds) {
    const B = bounds ? { x0: bounds.x * s, y0: bounds.y * s, x1: (bounds.x + bounds.size) * s, y1: (bounds.y + bounds.size) * s } : null;
    const outside = (c) => !!B && (c.x - c.w / 2 < B.x0 + 1 || c.x + c.w / 2 > B.x1 - 1 || c.y - c.h / 2 < B.y0 + 1 || c.y + c.h / 2 > B.y1 - 1);
    const look = { font: font, dot: dot };
    let bad = 0;
    const P = dots.map((p) => [p[0] * s, p[1] * s]);
    const cx = P.reduce((a, p) => a + p[0], 0) / P.length;
    const cy = P.reduce((a, p) => a + p[1], 0) / P.length;
    const placed = [];
    const dirs = [];
    const n = P.length;
    for (let i = 0; i < n; i++) {
      const box = labelBox(i, look.font);
      const out = [P[i][0] - cx, P[i][1] - cy];
      const order = DIRS.map((d, k) => k).sort((a, b) => (DIRS[b][0] * out[0] + DIRS[b][1] * out[1]) / Math.hypot(DIRS[b][0], DIRS[b][1]) - (DIRS[a][0] * out[0] + DIRS[a][1] * out[1]) / Math.hypot(DIRS[a][0], DIRS[a][1]));
      let chosen = -1;
      for (const strict of [true, false]) {
        for (const d of order) {
          const off = offsetFor(d, box, look.dot);
          const c = { x: P[i][0] + off[0], y: P[i][1] + off[1], w: box.w, h: box.h };
          if (outside(c)) continue;
          if (P.some((p) => boxHitsCircle(c.x, c.y, box, p[0], p[1], look.dot + 1))) continue;
          if (placed.some((b) => boxesOverlap(b, c))) continue;
          if (strict && P.some((p, j) => boxHitsSegment(c, box, p, P[(j + 1) % n]))) continue;
          chosen = d;
          placed.push(c);
          break;
        }
        if (chosen >= 0) break;
      }
      if (chosen < 0) { bad++; chosen = order[0]; const off = offsetFor(chosen, box, look.dot); placed.push({ x: P[i][0] + off[0], y: P[i][1] + off[1], w: box.w, h: box.h }); }
      dirs.push(chosen);
    }
    return { dirs: dirs, bad: bad };
  }

  // Smallest and largest coordinates of the dots: [x0, y0, x1, y1].
  function bbox(level, id) {
    const d = dotsOf(level, id);
    const xs = d.map((p) => p[0]), ys = d.map((p) => p[1]);
    return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
  }

  // The whole picture on a square board of px pixels: { x, y, size } in board
  // units and the scale (pixels per unit). Easy as before (the board -4..104);
  // from medium on fitted to the picture with MARGIN_PX round it (task 169).
  function wholeView(level, id, px) {
    if (level === "easy") return { x: -4, y: -4, size: 108, scale: px / 108 };
    const b = bbox(level, id);
    const span = Math.max(b[2] - b[0], b[3] - b[1]);
    const scale = Math.max(0.5, (px - 2 * MARGIN_PX)) / span;
    const size = px / scale;
    return { x: (b[0] + b[2]) / 2 - size / 2, y: (b[1] + b[3]) / 2 - size / 2, size: size, scale: scale };
  }

  // Pixels per unit of "Magnify": the closest dots MAG_PX apart.
  function magnifyScale(level, id) {
    return MAG_PX / minSpacing(dotsOf(level, id));
  }

  // Numbers at `scale` pixels per unit: the largest size from the level's
  // own (LOOK) down to MIN_FONT at which every number has a free place (with
  // `bounds`, the whole picture: inside the board too), the dot radius with
  // it, and the places. Easy keeps LOOK and labels().
  const layoutCache = {};
  function layout(level, id, scale, bounds) {
    const look = LOOK[level];
    if (level === "easy") return { font: look.font, dot: look.dot, dirs: labels(level, id), bad: 0 };
    const key = level + ":" + id + ":" + Math.round(scale * 50) + (bounds ? ":" + Math.round(bounds.x * 10) + "," + Math.round(bounds.y * 10) + "," + Math.round(bounds.size * 10) : "");
    if (layoutCache[key]) return layoutCache[key];
    const dots = dotsOf(level, id);
    let best = null;
    for (let font = look.font; font >= MIN_FONT; font--) {
      const dot = Math.min(look.dot, Math.max(3, Math.round(font * 0.36 * 10) / 10));
      const r = placeAt(dots, scale, font, dot, bounds);
      best = { font: font, dot: dot, dirs: r.dirs, bad: r.bad };
      if (!r.bad) break;
    }
    layoutCache[key] = best;
    return best;
  }

  // ---- Game ----
  function newGame(level, id) {
    const lv = LEVELS.indexOf(level) >= 0 ? level : "easy";
    const m = motif(lv, id) || MOTIFS[lv][0];
    return { game: "zahlenbild", rules: 1, level: lv, motif: m.id, done: 0, misses: 0, solved: false };
  }

  function valid(s) {
    return !!s && s.game === "zahlenbild" && s.rules === 1 && !!motif(s.level, s.motif) &&
      Number.isInteger(s.done) && s.done >= 0 && s.done <= dotsOf(s.level, s.motif).length;
  }

  // Tap on dot i (0-based). Only the next dot counts.
  function tap(s, i) {
    if (s.solved) return { state: s, ok: false, reason: "solved" };
    if (i !== s.done) return { state: Object.assign({}, s, { misses: s.misses + 1 }), ok: false, reason: "wrong" };
    const n = dotsOf(s.level, s.motif).length;
    const t = Object.assign({}, s, { done: s.done + 1 });
    t.solved = t.done === n;
    return { state: t, ok: true };
  }

  function undo(s) {
    if (s.done <= 0) return s;
    return Object.assign({}, s, { done: s.done - 1, solved: false });
  }

  // The next picture of a level after `id` (in a circle).
  function nextMotif(level, id) {
    const list = MOTIFS[level] || MOTIFS.easy;
    const at = list.findIndex((m) => m.id === id);
    return list[(at + 1) % list.length].id;
  }

  // The dot a tap at (x, y) board units means, with `reach` units of room
  // (task 169): the dot being looked for (`next`) when it is one of the two
  // dots closest to the tap within reach, else the closest dot within reach,
  // else -1.
  function dotAt(level, id, x, y, reach, next) {
    const dots = dotsOf(level, id);
    const near = dots.map((p, i) => [Math.hypot(p[0] - x, p[1] - y), i]).filter((e) => e[0] <= reach).sort((a, b) => a[0] - b[0]);
    if (!near.length) return -1;
    if (near.slice(0, 2).some((e) => e[1] === next)) return next;
    return near[0][1];
  }

  return { LEVELS, LOOK, TAP_PX, MAG_PX, MARGIN_PX, MIN_FONT, MOTIFS, DIRS, motif, dotsOf, minSpacing, scaleFor, crossings, labels, labelBox, offsetFor, placeAt, bbox, wholeView, magnifyScale, layout, dotAt, newGame, valid, tap, undo, nextMotif };
})();

if (typeof module !== "undefined") module.exports = ZahlenbildCore;
if (typeof window !== "undefined") window.ZahlenbildCore = ZahlenbildCore;
