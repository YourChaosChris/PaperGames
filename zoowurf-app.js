// zoowurf-app.js
// Wires ZoowurfCore ("Zoo Toss", rules 2 from task 145) to zoowurf.html.
//
// One person plays against one to three computers, or 2 to 4 people pass
// the device around. Every player has an own card. A turn is one roll with
// the "Roll the dice" button: every die that shows an animal of the card
// (or the paw) goes onto the card and is marked with a tick; a paw is put
// on the card by the player, who taps the open place of the animal it
// shall be. A player without a card first taps one of two open cards.
// The computers play their turns one after the other; then a panel shows
// each of them (card, dice, the animal each paw went on) and the "Next"
// button goes on. Pictures only, no word is needed to play; nothing is
// animated, no time limit; everything is black on white (a free place on
// a card is a dashed outline).
//
// Saved games of the first rules (no rules: 2) are dropped without a word.

const ZOOWURF_SAVE_KEY = "einkchess_save_zoowurf";

const AppStateZW = {
  state: null,
  log: [],      // the last turns that ended, newest first (not saved)
  logged: 0,    // state.seq of the newest logged turn
  review: null  // the computer turns just played, shown until "Next" (not saved)
};

function tZW(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameZW(i) {
  return DiceCommon.playerName(AppStateZW.state.computer, i);
}

function humansZW() {
  return AppStateZW.state.computer.filter((c) => !c).length;
}

function animalNameZW(a) {
  return tZW(a === ZoowurfCore.WILD ? "zw_wild" : "zw_animal_" + a);
}

/*** Save and load ***/

function saveZW() {
  if (typeof GameStorage === "undefined" || !AppStateZW.state) return;
  if (AppStateZW.state.phase === "over") {
    GameStorage.clear(ZOOWURF_SAVE_KEY);
    return;
  }
  GameStorage.save(ZOOWURF_SAVE_KEY, { state: AppStateZW.state });
}

function validStateZW(s) {
  return ZoowurfCore.isCurrentState(s) && s.phase !== "over";
}

/*** Game flow ***/

function startGameZW() {
  const mode = DiceCommon.activeMode();
  const n = parseInt(document.getElementById("zw-players").value, 10) || 2;
  const level = document.getElementById("zw-level").value === "beginner" ? "beginner" : "normal";
  AppStateZW.state = ZoowurfCore.newGame({ players: n, computer: DiceCommon.seats(mode, n), level: level });
  AppStateZW.log = [];
  AppStateZW.review = null;
  AppStateZW.logged = 0;
  setResultZW("");
  if (window.ResultModal) window.ResultModal.hide();
  DiceCommon.showBoard();
  afterActionZW();
}

// Remembers a turn that has just ended, to tell what happened.
function noteZW() {
  const s = AppStateZW.state;
  if (!s.last || s.seq === AppStateZW.logged) return;
  AppStateZW.logged = s.seq;
  AppStateZW.log.unshift(JSON.parse(JSON.stringify(s.last)));
  AppStateZW.log = AppStateZW.log.slice(0, 3);
}

// The computers play their turns one after the other, until a person is to
// move or the game is over; each turn is written down for the panel.
// Nothing is played after it until the person taps "Next".
// The panel starts with the turn the person has just played, so that the
// roll stays visible.
function runComputerTurnsZW() {
  let st = AppStateZW.state;
  const turns = [];
  if (st.last && !st.computer[st.last.player]) turns.push(JSON.parse(JSON.stringify(st.last)));
  let guard = 0;
  while (st.phase !== "over" && st.computer[st.current] && guard++ < 200) {
    const next = ZoowurfCore.aiStep(st);
    if (next === st) break;
    const ended = next.seq !== st.seq;
    st = next;
    if (ended && st.last) {
      turns.push(JSON.parse(JSON.stringify(st.last)));
      AppStateZW.state = st;
      noteZW();
    }
  }
  AppStateZW.state = st;
  if (turns.some((x) => st.computer[x.player])) AppStateZW.review = { turns: turns };
}

function afterActionZW() {
  noteZW();
  if (!AppStateZW.review && AppStateZW.state.phase !== "over" && AppStateZW.state.computer[AppStateZW.state.current]) runComputerTurnsZW();
  const s = AppStateZW.state;
  if (s.phase === "over" && !AppStateZW.review) finishZW();
  renderZW();
  saveZW();
}

function nextZW() {
  if (!AppStateZW.review) return;
  AppStateZW.review = null;
  afterActionZW();
}

function humanTurnZW() {
  const s = AppStateZW.state;
  return !!s && s.phase !== "over" && !s.computer[s.current] && !AppStateZW.review;
}

function rollZW() {
  const s = AppStateZW.state;
  if (!s || s.phase !== "roll" || s.computer[s.current] || AppStateZW.review) return;
  AppStateZW.state = ZoowurfCore.roll(s);
  afterActionZW();
}

function pawZW(a) {
  const s = AppStateZW.state;
  if (!humanTurnZW() || s.phase !== "paw") return;
  const next = ZoowurfCore.placePaw(s, a);
  if (next === s) return;
  AppStateZW.state = next;
  afterActionZW();
}

function chooseZW(i) {
  const s = AppStateZW.state;
  if (!humanTurnZW() || s.phase !== "choose" || AppStateZW.review) return;
  const next = ZoowurfCore.choose(s, i);
  if (next === s) return;
  AppStateZW.state = next;
  afterActionZW();
}

/*** End of the game ***/

function finishZW() {
  const s = AppStateZW.state;
  const humans = humansZW();
  let title;
  let text;
  if (s.winner === null) {
    title = "Draw";
    text = I18n.t("dg_draw") + " " + tZW("zw_shared", { names: s.winners.map(nameZW).join(", ") });
  } else if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winner + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tZW("dg_wins", { name: nameZW(s.winner) });
  } else {
    const nth = s.computer.slice(0, s.winner + 1).filter((c) => c).length;
    const several = s.computer.filter((c) => c).length > 1;
    title = humans === 1 ? "You lose" : (several ? "Computer " + nth : "Computer") + " wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tZW("dg_wins", { name: nameZW(s.winner) });
  }
  setResultZW(text);
  DiceCommon.showResult(title, s.scores.map((x, i) => nameZW(i) + ": " + tZW("zw_points", { n: x })).join(" · "));
  if (humans === 1 && s.computer.length > 1 && typeof GameStats !== "undefined") {
    GameStats.record("zoowurf", ZoowurfCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusZW(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultZW(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

// One die: a rounded square with the animal (or the paw) on it. A die
// that went onto the card has a thick frame and a tick; a die that did
// not has a thin frame; before the roll the face is empty and dashed.
function dieSvgZW(face, hit, size) {
  const empty = face === null || face === undefined;
  const px = size || 64;
  const rect = '<rect x="5" y="5" width="90" height="90" rx="16" fill="#ffffff" stroke="#141413" stroke-width="' + (hit ? 9 : 4) + '"' + (empty ? ' stroke-dasharray="10 8"' : "") + "/>";
  const pic = empty ? "" : '<g transform="translate(13 13) scale(1.23)">' + ZooIcons.inner(face) + "</g>";
  const tick = hit ? '<circle cx="80" cy="20" r="17" fill="#141413" stroke="#ffffff" stroke-width="4"/><path d="M71 20L78 27L90 13" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' : "";
  return '<svg class="zw-die" viewBox="0 0 100 100" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' + rect + pic + tick + "</svg>";
}

// The pictures of a card: one place per animal on it. With `need` given,
// the places that are still open are drawn dashed and white, the others
// are full. size: px of one picture.
function cardHtmlZW(card, need, size, tap) {
  const left = need ? need.slice() : null;
  let html = "";
  for (let a = 0; a < ZoowurfCore.ANIMALS; a++) {
    for (let k = 0; k < card[a]; k++) {
      let open = false;
      if (left && left[a] > 0 && k >= card[a] - left[a]) open = true;
      if (open && tap) html += '<button type="button" class="zw-slot zw-slot-open zw-slot-tap" data-animal="' + a + '" aria-label="' + tZW("zw_paw_here_aria", { animal: animalNameZW(a) }) + '">' + ZooIcons.svg(a, size) + "</button>";
      else html += '<span class="zw-slot' + (open ? " zw-slot-open" : "") + '">' + ZooIcons.svg(a, size) + "</span>";
    }
  }
  return html;
}

function cardAriaZW(card, need) {
  const parts = [];
  for (let a = 0; a < ZoowurfCore.ANIMALS; a++) {
    if (card[a] > 0) parts.push(card[a] + " " + animalNameZW(a));
  }
  let text = parts.join(", ");
  if (need) {
    const miss = ZoowurfCore.sum(need);
    text += ". " + tZW("zw_missing_aria", { n: miss });
  }
  return text;
}

function diceListHtmlZW(dice, size) {
  return dice.faces.map((f, i) => dieSvgZW(f, dice.hits[i], size)).join("");
}

function turnTextZW(l) {
  if (l.action === "win") return tZW("zw_last_full", { name: nameZW(l.player), n: l.size });
  return tZW("zw_last_got", { name: nameZW(l.player), n: l.got, m: l.left });
}

function renderLogZW() {
  const wrap = document.getElementById("zw-last");
  wrap.innerHTML = "";
  AppStateZW.log.forEach((l) => {
    const p = document.createElement("div");
    p.className = "zw-log-line";
    const t = document.createElement("span");
    t.textContent = turnTextZW(l);
    p.appendChild(t);
    if (l.dice) {
      const d = document.createElement("span");
      d.className = "zw-log-dice";
      d.innerHTML = diceListHtmlZW(l.dice, 30);
      p.appendChild(d);
    }
    wrap.appendChild(p);
  });
}

function turnStatusZW() {
  const s = AppStateZW.state;
  let end = "";
  if (s.ending && s.phase !== "over") end = " " + tZW("zw_last_round", { name: nameZW(s.endedBy), n: s.scores[s.endedBy] });
  if (AppStateZW.review) {
    const cpu = AppStateZW.review.turns.filter((x) => s.computer[x.player]).pop();
    return tZW("zw_cpu_title", { name: nameZW(cpu.player) }) + end;
  }
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn") + end;
  const who = humansZW() === 1 ? I18n.t("ui_status_your_turn") : tZW("dg_turn_of", { name: nameZW(s.current) });
  const hint = s.phase === "choose" ? tZW("zw_choose_hint") : (s.phase === "paw" ? tZW("zw_paw_hint") : tZW("zw_roll_hint"));
  return who + " " + hint + end;
}

function renderYardZW() {
  const s = AppStateZW.state;
  const wrap = document.getElementById("zw-yard");
  const human = humanTurnZW() && s.phase === "choose";
  wrap.innerHTML = "";
  s.yard.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "zw-open-card" + (human ? " zw-open-card-active" : "");
    b.innerHTML = cardHtmlZW(c, null, 38);
    b.setAttribute("aria-label", cardAriaZW(c, null) + (human ? ", " + tZW("zw_tap_aria") : ""));
    if (human) b.addEventListener("click", () => chooseZW(i));
    else b.setAttribute("aria-disabled", "true");
    wrap.appendChild(b);
  });
}

function renderPlayZW() {
  const s = AppStateZW.state;
  const card = document.getElementById("zw-card");
  const dice = document.getElementById("zw-dice");
  const play = s.phase === "roll" || s.phase === "paw" ? s.plays[s.current] : null;
  if (!play) {
    card.innerHTML = "";
    dice.innerHTML = "";
    return;
  }
  card.innerHTML = cardHtmlZW(play.card, play.need, 44, humanTurnZW() && s.phase === "paw");
  card.setAttribute("aria-label", cardAriaZW(play.card, play.need));
  let html;
  if (s.phase === "paw" && s.dice) {
    html = diceListHtmlZW(s.dice, 64);
    dice.setAttribute("aria-label", tZW("zw_dice_aria", { dice: s.dice.faces.map((f, i) => animalNameZW(f) + (s.dice.hits[i] ? " (" + tZW("zw_hit") + ")" : "")).join(", ") }));
  } else {
    html = "";
    for (let i = 0; i < ZoowurfCore.sum(play.need); i++) html += dieSvgZW(null, false, 64);
    dice.setAttribute("aria-label", tZW("dg_dice_none"));
  }
  dice.innerHTML = html;
}

// What the card of a turn still needed after the roll.
function needAfterZW(x) {
  const need = x.dice.from.slice();
  x.dice.faces.forEach((f, k) => {
    if (!x.dice.hits[k]) return;
    const a = f === ZoowurfCore.WILD ? x.dice.on[k] : f;
    if (a >= 0 && need[a] > 0) need[a]--;
  });
  return need;
}

// The panel with the turns the computers have just played.
function renderReviewZW() {
  const r = AppStateZW.review;
  const wrap = document.getElementById("zw-review");
  wrap.classList.toggle("hidden", !r);
  if (!r) { wrap.innerHTML = ""; return; }
  let h = "";
  r.turns.forEach((x) => {
    h += '<div class="zw-review-turn">';
    const mine = !AppStateZW.state.computer[x.player];
    h += '<div class="zw-review-title">' + (mine && humansZW() === 1 ? tZW("zw_your_roll") : tZW("zw_cpu_title", { name: nameZW(x.player) })) + "</div>";
    h += '<div class="pc-row"><span class="pc-row-label">' + tZW("zw_cpu_card") + '</span><div class="zw-card-big zw-card-small">' + cardHtmlZW(x.card, needAfterZW(x), 32) + "</div></div>";
    h += '<div class="zw-review-roll"><span class="zw-log-dice">' + diceListHtmlZW(x.dice, 40) + "</span>";
    x.dice.faces.forEach((f, k) => {
      const a = x.dice.on ? x.dice.on[k] : -1;
      if (f !== ZoowurfCore.WILD || !(a >= 0)) return;
      h += '<span class="zw-review-paw" role="img" aria-label="' + tZW("zw_cpu_paw_aria", { animal: animalNameZW(a) }) + '">' + dieSvgZW(ZoowurfCore.WILD, false, 30) + '<span aria-hidden="true">&rarr;</span>' + ZooIcons.svg(a, 30) + "</span>";
    });
    h += "</div>";
    h += '<div class="status-text">' + turnTextZW(x) + "</div>";
    h += "</div>";
  });
  h += '<div class="dg-actions"><button id="zw-next" class="primary" type="button">' + tZW("zw_next") + "</button></div>";
  wrap.innerHTML = h;
  document.getElementById("zw-next").addEventListener("click", nextZW);
}

function renderZW() {
  const s = AppStateZW.state;
  if (!s) return;
  const over = s.phase === "over";
  document.getElementById("zw-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, s.scores.map((n) => tZW("zw_count", { n: n, m: s.target })), over);
  const showing = !!AppStateZW.review;
  document.getElementById("zw-choose").classList.toggle("hidden", s.phase !== "choose" || showing);
  document.getElementById("zw-play").classList.toggle("hidden", !(s.phase === "roll" || s.phase === "paw") || showing);
  renderReviewZW();
  if (s.phase === "choose") renderYardZW();
  renderPlayZW();
  document.getElementById("zw-roll").disabled = !(humanTurnZW() && s.phase === "roll");
  setStatusZW(over && !showing ? "" : turnStatusZW());
  renderLogZW();
  document.getElementById("zw-last").classList.toggle("hidden", showing);
}

/*** Setup ***/

function initZoowurfApp() {
  DiceCommon.wireMenu();
  // the level only matters against the computer
  const showLevelZW = () => document.getElementById("zw-level-wrap").classList.toggle("hidden", DiceCommon.activeMode() === "hotseat");
  document.getElementById("mode-ai").addEventListener("click", () => { DiceCommon.setMode("ai"); showLevelZW(); });
  document.getElementById("mode-offline").addEventListener("click", () => { DiceCommon.setMode("hotseat"); showLevelZW(); });
  showLevelZW();
  document.getElementById("start-zw-game").addEventListener("click", startGameZW);
  document.getElementById("zw-roll").addEventListener("click", rollZW);
  document.getElementById("zw-card").addEventListener("click", (e) => {
    const b = e.target && e.target.closest ? e.target.closest("button[data-animal]") : null;
    if (b) pawZW(parseInt(b.getAttribute("data-animal"), 10));
  });
  const A = (id) => ZooIcons.svg(id, 34), Z = (face, hit) => dieSvgZW(face, hit, 44);
  Howto.init({ slug: "zoowurf", actions: ["zw-roll"], steps: [
    { pics: Howto.box(A(0) + A(0) + A(3)), key: "zw_howto_1" },
    { pics: Z(0, true) + Z(4) + Z("paw", true), key: "zw_howto_2" },
    { pics: Z("paw") + Howto.arrow() + Howto.box('<span class="zw-slot">' + A(0) + '</span><span class="zw-slot zw-slot-open">' + A(3) + "</span>"), key: "zw_howto_3" },
    { pics: Howto.box(A(0) + A(0) + A(3)) + Howto.sign("=") + Howto.sign("3"), key: "zw_howto_4" }
  ] });
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateZW.state) renderZW(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ZOOWURF_SAVE_KEY) : null;
  if (saved && validStateZW(saved.state)) {
    AppStateZW.state = saved.state;
    document.getElementById("zw-level").value = saved.state.level === "beginner" ? "beginner" : "normal";
    AppStateZW.log = [];
    AppStateZW.logged = saved.state.seq || 0;
    DiceCommon.showBoard();
    afterActionZW();
  } else if (saved && typeof GameStorage !== "undefined") {
    // a game of the first rules (or a broken one): dropped without a word
    GameStorage.clear(ZOOWURF_SAVE_KEY);
  }
}

document.addEventListener("DOMContentLoaded", initZoowurfApp);
