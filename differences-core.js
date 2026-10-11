// differences-core.js
// "Spot the Difference" - two pictures, built from simple drawings,
// that differ in 3, 5 or 7 places. Dependency-free, no DOM; the pictures
// are returned as SVG markup.
//
// A picture is 300 x 180 units, split into 5 x 3 areas of 60 x 60. Each
// item (house, tree, sun, cat, ...) stands in an area of its own, so no
// two differences can be at the same place, and a tap anywhere in an area
// counts for the item there. A puzzle:
//   items        [{ area, type, pattern, mirror, dx, dy }] - picture A
//   diffs        [{ area, kind }] - kind "missing" | "pattern" | "mirror"
//                | "moved"; picture B is picture A with these changes
//   level        "easy" | "medium" | "hard"
// Every drawing is black on white: patterns are solid black, white,
// stripes or dots - never shades of grey - so a difference stays easy to
// see on e-ink.

const DifferencesCore = (function () {
  const W = 300, H = 180, COLS = 5, ROWS = 3, AREA = 60;
  const LEVELS = { easy: { diffs: 3, items: 9 }, medium: { diffs: 5, items: 11 }, hard: { diffs: 7, items: 13 } };
  const KINDS = ["missing", "pattern", "mirror", "moved"];
  const PATTERNS = ["white", "solid", "stripes", "dots"];
  const S = 'stroke="#141413" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';

  // Every drawing is made for a 40 x 40 box centred on (0, 0). `fill` is
  // the pattern fill of its main part; `asym` marks drawings that look
  // different mirrored (only those can be mirrored).
  const TYPES = {
    house: { asym: true, draw: (f) => '<path d="M-16 0L0-15L16 0Z" fill="' + f + '" ' + S + '/><rect x="-13" y="0" width="26" height="17" fill="#fff" ' + S + '/><rect x="-9" y="5" width="7" height="12" fill="#fff" ' + S + '/><rect x="3" y="4" width="7" height="6" fill="#fff" ' + S + '/><rect x="8" y="-14" width="4" height="8" fill="#fff" ' + S + '/>' },
    tree: { asym: false, draw: (f) => '<rect x="-3" y="6" width="6" height="13" fill="#fff" ' + S + '/><circle cx="0" cy="-5" r="13" fill="' + f + '" ' + S + '/>' },
    sun: { asym: false, draw: (f) => '<circle r="8" fill="' + f + '" ' + S + '/><path d="M0-17V-12M0 12V17M-17 0H-12M12 0H17M-12-12L-9-9M12 12L9 9M12-12L9-9M-12 12L-9 9" fill="none" ' + S + '/>' },
    cat: { asym: true, draw: (f) => '<ellipse cx="-2" cy="7" rx="12" ry="8" fill="' + f + '" ' + S + '/><circle cx="9" cy="-6" r="7" fill="' + f + '" ' + S + '/><path d="M4-11L5-17L8-12M10-12L13-17L14-10" fill="#fff" ' + S + '/><path d="M-14 6C-20 2-19-6-15-8" fill="none" ' + S + '/>' },
    car: { asym: true, draw: (f) => '<path d="M-18 6V-1H-9L-5-9H8L13-1H18V6Z" fill="' + f + '" ' + S + '/><circle cx="-10" cy="8" r="4.5" fill="#fff" ' + S + '/><circle cx="10" cy="8" r="4.5" fill="#fff" ' + S + '/>' },
    flower: { asym: false, draw: (f) => '<path d="M0 3V19M0 12L6 8" fill="none" ' + S + '/><circle cx="0" cy="-12" r="5" fill="' + f + '" ' + S + '/><circle cx="-7" cy="-5" r="5" fill="' + f + '" ' + S + '/><circle cx="7" cy="-5" r="5" fill="' + f + '" ' + S + '/><circle cx="0" cy="1" r="5" fill="' + f + '" ' + S + '/><circle cx="0" cy="-5" r="3.5" fill="#fff" ' + S + '/>' },
    balloon: { asym: false, draw: (f) => '<ellipse cx="0" cy="-6" rx="10" ry="12" fill="' + f + '" ' + S + '/><path d="M0 6C-3 11 3 14 0 19" fill="none" ' + S + '/>' },
    bird: { asym: true, draw: (f) => '<ellipse cx="-2" cy="2" rx="11" ry="7" fill="' + f + '" ' + S + '/><circle cx="9" cy="-4" r="5" fill="' + f + '" ' + S + '/><path d="M14-4L19-2L14 0Z" fill="#141413" ' + S + '/><path d="M-12 0L-18-4L-16 4Z" fill="#fff" ' + S + '/>' },
    mushroom: { asym: false, draw: (f) => '<path d="M-15 0C-15-14 15-14 15 0Z" fill="' + f + '" ' + S + '/><rect x="-5" y="0" width="10" height="13" rx="3" fill="#fff" ' + S + '/>' },
    fish: { asym: true, draw: (f) => '<path d="M-14 0C-9-9 7-9 12 0C7 9-9 9-14 0Z" fill="' + f + '" ' + S + '/><path d="M12 0L19-6V6Z" fill="#fff" ' + S + '/><circle cx="-7" cy="-2" r="1.8" fill="#141413"/>' },
    kite: { asym: true, draw: (f) => '<path d="M0-17L11-3L0 9L-11-3Z" fill="' + f + '" ' + S + '/><path d="M0 9C5 13 -2 16 4 19" fill="none" ' + S + '/>' },
    star: { asym: false, draw: (f) => '<path d="M0-15L4.4-5.5L14.3-4.6L6.8 2.1L8.9 12L0 6.8L-8.9 12L-6.8 2.1L-14.3-4.6L-4.4-5.5Z" fill="' + f + '" ' + S + '/>' }
  };
  const TYPE_NAMES = Object.keys(TYPES);

  function shuffle(arr, random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function areaCentre(area) {
    return [(area % COLS) * AREA + AREA / 2, Math.floor(area / COLS) * AREA + AREA / 2];
  }

  // The area a point of the picture (0..300, 0..180) falls in, or -1.
  function areaAt(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return -1;
    return Math.floor(y / AREA) * COLS + Math.floor(x / AREA);
  }

  // The item list of picture B.
  function pictureB(p) {
    const out = [];
    p.items.forEach((it) => {
      const d = p.diffs.find((x) => x.area === it.area);
      if (!d) { out.push(it); return; }
      if (d.kind === "missing") return;
      const b = Object.assign({}, it);
      if (d.kind === "pattern") b.pattern = d.pattern;
      else if (d.kind === "mirror") b.mirror = !it.mirror;
      else if (d.kind === "moved") { b.dx = d.dx; b.dy = d.dy; }
      out.push(b);
    });
    return out;
  }

  function generatePuzzle(level, rng) {
    const random = rng || Math.random;
    const lv = LEVELS[level] ? level : "easy";
    const cfg = LEVELS[lv];
    const areas = shuffle([...Array(COLS * ROWS).keys()], random).slice(0, cfg.items).sort((a, b) => a - b);
    const types = shuffle(TYPE_NAMES, random);
    const items = areas.map((area, i) => ({
      area,
      type: types[i % types.length],
      pattern: PATTERNS[Math.floor(random() * PATTERNS.length)],
      mirror: random() < 0.5,
      dx: Math.round((random() - 0.5) * 4),
      dy: Math.round((random() - 0.5) * 4)
    }));
    const diffAreas = shuffle(areas, random).slice(0, cfg.diffs);
    // Use every kind before repeating one.
    let kinds = shuffle(KINDS, random);
    const diffs = diffAreas.map((area) => {
      const it = items.find((x) => x.area === area);
      if (!kinds.length) kinds = shuffle(KINDS, random);
      let kind = kinds.shift();
      if (kind === "mirror" && !TYPES[it.type].asym) kind = "pattern";
      const d = { area, kind };
      if (kind === "pattern") {
        // Light (white, dots) against dark (solid, stripes), so the
        // change is plain to see.
        const light = it.pattern === "white" || it.pattern === "dots";
        const others = light ? ["solid", "stripes"] : ["white", "dots"];
        d.pattern = others[Math.floor(random() * others.length)];
      } else if (kind === "moved") {
        // A clear step sideways or up/down, staying inside the area.
        const step = 10;
        if (random() < 0.5) { d.dx = it.dx > 0 ? it.dx - step : it.dx + step; d.dy = it.dy; }
        else { d.dy = it.dy > 0 ? it.dy - step : it.dy + step; d.dx = it.dx; }
      }
      return d;
    });
    return { items, diffs: diffs.sort((a, b) => a.area - b.area), level: lv };
  }

  // The pattern fills (ids made unique per picture with `prefix`).
  function defs(prefix) {
    return '<defs><pattern id="' + prefix + 'st" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="5" height="5" fill="#fff"/><path d="M0 0V5" stroke="#141413" stroke-width="2.4"/></pattern>' +
      '<pattern id="' + prefix + 'dt" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/>' +
      '<circle cx="3" cy="3" r="1.6" fill="#141413"/></pattern></defs>';
  }

  function fillOf(pattern, prefix) {
    if (pattern === "solid") return "#141413";
    if (pattern === "stripes") return "url(#" + prefix + "st)";
    if (pattern === "dots") return "url(#" + prefix + "dt)";
    return "#fff";
  }

  // One item as SVG.
  function itemSvg(it, prefix) {
    const c = areaCentre(it.area);
    // Drawn at 0.95 so a moved item still stays inside its area.
    const tr = "translate(" + (c[0] + (it.dx || 0)) + " " + (c[1] + (it.dy || 0)) + ") scale(" + (it.mirror ? "-0.95" : "0.95") + " 0.95)";
    return '<g transform="' + tr + '">' + TYPES[it.type].draw(fillOf(it.pattern, prefix)) + "</g>";
  }

  // A whole picture ("a" or "b") as SVG markup, with a frame and a ground
  // line, but without marks.
  function pictureSvg(p, which, prefix) {
    const items = which === "b" ? pictureB(p) : p.items;
    return defs(prefix) + '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" fill="#fff" stroke="#141413" stroke-width="2"/>' +
      items.map((it) => itemSvg(it, prefix)).join("");
  }

  return { W, H, COLS, ROWS, AREA, LEVELS, KINDS, PATTERNS, TYPES, TYPE_NAMES, areaAt, areaCentre, pictureB, generatePuzzle, itemSvg, pictureSvg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DifferencesCore;
}
if (typeof window !== "undefined") {
  window.DifferencesCore = DifferencesCore;
}
