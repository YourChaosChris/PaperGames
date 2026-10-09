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
    // Table: thick top, two legs.
    table: '<rect x="5" y="14" width="30" height="5" ' + B + '/><path d="M9 19V33M31 19V33" ' + S + ' stroke-width="3"/>',
    // Chair: seen from the side - back, seat, legs.
    chair: '<path d="M12 5V34M12 21H29V34" ' + S + ' stroke-width="3"/>',
    // Rug: a mat with a diamond and fringes at both ends.
    rug: '<rect x="9" y="11" width="22" height="18" ' + S + '/><path d="M20 14L26 20L20 26L14 20Z" ' + S + ' stroke-width="1.8"/>' +
      '<path d="M5 13H9M5 17H9M5 21H9M5 25H9M31 13H35M31 17H35M31 21H35M31 25H35" ' + S + ' stroke-width="1.6"/>',
    // Plant: filled pot with three leaves.
    plant: '<path d="M13 25H27L25 35H15Z" ' + B + '/><path d="M20 25V12M20 18C14 18 11 14 11 9C17 9 20 13 20 18M20 15C26 15 29 11 29 6C23 6 20 10 20 15" ' + S + '/>',
    // Cupboard: tall box with two doors and knobs.
    cupboard: '<rect x="10" y="4" width="20" height="32" ' + S + '/><path d="M20 4V36" ' + S + '/>' +
      '<circle cx="17.5" cy="20" r="1.5" ' + B + '/><circle cx="22.5" cy="20" r="1.5" ' + B + '/>',
    // Window: frame with a cross.
    window: '<rect x="7" y="7" width="26" height="26" ' + S + ' stroke-width="3"/><path d="M20 7V33M7 20H33" ' + S + '/>',
    // "Nothing here": a cross.
    x: '<path d="M10 10L30 30M30 10L10 30" ' + S + ' stroke-width="3.5"/>'
  };

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
