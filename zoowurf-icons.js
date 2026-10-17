// zoowurf-icons.js
// The five zoo animals and the paw of "Zoo Toss": simple line drawings,
// black on white (no grey), made for PaperGames. Each animal is told apart
// by its outline - a spiky black mane around a white face (lion), two huge
// ears and a trunk (elephant), two knobbed horns, spots and a long neck
// (giraffe), a black cap with a white face mask and round ears (monkey),
// a black body with a white belly and a beak (penguin) - so the cards can
// be read without reading any word. The paw (a big pad and four toes) is
// the joker of the die.
// viewBox 0 0 60 60. Dependency-free.

const ZooIcons = (function () {
  const K = "#141413";
  const S = 'stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  const W = 'fill="#fff" ' + S;
  const B = 'fill="' + K + '" ' + S;
  const L = 'fill="none" ' + S;
  const dot = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + K + '"/>';
  const wdot = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/>';

  // A spiky mane: points alternate between an outer and an inner radius.
  function mane(cx, cy, rOut, rIn, n) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / n;
      const r = i % 2 ? rIn : rOut;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(" ") + '" ' + B + "/>";
  }

  const ANIMALS = ["lion", "elephant", "giraffe", "monkey", "penguin"];
  const PICS = {
    // Lion: black spiky mane, white face, small ears, a black nose.
    lion:
      mane(30, 31, 28, 21, 11) +
      '<circle cx="19" cy="14" r="5" ' + W + '/><circle cx="41" cy="14" r="5" ' + W + '/>' +
      '<ellipse cx="30" cy="32" rx="15" ry="16" ' + W + '/>' +
      dot(24, 28, 2.2) + dot(36, 28, 2.2) +
      '<path d="M26 35L34 35L30 40Z" fill="' + K + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M30 40L30 43M24 44C27 47 33 47 36 44" ' + L + ' stroke-width="2"/>',
    // Elephant: two huge round ears, a round head, a long trunk, tusks.
    elephant:
      '<circle cx="12" cy="24" r="12" ' + W + '/><circle cx="48" cy="24" r="12" ' + W + '/>' +
      '<circle cx="12" cy="24" r="6" ' + L + ' stroke-width="1.8"/><circle cx="48" cy="24" r="6" ' + L + ' stroke-width="1.8"/>' +
      '<path d="M30 8C41 8 45 17 44 27C44 33 42 37 40 40L20 40C18 37 16 33 16 27C15 17 19 8 30 8Z" ' + W + '/>' +
      '<path d="M25 33L25 52C25 57 35 57 35 52L35 33" ' + W + '/>' +
      '<path d="M26 44H34M26 49H34" ' + L + ' stroke-width="1.6"/>' +
      dot(23, 24, 2.2) + dot(37, 24, 2.2) +
      '<path d="M20 38L16 48L22 44Z M40 38L44 48L38 44Z" ' + W + ' stroke-width="1.8"/>',
    // Giraffe: knobbed horns, a long head with a black muzzle, spots on a
    // long neck.
    giraffe:
      '<path d="M22 14L21 4M38 14L39 4" ' + L + '/><circle cx="21" cy="4" r="3" fill="' + K + '"/><circle cx="39" cy="4" r="3" fill="' + K + '"/>' +
      '<path d="M16 22L6 18L8 27L17 27ZM44 22L54 18L52 27L43 27Z" ' + W + '/>' +
      '<path d="M22 36L20 58H40L38 36Z" ' + W + '/>' +
      '<path d="M30 11C40 11 42 19 41 28C40 36 37 40 30 40C23 40 20 36 19 28C18 19 20 11 30 11Z" ' + W + '/>' +
      '<ellipse cx="30" cy="35" rx="8" ry="5.5" ' + B + '/>' +
      wdot(27, 35, 1.4) + wdot(33, 35, 1.4) +
      dot(24, 22, 2.2) + dot(36, 22, 2.2) +
      dot(30, 17, 2.4) + dot(25, 49, 2.4) + dot(34, 53, 2.4) + dot(31, 45, 2),
    // Monkey: round ears, a black cap, a white face mask in two lobes.
    monkey:
      '<circle cx="9" cy="32" r="8" ' + W + '/><circle cx="51" cy="32" r="8" ' + W + '/>' +
      '<circle cx="9" cy="32" r="3.5" fill="' + K + '"/><circle cx="51" cy="32" r="3.5" fill="' + K + '"/>' +
      '<circle cx="30" cy="30" r="21" ' + B + '/>' +
      '<path d="M30 25C27 20 17 21 17 30C17 37 22 40 24 42C25 48 35 48 36 42C38 40 43 37 43 30C43 21 33 20 30 25Z" fill="#fff" stroke="none"/>' +
      dot(24, 29, 2.3) + dot(36, 29, 2.3) +
      '<path d="M27 37L27.5 38.5M33 37L32.5 38.5" ' + L + ' stroke-width="2"/>' +
      '<path d="M24 42C27 46 33 46 36 42" ' + L + ' stroke-width="2.2"/>',
    // Penguin: black body, white belly, white eye patches, a beak, flippers.
    penguin:
      '<path d="M13 30C7 34 6 42 8 47C13 44 16 38 17 33Z M47 30C53 34 54 42 52 47C47 44 44 38 43 33Z" ' + B + '/>' +
      '<path d="M30 4C42 4 47 17 47 32C47 46 41 55 30 55C19 55 13 46 13 32C13 17 18 4 30 4Z" ' + B + '/>' +
      '<path d="M30 24C39 24 41 34 40 42C39 50 35 53 30 53C25 53 21 50 20 42C19 34 21 24 30 24Z" fill="#fff" stroke="none"/>' +
      '<circle cx="23" cy="17" r="5" fill="#fff"/><circle cx="37" cy="17" r="5" fill="#fff"/>' +
      dot(24, 17, 2.2) + dot(36, 17, 2.2) +
      '<path d="M25 24L35 24L30 32Z" ' + W + ' stroke-width="2"/>' +
      '<path d="M21 55L16 58H26ZM39 55L34 58H44Z" ' + W + ' stroke-width="2"/>',
    // Paw: one big pad and four toes - the joker.
    paw:
      '<path d="M30 28C40 28 49 37 49 45C49 52 41 53 36 51C32 49 28 49 24 51C19 53 11 52 11 45C11 37 20 28 30 28Z" ' + B + '/>' +
      '<ellipse cx="11" cy="28" rx="5.5" ry="7.5" ' + B + ' transform="rotate(-20 11 28)"/>' +
      '<ellipse cx="23" cy="15" rx="5.5" ry="8" ' + B + ' transform="rotate(-8 23 15)"/>' +
      '<ellipse cx="37" cy="15" rx="5.5" ry="8" ' + B + ' transform="rotate(8 37 15)"/>' +
      '<ellipse cx="49" cy="28" rx="5.5" ry="7.5" ' + B + ' transform="rotate(20 49 28)"/>'
  };

  function nameOf(id) {
    return typeof id === "number" ? (id < ANIMALS.length ? ANIMALS[id] : "paw") : id;
  }

  // The drawing as an svg element; size in px (square).
  function svg(id, size) {
    const px = size || 60;
    return '<svg viewBox="0 0 60 60" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' + (PICS[nameOf(id)] || "") + "</svg>";
  }

  // The drawing's markup without the svg around it, to place inside another
  // svg (the die face), in the 60 x 60 box of the drawing.
  function inner(id) {
    return PICS[nameOf(id)] || "";
  }

  return { ANIMALS, svg, inner };
})();

if (typeof module !== "undefined" && module.exports) module.exports = ZooIcons;
if (typeof window !== "undefined") window.ZooIcons = ZooIcons;
