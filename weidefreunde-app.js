// weidefreunde-app.js
// Wires WeidefreundeCore ("Pasture Friends") to weidefreunde.html.
//
// One person plays against one to three computers, or 2 to 4 people pass
// the device around. Tap "Roll the die" (a large die with a picture of an
// animal or the farmer). If the open row (the yard) shows that animal and
// your pasture does not have it, the card moves to your pasture by itself.
// With the farmer you tap a yard card you still miss; without a match you
// tap a yard card to send it back. The computer plays its whole turn at
// once and the lines under the board tell what it did. Pictures only, no
// word is needed to play; nothing is animated, no time limit; everything
// is black on white (a free place on a pasture is a dashed outline).

const WEIDEFREUNDE_SAVE_KEY = "einkchess_save_weidefreunde";

const AppStateWF = {
  state: null,
  log: [],      // the last turns that ended, newest first (not saved)
  logged: 0     // state.seq of the newest logged turn
};

function tWF(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameWF(i) {
  return DiceCommon.playerName(AppStateWF.state.computer, i);
}

function humansWF() {
  return AppStateWF.state.computer.filter((c) => !c).length;
}

function animalNameWF(a) {
  return tWF(a === WeidefreundeCore.FARMER ? "wf_farmer" : "wf_animal_" + a);
}

/*** How it works: a picture explanation before the first game ***/

// One picture row of the explanation: the picture(s) and its sentence.
function howtoRowWF(pics, key) {
  return '<li class="wf-howto-item"><span class="wf-howto-pics" aria-hidden="true">' + pics + '</span><span class="wf-howto-text">' + tWF(key) + "</span></li>";
}

function howtoHtmlWF() {
  const arrow = '<svg class="wf-howto-arrow" viewBox="0 0 30 20" width="30" height="20" focusable="false"><path d="M2 10H24M17 3L25 10L17 17" fill="none" stroke="#141413" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const card = (a) => '<span class="wf-card wf-howto-card">' + WeideIcons.svg(a, 40) + "</span>";
  const slot = (a, own) => '<span class="wf-slot ' + (own ? "wf-slot-own" : "wf-slot-free") + ' wf-howto-slot">' + WeideIcons.svg(a, 36) + "</span>";
  let all = "";
  for (let a = 0; a < WeidefreundeCore.ANIMALS; a++) all += slot(a, true);
  return '<ol class="wf-howto-list">' +
    howtoRowWF(dieSvgWF(0, 56), "wf_howto_1") +
    howtoRowWF(card(0) + arrow + slot(0, true), "wf_howto_2") +
    howtoRowWF(card("farmer") + arrow + slot(1, true), "wf_howto_3") +
    howtoRowWF(all, "wf_howto_4") +
    "</ol>";
}

function renderHowtoWF() {
  const box = document.getElementById("wf-howto-body");
  if (box) box.innerHTML = howtoHtmlWF();
}

// The explanation opens by itself until the first roll on this device;
// afterwards the button "How does it work?" shows it again.
const WF_HOWTO_SEEN = "papergames_wf_howto_seen";

function howtoSeenWF() {
  try { return !!(window.localStorage && window.localStorage.getItem(WF_HOWTO_SEEN)); } catch (e) { return false; }
}

function markHowtoSeenWF() {
  try { if (window.localStorage) window.localStorage.setItem(WF_HOWTO_SEEN, "1"); } catch (e) { /* the explanation just opens again next time */ }
  setHowtoWF(false);
}

function setHowtoWF(show) {
  const panel = document.getElementById("wf-howto");
  const btn = document.getElementById("wf-howto-toggle");
  if (panel) panel.classList.toggle("hidden", !show);
  if (btn && window.I18n) I18n.setKey(btn, show ? "wf_howto_hide" : "wf_howto_show");
}

/*** Save and load ***/

function saveWF() {
  if (typeof GameStorage === "undefined" || !AppStateWF.state) return;
  if (AppStateWF.state.phase === "over") {
    GameStorage.clear(WEIDEFREUNDE_SAVE_KEY);
    return;
  }
  GameStorage.save(WEIDEFREUNDE_SAVE_KEY, { state: AppStateWF.state });
}

function validStateWF(s) {
  return !!s && s.game === "weidefreunde" && Array.isArray(s.yard) && Array.isArray(s.pile) && Array.isArray(s.own) && Array.isArray(s.computer) && s.phase !== "over";
}

/*** Game flow ***/

function startGameWF() {
  const mode = DiceCommon.activeMode();
  const n = parseInt(document.getElementById("wf-players").value, 10) || 2;
  AppStateWF.state = WeidefreundeCore.newGame({ players: n, computer: DiceCommon.seats(mode, n) });
  AppStateWF.log = [];
  AppStateWF.logged = 0;
  setResultWF("");
  if (window.ResultModal) window.ResultModal.hide();
  DiceCommon.showBoard();
  afterActionWF();
}

// Remembers a turn that has just ended, to tell what happened.
function noteWF() {
  const s = AppStateWF.state;
  if (!s.last || s.seq === AppStateWF.logged) return;
  AppStateWF.logged = s.seq;
  AppStateWF.log.unshift(JSON.parse(JSON.stringify(s.last)));
  AppStateWF.log = AppStateWF.log.slice(0, s.n);
}

// The computers play at once until a person is to roll or the game is over.
function runComputersWF() {
  let guard = 0;
  while (AppStateWF.state.phase !== "over" && AppStateWF.state.computer[AppStateWF.state.current] && guard++ < 2000) {
    const next = WeidefreundeCore.aiStep(AppStateWF.state);
    if (next === AppStateWF.state) break;
    AppStateWF.state = next;
    noteWF();
  }
}

function afterActionWF() {
  noteWF();
  runComputersWF();
  const s = AppStateWF.state;
  if (s.phase === "over") finishWF();
  renderWF();
  saveWF();
}

function humanTurnWF() {
  const s = AppStateWF.state;
  return !!s && s.phase !== "over" && !s.computer[s.current];
}

function rollWF() {
  const s = AppStateWF.state;
  if (!s || s.phase !== "roll" || s.computer[s.current]) return;
  markHowtoSeenWF();
  AppStateWF.state = WeidefreundeCore.roll(s);
  afterActionWF();
}

function tapCardWF(i) {
  const s = AppStateWF.state;
  if (!humanTurnWF()) return;
  let next = s;
  if (s.phase === "pick") next = WeidefreundeCore.pick(s, i);
  else if (s.phase === "swap") next = WeidefreundeCore.swap(s, i);
  if (next === s) return;
  AppStateWF.state = next;
  afterActionWF();
}

/*** End of the game ***/

function finishWF() {
  const s = AppStateWF.state;
  const humans = humansWF();
  let title;
  let text;
  if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winner + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tWF("dg_wins", { name: nameWF(s.winner) });
  } else {
    const nth = s.computer.slice(0, s.winner + 1).filter((c) => c).length;
    const several = s.computer.filter((c) => c).length > 1;
    title = humans === 1 ? "You lose" : (several ? "Computer " + nth : "Computer") + " wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tWF("dg_wins", { name: nameWF(s.winner) });
  }
  setResultWF(text);
  DiceCommon.showResult(title, tWF("wf_full_pasture"));
  if (humans === 1 && s.computer.length > 1 && typeof GameStats !== "undefined") {
    GameStats.record("weidefreunde", WeidefreundeCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusWF(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultWF(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

// The die: a rounded square with the animal (or the farmer) on it; a
// dashed empty face before the roll.
function dieSvgWF(face, size) {
  const empty = face === null || face === undefined;
  const rect = '<rect x="5" y="5" width="90" height="90" rx="16" fill="#ffffff" stroke="#141413" stroke-width="6"' + (empty ? ' stroke-dasharray="10 8"' : "") + "/>";
  const pic = empty ? "" : '<g transform="translate(13 13) scale(1.23)">' + WeideIcons.inner(face) + "</g>";
  return '<svg class="dg-die wf-die-svg" viewBox="0 0 100 100" width="' + (size || 96) + '" height="' + (size || 96) + '" aria-hidden="true" focusable="false">' + rect + pic + "</svg>";
}

function turnTextWF(l) {
  const v = { name: nameWF(l.player), animal: animalNameWF(l.animal) };
  if (l.action === "take") return tWF("wf_last_take", v);
  if (l.action === "farmer") return tWF("wf_last_farmer", v);
  v.shown = l.shown === null || l.shown === undefined ? "" : animalNameWF(l.shown);
  return tWF("wf_last_swap", v);
}

function renderLogWF() {
  const wrap = document.getElementById("wf-last");
  wrap.innerHTML = "";
  AppStateWF.log.forEach((l) => {
    const p = document.createElement("div");
    p.className = "wf-log-line";
    const d = document.createElement("span");
    d.className = "wf-log-die";
    d.innerHTML = dieSvgWF(l.die, 36);
    p.appendChild(d);
    const t = document.createElement("span");
    t.textContent = turnTextWF(l);
    p.appendChild(t);
    wrap.appendChild(p);
  });
}

function turnStatusWF() {
  const s = AppStateWF.state;
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansWF() === 1 ? I18n.t("ui_status_your_turn") : tWF("dg_turn_of", { name: nameWF(s.current) });
  const hint = s.phase === "roll" ? tWF("wf_roll_hint") : s.phase === "pick" ? tWF("wf_pick_hint") : tWF("wf_swap_hint");
  return who + " " + hint;
}

function renderYardWF() {
  const s = AppStateWF.state;
  const wrap = document.getElementById("wf-yard");
  const human = humanTurnWF();
  wrap.innerHTML = "";
  s.yard.forEach((a, i) => {
    const can = human && ((s.phase === "pick" && WeidefreundeCore.lacks(s, s.current, a)) || s.phase === "swap");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "wf-card" + (can ? " wf-card-active" : "");
    b.innerHTML = WeideIcons.svg(a, 56);
    b.setAttribute("aria-label", tWF(can ? "wf_card_aria_tap" : "wf_card_aria", { animal: animalNameWF(a) }));
    if (can) b.addEventListener("click", () => tapCardWF(i));
    else b.setAttribute("aria-disabled", "true");
    wrap.appendChild(b);
  });
}

function renderPasturesWF() {
  const s = AppStateWF.state;
  const wrap = document.getElementById("wf-pastures");
  let html = "";
  s.own.forEach((o, p) => {
    const on = s.phase !== "over" && p === s.current;
    html += '<div class="wf-pasture' + (on ? " wf-pasture-active" : "") + '" role="group" aria-label="' + nameWF(p) + '">' + DiceCommon.markerSvg(p, "dg-marker wf-pasture-marker");
    html += '<span class="wf-slots">';
    for (let a = 0; a < WeidefreundeCore.ANIMALS; a++) {
      html += '<span class="wf-slot' + (o[a] ? " wf-slot-own" : " wf-slot-free") + '" role="img" aria-label="' +
        tWF(o[a] ? "wf_slot_own_aria" : "wf_slot_free_aria", { animal: animalNameWF(a) }) + '">' + WeideIcons.svg(a, 44) + "</span>";
    }
    html += "</span></div>";
  });
  wrap.innerHTML = html;
}

function renderWF() {
  const s = AppStateWF.state;
  if (!s) return;
  const over = s.phase === "over";
  document.getElementById("wf-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, s.own.map((o, p) => tWF("wf_count", { n: WeidefreundeCore.count(s, p), m: WeidefreundeCore.ANIMALS })), over);
  const die = document.getElementById("wf-die");
  die.innerHTML = dieSvgWF(s.die);
  die.setAttribute("aria-label", s.die === null ? tWF("dg_dice_none") : tWF("wf_die_aria", { face: animalNameWF(s.die) }));
  renderYardWF();
  renderPasturesWF();
  document.getElementById("wf-roll").disabled = !(humanTurnWF() && s.phase === "roll");
  setStatusWF(over ? "" : turnStatusWF());
  renderLogWF();
}

/*** Setup ***/

function initWeidefreundeApp() {
  DiceCommon.wireMenu();
  document.getElementById("mode-ai").addEventListener("click", () => DiceCommon.setMode("ai"));
  document.getElementById("mode-offline").addEventListener("click", () => DiceCommon.setMode("hotseat"));
  document.getElementById("start-wf-game").addEventListener("click", startGameWF);
  document.getElementById("wf-roll").addEventListener("click", rollWF);
  document.getElementById("wf-howto-toggle").addEventListener("click", () => {
    setHowtoWF(document.getElementById("wf-howto").classList.contains("hidden"));
  });
  renderHowtoWF();
  setHowtoWF(!howtoSeenWF());
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { renderHowtoWF(); if (AppStateWF.state) renderWF(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(WEIDEFREUNDE_SAVE_KEY) : null;
  if (saved && validStateWF(saved.state)) {
    AppStateWF.state = saved.state;
    AppStateWF.log = [];
    AppStateWF.logged = saved.state.seq || 0;
    DiceCommon.showBoard();
    afterActionWF();
  }
}

document.addEventListener("DOMContentLoaded", initWeidefreundeApp);
