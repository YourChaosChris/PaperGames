// board-a11y.js
// Generic keyboard accessibility helper shared by every game's board.
// Every board cell across all 7 games is already a real <button> (built
// via document.createElement("button")), so Tab focus and Enter/Space
// activation work for free - what's missing is a sane way to move
// between cells with the arrow keys instead of tabbing through dozens
// of them one at a time.
//
// Rather than hand-coding adjacency for 7 different board topologies
// (an 8x8 grid, three Go board sizes, Ur's H-shaped path, Xiangqi/
// Morris's point-and-line graphs, Backgammon's 24 points + bar/off
// trays), this does plain 2D spatial navigation: on an arrow key, look
// at every other focusable button inside the same container and jump
// to whichever one is closest in that direction, using each button's
// actual on-screen position. That works identically for every board
// shape with zero per-game logic.

const BoardA11y = (function () {
  function enableArrowNav(containerSelector) {
    document.addEventListener("keydown", (e) => {
      const key = e.key;
      if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight") return;

      const active = document.activeElement;
      if (!active || typeof active.closest !== "function") return;
      const container = active.closest(containerSelector);
      if (!container) return;

      const candidates = Array.prototype.slice.call(container.querySelectorAll("button"))
        .filter((btn) => btn !== active && !btn.disabled && btn.tabIndex >= 0 && btn.offsetParent !== null);
      if (!candidates.length) return;

      const rect0 = active.getBoundingClientRect();
      const cx0 = rect0.left + rect0.width / 2;
      const cy0 = rect0.top + rect0.height / 2;

      let best = null;
      let bestScore = Infinity;
      candidates.forEach((cand) => {
        const r = cand.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - cx0;
        const dy = cy - cy0;
        let primary;
        let secondary;
        if (key === "ArrowLeft") {
          if (dx >= -1) return;
          primary = -dx;
          secondary = Math.abs(dy);
        } else if (key === "ArrowRight") {
          if (dx <= 1) return;
          primary = dx;
          secondary = Math.abs(dy);
        } else if (key === "ArrowUp") {
          if (dy >= -1) return;
          primary = -dy;
          secondary = Math.abs(dx);
        } else {
          if (dy <= 1) return;
          primary = dy;
          secondary = Math.abs(dx);
        }
        // Weight the perpendicular offset more heavily so a same-row/column
        // neighbor wins over a diagonal one that happens to be closer.
        const score = primary + secondary * 2;
        if (score < bestScore) {
          bestScore = score;
          best = cand;
        }
      });

      if (best) {
        e.preventDefault();
        best.focus();
      }
    });
  }

  return { enableArrowNav };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BoardA11y;
}
