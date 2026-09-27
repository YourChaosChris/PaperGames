// card-faces.js
// Shared by FreeCell, Klondike (Patience) and Spider Solitaire: the card
// face (rank as text plus the suit as a small inline SVG) and the sizing
// of the overlapping card cascades.
//
// All three games stack by alternating red and black, and a monochrome
// E-Ink screen can't show red. So the red suits (hearts, diamonds) are
// drawn hollow and the black suits (spades, clubs) filled - the colour
// can be read off the fill without any colour at all, the same
// filled/open idea as the Ludo player shapes. SVG rather than the hollow
// Unicode suit characters, which e-reader fonts don't reliably include.

const CardFaces = (function () {
  const SYMBOL = { S: "♠", H: "♥", D: "♦", C: "♣" };
  const RANK = { 1: "A", 11: "J", 12: "Q", 13: "K" };

  const HOLLOW = ' fill="#fff" stroke="currentColor" stroke-width="12" stroke-linejoin="round"';
  const FILLED = ' fill="currentColor"';

  // 100x100 viewBox. Hollow shapes stay inside ~8 units of the edge so
  // their stroke isn't clipped.
  const MARKUP = {
    H: '<path d="M50 90 C50 90 9 62 9 34 C9 20 19 11 30 11 C39 11 46 16 50 24 C54 16 61 11 70 11 C81 11 91 20 91 34 C91 62 50 90 50 90 Z"' + HOLLOW + "/>",
    D: '<path d="M50 7 L85 50 L50 93 L15 50 Z"' + HOLLOW + "/>",
    S: '<path d="M50 4 C50 4 6 36 6 60 C6 73 16 81 27 81 C36 81 43 76 46 70 L41 96 L59 96 L54 70 C57 76 64 81 73 81 C84 81 94 73 94 60 C94 36 50 4 50 4 Z"' + FILLED + "/>",
    C: '<circle cx="50" cy="27" r="21"' + FILLED + '/><circle cx="26" cy="59" r="21"' + FILLED + '/><circle cx="74" cy="59" r="21"' + FILLED + '/><path d="M45 50 L39 96 L61 96 L55 50 Z"' + FILLED + "/>"
  };

  function rankText(card) {
    return RANK[card.rank] || String(card.rank);
  }

  // Plain-text label ("10♥") for aria-labels and status text.
  function label(card) {
    return rankText(card) + SYMBOL[card.suit];
  }

  // The suit alone as an inline SVG. It carries the suit character as its
  // accessible name, so a button containing it still reads as "10♥".
  function suitSvg(suit) {
    return '<svg class="card-suit" viewBox="0 0 100 100" role="img" aria-label="' + SYMBOL[suit] +
      '" focusable="false">' + MARKUP[suit] + "</svg>";
  }

  // Replaces el's content with the card face (rank + suit).
  function render(el, card) {
    el.innerHTML = '<span class="card-face">' + rankText(card) + suitSvg(card.suit) + "</span>";
  }

  // Replaces el's content with a taller card face - rank on top, a big
  // suit below - for the card games that show cards as separate tiles
  // (Schwimmen, Durak, Concan). Ranks above 13 (Durak's Ace = 14) show
  // as "A".
  function renderTall(el, card) {
    const rank = card.rank === 14 ? "A" : rankText(card);
    el.innerHTML = '<span class="pc-rank">' + rank + "</span>" + suitSvg(card.suit).replace('class="card-suit"', 'class="card-suit pc-suit"');
  }

  // Plain-text label that also knows Durak's Ace (rank 14).
  function labelAny(card) {
    return (card.rank === 14 ? "A" : rankText(card)) + SYMBOL[card.suit];
  }

  // Replaces el's content with just the suit (empty foundations).
  function renderSuit(el, suit) {
    el.innerHTML = '<span class="card-face">' + suitSvg(suit) + "</span>";
  }

  // Sizes every card in the given columns. A card is 5:3 (width:height)
  // from the measured column width - set here rather than with CSS
  // `aspect-ratio`, which some E-Ink browsers (Tolino confirmed) don't
  // support reliably - but never flatter than its own label band (one
  // line of text plus padding). Each card after the first overlaps the
  // one above so that exactly that band stays visible, whatever the
  // screen width; a fixed CSS overlap hid most of the label on narrow
  // screens. Columns get the card height as min-height so an empty one
  // can still be tapped to drop a card there.
  // Returns false if the columns aren't laid out yet.
  function layoutColumns(columnsEl, columnSelector, cardSelector, slotSelector) {
    if (!columnsEl) return false;
    const columns = columnsEl.querySelectorAll(columnSelector);
    if (!columns.length) return false;
    const rect = columns[0].getBoundingClientRect();
    if (!rect || !rect.width) return false;
    const sample = columnsEl.querySelector(cardSelector) || columnsEl;
    const fontSize = parseFloat(window.getComputedStyle(sample).fontSize) || 14;
    const band = Math.ceil(fontSize * 1.25) + 6;
    const height = Math.max(Math.round(rect.width * 0.6), band + 10);
    columns.forEach((colEl) => {
      colEl.style.minHeight = height + "px";
      colEl.querySelectorAll(cardSelector).forEach((el, i) => {
        el.style.height = height + "px";
        el.style.marginTop = i === 0 ? "0px" : "-" + (height - band) + "px";
      });
      if (slotSelector) {
        colEl.querySelectorAll(slotSelector).forEach((el) => {
          el.style.height = height + "px";
        });
      }
    });
    return true;
  }

  return { SYMBOL, label, labelAny, suitSvg, render, renderSuit, renderTall, layoutColumns };
})();

if (typeof window !== "undefined") {
  window.CardFaces = CardFaces;
}
