// dice-common.js
// Shared pieces of the three number-dice games Klappenkasten, Steckwürfeln
// and Sternjagd: pip-dot dice drawn as inline SVG (black on white, no
// grey, nothing animated), the four player markers (circle, square,
// triangle, star), player names ("You", "Player 2", "Computer"), the
// players list and the small helpers around the setup controls.

const DiceCommon = (function () {
  "use strict";

  const PIPS = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]]
  };
  const COORD = [27, 50, 73];

  function t(key) {
    return window.I18n && typeof I18n.t === "function" ? I18n.t(key) : key;
  }

  function fill(text, values) {
    let out = String(text);
    Object.keys(values || {}).forEach((k) => { out = out.split("{" + k + "}").join(String(values[k])); });
    return out;
  }

  // A die face. value 0 draws an empty, dashed face (not rolled yet).
  function dieSvg(value, cls) {
    const empty = !(value >= 1 && value <= 6);
    const rect = '<rect x="5" y="5" width="90" height="90" rx="16" fill="#ffffff" stroke="#141413" stroke-width="6"' +
      (empty ? ' stroke-dasharray="10 8"' : "") + "/>";
    let pips = "";
    if (!empty) {
      PIPS[value].forEach((p) => {
        pips += '<circle cx="' + COORD[p[0]] + '" cy="' + COORD[p[1]] + '" r="9.5" fill="#141413"/>';
      });
    }
    return '<svg class="' + (cls || "dg-die") + '" viewBox="0 0 100 100" width="72" height="72" aria-hidden="true" focusable="false">' + rect + pips + "</svg>";
  }

  // The marker of player i: circle, square, triangle or star, in black.
  function markerSvg(i, cls) {
    const k = ((i % 4) + 4) % 4;
    const stroke = ' stroke="#fff" stroke-width="4" stroke-linejoin="round"';
    let shape;
    if (k === 0) shape = '<circle cx="50" cy="50" r="38" fill="#141413"' + stroke + "/>";
    else if (k === 1) shape = '<rect x="14" y="14" width="72" height="72" fill="#141413"' + stroke + "/>";
    else if (k === 2) shape = '<polygon points="50,8 94,86 6,86" fill="#141413"' + stroke + "/>";
    else {
      const pts = [];
      for (let j = 0; j < 10; j++) {
        const a = -Math.PI / 2 + j * Math.PI / 5;
        const r = j % 2 ? 22 : 46;
        pts.push((50 + r * Math.cos(a)).toFixed(1) + "," + (50 + r * Math.sin(a)).toFixed(1));
      }
      shape = '<polygon points="' + pts.join(" ") + '" fill="#141413"' + stroke + "/>";
    }
    return '<svg class="' + (cls || "dg-marker") + '" viewBox="0 0 100 100" width="28" height="28" aria-hidden="true" focusable="false">' + shape + "</svg>";
  }

  // "You" for the only person, "Player 2" when several people play,
  // "Computer" (or "Computer 2" when there are several).
  function playerName(computer, i) {
    const humans = computer.filter((c) => !c).length;
    const computers = computer.length - humans;
    if (computer[i]) {
      if (computers === 1) return t("dg_computer");
      const nth = computer.slice(0, i + 1).filter((c) => c).length;
      return fill(t("dg_computer_n"), { n: nth });
    }
    if (humans === 1) return t("dg_you");
    const nth = computer.slice(0, i + 1).filter((c) => !c).length;
    return fill(t("dg_player"), { n: nth });
  }

  // The players list: marker, name and a small text (score) per player;
  // the player to move is framed.
  function playersHtml(computer, active, extra, over) {
    let html = "";
    computer.forEach((c, i) => {
      const on = !over && i === active;
      html += '<span class="game-player dg-player' + (on ? " game-player-active" : "") + '">' +
        markerSvg(i) + '<span class="game-player-name">' + playerName(computer, i) + "</span>" +
        (extra && extra[i] !== undefined && extra[i] !== null && extra[i] !== "" ? ' <span class="dg-player-extra">' + extra[i] + "</span>" : "") +
        "</span>";
    });
    return html;
  }

  // Seats from the setup: n players, the human(s) first. In the computer
  // mode one person plays against n - 1 computers; otherwise all are people.
  function seats(mode, n) {
    const list = [];
    for (let i = 0; i < n; i++) list.push(mode === "ai" && i > 0);
    return list;
  }

  function activeMode() {
    const two = document.getElementById("mode-offline");
    return two && two.classList.contains("active-mode") ? "hotseat" : "ai";
  }

  function setMode(mode) {
    const two = document.getElementById("mode-offline");
    const ai = document.getElementById("mode-ai");
    if (two) { two.classList.toggle("active-mode", mode === "hotseat"); two.setAttribute("aria-pressed", mode === "hotseat" ? "true" : "false"); }
    if (ai) { ai.classList.toggle("active-mode", mode !== "hotseat"); ai.setAttribute("aria-pressed", mode !== "hotseat" ? "true" : "false"); }
  }

  function setText(el, text) {
    if (!el) return;
    el.removeAttribute("data-i18n");
    el.textContent = text || "";
  }

  // The menu button opens and closes the settings panel.
  function wireMenu() {
    const toggle = document.getElementById("menu-toggle");
    const panel = document.getElementById("settings-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const hidden = panel.classList.toggle("hidden");
        if (window.I18n) I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
      });
    }
  }

  function showBoard() {
    const placeholder = document.getElementById("board-placeholder");
    const container = document.getElementById("board-container");
    if (placeholder) placeholder.classList.add("hidden");
    if (container) container.classList.remove("hidden");
  }

  // Result pop-up: the English title picks the mark (win / draw / loss),
  // the message carries the translated text.
  function showResult(titleEnglish, message) {
    if (window.ResultModal) window.ResultModal.show(titleEnglish, message);
  }

  return { dieSvg, markerSvg, playerName, playersHtml, seats, activeMode, setMode, setText, wireMenu, showBoard, showResult, fill, t };
})();

if (typeof window !== "undefined") window.DiceCommon = DiceCommon;
