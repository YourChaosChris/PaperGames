// schafkopf-app.js
// Wires SchafkopfCore/SchafkopfAi to schafkopf.html: you against three
// computers (Easy, Medium, Hard) with the German-suited cards.
//
// Announcing is guided: on your turn only the games you may announce
// are buttons (a Sauspiel only on a Sow you may call). Tricks: tap a
// card; cards that may not be played are dimmed, and the status line
// says why (follow suit, the called Sow). The computers act one after
// another with a pause (AiPacing). After each game the tariff is worked
// out and added to the points list.

const SCHAFKOPF_SAVE_KEY = "einkchess_save_schafkopf";

const AppStateSf = {
  level: 2,
  state: null,
  dealer: 3,
  list: [],
  totals: [0, 0, 0, 0],
  busy: false,
  lastTrickShown: null
};

function nameSf(p) { return p === 0 ? "You" : "Computer " + p; }
function cardTextSf(c) { return GermanCards.label(c, "bavarian"); }
const SF_SUIT = { C: "Acorn", S: "Grass", H: "Heart", D: "Bell" };

// The game's name as one English text with its own translation key.
function gameNameSf(g) {
  if (g.type === "sau") return "Sauspiel: " + SF_SUIT[g.suit] + " Sow";
  if (g.type === "wenz") return "Wenz";
  return SF_SUIT[g.suit] + " Solo";
}

function setStatusSf(text) { const el = document.getElementById("board-info"); if (el) I18n.setMsg(el, text || ""); }
function setResultSf(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveSf() {
  if (typeof GameStorage === "undefined" || !AppStateSf.state) return;
  GameStorage.save(SCHAFKOPF_SAVE_KEY, { level: AppStateSf.level, state: AppStateSf.state, dealer: AppStateSf.dealer, list: AppStateSf.list, totals: AppStateSf.totals });
}

/*** Setup ***/

function initSchafkopfApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-sf-game").addEventListener("click", () => startGameSf(parseInt(document.getElementById("sf-level").value, 10)));
  document.getElementById("sf-next").addEventListener("click", nextGameSf);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateSf.state) renderSf(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SCHAFKOPF_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.hands)) {
    Object.assign(AppStateSf, { level: saved.level || 2, state: saved.state, dealer: saved.dealer, list: saved.list || [], totals: saved.totals || [0, 0, 0, 0] });
    showBoardSf();
    promptSf();
    continueSf();
  }
}

function showBoardSf() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameSf(level) {
  AppStateSf.level = level >= 1 && level <= 3 ? level : 2;
  AppStateSf.list = [];
  AppStateSf.totals = [0, 0, 0, 0];
  AppStateSf.dealer = Math.floor(Math.random() * 4);
  setResultSf("");
  showBoardSf();
  dealSf();
}

function dealSf() {
  AppStateSf.state = SchafkopfCore.deal(AppStateSf.dealer);
  AppStateSf.busy = false;
  AppStateSf.lastTrickShown = null;
  saveSf();
  promptSf("New game: " + nameSf(AppStateSf.dealer) + " deals.");
  continueSf();
}

function nextGameSf() {
  const s = AppStateSf.state;
  if (!s || s.phase !== "over" || AppStateSf.busy) return;
  AppStateSf.dealer = (AppStateSf.dealer + 1) % 4;
  setResultSf("");
  dealSf();
}

/*** Turns ***/

function actorSf(s) {
  if (s.phase === "announce") return s.announceTurn;
  if (s.phase === "play") return s.turn;
  return -1;
}

function promptSf(prefix) {
  const s = AppStateSf.state;
  const a = actorSf(s);
  let text = "";
  if (s.phase === "over") text = "";
  else if (a !== 0) text = nameSf(a) + "'s turn.";
  else if (s.phase === "announce") text = "Your turn: pass or announce a game.";
  else text = "Your turn: play a card.";
  setStatusSf(((prefix ? prefix + " " : "") + text).trim());
  renderSf();
}

function continueSf() {
  const s = AppStateSf.state;
  if (!s || AppStateSf.busy || s.phase === "over") return;
  const a = actorSf(s);
  if (a <= 0) return;
  AppStateSf.busy = true;
  setTimeout(() => {
    AppStateSf.busy = false;
    if (AppStateSf.state !== s) return;
    if (s.phase === "announce") announceSf(SchafkopfAi.announceChoice(s, AppStateSf.level));
    else playSf(SchafkopfAi.chooseCard(s, AppStateSf.level));
  }, AiPacing.delay(s.phase === "play" ? 900 : 700));
}

function announceSf(game) {
  const s = AppStateSf.state;
  const p = s.announceTurn;
  const next = SchafkopfCore.announce(s, game);
  if (!next) return;
  AppStateSf.state = next;
  let text = game ? (p === 0 ? "You announce " + gameNameSf(game) + "." : nameSf(p) + " announces " + gameNameSf(game) + ".")
    : (p === 0 ? "You pass." : nameSf(p) + " passes.");
  if (next.phase === "over") {
    text += " All pass - the cards are thrown in.";
    AppStateSf.list.push({ thrownIn: true });
    setResultSf("All pass - the cards are thrown in.");
    saveSf();
    promptSf(text);
    return;
  }
  if (next.phase === "play") {
    text += " " + (next.player === 0 ? "You are the player: " + gameNameSf(next.game) + "." : nameSf(next.player) + " is the player: " + gameNameSf(next.game) + ".");
    if (next.partner === 0) text += " You hold the called Sow: you are the partner.";
  }
  saveSf();
  promptSf(text);
  continueSf();
}

function playSf(card) {
  const s = AppStateSf.state;
  const p = s.turn;
  const sow = SchafkopfCore.calledSow(s);
  const next = SchafkopfCore.playCard(s, card);
  if (!next) return;
  AppStateSf.state = next;
  let text = p === 0 ? "You play " + cardTextSf(card) + "." : nameSf(p) + " plays " + cardTextSf(card) + ".";
  if (sow && SchafkopfCore.same(sow, card) && p !== 0) text += " " + nameSf(p) + " is the partner.";
  if (next.trick.length === 0 && next.lastTrick) {
    const w = next.lastTrick.winner;
    const pts = SchafkopfCore.pointsOf(next.lastTrick.cards.map((e) => e.card));
    text += " " + (w === 0 ? "You win the trick (" + pts + " points)." : nameSf(w) + " wins the trick (" + pts + " points).");
    AppStateSf.lastTrickShown = next.lastTrick;
  } else AppStateSf.lastTrickShown = null;
  if (next.phase === "over") { finishSf(text); return; }
  saveSf();
  promptSf(text);
  continueSf();
}

// Why a card may not be played (for the status line).
function whyNotSf(s, card) {
  const sow = SchafkopfCore.calledSow(s);
  const hand = s.hands[0];
  const holds = sow && hand.some((c) => SchafkopfCore.same(c, sow));
  if (!s.trick.length) return "You may lead the called suit only with the Sow.";
  const g = s.game;
  const led = SchafkopfCore.group(g, s.trick[0].card);
  const canFollow = hand.some((c) => SchafkopfCore.group(g, c) === led);
  if (holds && led === sow.suit) return "You must play the called Sow.";
  if (canFollow) return "You must follow suit.";
  return "The called Sow may not be thrown away yet.";
}

function onHandCardSf(card) {
  const s = AppStateSf.state;
  if (!s || AppStateSf.busy || s.phase !== "play" || s.turn !== 0) return;
  if (!SchafkopfCore.legalCards(s, 0).some((c) => SchafkopfCore.same(c, card))) { setStatusSf(whyNotSf(s, card)); return; }
  playSf(card);
}

function finishSf(prefix) {
  const s = AppStateSf.state;
  const r = s.result;
  for (let p = 0; p < 4; p++) AppStateSf.totals[p] += r.deltas[p];
  AppStateSf.list.push({ game: s.game, player: s.player, deltas: r.deltas });
  const sideText = r.won ? "The playing side wins with " + r.points + " points." : "The playing side loses with " + r.points + " points.";
  const mine = r.deltas[0];
  const you = mine > 0 ? "You win " + mine + " points." : "You lose " + (-mine) + " points.";
  if (typeof GameStats !== "undefined") GameStats.record("schafkopf", mine > 0 ? "win" : "loss");
  setResultSf(sideText + " " + you);
  saveSf();
  promptSf((prefix ? prefix + " " : "") + sideText + " " + you);
}

/*** Rendering ***/

function cardElSf(card, tag, extra) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button"; else el.setAttribute("role", "img");
  el.className = "pc-card" + (extra ? " " + extra : "");
  GermanCards.renderTall(el, card);
  I18n.setAria(el, cardTextSf(card));
  return el;
}

function sortedSf(cards, game) {
  const g = game || { type: "sau" };
  const so = { C: 4, S: 3, H: 2, D: 1 };
  const plain = { 14: 8, 10: 7, 13: 6, 12: 5, 11: 4, 9: 3, 8: 2, 7: 1 };
  const key = (c) => SchafkopfCore.isTrump(g, c) ? 1000 + SchafkopfCore.strength(g, c, "T") : 100 * so[c.suit] + plain[c.rank];
  return cards.slice().sort((a, b) => key(b) - key(a));
}

function addSpanSf(el, text, cls) {
  const sp = document.createElement("span");
  if (cls) sp.className = cls;
  I18n.setMsg(sp, text);
  el.appendChild(sp);
  return sp;
}

function renderSf() {
  const s = AppStateSf.state;
  if (!s) return;
  const over = s.phase === "over";
  // Game line
  const line = document.getElementById("sf-game-line");
  line.innerHTML = "";
  if (s.game) {
    addSpanSf(line, gameNameSf(s.game), "sk-game-name");
    line.appendChild(document.createTextNode(" · "));
    addSpanSf(line, "Player: " + nameSf(s.player));
  } else addSpanSf(line, over ? "thrown in" : "Announcing");
  // Who is known to play with whom (from your view).
  const playersEl = document.getElementById("sf-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < 4; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (actorSf(s) === p && !over ? " game-player-active" : "");
    addSpanSf(row, nameSf(p), "game-player-name");
    if (p === s.dealer) { row.appendChild(document.createTextNode(" ")); addSpanSf(row, "Dealer", "dk-party"); }
    if (s.phase === "announce" && s.announced[p] !== null && s.announced[p] !== undefined) {
      row.appendChild(document.createTextNode(" "));
      addSpanSf(row, gameNameSf(s.announced[p]), "dk-party");
    }
    if (s.game) {
      const known = over ? (SchafkopfCore.team(s, p) === "player" ? "player side" : null) : sideTagSf(s, p);
      if (known) { row.appendChild(document.createTextNode(" ")); addSpanSf(row, known, "dk-party"); }
      row.appendChild(document.createTextNode(" "));
      addSpanSf(row, s.trickCount[p] === 1 ? "1 trick" : s.trickCount[p] + " tricks", "game-player-count");
    }
    const tot = document.createElement("span");
    tot.className = "pc-player-extra";
    tot.textContent = "Σ " + (AppStateSf.totals[p] > 0 ? "+" : "") + AppStateSf.totals[p];
    row.appendChild(tot);
    playersEl.appendChild(row);
  }
  // Announcing panel
  const ann = document.getElementById("sf-announce");
  const myAnn = s.phase === "announce" && s.announceTurn === 0 && !AppStateSf.busy;
  ann.classList.toggle("hidden", !myAnn);
  if (myAnn) {
    const box = document.getElementById("sf-announce-buttons");
    box.innerHTML = "";
    const add = (text, cls, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = cls; I18n.setMsg(b, text); b.addEventListener("click", fn); box.appendChild(b); };
    add("Pass (weiter)", "secondary", () => announceSf(null));
    SchafkopfCore.allowedGames(s).forEach((g) => add(gameNameSf(g), "primary", () => announceSf(g)));
  }
  // Trick
  const trickEl = document.getElementById("sf-trick");
  trickEl.innerHTML = "";
  const shown = s.trick.length ? null : AppStateSf.lastTrickShown;
  const cards = shown ? shown.cards : s.trick;
  trickEl.classList.toggle("hidden", s.phase !== "play" && !shown);
  for (let p = 0; p < 4; p++) {
    const slot = document.createElement("div");
    const k = cards.findIndex((e) => e.player === p);
    const win = shown && shown.winner === p;
    slot.className = "dk-slot" + (win ? " dk-slot-win" : "");
    addSpanSf(slot, nameSf(p), "dk-slot-name");
    if (k !== -1) slot.appendChild(cardElSf(cards[k].card, "span", "pc-card-small"));
    else { const e = document.createElement("span"); e.className = "pc-card pc-card-small dk-slot-empty"; e.setAttribute("aria-hidden", "true"); slot.appendChild(e); }
    const mark = document.createElement("span");
    mark.className = "dk-slot-mark";
    if (win) I18n.setMsg(mark, "wins");
    slot.appendChild(mark);
    trickEl.appendChild(slot);
  }
  renderScoreSf(s);
  // Hand
  const handEl = document.getElementById("sf-hand-cards");
  handEl.innerHTML = "";
  const myPlay = s.phase === "play" && s.turn === 0 && !AppStateSf.busy;
  const legal = myPlay ? SchafkopfCore.legalCards(s, 0) : [];
  sortedSf(s.hands[0], s.game).forEach((c) => {
    const ok = legal.some((x) => SchafkopfCore.same(x, c));
    const btn = cardElSf(c, "button", myPlay && !ok ? "pc-card-dim" : "");
    btn.disabled = !myPlay;
    btn.addEventListener("click", () => onHandCardSf(c));
    handEl.appendChild(btn);
  });
  I18n.setMsg(document.getElementById("sf-hand-label"), "Your cards: " + s.hands[0].length);
  document.getElementById("sf-next-row").classList.toggle("hidden", !over);
}

// The side tag a player shows from your point of view.
function sideTagSf(s, p) {
  if (p === s.player) return "player";
  const k = SchafkopfAi.knownSide(s, 0, p);
  if (s.game.type === "sau" && p === s.partner && (k !== null || 0 === s.partner)) return "partner";
  return null;
}

function renderScoreSf(s) {
  const el = document.getElementById("sf-score");
  const over = s.phase === "over";
  el.classList.toggle("hidden", !over);
  if (!over) return;
  el.innerHTML = "";
  const para = (t) => { const p = document.createElement("p"); I18n.setMsg(p, t); el.appendChild(p); return p; };
  const r = s.result;
  if (!r.thrownIn) {
    para("Playing side: " + r.points + " points, others: " + r.otherPoints + " points.");
    const T = SchafkopfCore.TARIFF;
    const parts = ["Base " + (s.game.type === "sau" ? T.sau : T[s.game.type])];
    if (r.schneider) parts.push("Schneider " + T.extra);
    if (r.schwarz) parts.push("Schwarz " + T.extra);
    if (r.laufende) parts.push("Laufende " + r.laufende + " × " + T.extra);
    const p = document.createElement("p");
    parts.forEach((t, i) => { if (i) p.appendChild(document.createTextNode(" + ")); addSpanSf(p, t); });
    p.appendChild(document.createTextNode(" = " + r.tariff));
    el.appendChild(p);
    para(s.game.type === "sau" ? "Each of the two losers pays one winner " + r.tariff + " points." : "Each of the three others pays or gets " + r.tariff + " points.");
  }
  const table = document.createElement("table");
  table.className = "dk-score-table sk-list sf-list";
  // Four player columns: the game takes its own row above its points,
  // so the list fits narrow screens in every language.
  const hr = document.createElement("tr");
  ["#", nameSf(0), nameSf(1), nameSf(2), nameSf(3)].forEach((h) => { const th = document.createElement("th"); I18n.setMsg(th, h); hr.appendChild(th); });
  table.appendChild(hr);
  AppStateSf.list.forEach((e, i) => {
    const tr = document.createElement("tr");
    const c0 = document.createElement("td"); c0.textContent = String(i + 1); c0.rowSpan = e.thrownIn ? 1 : 2; tr.appendChild(c0);
    const c1 = document.createElement("td");
    c1.className = "sk-game-cell"; c1.colSpan = 4; I18n.setMsg(c1, e.thrownIn ? "thrown in" : gameNameSf(e.game)); tr.appendChild(c1);
    table.appendChild(tr);
    if (e.thrownIn) return;
    const tr2 = document.createElement("tr");
    for (let q = 0; q < 4; q++) { const td = document.createElement("td");
      td.className = "sk-num"; td.textContent = (e.deltas[q] > 0 ? "+" : "") + e.deltas[q]; tr2.appendChild(td); }
    table.appendChild(tr2);
  });
  const foot = document.createElement("tr");
  const f0 = document.createElement("td"); f0.textContent = "Σ"; foot.appendChild(f0);
  for (let q = 0; q < 4; q++) { const td = document.createElement("td");
      td.className = "sk-num"; td.textContent = String(AppStateSf.totals[q]); foot.appendChild(td); }
  table.appendChild(foot);
  const wrap = document.createElement("div");
  wrap.className = "sk-list-wrap";
  wrap.appendChild(table);
  el.appendChild(wrap);
}

document.addEventListener("DOMContentLoaded", initSchafkopfApp);
