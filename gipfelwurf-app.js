// gipfelwurf-app.js
// Wires GipfelwurfCore ("Gipfelwurf" / "Ridge Roll") to gipfelwurf.html.
//
// 2 to 4 players on one device, any number of them played by the computer
// (Easy, Medium, Hard). The board shows the seven ridges as columns of
// steps, the foot at the bottom, the top framed with a peak sign. A camp
// (kept) is the player's black marker (circle, square, triangle, star); a
// climber of this turn is a white ring with a thick black edge in a
// thick-framed step. A claimed ridge is hatched and shows its owner at the
// top. Under the board: the four dice as pip pictures, "Roll the dice" and
// "Stop and make camp", the possible pairs as big buttons with their sums,
// and a framed panel "Turn lost!" with "Next" when no pair fits. One fixed
// row per player with the number of summits. Computers act one step at a
// time after a calm pause (AiPacing). No sound, no time limit, nothing
// animated, black on white.
// No Undo: the dice are rolled at random and a taken-back roll would let
// the player roll again.

const GIPFELWURF_SAVE_KEY = "einkchess_save_gipfelwurf";

const AppStateGW = {
  state: null,
  generation: 0   // guards a pending computer step after a new game
};

function tGW(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameGW(i) {
  return DiceCommon.playerName(AppStateGW.state.computer, i);
}

function humansGW() {
  return AppStateGW.state.computer.filter((c) => !c).length;
}

// "2-4", "5", ... "10-12": the sums of a ridge.
function ridgeNameGW(r) {
  const s = GipfelwurfCore.SUMS[r];
  return s.length > 1 ? s[0] + "–" + s[s.length - 1] : String(s[0]);
}

/*** Save and load ***/

function saveGW() {
  if (typeof GameStorage === "undefined" || !AppStateGW.state) return;
  if (AppStateGW.state.phase === "over") { GameStorage.clear(GIPFELWURF_SAVE_KEY); return; }
  GameStorage.save(GIPFELWURF_SAVE_KEY, { state: AppStateGW.state });
}

function validStateGW(s) {
  return !!s && s.game === "gipfelwurf" && Array.isArray(s.camps) && Array.isArray(s.owner) && s.owner.length === GipfelwurfCore.RIDGES &&
    Array.isArray(s.climbers) && Array.isArray(s.computer) && s.phase !== "over";
}

/*** Game flow ***/

function startGW() {
  const n = parseInt(document.getElementById("gw-players").value, 10) || 2;
  const comps = Math.min(n - 1, parseInt(document.getElementById("gw-computers").value, 10) || 0);
  const level = parseInt(document.getElementById("gw-level").value, 10) || 2;
  const need = parseInt(document.getElementById("gw-need").value, 10) || 3;
  const computer = [], levels = [];
  for (let i = 0; i < n; i++) { computer.push(i >= n - comps); levels.push(level); }
  AppStateGW.state = GipfelwurfCore.newGame({ players: n, computer, levels, need, starter: "lot" });
  AppStateGW.generation++;
  setResultGW("");
  if (window.ResultModal) window.ResultModal.hide();
  DiceCommon.showBoard();
  afterGW();
}

function actorIsComputerGW() {
  const s = AppStateGW.state;
  return !!s && s.phase !== "over" && s.computer[s.current];
}

function afterGW() {
  const s = AppStateGW.state;
  if (s.phase === "over") finishGW();
  renderGW();
  saveGW();
  if (actorIsComputerGW()) {
    const gen = AppStateGW.generation, from = s;
    const wait = s.phase === "lost" ? 1800 : 900;
    setTimeout(() => {
      if (gen !== AppStateGW.generation || AppStateGW.state !== from) return;
      AppStateGW.state = GipfelwurfCore.aiStep(from);
      afterGW();
    }, typeof AiPacing !== "undefined" ? AiPacing.delay(wait) : wait);
  }
}

function humanTurnGW() {
  const s = AppStateGW.state;
  return !!s && s.phase !== "over" && !s.computer[s.current];
}

function actGW(fn) {
  const s = AppStateGW.state;
  if (!humanTurnGW()) return;
  const next = fn(s);
  if (next === s) return;
  AppStateGW.state = next;
  afterGW();
}

function rollGW() { actGW((s) => GipfelwurfCore.roll(s)); }
function stopGW() { actGW((s) => GipfelwurfCore.stop(s)); }
function nextGW() { actGW((s) => GipfelwurfCore.next(s)); }
function chooseGW(k) { actGW((s) => GipfelwurfCore.choose(s, k)); }

function finishGW() {
  const s = AppStateGW.state;
  const humans = humansGW();
  const best = GipfelwurfCore.summitsOf(s, s.winners[0]);
  let title, text;
  if (s.winners.length > 1) {
    title = "Draw";
    text = tGW("gw_game_over_tie", { names: s.winners.map(nameGW).join(", "), n: best });
  } else {
    const w = s.winners[0];
    text = tGW("gw_game_over", { name: nameGW(w), n: best });
    if (humans === 1) {
      title = s.computer[w] ? "You lose" : "You win!";
      text = I18n.t(s.computer[w] ? "ui_status_computer_wins" : "ui_status_you_win") + " " + text;
    } else title = s.computer[w] ? "Computer wins" : "Player " + (s.computer.slice(0, w + 1).filter((c) => !c).length) + " wins";
  }
  setResultGW(text);
  if (window.ResultModal) window.ResultModal.show(title, text);
  if (humans === 1 && typeof GameStats !== "undefined") GameStats.record("gipfelwurf", GipfelwurfCore.outcomeFor(s, s.computer.indexOf(false)));
}

/*** Display ***/

function setStatusGW(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultGW(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

// A climber of this turn: a white ring with a thick black edge.
function climberSvgGW(cls) {
  return '<svg class="' + (cls || "gw-climber") + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="36" fill="#fff" stroke="#141413" stroke-width="16"/><circle cx="50" cy="50" r="9" fill="#141413"/></svg>';
}

// The peak sign of the top step.
const GW_PEAK = '<svg class="gw-peak" viewBox="0 0 40 20" aria-hidden="true" focusable="false"><path d="M2 19L14 5L20 12L27 3L38 19" fill="none" stroke="#141413" stroke-width="2.6" stroke-linejoin="round"/></svg>';

function boardHtmlGW() {
  const s = AppStateGW.state;
  let html = "";
  for (let r = 0; r < GipfelwurfCore.RIDGES; r++) {
    const L = GipfelwurfCore.LENGTHS[r], owner = s.owner[r];
    const info = [tGW("gw_ridge_aria", { s: ridgeNameGW(r), n: L })];
    if (owner !== -1) info.push(tGW("gw_aria_owner", { name: nameGW(owner) }));
    if (s.climbers[r] !== null) info.push(tGW("gw_aria_climber", { n: s.climbers[r] }));
    for (let p = 0; p < s.n; p++) if (s.camps[p][r] > 0 && owner === -1) info.push(tGW("gw_aria_camp", { name: nameGW(p), n: s.camps[p][r] }));
    let cells = "";
    for (let h = L; h >= 1; h--) {
      let inner = "";
      if (h === L && owner !== -1) inner = DiceCommon.markerSvg(owner, "gw-owner");
      else {
        for (let p = 0; p < s.n; p++) if (s.camps[p][r] === h) inner += DiceCommon.markerSvg(p, "gw-camp");
        if (s.climbers[r] === h) inner += climberSvgGW();
      }
      const cls = "gw-cell" + (h === L ? " gw-cell-top" : "") + (s.climbers[r] === h ? " gw-cell-climber" : "");
      cells += '<div class="' + cls + '">' + (h === L && owner === -1 && !inner ? GW_PEAK : inner) + "</div>";
    }
    html += '<div class="gw-ridge' + (owner !== -1 ? " gw-ridge-claimed" : "") + '" role="group" aria-label="' + info.join(", ") + '">' +
      '<div class="gw-cells">' + cells + '</div><div class="gw-foot" aria-hidden="true">' + ridgeNameGW(r) + "</div></div>";
  }
  return html;
}

function diceHtmlGW(dice) {
  return [0, 1, 2, 3].map((k) => DiceCommon.dieSvg(dice ? dice[k] : 0, "dg-die gw-die")).join("");
}

function optionTextGW(o) {
  return o.sums.length === 2 ? tGW("gw_option_two", { a: o.sums[0], b: o.sums[1] }) : tGW("gw_option_one", { a: o.sums[0] });
}

function lastTextGW() {
  const s = AppStateGW.state, l = s.last;
  if (!l) {
    if (s.turns === 0 && s.phase === "roll") return humansGW() === 1 && !s.computer[s.current] ? I18n.t("gw_starts_you") : tGW("gw_starts", { name: nameGW(s.current) });
    return "";
  }
  const v = { name: nameGW(l.player), dice: l.dice ? l.dice.join(" ") : "" };
  switch (l.type) {
    case "roll": return tGW("gw_last_roll", v);
    case "lost": return tGW("gw_last_lost", v);
    case "climb": v.s = l.sums.join(" + "); return tGW("gw_last_climb", v);
    case "stop":
    case "gameover":
      if (l.claimed && l.claimed.length) { v.s = l.claimed.map(ridgeNameGW).join(", "); return tGW("gw_last_claim", v); }
      return tGW("gw_last_stop", v);
    default: return "";
  }
}

function statusGW() {
  const s = AppStateGW.state;
  if (s.phase === "over") return "";
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansGW() === 1 ? I18n.t("ui_status_your_turn") : DiceCommon.fill(I18n.t("dg_turn_of"), { name: nameGW(s.current) });
  let hint = "gw_hint_roll";
  if (s.phase === "choose") hint = "gw_hint_choose";
  else if (s.phase === "lost") hint = "gw_hint_lost";
  else if (!s.climbers.some((h) => h !== null)) hint = "gw_hint_first";
  return who + " " + I18n.t(hint);
}

function renderRowsGW() {
  const s = AppStateGW.state;
  const wrap = document.getElementById("gw-rows");
  wrap.innerHTML = "";
  for (let i = 0; i < s.n; i++) {
    const row = document.createElement("div");
    const active = s.phase !== "over" && s.current === i;
    row.className = "gw-player" + (active ? " gw-player-active" : "");
    const sum = tGW("gw_summits", { n: GipfelwurfCore.summitsOf(s, i), m: s.need });
    row.innerHTML = DiceCommon.markerSvg(i, "dg-marker gw-row-marker") + '<span class="gw-player-name">' + nameGW(i) + '</span> <span class="gw-player-summits">' + sum + "</span>";
    row.setAttribute("aria-label", nameGW(i) + ", " + sum);
    wrap.appendChild(row);
  }
}

function renderGW() {
  const s = AppStateGW.state;
  if (!s) return;
  document.getElementById("gw-board").innerHTML = boardHtmlGW();
  const dice = document.getElementById("gw-dice");
  dice.innerHTML = diceHtmlGW(s.dice);
  dice.setAttribute("aria-label", s.dice ? tGW("gw_dice_aria", { dice: s.dice.join(" ") }) : I18n.t("gw_hint_first"));
  document.getElementById("gw-last").textContent = lastTextGW();
  const mine = humanTurnGW();
  const roll = document.getElementById("gw-roll"), stop = document.getElementById("gw-stop");
  roll.disabled = !(mine && s.phase === "roll");
  stop.disabled = !(mine && s.phase === "roll" && s.climbers.some((h) => h !== null));
  document.getElementById("gw-actions").classList.toggle("hidden", s.phase === "choose" || s.phase === "lost" || s.phase === "over");
  const opts = document.getElementById("gw-options");
  opts.innerHTML = "";
  opts.classList.toggle("hidden", s.phase !== "choose");
  if (s.phase === "choose") {
    GipfelwurfCore.options(s).forEach((o, k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "primary gw-option";
      b.textContent = optionTextGW(o);
      b.setAttribute("aria-label", tGW("gw_option_aria", { s: optionTextGW(o) }));
      b.disabled = !mine;
      b.addEventListener("click", () => chooseGW(k));
      opts.appendChild(b);
    });
  }
  document.getElementById("gw-lost").classList.toggle("hidden", s.phase !== "lost");
  document.getElementById("gw-next").disabled = !(mine && s.phase === "lost");
  renderRowsGW();
  document.getElementById("game-meta").textContent = tGW("gw_meta", { r: s.turns + 1, n: s.need });
  setStatusGW(statusGW());
}

/*** Setup ***/

function initGipfelwurfApp() {
  DiceCommon.wireMenu();
  const computers = document.getElementById("gw-computers");
  const limitComputers = () => {
    const n = parseInt(document.getElementById("gw-players").value, 10);
    Array.from(computers.options).forEach((o) => { o.disabled = parseInt(o.value, 10) > n - 1; });
    if (parseInt(computers.value, 10) > n - 1) computers.value = String(n - 1);
  };
  document.getElementById("gw-players").addEventListener("change", limitComputers);
  limitComputers();
  document.getElementById("start-gw-game").addEventListener("click", startGW);
  document.getElementById("gw-roll").addEventListener("click", rollGW);
  document.getElementById("gw-stop").addEventListener("click", stopGW);
  document.getElementById("gw-next").addEventListener("click", nextGW);
  document.getElementById("gw-legend-climber").innerHTML = climberSvgGW("gw-legend-svg");
  document.getElementById("gw-legend-camp").innerHTML = DiceCommon.markerSvg(0, "gw-legend-svg");
  const D = (v) => Howto.die(v, 30);
  Howto.init({ slug: "gipfelwurf", actions: ["gw-roll"], steps: [
    { pics: D(3) + D(4) + Howto.sign("+") + D(1) + D(5), key: "gw_howto_1" },
    { pics: D(3) + D(4) + Howto.sign("7") + Howto.arrow() + Howto.ladder(), key: "gw_howto_2" },
    { pics: Howto.ladder() + Howto.arrow() + Howto.tile("", "peg", 32), key: "gw_howto_3" },
    { pics: D(6) + D(6) + D(6) + D(6) + Howto.arrow() + Howto.tile("", "shut", 32), key: "gw_howto_4" }
  ] });
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateGW.state) renderGW(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(GIPFELWURF_SAVE_KEY) : null;
  if (saved && validStateGW(saved.state)) {
    AppStateGW.state = saved.state;
    DiceCommon.showBoard();
    afterGW();
  }
}

document.addEventListener("DOMContentLoaded", initGipfelwurfApp);
