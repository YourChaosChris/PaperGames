// zoowurf-app.js
// Wires ZoowurfCore ("Zoo Toss") to zoowurf.html.
//
// One person plays against one to three computers, or 2 to 4 people pass
// the device around. At the start of a round the player to move taps one
// of two open cards. Then the dice are rolled with the "Roll the dice"
// button: every die that shows an animal of the card (or the paw) goes
// onto the card at once and is marked with a tick; up to three rolls make
// a turn. The computers play their whole turns at once and the lines under
// the board tell what they did, with the dice they rolled last. Pictures
// only, no word is needed to play; nothing is animated, no time limit;
// everything is black on white (a free place on a card is a dashed
// outline).

const ZOOWURF_SAVE_KEY = "einkchess_save_zoowurf";

const AppStateZW = {
  state: null,
  log: [],      // the last turns that ended, newest first (not saved)
  logged: 0     // state.seq of the newest logged turn
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
  return !!s && s.game === "zoowurf" && Array.isArray(s.yard) && Array.isArray(s.pile) && Array.isArray(s.scores) && Array.isArray(s.computer) && s.phase !== "over" &&
    (s.phase !== "roll" || (!!s.play && Array.isArray(s.play.need) && Array.isArray(s.play.card)));
}

/*** Game flow ***/

function startGameZW() {
  const mode = DiceCommon.activeMode();
  const n = parseInt(document.getElementById("zw-players").value, 10) || 2;
  const level = document.getElementById("zw-level").value === "beginner" ? "beginner" : "normal";
  AppStateZW.state = ZoowurfCore.newGame({ players: n, computer: DiceCommon.seats(mode, n), level: level });
  AppStateZW.log = [];
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

// The computers play at once until a person is to act or the game is over.
function runComputersZW() {
  let guard = 0;
  while (AppStateZW.state.phase !== "over" && AppStateZW.state.computer[AppStateZW.state.current] && guard++ < 2000) {
    const next = ZoowurfCore.aiStep(AppStateZW.state);
    if (next === AppStateZW.state) break;
    AppStateZW.state = next;
    noteZW();
  }
}

function afterActionZW() {
  noteZW();
  runComputersZW();
  const s = AppStateZW.state;
  if (s.phase === "over") finishZW();
  renderZW();
  saveZW();
}

function humanTurnZW() {
  const s = AppStateZW.state;
  return !!s && s.phase !== "over" && !s.computer[s.current];
}

function rollZW() {
  const s = AppStateZW.state;
  if (!s || s.phase !== "roll" || s.computer[s.current]) return;
  AppStateZW.state = ZoowurfCore.roll(s);
  afterActionZW();
}

function chooseZW(i) {
  const s = AppStateZW.state;
  if (!humanTurnZW() || s.phase !== "choose") return;
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
  if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winner + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tZW("dg_wins", { name: nameZW(s.winner) });
  } else {
    const nth = s.computer.slice(0, s.winner + 1).filter((c) => c).length;
    const several = s.computer.filter((c) => c).length > 1;
    title = humans === 1 ? "You lose" : (several ? "Computer " + nth : "Computer") + " wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tZW("dg_wins", { name: nameZW(s.winner) });
  }
  setResultZW(text);
  DiceCommon.showResult(title, tZW("zw_full_hand", { n: s.target }));
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
function cardHtmlZW(card, need, size) {
  const left = need ? need.slice() : null;
  let html = "";
  for (let a = 0; a < ZoowurfCore.ANIMALS; a++) {
    for (let k = 0; k < card[a]; k++) {
      let open = false;
      if (left && left[a] > 0 && k >= card[a] - left[a]) open = true;
      html += '<span class="zw-slot' + (open ? " zw-slot-open" : "") + '">' + ZooIcons.svg(a, size) + "</span>";
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
  const v = { name: nameZW(l.player), n: l.left };
  return tZW(l.action === "win" ? "zw_last_win" : "zw_last_pass", v);
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
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansZW() === 1 ? I18n.t("ui_status_your_turn") : tZW("dg_turn_of", { name: nameZW(s.current) });
  const hint = s.phase === "choose" ? tZW("zw_choose_hint") : tZW("zw_roll_hint", { n: s.rolls + 1 });
  return who + " " + hint;
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
  const rolls = document.getElementById("zw-rolls");
  if (!s.play) {
    card.innerHTML = "";
    dice.innerHTML = "";
    rolls.innerHTML = "";
    return;
  }
  card.innerHTML = cardHtmlZW(s.play.card, s.play.need, 44);
  card.setAttribute("aria-label", cardAriaZW(s.play.card, s.play.need));
  let html;
  if (s.rolls > 0 && s.dice) {
    html = diceListHtmlZW(s.dice, 64);
    dice.setAttribute("aria-label", tZW("zw_dice_aria", { dice: s.dice.faces.map((f, i) => animalNameZW(f) + (s.dice.hits[i] ? " (" + tZW("zw_hit") + ")" : "")).join(", ") }));
  } else {
    html = "";
    for (let i = 0; i < ZoowurfCore.sum(s.play.need); i++) html += dieSvgZW(null, false, 64);
    dice.setAttribute("aria-label", tZW("dg_dice_none"));
  }
  dice.innerHTML = html;
  let r = "";
  for (let i = 0; i < ZoowurfCore.MAX_ROLLS; i++) {
    r += '<svg class="zw-roll-dot" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.5" fill="' + (i < s.rolls ? "#141413" : "#ffffff") + '" stroke="#141413" stroke-width="2.5"/></svg>';
  }
  rolls.innerHTML = r;
  rolls.setAttribute("aria-label", tZW("zw_rolls_aria", { n: s.rolls, m: ZoowurfCore.MAX_ROLLS }));
}

function renderZW() {
  const s = AppStateZW.state;
  if (!s) return;
  const over = s.phase === "over";
  document.getElementById("zw-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, s.scores.map((n) => tZW("zw_count", { n: n, m: s.target })), over);
  document.getElementById("zw-choose").classList.toggle("hidden", s.phase !== "choose");
  document.getElementById("zw-play").classList.toggle("hidden", s.phase !== "roll");
  if (s.phase === "choose") renderYardZW();
  renderPlayZW();
  document.getElementById("zw-roll").disabled = !(humanTurnZW() && s.phase === "roll");
  setStatusZW(over ? "" : turnStatusZW());
  renderLogZW();
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
  const A = (id) => ZooIcons.svg(id, 34), Z = (face, hit) => dieSvgZW(face, hit, 44);
  Howto.init({ slug: "zoowurf", actions: ["zw-roll"], steps: [
    { pics: Howto.box(A(0) + A(0) + A(3)) + Howto.box(A(2) + A(4) + A(1)), key: "zw_howto_1" },
    { pics: Z(0) + Z(4) + Z("paw") + Z(2), key: "zw_howto_2" },
    { pics: Z("paw") + Howto.arrow() + Z(0, true), key: "zw_howto_3" },
    { pics: Howto.box(A(0) + A(0) + A(3)) + Howto.sign("=") + Howto.tile("", "mark", 36), key: "zw_howto_4" }
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
  }
}

document.addEventListener("DOMContentLoaded", initZoowurfApp);
