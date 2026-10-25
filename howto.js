/* howto.js: the shared picture explanation "How does it work?" of the
   simple games. A game calls Howto.init({ slug, steps: [{ pics, key }] })
   with four steps; each step is a row of pictures (inline SVG, black on
   white) and one short sentence. The panel opens by itself until the first
   game on this device; a button above it shows or hides it again. No
   animation, no sound, no time limit. */
const Howto = (function () {
  const INK = "#141413";

  function text(key) {
    return window.I18n && I18n.t ? I18n.t(key) : key;
  }

  function svg(w, h, body) {
    return '<svg class="howto-svg" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

  var PIPS = {
    1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]]
  };

  // A die with 1 to 6 pips; size in pixels.
  function die(value, size) {
    const s = size || 48;
    let b = '<rect x="3" y="3" width="94" height="94" rx="14" fill="#fff" stroke="' + INK + '" stroke-width="6"/>';
    (PIPS[value] || []).forEach(function (p) {
      b += '<circle cx="' + (26 + p[0] * 24) + '" cy="' + (26 + p[1] * 24) + '" r="9" fill="' + INK + '"/>';
    });
    return '<svg class="howto-svg" viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' + b + "</svg>";
  }

  function arrow() {
    return svg(30, 20, '<path d="M2 10H24M17 3L25 10L17 17" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>');
  }

  // A plain sign between pictures, such as "+" or "=".
  function sign(ch) {
    return '<span class="howto-sign">' + ch + "</span>";
  }

  // A numbered box. state: "" (open), "shut" (struck out with a cross),
  // "peg" (black disc) or "mark" (ticked).
  function tile(label, state, size) {
    const s = size || 40;
    let b = '<rect x="2" y="2" width="36" height="36" rx="5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    if (state === "peg") b += '<circle cx="20" cy="20" r="11" fill="' + INK + '"/>';
    else if (state === "shut") b += '<path d="M8 8L32 32M32 8L8 32" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>';
    else if (state === "mark") b += '<path d="M9 21L17 29L32 10" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    if (label !== "" && label !== undefined && state !== "peg") b += '<text x="20" y="' + (state ? 36 : 27) + '" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="' + (state ? 11 : 18) + '" fill="' + INK + '">' + label + "</text>";
    return '<svg class="howto-svg" viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' + b + "</svg>";
  }

  function row(pics, key) {
    return '<li class="howto-item"><span class="howto-pics" aria-hidden="true">' + pics + '</span><span class="howto-text">' + text(key) + "</span></li>";
  }

  function listHtml(steps) {
    let h = '<ol class="howto-list">';
    steps.forEach(function (s) { h += row(typeof s.pics === "function" ? s.pics() : s.pics, s.key); });
    return h + "</ol>";
  }

  function init(opts) {
    const container = document.getElementById("board-container");
    if (!container || container.querySelector(".howto-bar")) return;
    const keys = opts.keys || { title: "howto_title", show: "howto_show", hide: "howto_hide" };
    const seenKey = opts.seenKey || "papergames_howto_seen_" + opts.slug;
    const bar = document.createElement("div");
    bar.className = "howto-bar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary small howto-toggle";
    btn.id = "howto-toggle";
    bar.appendChild(btn);
    const panel = document.createElement("div");
    panel.className = "howto";
    panel.id = "howto";
    panel.innerHTML = '<h2 class="howto-title"></h2><div class="howto-body"></div>';
    container.insertBefore(panel, container.firstChild);
    container.insertBefore(bar, container.firstChild);

    function seen() {
      try { return !!(window.localStorage && window.localStorage.getItem(seenKey)); } catch (e) { return false; }
    }
    function mark() {
      try { if (window.localStorage) window.localStorage.setItem(seenKey, "1"); } catch (e) { /* it just opens again next time */ }
    }
    function show(on) {
      panel.classList.toggle("hidden", !on);
      btn.setAttribute("data-i18n", on ? keys.hide : keys.show);
      btn.textContent = text(on ? keys.hide : keys.show);
    }
    function render() {
      panel.querySelector(".howto-title").textContent = text(keys.title);
      panel.querySelector(".howto-body").innerHTML = listHtml(opts.steps);
      show(!panel.classList.contains("hidden"));
    }
    btn.addEventListener("click", function () {
      show(panel.classList.contains("hidden"));
    });
    // The first roll (or draw) on this device hides the explanation.
    const handle = { show: show, markSeen: function () { mark(); show(false); }, render: render };
    (opts.actions || []).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", function () { if (!seen()) handle.markSeen(); });
    });
    render();
    show(!seen());
    if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(render);
    return handle;
  }

  // A small framed box around a picture (a card).
  function box(inner) {
    return '<span class="howto-card">' + inner + "</span>";
  }

  // A ladder leading up (an arrow at the top shows the way).
  function ladder() {
    return svg(30, 44, '<path d="M8 42V10M22 42V10M8 36H22M8 28H22M8 20H22" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M9 8L15 2L21 8" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>');
  }

  // A snake leading down: black head at the top, the tail ends in an
  // arrow at the bottom.
  function snake() {
    return svg(30, 44, '<path d="M15 8C25 12 5 18 15 23C25 28 5 32 15 37" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="15" cy="7" r="5" fill="' + INK + '"/><path d="M10 37L15 43L20 37" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>');
  }

  // A small board of cells. rows: strings, one character per cell ("." =
  // empty, any other character is written in the cell); lines: lists of
  // [row, col] cells joined by a thick line through their centres.
  function grid(rows, lines, cellSize) {
    const c = cellSize || 26;
    const h = rows.length, w = rows[0].length;
    let b = "";
    for (let r = 0; r < h; r++) {
      for (let k = 0; k < w; k++) {
        b += '<rect x="' + (k * c + 1.5) + '" y="' + (r * c + 1.5) + '" width="' + c + '" height="' + c + '" fill="#fff" stroke="' + INK + '" stroke-width="1.5"/>';
      }
    }
    (lines || []).forEach(function (cells) {
      const pts = cells.map(function (p) { return (p[1] * c + c / 2 + 1.5) + "," + (p[0] * c + c / 2 + 1.5); }).join(" ");
      b += '<polyline points="' + pts + '" fill="none" stroke="' + INK + '" stroke-width="' + Math.round(c / 4) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    });
    for (let r = 0; r < h; r++) {
      for (let k = 0; k < w; k++) {
        const ch = rows[r][k];
        if (ch === ".") continue;
        b += '<circle cx="' + (k * c + c / 2 + 1.5) + '" cy="' + (r * c + c / 2 + 1.5) + '" r="' + (c * 0.36) + '" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
          '<text x="' + (k * c + c / 2 + 1.5) + '" y="' + (r * c + c / 2 + 1.5 + c * 0.2) + '" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="' + Math.round(c * 0.5) + '" fill="' + INK + '">' + ch + "</text>";
      }
    }
    return svg(w * c + 3, h * c + 3, b);
  }

  return { init: init, die: die, arrow: arrow, sign: sign, tile: tile, box: box, ladder: ladder, snake: snake, grid: grid };
})();
