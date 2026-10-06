// print-puzzle.js
// Shared "Print" button for the paper puzzles (Sudoku, Kakuro, Nonogram,
// Slitherlink, Killer Sudoku, Calcudoku, Number Blocks, Hashi,
// Skyscrapers). The print view itself lives in style.css under
// `@media print` (body.printable-puzzle): it prints the empty puzzle,
// never the player's own entries, so the sheet can be solved on paper.
//
// This script only does the two things CSS can't:
// - a title line above the board: the game's name and, for a Daily
//   Challenge, its date;
// - scaling the board to fill an A4 page. The boards keep the pixel
//   width they have on screen (their heights are set inline from that
//   width) and are zoomed as a whole, so nothing gets distorted.
// Both run on `beforeprint`, so Ctrl+P gets the same sheet as the button.

(function () {
  // Printable area of A4 portrait with the 12mm margins from style.css
  // (186mm x 273mm at 96 CSS px per inch), minus room for the title line.
  const PRINT_WIDTH_PX = 680;
  const PRINT_HEIGHT_PX = 940;
  const MAX_ZOOM = 2;

  let dailyKey = null;

  function setDaily(isDaily) {
    dailyKey = isDaily && typeof DailyChallenge !== "undefined" ? DailyChallenge.todayKey() : null;
  }

  function findBoard(container) {
    const grid = container.querySelector("#nonogram-grid");
    if (grid) return grid;
    const children = Array.prototype.slice.call(container.children);
    for (let i = 0; i < children.length; i++) {
      if (!/numpad|mode-toggle/.test(children[i].id)) return children[i];
    }
    return null;
  }

  function preparePrint() {
    const section = document.getElementById("board-section");
    const container = document.getElementById("board-container");
    if (!section || !container) return;

    let title = document.getElementById("print-puzzle-title");
    if (!title) {
      title = document.createElement("div");
      title.id = "print-puzzle-title";
      title.className = "print-puzzle-title";
      section.insertBefore(title, section.firstChild);
    }
    const nameEl = document.querySelector(".board-placeholder-title");
    const name = nameEl ? nameEl.textContent.trim() : "";
    title.textContent = dailyKey ? name + " · " + dailyKey : name;

    const board = findBoard(container);
    const rect = board ? board.getBoundingClientRect() : null;
    if (!rect || !rect.width || !rect.height) return;
    const zoom = Math.min(PRINT_WIDTH_PX / rect.width, PRINT_HEIGHT_PX / rect.height, MAX_ZOOM);
    container.style.setProperty("--print-board-width", Math.ceil(rect.width) + "px");
    container.style.setProperty("--print-zoom", String(Math.floor(zoom * 100) / 100));
  }

  window.addEventListener("beforeprint", preparePrint);

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("print-puzzle-button");
    if (btn) {
      btn.addEventListener("click", () => {
        preparePrint();
        window.print();
      });
    }
  });

  window.PrintPuzzle = { setDaily, preparePrint };
})();
