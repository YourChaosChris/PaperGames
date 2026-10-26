// gipfelwurf-app.js
// Wires GipfelwurfCore ("Gipfelwurf" / "Ridge Roll") to gipfelwurf.html.
//
// 2 to 4 players on one device, any number of them played by the computer
// (Easy, Medium, Hard). The board shows the seven ridges as columns of
// steps, the foot at the bottom, the top framed with a peak sign. Every
// ridge shows its hut (a small house) and its crevasse (a zigzag). A camp
// (kept) is the player's black marker (circle, square, triangle, star); the
// climber of this turn is a white ring with a thick black edge in a
// thick-framed step. Under the board: the three dice as pip pictures, "Roll
// the dice" and "Stop and make camp", the ways to climb as big buttons
// ("Ridge 6: 3 up"), and a framed panel "Turn lost!" with "Next" when a roll
// does not fit the ridge. One fixed row per player with the points.
// Computers act one step at a time after a calm pause (AiPacing). No sound,
// no time limit, nothing animated, black on white.
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

// "2–4", "5", ... "10–12": the sums of a ridge.
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

/*** Game flow ***/

function startGW() {
  const n = parseInt(document.getElementById("gw-players").value, 10) || 2;
  const comps = Math.min(n - 1, parseInt(document.getElementById("gw-computers").value, 10) || 0);
  const level = parseInt(document.getElementById("gw-level").value, 10) || 2;
  const target = parseInt(document.getElementById("gw-target").value, 10) || GipfelwurfCore.TARGETS[0];
  const computer = [], levels = [];
  for (let i = 0; i < n; i++) { computer.push(i >= n - comps); levels.push(level); }
  AppStateGW.state = GipfelwurfCore.newGame({ players: n, computer, levels, target, starter: "lot" });
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
  const best = GipfelwurfCore.pointsOf(s, s.winners[0]);
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

// The peak sign of the top step, the hut (a small house) and the crevasse
// (a zigzag crack).
const GW_PEAK = '<svg class="gw-peak" viewBox="0 0 40 20" aria-hidden="true" focusable="false"><path d="M2 19L14 5L20 12L27 3L38 19" fill="none" stroke="#141413" stroke-width="2.6" stroke-linejoin="round"/></svg>';
function hutSvgGW(cls) {
  return '<svg class="' + (cls || "gw-sign") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M6 20L20 7L34 20V34H6Z" fill="#fff" stroke="#141413" stroke-width="3" stroke-linejoin="round"/><rect x="16" y="23" width="8" height="11" fill="#141413"/></svg>';
}
function crevasseSvgGW(cls) {
  return '<svg class="' + (cls || "gw-sign") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M4 12L14 20L8 26L20 34M36 12L26 20L32 26L20 34" fill="none" stroke="#141413" stroke-width="3" stroke-linejoin="round"/></svg>';
}

function boardHtmlGW() {
  const s = AppStateGW.state;
  let html = "";
  for (let r = 0; r < GipfelwurfCore.RIDGES; r++) {
    const L = GipfelwurfCore.LENGTHS[r];
    const top = [];
    for (let p = 0; p < s.n; p++) if (s.camps[p][r] >= L) top.push(p);
    const climber = s.ridge === r ? s.climber : null;
    const info = [tGW("gw_ridge_aria", { s: ridgeNameGW(r), n: L }), tGW("gw_aria_hut", { n: GipfelwurfCore.HUTS[r] }), tGW("gw_aria_crevasse", { n: GipfelwurfCore.CREVASSES[r] })];
    if (top.length) info.push(tGW("gw_aria_top", { names: top.map(nameGW).join(", ") }));
    if (climber !== null) info.push(tGW("gw_aria_climber", { n: climber }));
    for (let p = 0; p < s.n; p++) if (s.camps[p][r] > 0 && s.camps[p][r] < L) info.push(tGW("gw_aria_camp", { name: nameGW(p), n: s.camps[p][r] }));
    let cells = "";
    for (let h = L; h >= 1; h--) {
      let inner = "";
      for (let p = 0; p < s.n; p++) if (s.camps[p][r] === h) inner += DiceCommon.markerSvg(p, "gw-camp");
      if (climber === h) inner += climberSvgGW();
      if (!inner && h === L) inner = GW_PEAK;
      else if (!inner && h === GipfelwurfCore.HUTS[r]) inner = hutSvgGW();
      else if (!inner && h === GipfelwurfCore.CREVASSES[r]) inner = crevasseSvgGW();
      const cls = "gw-cell" + (h === L ? " gw-cell-top" : "") + (climber === h ? " gw-cell-climber" : "") +
        (h === GipfelwurfCore.HUTS[r] ? " gw-cell-hut" : "") + (h === GipfelwurfCore.CREVASSES[r] ? " gw-cell-crevasse" : "");
      cells += '<div class="' + cls + '">' + inner + "</div>";
    }
    html += '<div class="gw-ridge' + (s.ridge === r ? " gw-ridge-active" : "") + '" role="group" aria-label="' + info.join(", ") + '">' +
      '<div class="gw-cells">' + cells + '</div><div class="gw-foot" aria-hidden="true">' + ridgeNameGW(r) + "</div></div>";
  }
  return html;
}

function diceHtmlGW(dice) {
  return [0, 1, 2].map((k) => DiceCommon.dieSvg(dice ? dice[k] : 0, "dg-die gw-die")).join("");
}

function optionTextGW(o) {
  return tGW("gw_option", { s: ridgeNameGW(o.ridge), n: o.steps });
}

function lastTextGW() {
  const s = AppStateGW.state, l = s.last;
  if (!l) {
    if (s.turns === 0 && s.phase === "roll") return humansGW() === 1 && !s.computer[s.current] ? I18n.t("gw_starts_you") : tGW("gw_starts", { name: nameGW(s.current) });
    return "";
  }
  const v = { name: nameGW(l.player), dice: l.dice ? l.dice.join(" ") : "", s: l.ridge !== undefined && l.ridge !== null ? ridgeNameGW(l.ridge) : "" };
  switch (l.type) {
    case "roll": return tGW("gw_last_roll", v);
    case "lost": return tGW("gw_last_lost", v);
    case "climb": v.n = l.steps; return tGW("gw_last_climb", v);
    case "crevasse": return tGW("gw_last_crevasse", v);
    case "hut": return tGW("gw_last_hut", v);
    case "summit": v.n = l.bonus !== undefined ? l.bonus : (s.summitFirst[l.ridge] === l.player ? GipfelwurfCore.SUMMIT_FIRST : GipfelwurfCore.SUMMIT_LATER); return tGW("gw_last_summit", v);
    case "stop": return tGW("gw_last_stop", v);
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
  else if (s.climber === null) hint = "gw_hint_first";
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
    const pts = tGW("gw_points", { n: GipfelwurfCore.pointsOf(s, i) });
    row.innerHTML = DiceCommon.markerSvg(i, "dg-marker gw-row-marker") + '<span class="gw-player-name">' + nameGW(i) + '</span> <span class="gw-player-summits">' + pts + "</span>";
    row.setAttribute("aria-label", nameGW(i) + ", " + pts);
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
  stop.disabled = !(mine && s.phase === "roll" && s.climber !== null);
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
      b.disabled = !mine;
      b.addEventListener("click", () => chooseGW(k));
      opts.appendChild(b);
    });
  }
  document.getElementById("gw-lost").classList.toggle("hidden", s.phase !== "lost");
  document.getElementById("gw-next").disabled = !(mine && s.phase === "lost");
  renderRowsGW();
  document.getElementById("game-meta").textContent = tGW("gw_meta", { r: Math.floor(s.turns / s.n) + 1, n: s.target });
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
  document.getElementById("gw-legend-hut").innerHTML = hutSvgGW("gw-legend-svg");
  document.getElementById("gw-legend-crevasse").innerHTML = crevasseSvgGW("gw-legend-svg");
  const D = (v) => Howto.die(v, 30);
  Howto.init({ slug: "gipfelwurf", actions: ["gw-roll"], steps: [
    { pics: D(2) + D(4) + Howto.sign("6") + D(5) + Howto.sign("3"), key: "gw_howto_1" },
    { pics: Howto.ladder() + Howto.arrow() + D(3) + D(3) + D(1), key: "gw_howto_2" },
    { pics: Howto.ladder() + Howto.arrow() + Howto.tile("", "peg", 32), key: "gw_howto_3" },
    { pics: hutSvgGW("gw-howto-svg") + crevasseSvgGW("gw-howto-svg"), key: "gw_howto_4" }
  ] });
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateGW.state) renderGW(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(GIPFELWURF_SAVE_KEY) : null;
  if (saved) {
    // States of the first rules (task 131) are dropped.
    if (GipfelwurfCore.isCurrentState(saved.state) && saved.state.phase !== "over") {
      AppStateGW.state = saved.state;
      DiceCommon.showBoard();
      afterGW();
    } else GameStorage.clear(GIPFELWURF_SAVE_KEY);
  }
}

document.addEventListener("DOMContentLoaded", initGipfelwurfApp);
