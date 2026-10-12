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
//
// The second mode, "Picture search" (Suchbild), uses the same drawings:
// one large picture of cols x rows cells of 40 x 40, at most one drawing
// per cell, and 5 / 7 / 10 drawings to find, shown on their own above it.
// The picture shows a room (kitchen, attic, garden, ...) drawn in plain
// lines, and the drawings are things that belong there.
// A drawing to find is told by its type, its pattern and - for drawings
// that look different mirrored - its direction (its "look"); each look to
// find is in the picture exactly once, the other drawings have other
// looks (on Hard often the same type in another pattern). A search
// puzzle:
//   { mode: "search", level, room, cols, rows,
//     items: [{ cell, type, pattern, mirror, dx, dy, scale }],
//     targets: [cell, ...] }

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
  // The first twelve drawings: the "Spot the Difference" pictures and old
  // saved searches use only these.
  const TYPE_NAMES = Object.keys(TYPES);

  // More drawings for the picture search in rooms: the animals and things
  // of "Who Took the Cake?" and things that belong in a room. Eyes are
  // white with a black dot, so they show on every pattern.
  const WF = 'fill="#fff" ' + S;
  const eye = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#fff" stroke="#141413" stroke-width="1.4"/><circle cx="' + x + '" cy="' + y + '" r="1" fill="#141413"/>';
  Object.assign(TYPES, {
    dog: { asym: true, draw: (f) => '<path d="M-14 1L-19-5" fill="none" ' + S + '/><ellipse cx="-3" cy="5" rx="12" ry="7" fill="' + f + '" ' + S + '/>' +
      '<path d="M-10 11V18M5 11V18" fill="none" ' + S + '/><circle cx="10" cy="-6" r="7" fill="' + f + '" ' + S + '/>' +
      '<ellipse cx="6" cy="-4" rx="2.6" ry="5.5" fill="#141413"/>' + eye(11.5, -8) + '<circle cx="17" cy="-4.5" r="1.8" fill="#141413"/>' },
    rabbit: { asym: true, draw: (f) => '<ellipse cx="5" cy="-14" rx="2.6" ry="7" fill="' + f + '" ' + S + '/><ellipse cx="11" cy="-13" rx="2.6" ry="7" fill="' + f + '" ' + S + '/>' +
      '<circle cx="-14" cy="5" r="3.2" ' + WF + '/><ellipse cx="-3" cy="8" rx="11" ry="8" fill="' + f + '" ' + S + '/><circle cx="8" cy="-3" r="6.5" fill="' + f + '" ' + S + '/>' + eye(10, -4) },
    mouse: { asym: true, draw: (f) => '<path d="M-11 9C-17 9-19 2-15-1" fill="none" ' + S + '/><path d="M-12 12C-12 0 4-3 17 8C12 12 0 13-12 12Z" fill="' + f + '" ' + S + '/>' +
      '<circle cx="4" cy="-1" r="5" fill="' + f + '" ' + S + '/>' + eye(9.5, 5) + '<circle cx="17" cy="8" r="1.5" fill="#141413"/>' },
    hedgehog: { asym: true, draw: (f) => '<path d="M-14 10L-12 0L-9 5L-7-6L-3 3L-1-8L3 2L5-7L8 3L10-3L11 6L-14 10Z" fill="#141413" stroke="#141413" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M-15 11C-15 2 11 0 15 8C16 10 15 12 13 12H-15Z" fill="' + f + '" ' + S + '/>' + eye(8, 7) + '<circle cx="15.5" cy="9.5" r="1.4" fill="#141413"/>' +
      '<path d="M-9 12V15M4 12V15" fill="none" ' + S + '/>' },
    bear: { asym: false, draw: (f) => '<circle cx="-8.5" cy="-8" r="5" fill="' + f + '" ' + S + '/><circle cx="8.5" cy="-8" r="5" fill="' + f + '" ' + S + '/>' +
      '<circle cx="0" cy="2" r="11" fill="' + f + '" ' + S + '/>' + eye(-4, -1) + eye(4, -1) +
      '<ellipse cx="0" cy="7" rx="5" ry="3.8" ' + WF + '/><ellipse cx="0" cy="5.6" rx="2" ry="1.4" fill="#141413"/>' },
    magpie: { asym: true, draw: (f) => '<path d="M6 6L18 14L15 16.5L5 9Z" fill="#141413"/><ellipse cx="1" cy="6" rx="10" ry="7" fill="' + f + '" ' + S + '/>' +
      '<path d="M-7 2C-3-2 7-2 11 5C6 3-2 4-6 7Z" fill="#141413"/><circle cx="-5" cy="-4" r="6.5" fill="#141413"/><path d="M-10.5-5.5L-17-3.5L-10.5-1.5Z" fill="#141413"/>' +
      '<circle cx="-6.5" cy="-5" r="1.4" fill="#fff"/><path d="M-1 13V17M3 13V17" fill="none" ' + S + ' stroke-width="1.8"/>' },
    cake: { asym: false, draw: (f) => '<path d="M0-17C2-14 2-12.5 0-11.5C-2-12.5-2-14 0-17Z" fill="#141413"/><path d="M0-11V-6" fill="none" ' + S + '/>' +
      '<rect x="-9" y="-6" width="18" height="8" fill="' + f + '" ' + S + '/><rect x="-13" y="2" width="26" height="12" fill="' + f + '" ' + S + '/>' +
      '<path d="M-13 6C-10 9-8 4-5 7C-2 10 0 4 3 7C6 10 8 4 13 7" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-13 6C-10 9-8 4-5 7C-2 10 0 4 3 7C6 10 8 4 13 7" fill="none" ' + S + ' stroke-width="1.8"/>' },
    cookies: { asym: false, draw: (f) => '<circle cx="-5" cy="3" r="9" fill="' + f + '" ' + S + '/><circle cx="6" cy="-3" r="9" fill="' + f + '" ' + S + '/>' +
      '<circle cx="-8" cy="2" r="1.8" ' + WF + ' stroke-width="1.2"/><circle cx="-4" cy="7" r="1.8" ' + WF + ' stroke-width="1.2"/><circle cx="3" cy="-6" r="1.8" ' + WF + ' stroke-width="1.2"/>' +
      '<circle cx="8.5" cy="-1" r="1.8" ' + WF + ' stroke-width="1.2"/><circle cx="7" cy="-8" r="1.6" ' + WF + ' stroke-width="1.2"/>' },
    ball: { asym: false, draw: (f) => '<circle r="13" fill="' + f + '" ' + S + '/><path d="M-12.5-4C-6-1 6-1 12.5-4M-12.5 4C-6 1 6 1 12.5 4M0-13V13" fill="none" stroke="#fff" stroke-width="4.2"/>' +
      '<path d="M-12.5-4C-6-1 6-1 12.5-4M-12.5 4C-6 1 6 1 12.5 4M0-13V13" fill="none" ' + S + ' stroke-width="1.8"/>' },
    key: { asym: true, draw: (f) => '<path d="M-2 0H17M11 0V7M16 0V6" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="-9" cy="0" r="7.5" fill="' + f + '" stroke="#141413" stroke-width="3"/><circle cx="-9" cy="0" r="2.4" ' + WF + ' stroke-width="1.4"/>' },
    pot: { asym: false, draw: (f) => '<path d="M-18-1H-14M14-1H18" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/><path d="M-14-4H14V10C14 15-14 15-14 10Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-13-4C-13-11 13-11 13-4Z" ' + WF + '/><circle cx="0" cy="-11" r="2.4" fill="#141413"/>' },
    cup: { asym: true, draw: (f) => '<path d="M9-4C17-4 17 6 9 6" fill="none" stroke="#141413" stroke-width="3" stroke-linecap="round"/><path d="M-11-8H9V5C9 11-11 11-11 5Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-16 13H14" fill="none" ' + S + ' stroke-width="3"/><path d="M-4-12C-6-14-2-16-4-18M2-12C0-14 4-16 2-18" fill="none" ' + S + ' stroke-width="1.6"/>' },
    teapot: { asym: true, draw: (f) => '<path d="M10 3L18-7" fill="none" stroke="#141413" stroke-width="3.6" stroke-linecap="round"/><path d="M-11-3C-18-3-18 9-11 9" fill="none" stroke="#141413" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="4" rx="12" ry="10" fill="' + f + '" ' + S + '/><path d="M-6-5C-6-11 6-11 6-5Z" ' + WF + '/><circle cx="0" cy="-11" r="2" fill="#141413"/>' },
    bottle: { asym: false, draw: (f) => '<path d="M-4-18H4V-11C4-8 9-6 9-1V16H-9V-1C-9-6-4-8-4-11Z" fill="' + f + '" ' + S + '/><rect x="-6.5" y="2" width="13" height="7" ' + WF + ' stroke-width="1.6"/>' },
    clock: { asym: false, draw: (f) => '<circle cx="-9" cy="-12" r="4" fill="#141413"/><circle cx="9" cy="-12" r="4" fill="#141413"/><path d="M-9 13L-12 17M9 13L12 17" fill="none" ' + S + '/>' +
      '<circle cx="0" cy="1" r="13" fill="' + f + '" ' + S + '/><circle cx="0" cy="1" r="9" ' + WF + ' stroke-width="1.6"/><path d="M0 1V-5M0 1L4.5 3.5" fill="none" ' + S + '/>' },
    plate: { asym: false, draw: (f) => '<circle r="12" fill="' + f + '" ' + S + '/><circle r="7" ' + WF + ' stroke-width="1.6"/>' +
      '<path d="M-17-10V12M-19-10V-4H-15V-10M17-10C20-4 20 2 17 3V12" fill="none" ' + S + ' stroke-width="2"/>' },
    glass: { asym: false, draw: (f) => '<path d="M-8-17H8C8-5 4-1 0-1C-4-1-8-5-8-17Z" fill="' + f + '" ' + S + '/><path d="M0-1V14M-7 15H7" fill="none" ' + S + '/>' },
    lamp: { asym: false, draw: (f) => '<path d="M0-3V14" fill="none" stroke="#141413" stroke-width="3"/><path d="M-9-17H9L14-3H-14Z" fill="' + f + '" ' + S + '/><ellipse cx="0" cy="15" rx="9" ry="3" ' + WF + '/>' },
    book: { asym: false, draw: (f) => '<path d="M0-8C-6-12-12-12-17-10V11C-12 9-6 9 0 13C6 9 12 9 17 11V-10C12-12 6-12 0-8Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M0-8V13" fill="none" ' + S + '/><path d="M-17 11V15C-12 13-6 13 0 17C6 13 12 13 17 15V11" fill="none" ' + S + ' stroke-width="1.8"/>' },
    vase: { asym: false, draw: (f) => '<path d="M-5-17H5V-13C12-9 13 6 7 15H-7C-13 6-12-9-5-13Z" fill="' + f + '" ' + S + '/><path d="M-6-17H6" fill="none" ' + S + ' stroke-width="3"/>' },
    candle: { asym: false, draw: (f) => '<path d="M0-18C3-14 3-12 0-10C-3-12-3-14 0-18Z" fill="#141413"/><path d="M0-10V-6" fill="none" ' + S + '/>' +
      '<rect x="-5" y="-6" width="10" height="19" fill="' + f + '" ' + S + '/><ellipse cx="0" cy="14" rx="11" ry="3.5" ' + WF + '/>' },
    block: { asym: false, draw: (f) => '<path d="M-13-6L-6-13H13L6-6Z" ' + WF + '/><path d="M6-6L13-13V6L6 13Z" ' + WF + '/><rect x="-13" y="-6" width="19" height="19" fill="' + f + '" ' + S + '/>' },
    drum: { asym: false, draw: (f) => '<path d="M-13-18L2-9M13-18L-2-9" fill="none" stroke="#141413" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-13-5V9C-13 15 13 15 13 9V-5" fill="' + f + '" ' + S + '/><ellipse cx="0" cy="-5" rx="13" ry="4.5" ' + WF + '/>' },
    rocket: { asym: false, draw: (f) => '<path d="M-5 3L-11 13L-5 10ZM5 3L11 13L5 10Z" ' + WF + '/><path d="M0-19C8-12 8 0 5 10H-5C-8 0-8-12 0-19Z" fill="' + f + '" ' + S + '/>' +
      '<circle cx="0" cy="-6" r="3.4" ' + WF + ' stroke-width="1.8"/><path d="M-3 13L0 18L3 13" fill="none" ' + S + ' stroke-width="1.8"/>' },
    chest: { asym: false, draw: (f) => '<path d="M-15-3V-7C-15-15 15-15 15-7V-3Z" ' + WF + '/><rect x="-15" y="-3" width="30" height="17" fill="' + f + '" ' + S + '/>' +
      '<path d="M-9-13V14M9-13V14" fill="none" stroke="#141413" stroke-width="2.4"/><rect x="-3.5" y="-6" width="7" height="8" ' + WF + ' stroke-width="1.8"/>' },
    spinningwheel: { asym: true, draw: (f) => '<path d="M-16 17L-10 5H14M-10 5L-7 17M13 5L15 17M-10 5L-15-2" fill="none" ' + S + '/>' +
      '<circle cx="5" cy="-6" r="11" fill="' + f + '" ' + S + '/><circle cx="5" cy="-6" r="7" ' + WF + ' stroke-width="1.6"/>' +
      '<path d="M5-13V1M-2-6H12M0-11L10-1M10-11L0-1" fill="none" ' + S + ' stroke-width="1.4"/><path d="M5-6V5" fill="none" ' + S + '/>' },
    lantern: { asym: false, draw: (f) => '<path d="M-6-14C-6-20 6-20 6-14" fill="none" ' + S + '/><path d="M-9-14H9L6-9H-6Z" fill="' + f + '" ' + S + '/>' +
      '<ellipse cx="0" cy="0" rx="8" ry="9.5" ' + WF + '/><path d="M0-5C3-1 3 2 0 4C-3 2-3-1 0-5Z" fill="#141413"/><rect x="-10" y="9" width="20" height="7" fill="' + f + '" ' + S + '/>' },
    suitcase: { asym: false, draw: (f) => '<path d="M-5-8V-13H5V-8" fill="none" stroke="#141413" stroke-width="2.8"/><rect x="-16" y="-8" width="32" height="22" rx="3" fill="' + f + '" ' + S + '/>' +
      '<rect x="-10" y="-8" width="4" height="22" ' + WF + ' stroke-width="1.6"/><rect x="6" y="-8" width="4" height="22" ' + WF + ' stroke-width="1.6"/>' },
    umbrella: { asym: true, draw: (f) => '<path d="M0-12V12C0 17-7 17-7 12" fill="none" stroke="#141413" stroke-width="2.8" stroke-linecap="round"/>' +
      '<path d="M-17 0C-17-18 17-18 17 0C14-3 9-3 6 0C3-3-3-3-6 0C-9-3-14-3-17 0Z" fill="' + f + '" ' + S + '/>' },
    hat: { asym: false, draw: (f) => '<path d="M-10 5V-9C-10-15 10-15 10-9V5Z" fill="' + f + '" ' + S + '/><path d="M-10-1H10" fill="none" stroke="#fff" stroke-width="4"/>' +
      '<path d="M-10-3H10M-10 1H10" fill="none" ' + S + ' stroke-width="1.4"/><ellipse cx="0" cy="6" rx="17" ry="4.5" ' + WF + '/>' },
    parasol: { asym: false, draw: (f) => '<path d="M0-8V14" fill="none" stroke="#141413" stroke-width="2.8"/><path d="M-8 16H8" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M-18-6L0-17L18-6Z" fill="' + f + '" ' + S + '/><path d="M-18-6V-3M-6-6V-3M6-6V-3M18-6V-3" fill="none" ' + S + ' stroke-width="1.8"/>' },
    wateringcan: { asym: true, draw: (f) => '<path d="M-10-5C-10-15 4-15 4-5" fill="none" stroke="#141413" stroke-width="2.6"/><path d="M5 7L16-6" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M14-9L19-4" fill="none" stroke="#141413" stroke-width="4" stroke-linecap="round"/><rect x="-13" y="-5" width="19" height="18" rx="2" fill="' + f + '" ' + S + '/>' },
    bucket: { asym: false, draw: (f) => '<path d="M-12-6C-12-19 12-19 12-6" fill="none" stroke="#141413" stroke-width="2.4"/><path d="M-12-6H12L9 14H-9Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-12-6H12" fill="none" ' + S + ' stroke-width="3.4"/>' },
    shovel: { asym: false, draw: (f) => '<path d="M-6-18H6M0-18V3" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M-8 2H8V10C8 15 0 19 0 19C0 19-8 15-8 10Z" fill="' + f + '" ' + S + '/>' },
    snail: { asym: true, draw: (f) => '<path d="M-14 5L-17-4M-11 5L-11-4" fill="none" ' + S + ' stroke-width="1.8"/><circle cx="-17" cy="-5" r="1.7" fill="#141413"/><circle cx="-11" cy="-5" r="1.7" fill="#141413"/>' +
      '<path d="M-17 13H16C18 13 18 10 15 10H-10C-12 10-14 7-15 4C-17 6-18 10-17 13Z" ' + WF + '/>' +
      '<circle cx="3" cy="-1" r="11" fill="' + f + '" ' + S + '/><path d="M3-1C6-1 6 3 3 3C-1 3-1-4 3-5C9-6 10 3 6 6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M3-1C6-1 6 3 3 3C-1 3-1-4 3-5C9-6 10 3 6 6" fill="none" ' + S + ' stroke-width="1.6"/>' },
    birdhouse: { asym: false, draw: (f) => '<path d="M0 12V19" fill="none" stroke="#141413" stroke-width="3"/><rect x="-11" y="-4" width="22" height="16" ' + WF + '/>' +
      '<path d="M-16-3L0-17L16-3Z" fill="' + f + '" ' + S + '/><circle cx="0" cy="2" r="4" fill="#141413"/><path d="M-4 9H4" fill="none" ' + S + '/>' },
    punch: { asym: false, draw: (f) => '<rect x="-16" y="6" width="32" height="8" ' + WF + '/><path d="M-12 6V-1C-12-6 12-6 12-1V6Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-15-9H15" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/><path d="M0-9V-5" fill="none" ' + S + '/><circle cx="-7" cy="10" r="1.5" fill="#141413"/><circle cx="7" cy="10" r="1.5" fill="#141413"/>' },
    folder: { asym: false, draw: (f) => '<rect x="-9" y="-18" width="18" height="36" rx="1.5" fill="' + f + '" ' + S + '/><rect x="-6" y="-13" width="12" height="11" ' + WF + ' stroke-width="1.6"/>' +
      '<circle cx="0" cy="9" r="3.4" ' + WF + ' stroke-width="1.8"/>' },
    globe: { asym: false, draw: (f) => '<path d="M0 10V15M-8 16H8" fill="none" stroke="#141413" stroke-width="2.8" stroke-linecap="round"/><path d="M-14-3C-14 10 14 10 14-3" fill="none" ' + S + ' stroke-width="1.8"/>' +
      '<circle cx="0" cy="-4" r="11.5" fill="' + f + '" ' + S + '/><path d="M-8-11C-4-10-3-6-6-3C-8-1-10-4-10-7ZM2-14C6-13 9-9 7-6C5-4 3-7 1-8ZM2 1C5 0 7 2 5 5C3 7 1 4 2 1Z" ' + WF + ' stroke-width="1.4"/>' },
    pencil: { asym: true, draw: (f) => '<path d="M-12 9L8-11L13-6L-7 14Z" fill="' + f + '" ' + S + '/><path d="M8-11L11-14C12-15 15-12 16-11L13-6Z" ' + WF + '/>' +
      '<path d="M-12 9L-7 14L-17 18Z" ' + WF + '/><path d="M-15 14L-17 18L-13 16Z" fill="#141413"/>' },
    boot: { asym: true, draw: (f) => '<path d="M-7-17H5V3L14 6C17 7 17 13 15 13H-7Z" fill="' + f + '" ' + S + '/><path d="M-8 16H16" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M-7-12H5" fill="none" stroke="#fff" stroke-width="3.6"/><path d="M-7-14H5M-7-10H5" fill="none" ' + S + ' stroke-width="1.4"/>' },
    rubberduck: { asym: true, draw: (f) => '<path d="M-16 2C-16 14 14 15 15 4C15 0 11-1 7 1C9-4 8-11 1-12C-6-12-8-6-6-2C-10-3-16-3-16 2Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-7-6L-15-5L-8-2Z" fill="#fff" ' + S + ' stroke-width="1.8"/>' + eye(-1, -6) + '<path d="M1 6C4 9 9 8 11 5" fill="none" ' + S + ' stroke-width="1.6"/>' },
    toothbrush: { asym: true, draw: (f) => '<path d="M-16 13L8-6" fill="none" stroke="#141413" stroke-width="5.4" stroke-linecap="round"/><path d="M-16 13L8-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M5-10L13-17L18-11L10-4Z" fill="' + f + '" ' + S + '/><path d="M9-15L5-19M12-12L8-16M15-9L11-13" fill="none" ' + S + ' stroke-width="1.6"/>' },
    soap: { asym: false, draw: (f) => '<rect x="-14" y="-6" width="28" height="16" rx="7" fill="' + f + '" ' + S + '/><circle cx="-6" cy="-12" r="3.4" ' + WF + ' stroke-width="1.8"/>' +
      '<circle cx="3" cy="-14" r="2.4" ' + WF + ' stroke-width="1.6"/><circle cx="9" cy="-10" r="1.8" ' + WF + ' stroke-width="1.4"/>' },
    towel: { asym: false, draw: (f) => '<path d="M-16-14H16" fill="none" stroke="#141413" stroke-width="3.4" stroke-linecap="round"/><path d="M-11-14H11V16H-11Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-11 9H11" fill="none" stroke="#fff" stroke-width="4.4"/><path d="M-11 7H11M-11 11H11" fill="none" ' + S + ' stroke-width="1.4"/>' },
    comb: { asym: false, draw: (f) => '<path d="M-16-6H16V1H-16Z" fill="' + f + '" ' + S + '/><path d="M-13 1V12M-8 1V12M-3 1V12M2 1V12M7 1V12M12 1V12" fill="none" ' + S + ' stroke-width="2.4"/>' },
    jar: { asym: false, draw: (f) => '<rect x="-10" y="-17" width="20" height="6" rx="1.5" ' + WF + '/><path d="M-11-11H11V13C11 16 9 17 6 17H-6C-9 17-11 16-11 13Z" fill="' + f + '" ' + S + '/>' +
      '<rect x="-7" y="-2" width="14" height="8" ' + WF + ' stroke-width="1.6"/>' },
    barrel: { asym: false, draw: (f) => '<path d="M-10-17H10C14-9 14 9 10 17H-10C-14 9-14-9-10-17Z" fill="' + f + '" ' + S + '/>' +
      '<path d="M-12.5-8H12.5M-12.5 8H12.5" fill="none" stroke="#fff" stroke-width="4.4"/><path d="M-12.5-8H12.5M-12.5 8H12.5" fill="none" ' + S + ' stroke-width="1.6"/>' },
    hammer: { asym: true, draw: (f) => '<path d="M-1-6V18" fill="none" stroke="#141413" stroke-width="5.4" stroke-linecap="round"/><path d="M-1-6V18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M-14-16H8V-6H-14Z" fill="' + f + '" ' + S + '/><path d="M8-14C13-14 16-17 17-19M8-8C13-8 16-5 17-3" fill="none" ' + S + '/>' },
    pillow: { asym: false, draw: (f) => '<path d="M-16-10C-10-13 10-13 16-10C18-3 18 3 16 10C10 13-10 13-16 10C-18 3-18-3-16-10Z" fill="' + f + '" ' + S + '/>' +
      '<circle cx="0" cy="0" r="3" ' + WF + ' stroke-width="1.6"/>' },
    slipper: { asym: true, draw: (f) => '<path d="M-17 4C-17-3-10-6-3-6H6C13-6 17-2 17 4C17 9 13 11 6 11H-10C-14 11-17 9-17 4Z" ' + WF + '/>' +
      '<path d="M-1-6C6-11 15-6 17 3H-1Z" fill="' + f + '" ' + S + '/><circle cx="-10" cy="2" r="1.6" fill="#141413"/>' },
    glasses: { asym: false, draw: (f) => '<path d="M-4-2C-2-5 2-5 4-2M-17-3L-19-8M17-3L19-8" fill="none" ' + S + '/>' +
      '<circle cx="-10" cy="1" r="7" fill="' + f + '" ' + S + '/><circle cx="10" cy="1" r="7" fill="' + f + '" ' + S + '/>' }
  });

  // The rooms of the picture search: the drawings that belong there and a
  // plain background of lines (no grey). bg(W, H) draws for a picture of
  // W x H units; the drawings stand on a white disc of their own, so the
  // background never runs through them.
  const L = 'fill="none" stroke="#141413" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"';
  const rd = (v) => Math.round(v * 10) / 10;
  const line = (d) => '<path d="' + d + '" ' + L + "/>";
  const box = (x, y, w, h) => '<rect x="' + rd(x) + '" y="' + rd(y) + '" width="' + rd(w) + '" height="' + rd(h) + '" ' + L + "/>";
  const windowAt = (x, y, w, h) => box(x, y, w, h) + line("M" + rd(x + w / 2) + " " + rd(y) + "V" + rd(y + h) + "M" + rd(x) + " " + rd(y + h / 2) + "H" + rd(x + w));
  const floorAt = (y, W) => line("M0 " + rd(y) + "H" + W);
  const ROOMS = {
    kitchen: {
      items: ["pot", "cup", "teapot", "bottle", "plate", "glass", "clock", "fish", "cake", "cookies", "cat", "mouse", "key"],
      // Wall cupboards, a tiled strip, the worktop with cupboard doors.
      bg: (W, H) => {
        let s = "";
        for (let x = 0.04; x < 0.6; x += 0.18) s += box(W * x, H * 0.05, W * 0.16, H * 0.22);
        s += windowAt(W * 0.68, H * 0.06, W * 0.26, H * 0.3);
        for (let x = 0; x < W; x += W / 12) s += line("M" + rd(x) + " " + rd(H * 0.5) + "v" + rd(H * 0.1));
        s += line("M0 " + rd(H * 0.5) + "H" + W) + line("M0 " + rd(H * 0.6) + "H" + W + "M0 " + rd(H * 0.64) + "H" + W);
        for (let x = 0; x < W; x += W / 6) s += box(x + 3, H * 0.66, W / 6 - 6, H * 0.3);
        return s;
      }
    },
    living: {
      items: ["lamp", "clock", "book", "vase", "candle", "cup", "cat", "dog", "ball", "balloon", "flower", "mouse", "star"],
      // Window with curtains, a picture, a sofa, a rug on the floor.
      bg: (W, H) => windowAt(W * 0.1, H * 0.08, W * 0.24, H * 0.32) +
        line("M" + rd(W * 0.07) + " " + rd(H * 0.06) + "H" + rd(W * 0.37) + "M" + rd(W * 0.08) + " " + rd(H * 0.06) + "C" + rd(W * 0.06) + " " + rd(H * 0.2) + " " + rd(W * 0.1) + " " + rd(H * 0.35) + " " + rd(W * 0.07) + " " + rd(H * 0.46) +
          "M" + rd(W * 0.36) + " " + rd(H * 0.06) + "C" + rd(W * 0.38) + " " + rd(H * 0.2) + " " + rd(W * 0.34) + " " + rd(H * 0.35) + " " + rd(W * 0.37) + " " + rd(H * 0.46)) +
        box(W * 0.55, H * 0.1, W * 0.18, H * 0.2) + line("M" + rd(W * 0.57) + " " + rd(H * 0.27) + "L" + rd(W * 0.62) + " " + rd(H * 0.18) + "L" + rd(W * 0.66) + " " + rd(H * 0.24) + "L" + rd(W * 0.68) + " " + rd(H * 0.2) + "L" + rd(W * 0.71) + " " + rd(H * 0.27)) +
        floorAt(H * 0.68, W) +
        line("M" + rd(W * 0.5) + " " + rd(H * 0.68) + "V" + rd(H * 0.5) + "H" + rd(W * 0.95) + "V" + rd(H * 0.68) + "M" + rd(W * 0.5) + " " + rd(H * 0.58) + "H" + rd(W * 0.95)) +
        '<ellipse cx="' + rd(W * 0.35) + '" cy="' + rd(H * 0.84) + '" rx="' + rd(W * 0.25) + '" ry="' + rd(H * 0.09) + '" ' + L + "/>"
    },
    kids: {
      items: ["block", "drum", "rocket", "ball", "kite", "balloon", "bear", "rabbit", "star", "car", "book", "cookies"],
      // A bed, a window with a moon, a shelf, a floor.
      bg: (W, H) => windowAt(W * 0.38, H * 0.08, W * 0.22, H * 0.3) +
        line("M" + rd(W * 0.43) + " " + rd(H * 0.14) + "a" + rd(H * 0.05) + " " + rd(H * 0.05) + " 0 1 0 " + rd(H * 0.06) + " " + rd(H * 0.07)) +
        line("M" + rd(W * 0.04) + " " + rd(H * 0.93) + "V" + rd(H * 0.48) + "M" + rd(W * 0.04) + " " + rd(H * 0.72) + "H" + rd(W * 0.32) + "V" + rd(H * 0.93) + "M" + rd(W * 0.04) + " " + rd(H * 0.64) + "H" + rd(W * 0.3)) +
        line("M" + rd(W * 0.7) + " " + rd(H * 0.3) + "H" + rd(W * 0.96) + "M" + rd(W * 0.7) + " " + rd(H * 0.5) + "H" + rd(W * 0.96) + "M" + rd(W * 0.72) + " " + rd(H * 0.3) + "v" + rd(H * 0.03) + "M" + rd(W * 0.94) + " " + rd(H * 0.3) + "v" + rd(H * 0.03)) +
        floorAt(H * 0.93, W)
    },
    attic: {
      items: ["chest", "spinningwheel", "lantern", "suitcase", "umbrella", "clock", "book", "hat", "mouse", "bear", "key", "candle"],
      // The roof slopes, a round window, beams and floorboards.
      bg: (W, H) => {
        let s = line("M0 " + rd(H * 0.55) + "L" + rd(W * 0.5) + " 2L" + W + " " + rd(H * 0.55));
        s += line("M" + rd(W * 0.5) + " 2V" + rd(H * 0.85) + "M" + rd(W * 0.2) + " " + rd(H * 0.33) + "H" + rd(W * 0.8));
        s += '<circle cx="' + rd(W * 0.5) + '" cy="' + rd(H * 0.2) + '" r="' + rd(H * 0.08) + '" ' + L + "/>";
        s += floorAt(H * 0.85, W);
        for (let x = W / 7; x < W; x += W / 7) s += line("M" + rd(x) + " " + rd(H * 0.85) + "V" + H);
        return s;
      }
    },
    terrace: {
      items: ["parasol", "wateringcan", "bucket", "flower", "bird", "cat", "cup", "glass", "ball", "magpie", "cake", "sun", "book"],
      // The house wall with a door, floor tiles, a railing.
      bg: (W, H) => {
        let s = box(W * 0.06, H * 0.08, W * 0.16, H * 0.5) + '<circle cx="' + rd(W * 0.19) + '" cy="' + rd(H * 0.35) + '" r="1.6" fill="#141413"/>';
        s += windowAt(W * 0.3, H * 0.1, W * 0.2, H * 0.24);
        s += floorAt(H * 0.58, W);
        for (let x = 0; x <= W; x += W / 8) s += line("M" + rd(x) + " " + rd(H * 0.58) + "L" + rd(W / 2 + (x - W / 2) * 1.5) + " " + H);
        s += line("M" + rd(W * 0.6) + " " + rd(H * 0.25) + "H" + W);
        for (let x = W * 0.62; x < W; x += W / 18) s += line("M" + rd(x) + " " + rd(H * 0.25) + "V" + rd(H * 0.58));
        return s;
      }
    },
    garden: {
      items: ["tree", "flower", "mushroom", "bird", "shovel", "snail", "birdhouse", "hedgehog", "rabbit", "sun", "kite", "wateringcan", "magpie", "ball", "cat"],
      // Clouds, a fence, wavy grass, a path.
      bg: (W, H) => {
        let s = line("M" + rd(W * 0.55) + " " + rd(H * 0.16) + "a6 6 0 0 1 10-4a7 7 0 0 1 13 1a5 5 0 0 1 3 9h-24a5 5 0 0 1-2-6Z");
        s += line("M" + rd(W * 0.08) + " " + rd(H * 0.12) + "a5 5 0 0 1 9-3a6 6 0 0 1 11 1a4 4 0 0 1 2 7h-20a4 4 0 0 1-2-5Z");
        for (let x = 4; x < W; x += W / 14) s += line("M" + rd(x) + " " + rd(H * 0.55) + "V" + rd(H * 0.36) + "l3-3l3 3V" + rd(H * 0.55));
        s += line("M0 " + rd(H * 0.42) + "H" + W + "M0 " + rd(H * 0.51) + "H" + W);
        let g = "M0 " + rd(H * 0.58);
        for (let x = 0; x < W; x += 10) g += "q2.5-3 5 0t5 0";
        s += line(g);
        s += line("M" + rd(W * 0.42) + " " + H + "C" + rd(W * 0.45) + " " + rd(H * 0.8) + " " + rd(W * 0.55) + " " + rd(H * 0.7) + " " + rd(W * 0.5) + " " + rd(H * 0.58) +
          "M" + rd(W * 0.62) + " " + H + "C" + rd(W * 0.6) + " " + rd(H * 0.8) + " " + rd(W * 0.6) + " " + rd(H * 0.7) + " " + rd(W * 0.54) + " " + rd(H * 0.58));
        return s;
      }
    },
    dining: {
      items: ["plate", "glass", "candle", "bottle", "cake", "cookies", "cup", "teapot", "fish", "vase", "clock", "dog"],
      // A long table, a hanging lamp, a window, a sideboard.
      bg: (W, H) => line("M" + rd(W * 0.5) + " 0V" + rd(H * 0.12) + "M" + rd(W * 0.42) + " " + rd(H * 0.2) + "L" + rd(W * 0.5) + " " + rd(H * 0.12) + "L" + rd(W * 0.58) + " " + rd(H * 0.2) + "Z") +
        windowAt(W * 0.06, H * 0.08, W * 0.2, H * 0.3) + windowAt(W * 0.74, H * 0.08, W * 0.2, H * 0.3) +
        floorAt(H * 0.9, W) +
        line("M" + rd(W * 0.12) + " " + rd(H * 0.6) + "H" + rd(W * 0.88) + "M" + rd(W * 0.16) + " " + rd(H * 0.6) + "V" + rd(H * 0.9) + "M" + rd(W * 0.84) + " " + rd(H * 0.6) + "V" + rd(H * 0.9)) +
        line("M" + rd(W * 0.06) + " " + rd(H * 0.9) + "V" + rd(H * 0.5) + "H" + rd(W * 0.1) + "M" + rd(W * 0.94) + " " + rd(H * 0.9) + "V" + rd(H * 0.5) + "H" + rd(W * 0.9))
    },
    office: {
      items: ["punch", "folder", "globe", "pencil", "book", "cup", "clock", "lamp", "key", "suitcase", "vase", "cat"],
      // A shelf with compartments, a window with blinds, a desk.
      bg: (W, H) => {
        let s = box(W * 0.04, H * 0.06, W * 0.3, H * 0.6);
        for (let y = 0.26; y < 0.66; y += 0.2) s += line("M" + rd(W * 0.04) + " " + rd(H * y) + "H" + rd(W * 0.34));
        s += line("M" + rd(W * 0.19) + " " + rd(H * 0.06) + "V" + rd(H * 0.66));
        s += box(W * 0.6, H * 0.06, W * 0.3, H * 0.34);
        for (let y = 0.11; y < 0.4; y += 0.05) s += line("M" + rd(W * 0.6) + " " + rd(H * y) + "H" + rd(W * 0.9));
        s += line("M" + rd(W * 0.4) + " " + rd(H * 0.66) + "H" + rd(W * 0.98) + "M" + rd(W * 0.44) + " " + rd(H * 0.66) + "V" + H + "M" + rd(W * 0.94) + " " + rd(H * 0.66) + "V" + H);
        s += box(W * 0.74, H * 0.7, W * 0.2, H * 0.26);
        return s;
      }
    },
    hall: {
      items: ["umbrella", "boot", "hat", "key", "suitcase", "lamp", "clock", "vase", "book", "dog", "ball", "cat"],
      // Two doors, a row of coat hooks, a mirror, floor tiles.
      bg: (W, H) => {
        let s = box(W * 0.05, H * 0.1, W * 0.16, H * 0.62) + '<circle cx="' + rd(W * 0.18) + '" cy="' + rd(H * 0.43) + '" r="1.6" fill="#141413"/>';
        s += box(W * 0.79, H * 0.1, W * 0.16, H * 0.62) + '<circle cx="' + rd(W * 0.82) + '" cy="' + rd(H * 0.43) + '" r="1.6" fill="#141413"/>';
        s += line("M" + rd(W * 0.3) + " " + rd(H * 0.14) + "H" + rd(W * 0.7));
        for (let x = 0.34; x < 0.7; x += 0.09) s += line("M" + rd(W * x) + " " + rd(H * 0.14) + "v" + rd(H * 0.05) + "l3 2");
        s += '<ellipse cx="' + rd(W * 0.5) + '" cy="' + rd(H * 0.42) + '" rx="' + rd(W * 0.07) + '" ry="' + rd(H * 0.12) + '" ' + L + "/>";
        s += floorAt(H * 0.72, W);
        for (let x = -W; x < W; x += W / 8) s += line("M" + rd(x) + " " + H + "L" + rd(x + H * 0.28) + " " + rd(H * 0.72) + "M" + rd(x + W / 8) + " " + rd(H * 0.72) + "L" + rd(x + W / 8 + H * 0.28) + " " + H);
        return s;
      }
    }
  };
  Object.assign(ROOMS, {
    bath: {
      items: ["rubberduck", "toothbrush", "soap", "towel", "comb", "bottle", "cup", "fish", "candle", "vase", "bucket", "clock"],
      // Tiles on the lower wall, a mirror over a basin, a towel rail, the
      // bathtub at the bottom.
      bg: (W, H) => {
        let s = "";
        for (let y = 0.45; y < 0.99; y += 0.11) s += line("M0 " + rd(H * y) + "H" + W);
        for (let x = 0; x < W; x += W / 10) s += line("M" + rd(x) + " " + rd(H * 0.45) + "V" + H);
        s += '<ellipse cx="' + rd(W * 0.3) + '" cy="' + rd(H * 0.2) + '" rx="' + rd(W * 0.07) + '" ry="' + rd(H * 0.13) + '" ' + L + "/>";
        s += line("M" + rd(W * 0.2) + " " + rd(H * 0.4) + "H" + rd(W * 0.4) + "C" + rd(W * 0.38) + " " + rd(H * 0.5) + " " + rd(W * 0.22) + " " + rd(H * 0.5) + " " + rd(W * 0.2) + " " + rd(H * 0.4));
        s += line("M" + rd(W * 0.6) + " " + rd(H * 0.18) + "H" + rd(W * 0.85));
        s += line("M" + rd(W * 0.5) + " " + rd(H * 0.72) + "H" + rd(W * 0.98) + "V" + rd(H * 0.82) + "C" + rd(W * 0.98) + " " + rd(H * 0.96) + " " + rd(W * 0.5) + " " + rd(H * 0.96) + " " + rd(W * 0.5) + " " + rd(H * 0.82) + "Z");
        return s;
      }
    },
    cellar: {
      items: ["jar", "barrel", "hammer", "bottle", "chest", "suitcase", "lantern", "bucket", "shovel", "mouse", "ball", "candle"],
      // A brick wall, stairs coming down on the left, a small barred
      // window, a shelf.
      bg: (W, H) => {
        let s = "";
        for (let r = 0, y = H * 0.06; y < H * 0.6; r++, y += H * 0.09) {
          s += line("M" + rd(W * 0.3) + " " + rd(y) + "H" + W);
          for (let x = W * 0.3 + (r % 2 ? W * 0.05 : 0); x < W; x += W * 0.1) s += line("M" + rd(x) + " " + rd(y) + "v" + rd(H * 0.09));
        }
        let st = "M0 " + rd(H * 0.2);
        for (let k = 0; k < 6; k++) st += "H" + rd(W * 0.05 * (k + 1)) + "V" + rd(H * (0.2 + 0.13 * (k + 1)));
        s += line(st);
        s += box(W * 0.6, H * 0.08, W * 0.16, H * 0.14) + line("M" + rd(W * 0.64) + " " + rd(H * 0.08) + "v" + rd(H * 0.14) + "M" + rd(W * 0.68) + " " + rd(H * 0.08) + "v" + rd(H * 0.14) + "M" + rd(W * 0.72) + " " + rd(H * 0.08) + "v" + rd(H * 0.14));
        s += floorAt(H * 0.98, W);
        return s;
      }
    },
    bedroom: {
      items: ["pillow", "slipper", "glasses", "clock", "book", "lamp", "bear", "candle", "cat", "vase", "hat", "star"],
      // A big bed, a window with curtains, a picture, a bedside table.
      bg: (W, H) => windowAt(W * 0.62, H * 0.08, W * 0.24, H * 0.3) +
        line("M" + rd(W * 0.59) + " " + rd(H * 0.06) + "H" + rd(W * 0.89) + "M" + rd(W * 0.6) + " " + rd(H * 0.06) + "C" + rd(W * 0.58) + " " + rd(H * 0.2) + " " + rd(W * 0.62) + " " + rd(H * 0.35) + " " + rd(W * 0.59) + " " + rd(H * 0.44) +
          "M" + rd(W * 0.88) + " " + rd(H * 0.06) + "C" + rd(W * 0.9) + " " + rd(H * 0.2) + " " + rd(W * 0.86) + " " + rd(H * 0.35) + " " + rd(W * 0.89) + " " + rd(H * 0.44)) +
        box(W * 0.12, H * 0.1, W * 0.2, H * 0.18) + line("M" + rd(W * 0.14) + " " + rd(H * 0.25) + "Q" + rd(W * 0.22) + " " + rd(H * 0.12) + " " + rd(W * 0.3) + " " + rd(H * 0.25)) +
        line("M" + rd(W * 0.04) + " " + H + "V" + rd(H * 0.45) + "M" + rd(W * 0.04) + " " + rd(H * 0.7) + "H" + rd(W * 0.6) + "V" + H + "M" + rd(W * 0.04) + " " + rd(H * 0.62) + "H" + rd(W * 0.58)) +
        box(W * 0.68, H * 0.66, W * 0.14, H * 0.2) + line("M" + rd(W * 0.68) + " " + rd(H * 0.76) + "H" + rd(W * 0.82)) +
        floorAt(H * 0.95, W)
    }
  });
  const ROOM_NAMES = Object.keys(ROOMS);

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

  // --- picture search ------------------------------------------------------
  const CELL = 40;
  const SEARCH = {
    easy: { cols: 6, rows: 4, targets: 5, items: 12 },
    medium: { cols: 7, rows: 5, targets: 7, items: 22 },
    hard: { cols: 8, rows: 6, targets: 10, items: 36 }
  };

  // What tells two drawings apart: type, pattern, direction (only for
  // drawings that look different mirrored).
  function lookOf(it) {
    return it.type + "|" + it.pattern + "|" + (TYPES[it.type].asym && it.mirror ? "m" : "");
  }

  // room: one of ROOM_NAMES, or "random" (or nothing) for any room. The
  // drawings all come from the room's list.
  function generateSearch(level, rng, room) {
    const random = rng || Math.random;
    const lv = SEARCH[level] ? level : "easy";
    const cfg = SEARCH[lv];
    const rm = ROOMS[room] ? room : ROOM_NAMES[Math.floor(random() * ROOM_NAMES.length)];
    const names = ROOMS[rm].items;
    const cells = shuffle([...Array(cfg.cols * cfg.rows).keys()], random).slice(0, cfg.items);
    const randomLook = () => {
      const type = names[Math.floor(random() * names.length)];
      return { type, pattern: PATTERNS[Math.floor(random() * PATTERNS.length)], mirror: TYPES[type].asym && random() < 0.5 };
    };
    // The looks to find, all different; easier levels use different types.
    const targets = [], looks = {};
    const typesLeft = shuffle(names, random);
    while (targets.length < cfg.targets) {
      let look = randomLook();
      if (lv !== "hard" && typesLeft.length) {
        look.type = typesLeft.pop();
        look.mirror = TYPES[look.type].asym && look.mirror;
      }
      const key = lookOf(look);
      if (looks[key]) continue;
      looks[key] = true;
      targets.push(look);
    }
    // The other drawings: never a look to find. On Hard half of them share
    // a type with a drawing to find.
    const items = [];
    cells.forEach((cell, i) => {
      let look;
      if (i < targets.length) look = targets[i];
      else {
        do {
          look = randomLook();
          if (lv === "hard" && random() < 0.5) {
            const t = targets[Math.floor(random() * targets.length)];
            look.type = t.type;
            look.mirror = TYPES[t.type].asym && random() < 0.5;
          }
        } while (looks[lookOf(look)]);
      }
      items.push({
        cell, type: look.type, pattern: look.pattern, mirror: look.mirror,
        dx: Math.round((random() - 0.5) * 6), dy: Math.round((random() - 0.5) * 6),
        scale: [0.7, 0.75, 0.8][Math.floor(random() * 3)]
      });
    });
    items.sort((a, b) => a.cell - b.cell);
    return { mode: "search", level: lv, room: rm, cols: cfg.cols, rows: cfg.rows, items, targets: cells.slice(0, targets.length).sort((a, b) => a - b) };
  }

  // The cell of the search picture a point falls in, or -1.
  function cellAt(p, x, y) {
    if (x < 0 || y < 0 || x >= p.cols * CELL || y >= p.rows * CELL) return -1;
    return Math.floor(y / CELL) * p.cols + Math.floor(x / CELL);
  }

  // A drawing of the search picture; in a room it stands on a white disc
  // that hides the background lines behind it.
  function searchItemSvg(p, it, prefix) {
    const cx = (it.cell % p.cols) * CELL + CELL / 2 + (it.dx || 0), cy = Math.floor(it.cell / p.cols) * CELL + CELL / 2 + (it.dy || 0);
    const s = it.scale || 0.75;
    const disc = ROOMS[p.room] ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + rd(20 * s + 1) + '" fill="#fff"/>' : "";
    return disc + '<g transform="translate(' + cx + " " + cy + ") scale(" + (it.mirror ? -s : s) + " " + s + ')">' + TYPES[it.type].draw(fillOf(it.pattern, prefix)) + "</g>";
  }

  // The search picture: frame, the room's background (older saved
  // pictures have no room and a plain white ground), the drawings.
  function searchSvg(p, prefix) {
    const W2 = p.cols * CELL, H2 = p.rows * CELL;
    return defs(prefix) + '<rect x="1" y="1" width="' + (W2 - 2) + '" height="' + (H2 - 2) + '" fill="#fff" stroke="#141413" stroke-width="2"/>' +
      (ROOMS[p.room] ? '<g class="df-room">' + ROOMS[p.room].bg(W2, H2) + "</g>" : "") +
      p.items.map((it) => searchItemSvg(p, it, prefix)).join("");
  }

  // One drawing on its own (for the list of things to find), 40 x 40.
  function lookSvg(it, prefix) {
    return defs(prefix) + '<g transform="translate(20 20) scale(' + (it.mirror ? -0.9 : 0.9) + ' 0.9)">' + TYPES[it.type].draw(fillOf(it.pattern, prefix)) + "</g>";
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

  return { W, H, COLS, ROWS, AREA, LEVELS, KINDS, PATTERNS, TYPES, TYPE_NAMES, areaAt, areaCentre, pictureB, generatePuzzle, itemSvg, pictureSvg,
    CELL, SEARCH, ROOMS, ROOM_NAMES, lookOf, generateSearch, cellAt, searchItemSvg, searchSvg, lookSvg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DifferencesCore;
}
if (typeof window !== "undefined") {
  window.DifferencesCore = DifferencesCore;
}
