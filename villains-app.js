// villains-app.js
// Wires VillainsCore ("Fairy-Tale Villains") to villains.html.
//
// Layout: the goal card of the player whose turn it is (villain, goal,
// checklist of the steps, gold), their domain as four place buttons (2 x 2
// on a narrow screen), the action buttons of the place the figure stands
// on, a "chooser" box for choices (which hero, which card of a twist,
// where to), the hand as a list of cards, the other villains as short
// lines (tap one to see the whole domain) and the log of the last moves.
//
// A turn: tap a place to move there, then use its actions; "End turn"
// draws back up to 4 cards. Against the computer the human is player 0;
// with several people on one device the hand is covered between turns.
// Every text comes from vl_* i18n keys.

const VL_SAVE_KEY = "einkchess_save_villains";
const VL_LOG_LINES = 8;

const AppStateVl = {
  mode: "vs-ai",
  state: null,
  gameOver: false,
  revealed: true,
  busy: false,
  sel: null,          // selected hand card index
  discardMarks: [],   // hand indexes marked to discard
  pick: null,         // a choice in progress: { kind, ... }
  showOther: -1,      // the other player whose domain is shown in full
  status: null
};

function tVl(key) { return typeof I18n !== "undefined" ? I18n.t(key) : key; }
function fillVl(key, vars) {
  let s = tVl(key);
  Object.keys(vars || {}).forEach((k) => { s = s.split("{" + k + "}").join(String(vars[k])); });
  return s;
}
function escVl(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
const VC = () => VillainsCore;

function isAiVl(i) { return AppStateVl.mode === "vs-ai" && i !== 0; }
function viewerVl() { return AppStateVl.mode === "vs-ai" ? 0 : AppStateVl.state.current; }
function villainNameVl(v) { return tVl("vl_villain_" + v); }
function playerNameVl(i) {
  const s = AppStateVl.state;
  const v = villainNameVl(s.players[i].villain);
  if (AppStateVl.mode === "vs-ai") return i === 0 ? fillVl("vl_you_are", { v }) : v;
  return fillVl("vl_player_villain", { n: i + 1, v });
}
function placeNameVl(p, i) { return tVl("vl_place_" + VC().VILLAINS[p.villain].places[i][0]); }
function cardNameVl(id) { return tVl("vl_card_" + id); }

function cardTextVl(id) {
  const c = VC().card(id);
  if (c.kind === "helper") return fillVl("vl_fx_helper", { n: c.str });
  if (c.kind === "hero") return fillVl(id === "kingsson" ? "vl_fx_hero_kingsson" : "vl_fx_hero", { n: c.str });
  if (c.kind === "event") return fillVl("vl_fx_" + c.fx, { n: c.n });
  return fillVl("vl_fx_" + c.fx, { n: c.n });
}

function goalActNameVl(p, i) {
  const name = VC().VILLAINS[p.villain].places[i][0];
  const map = { bakery: "bake", oven: "oven", chandler: "chalk", mill: "flour", goathouse: "door", mirrorhall: "mirror", dwarfhouse: "gift", birdmeadow: "bird" };
  if (p.villain === "rumpel") return tVl("vl_goalact_spin");
  if (p.villain === "thornfairy") return tVl("vl_goalact_hedge");
  return tVl("vl_goalact_" + (map[name] || "bake"));
}

// The steps of the goal as [{ text, done }].
function stepsVl(s, p) {
  const P = VC().prm(s), g = p.prog;
  const out = [];
  switch (p.villain) {
    case "witch":
      for (let i = 1; i <= P.witchHouses; i++) out.push({ text: fillVl("vl_step_house", { n: i }), done: g.houses >= i });
      out.push({ text: tVl("vl_step_oven"), done: g.oven });
      break;
    case "wolf":
      out.push({ text: tVl("vl_step_chalk"), done: g.chalk }, { text: tVl("vl_step_flour"), done: g.flour }, { text: tVl("vl_step_door"), done: g.door },
        { text: tVl("vl_step_forest"), done: false });
      break;
    case "rumpel":
      out.push({ text: fillVl("vl_step_gold", { n: Math.min(p.gold, P.rumpelTarget), m: P.rumpelTarget }), done: p.gold >= P.rumpelTarget },
        { text: tVl("vl_step_secret"), done: !p.heroes.some((h) => h.card === "messenger") });
      break;
    case "stepmother":
      ["lace", "comb", "apple"].forEach((k, i) => out.push({ text: tVl("vl_step_" + k), done: g.gifts > i }));
      out.push({ text: tVl("vl_step_mirror"), done: g.mirror });
      break;
    case "sorcerer":
      for (let i = 1; i <= P.sorcBirds; i++) out.push({ text: fillVl("vl_step_bird", { n: i }), done: g.birds >= i });
      break;
    default:
      for (let i = 0; i < 4; i++) out.push({ text: fillVl("vl_step_hedge", { x: placeNameVl(p, i) }), done: g.hedges.indexOf(i) !== -1 });
  }
  return out;
}

function goalTextVl(v) {
  const P = VC().prm(AppStateVl.state);
  const text = fillVl("vl_goal_" + v, {
    a: P.witchHouse, b: P.witchOven, c: P.wolfChalk, d: P.wolfFlour, e: P.wolfDoor, n: P.rumpelTarget, s: P.rumpelSpin,
    f: P.stepGift[0], g: P.stepGift[1], h: P.stepGift[2], i: P.stepMirror, j: P.sorcBird, k: P.thornCost
  });
  // The first birds / hedges can be 1 gold cheaper.
  const cheap = v === "sorcerer" ? P.sorcCheap : (v === "thornfairy" ? P.thornCheap : 0);
  return cheap ? text + " " + fillVl("vl_goal_cheap", { n: cheap }) : text;
}

function setStatusVl(key, vars) {
  AppStateVl.status = key ? { key, vars: vars || {} } : null;
  const el = document.getElementById("board-info");
  if (el) el.textContent = key ? fillVl(key, vars) : "";
}

function saveVlGame() {
  if (typeof GameStorage === "undefined" || !AppStateVl.state) return;
  GameStorage.save(VL_SAVE_KEY, { mode: AppStateVl.mode, state: AppStateVl.state });
}
function clearSavedVlGame() { if (typeof GameStorage !== "undefined") GameStorage.clear(VL_SAVE_KEY); }

/*** Setup ***/

// Setting "Show move suggestions" (move-hints.js); off by default.
function hintsVl() {
  return typeof MoveHints === "undefined" || MoveHints.enabled();
}

function initVlApp() {
  if (typeof MoveHints !== "undefined") MoveHints.onChange(() => renderVl());
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeHotseat = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  let pendingMode = "vs-ai";
  function setMode(mode) {
    pendingMode = mode;
    if (modeHotseat) modeHotseat.classList.toggle("active-mode", mode === "hotseat");
    if (modeAi) modeAi.classList.toggle("active-mode", mode === "vs-ai");
  }
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeHotseat) modeHotseat.addEventListener("click", () => setMode("hotseat"));
  if (modeAi) modeAi.addEventListener("click", () => setMode("vs-ai"));
  document.getElementById("start-villains-game").addEventListener("click", () => {
    const n = parseInt(document.getElementById("vl-players").value, 10) || 2;
    const own = document.getElementById("vl-villain").value;
    const pool = VC().VILLAIN_IDS.filter((v) => v !== own);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const first = own === "random" ? pool.pop() : own;
    const list = [first].concat(pool.filter((v) => v !== first).slice(0, n - 1));
    startNewVlGame(pendingMode, list);
  });
  document.getElementById("resign-button").addEventListener("click", resignVl);
  document.getElementById("vl-end").addEventListener("click", () => { if (humanTurnVl() && AppStateVl.state.phase === "act" && !AppStateVl.pick) doVl({ type: "end" }); });
  document.getElementById("vl-show-hand").addEventListener("click", () => { AppStateVl.revealed = true; promptVl(); });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => {
      if (AppStateVl.status) setStatusVl(AppStateVl.status.key, AppStateVl.status.vars);
      if (AppStateVl.state) renderVl();
    });
  }
  setMode("vs-ai");
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(VL_SAVE_KEY) : null;
  if (saved && saved.state && saved.state.players && saved.state.winner === null) {
    AppStateVl.mode = saved.mode === "hotseat" ? "hotseat" : "vs-ai";
    AppStateVl.state = saved.state;
    // A twist half done is finished by the computer's rule (the cards are
    // already drawn and can't go back).
    AppStateVl.gameOver = false;
    AppStateVl.revealed = AppStateVl.mode !== "hotseat";
    setMode(AppStateVl.mode);
    showBoardVl();
    if (isAiVl(AppStateVl.state.current)) runAiVl();
    else promptVl();
  }
}

function showBoardVl() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startNewVlGame(mode, villains) {
  AppStateVl.mode = mode;
  AppStateVl.state = VC().createGame(villains);
  AppStateVl.gameOver = false;
  AppStateVl.busy = false;
  AppStateVl.revealed = mode !== "hotseat";
  AppStateVl.showOther = -1;
  clearPickVl();
  const result = document.getElementById("game-result");
  if (result) result.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
  showBoardVl();
  saveVlGame();
  promptVl();
}

function clearPickVl() {
  AppStateVl.sel = null;
  AppStateVl.discardMarks = [];
  AppStateVl.pick = null;
}

function humanTurnVl() {
  const s = AppStateVl.state;
  return !!s && !AppStateVl.gameOver && !AppStateVl.busy && !isAiVl(s.current) && AppStateVl.revealed;
}

function promptVl() {
  const s = AppStateVl.state;
  if (!s || AppStateVl.gameOver) return;
  if (AppStateVl.mode === "hotseat" && !AppStateVl.revealed) setStatusVl("vl_status_pass", { p: playerNameVl(s.current) });
  else if (s.phase === "move") setStatusVl(AppStateVl.mode === "vs-ai" ? "vl_status_move" : "vl_status_move_player", { p: playerNameVl(s.current) });
  else setStatusVl("vl_status_act", { x: placeNameVl(s.players[s.current], s.players[s.current].place) });
  renderVl();
}

/*** Actions ***/

function doVl(act) {
  const s = AppStateVl.state;
  const me = s.current;
  if (!VC().apply(s, act)) return false;
  clearPickVl();
  if (s.winner !== null) { endGameVl(); return true; }
  if (act.type === "end") {
    if (AppStateVl.mode === "hotseat") AppStateVl.revealed = false;
    saveVlGame();
    if (isAiVl(s.current)) { runAiVl(); return true; }
    promptVl();
    return true;
  }
  saveVlGame();
  if (!isAiVl(me)) {
    if (s.phase === "twist") startTwistPickVl();
    else promptVl();
  }
  return true;
}

function onPlaceVl(i) {
  const s = AppStateVl.state;
  if (!humanTurnVl()) return;
  const pk = AppStateVl.pick;
  if (pk && pk.kind === "shift-to") { doVl({ type: "shift", what: pk.what, index: pk.index, to: i }); return; }
  if (pk && pk.kind === "shove-to") { doVl({ type: "play", card: pk.card, hero: pk.hero, to: i }); return; }
  if (s.phase === "move") doVl({ type: "move", place: i });
}

function onHandVl(i) {
  if (!humanTurnVl()) return;
  if (AppStateVl.pick && AppStateVl.pick.kind === "discard") {
    const k = AppStateVl.discardMarks.indexOf(i);
    if (k === -1) AppStateVl.discardMarks.push(i); else AppStateVl.discardMarks.splice(k, 1);
  } else {
    AppStateVl.sel = AppStateVl.sel === i ? null : i;
  }
  renderVl();
}

// The buttons of the place the figure stands on.
function onActVl(kind, extra) {
  const s = AppStateVl.state;
  if (!humanTurnVl() || s.phase !== "act") return;
  const p = s.players[s.current];
  if (kind === "gold") { doVl({ type: "gold", act: extra }); return; }
  if (kind === "goal") { doVl(AppStateVl.sel !== null && p.villain === "rumpel" ? { type: "goal", card: AppStateVl.sel } : { type: "goal" }); return; }
  if (kind === "play") {
    if (AppStateVl.sel === null) { setStatusVl("vl_status_pick_card"); renderVl(); return; }
    const c = VC().card(p.hand[AppStateVl.sel]);
    if (!VC().legalActions(s).some((a) => a.type === "play" && a.card === AppStateVl.sel)) {
      setStatusVl(c.cost > p.gold ? "vl_status_no_gold" : "vl_status_cannot_play");
      renderVl();
      return;
    }
    if (c.fx === "shove") { AppStateVl.pick = { kind: "shove-hero", card: AppStateVl.sel }; setStatusVl("vl_status_pick_hero"); renderVl(); return; }
    if (c.fx === "ward") { AppStateVl.pick = { kind: "ward-hero", card: AppStateVl.sel }; setStatusVl("vl_status_pick_hero"); renderVl(); return; }
    doVl({ type: "play", card: AppStateVl.sel });
    return;
  }
  if (kind === "discard") { AppStateVl.pick = { kind: "discard" }; AppStateVl.discardMarks = []; setStatusVl("vl_status_pick_discard"); renderVl(); return; }
  if (kind === "move") { AppStateVl.pick = { kind: "shift-what" }; setStatusVl("vl_status_pick_shift"); renderVl(); return; }
  if (kind === "defeat") { AppStateVl.pick = { kind: "defeat" }; setStatusVl("vl_status_pick_defeat"); renderVl(); return; }
  if (kind === "twist") {
    const others = s.players.map((q, i) => i).filter((i) => i !== s.current);
    if (others.length === 1) { doVl({ type: "twist", target: others[0] }); return; }
    AppStateVl.pick = { kind: "twist-target" }; setStatusVl("vl_status_pick_target"); renderVl();
  }
}

function startTwistPickVl() {
  AppStateVl.pick = { kind: "twist-card" };
  setStatusVl("vl_status_pick_twist", { p: playerNameVl(AppStateVl.state.pendingTwist.target) });
  renderVl();
}

// A button in the chooser box.
function onChooseVl(value) {
  const s = AppStateVl.state;
  const pk = AppStateVl.pick;
  if (!pk || !humanTurnVl()) return;
  const p = s.players[s.current];
  if (value === "cancel") {
    if (pk.kind === "twist-card" || pk.kind === "twist-place") return; // the cards are drawn: one must be chosen
    clearPickVl(); promptVl(); return;
  }
  switch (pk.kind) {
    case "discard":
      if (AppStateVl.discardMarks.length) doVl({ type: "discard", cards: AppStateVl.discardMarks.slice() });
      break;
    case "shift-what": {
      const parts = value.split(":");
      AppStateVl.pick = { kind: "shift-to", what: parts[0], index: parseInt(parts[1], 10) };
      setStatusVl("vl_status_pick_dest");
      renderVl();
      break;
    }
    case "defeat": doVl({ type: "defeat", hero: parseInt(value, 10) }); break;
    case "shove-hero":
      AppStateVl.pick = { kind: "shove-to", card: pk.card, hero: parseInt(value, 10) };
      setStatusVl("vl_status_pick_dest");
      renderVl();
      break;
    case "ward-hero": doVl({ type: "play", card: pk.card, hero: parseInt(value, 10) }); break;
    case "twist-target": doVl({ type: "twist", target: parseInt(value, 10) }); break;
    case "twist-card": {
      const idx = parseInt(value, 10);
      const id = s.pendingTwist.cards[idx];
      const target = s.players[s.pendingTwist.target];
      const free = [0, 1, 2, 3].filter((i) => !VC().heroAt(target, i));
      if (VC().card(id).kind === "hero" && free.length) {
        AppStateVl.pick = { kind: "twist-place", index: idx };
        setStatusVl("vl_status_pick_twist_place", { c: cardNameVl(id) });
        renderVl();
      } else doVl({ type: "pick", index: idx });
      break;
    }
    case "twist-place": doVl({ type: "pick", index: pk.index, place: parseInt(value, 10) }); break;
  }
}

/*** The computer ***/

function runAiVl() {
  if (AppStateVl.busy) return;
  AppStateVl.busy = true;
  setStatusVl("vl_status_computer", { p: playerNameVl(AppStateVl.state.current) });
  renderVl();
  setTimeout(stepAiVl, typeof AiPacing !== "undefined" ? AiPacing.delay(700) : 700);
}

function stepAiVl() {
  const s = AppStateVl.state;
  if (!s || AppStateVl.gameOver || !isAiVl(s.current)) { AppStateVl.busy = false; return; }
  const act = VC().chooseAction(s);
  VC().apply(s, act);
  if (s.winner !== null) { AppStateVl.busy = false; endGameVl(); return; }
  saveVlGame();
  if (act.type === "end" && !isAiVl(s.current)) {
    AppStateVl.busy = false;
    if (AppStateVl.mode === "hotseat") AppStateVl.revealed = false;
    promptVl();
    return;
  }
  if (act.type === "end") setStatusVl("vl_status_computer", { p: playerNameVl(s.current) });
  renderVl();
  setTimeout(stepAiVl, typeof AiPacing !== "undefined" ? AiPacing.delay(act.type === "end" ? 900 : 600) : 600);
}

/*** End ***/

function endGameVl(resigned) {
  const s = AppStateVl.state;
  AppStateVl.gameOver = true;
  AppStateVl.busy = false;
  clearPickVl();
  const w = s.winner;
  let title, text;
  if (AppStateVl.mode === "vs-ai") {
    title = tVl(w === 0 ? "vl_result_win" : "vl_result_lose");
    text = resigned ? tVl("vl_result_resigned") : fillVl(w === 0 ? "vl_result_win_text" : "vl_result_lose_text", { v: villainNameVl(s.players[w].villain) });
    if (typeof GameStats !== "undefined") GameStats.record("villains", w === 0 ? "win" : "loss");
  } else {
    title = fillVl("vl_result_player_wins", { p: playerNameVl(w) });
    text = title;
  }
  setStatusVl(null);
  document.getElementById("board-info").textContent = text;
  document.getElementById("game-result").textContent = text;
  if (window.ResultModal) window.ResultModal.show(title, text);
  clearSavedVlGame();
  renderVl();
}

function resignVl() {
  const s = AppStateVl.state;
  if (!s || AppStateVl.gameOver) return;
  const loser = AppStateVl.mode === "vs-ai" ? 0 : s.current;
  // The one closest to the goal among the others wins.
  let best = -1, bv = -1;
  s.players.forEach((q, i) => { if (i !== loser) { const v = VC().progress(s, q); if (v > bv) { bv = v; best = i; } } });
  s.winner = best;
  endGameVl(true);
}

/*** Drawing ***/

function actLabelVl(p, a, i) {
  if (a === "gold1" || a === "gold2" || a === "gold3") return fillVl("vl_act_gold", { n: a.slice(4) });
  if (a === "goal") return goalActNameVl(p, i);
  return tVl("vl_act_" + a);
}

function placeHtmlVl(s, pi, i, interactive) {
  const p = s.players[pi];
  const hero = VC().heroAt(p, i);
  const helpers = p.helpers.filter((h) => h.place === i);
  const hedge = p.villain === "thornfairy" && p.prog.hedges.indexOf(i) !== -1;
  const cls = ["vl-place"];
  if (p.place === i) cls.push("vl-here");
  if (hero) cls.push("vl-blocked");
  const pk = AppStateVl.pick;
  let target = false;
  if (interactive && humanTurnVl() && pi === s.current) {
    if (s.phase === "move" && !pk) target = p.place !== i;
    else if (pk && pk.kind === "shift-to") target = pk.what === "helper" ? p.helpers[pk.index].place !== i : !hero;
    else if (pk && pk.kind === "shove-to") target = !hero;
  }
  if (target) cls.push("vl-target");
  const acts = VC().placeActs(p, i).map((a) => actLabelVl(p, a, i)).join(" · ");
  let html = '<span class="vl-place-name">' + escVl(placeNameVl(p, i)) + "</span>" +
    '<span class="vl-place-acts">' + escVl(acts) + "</span>";
  if (p.place === i) html += '<span class="vl-figure">' + escVl(tVl("vl_figure_here")) + "</span>";
  if (hedge) html += '<span class="vl-hedge">' + escVl(tVl("vl_hedge_here")) + "</span>";
  if (hero) html += '<span class="vl-hero">' + escVl(fillVl("vl_hero_here", { c: cardNameVl(hero.card), n: VC().card(hero.card).str })) + "</span>";
  helpers.forEach((h) => { html += '<span class="vl-helper">' + escVl(fillVl("vl_helper_here", { c: cardNameVl(h.card), n: VC().card(h.card).str })) + "</span>"; });
  const label = [placeNameVl(p, i), acts, p.place === i ? tVl("vl_figure_here") : "", hedge ? tVl("vl_hedge_here") : "",
    hero ? fillVl("vl_hero_here", { c: cardNameVl(hero.card), n: VC().card(hero.card).str }) : ""].concat(helpers.map((h) => fillVl("vl_helper_here", { c: cardNameVl(h.card), n: VC().card(h.card).str }))).filter(Boolean).join(", ");
  if (!interactive) return '<div class="' + cls.join(" ") + '" role="group" aria-label="' + escVl(label) + '">' + html + "</div>";
  return '<button type="button" class="' + cls.join(" ") + '" data-place="' + i + '" aria-label="' + escVl(label) + '">' + html + "</button>";
}

function goalHtmlVl(s, pi) {
  const p = s.players[pi];
  const steps = stepsVl(s, p);
  return '<div class="vl-goal-head"><strong>' + escVl(playerNameVl(pi)) + "</strong> · " + escVl(fillVl("vl_gold_n", { n: p.gold })) + "</div>" +
    '<p class="vl-goal-text">' + escVl(goalTextVl(p.villain)) + "</p>" +
    '<ul class="vl-steps">' + steps.map((st) => '<li class="' + (st.done ? "vl-done" : "") + '">' + (st.done ? "✓ " : "○ ") + escVl(st.text) + "</li>").join("") + "</ul>";
}

function chooserHtmlVl(s) {
  const pk = AppStateVl.pick;
  if (!pk) return "";
  const p = s.players[s.current];
  const btn = (v, text) => '<button type="button" class="secondary vl-choose" data-value="' + escVl(v) + '">' + escVl(text) + "</button>";
  let out = "";
  if (pk.kind === "discard") out = btn("ok", fillVl("vl_discard_n", { n: AppStateVl.discardMarks.length }));
  else if (pk.kind === "shift-what") {
    p.helpers.forEach((h, i) => { out += btn("helper:" + i, cardNameVl(h.card) + " (" + placeNameVl(p, h.place) + ")"); });
    p.heroes.forEach((h, i) => { out += btn("hero:" + i, cardNameVl(h.card) + " (" + placeNameVl(p, h.place) + ")"); });
  } else if (pk.kind === "defeat") {
    VC().legalActions(s).filter((a) => a.type === "defeat").forEach((a) => {
      const h = p.heroes[a.hero];
      out += btn(String(a.hero), fillVl("vl_defeat_for", { c: cardNameVl(h.card), n: VC().heroPrice(p, h) }));
    });
  } else if (pk.kind === "shove-hero" || pk.kind === "ward-hero") {
    p.heroes.forEach((h, i) => { out += btn(String(i), cardNameVl(h.card) + " (" + placeNameVl(p, h.place) + ")"); });
  } else if (pk.kind === "twist-target") {
    s.players.forEach((q, i) => { if (i !== s.current) out += btn(String(i), playerNameVl(i)); });
  } else if (pk.kind === "twist-card") {
    s.pendingTwist.cards.forEach((id, i) => { out += btn(String(i), cardNameVl(id) + ": " + cardTextVl(id)); });
  } else if (pk.kind === "twist-place") {
    const target = s.players[s.pendingTwist.target];
    [0, 1, 2, 3].forEach((i) => { if (!VC().heroAt(target, i)) out += btn(String(i), placeNameVl(target, i)); });
  } else if (pk.kind === "shift-to" || pk.kind === "shove-to") {
    out = '<span class="vl-chooser-hint">' + escVl(tVl("vl_status_pick_dest")) + "</span>";
  }
  const cancel = pk.kind === "twist-card" || pk.kind === "twist-place" ? "" : btn("cancel", tVl("vl_cancel"));
  return out + cancel;
}

function renderVl() {
  const s = AppStateVl.state;
  if (!s) return;
  const me = viewerVl();
  const p = s.players[me];
  const covered = AppStateVl.mode === "hotseat" && !AppStateVl.revealed && !AppStateVl.gameOver;
  const myTurn = humanTurnVl() && s.current === me;

  document.getElementById("vl-goal").innerHTML = goalHtmlVl(s, me);
  const dom = document.getElementById("vl-domain");
  dom.innerHTML = [0, 1, 2, 3].map((i) => placeHtmlVl(s, me, i, true)).join("");
  dom.querySelectorAll(".vl-place").forEach((b) => b.addEventListener("click", () => onPlaceVl(parseInt(b.getAttribute("data-place"), 10))));

  // Action buttons of the current place.
  const actsBox = document.getElementById("vl-actions");
  let ah = "";
  if (myTurn && s.phase === "act" && !AppStateVl.pick) {
    const legal = VC().legalActions(s);
    const has = (t, f) => legal.some((a) => a.type === t && (!f || f(a)));
    VC().placeActs(p, p.place).forEach((a) => {
      if (VC().heroAt(p, p.place)) return;
      let ok = false, kind = a, extra = "";
      if (a.indexOf("gold") === 0) { ok = has("gold", (x) => x.act === a); kind = "gold"; extra = a; }
      else if (a === "play") ok = has("play");
      else if (a === "discard") ok = has("discard");
      else if (a === "move") ok = has("shift");
      else if (a === "defeat") ok = has("defeat");
      else if (a === "twist") ok = has("twist");
      else if (a === "goal") ok = has("goal");
      let label = actLabelVl(p, a, p.place);
      if (a === "goal") { const g = VC().goalPrice(s, p, p.place); if (g !== null) label += " (" + fillVl("vl_gold_n", { n: g }) + ")"; }
      if (s.used.indexOf(a) !== -1) return;
      ah += '<button type="button" class="secondary vl-act" data-kind="' + kind + '" data-extra="' + extra + '"' + (ok ? "" : " disabled") + ">" + escVl(label) + "</button>";
    });
    const blocker = VC().heroAt(p, p.place);
    if (blocker && s.used.indexOf("defeat-here") === -1) {
      const ok = has("defeat");
      ah += '<button type="button" class="secondary vl-act" data-kind="defeat"' + (ok ? "" : " disabled") + ">" + escVl(fillVl("vl_defeat_for", { c: cardNameVl(blocker.card), n: VC().heroPrice(p, blocker) })) + "</button>";
    }
  }
  actsBox.innerHTML = ah;
  actsBox.querySelectorAll(".vl-act").forEach((b) => b.addEventListener("click", () => onActVl(b.getAttribute("data-kind"), b.getAttribute("data-extra"))));
  document.getElementById("vl-end").disabled = !(myTurn && s.phase === "act" && !AppStateVl.pick);
  document.getElementById("resign-button").classList.toggle("hidden", AppStateVl.gameOver);

  const chooser = document.getElementById("vl-chooser");
  const ch = myTurn ? chooserHtmlVl(s) : "";
  chooser.innerHTML = ch;
  chooser.classList.toggle("hidden", !ch);
  chooser.querySelectorAll(".vl-choose").forEach((b) => b.addEventListener("click", () => onChooseVl(b.getAttribute("data-value"))));

  const cover = document.getElementById("vl-hand-cover");
  const hand = document.getElementById("vl-hand");
  cover.classList.toggle("hidden", !covered);
  if (covered) document.getElementById("vl-hand-cover-text").textContent = fillVl("vl_status_pass", { p: playerNameVl(s.current) });
  hand.classList.toggle("hidden", covered);
  if (!covered) {
    const playIdx = myTurn && s.phase === "act" ? VC().legalActions(s).filter((a) => a.type === "play").map((a) => a.card) : [];
    hand.innerHTML = p.hand.map((id, i) => {
      const c = VC().card(id);
      const cls = ["vl-card"];
      if (AppStateVl.sel === i) cls.push("vl-selected");
      if (AppStateVl.discardMarks.indexOf(i) !== -1) cls.push("vl-marked");
      const playable = myTurn && s.phase === "act" && playIdx.indexOf(i) !== -1;
      if (!playable && (!myTurn || s.phase !== "act" || hintsVl())) cls.push("vl-unplayable");
      const kind = tVl(c.kind === "helper" ? "vl_kind_helper" : "vl_kind_trick");
      const label = [cardNameVl(id), kind, fillVl("vl_cost_n", { n: c.cost }), cardTextVl(id), AppStateVl.discardMarks.indexOf(i) !== -1 ? tVl("vl_marked") : ""].filter(Boolean).join(", ");
      return '<li><button type="button" class="' + cls.join(" ") + '" data-hand="' + i + '" aria-label="' + escVl(label) + '">' +
        '<span class="vl-card-top"><span class="vl-card-name">' + escVl(cardNameVl(id)) + '</span><span class="vl-cost">' + c.cost + "</span></span>" +
        '<span class="vl-card-kind">' + escVl(kind) + "</span>" +
        '<span class="vl-card-text">' + escVl(cardTextVl(id)) + "</span></button></li>";
    }).join("");
    hand.querySelectorAll(".vl-card").forEach((b) => b.addEventListener("click", () => onHandVl(parseInt(b.getAttribute("data-hand"), 10))));
  }

  // The others.
  const others = document.getElementById("vl-others");
  let oh = "";
  s.players.forEach((q, i) => {
    if (i === me) return;
    const steps = stepsVl(s, q);
    const done = steps.filter((x) => x.done).length;
    const line = fillVl("vl_other_line", { p: playerNameVl(i), g: q.gold, n: done, m: steps.length, h: q.heroes.length });
    oh += '<li><button type="button" class="vl-other' + (AppStateVl.showOther === i ? " vl-selected" : "") + '" data-other="' + i + '">' + escVl(line) + "</button>";
    if (AppStateVl.showOther === i) {
      oh += '<div class="vl-other-full">' + goalHtmlVl(s, i) + '<div class="vl-domain vl-domain-small">' + [0, 1, 2, 3].map((k) => placeHtmlVl(s, i, k, false)).join("") + "</div></div>";
    }
    oh += "</li>";
  });
  others.innerHTML = oh;
  others.querySelectorAll(".vl-other").forEach((b) => b.addEventListener("click", () => {
    const i = parseInt(b.getAttribute("data-other"), 10);
    AppStateVl.showOther = AppStateVl.showOther === i ? -1 : i;
    renderVl();
  }));

  document.getElementById("vl-log").innerHTML = s.log.filter((e) => e.k !== "end").slice(-VL_LOG_LINES).map((e) => "<li>" + escVl(logLineVl(s, e)) + "</li>").join("");
}

function logLineVl(s, e) {
  const who = (i) => playerNameVl(i);
  const pl = (i) => s.players[i];
  switch (e.k) {
    case "move": return fillVl("vl_log_move", { p: who(e.p), x: placeNameVl(pl(e.p), e.place) });
    case "gold": return fillVl("vl_log_gold", { p: who(e.p), n: e.n });
    case "play": return fillVl("vl_log_play", { p: who(e.p), c: cardNameVl(e.c) });
    case "discard": return fillVl("vl_log_discard", { p: who(e.p), n: e.n });
    case "shift": return fillVl("vl_log_shift", { p: who(e.p), c: cardNameVl(e.c), x: placeNameVl(pl(e.p), e.to) });
    case "defeat": return fillVl("vl_log_defeat", { p: who(e.p), c: cardNameVl(e.c), n: e.n });
    case "hero": return fillVl("vl_log_hero", { p: who(e.p), t: who(e.t), c: cardNameVl(e.c), x: placeNameVl(pl(e.t), e.place) });
    case "event": return fillVl("vl_log_event", { p: who(e.p), t: who(e.t), c: cardNameVl(e.c) });
    case "cuthedge": return fillVl("vl_log_cuthedge", { t: who(e.t) });
    case "goal": return fillVl("vl_log_goal", { p: who(e.p), x: goalActNameVl(pl(e.p), e.place) });
    case "win": return fillVl("vl_log_win", { p: who(e.p) });
    default: return "";
  }
}

document.addEventListener("DOMContentLoaded", initVlApp);
