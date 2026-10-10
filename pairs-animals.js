// pairs-animals.js
// The "Animals" card faces for Pairs: 18 line drawings in the style of
// cake-icons.js (viewBox 0 0 40 40, black on white). The first five are
// the animals of "Who Took the Cake?", taken from CakeIcons unchanged;
// the other thirteen are drawn here. Every animal is told apart by its
// outline - ears, trunk, shell, wings, mane, neck - never by grey, colour
// or a letter, so they read on black-and-white e-ink and in every
// language. Animals that look alike (rabbit and hare, duck and goose,
// bird and duck) are left out on purpose.

const PairsAnimals = (function () {
  const S = 'fill="none" stroke="#141413" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const B = 'fill="#141413"';
  const W = 'fill="#fff" stroke="#141413" stroke-width="2.4" stroke-linejoin="round"';
  const own = {
    // Owl: egg-shaped body, ear tufts, two big round eyes, small beak.
    owl: '<path d="M10 12L11 4L17 9M30 12L29 4L23 9" ' + S + '/>' +
      '<ellipse cx="20" cy="22" rx="12" ry="14" ' + W + '/>' +
      '<circle cx="15" cy="17" r="4.8" ' + W + '/><circle cx="25" cy="17" r="4.8" ' + W + '/>' +
      '<circle cx="15" cy="17" r="2" ' + B + '/><circle cx="25" cy="17" r="2" ' + B + '/>' +
      '<path d="M18.3 22.5H21.7L20 26Z" ' + B + '/>' +
      '<path d="M14 29.5L16.5 31.5L19 29.5M21 29.5L23.5 31.5L26 29.5" ' + S + ' stroke-width="1.8"/>',
    // Fish: seen from the side, pointed body, filled tail fin.
    fish: '<path d="M28.5 20L37 11.5V28.5Z" ' + B + '/>' +
      '<path d="M4 20C10 9 24 9 30 20C24 31 10 31 4 20Z" ' + W + '/>' +
      '<circle cx="11" cy="18" r="1.9" ' + B + '/>' +
      '<path d="M15.5 14C17.5 17.5 17.5 22.5 15.5 26" ' + S + ' stroke-width="1.8"/>',
    // Turtle: domed shell with a hexagon on it, head and two legs.
    turtle: '<circle cx="33.5" cy="23.5" r="3.6" ' + W + '/>' +
      '<path d="M9 27V33M24 27V33" ' + S + ' stroke-width="3.2"/>' +
      '<path d="M4 27C4 11 31 11 31 27Z" ' + W + '/>' +
      '<path d="M13 22L15.5 17H20.5L23 22L20.5 27H15.5Z" ' + S + ' stroke-width="1.8"/>',
    // Snail: spiral shell on a long foot, two feelers.
    snail: '<path d="M4 32H33C35.5 32 36.5 29.5 34 28.5M4 32C4 27 6 23 9 21M9 21L6 12M9 21L12 12" ' + S + '/>' +
      '<circle cx="6" cy="12" r="1.6" ' + B + '/><circle cx="12" cy="12" r="1.6" ' + B + '/>' +
      '<circle cx="22" cy="20" r="10" ' + W + '/>' +
      '<path d="M22 20m0 -2a2 2 0 1 1 -2 2a4 4 0 0 1 4 -4a6 6 0 0 1 6 6a8 8 0 0 1 -8 8" ' + S + ' stroke-width="1.8"/>',
    // Duck: seen from the side, round head with a flat filled bill, tail up.
    duck: '<path d="M32 25L36 19" ' + S + '/>' +
      '<ellipse cx="20" cy="27" rx="13" ry="7" ' + W + '/>' +
      '<circle cx="13" cy="15" r="6" ' + W + '/>' +
      '<path d="M7.5 14L1.5 16.5L7.5 18Z" ' + B + '/><circle cx="12" cy="13.5" r="1.4" ' + B + '/>' +
      '<path d="M17 26C21 30 27 29.5 30 25.5" ' + S + ' stroke-width="1.8"/>',
    // Frog: wide flat head, eyes bulging on top, wide smile, front legs.
    frog: '<path d="M9 30L6 36M31 30L34 36" ' + S + '/>' +
      '<path d="M5 25C5 15 35 15 35 25C35 32 5 32 5 25Z" ' + W + '/>' +
      '<circle cx="12" cy="14" r="5" ' + W + '/><circle cx="28" cy="14" r="5" ' + W + '/>' +
      '<circle cx="12" cy="14" r="2.2" ' + B + '/><circle cx="28" cy="14" r="2.2" ' + B + '/>' +
      '<path d="M11 24.5C16 28.5 24 28.5 29 24.5" ' + S + '/>' +
      '<circle cx="18" cy="20.5" r="1" ' + B + '/><circle cx="22" cy="20.5" r="1" ' + B + '/>',
    // Pig: round face, filled triangle ears, big snout with two nostrils.
    pig: '<path d="M10 15L8.5 5L17 11Z M30 15L31.5 5L23 11Z" ' + B + '/>' +
      '<circle cx="20" cy="22" r="11" ' + W + '/>' +
      '<circle cx="15.5" cy="18.5" r="1.5" ' + B + '/><circle cx="24.5" cy="18.5" r="1.5" ' + B + '/>' +
      '<ellipse cx="20" cy="26" rx="5.5" ry="4" ' + W + '/>' +
      '<ellipse cx="18" cy="26" rx="1.2" ry="1.6" ' + B + '/><ellipse cx="22" cy="26" rx="1.2" ry="1.6" ' + B + '/>',
    // Elephant: big flat ears at the sides, head, long curled trunk.
    elephant: '<ellipse cx="8.5" cy="17" rx="6.5" ry="9" ' + W + '/><ellipse cx="31.5" cy="17" rx="6.5" ry="9" ' + W + '/>' +
      '<circle cx="20" cy="15" r="9" ' + W + '/>' +
      '<circle cx="16.5" cy="13" r="1.4" ' + B + '/><circle cx="23.5" cy="13" r="1.4" ' + B + '/>' +
      '<path d="M20 21C20 29 20 33 24 35C26 36 27 34 26 33" ' + S + ' stroke-width="3.6"/>',
    // Butterfly: four wings with a dot in each upper wing, thin body, feelers.
    butterfly: '<path d="M19.5 12L16 5M20.5 12L24 5" ' + S + ' stroke-width="1.8"/>' +
      '<path d="M20 19C13 5 3 7 5 16C6 21 13 21 20 20.5Z M20 19C27 5 37 7 35 16C34 21 27 21 20 20.5Z" ' + W + '/>' +
      '<path d="M20 21.5C12 22 8 29 11.5 32.5C15 35.5 19 29 20 23Z M20 21.5C28 22 32 29 28.5 32.5C25 35.5 21 29 20 23Z" ' + W + '/>' +
      '<circle cx="11.5" cy="14" r="2.2" ' + B + '/><circle cx="28.5" cy="14" r="2.2" ' + B + '/>' +
      '<ellipse cx="20" cy="21" rx="1.8" ry="9.5" ' + B + '/>',
    // Bee: striped body, filled head, two wings on top, sting.
    bee: '<ellipse cx="17" cy="12" rx="3.6" ry="6" ' + W + ' transform="rotate(-20 17 12)"/>' +
      '<ellipse cx="25" cy="12" rx="3.6" ry="6" ' + W + ' transform="rotate(20 25 12)"/>' +
      '<path d="M31 24H36" ' + S + '/>' +
      '<ellipse cx="21" cy="24" rx="10" ry="7" ' + W + '/>' +
      '<path d="M18 17.6V30.4M24 17.6V30.4" ' + S + ' stroke-width="3.2" stroke-linecap="butt"/>' +
      '<circle cx="9" cy="23" r="4.2" ' + B + '/>',
    // Lion: face inside a spiky filled mane.
    lion: '<polygon points="20.0,5.5 22.0,9.7 25.3,6.4 25.8,11.0 30.0,9.1 28.8,13.6 33.4,13.2 30.8,17.1 35.3,18.3 31.5,21.0 35.3,23.7 30.8,24.9 33.4,28.7 28.8,28.4 30.0,32.9 25.8,31.0 25.3,35.6 22.0,32.3 20.0,36.5 18.0,32.3 14.7,35.6 14.2,31.0 10.0,32.9 11.2,28.4 6.6,28.8 9.2,24.9 4.7,23.7 8.5,21.0 4.7,18.3 9.2,17.1 6.6,13.3 11.2,13.6 10.0,9.1 14.3,11.0 14.7,6.4 18.0,9.7" ' + B + '/>' +
      '<circle cx="20" cy="21" r="10.5" ' + W + '/>' +
      '<circle cx="16" cy="19" r="1.7" ' + B + '/><circle cx="24" cy="19" r="1.7" ' + B + '/>' +
      '<path d="M17.5 23H22.5L20 26Z" ' + B + '/><path d="M20 26V27.5M16.5 28C18.5 29.5 21.5 29.5 23.5 28" ' + S + ' stroke-width="1.6"/>',
    // Giraffe: seen from the side - long neck, small head with horns, spots.
    giraffe: '<path d="M10 27V37M22 27V37M7.5 23L4 29" ' + S + ' stroke-width="2.8"/>' +
      '<path d="M14 20L22 8M20.5 21L28 10" ' + S + '/>' +
      '<ellipse cx="16" cy="24" rx="9.5" ry="5.5" ' + W + '/>' +
      '<ellipse cx="26" cy="8" rx="5.5" ry="3.6" ' + W + ' transform="rotate(15 26 8)"/>' +
      '<path d="M24 4.5V1.8M27.5 5V2.3" ' + S + ' stroke-width="1.8"/>' +
      '<circle cx="27.5" cy="7.5" r="1.1" ' + B + '/>' +
      '<circle cx="12" cy="23" r="1.8" ' + B + '/><circle cx="18" cy="25.5" r="1.8" ' + B + '/><circle cx="20.5" cy="14.5" r="1.4" ' + B + '/>',
    // Sheep: woolly cloud of a body, black face, four short legs.
    sheep: '<path d="M14 28V36M19 29V36M25 29V36M29 28V36" ' + S + ' stroke-width="2.8"/>' +
      '<path d="M32.3 24.5A3.5 3.5 0 0 1 28.2 28.9A4.4 4.4 0 0 1 20.7 30.5A4.4 4.4 0 0 1 13.4 28.6A3.4 3.4 0 0 1 9.6 24.1A3.1 3.1 0 0 1 11.2 19.1A4 4 0 0 1 17.3 15.9A4.6 4.6 0 0 1 25.2 16A3.9 3.9 0 0 1 31.1 19.4A3 3 0 0 1 32.3 24.5Z" ' + W + '/>' +
      '<ellipse cx="7.5" cy="19.5" rx="4" ry="5.5" ' + B + '/>' +
      '<path d="M4.5 16.5L1.5 15" ' + S + '/>' +
      '<circle cx="6.5" cy="18.5" r="1" fill="#fff"/>'
  };

  // Card order: index = card value in PairsCore (0..17).
  const NAMES = ["dog", "cat", "rabbit", "mouse", "hedgehog", "owl", "fish", "turtle", "snail",
    "duck", "frog", "pig", "elephant", "butterfly", "bee", "lion", "giraffe", "sheep"];

  function body(name) {
    if (own[name]) return own[name];
    return typeof CakeIcons !== "undefined" && CakeIcons.icons[name] ? CakeIcons.icons[name] : "";
  }

  function svg(n, cls) {
    return '<svg class="' + (cls || "pairs-symbol") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + body(NAMES[n]) + "</svg>";
  }

  return { NAMES, own, svg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PairsAnimals;
}
if (typeof window !== "undefined") {
  window.PairsAnimals = PairsAnimals;
}
