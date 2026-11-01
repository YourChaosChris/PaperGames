// bingo-app.js
// Wires BingoCore to bingo.html. Number or picture cards (3 x 3 / 5 x 5),
// the caller draws on a button press only - nothing runs by itself.
// Modes: "caller" (the device only draws; print the cards), "two" (1-4
// cards on one device, shown one after the other with "Next card"), and
// "computer" (your card against computer cards that mark by themselves).
// "Bingo!" checks the shown card; wrong marks get a dashed frame, no penalty.
// Against the computer the computers' cards are shown small under your own
// card (task 168): numbers or pictures and their marks, the item just
// called framed, a bingo in black; a switch hides them. The status line
// names which computer marked the call or has a bingo. The game is saved
// (with the switch) and comes back after a reload.
(function () {
  const $ = (id) => document.getElementById(id);
  const t = (k) => (typeof I18n !== "undefined" ? I18n.t(k) : k);
  const SAVE_KEY = "einkchess_save_bingo";
  const state = { game: null, cards: [], active: 0, current: null, showCpu: true, cpuWin: -1 };
  const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (m, k) => (values[k] !== undefined ? values[k] : m));
  const cpuName = (ci) => fill(t("dg_computer_n"), { n: ci });
  const PICTURES = ["dog","cat","rabbit","mouse","owl","fish","turtle","snail","duck","frog","pig","elephant","butterfly","bee","lion","giraffe","sheep","apple","pear","car","boat","ball","flower","house"];
  const DRAWINGS = {
    dog:'<circle cx="50" cy="52" r="24"/><path d="M28 39 20 18 41 30M72 39l8-21-21 12"/><circle cx="42" cy="50" r="2"/><circle cx="58" cy="50" r="2"/><ellipse cx="50" cy="60" rx="7" ry="5"/>',
    cat:'<circle cx="50" cy="52" r="24"/><path d="M30 38 27 18 44 31M70 38l3-20-17 13"/><circle cx="42" cy="50" r="2"/><circle cx="58" cy="50" r="2"/><path d="M45 61h10m-5-4v8M27 60l14 2m-14 5 14-2m32-5-14 2m14 5-14-2"/>',
    rabbit:'<ellipse cx="39" cy="29" rx="8" ry="23"/><ellipse cx="61" cy="29" rx="8" ry="23"/><circle cx="50" cy="58" r="23"/><circle cx="42" cy="54" r="2"/><circle cx="58" cy="54" r="2"/><circle cx="50" cy="64" r="4"/>',
    mouse:'<circle cx="50" cy="53" r="22"/><circle cx="33" cy="34" r="12"/><circle cx="67" cy="34" r="12"/><circle cx="43" cy="51" r="2"/><circle cx="57" cy="51" r="2"/><ellipse cx="50" cy="61" rx="5" ry="3"/>',
    owl:'<path d="M26 76V37l16 9 8-12 8 12 16-9v39z"/><circle cx="41" cy="53" r="8"/><circle cx="59" cy="53" r="8"/><circle cx="41" cy="53" r="2"/><circle cx="59" cy="53" r="2"/><path d="m47 66 3 5 3-5"/>',
    fish:'<path d="M18 50q32-35 62 0-30 35-62 0l-12 14V36z"/><circle cx="65" cy="47" r="2"/>',
    turtle:'<ellipse cx="50" cy="52" rx="26" ry="19"/><path d="M31 38v28m19-33v38m19-33v28M25 40l-9-9m9 35-9 9m50-35 9-9m-9 35 9 9"/><circle cx="78" cy="50" r="8"/><circle cx="80" cy="48" r="1"/>',
    snail:'<path d="M18 68h65q-2-17-18-17h-5a22 22 0 1 0-9 17"/><circle cx="44" cy="47" r="17"/><path d="M44 47q14-2 8-13-7-8-14 0-5 9 6 13M73 50V35m10 15V35"/><circle cx="73" cy="34" r="2"/><circle cx="83" cy="34" r="2"/>',
    duck:'<ellipse cx="48" cy="56" rx="27" ry="20"/><circle cx="62" cy="34" r="16"/><path d="m75 34 17 6-17 5"/><circle cx="66" cy="31" r="2"/>',
    frog:'<circle cx="50" cy="56" r="27"/><circle cx="34" cy="30" r="10"/><circle cx="66" cy="30" r="10"/><circle cx="34" cy="30" r="2"/><circle cx="66" cy="30" r="2"/><path d="M36 60q14 16 28 0"/>',
    pig:'<ellipse cx="50" cy="54" rx="29" ry="23"/><path d="m31 37-5-16 20 12m17 4 5-16-20 12"/><ellipse cx="50" cy="59" rx="10" ry="7"/><circle cx="46" cy="59" r="1"/><circle cx="54" cy="59" r="1"/><circle cx="39" cy="48" r="2"/><circle cx="61" cy="48" r="2"/>',
    elephant:'<path d="M25 43q0-20 26-20t26 20v30H66V57H38v16H27V54q-15-4-9-21 2-7 10-7"/><circle cx="62" cy="39" r="2"/><path d="M25 43q0 17 15 11"/>',
    butterfly:'<path d="M49 50Q15 10 15 42q0 18 34 12Q15 88 25 91q18 3 25-37 7 40 25 37 10-3-24-37 34 6 34-12 0-32-35 8"/><path d="M50 28q-8-14-13-12m13 12q8-14 13-12"/>',
    bee:'<ellipse cx="50" cy="56" rx="18" ry="25"/><path d="M39 36v40m22-40v40"/><ellipse cx="39" cy="27" rx="11" ry="16"/><ellipse cx="61" cy="27" rx="11" ry="16"/><circle cx="45" cy="48" r="2"/><circle cx="55" cy="48" r="2"/>',
    lion:'<circle cx="50" cy="52" r="34"/><circle cx="50" cy="54" r="22"/><circle cx="43" cy="50" r="2"/><circle cx="57" cy="50" r="2"/><path d="M46 61h8m-4-4v7"/>',
    giraffe:'<path d="M35 84V46q0-22 15-22t15 22v38M35 45h30M42 32l-5-14m26 14 5-14"/><circle cx="44" cy="39" r="2"/><circle cx="56" cy="39" r="2"/><path d="M46 48h8m-4-4v8"/>',
    sheep:'<circle cx="34" cy="52" r="15"/><circle cx="50" cy="42" r="17"/><circle cx="67" cy="52" r="15"/><ellipse cx="50" cy="61" rx="20" ry="17"/><path d="M39 76v10m22-10v10"/><circle cx="44" cy="58" r="2"/><circle cx="56" cy="58" r="2"/>',
    apple:'<path d="M50 35q-28-15-31 11-2 25 22 39 8 5 9-2 1 7 9 2 23-14 22-39-3-26-31-11zM50 35q-1-14 11-21m-7 9q12-10 22-2-7 12-19 9"/>',
    pear:'<path d="M50 23q-8 0-7 14 0 8-9 18-18 25 1 36h30q19-11 1-36-9-10-9-18 1-14-7-14zM50 26q-1-13 11-19"/>',
    car:'<path d="M15 61h74v18H15zM25 61l10-23h34l14 23"/><circle cx="31" cy="80" r="8"/><circle cx="73" cy="80" r="8"/>',
    boat:'<path d="M12 67h76L76 85H28zM48 20v45H25zM53 29l26 30H53z"/>',
    ball:'<circle cx="50" cy="50" r="37"/><path d="M50 13q-22 20 0 37 22-17 0-37zm0 37q-27-8-37 12m37-12q10 27 30 32M13 50q24-7 37 0m0 0q4 25-10 36"/>',
    flower:'<circle cx="50" cy="50" r="10"/><g><circle cx="50" cy="25" r="12"/><circle cx="75" cy="50" r="12"/><circle cx="50" cy="75" r="12"/><circle cx="25" cy="50" r="12"/></g><path d="M50 60v29m0-11q-18-12-22 0 13 9 22 0"/>',
    house:'<path d="M12 48 50 15l38 33M22 43v43h56V43M43 86V59h16v27M31 53h8v9h-8zm24 0h8v9h-8z"/>'
  };

  function pictureName(v) { return t("bingo_picture_" + PICTURES[Number(String(v).replace("picture", ""))]); }
  function drawIcon(value) {
    const key = String(value).replace("picture", "");
    return '<svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true" focusable="false"><g fill="none" stroke="#141413" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' + DRAWINGS[PICTURES[Number(key)]] + "</g></svg>";
  }
  function itemLabel(v) { return v === null ? t("bingo_free") : state.game.kind === "pictures" ? pictureName(v) : String(v); }
  function setStatus(text) { const el = $("board-info"); if (el) el.textContent = text || ""; }
  function setResult(text) { const el = $("game-result"); if (el) el.textContent = text || ""; }

  function readSettings() {
    const mode = $("bingo-mode").value;
    // Against the computer: your card plus one card per computer opponent.
    const count = mode === "computer" ? 1 + Number($("bingo-opponents").value) : Number($("bingo-count").value);
    return { kind: $("bingo-kind").value, size: Number($("bingo-size").value), mode, pattern: $("bingo-pattern").value, count: count };
  }

  function start() {
    const s = readSettings();
    state.game = { kind: s.kind, size: s.size, mode: s.mode, pattern: s.pattern, drawn: [], over: false };
    state.cards = s.mode === "caller" ? [] : Array.from({ length: s.count }, () => BingoCore.createDeck(s.kind, s.size));
    state.active = 0;
    state.current = null;
    state.cpuWin = -1;
    setResult("");
    setStatus(s.mode === "caller" ? t("bingo_status_caller") : t("bingo_status_start"));
    $("board-placeholder").classList.add("hidden");
    $("board-container").classList.remove("hidden");
    $("settings-panel").classList.add("hidden");
    I18n.setKey($("menu-toggle"), "menu_toggle");
    render();
    save();
  }

  /*** Save and load ***/

  function save() {
    if (typeof GameStorage === "undefined" || !state.game) return;
    if (state.game.over || state.game.mode === "caller") { GameStorage.clear(SAVE_KEY); return; }
    GameStorage.save(SAVE_KEY, { game: state.game, cards: state.cards, active: state.active, current: state.current, showCpu: state.showCpu });
  }

  function validSave(d) {
    if (!d || !d.game || !Array.isArray(d.cards) || !d.cards.length || !Array.isArray(d.game.drawn)) return false;
    if (d.game.over || ["two", "computer"].indexOf(d.game.mode) === -1) return false;
    return d.cards.every((c) => c && Array.isArray(c.board) && Array.isArray(c.marked) && c.board.length === c.marked.length && (c.size === 3 || c.size === 5) && c.board.length === c.size * c.size);
  }

  function load() {
    const d = typeof GameStorage !== "undefined" ? GameStorage.load(SAVE_KEY) : null;
    if (!validSave(d)) return false;
    state.game = d.game;
    state.cards = d.cards;
    state.active = d.active > 0 && d.active < d.cards.length ? d.active : 0;
    state.current = d.current === undefined ? null : d.current;
    state.showCpu = d.showCpu !== false;
    state.cpuWin = -1;
    $("board-placeholder").classList.add("hidden");
    $("board-container").classList.remove("hidden");
    setStatus(state.game.mode === "computer" ? t("ui_status_your_turn") : t("bingo_status_marked"));
    render();
    return true;
  }

  function visibleIndex() { return state.game.mode === "computer" ? 0 : state.active; }

  // A card as buttons in a grid; blank = printable copy without marks.
  function cardHtml(card, index, blank) {
    let html = '<h3 class="bingo-card-title">' + t("bingo_card") + " " + (index + 1) + '</h3><div class="bingo-grid" style="--bingo-n:' + card.size + '" role="group" aria-label="' + t("bingo_card") + " " + (index + 1) + '">';
    card.board.forEach((v, i) => {
      const marked = !blank && card.marked[i];
      html += '<button type="button" class="bingo-cell' + (marked ? " marked" : "") + (card.kind === "pictures" ? " picture-cell" : "") + '" data-i="' + i + '" aria-pressed="' + (marked ? "true" : "false") + '" aria-label="' + itemLabel(v).replace(/"/g, "") + '"' + (blank ? " tabindex=\"-1\"" : "") + '><span class="bingo-in">' + (v === null ? "&#9733;" : card.kind === "pictures" ? drawIcon(v) : String(v)) + "</span></button>";
    });
    return html + "</div>";
  }

  // A computer's card, small and only to look at (task 168): the item just
  // called gets a dashed frame, marks a ring, a bingo is black.
  function smallCardHtml(card, ci) {
    const g = state.game;
    const win = BingoCore.check(card, g.pattern);
    const winning = win.valid ? win.winning : [];
    const count = card.marked.filter(Boolean).length;
    const label = fill(t("bingo_cpu_card_aria"), { name: cpuName(ci), n: count, m: card.marked.length });
    let html = '<h3 class="bingo-card-title">' + cpuName(ci) + (win.valid ? " – " + t("bingo_check") : "") + '</h3><div class="bingo-grid bingo-mini-grid" style="--bingo-n:' + card.size + '" role="img" aria-label="' + label.replace(/"/g, "") + '">';
    card.board.forEach((v, i) => {
      const cls = ["bingo-mini-cell"];
      if (card.marked[i]) cls.push("marked");
      if (v !== null && v === state.current && card.marked[i]) cls.push("bingo-just");
      if (winning.indexOf(i) !== -1) cls.push("bingo-win");
      html += '<span class="' + cls.join(" ") + '"><span class="bingo-in">' + (v === null ? "&#9733;" : card.kind === "pictures" ? drawIcon(v) : String(v)) + "</span></span>";
    });
    return html + "</div>";
  }

  function renderCpu() {
    const g = state.game;
    const wrap = $("bingo-cpu");
    const on = g.mode === "computer" && state.cards.length > 1;
    wrap.classList.toggle("hidden", !on);
    if (!on) return;
    const btn = $("bingo-cpu-toggle");
    btn.setAttribute("aria-pressed", state.showCpu ? "true" : "false");
    I18n.setKey(btn, state.showCpu ? "bingo_cpu_hide" : "bingo_cpu_show");
    const host = $("bingo-cpu-cards");
    host.classList.toggle("hidden", !state.showCpu);
    host.innerHTML = state.showCpu ? state.cards.slice(1).map((c, k) => '<article class="bingo-card bingo-mini">' + smallCardHtml(c, k + 1) + "</article>").join("") : "";
  }

  function render() {
    const g = state.game;
    if (!g) return;
    renderCpu();
    const showCards = g.mode !== "caller" && state.cards.length > 0;
    const vi = visibleIndex();
    const host = $("bingo-cards");
    host.innerHTML = "";
    if (showCards) {
      const article = document.createElement("article");
      article.className = "bingo-card";
      article.innerHTML = cardHtml(state.cards[vi], vi, false);
      article.querySelectorAll(".bingo-cell").forEach((b) => {
        const i = Number(b.getAttribute("data-i"));
        b.addEventListener("click", () => onCell(i));
      });
      host.appendChild(article);
    }
    host.classList.toggle("hidden", !showCards);
    const cur = $("bingo-current");
    cur.innerHTML = "";
    if (state.current === null) cur.textContent = "\u2014";
    else if (g.kind === "pictures") cur.innerHTML = drawIcon(state.current) + "<span>" + pictureName(state.current) + "</span>";
    else cur.textContent = String(state.current);
    renderCalled();
    $("bingo-next").classList.toggle("hidden", !(g.mode === "two" && state.cards.length > 1));
    $("bingo-check").classList.toggle("hidden", !showCards);
    $("bingo-draw").disabled = g.over;
    $("bingo-check").disabled = g.over;
  }

  function renderCalled() {
    const g = state.game, list = $("bingo-called");
    const items = g.kind === "pictures" ? g.drawn.slice() : g.drawn.slice().sort((a, b) => a - b);
    $("bingo-called-title").textContent = t("bingo_called") + " (" + items.length + ")";
    list.innerHTML = items.map((v) => g.kind === "pictures"
      ? '<li class="bingo-called-pic" title="' + pictureName(v) + '">' + drawIcon(v) + "</li>"
      : "<li>" + v + "</li>").join("");
  }

  // Printable sheet: blank copies of the cards, 4 per page; in caller
  // mode four new cards.
  function renderPrint() {
    const g = state.game;
    if (!g) return;
    const cards = state.cards.length ? state.cards : Array.from({ length: 4 }, () => BingoCore.createDeck(g.kind, g.size));
    $("bingo-print").innerHTML = cards.map((c, i) => '<article class="bingo-card print-card">' + cardHtml(c, i, true) + "</article>").join("");
  }

  function onCell(i) {
    const g = state.game;
    if (!g || g.over) return;
    const card = state.cards[visibleIndex()];
    if (card.board[i] === null) return;
    card.marked[i] = !card.marked[i];
    render();
    save();
    const el = $("bingo-cards").querySelectorAll(".bingo-cell")[i];
    if (el) el.focus();
  }

  function onDraw() {
    if (!state.game) start();
    const g = state.game;
    if (g.over) return;
    const probe = { kind: g.kind, drawn: g.drawn };
    const v = BingoCore.draw(probe);
    state.current = v;
    if (v === null) { setStatus(t("bingo_draw_empty")); render(); return; }
    let computerWin = false;
    const marked = [], bingos = [];
    state.cards.forEach((c, ci) => {
      c.drawn = g.drawn.slice();
      if (g.mode === "computer" && ci > 0) {
        if (BingoCore.autoMark(c, v) >= 0) marked.push(ci);
        if (BingoCore.check(c, g.pattern).valid) { computerWin = true; bingos.push(ci); }
      }
    });
    // What the computers did with this call (task 168).
    let done = "";
    if (g.mode === "computer") {
      const item = itemLabel(v);
      done = marked.length ? marked.map((ci) => fill(t("bingo_cpu_marked"), { name: cpuName(ci), v: item })).join(" ") : fill(t("bingo_cpu_none"), { v: item });
      bingos.forEach((ci) => { done += " " + fill(t("bingo_cpu_bingo"), { name: cpuName(ci) }); });
      done += " ";
    }
    if (computerWin) {
      g.over = true;
      setStatus(done + t("ui_status_computer_wins"));
      setResult(t("ui_status_computer_wins"));
      if (typeof GameStats !== "undefined") GameStats.record("bingo", "loss");
    } else setStatus(g.mode === "computer" ? done + t("ui_status_your_turn") : t("bingo_status_marked"));
    render();
    save();
  }

  function onCheck() {
    const g = state.game;
    if (!g || g.over || !state.cards.length) return;
    const vi = visibleIndex();
    const card = state.cards[vi];
    card.drawn = g.drawn.slice();
    const res = BingoCore.check(card, g.pattern);
    const cells = $("bingo-cards").querySelectorAll(".bingo-cell");
    cells.forEach((el, i) => el.classList.toggle("wrong", res.incorrect.indexOf(i) !== -1));
    if (res.valid) {
      g.over = true;
      setStatus(g.mode === "computer" ? t("ui_status_you_win") : "");
      setResult(t("bingo_correct"));
      if (g.mode === "computer" && typeof GameStats !== "undefined") GameStats.record("bingo", "win");
      $("bingo-draw").disabled = true;
      $("bingo-check").disabled = true;
    } else setStatus(res.incorrect.length ? t("bingo_incorrect") : t("bingo_not_yet"));
    save();
  }

  function onNext() {
    if (!state.cards.length) return;
    state.active = (state.active + 1) % state.cards.length;
    setStatus(t("bingo_card") + " " + (state.active + 1));
    render();
    save();
  }

  function syncCount() {
    const mode = $("bingo-mode").value, count = $("bingo-count");
    count.disabled = mode === "caller";
    $("bingo-count-label").classList.toggle("hidden", mode === "computer");
    $("bingo-opp-label").classList.toggle("hidden", mode !== "computer");
  }

  function init() {
    const toggle = $("menu-toggle"), panel = $("settings-panel");
    if (toggle && panel) toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
    $("start-bingo-game").addEventListener("click", start);
    $("bingo-draw").addEventListener("click", onDraw);
    $("bingo-next").addEventListener("click", onNext);
    $("bingo-check").addEventListener("click", onCheck);
    $("bingo-print-btn").addEventListener("click", () => { if (!state.game) start(); renderPrint(); window.print(); });
    window.addEventListener("beforeprint", renderPrint);
    $("bingo-mode").addEventListener("change", syncCount);
    $("bingo-cpu-toggle").addEventListener("click", () => { state.showCpu = !state.showCpu; render(); save(); });
    syncCount();
    load();
    const T = (n, st) => Howto.tile(n, st, 44);
    Howto.init({ slug: "bingo", actions: ["bingo-draw"], steps: [
      { pics: T("17"), key: "bingo_howto_1" },
      { pics: T("17") + Howto.arrow() + T("17", "mark"), key: "bingo_howto_2" },
      { pics: T("4", "mark") + T("17", "mark") + T("9") + T("23", "mark"), key: "bingo_howto_3" },
      { pics: T("4", "mark") + T("17", "mark") + T("9", "mark") + T("23", "mark") + T("31", "mark"), key: "bingo_howto_4" }
    ] });
    if (typeof I18n.onChange === "function") I18n.onChange(() => { if (state.game) { render(); } });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
