// kidspics.js
// Twenty simple drawings for the children's picture games ("Find the
// Shadow", "Which One Is Different?"). Dependency-free, no DOM; every
// drawing is returned as SVG markup. All drawn here for PaperGames.
//
// A drawing is made for a 60 x 60 box. `body` is drawn in both modes:
//   "line"    the picture - white parts with a black outline, `detail`
//             (eyes, windows, dots) on top;
//   "shadow"  the silhouette - every part solid black, no detail.
// In the body, {F} stands for the fill colour of a part (white or black);
// lines without a fill (stems, legs) look the same in both modes.
// A shadow can also be shown turned: "mirror" (left <-> right), "flip"
// (upside down) or "rot" (a quarter turn); mirror only for drawings that
// look different mirrored (asymX), flip and rot for all of them.
//
// The drawings are in four groups of five (CATEGORIES): animals,
// vehicles, plants, things at home.

const KidsPics = (function () {
  const K = "#141413";
  const P = 'fill="{F}" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const LN = 'fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const DOT = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + K + '"/>';
  const W = 'fill="#fff" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  const DL = 'fill="none" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

  const OBJECTS = {
    fish: { cat: "animals", asymX: true,
      body: '<path d="M40 30L56 16V44Z" ' + P + '/><ellipse cx="26" cy="30" rx="19" ry="12" ' + P + '/><path d="M16 20Q24 6 34 19Z" ' + P + '/>',
      detail: DOT(14, 27, 2.4) + '<path d="M33 22Q37 30 33 38" ' + DL + '/>' },
    bird: { cat: "animals", asymX: true,
      body: '<path d="M14 28L2 20L5 36Z" ' + P + '/><ellipse cx="28" cy="33" rx="17" ry="12" ' + P + '/><circle cx="42" cy="20" r="9" ' + P + '/><path d="M50 18L58 22L50 25Z" ' + P + '/><path d="M26 45L24 55M32 45L34 55M20 55H28M30 55H38" ' + LN + '/>',
      detail: DOT(44, 18, 2.2) + '<path d="M20 30Q28 38 36 28" ' + DL + '/>' },
    cat: { cat: "animals", asymX: true,
      body: '<path d="M40 50C58 52 58 34 50 30" fill="none" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/><ellipse cx="29" cy="42" rx="14" ry="14" ' + P + '/><circle cx="29" cy="20" r="11" ' + P + '/><path d="M19 16L20 3L29 11ZM39 16L38 3L29 11Z" ' + P + '/>',
      detail: DOT(25, 19, 2) + DOT(33, 19, 2) + '<path d="M27 25H31M29 22V25M20 24L14 23M20 27L14 29M38 24L44 23M38 27L44 29" ' + DL + '/>' },
    snail: { cat: "animals", asymX: true,
      body: '<rect x="4" y="40" width="46" height="11" rx="5.5" ' + P + '/><circle cx="52" cy="35" r="6" ' + P + '/><path d="M51 30L48 17M55 31L58 19" ' + LN + '/><circle cx="26" cy="29" r="15" ' + P + '/>',
      detail: DOT(48, 17, 2.4) + DOT(58, 19, 2.4) + '<path d="M26 29m0 0a3 3 0 1 1 4 3a8 8 0 1 1-9-8" ' + DL + '/>' },
    turtle: { cat: "animals", asymX: true,
      body: '<path d="M2 42L8 38L10 46Z" ' + P + '/><rect x="12" y="40" width="11" height="12" rx="4" ' + P + '/><rect x="36" y="40" width="11" height="12" rx="4" ' + P + '/><circle cx="53" cy="33" r="6.5" ' + P + '/><path d="M6 42Q6 14 30 14Q54 14 54 42Z" ' + P + '/>',
      detail: DOT(55, 31, 2) + '<path d="M18 42Q20 26 30 24M30 24Q40 26 42 42M30 24V42" ' + DL + '/>' },
    car: { cat: "vehicles", asymX: true,
      body: '<path d="M3 42V34Q3 30 8 29L17 28L24 16H43L51 28L55 29Q58 31 58 35V42Z" ' + P + '/><circle cx="16" cy="43" r="8" ' + P + '/><circle cx="46" cy="43" r="8" ' + P + '/>',
      detail: '<path d="M22 28L27 19H34V28ZM37 28V19H41L47 28Z" ' + W + '/>' + DOT(16, 43, 2.5) + DOT(46, 43, 2.5) },
    boat: { cat: "vehicles", asymX: true,
      body: '<path d="M30 6V44" ' + LN + '/><path d="M33 9V40L54 40Z" ' + P + '/><path d="M27 17V40L12 40Z" ' + P + '/><path d="M4 44H56L47 56H13Z" ' + P + '/>',
      detail: '<path d="M12 49H46" ' + DL + '/>' },
    rocket: { cat: "vehicles", asymX: false,
      body: '<path d="M24 46L30 58L36 46Z" ' + P + '/><path d="M19 32L8 48L19 44ZM41 32L52 48L41 44Z" ' + P + '/><path d="M30 3Q43 14 43 38H17Q17 14 30 3Z" ' + P + '/><rect x="23" y="38" width="14" height="7" rx="2" ' + P + '/>',
      detail: '<circle cx="30" cy="22" r="5" ' + W + '/>' },
    plane: { cat: "vehicles", asymX: true,
      body: '<path d="M10 30L3 12H14L22 30Z" ' + P + '/><path d="M22 34L12 53H24L38 34Z" ' + P + '/><ellipse cx="30" cy="31" rx="27" ry="7.5" ' + P + '/>',
      detail: '<path d="M44 28H52M36 28H40" ' + DL + '/>' },
    bike: { cat: "vehicles", asymX: true,
      body: '<circle cx="13" cy="41" r="11" ' + LN + '/><circle cx="47" cy="41" r="11" ' + LN + '/><path d="M13 41L26 41L36 20L47 41M26 41L22 22M36 20L42 14H50M18 21H27" ' + LN + '/>',
      detail: DOT(13, 41, 2.6) + DOT(47, 41, 2.6) + '<path d="M13 41L7 33M13 41L19 49M47 41L41 33M47 41L53 49" ' + DL + '/>' },
    tree: { cat: "plants", asymX: true,
      body: '<rect x="25" y="34" width="10" height="22" ' + P + '/><circle cx="20" cy="28" r="13" ' + P + '/><circle cx="39" cy="24" r="15" ' + P + '/><circle cx="29" cy="14" r="12" ' + P + '/>',
      detail: '' },
    flower: { cat: "plants", asymX: true,
      body: '<path d="M30 24V58" ' + LN + '/><path d="M30 46Q44 42 48 32Q36 34 30 46Z" ' + P + '/><circle cx="30" cy="7" r="6.5" ' + P + '/><circle cx="40" cy="14" r="6.5" ' + P + '/><circle cx="37" cy="25" r="6.5" ' + P + '/><circle cx="23" cy="25" r="6.5" ' + P + '/><circle cx="20" cy="14" r="6.5" ' + P + '/><circle cx="30" cy="17" r="6" ' + P + '/>',
      detail: DOT(30, 17, 2.6) },
    mushroom: { cat: "plants", asymX: false,
      body: '<rect x="21" y="28" width="18" height="26" rx="7" ' + P + '/><path d="M3 32Q3 6 30 6Q57 6 57 32Z" ' + P + '/>',
      detail: '<circle cx="18" cy="22" r="3.2" ' + W + '/><circle cx="32" cy="15" r="3.2" ' + W + '/><circle cx="43" cy="25" r="3.2" ' + W + '/>' },
    leaf: { cat: "plants", asymX: true,
      body: '<path d="M10 50Q4 12 54 6Q56 46 10 50Z" ' + P + '/><path d="M10 50L2 58" ' + LN + '/>',
      detail: '<path d="M10 50Q26 32 46 14M24 36L24 24M32 28L44 28M18 42L12 34" ' + DL + '/>' },
    apple: { cat: "plants", asymX: true,
      body: '<path d="M30 16Q40 8 50 18Q58 28 52 42Q46 56 36 54Q30 52 24 54Q14 56 8 42Q2 28 10 18Q20 8 30 16Z" ' + P + '/><path d="M30 16Q30 9 34 3" ' + LN + '/><path d="M34 10Q42 0 52 6Q44 14 34 10Z" ' + P + '/>',
      detail: '<path d="M14 26Q16 20 21 19" ' + DL + '/>' },
    house: { cat: "home", asymX: true,
      body: '<rect x="38" y="8" width="9" height="16" ' + P + '/><rect x="9" y="28" width="42" height="27" ' + P + '/><path d="M3 30L30 6L57 30Z" ' + P + '/>',
      detail: '<rect x="14" y="38" width="10" height="17" ' + W + '/><rect x="32" y="36" width="11" height="10" ' + W + '/>' },
    cup: { cat: "home", asymX: true,
      body: '<path d="M43 22H48Q57 22 57 31Q57 40 46 42" ' + LN + '/><path d="M8 16H44V36Q44 52 26 52Q8 52 8 36Z" ' + P + '/><rect x="6" y="52" width="40" height="5" rx="2.5" ' + P + '/>',
      detail: '<path d="M14 24H38" ' + DL + '/>' },
    key: { cat: "home", asymX: true,
      body: '<path d="M24 30H56" stroke="' + K + '" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M45 33V42M54 33V39" stroke="' + K + '" stroke-width="6" fill="none"/><circle cx="14" cy="30" r="11" ' + P + '/>',
      detail: '<circle cx="12" cy="30" r="4.5" ' + W + '/>' },
    umbrella: { cat: "home", asymX: true,
      body: '<path d="M30 30V50Q30 57 23 57Q18 57 18 52" ' + LN + '/><path d="M3 30Q3 5 30 5Q57 5 57 30Q48 23 41 30Q35 23 30 30Q25 23 19 30Q12 23 3 30Z" ' + P + '/>',
      detail: '<path d="M30 6V28M20 8Q14 18 19 28M40 8Q46 18 41 28" ' + DL + '/>' },
    chair: { cat: "home", asymX: true,
      body: '<rect x="10" y="4" width="7" height="30" rx="2" ' + P + '/><rect x="10" y="30" width="38" height="7" rx="2" ' + P + '/><rect x="10" y="37" width="6" height="19" ' + P + '/><rect x="42" y="37" width="6" height="19" ' + P + '/>',
      detail: '' }
  };

  const IDS = Object.keys(OBJECTS);
  const CATEGORIES = {};
  IDS.forEach((id) => { (CATEGORIES[OBJECTS[id].cat] = CATEGORIES[OBJECTS[id].cat] || []).push(id); });
  const CATEGORY_NAMES = Object.keys(CATEGORIES);
  const TRANSFORMS = ["none", "mirror", "flip", "rot"];
  const TRANSFORM_ATTR = {
    none: "",
    mirror: ' transform="translate(60 0) scale(-1 1)"',
    flip: ' transform="translate(0 60) scale(1 -1)"',
    rot: ' transform="rotate(90 30 30)"'
  };

  // Can this drawing be shown in that turn so that it looks different?
  function canTransform(id, tr) {
    const o = OBJECTS[id];
    if (!o || TRANSFORMS.indexOf(tr) === -1) return false;
    return tr !== "mirror" || o.asymX;
  }

  function inner(id, mode, tr) {
    const o = OBJECTS[id];
    const fill = mode === "shadow" ? K : "#fff";
    let s = o.body.split("{F}").join(fill);
    if (mode !== "shadow") s += o.detail;
    return "<g" + (TRANSFORM_ATTR[tr || "none"] || "") + ">" + s + "</g>";
  }

  // The finished <svg>: viewBox 0 0 60 60, as large as `size` pixels.
  function svg(id, mode, tr, size) {
    const n = size || 60;
    return '<svg viewBox="0 0 60 60" width="' + n + '" height="' + n + '" aria-hidden="true" focusable="false">' + inner(id, mode, tr) + "</svg>";
  }

  return { OBJECTS, IDS, CATEGORIES, CATEGORY_NAMES, TRANSFORMS, canTransform, inner, svg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KidsPics;
}
if (typeof window !== "undefined") {
  window.KidsPics = KidsPics;
}
