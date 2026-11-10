// board-summary.js
// Task 207: a short description of the whole board for screen readers,
// read before the single squares (which carry their own aria-label). The
// text sits in a visually hidden paragraph right before the board and is
// linked with aria-describedby, so it is not announced on every move -
// the status line (aria-live) already does that.
//
// BoardSummary.set(boardEl, build) takes a function build(tr) that returns
// the text; tr(key, vars) translates a key and fills {name} placeholders.
// The function is kept and run again when the language changes.

const BoardSummary = (function () {
  const builders = new Map();

  function tr(key, vars) {
    let s = (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.split("{" + k + "}").join(String(vars[k])); });
    return s;
  }

  // Joins list items the way the language writes them.
  function list(items) {
    const lang = (window.I18n && typeof I18n.getLang === "function") ? I18n.getLang() : "en";
    return items.join(lang === "ja" || lang === "zh" ? "、" : ", ");
  }

  function render(boardEl) {
    const build = builders.get(boardEl);
    if (!build || !boardEl.parentNode) return;
    const id = (boardEl.id || "board") + "-summary";
    let p = document.getElementById(id);
    if (!p) {
      p = document.createElement("p");
      p.id = id;
      p.className = "sr-only";
      boardEl.parentNode.insertBefore(p, boardEl);
      const old = boardEl.getAttribute("aria-describedby");
      boardEl.setAttribute("aria-describedby", old ? old + " " + id : id);
    }
    let text = "";
    try { text = build(tr, list); } catch (e) { text = ""; }
    if (p.textContent !== text) p.textContent = text;
  }

  function set(boardEl, build) {
    if (!boardEl) return;
    builders.set(boardEl, build);
    render(boardEl);
  }

  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => builders.forEach((b, el) => render(el)));
  }

  return { set: set };
})();

if (typeof window !== "undefined") window.BoardSummary = BoardSummary;
