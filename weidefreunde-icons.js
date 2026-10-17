// weidefreunde-icons.js
// The five farm animals and the farmer of "Pasture Friends": simple line
// drawings, black on white (no grey), made for PaperGames. Each animal is
// told apart by its outline - horns and a broad muzzle (cow), a woolly
// cloud around a black face (sheep), a round snout and folded ears (pig),
// a comb, a beak and tail feathers (hen), a long head with a mane (horse)
// - so the cards can be read without reading any word.
// viewBox 0 0 60 60. Dependency-free.

const WeideIcons = (function () {
  const K = "#141413";
  const S = 'stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  const W = 'fill="#fff" ' + S;
  const B = 'fill="' + K + '" ' + S;
  const L = 'fill="none" ' + S;
  const dot = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + K + '"/>';
  const wdot = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/>';

  const ANIMALS = ["cow", "sheep", "pig", "hen", "horse"];
  const PICS = {
    // Cow: head from the front, two curved horns, ears out to the side, a
    // black patch at one eye and a broad muzzle with two nostrils.
    cow:
      '<path d="M19 17C14 14 11 9 12 5M41 17C46 14 49 9 48 5" ' + L + ' stroke-width="3.4"/>' +
      '<path d="M16 25L5 21L7 31L17 31ZM44 25L55 21L53 31L43 31Z" ' + W + '/>' +
      '<path d="M30 12C42 12 46 22 45 32C44 42 40 50 30 50C20 50 16 42 15 32C14 22 18 12 30 12Z" ' + W + '/>' +
      '<ellipse cx="37" cy="24" rx="6.5" ry="7.5" ' + B + ' transform="rotate(20 37 24)"/>' +
      dot(23, 28, 2.2) + wdot(38, 25, 2.2) +
      '<ellipse cx="30" cy="44" rx="11" ry="8" ' + W + '/>' +
      dot(26, 44, 1.9) + dot(34, 44, 1.9),
    // Sheep: a cloud of wool around a black face with two ears.
    sheep:
      '<path d="M10 22a8 8 0 0 1 8-9a9 9 0 0 1 12-4a9 9 0 0 1 12 4a8 8 0 0 1 8 9a8 8 0 0 1-2 14a8 8 0 0 1-8 7H20a8 8 0 0 1-8-7a8 8 0 0 1-2-14Z" ' + W + '/>' +
      '<path d="M18 30L8 32L11 40L19 37ZM42 30L52 32L49 40L41 37Z" ' + B + '/>' +
      '<path d="M30 21C39 21 42 29 41 37C40 46 36 53 30 53C24 53 20 46 19 37C18 29 21 21 30 21Z" ' + B + '/>' +
      wdot(25, 33, 2.4) + wdot(35, 33, 2.4) +
      '<path d="M27.5 44L30 47L32.5 44" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    // Pig: round head, a big flat snout with two holes, folded ears.
    pig:
      '<path d="M14 24L9 9L25 15ZM46 24L51 9L35 15Z" ' + W + '/>' +
      '<circle cx="30" cy="32" r="21" ' + W + '/>' +
      dot(21, 27, 2.4) + dot(39, 27, 2.4) +
      '<ellipse cx="30" cy="38" rx="11" ry="8" ' + W + '/>' +
      '<ellipse cx="26" cy="38" rx="2" ry="3" fill="' + K + '"/><ellipse cx="34" cy="38" rx="2" ry="3" fill="' + K + '"/>',
    // Hen: from the side, comb and wattle, a beak, a wing and tail feathers.
    hen:
      '<path d="M43 36L55 14L52 30L59 24L51 42Z" ' + W + '/>' +
      '<path d="M12 34C12 24 20 20 29 22C42 24 48 34 44 43C40 51 24 52 17 46C13 43 12 39 12 34Z" ' + W + '/>' +
      '<path d="M21 36C28 33 36 36 38 43C32 46 24 44 21 36Z" ' + L + ' stroke-width="2"/>' +
      '<path d="M16 17L17 8L21 13L25 6L28 14L32 9L31 19Z" ' + B + '/>' +
      '<circle cx="23" cy="24" r="10" ' + W + '/>' +
      '<path d="M14 26L4 29L14 32Z" ' + B + '/>' +
      '<path d="M16 33C13 40 18 41 18 36Z" ' + W + '/>' +
      dot(22, 22, 2.2) +
      '<path d="M28 51L28 57M36 50L37 57M24 57H32M33 57H41" ' + L + '/>',
    // Horse: a long head in profile, a pointed ear and a black mane.
    horse:
      '<path d="M26 13L30 3L36 13Z" ' + W + '/>' +
      '<path d="M32 12C44 12 48 24 48 38L49 57H34L33 48C30 42 27 38 22 38L13 41C8 42 5 37 8 33L18 23C20 17 25 12 32 12Z" ' + W + '/>' +
      '<path d="M37 11C43 16 45 24 45 33L38 33C40 25 38 17 33 13Z" ' + B + '/>' +
      '<path d="M36 17C39 20 40 25 40 30" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' +
      dot(25, 22, 2.2) + dot(11, 36, 1.9) +
      '<path d="M18 30C21 31 23 31 26 30" ' + L + ' stroke-width="1.8"/>',
    // Farmer: a straw hat with a band above a friendly face.
    farmer:
      '<path d="M22 22C22 10 38 10 38 22Z" ' + W + '/>' +
      '<rect x="22" y="17" width="16" height="4" fill="' + K + '"/>' +
      '<ellipse cx="30" cy="23" rx="24" ry="5.5" ' + W + '/>' +
      '<path d="M16 27C16 44 22 54 30 54C38 54 44 44 44 27Z" ' + W + '/>' +
      dot(24, 36, 2.2) + dot(36, 36, 2.2) +
      '<path d="M23 44C27 49 33 49 37 44" ' + L + ' stroke-width="2.2"/>'
  };

  function nameOf(id) {
    return typeof id === "number" ? ANIMALS[id] : id;
  }

  // The drawing as an svg element; size in px (square).
  function svg(id, size) {
    const n = nameOf(id);
    const px = size || 60;
    return '<svg viewBox="0 0 60 60" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' + (PICS[n] || "") + "</svg>";
  }

  // The drawing's markup without the svg around it, to place inside another
  // svg (the die face), in the 60 x 60 box of the drawing.
  function inner(id) {
    return PICS[nameOf(id)] || "";
  }

  return { ANIMALS, svg, inner };
})();

if (typeof module !== "undefined" && module.exports) module.exports = WeideIcons;
if (typeof window !== "undefined") window.WeideIcons = WeideIcons;
