// villains-app.js
// Wires VillainsCore ("Fairy-Tale Villains", rules version 2) to
// villains.html.
//
// Layout: the plan card of the player whose turn it is (villain, steps with
// place and price), their domain as three place boxes, the market (3 open
// spell cards) and the 2 open heroes, the action buttons, a "chooser" box
// for choices (which card to take, which hero, whom, where), the hand, the
// other villains as short lines (tap one to see the whole domain) and the
// log of the last moves.
//
// A turn: 2 actions (collect 2 cards, or do a step of the plan), and once
// per turn a scheme (send a hero). Against the computer the human is
// player 0; with several people on one device the hand is covered between
// turns. Saved games of the older rules (no state.rules === 2) are dropped
// without a word. Every text comes from vl_* i18n keys.

const VL_SAVE_KEY = "einkchess_save_villains";
const VL_LOG_LINES = 8;
const VL_SIGN_MARK = { moon: "☾", star: "★", herb: "♣", any: "✦" };

const AppStateVl = {
  mode: "vs-ai",
  level: 2,
  state: null,
  gameOver: false,
  revealed: true,
  busy: false,
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
function signNameVl(sg) { return VL_SIGN_MARK[sg] + " " + tVl("vl_sign_" + sg); }
function stepNameVl(p, j) { return tVl("vl_step_" + VC().stepsOf(p)[j][0]); }
// A spell card as text: "☾ Moon 3" or "✦ Fairy Dust (2)".
function spellNameVl(id) {
  const c = VC().card(id);
  if (c.sign === "any") return VL_SIGN_MARK.any + " " + tVl("vl_card_dust") + " " + c.value;
  return signNameVl(c.sign) + " " + c.value;
}
function heroNameVl(id) { return fillVl("vl_hero_str", { c: tVl("vl_card_" + id), n: VC().card(id).str }); }

function setStatusVl(key, vars) {
  AppStateVl.status = key ? { key, vars: vars || {} } : null;
  const el = document.getElementById("board-info");
  if (el) {
    if (AppStateVl.mode === "vs-ai" && key) {
      if (key === "vl_status_computer") el.textContent = I18n.t("ui_status_computer_turn") + " " + fillVl(key, vars);
      else if (key === "vl_status_turn") el.textContent = I18n.t("ui_status_your_turn") + " " + fillVl(key, vars);
      else el.textContent = fillVl(key, vars);
    } else el.textContent = key ? fillVl(key, vars) : "";
  }
}

function saveVlGame() {
  if (typeof GameStorage === "undefined" || !AppStateVl.state) return;
  GameStorage.save(VL_SAVE_KEY, { mode: AppStateVl.mode, level: AppStateVl.level, state: AppStateVl.state });
}
function clearSavedVlGame() { if (typeof GameStorage !== "undefined") GameStorage.clear(VL_SAVE_KEY); }

/*** Setup ***/

function initVlApp() {
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
    const lvEl = document.getElementById("vl-level");
    AppStateVl.level = lvEl ? (parseInt(lvEl.value, 10) || 2) : 2;
    const pool = VC().VILLAIN_IDS.filter((v) => v !== own);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const first = own === "random" ? pool.pop() : own;
    const list = [first].concat(pool.filter((v) => v !== first).slice(0, n - 1));
    startNewVlGame(pendingMode, list);
  });
  document.getElementById("resign-button").addEventListener("click", resignVl);
  document.getElementById("vl-end").addEventListener("click", () => {
    const s = AppStateVl.state;
    if (humanTurnVl() && s.phase === "act" && !AppStateVl.pick) doVl({ type: "end" });
  });
  document.getElementById("vl-show-hand").addEventListener("click", () => { AppStateVl.revealed = true; promptVl(); });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => {
      if (AppStateVl.status) setStatusVl(AppStateVl.status.key, AppStateVl.status.vars);
      if (AppStateVl.state) renderVl();
    });
  }
  setMode("vs-ai");
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(VL_SAVE_KEY) : null;
  // A game of the older rules can't go on: drop it without a word.
  if (saved && saved.state && !VC().isCurrentState(saved.state)) { clearSavedVlGame(); return; }
  if (saved && saved.state && saved.state.winner === null) {
    AppStateVl.mode = saved.mode === "hotseat" ? "hotseat" : "vs-ai";
    AppStateVl.level = [1, 2, 3].indexOf(saved.level) !== -1 ? saved.level : 2;
    AppStateVl.state = saved.state;
    AppStateVl.gameOver = false;
    AppStateVl.revealed = AppStateVl.mode !== "hotseat";
    setMode(AppStateVl.mode);
    const lvEl = document.getElementById("vl-level");
    if (lvEl) lvEl.value = String(AppStateVl.level);
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
  AppStateVl.pick = null;
  const result = document.getElementById("game-result");
  if (result) result.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
  showBoardVl();
  saveVlGame();
  promptVl();
}

function humanTurnVl() {
  const s = AppStateVl.state;
  return !!s && !AppStateVl.gameOver && !AppStateVl.busy && !isAiVl(s.current) && AppStateVl.revealed;
}

function promptVl() {
  const s = AppStateVl.state;
  if (!s || AppStateVl.gameOver) return;
  const pk = AppStateVl.pick;
  if (AppStateVl.mode === "hotseat" && !AppStateVl.revealed) setStatusVl("vl_status_pass", { p: playerNameVl(s.current) });
  else if (s.phase === "collect") setStatusVl("vl_status_collect", { n: s.collectLeft });
  else if (s.phase === "trim") setStatusVl("vl_status_trim");
  else if (pk && pk.kind === "hero") setStatusVl("vl_status_pick_hero");
  else if (pk && pk.kind === "target") setStatusVl("vl_status_pick_target");
  else if (pk && pk.kind === "place") setStatusVl("vl_status_pick_place", { c: tVl("vl_card_" + s.heroRow[pk.hero]) });
  else if (s.finished.length) setStatusVl("vl_status_last_round", { p: playerNameVl(s.finished[0]), n: s.actionsLeft });
  else setStatusVl(AppStateVl.mode === "vs-ai" ? "vl_status_turn" : "vl_status_turn_player", { p: playerNameVl(s.current), n: s.actionsLeft });
  renderVl();
}

/*** Actions ***/

function doVl(act) {
  const s = AppStateVl.state;
  const me = s.current;
  if (!VC().apply(s, act)) return false;
  AppStateVl.pick = null;
  if (s.winner !== null) { endGameVl(); return true; }
  saveVlGame();
  if (s.current !== me) {
    if (AppStateVl.mode === "hotseat") AppStateVl.revealed = false;
    if (isAiVl(s.current)) { runAiVl(); return true; }
  }
  promptVl();
  return true;
}

function onActVl(kind, extra) {
  const s = AppStateVl.state;
  if (!humanTurnVl() || s.phase !== "act") return;
  if (kind === "collect") { doVl({ type: "collect" }); return; }
  if (kind === "step") { doVl({ type: "step", step: parseInt(extra, 10) }); return; }
  if (kind === "scheme") { AppStateVl.pick = { kind: "hero" }; promptVl(); }
}

// A button in the chooser box.
function onChooseVl(value) {
  const s = AppStateVl.state;
  const pk = AppStateVl.pick;
  if (!humanTurnVl()) return;
  if (s.phase === "collect") { doVl({ type: "take", from: parseInt(value, 10) }); return; }
  if (!pk) return;
  if (value === "cancel") { AppStateVl.pick = null; promptVl(); return; }
  if (pk.kind === "hero") {
    const hero = parseInt(value, 10);
    const targets = schemeTargetsVl(hero);
    if (targets.length === 1) AppStateVl.pick = { kind: "place", hero, target: targets[0] };
    else AppStateVl.pick = { kind: "target", hero };
    promptVl();
  } else if (pk.kind === "target") {
    AppStateVl.pick = { kind: "place", hero: pk.hero, target: parseInt(value, 10) };
    promptVl();
  } else if (pk.kind === "place") {
    doVl({ type: "scheme", hero: pk.hero, target: pk.target, place: parseInt(value, 10) });
  }
}

function schemeTargetsVl(hero) {
  const out = [];
  VC().legalActions(AppStateVl.state).forEach((a) => {
    if (a.type === "scheme" && a.hero === hero && out.indexOf(a.target) === -1) out.push(a.target);
  });
  return out;
}

function onHandVl(i) {
  const s = AppStateVl.state;
  if (!humanTurnVl() || s.phase !== "trim") return;
  doVl({ type: "drop", card: i });
}

function onOtherVl(i) {
  AppStateVl.showOther = AppStateVl.showOther === i ? -1 : i;
  renderVl();
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
  const me = s.current;
  const act = VC().chooseAction(s, Math.random, AppStateVl.level);
  VC().apply(s, act);
  if (s.winner !== null) { AppStateVl.busy = false; endGameVl(); return; }
  saveVlGame();
  if (s.current !== me && !isAiVl(s.current)) {
    AppStateVl.busy = false;
    if (AppStateVl.mode === "hotseat") AppStateVl.revealed = false;
    promptVl();
    return;
  }
  if (s.current !== me) setStatusVl("vl_status_computer", { p: playerNameVl(s.current) });
  renderVl();
  setTimeout(stepAiVl, typeof AiPacing !== "undefined" ? AiPacing.delay(s.current !== me ? 900 : 600) : 600);
}

/*** End ***/

function endGameVl(resigned) {
  const s = AppStateVl.state;
  AppStateVl.gameOver = true;
  AppStateVl.busy = false;
  AppStateVl.pick = null;
  const ws = s.winners && s.winners.length ? s.winners : [s.winner];
  let title, text, info;
  if (AppStateVl.mode === "vs-ai") {
    const mine = ws.indexOf(0) !== -1;
    const shared = mine && ws.length > 1;
    if (resigned) { title = tVl("vl_result_lose"); text = tVl("vl_result_resigned"); }
    else if (shared) { title = tVl("vl_result_shared"); text = tVl("vl_result_shared_text"); }
    else if (mine) { title = tVl("vl_result_win"); text = tVl("vl_result_win_text"); }
    else { title = tVl("vl_result_lose"); text = fillVl("vl_result_lose_text", { v: ws.map((w) => villainNameVl(s.players[w].villain)).join(", ") }); }
    if (typeof GameStats !== "undefined") GameStats.record("villains", shared ? "draw" : (mine && !resigned ? "win" : "loss"));
    info = shared ? text : I18n.t(mine && !resigned ? "ui_status_you_win" : "ui_status_computer_wins") + " " + text;
  } else {
    title = ws.length > 1 ? fillVl("vl_result_players_share", { p: ws.map((w) => playerNameVl(w)).join(", ") }) : fillVl("vl_result_player_wins", { p: playerNameVl(ws[0]) });
    text = title;
    info = text;
  }
  setStatusVl(null);
  document.getElementById("board-info").textContent = info;
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
  s.winners = [best];
  endGameVl(true);
}

/*** Drawing ***/

// The steps of a place: "✓ Knead the dough" / "○ Roof (5)".
function placeHtmlVl(s, pi, i) {
  const p = s.players[pi];
  const hero = VC().heroAt(p, i);
  const sign = VC().placeSign(p, i);
  const cls = ["vl-place"];
  if (hero) cls.push("vl-blocked");
  const steps = VC().stepsOf(p).map((st, j) => j).filter((j) => VC().stepsOf(p)[j][1] === i);
  let html = '<span class="vl-place-name">' + escVl(placeNameVl(p, i)) + "</span>" +
    '<span class="vl-place-sign">' + escVl(signNameVl(sign)) + "</span>";
  const label = [placeNameVl(p, i), signNameVl(sign)];
  steps.forEach((j) => {
    const done = p.done[j];
    const t = (done ? "✓ " : "○ ") + stepNameVl(p, j) + (done ? "" : " (" + VC().stepPrice(p, j) + ")");
    html += '<span class="vl-place-step' + (done ? " vl-done" : "") + '">' + escVl(t) + "</span>";
    label.push(t);
  });
  if (hero) {
    const h = fillVl("vl_hero_here", { c: tVl("vl_card_" + hero.card), n: VC().card(hero.card).str });
    html += '<span class="vl-hero">' + escVl(h) + "</span>";
    label.push(h);
  }
  return '<div class="' + cls.join(" ") + '" role="group" aria-label="' + escVl(label.join(", ")) + '">' + html + "</div>";
}

function goalHtmlVl(s, pi) {
  const p = s.players[pi];
  const st = VC().stepsOf(p);
  const done = p.done.filter(Boolean).length;
  const items = st.map((x, j) => {
    const d = p.done[j];
    let t = stepNameVl(p, j) + " – " + placeNameVl(p, x[1]);
    if (!d) t += ", " + fillVl("vl_price_n", { n: VC().stepPrice(p, j) });
    if (x[3]) t += " " + tVl("vl_step_last");
    return '<li class="' + (d ? "vl-done" : "") + '">' + (d ? "✓ " : "○ ") + escVl(t) + "</li>";
  });
  return '<div class="vl-goal-head"><strong>' + escVl(playerNameVl(pi)) + "</strong> · " + escVl(fillVl("vl_steps_n", { n: done, m: st.length })) + "</div>" +
    '<p class="vl-goal-text">' + escVl(tVl("vl_goal_" + p.villain)) + "</p>" +
    '<ul class="vl-steps">' + items.join("") + "</ul>";
}

function chooserHtmlVl(s) {
  const pk = AppStateVl.pick;
  const btn = (v, text) => '<button type="button" class="secondary vl-choose" data-value="' + escVl(v) + '">' + escVl(text) + "</button>";
  let out = "";
  if (s.phase === "collect") {
    s.market.forEach((id, i) => { if (id !== null) out += btn(String(i), spellNameVl(id)); });
    if (s.deck.length + s.discard.length > 0) out += btn("-1", tVl("vl_take_deck"));
    return out;
  }
  if (!pk) return "";
  if (pk.kind === "hero") {
    s.heroRow.forEach((id, k) => { if (id !== null && schemeTargetsVl(k).length) out += btn(String(k), heroNameVl(id)); });
  } else if (pk.kind === "target") {
    schemeTargetsVl(pk.hero).forEach((t) => { out += btn(String(t), playerNameVl(t)); });
  } else if (pk.kind === "place") {
    const q = s.players[pk.target];
    [0, 1, 2].forEach((i) => {
      if (VC().heroAt(q, i)) return;
      const open = VC().stepsOf(q).filter((st, j) => st[1] === i && !q.done[j]).length;
      out += btn(String(i), placeNameVl(q, i) + " (" + fillVl("vl_open_steps_n", { n: open }) + ")");
    });
  }
  return out + btn("cancel", tVl("vl_cancel"));
}

function renderVl() {
  const s = AppStateVl.state;
  if (!s) return;
  const me = viewerVl();
  const p = s.players[me];
  const covered = AppStateVl.mode === "hotseat" && !AppStateVl.revealed && !AppStateVl.gameOver;
  const myTurn = humanTurnVl() && s.current === me;

  document.getElementById("vl-goal").innerHTML = goalHtmlVl(s, me);
  document.getElementById("vl-domain").innerHTML = [0, 1, 2].map((i) => placeHtmlVl(s, me, i)).join("");

  // The market and the open heroes.
  document.getElementById("vl-market").innerHTML =
    "<p><strong>" + escVl(tVl("vl_market_title")) + "</strong> " + escVl(s.market.filter((c) => c !== null).map(spellNameVl).join(" · ")) + "</p>" +
    "<p><strong>" + escVl(tVl("vl_heroes_title")) + "</strong> " + escVl(s.heroRow.filter((c) => c !== null).map(heroNameVl).join(" · ")) + "</p>";

  // Action buttons.
  const actsBox = document.getElementById("vl-actions");
  let ah = "";
  if (myTurn && s.phase === "act" && !AppStateVl.pick) {
    const legal = VC().legalActions(s);
    if (legal.some((a) => a.type === "collect")) ah += '<button type="button" class="secondary vl-act" data-kind="collect">' + escVl(tVl("vl_act_collect")) + "</button>";
    const seen = {};
    VC().stepsOf(p).forEach((st, j) => {
      // The same step twice (spin, bird): one button for the next one.
      if (!VC().stepOpen(p, j) || seen[st[0] + ":" + st[1]]) return;
      seen[st[0] + ":" + st[1]] = true;
      const ok = legal.some((a) => a.type === "step" && a.step === j);
      ah += '<button type="button" class="secondary vl-act" data-kind="step" data-extra="' + j + '"' + (ok ? "" : " disabled") + ">" +
        escVl(fillVl("vl_act_step", { s: stepNameVl(p, j), n: VC().stepPrice(p, j) })) + "</button>";
    });
    if (!s.schemed) {
      const ok = legal.some((a) => a.type === "scheme");
      ah += '<button type="button" class="secondary vl-act" data-kind="scheme"' + (ok ? "" : " disabled") + ">" + escVl(tVl("vl_act_scheme")) + "</button>";
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
    const trim = myTurn && s.phase === "trim";
    hand.innerHTML = p.hand.map((id, i) => {
      const cls = ["vl-card"];
      if (!trim) cls.push("vl-unplayable");
      return '<li><button type="button" class="' + cls.join(" ") + '" data-hand="' + i + '"' + (trim ? "" : ' aria-disabled="true"') + ">" + escVl(spellNameVl(id)) + "</button></li>";
    }).join("");
    hand.querySelectorAll(".vl-card").forEach((b) => b.addEventListener("click", () => onHandVl(parseInt(b.getAttribute("data-hand"), 10))));
  }

  // The others.
  const others = document.getElementById("vl-others");
  let oh = "";
  s.players.forEach((q, i) => {
    if (i === me) return;
    const line = fillVl("vl_other_line", { p: playerNameVl(i), n: q.done.filter(Boolean).length, m: q.done.length, h: q.hand.length, k: q.heroes.length });
    oh += '<li><button type="button" class="vl-other' + (AppStateVl.showOther === i ? " vl-selected" : "") + '" data-other="' + i + '">' + escVl(line) + "</button>";
    if (AppStateVl.showOther === i) {
      oh += '<div class="vl-other-full">' + goalHtmlVl(s, i) + '<div class="vl-domain vl-domain-small">' + [0, 1, 2].map((k) => placeHtmlVl(s, i, k)).join("") + "</div></div>";
    }
    oh += "</li>";
  });
  others.innerHTML = oh;
  others.querySelectorAll(".vl-other").forEach((b) => b.addEventListener("click", () => onOtherVl(parseInt(b.getAttribute("data-other"), 10))));

  document.getElementById("vl-log").innerHTML = s.log.filter((e) => e.k !== "end").slice(-VL_LOG_LINES).map((e) => "<li>" + escVl(logLineVl(s, e)) + "</li>").join("");
}

function logLineVl(s, e) {
  const who = (i) => playerNameVl(i);
  const pl = (i) => s.players[i];
  switch (e.k) {
    case "take": return e.c ? fillVl("vl_log_take", { p: who(e.p), c: spellNameVl(e.c) }) : fillVl("vl_log_take_deck", { p: who(e.p) });
    case "drop": return fillVl("vl_log_drop", { p: who(e.p) });
    case "step": return fillVl("vl_log_step", { p: who(e.p), s: stepNameVl(pl(e.p), e.step) });
    case "leave": return fillVl("vl_log_leave", { p: who(e.p), c: tVl("vl_card_" + e.c) });
    case "hero": return fillVl("vl_log_hero", { p: who(e.p), t: who(e.t), c: tVl("vl_card_" + e.c), x: placeNameVl(pl(e.t), e.place) });
    case "cuthedge": return fillVl("vl_log_cuthedge", { t: who(e.t) });
    case "done": return fillVl("vl_log_done", { p: who(e.p) });
    case "win": return fillVl("vl_log_win", { p: who(e.p) });
    default: return "";
  }
}

document.addEventListener("DOMContentLoaded", initVlApp);
