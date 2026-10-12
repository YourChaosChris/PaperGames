// cardduel-art.js
// Pictures for "Card Duel" (cardduel-app.js): one small ink drawing per
// card, a portrait per mage and a patterned frame per element, all as SVG
// built from shared pieces - hatching and frame patterns are defined once
// (CardDuelArt.defs(), put into the page a single time) and every picture
// refers to them. Black and white only; the frames tell the decks apart
// without colour: leaves (forest), flames (fire), waves (water), stone
// joints (stone).
//
// CardDuelArt.picture(id)  the card's drawing (viewBox 100 x 70)
// CardDuelArt.portrait(el) the mage of a deck (viewBox 60 x 60)
// CardDuelArt.ids()        every card id that has a picture

const CardDuelArt = (function () {
  const K = "#141413";
  // --- shared patterns -------------------------------------------------
  function defs() {
    return '<svg class="cda-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">' +
      "<defs>" +
      '<pattern id="cda-h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="' + K + '" stroke-width="0.9"/></pattern>' +
      '<pattern id="cda-x" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V3.4M0 0H3.4" stroke="' + K + '" stroke-width="0.8"/></pattern>' +
      '<pattern id="cda-d" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.6" fill="' + K + '"/></pattern>' +
      '<pattern id="cda-v" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="2.6" stroke="' + K + '" stroke-width="0.8"/></pattern>' +
      // Frames: one tile of the border pattern each.
      '<pattern id="cda-fr-forest" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><path d="M0.8 5.2Q0.8 1 5.2 0.8Q5.2 5.2 0.8 5.2Z" fill="' + K + '"/><path d="M1 5L4.5 1.5" stroke="#fff" stroke-width="0.5"/></pattern>' +
      '<pattern id="cda-fr-fire" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><path d="M3 0.3C4.8 2.4 5.6 3.8 4.8 5.2A2 2 0 0 1 1.2 5.2C0.4 3.8 1.2 2.4 3 0.3Z" fill="' + K + '"/><path d="M3 3C3.6 3.8 3.8 4.4 3.4 5A0.6 0.6 0 0 1 2.6 5C2.2 4.4 2.4 3.8 3 3Z" fill="#fff"/></pattern>' +
      '<pattern id="cda-fr-water" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><path d="M0 2.2Q1.5 0.4 3 2.2T6 2.2M0 5Q1.5 3.2 3 5T6 5" fill="none" stroke="' + K + '" stroke-width="1"/></pattern>' +
      '<pattern id="cda-fr-stone" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="' + K + '"/><rect x="0.5" y="0.5" width="5" height="2" fill="#fff"/><rect x="-2.5" y="3.5" width="5" height="2" fill="#fff"/><rect x="3.5" y="3.5" width="5" height="2" fill="#fff"/></pattern>' +
      "</defs></svg>";
  }

  // --- small helpers ------------------------------------------------------
  const P = (d, f, w) => '<path d="' + d + '" fill="' + (f || "#fff") + '" stroke="' + K + '" stroke-width="' + (w || 1.6) + '" stroke-linejoin="round" stroke-linecap="round"/>';
  const L = (d, w) => '<path d="' + d + '" fill="none" stroke="' + K + '" stroke-width="' + (w || 1.6) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  const C = (x, y, r, f, w) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (f || "#fff") + '" stroke="' + K + '" stroke-width="' + (w === undefined ? 1.6 : w) + '"/>';
  const E = (x, y, rx, ry, f, w) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + (f || "#fff") + '" stroke="' + K + '" stroke-width="' + (w === undefined ? 1.6 : w) + '"/>';
  const dot = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 1.2) + '" fill="' + K + '"/>';
  const H = "url(#cda-h)", X = "url(#cda-x)", D = "url(#cda-d)", V = "url(#cda-v)";
  const eyes = (x1, x2, y, r) => dot(x1, y, r) + dot(x2, y, r);
  // Ground strokes under a figure.
  const ground = (y) => L("M8 " + y + "H92", 1.2) + L("M16 " + (y + 3) + "H30M44 " + (y + 3) + "H60M72 " + (y + 3) + "H86", 0.9);
  const star = (x, y, r) => P("M" + x + " " + (y - r) + "L" + (x + r * 0.3) + " " + (y - r * 0.3) + "L" + (x + r) + " " + y + "L" + (x + r * 0.3) + " " + (y + r * 0.3) + "L" + x + " " + (y + r) + "L" + (x - r * 0.3) + " " + (y + r * 0.3) + "L" + (x - r) + " " + y + "L" + (x - r * 0.3) + " " + (y - r * 0.3) + "Z", K, 0.6);
  const flame = (x, y, s, f) => P("M" + x + " " + (y - 10 * s) + "C" + (x + 5 * s) + " " + (y - 4 * s) + " " + (x + 6 * s) + " " + y + " " + x + " " + (y + 3 * s) + "C" + (x - 6 * s) + " " + y + " " + (x - 5 * s) + " " + (y - 4 * s) + " " + x + " " + (y - 10 * s) + "Z", f || "#fff", 1.3);
  const leaf = (x, y, s, rot) => '<g transform="translate(' + x + " " + y + ") rotate(" + (rot || 0) + ") scale(" + s + ')">' + P("M0 0Q6 -6 12 0Q6 6 0 0Z", H, 1.2) + L("M0 0H11", 0.8) + "</g>";
  const drop = (x, y, s, f) => P("M" + x + " " + (y - 6 * s) + "C" + (x + 4 * s) + " " + (y - 1 * s) + " " + (x + 4 * s) + " " + (y + 3 * s) + " " + x + " " + (y + 3 * s) + "C" + (x - 4 * s) + " " + (y + 3 * s) + " " + (x - 4 * s) + " " + (y - 1 * s) + " " + x + " " + (y - 6 * s) + "Z", f || "#fff", 1.2);
  const wave = (y, x0, x1, a) => { let d = "M" + x0 + " " + y; for (let x = x0; x < x1; x += 12) d += "Q" + (x + 3) + " " + (y - a) + " " + (x + 6) + " " + y + "T" + (x + 12) + " " + y; return L(d, 1.4); };
  const sparks = (pts) => pts.map((p) => star(p[0], p[1], p[2] || 2.5)).join("");
  const rock = (x, y, w, h, f) => P("M" + x + " " + (y + h * 0.3) + "L" + (x + w * 0.25) + " " + y + "H" + (x + w * 0.75) + "L" + (x + w) + " " + (y + h * 0.35) + "L" + (x + w * 0.85) + " " + (y + h) + "H" + (x + w * 0.12) + "Z", f || "#fff", 1.5);
  const crystal = (x, y, s) => P("M" + x + " " + (y - 8 * s) + "L" + (x + 3 * s) + " " + (y - 3 * s) + "L" + (x + 2 * s) + " " + (y + 4 * s) + "H" + (x - 2 * s) + "L" + (x - 3 * s) + " " + (y - 3 * s) + "Z", "#fff", 1.2) + L("M" + x + " " + (y - 8 * s) + "V" + (y + 4 * s), 0.7);
  const legs4 = (x, y, w, h) => L("M" + x + " " + y + "V" + (y + h) + "M" + (x + w * 0.3) + " " + y + "V" + (y + h) + "M" + (x + w * 0.7) + " " + y + "V" + (y + h) + "M" + (x + w) + " " + y + "V" + (y + h), 2);

  // --- the drawings -----------------------------------------------------------
  const ART = {
    // Forest
    forest_mosskin: () => ground(62) + P("M38 62Q36 42 50 40Q64 42 62 62Z") + P("M38 44L50 14L62 44Z", H) + E(50, 44, 13, 3, "#fff", 1.4) + P("M43 50Q50 60 57 50Q54 58 50 59Q46 58 43 50Z", D, 1.1) + eyes(46, 54, 48) + leaf(56, 24, 0.7, -30) + leaf(30, 58, 0.8, -150) + leaf(66, 60, 0.7, -20),
    forest_shroomrunner: () => ground(62) + P("M30 34Q50 6 70 34Z", H) + C(42, 24, 2.5) + C(57, 22, 3) + C(50, 29, 2) + P("M42 34H58V48Q50 52 42 48Z") + eyes(47, 53, 41) + L("M45 48L38 60M55 48L64 58M64 58L70 56M38 60L32 61", 2) + L("M18 40H30M14 46H28M20 52H32", 1),
    forest_barkbeetle: () => ground(62) + E(52, 44, 24, 14, X) + L("M52 30V58", 1.2) + C(26, 44, 6) + dot(24, 42, 1.3) + L("M22 39L16 32M22 49L15 54", 1.2) + L("M36 56L30 62M48 58L46 63M60 58L62 63M70 54L78 60M36 32L30 26M68 33L76 27", 1.6),
    forest_foxspirit: () => '<g stroke-dasharray="2.5 2">' + P("M24 50Q30 34 48 36Q62 36 66 46Q64 56 48 56Q32 56 24 50Z", "#fff", 1.5) + "</g>" + P("M62 44Q78 22 92 30Q84 34 86 44Q76 40 66 50Z", H, 1.4) + P("M22 50L14 40L26 42L30 34L34 44Z", "#fff", 1.4) + dot(22, 46, 1.3) + dot(13, 41, 1) + L("M32 56L30 64M44 56L44 64M56 56L58 64", 1.6) + sparks([[40, 20, 2], [56, 16, 2.5], [72, 14, 1.8]]),
    forest_seedcall: () => ground(58) + L("M30 58Q30 44 36 36", 1.8) + leaf(36, 36, 0.9, -60) + leaf(30, 46, 0.7, 200) + L("M66 58Q64 40 70 30", 1.8) + leaf(70, 30, 1, -70) + leaf(64, 44, 0.8, 190) + dot(48, 22, 1.6) + dot(54, 14, 1.4) + dot(44, 12, 1.2) + L("M50 64Q50 52 50 46", 1) + L("M14 30Q24 24 26 34M86 26Q78 20 74 30", 1),
    forest_growth: () => ground(62) + L("M50 62Q46 44 52 30Q56 22 50 14", 2) + leaf(51, 30, 1.2, -40) + leaf(48, 44, 1.1, 210) + leaf(50, 14, 0.8, -90) + L("M24 50V26M20 30L24 24L28 30M76 50V26M72 30L76 24L80 30", 1.6),
    forest_mossbear: () => ground(63) + P("M18 58Q16 30 44 26Q70 24 82 40Q88 52 84 60H70Q68 52 62 52Q56 60 44 60Q30 62 18 58Z", H) + C(28, 32, 11) + C(22, 22, 4) + C(34, 21, 4) + eyes(25, 32, 31) + E(28, 37, 4, 2.6, K, 0.5) + P("M44 26Q48 18 54 24Q58 16 62 25", D, 1.1) + L("M46 60V64M76 60V64", 2.2),
    forest_choir: () => ground(62) + [20, 50, 80].map((x, i) => P("M" + (x - 9) + " 62L" + x + " " + (26 - i % 2 * 6) + "L" + (x + 9) + " 62Z", H, 1.4) + C(x, 44 - i % 2 * 4, 3, "#fff", 1.2) + L("M" + x + " 62V66", 2)).join("") + L("M34 18V8L40 6V16", 1.4) + E(32, 18, 2.5, 2, K, 0.5) + E(38, 16, 2.5, 2, K, 0.5) + L("M62 14V5", 1.4) + E(60, 14, 2.5, 2, K, 0.5),
    forest_stardeer: () => ground(64) + P("M30 40Q32 30 50 30Q68 30 72 40Q70 48 50 48Q32 48 30 40Z") + P("M68 34L76 18L84 20L78 34Z") + dot(79, 24, 1.1) + L("M77 18L72 8M72 12L66 8M80 18L86 8M84 12L90 10", 1.4) + legs4(36, 46, 30, 18) + star(20, 18, 4) + star(46, 14, 3) + star(60, 20, 2.5) + star(92, 34, 2.5),
    forest_oldlinden: () => ground(64) + P("M40 64Q44 44 42 34H58Q56 44 60 64Z", V) + P("M50 6Q78 6 82 26Q86 40 66 40Q60 46 50 42Q40 46 34 40Q14 40 18 26Q22 6 50 6Z", H) + E(46, 52, 2, 1.2, K, 0.5) + E(54, 52, 2, 1.2, K, 0.5) + L("M46 57Q50 59 54 57", 1) + L("M40 64L30 66M60 64L70 66", 1.6),
    forest_sapling: () => ground(60) + L("M50 60Q48 46 50 36", 2) + leaf(50, 38, 1.3, -55) + leaf(49, 46, 1.1, 205) + eyes(47, 53, 52, 1),
    // Fire
    fire_sparkimp: () => ground(62) + P("M38 62Q36 40 50 38Q64 40 62 62Z", H) + C(50, 32, 10) + P("M42 25L38 14L46 22Z", K, 1) + P("M58 25L62 14L54 22Z", K, 1) + eyes(46, 54, 31) + L("M46 37Q50 40 54 37", 1.2) + L("M62 50L72 44", 2) + sparks([[76, 40, 3], [82, 50, 2], [72, 30, 2.2], [24, 30, 2]]),
    fire_embersalamander: () => ground(62) + P("M14 52Q30 40 50 46Q66 50 82 42Q88 40 90 44Q86 50 70 54Q50 60 30 58Q18 58 14 52Z", D) + C(84, 44, 3, "#fff", 1.2) + dot(85, 43, 1) + L("M30 56L26 62M42 58L42 63M58 56L60 62M70 54L74 60", 1.6) + flame(40, 40, 0.8, "#fff") + flame(56, 42, 0.9, H) + flame(70, 38, 0.7, "#fff"),
    fire_sparkflight: () => L("M14 58Q40 52 54 36Q66 22 88 16", 1.4) + sparks([[30, 52, 3], [46, 44, 3.5], [60, 30, 4.5], [76, 20, 3.5], [88, 14, 2.5], [22, 58, 2]]) + L("M66 26L78 34M72 18L84 22", 1),
    fire_ashwolf: () => ground(64) + P("M16 46Q22 30 44 32Q66 30 74 40Q72 52 54 52Q34 54 16 46Z", X) + P("M70 38L86 30L90 38L80 46Z", X) + P("M80 32L82 22L86 30Z", K, 1) + dot(84, 35, 1.2) + legs4(28, 50, 36, 14) + P("M16 46Q8 40 4 30Q12 34 18 40Z", X, 1.2) + L("M40 24Q42 18 46 20M54 22Q56 14 62 16", 1),
    fire_emberwave: () => ground(62) + [14, 30, 46, 62, 78].map((x, i) => flame(x + 4, 52 - (i % 2) * 8, 1.1, i % 2 ? H : "#fff")).join("") + L("M8 56Q30 46 50 56T92 56", 1.4),
    fire_lavaspear: () => L("M14 60L72 18", 3) + P("M70 12L86 8L80 24Z", K, 1) + drop(40, 50, 0.9, K) + drop(52, 46, 0.7, "#fff") + flame(30, 64, 0.6, "#fff") + flame(20, 62, 0.5, H),
    fire_flamedancer: () => ground(64) + P("M50 34L36 64H64Z", H) + C(50, 22, 7) + L("M50 32L32 20M50 32L70 18", 2) + flame(30, 20, 0.8, "#fff") + flame(72, 16, 0.8, "#fff") + flame(50, 12, 0.6, K) + L("M44 64L40 66M56 64L60 66", 1.6),
    fire_flamesteed: () => ground(64) + P("M24 40Q26 30 46 30Q64 30 68 38Q66 48 46 48Q28 48 24 40Z") + P("M62 34L74 16L84 20L76 36Z") + dot(78, 22, 1.2) + legs4(30, 46, 32, 18) + flame(66, 24, 0.9, H) + flame(58, 28, 0.8, "#fff") + flame(22, 40, 1, H),
    fire_starblaze: () => '<g transform="translate(50 36)">' + P("M0 -28L7 -8L28 -8L11 4L18 24L0 12L-18 24L-11 4L-28 -8L-7 -8Z", H) + C(0, 0, 7, "#fff", 1.4) + "</g>" + L("M12 12L20 18M88 12L80 18M14 60L22 54M86 60L78 54", 1.4),
    fire_magmadrake: () => ground(64) + P("M18 52Q20 36 42 34Q62 32 70 42Q72 54 54 58Q34 60 18 52Z", X) + P("M64 40Q74 26 84 28Q92 32 86 40Q80 46 70 46Z", X) + dot(84, 33, 1.3) + P("M40 34L46 10L58 30Z", "#fff", 1.4) + L("M46 10L50 32M52 14L54 32", 0.8) + L("M28 58L26 64M54 58L56 64", 2.2) + P("M18 52Q8 50 6 42Q14 46 20 46Z", X, 1.2) + flame(92, 40, 0.6, "#fff"),
    // Water
    fire_placeholder: null,
    water_dropsprite: () => drop(50, 42, 4, "#fff") + eyes(45, 55, 44, 1.4) + L("M46 50Q50 53 54 50", 1.2) + P("M36 32Q24 22 22 34Q28 38 36 36Z", D, 1.2) + P("M64 32Q76 22 78 34Q72 38 64 36Z", D, 1.2) + wave(64, 10, 90, 3),
    water_whirlpool: () => L("M50 36m-4 0a4 4 0 1 1 8 0a8 8 0 1 1 -16 0a12 12 0 1 1 24 0a16 16 0 1 1 -32 0a20 20 0 1 1 40 0a24 24 0 1 1 -48 0", 1.4) + wave(64, 6, 94, 3),
    water_mistotter: () => wave(48, 6, 94, 3) + P("M20 44Q26 32 46 32Q64 32 74 38Q70 46 50 46Q30 46 20 44Z", H) + C(76, 36, 6) + dot(78, 34, 1.2) + E(81, 37, 1.5, 1, K, 0.4) + L("M80 40L88 40M80 42L87 44", 0.8) + L("M14 22Q30 16 46 22M50 16Q64 10 80 16M20 30Q30 26 40 30", 1, "#141413") + wave(58, 10, 90, 2.5),
    water_tidesight: () => wave(56, 6, 94, 3) + wave(64, 6, 94, 3) + P("M14 34Q50 4 86 34Q50 60 14 34Z") + C(50, 34, 10, H) + C(50, 34, 4, K, 0) + L("M50 10V4M30 14L26 8M70 14L74 8", 1.2),
    water_shellsentry: () => ground(62) + P("M28 58Q24 30 50 22Q76 30 72 58Z", "#fff") + L("M50 22V58M38 26L36 58M62 26L64 58M30 40H70", 1.2) + P("M28 58Q50 64 72 58", "#fff", 1.4) + L("M80 62V16", 2) + P("M76 18L80 8L84 18Z", K, 1) + eyes(44, 56, 48, 1.3),
    water_waverider: () => P("M10 56Q30 30 54 40Q72 48 92 34V66H10Z", H) + P("M30 40L66 34Q68 36 64 38L32 44Z", "#fff", 1.3) + C(48, 18, 5) + L("M48 23V32M48 26L38 22M48 26L58 24M48 32L42 38M48 32L54 37", 1.8),
    water_springwater: () => ground(64) + P("M30 64Q30 50 50 50Q70 50 70 64Z", X) + L("M50 50Q50 30 50 22M50 30Q40 22 34 30M50 30Q60 22 66 30", 1.4) + drop(34, 38, 0.9) + drop(66, 38, 0.9) + drop(50, 16, 1.1) + drop(42, 44, 0.6, K) + drop(58, 44, 0.6, K),
    water_frostnixie: () => wave(62, 8, 92, 3) + P("M50 30Q36 46 38 60H62Q64 46 50 30Z", D) + C(50, 24, 7) + P("M43 22Q50 8 57 22Q52 18 50 20Q48 18 43 22Z", H, 1) + eyes(47, 53, 25, 1) + crystal(24, 30, 1.3) + crystal(78, 26, 1.1) + crystal(84, 44, 0.8) + L("M42 40L30 44M58 40L70 44", 1.6),
    water_floodsurge: () => P("M6 66V44Q20 20 44 18Q66 18 70 34Q60 26 52 32Q62 36 60 44Q76 40 94 48V66Z", H) + wave(58, 6, 94, 2) + L("M40 24Q48 22 52 28", 1),
    water_tidesquid: () => wave(64, 6, 94, 2.5) + P("M36 40Q32 10 50 8Q68 10 64 40Z", D) + eyes(44, 56, 30, 1.6) + [32, 40, 48, 56, 64].map((x, i) => L("M" + (x + 2) + " 40Q" + (x - 6 + i * 3) + " 52 " + (x - 2 + i) + " 60Q" + (x + 4) + " 62 " + (x + 6) + " 56", 1.6)).join(""),
    // Stone
    stone_pebblewight: () => ground(62) + P("M32 62Q26 40 44 34Q62 30 68 46Q72 60 64 62Z", D) + eyes(44, 56, 46, 1.6) + L("M46 54H56", 1.4) + rock(72, 54, 10, 8) + rock(18, 56, 8, 6) + P("M40 34L44 26L50 32Z", "#fff", 1.2),
    stone_granitekeeper: () => ground(64) + P("M34 64V34H66V64Z", X) + P("M38 34V20H62V34Z") + eyes(45, 55, 27, 1.6) + P("M62 40H82V54Q72 64 62 54Z", "#fff", 1.6) + L("M72 42V58M64 48H80", 1) + L("M34 44L22 52", 3),
    stone_rockram: () => ground(64) + P("M18 44Q20 32 40 32Q60 32 64 40Q62 50 40 50Q22 50 18 44Z", D) + P("M60 36Q72 26 80 34Q84 42 74 46L64 46Z", "#fff") + P("M66 32Q62 18 74 18Q86 20 80 32Q76 26 72 28Q70 24 68 30Z", X, 1.3) + dot(76, 38, 1.2) + legs4(24, 48, 34, 16),
    stone_rockhide: () => P("M50 8L80 18V38Q80 56 50 64Q20 56 20 38V18Z", "#fff", 1.8) + rock(28, 18, 20, 14, D) + rock(52, 18, 20, 14, X) + rock(28, 36, 20, 14, X) + rock(52, 36, 20, 14, D),
    stone_quartzknight: () => ground(64) + P("M38 64L40 36H60L62 64Z", X) + P("M40 36Q38 14 50 10Q62 14 60 36Z") + crystal(50, 12, 1) + L("M42 26H58", 1.6) + L("M60 44L80 20", 2.2) + P("M78 18L84 12L82 22Z", K, 1) + crystal(24, 56, 1) + crystal(30, 58, 0.7),
    stone_boulder: () => ground(62) + C(50, 38, 22, D) + L("M36 26Q44 32 40 44M56 24Q62 36 58 50", 1.2) + L("M10 40H20M8 48H22M12 56H24", 1.4) + rock(78, 54, 10, 8),
    stone_basalttortoise: () => ground(62) + P("M16 54Q18 26 50 24Q82 26 84 54Z", "#fff") + '<g fill="none" stroke="' + K + '" stroke-width="1.2"><path d="M40 30L50 26L60 30L60 40L50 44L40 40Z"/><path d="M40 40L30 46M60 40L70 46M50 44V54M40 30L28 34M60 30L72 34"/></g>' + P("M40 30L50 26L60 30L60 40L50 44L40 40Z", X, 1.2) + P("M84 48Q94 44 92 52Q90 56 84 54Z") + dot(89, 50, 1) + L("M24 54V60M40 56V61M60 56V61M76 54V60", 2.4),
    stone_rumble: () => P("M6 40H94V66H6Z", D, 1.2) + L("M50 40L44 48L52 54L46 66M30 40L34 50L28 58M70 40L66 50L74 60", 1.6) + rock(22, 20, 12, 10) + rock(64, 14, 10, 8) + rock(44, 26, 8, 6) + L("M14 30L18 34M84 28L80 34", 1),
    stone_oregolem: () => ground(64) + P("M30 64L32 40H68L70 64H58V54H42V64Z", "#fff") + P("M30 24H70V42H30Z", X) + rock(38, 6, 24, 18, "#fff") + eyes(45, 55, 15, 1.6) + E(40, 50, 3, 2, K, 0.5) + E(60, 46, 2.5, 2, K, 0.5) + E(50, 58, 2, 1.5, K, 0.5) + P("M30 26L18 46L24 48L32 34Z", "#fff") + P("M70 26L82 46L76 48L68 34Z", "#fff"),
    stone_peakcolossus: () => ground(66) + P("M10 66L38 14L50 30L62 10L90 66Z", X) + P("M38 14L44 24L50 30L56 20L62 10L56 22L50 26L44 20Z", "#fff", 1) + eyes(44, 56, 42, 1.8) + L("M42 52H58", 1.6) + L("M24 40L14 46M76 40L86 46", 2.4)
  };
  delete ART.fire_placeholder;

  // Mage portraits: a head with the element's headgear.
  const MAGE = {
    forest: () => P("M14 60Q14 40 30 38Q46 40 46 60Z", H) + C(30, 28, 11) + eyes(26, 34, 28, 1.3) + L("M26 34Q30 36 34 34", 1.2) + leaf(18, 18, 0.9, -40) + leaf(30, 12, 0.9, -90) + leaf(42, 18, 0.9, -140) + P("M24 38Q30 50 36 38", D, 1),
    fire: () => P("M12 60Q12 40 30 38Q48 40 48 60Z", X) + P("M16 32Q16 10 30 8Q44 10 44 32L40 22Q30 18 20 22Z", H) + C(30, 30, 9) + eyes(26, 34, 30, 1.3) + L("M26 35Q30 37 34 35", 1.1) + flame(30, 8, 0.7, "#fff") + flame(20, 12, 0.5, "#fff") + flame(40, 12, 0.5, "#fff"),
    water: () => P("M12 60Q12 40 30 38Q48 40 48 60Z", D) + P("M14 34Q14 10 30 10Q46 10 46 34Q40 22 30 22Q20 22 14 34Z", "#fff") + L("M16 24Q22 18 28 24T40 24", 1.2) + C(30, 31, 9) + eyes(26, 34, 31, 1.3) + drop(30, 4, 0.6, K),
    stone: () => P("M12 60Q12 40 30 38Q48 40 48 60Z", X) + rock(16, 10, 28, 14, D) + C(30, 30, 9) + eyes(26, 34, 29, 1.3) + P("M22 34Q30 52 38 34Q34 38 30 38Q26 38 22 34Z", V, 1.1)
  };

  function frame(el, w, h) {
    return '<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" fill="none" stroke="url(#cda-fr-' + el + ')" stroke-width="6"/>' +
      '<rect x="0.5" y="0.5" width="' + (w - 1) + '" height="' + (h - 1) + '" rx="2" fill="none" stroke="' + K + '" stroke-width="1"/>' +
      '<rect x="6" y="6" width="' + (w - 12) + '" height="' + (h - 12) + '" fill="none" stroke="' + K + '" stroke-width="0.8"/>';
  }

  // The element is the start of the id (forest_mosskin -> forest).
  function picture(id, cls) {
    const f = ART[id];
    if (!f) return "";
    const el = id.split("_")[0];
    return '<svg class="' + (cls || "cda-pic") + '" viewBox="0 0 100 70" aria-hidden="true" focusable="false"><rect width="100" height="70" fill="#fff"/>' + f() + frame(el, 100, 70) + "</svg>";
  }

  function portrait(el, cls) {
    const f = MAGE[el];
    if (!f) return "";
    return '<svg class="' + (cls || "cda-portrait") + '" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><rect width="60" height="60" fill="#fff"/>' + f() + frame(el, 60, 60) + "</svg>";
  }

  function ids() { return Object.keys(ART); }

  return { defs, picture, portrait, ids };
})();

if (typeof module !== "undefined" && module.exports) module.exports = CardDuelArt;
if (typeof window !== "undefined") window.CardDuelArt = CardDuelArt;
