// result-modal.js
// Shared end-of-game popup for both chess.html and go.html: a centered,
// dismissible overlay announcing the result, built once and reused so
// neither page needs its own copy of this markup/CSS.

const ResultModal = (function () {
  function ensureModal() {
    let overlay = document.getElementById("result-modal-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "result-modal-overlay";
    overlay.className = "result-modal-overlay hidden";
    overlay.innerHTML =
      '<div class="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-modal-title">' +
        '<div id="result-modal-title" class="result-modal-title"></div>' +
        '<div id="result-modal-message" class="result-modal-message"></div>' +
        '<button type="button" class="primary result-modal-close">OK</button>' +
      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".result-modal-close").addEventListener("click", hide);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hide();
    });

    return overlay;
  }

  function show(title, message) {
    const overlay = ensureModal();
    overlay.querySelector("#result-modal-title").textContent = title || "";
    overlay.querySelector("#result-modal-message").textContent = message || "";
    overlay.classList.remove("hidden");
  }

  function hide() {
    const overlay = document.getElementById("result-modal-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  return { show, hide };
})();

if (typeof window !== "undefined") {
  window.ResultModal = ResultModal;
}
