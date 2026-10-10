// german-cards.js
// The German-suited card faces for Skat and Schafkopf: Acorns (Eichel),
// Leaves (Grün), Hearts (Rot) and Bells (Schellen), drawn by PaperGames
// as small SVGs. The suits differ by shape, so they work in black and
// white: an acorn with a dark cap, a dark leaf with a white vein, a dark
// heart, and a round bell with a dark band.
//
// Cards use the same objects as the French faces ({ rank, suit } with
// suit C/S/H/D): C = Acorns, S = Leaves, H = Hearts, D = Bells. Ranks:
// 14 Ace (A), 13 King (K), 12 Ober (O), 11 Unter (U), 10 to 7.

const GermanCards = (function () {
  const MARKUP = {
    // Acorn: dark cap, light nut, stalk.
    C: '<path d="M46 6 L54 6 L53 18 L47 18 Z" fill="currentColor"/>' +
       '<path d="M18 40 C18 22 82 22 82 40 L82 46 L18 46 Z" fill="currentColor"/>' +
       '<path d="M24 46 L76 46 C76 72 62 92 50 94 C38 92 24 72 24 46 Z" fill="#fff" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>',
    // Leaf: dark leaf with a white vein, stalk below.
    S: '<path d="M50 4 C82 22 88 58 50 84 C12 58 18 22 50 4 Z" fill="currentColor"/>' +
       '<path d="M50 14 L50 76 M50 36 L36 26 M50 36 L64 26 M50 54 L34 44 M50 54 L66 44" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>' +
       '<path d="M46 80 L54 80 L52 97 L48 97 Z" fill="currentColor"/>',
    // Heart: solid.
    H: '<path d="M50 90 C50 90 9 62 9 34 C9 20 19 11 30 11 C39 11 46 16 50 24 C54 16 61 11 70 11 C81 11 91 20 91 34 C91 62 50 90 50 90 Z" fill="currentColor"/>',
    // Bell: round, light, with a dark band, a slit and a knob on top.
    D: '<circle cx="50" cy="14" r="7" fill="currentColor"/>' +
       '<circle cx="50" cy="56" r="36" fill="#fff" stroke="currentColor" stroke-width="8"/>' +
       '<path d="M16 50 L84 50 L84 62 L16 62 Z" fill="currentColor"/>' +
       '<path d="M50 74 L50 90" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="76" r="5" fill="currentColor"/>'
  };
  const RANK = { 14: "A", 13: "K", 12: "O", 11: "U" };
  const SUIT_WORD = { C: "Acorn", S: "Leaf", H: "Heart", D: "Bell" };
  const RANK_WORD = { 14: "Ace", 13: "King", 12: "Ober", 11: "Unter" };

  function rankText(card) {
    return RANK[card.rank] || String(card.rank);
  }

  // English name, e.g. "Acorn Ober", "Bell 10" - translated by I18n.
  function label(card) {
    return SUIT_WORD[card.suit] + " " + (RANK_WORD[card.rank] || String(card.rank));
  }

  function suitSvg(suit, extraClass) {
    return '<svg class="card-suit' + (extraClass ? " " + extraClass : "") + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + MARKUP[suit] + "</svg>";
  }

  // Same layout as CardFaces.renderTall: rank on top, big suit below.
  function renderTall(el, card) {
    el.innerHTML = '<span class="pc-rank">' + rankText(card) + "</span>" + suitSvg(card.suit, "pc-suit");
  }

  return { MARKUP, SUIT_WORD, RANK_WORD, rankText, label, suitSvg, renderTall };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GermanCards;
}
if (typeof window !== "undefined") {
  window.GermanCards = GermanCards;
}
