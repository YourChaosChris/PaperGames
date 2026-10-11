// cake-icons.js
// Line drawings for "Who Took the Cake?" (viewBox 0 0 40 40, black on
// white). Every animal is told apart by its outline - floppy ears, pointed
// ears, long ears, round ears, spikes - never by grey, colour or a letter,
// so they read on black-and-white e-ink and in every language.

const CakeIcons = (function () {
  const S = 'fill="none" stroke="#141413" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const B = 'fill="#141413"';
  const face = '<circle cx="16" cy="22" r="1.6" ' + B + '/><circle cx="24" cy="22" r="1.6" ' + B + '/>';
  const icons = {
    // Dog: round head, long ears hanging down at the sides (filled).
    dog: '<ellipse cx="9.5" cy="21" rx="4" ry="8.5" ' + B + ' transform="rotate(14 9.5 21)"/>' +
      '<ellipse cx="30.5" cy="21" rx="4" ry="8.5" ' + B + ' transform="rotate(-14 30.5 21)"/>' +
      '<circle cx="20" cy="22" r="10" fill="#fff" stroke="#141413" stroke-width="2.4"/>' + face +
      '<ellipse cx="20" cy="27" rx="3" ry="2.2" ' + B + '/>',
    // Cat: round head, two pointed ears, whiskers.
    cat: '<path d="M11 18L12 6L19 13M29 18L28 6L21 13" ' + S + '/>' +
      '<circle cx="20" cy="23" r="10" fill="#fff" stroke="#141413" stroke-width="2.4"/>' + face +
      '<path d="M20 26.5L18.6 25H21.4Z" ' + B + '/><path d="M6 25H14M6 29L14 27.5M34 25H26M34 29L26 27.5" ' + S + ' stroke-width="1.6"/>',
    // Rabbit: small head, two long upright ears.
    rabbit: '<ellipse cx="15" cy="11" rx="3.6" ry="9" ' + S + '/><ellipse cx="25" cy="11" rx="3.6" ry="9" ' + S + '/>' +
      '<circle cx="20" cy="27" r="9" fill="#fff" stroke="#141413" stroke-width="2.4"/>' +
      '<circle cx="16.5" cy="26" r="1.5" ' + B + '/><circle cx="23.5" cy="26" r="1.5" ' + B + '/><circle cx="20" cy="30" r="1.4" ' + B + '/>',
    // Mouse: small head, two big round ears on top (filled).
    mouse: '<circle cx="10" cy="14" r="6.5" ' + B + '/><circle cx="30" cy="14" r="6.5" ' + B + '/>' +
      '<path d="M12 22C12 16 28 16 28 22C28 28 23 33 20 35C17 33 12 28 12 22Z" fill="#fff" stroke="#141413" stroke-width="2.4"/>' +
      '<circle cx="16.5" cy="23" r="1.5" ' + B + '/><circle cx="23.5" cy="23" r="1.5" ' + B + '/><circle cx="20" cy="33" r="1.6" ' + B + '/>',
    // Hedgehog: body seen from the side with a row of black spikes.
    hedgehog: '<path d="M6 30L8 20L11 25L13 14L17 23L19 12L23 22L25 13L28 23L30 17L31 26L6 30Z" ' + B + '/>' +
      '<path d="M5 31C5 22 31 20 35 28C36 30 35 32 33 32H5Z" fill="#fff" stroke="#141413" stroke-width="2.4"/>' +
      '<circle cx="29" cy="27" r="1.4" ' + B + '/><circle cx="35.5" cy="29.5" r="1.4" ' + B + '/>' +
      '<path d="M11 32V35M24 32V35" ' + S + '/>',
    // Cake: two tiers, wavy icing, one candle with a flame.
    cake: '<path d="M20 4C22 7 22 8.5 20 9.5C18 8.5 18 7 20 4Z" ' + B + '/><path d="M20 10V15" ' + S + '/>' +
      '<rect x="11" y="15" width="18" height="8" ' + S + '/><rect x="7" y="23" width="26" height="11" ' + S + '/>' +
      '<path d="M7 27C10 30 12 25 15 28C18 31 20 25 23 28C26 31 28 25 33 28" ' + S + ' stroke-width="1.8"/>',
    // Table: wide thick top, two legs and a bar between them - drawn to
    // fill its cell, with room for the cake above the top.
    table: '<rect x="2" y="17" width="36" height="6" ' + B + '/><path d="M6.5 23V38M33.5 23V38M6.5 31H33.5" fill="none" stroke="#141413" stroke-width="3.5" stroke-linecap="round"/>',
    // Chair: seen from the side - back, seat, legs.
    chair: '<path d="M12 5V34M12 21H29V34" ' + S + ' stroke-width="3"/>',
    // Rug: a mat with a diamond and fringes at both ends.
    rug: '<rect x="9" y="11" width="22" height="18" ' + S + '/><path d="M20 14L26 20L20 26L14 20Z" ' + S + ' stroke-width="1.8"/>' +
      '<path d="M5 13H9M5 17H9M5 21H9M5 25H9M31 13H35M31 17H35M31 21H35M31 25H35" ' + S + ' stroke-width="1.6"/>',
    // Plant: big filled pot with three large leaves, filling its cell.
    plant: '<path d="M10 25H30L27 38H13Z" ' + B + '/><path d="M20 25V9M20 19C12 19 6 14 5 6C13 6 20 11 20 19M20 15C28 15 34 10 35 2C27 2 20 7 20 15" ' + S + '/>',
    // Cupboard: tall wide box with two doors and knobs, filling its cell.
    cupboard: '<rect x="5" y="2" width="30" height="36" ' + S + '/><path d="M20 2V38" ' + S + '/>' +
      '<circle cx="16.5" cy="20" r="1.8" ' + B + '/><circle cx="23.5" cy="20" r="1.8" ' + B + '/>',
    // Window: frame with a cross.
    window: '<rect x="7" y="7" width="26" height="26" ' + S + ' stroke-width="3"/><path d="M20 7V33M7 20H33" ' + S + '/>',
    // "Nothing here": a cross.
    x: '<path d="M10 10L30 30M30 10L10 30" ' + S + ' stroke-width="3.5"/>'
  };

  // The cake standing on the table: the cake drawing at 0.75 size, its
  // base on the lower edge of the table top, lines thicker so they keep
  // their weight once scaled.
  const C = 'fill="#fff" stroke="#141413" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"';
  icons.tablecake = icons.table + '<g transform="translate(5 -2.5) scale(0.75)">' +
    '<path d="M20 4C22 7 22 8.5 20 9.5C18 8.5 18 7 20 4Z" ' + B + '/><path d="M20 10V15" ' + C + '/>' +
    '<rect x="11" y="15" width="18" height="8" ' + C + '/><rect x="7" y="23" width="26" height="11" ' + C + '/>' +
    '<path d="M7 27C10 30 12 25 15 28C18 31 20 25 23 28C26 31 28 25 33 28" fill="none" stroke="#141413" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>';

  // The cats of the "Cats" theme: the same head with pointed ears, told
  // apart by a pattern drawn in solid black and white - stripes, all
  // black, plain white, patches, a collar with a bell - never by grey.
  const catEars = '<path d="M11 18L12 6L19 13M29 18L28 6L21 13" ' + S + '/>';
  const catHead = (fill) => '<circle cx="20" cy="23" r="10" fill="' + fill + '" stroke="#141413" stroke-width="2.4"/>';
  const catWhiskers = '<path d="M6 25H12M6 29L12 27.5M34 25H28M34 29L28 27.5" ' + S + ' stroke-width="1.6"/>';
  const catFace = (eye) => '<circle cx="16" cy="22" r="1.8" fill="' + eye + '"/><circle cx="24" cy="22" r="1.8" fill="' + eye + '"/>' +
    '<path d="M20 26.5L18.6 25H21.4Z" fill="' + eye + '"/>';
  // Tiger: three thick stripes on the forehead and one on each side of the chin.
  icons.cattiger = catEars + catHead("#fff") + catWhiskers +
    '<path d="M20 13.5V18.5M15.5 14.8L16.8 18.8M24.5 14.8L23.2 18.8M14 29.5L16.5 28M26 29.5L23.5 28" ' + S + ' stroke-width="2.8"/>' + catFace("#141413");
  // Luna: all black, white eyes and nose; filled ears.
  icons.catluna = '<path d="M11 18L12 6L19 13Z M29 18L28 6L21 13Z" ' + B + ' stroke="#141413" stroke-width="2.4" stroke-linejoin="round"/>' +
    catHead("#141413") + catWhiskers + catFace("#fff");
  // Mimi: plain white with a big bow between the ears.
  icons.catmimi = catEars + catHead("#fff") + catWhiskers + catFace("#141413") +
    '<path d="M20 13L12 8V18Z M20 13L28 8V18Z" ' + B + '/><circle cx="20" cy="13" r="2.6" ' + B + '/>';
  // Felix: a black patch over the left eye and one on the right cheek.
  icons.catfelix = catEars + catHead("#fff") + catWhiskers +
    '<path d="M11.2 19C12 15 15 13.5 18.5 14.5C19.5 18 18 21.5 13 22.5Z" ' + B + '/><circle cx="25.5" cy="28" r="2.6" ' + B + '/>' +
    '<circle cx="16" cy="19.5" r="1.8" fill="#fff"/><circle cx="24" cy="22" r="1.8" ' + B + '/><path d="M20 26.5L18.6 25H21.4Z" ' + B + '/>';
  // Max: plain head with a thick collar and a round bell underneath.
  icons.catmax = catEars + catHead("#fff") + catWhiskers + catFace("#141413") +
    '<path d="M12 32.5C16 35 24 35 28 32.5" fill="none" stroke="#141413" stroke-width="3.6" stroke-linecap="round"/>' +
    '<circle cx="20" cy="36.5" r="2.6" fill="#fff" stroke="#141413" stroke-width="2"/>';
  // Fish (what the cats are after instead of the cake): body, tail, eye.
  icons.fish = '<path d="M6 20C11 11 23 10 29 20C23 30 11 29 6 20Z" fill="#fff" stroke="#141413" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M29 20L36 13V27Z" ' + B + '/><circle cx="12.5" cy="18.5" r="1.8" ' + B + '/>' +
    '<path d="M17 15C19 18 19 22 17 25M21.5 14.5C23.5 18 23.5 22 21.5 25.5" ' + S + ' stroke-width="1.6"/>';
  // The fish lying on the table.
  icons.tablefish = icons.table + '<g transform="translate(4 -6.5) scale(0.8)">' +
    '<path d="M6 20C11 11 23 10 29 20C23 30 11 29 6 20Z" fill="#fff" stroke="#141413" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M29 20L36 13V27Z" ' + B + '/><circle cx="12.5" cy="18.5" r="2" ' + B + '/></g>';

  function svg(name, cls) {
    return '<svg class="' + (cls || "cake-icon") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + (icons[name] || "") + "</svg>";
  }

  return { icons, svg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CakeIcons;
}
if (typeof window !== "undefined") {
  window.CakeIcons = CakeIcons;
}
