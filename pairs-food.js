// pairs-food.js
// The "Fruit and vegetables" card faces for Pairs: 18 line drawings in
// the style of pairs-animals.js (viewBox 0 0 40 40, black on white).
// Each one is told apart by its outline - stem and leaf, crown, wedge,
// pod, ribs, florets - never by colour, so they read on black-and-white
// e-ink. Look-alikes are left out on purpose: no lime next to the lemon
// (the lemon is a slice), no tomato next to the apple, no cucumber next
// to the banana.

const PairsFood = (function () {
  const S = 'fill="none" stroke="#141413" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const T = 'fill="none" stroke="#141413" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const B = 'fill="#141413"';
  const W = 'fill="#fff" stroke="#141413" stroke-width="2.4" stroke-linejoin="round"';
  const icons = {
    // Apple: round body with a dent on top, stem and one filled leaf.
    apple: '<path d="M20 12C14 8 6 11 6 21C6 30 12 36 20 34C28 36 34 30 34 21C34 11 26 8 20 12Z" ' + W + '/>' +
      '<path d="M20 12L21 5" ' + S + '/><path d="M21 8C24 4 29 4 31 6C28 9 24 9 21 8Z" ' + B + '/>',
    // Pear: narrow top, wide bottom, short stem.
    pear: '<path d="M20 8C17 8 16 11 16 14C16 17 9 20 9 27C9 33 14 36 20 36C26 36 31 33 31 27C31 20 24 17 24 14C24 11 23 8 20 8Z" ' + W + '/>' +
      '<path d="M20 8L19 3" ' + S + '/>',
    // Banana: a curved crescent with a stalk at the top.
    banana: '<path d="M8 10C6 22 14 33 30 32C34 32 35 30 33 29C20 28 14 20 13 10C13 8 9 8 8 10Z" ' + W + '/>' +
      '<path d="M9 9L9.5 5H12L12 9" ' + S + '/><path d="M11 13C12 21 17 27 26 30" ' + T + '/>',
    // Cherries: two filled balls on long stems that meet at a leaf.
    cherries: '<path d="M12 25C14 16 18 9 23 6M28 24C27 16 25 10 23 6" ' + S + '/>' +
      '<ellipse cx="28" cy="6" rx="5" ry="2.4" ' + B + ' transform="rotate(-20 28 6)"/>' +
      '<circle cx="12" cy="30" r="5.5" ' + B + '/><circle cx="28" cy="29" r="5.5" ' + B + '/>',
    // Strawberry: heart-like berry with seeds, filled leaf crown.
    strawberry: '<path d="M20 36C10 30 6 22 8 16C10 12 30 12 32 16C34 22 30 30 20 36Z" ' + W + '/>' +
      '<polygon points="9,15 14,9.5 17,13 20,7 23,13 26,9.5 31,15 20,17.5" ' + B + '/>' +
      '<circle cx="14" cy="21" r="1.1" ' + B + '/><circle cx="20" cy="22" r="1.1" ' + B + '/><circle cx="26" cy="21" r="1.1" ' + B + '/>' +
      '<circle cx="17" cy="27" r="1.1" ' + B + '/><circle cx="23" cy="27" r="1.1" ' + B + '/><circle cx="20" cy="31.5" r="1.1" ' + B + '/>',
    // Grapes: a bunch of small round berries hanging from a stalk.
    grapes: '<path d="M20 10L21 3M21 6C24 3 28 3 30 5" ' + S + '/>' +
      '<circle cx="13" cy="14" r="4.2" ' + W + '/><circle cx="21" cy="14" r="4.2" ' + W + '/><circle cx="29" cy="14" r="4.2" ' + W + '/>' +
      '<circle cx="17" cy="21" r="4.2" ' + W + '/><circle cx="25" cy="21" r="4.2" ' + W + '/>' +
      '<circle cx="21" cy="28" r="4.2" ' + W + '/><circle cx="21" cy="35" r="3.6" ' + W + '/>',
    // Lemon: a round slice with segments, like a wheel.
    lemon: '<circle cx="20" cy="20" r="15" ' + W + '/><circle cx="20" cy="20" r="11.5" ' + T + '/>' +
      '<path d="M20 9V31M9 20H31M12.2 12.2L27.8 27.8M27.8 12.2L12.2 27.8" ' + T + '/>' +
      '<circle cx="20" cy="20" r="2" ' + B + '/>',
    // Pineapple: oval with a criss-cross pattern under a tall filled crown.
    pineapple: '<polygon points="12,18 14.5,10 17,15 20,3 23,15 25.5,10 28,18" ' + B + '/>' +
      '<ellipse cx="20" cy="27" rx="9" ry="10" ' + W + '/>' +
      '<path d="M13 21L25 35M17 18.5L28.5 31M12 27L20 36.5M15 35L27.5 20M12.5 30L24 18M20 17.5L29 27.5" ' + T + '/>',
    // Watermelon: a half-round slice with rind line and filled seeds.
    watermelon: '<path d="M3 13H37A17 17 0 0 1 3 13Z" ' + W + '/><path d="M7 13A13 13 0 0 0 33 13" ' + T + '/>' +
      '<ellipse cx="14" cy="17" rx="1.2" ry="2" ' + B + '/><ellipse cx="20" cy="19" rx="1.2" ry="2" ' + B + '/>' +
      '<ellipse cx="26" cy="17" rx="1.2" ry="2" ' + B + '/><ellipse cx="17" cy="23" rx="1.2" ry="2" ' + B + '/><ellipse cx="23" cy="23" rx="1.2" ry="2" ' + B + '/>',
    // Carrot: long pointed root with rings and a bunch of leaves.
    carrot: '<path d="M27 13L30 3M29 15L37 7M31 17L38 15" ' + S + '/>' +
      '<path d="M22 12C26 12 31 16 31 20L10 35C8 36 6 35 7 33Z" ' + W + '/>' +
      '<path d="M17 20L21 23M13 26L16 28.5M21 15.5L24 18" ' + T + '/>',
    // Mushroom: dome cap with filled spots on a thick stem.
    mushroom: '<path d="M15 22L14 34H26L25 22" ' + W + '/>' +
      '<path d="M4 22C4 10 36 10 36 22Z" ' + W + '/>' +
      '<circle cx="13" cy="17" r="2.2" ' + B + '/><circle cx="21" cy="14" r="2.2" ' + B + '/><circle cx="28" cy="18" r="2" ' + B + '/>',
    // Corn: cob with a kernel grid between two filled husk leaves.
    corn: '<ellipse cx="20" cy="18" rx="6.5" ry="13" ' + W + '/>' +
      '<path d="M16 10H24M14.5 15H25.5M14 20H26M14.5 25H25.5M20 6V30M16.5 8V28.5M23.5 8V28.5" ' + T + '/>' +
      '<path d="M20 37C10 33 7 24 9 15C12 23 15 29 20 32Z M20 37C30 33 33 24 31 15C28 23 25 29 20 32Z" ' + B + '/>',
    // Broccoli: a filled cloud of florets on a thick white stalk.
    broccoli: '<path d="M15 23L16 35H24L25 23" ' + W + '/>' +
      '<circle cx="12" cy="18" r="6.5" ' + B + '/><circle cx="20" cy="12" r="7" ' + B + '/><circle cx="28" cy="18" r="6.5" ' + B + '/><circle cx="20" cy="20" r="6" ' + B + '/>' +
      '<path d="M20 35V27M20 29L17 25M20 29L23 25" fill="none" stroke="#141413" stroke-width="1.6" stroke-linecap="round"/>',
    // Pea pod: open pod with three filled peas and a curled stem.
    peapod: '<path d="M4 22C10 12 30 12 36 18C30 28 10 30 4 22Z" ' + W + '/>' +
      '<circle cx="12" cy="21" r="3.4" ' + B + '/><circle cx="19.5" cy="20.2" r="3.4" ' + B + '/><circle cx="27" cy="19.4" r="3.4" ' + B + '/>' +
      '<path d="M36 18C38.5 14 37 10.5 33 11.5" ' + S + '/>',
    // Pumpkin: wide and round with ribs and a filled stalk.
    pumpkin: '<ellipse cx="20" cy="24" rx="16" ry="11.5" ' + W + '/>' +
      '<path d="M20 12.5C13 15 13 33 20 35.5C27 33 27 15 20 12.5ZM12 13.5C5 18 5 30 12 34.5M28 13.5C35 18 35 30 28 34.5" ' + T + '/>' +
      '<path d="M18 13L19 5H23L22 13Z" ' + B + '/>',
    // Bell pepper: blocky body with lobes at the bottom and a bent stalk.
    pepper: '<path d="M20 11C20 6 23 4 27 4" ' + S + ' stroke-width="3"/>' +
      '<path d="M10 14C10 10 30 10 30 14C33 22 32 32 27 35C24 36 22 33 20 35C18 33 16 36 13 35C8 32 7 22 10 14Z" ' + W + '/>' +
      '<path d="M16.5 14C15.5 22 15.5 28 16.5 33M23.5 14C24.5 22 24.5 28 23.5 33" ' + T + '/>',
    // Onion: bulb with a pointed top, curved lines and little roots.
    onion: '<path d="M20 4C22 11 33 15 33 24C33 31 27 35 20 35C13 35 7 31 7 24C7 15 18 11 20 4Z" ' + W + '/>' +
      '<path d="M20 8C14 15 13 27 17 35M20 8C26 15 27 27 23 35" ' + T + '/>' +
      '<path d="M16 35L14 38.5M20 35V38.5M24 35L26 38.5" ' + S + ' stroke-width="1.8"/>',
    // Potato: lumpy blob with small eyes.
    potato: '<path d="M6 22C5 14 13 8 22 9C31 10 36 16 35 23C34 31 26 34 18 33C11 32 7 28 6 22Z" ' + W + '/>' +
      '<path d="M13 16L15.5 17M24 14L25.5 16M28 25L25.5 26M15 26.5L17.5 26" ' + T + '/>' +
      '<circle cx="21" cy="21" r="1.2" ' + B + '/><circle cx="10.5" cy="21.5" r="1.1" ' + B + '/><circle cx="30" cy="19" r="1.1" ' + B + '/>'
  };

  // Card order: index = card value in PairsCore (0..17).
  const NAMES = ["apple", "pear", "banana", "cherries", "strawberry", "grapes", "lemon", "pineapple", "watermelon",
    "carrot", "mushroom", "corn", "broccoli", "peapod", "pumpkin", "pepper", "onion", "potato"];
  // English names for screen readers; I18n translates them through the
  // msg_pairs_food_* keys.
  const LABELS = {
    apple: "Apple", pear: "Pear", banana: "Banana", cherries: "Cherries", strawberry: "Strawberry", grapes: "Grapes",
    lemon: "Lemon", pineapple: "Pineapple", watermelon: "Watermelon", carrot: "Carrot", mushroom: "Mushroom", corn: "Corn",
    broccoli: "Broccoli", peapod: "Pea pod", pumpkin: "Pumpkin", pepper: "Bell pepper", onion: "Onion", potato: "Potato"
  };

  function svg(n, cls) {
    return '<svg class="' + (cls || "pairs-symbol") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + (icons[NAMES[n]] || "") + "</svg>";
  }

  return { NAMES, LABELS, icons, svg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PairsFood;
}
if (typeof window !== "undefined") {
  window.PairsFood = PairsFood;
}
