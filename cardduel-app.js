// cardduel-app.js
// Wires CardDuelCore ("Card Duel") to cardduel.html.
//
// Layout, top to bottom: the other mage (a button - it is a target), their
// creatures, your creatures, your mage, the action buttons, a line that
// explains the card or creature tapped last, your hand as a list of large
// cards and the log of the last moves. Tap a card in the hand, then
// "Play"; a spell that needs a target then asks for one - tap it. To
// attack, tap one of your creatures that is ready (thick frame), then
// what it attacks (dashed frames mark what can be chosen). Tapping any
// creature or card also explains its abilities.
//
// Against the computer the human is always player 0 and sits at the
// bottom; on one device the player whose turn it is sits at the bottom,
// and the hand is covered until they tap "Show my cards". Every text comes
// from i18n keys (cd_*): card names, ability names and the log entries
// the core writes ({ k: "play", p, c, ... }).

const CD_SAVE_KEY = "einkchess_save_cardduel";
const CD_LOG_LINES = 8;

const AppStateCd = {
  mode: "vs-ai",      // "vs-ai" | "hotseat"
  level: "medium",
  state: null,
  gameOver: false,
  revealed: true,     // hotseat: whether the current hand is uncovered
  sel: null,          // { kind: "hand" | "board", index }
  targeting: false,   // waiting for a target of the selected card/creature
  info: null,         // what the explanation line shows: { kind, ... }
  status: null,       // { key, vars }
  busy: false
};

function tCd(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

// A text with {n}-style places filled in.
function fillCd(key, vars) {
  let s = tCd(key);
  Object.keys(vars || {}).forEach((k) => { s = s.split("{" + k + "}").join(String(vars[k])); });
  return s;
}

function coreCd() { return CardDuelCore; }

function playerNameCd(p) {
  if (AppStateCd.mode === "vs-ai") return p === 0 ? tCd("cd_you") : tCd("cd_computer");
  return fillCd("cd_player_n", { n: p + 1 });
}

function isAiCd(p) { return AppStateCd.mode === "vs-ai" && p === 1; }

// Who sits at the bottom.
function viewerCd() {
  const s = AppStateCd.state;
  return AppStateCd.mode === "vs-ai" ? 0 : s.current;
}

function cardNameCd(id) { return tCd("cd_card_" + id.replace(/^[a-z]+_/, "")); }

function abilityNameCd(a) { return tCd("cd_ab_" + a); }

function fxTextCd(fx) {
  if (!fx) return "";
  const vars = { n: fx.n, m: fx.m };
  if (fx.type === "bounce") vars.n = fx.max;
  if (fx.type === "buffall" && !fx.n) return fillCd("cd_fx_buffall_life", vars);
  return fillCd("cd_fx_" + fx.type, vars);
}

// One sentence for the card: its abilities, then its effect.
function cardTextCd(id) {
  const c = coreCd().card(id);
  const parts = [];
  if (c.abil.length) parts.push(c.abil.map(abilityNameCd).join(", ") + ".");
  if (c.fx) parts.push(c.kind === "creature" ? fillCd("cd_on_play", { s: fxTextCd(c.fx) }) : fxTextCd(c.fx));
  return parts.join(" ");
}

// The element emblem: leaf, flame, drop or rock, black on white.
const CD_EMBLEM = {
  forest: '<path d="M12 3C5 6 4 14 7 19C12 18 19 13 18 4C16 4 14 3.5 12 3Z" fill="#fff" stroke="#141413" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 19L15 8M10.5 14L8.5 11M13 10.5L15.5 12" fill="none" stroke="#141413" stroke-width="1.5" stroke-linecap="round"/>',
  fire: '<path d="M12 2C13 7 18 9 18 15A6 6 0 0 1 6 15C6 11 9 10 9 6C11 8 11 10 11 11C13 9 13 5 12 2Z" fill="#141413" stroke="#141413" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 13C13 15 15 16 14 18.5A2.4 2.4 0 0 1 10 18C10 16 12 15 12 13Z" fill="#fff"/>',
  water: '<path d="M12 2.5C14.5 7 18.5 10.5 18.5 15A6.5 6.5 0 0 1 5.5 15C5.5 10.5 9.5 7 12 2.5Z" fill="#fff" stroke="#141413" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 15.5A3.5 3.5 0 0 0 12 19" fill="none" stroke="#141413" stroke-width="1.6" stroke-linecap="round"/><path d="M7 12H17M6.4 14.5H17.6" fill="none" stroke="#141413" stroke-width="1" stroke-dasharray="1.6 1.6"/>',
  stone: '<path d="M4 17L6 9L11 5L18 7L21 14L16 20H8Z" fill="#fff" stroke="#141413" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 9L11 12L18 7M11 12L13 20M11 12L4 17" fill="none" stroke="#141413" stroke-width="1.3" stroke-linejoin="round"/>'
};

function emblemCd(el, cls) {
  return '<svg class="' + (cls || "cd-emblem") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + CD_EMBLEM[el] + "</svg>";
}

function setStatusCd(key, vars) {
  AppStateCd.status = key ? { key, vars: vars || {} } : null;
  const el = document.getElementById("board-info");
  if (!el) return;
  let text = key ? fillCd(key, vars) : "";
  if (AppStateCd.mode === "vs-ai" && key) {
    const statusKey = key === "cd_status_computer_turn" || key === "cd_status_computer_starts" ? "ui_status_computer_turn"
      : (key === "cd_status_your_turn" || key === "cd_status_you_start" ? "ui_status_your_turn" : null);
    if (statusKey) {
      const extra = text.replace(/^.*?(?:\.|…|!)(?:\s+|$)/, "").trim();
      text = I18n.t(statusKey) + (extra ? " " + extra : "");
    }
  }
  el.textContent = text;
}
function saveCdGame() {
  if (typeof GameStorage === "undefined" || !AppStateCd.state) return;
  GameStorage.save(CD_SAVE_KEY, { mode: AppStateCd.mode, level: AppStateCd.level, state: AppStateCd.state });
}

function clearSavedCdGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(CD_SAVE_KEY);
}

/*** Setup ***/

// Setting "Show move suggestions" (move-hints.js); off by default.
function hintsCd() {
  return typeof MoveHints === "undefined" || MoveHints.enabled();
}

function initCdApp() {
  if (typeof MoveHints !== "undefined") MoveHints.onChange(() => renderCd());
  // Hatching and frame patterns of the card pictures, once per page.
  if (typeof CardDuelArt !== "undefined" && !document.querySelector(".cda-defs")) document.body.insertAdjacentHTML("afterbegin", CardDuelArt.defs());
  const viewBtn = document.getElementById("cd-view");
  if (viewBtn) viewBtn.addEventListener("click", openViewCd);
  const viewClose = document.getElementById("cd-viewer-close");
  if (viewClose) viewClose.addEventListener("click", closeViewCd);
  document.addEventListener("keydown", (e) => {
    const box = document.getElementById("cd-viewer");
    if (e.key === "Escape" && box && !box.classList.contains("hidden")) closeViewCd();
  });
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeHotseat = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("cd-level-wrap");
  let pendingMode = "vs-ai";

  function setMode(mode) {
    pendingMode = mode;
    if (modeHotseat) modeHotseat.classList.toggle("active-mode", mode === "hotseat");
    if (modeAi) modeAi.classList.toggle("active-mode", mode === "vs-ai");
    if (levelWrap) levelWrap.classList.toggle("hidden", mode !== "vs-ai");
    const oppLabel = document.getElementById("cd-deck2-label");
    if (oppLabel) I18n.setKey(oppLabel, mode === "vs-ai" ? "cd_deck_computer" : "cd_deck_player2");
    const ownLabel = document.getElementById("cd-deck1-label");
    if (ownLabel) I18n.setKey(ownLabel, mode === "vs-ai" ? "cd_deck_yours" : "cd_deck_player1");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeHotseat) modeHotseat.addEventListener("click", () => setMode("hotseat"));
  if (modeAi) modeAi.addEventListener("click", () => setMode("vs-ai"));

  document.getElementById("start-cardduel-game").addEventListener("click", () => {
    const pick = (id) => {
      const v = document.getElementById(id).value;
      return v === "random" ? coreCd().ELEMENTS[Math.floor(Math.random() * 4)] : v;
    };
    startNewCdGame(pendingMode, document.getElementById("cd-level").value, [pick("cd-deck1"), pick("cd-deck2")]);
  });
  document.getElementById("resign-button").addEventListener("click", resignCd);
  document.getElementById("cd-play").addEventListener("click", onPlayCd);
  document.getElementById("cd-cancel").addEventListener("click", () => { clearSelCd(); renderCd(); });
  document.getElementById("cd-end").addEventListener("click", onEndTurnCd);
  document.getElementById("cd-show-hand").addEventListener("click", () => {
    AppStateCd.revealed = true;
    promptCd();
  });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => {
      setMode(pendingMode);
      if (AppStateCd.status) setStatusCd(AppStateCd.status.key, AppStateCd.status.vars);
      if (AppStateCd.state) renderCd();
    });
  }
  setMode("vs-ai");

  let saved = typeof GameStorage !== "undefined" ? GameStorage.load(CD_SAVE_KEY) : null;
  // A game saved under the old rules (before task 149, no `rules: 2`)
  // cannot go on under the new ones: drop it quietly.
  if (saved && saved.state && !coreCd().isCurrentState(saved.state)) {
    clearSavedCdGame();
    saved = null;
  }
  if (saved && saved.state && saved.state.players && saved.state.winner === null) {
    AppStateCd.mode = saved.mode === "hotseat" ? "hotseat" : "vs-ai";
    AppStateCd.level = saved.level || "medium";
    AppStateCd.state = saved.state;
    AppStateCd.gameOver = false;
    AppStateCd.revealed = AppStateCd.mode !== "hotseat";
    clearSelCd();
    setMode(AppStateCd.mode);
    document.getElementById("cd-level").value = AppStateCd.level;
    showBoardCd();
    if (isAiCd(AppStateCd.state.current)) runAiCd();
    else promptCd();
  }
}

function showBoardCd() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startNewCdGame(mode, level, decks) {
  AppStateCd.mode = mode;
  AppStateCd.level = level;
  const starter = Math.random() < 0.5 ? 0 : 1;
  AppStateCd.state = coreCd().createGame(decks, starter);
  AppStateCd.gameOver = false;
  AppStateCd.busy = false;
  AppStateCd.revealed = mode !== "hotseat";
  clearSelCd();
  const result = document.getElementById("game-result");
  if (result) result.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
  showBoardCd();
  saveCdGame();
  if (isAiCd(starter)) {
    setStatusCd("cd_status_computer_starts");
    renderCd();
    runAiCd();
  } else {
    promptCd(true);
  }
}

function clearSelCd() {
  AppStateCd.sel = null;
  AppStateCd.targeting = false;
}

// The status line for the player whose turn it is now.
function promptCd(first) {
  const s = AppStateCd.state;
  if (!s || AppStateCd.gameOver) return;
  first = first || s.turn === 1;
  if (AppStateCd.mode === "hotseat" && !AppStateCd.revealed) {
    setStatusCd("cd_status_pass", { p: playerNameCd(s.current) });
  } else if (AppStateCd.mode === "vs-ai") {
    setStatusCd(first ? "cd_status_you_start" : "cd_status_your_turn");
  } else {
    setStatusCd(first ? "cd_status_player_starts" : "cd_status_player_turn", { p: playerNameCd(s.current) });
  }
  renderCd();
}

function humanTurnCd() {
  const s = AppStateCd.state;
  return !!s && !AppStateCd.gameOver && !AppStateCd.busy && !isAiCd(s.current) && AppStateCd.revealed;
}

/*** Taps ***/

function onHandCd(i) {
  if (!humanTurnCd()) return;
  const s = AppStateCd.state;
  AppStateCd.sel = { kind: "hand", index: i };
  AppStateCd.targeting = false;
  AppStateCd.info = { kind: "card", id: s.players[s.current].hand[i] };
  renderCd();
}

function onPlayCd() {
  if (!humanTurnCd() || !AppStateCd.sel || AppStateCd.sel.kind !== "hand") return;
  const s = AppStateCd.state;
  const i = AppStateCd.sel.index;
  if (!coreCd().canPlay(s, i)) {
    // Without move suggestions the Play button stays on: say why not.
    const pl = s.players[s.current], c = coreCd().card(pl.hand[i]);
    if (c.cost > pl.power) setStatusCd("cd_status_no_power");
    else setStatusCd("cd_status_no_target");
    renderCd();
    return;
  }
  const id = s.players[s.current].hand[i];
  if (coreCd().targetKind(id)) {
    AppStateCd.targeting = true;
    setStatusCd("cd_status_choose_target", { c: cardNameCd(id) });
    renderCd();
    return;
  }
  doActionCd({ type: "play", card: i });
}

// A tap on a creature (side, index) or a mage (index "mage").
function onTargetCd(side, index) {
  const s = AppStateCd.state;
  if (!s) return;
  const me = s.current;
  if (humanTurnCd() && AppStateCd.targeting && AppStateCd.sel) {
    if (AppStateCd.sel.kind === "hand") {
      const act = { type: "play", card: AppStateCd.sel.index, target: { side, index } };
      if (coreCd().isLegal(s, act)) { doActionCd(act); return; }
    } else if (side !== me) {
      const act = { type: "attack", attacker: AppStateCd.sel.index, target: index };
      if (coreCd().isLegal(s, act)) { doActionCd(act); return; }
    }
  }
  // Otherwise: explain it, and pick an own ready creature to attack.
  if (index === "mage") {
    AppStateCd.info = { kind: "mage", side };
  } else {
    const m = s.players[side].board[index];
    AppStateCd.info = { kind: "creature", side, uid: m.uid };
    if (humanTurnCd() && side === me && coreCd().attackTargets(s, index).length) {
      const again = AppStateCd.sel && AppStateCd.sel.kind === "board" && AppStateCd.sel.index === index;
      if (again) clearSelCd();
      else {
        AppStateCd.sel = { kind: "board", index };
        AppStateCd.targeting = true;
        setStatusCd("cd_status_choose_attack", { c: cardNameCd(m.id) });
      }
    } else if (AppStateCd.sel && AppStateCd.sel.kind === "board") {
      clearSelCd();
    }
  }
  renderCd();
}

function onEndTurnCd() {
  if (!humanTurnCd()) return;
  doActionCd({ type: "end" });
}

// Carries out an action of the player whose turn it is, then moves on.
function doActionCd(act) {
  const s = AppStateCd.state;
  const p = s.current;
  if (!coreCd().apply(s, act)) return;
  clearSelCd();
  if (s.winner !== null) { endGameCd(); return; }
  if (act.type === "end") {
    AppStateCd.info = null;
    if (AppStateCd.mode === "hotseat") AppStateCd.revealed = false;
    saveCdGame();
    if (isAiCd(s.current)) { setStatusCd("cd_status_computer_turn"); renderCd(); runAiCd(); return; }
    promptCd();
    return;
  }
  saveCdGame();
  if (!isAiCd(p)) promptCd();
}

/*** The computer ***/

function runAiCd() {
  if (AppStateCd.busy) return;
  AppStateCd.busy = true;
  setStatusCd("cd_status_computer_turn");
  renderCd();
  setTimeout(stepAiCd, typeof AiPacing !== "undefined" ? AiPacing.delay(700) : 700);
}

function stepAiCd() {
  const s = AppStateCd.state;
  if (!s || AppStateCd.gameOver || !isAiCd(s.current)) { AppStateCd.busy = false; return; }
  const act = coreCd().chooseAction(s, AppStateCd.level);
  coreCd().apply(s, act);
  if (s.winner !== null) { AppStateCd.busy = false; endGameCd(); return; }
  saveCdGame();
  if (act.type === "end") {
    AppStateCd.busy = false;
    promptCd();
    return;
  }
  renderCd();
  setTimeout(stepAiCd, typeof AiPacing !== "undefined" ? AiPacing.delay(700) : 700);
}

/*** End ***/

function endGameCd(resignedBy) {
  const s = AppStateCd.state;
  AppStateCd.gameOver = true;
  AppStateCd.busy = false;
  clearSelCd();
  const w = s.winner;
  let title, text;
  if (AppStateCd.mode === "vs-ai") {
    title = tCd(w === 0 ? "cd_result_win" : "cd_result_lose");
    text = resignedBy !== undefined ? tCd("cd_result_you_resigned") : tCd(w === 0 ? "cd_result_win_text" : "cd_result_lose_text");
    if (typeof GameStats !== "undefined") GameStats.record("cardduel", w === 0 ? "win" : "loss");
  } else {
    title = fillCd("cd_result_player_wins", { p: playerNameCd(w) });
    text = resignedBy !== undefined ? fillCd("cd_result_player_resigned", { p: playerNameCd(resignedBy) }) + " " + title : title;
  }
  setStatusCd(null);
  const status = document.getElementById("board-info");
  if (status) status.textContent = AppStateCd.mode === "vs-ai" ? I18n.t(w === 0 ? "ui_status_you_win" : "ui_status_computer_wins") + " " + text : text;
  const result = document.getElementById("game-result");
  if (result) result.textContent = text;
  if (window.ResultModal) window.ResultModal.show(title, text);
  clearSavedCdGame();
  renderCd();
}

function resignCd() {
  const s = AppStateCd.state;
  if (!s || AppStateCd.gameOver) return;
  const loser = AppStateCd.mode === "vs-ai" ? 0 : s.current;
  s.winner = 1 - loser;
  endGameCd(loser);
}

/*** Drawing ***/

function creatureLabelCd(m, side) {
  const parts = [cardNameCd(m.id), fillCd("cd_aria_stats", { a: m.atk, l: m.hp, m: m.max })];
  if (m.abil.length) parts.push(m.abil.map(abilityNameCd).join(", "));
  if (side === AppStateCd.state.current && !AppStateCd.gameOver) parts.push(tCd(m.ready && m.atk > 0 ? "cd_aria_ready" : "cd_aria_not_ready"));
  return parts.join(", ");
}

function creatureHtmlCd(m, side, idx, targets) {
  const s = AppStateCd.state;
  const c = coreCd().card(m.id);
  const cls = ["cd-creature"];
  if (side === s.current && m.ready && m.atk > 0 && !AppStateCd.gameOver) cls.push("cd-ready");
  if (AppStateCd.sel && AppStateCd.sel.kind === "board" && side === s.current && AppStateCd.sel.index === idx) cls.push("cd-selected");
  if (targets.some((t) => t.side === side && t.index === idx)) cls.push("cd-target");
  const hurt = m.hp < m.max;
  return '<button type="button" class="' + cls.join(" ") + '" data-side="' + side + '" data-index="' + idx + '">' +
    pictureCd(m.id, "cda-pic cd-creature-pic", c.el) +
    '<span class="cd-creature-name">' + escCd(cardNameCd(m.id)) + "</span>" +
    '<span class="cd-stats">' + m.atk + " / " + m.hp + (hurt ? '<span class="cd-hurt">(' + m.max + ")</span>" : "") + "</span>" +
    (m.abil.length ? '<span class="cd-abil">' + escCd(m.abil.map(abilityNameCd).join(", ")) + "</span>" : "") +
    "</button>";
}

function escCd(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// What can be tapped as a target right now: [{ side, index }].
function targetsCd() {
  const s = AppStateCd.state;
  if (!AppStateCd.targeting || !AppStateCd.sel || !humanTurnCd()) return [];
  if (AppStateCd.sel.kind === "hand") {
    return coreCd().validTargets(s, s.players[s.current].hand[AppStateCd.sel.index]);
  }
  return coreCd().attackTargets(s, AppStateCd.sel.index).map((t) => ({ side: 1 - s.current, index: t }));
}

function mageHtmlCd(side, targets) {
  const s = AppStateCd.state;
  const pl = s.players[side];
  const facts = fillCd("cd_mage_facts", { l: pl.life, h: pl.hand.length, d: pl.deck.length, p: pl.power });
  return (typeof CardDuelArt !== "undefined" ? CardDuelArt.portrait(s.decks[side], "cda-portrait cd-mage-portrait") : emblemCd(s.decks[side], "cd-emblem cd-emblem-mage")) +
    '<span class="cd-mage-name">' + escCd(playerNameCd(side)) + "</span>" +
    '<span class="cd-mage-life">' + escCd(fillCd("cd_life_n", { n: pl.life })) + "</span>" +
    '<span class="cd-mage-facts">' + escCd(facts) + "</span>";
}

// A mage's numbers in one sentence (explanation line, label).
function mageFactsLongCd(side) {
  const s = AppStateCd.state;
  const pl = s.players[side];
  return fillCd("cd_mage_facts_long", { l: pl.life, h: pl.hand.length, d: pl.deck.length, g: pl.grave.length, p: pl.power, e: tCd("cd_el_" + s.decks[side]) });
}

function handCardHtmlCd(id, i, playable, selected) {
  const c = coreCd().card(id);
  const cls = ["cd-card"];
  if (!playable) cls.push("cd-unplayable");
  if (selected) cls.push("cd-selected");
  const stats = c.kind === "creature" ? '<span class="cd-card-stats">' + c.atk + " / " + c.hp + "</span>" : "";
  return '<li><button type="button" class="' + cls.join(" ") + '" data-hand="' + i + '">' +
    pictureCd(id, "cda-pic cd-card-pic", c.el) +
    '<span class="cd-card-top">' + emblemCd(c.el) + '<span class="cd-card-name">' + escCd(cardNameCd(id)) + "</span>" +
    '<span class="cd-cost" aria-hidden="true">' + c.cost + "</span></span>" +
    '<span class="cd-card-kind">' + escCd(tCd(c.kind === "creature" ? "cd_kind_creature" : "cd_kind_spell")) + "</span>" + stats +
    '<span class="cd-card-text">' + escCd(cardTextCd(id)) + "</span>" +
    "</button></li>";
}

function handLabelCd(id, playable) {
  const c = coreCd().card(id);
  const parts = [cardNameCd(id), fillCd("cd_aria_cost", { n: c.cost }), tCd(c.kind === "creature" ? "cd_kind_creature" : "cd_kind_spell")];
  if (c.kind === "creature") parts.push(fillCd("cd_aria_stats", { a: c.atk, l: c.hp, m: c.hp }));
  const text = cardTextCd(id);
  if (text) parts.push(text);
  if (!playable) parts.push(tCd("cd_aria_unplayable"));
  return parts.join(", ");
}

// A card's drawing (cardduel-art.js); the element symbol if it is missing.
function pictureCd(id, cls, el) {
  const pic = typeof CardDuelArt !== "undefined" ? CardDuelArt.picture(id, cls) : "";
  return pic || emblemCd(el);
}

// The card behind the explanation line (a card in hand or a creature),
// or null.
function viewedCardCd() {
  const s = AppStateCd.state, info = AppStateCd.info;
  if (!s || !info) return null;
  if (info.kind === "card") return info.id ? { id: info.id, m: null } : null;
  if (info.kind === "creature") {
    const m = s.players[info.side].board.find((x) => x.uid === info.uid);
    return m ? { id: m.id, m } : null;
  }
  return null;
}

// "Look": the card large, with its picture and the full text.
function openViewCd() {
  const v = viewedCardCd();
  const box = document.getElementById("cd-viewer");
  if (!v || !box) return;
  const c = coreCd().card(v.id);
  const abil = v.m ? v.m.abil : c.abil;
  let stats = "";
  if (c.kind === "creature") stats = v.m ? fillCd("cd_aria_stats", { a: v.m.atk, l: v.m.hp, m: v.m.max }) : c.atk + " / " + c.hp;
  const fx = c.fx ? (c.kind === "creature" ? fillCd("cd_on_play", { s: fxTextCd(c.fx) }) : fxTextCd(c.fx)) : "";
  document.getElementById("cd-viewer-body").innerHTML =
    pictureCd(v.id, "cda-pic cd-view-pic", c.el) +
    '<h2 id="cd-viewer-title" class="cd-view-name">' + escCd(cardNameCd(v.id)) + "</h2>" +
    '<p class="cd-view-line">' + escCd(tCd("cd_el_" + c.el) + " · " + tCd(c.kind === "creature" ? "cd_kind_creature" : "cd_kind_spell") + " · " + fillCd("cd_aria_cost", { n: c.cost })) + "</p>" +
    (stats ? '<p class="cd-view-stats">' + escCd(stats) + "</p>" : "") +
    (fx ? '<p class="cd-view-line">' + escCd(fx) + "</p>" : "") +
    abil.map((a) => '<p class="cd-view-line"><strong>' + escCd(abilityNameCd(a)) + "</strong>: " + escCd(tCd("cd_ab_" + a + "_desc")) + "</p>").join("");
  box.classList.remove("hidden");
  const close = document.getElementById("cd-viewer-close");
  if (close) close.focus();
}

function closeViewCd() {
  const box = document.getElementById("cd-viewer");
  if (box) box.classList.add("hidden");
  const btn = document.getElementById("cd-view");
  if (btn && !btn.disabled) btn.focus();
}

// The explanation line: the card or creature tapped last with what its
// abilities do, or a mage's numbers.
function infoHtmlCd() {
  const s = AppStateCd.state;
  const info = AppStateCd.info;
  if (!info) return escCd(tCd("cd_info_hint"));
  if (info.kind === "mage") {
    return "<strong>" + escCd(playerNameCd(info.side)) + "</strong>: " +
      escCd(mageFactsLongCd(info.side));
  }
  let id, abil, head;
  if (info.kind === "card") {
    id = info.id;
    if (!id) return "";
    const c = coreCd().card(id);
    abil = c.abil;
    head = "<strong>" + escCd(cardNameCd(id)) + "</strong> (" + escCd(fillCd("cd_aria_cost", { n: c.cost })) + ")";
    if (c.fx) head += ": " + escCd(c.kind === "creature" ? fillCd("cd_on_play", { s: fxTextCd(c.fx) }) : fxTextCd(c.fx));
  } else {
    const m = s.players[info.side].board.find((x) => x.uid === info.uid);
    if (!m) return escCd(tCd("cd_info_hint"));
    id = m.id;
    abil = m.abil;
    head = "<strong>" + escCd(cardNameCd(id)) + "</strong>: " + escCd(fillCd("cd_aria_stats", { a: m.atk, l: m.hp, m: m.max }));
  }
  const lines = abil.map((a) => "<strong>" + escCd(abilityNameCd(a)) + "</strong>: " + escCd(tCd("cd_ab_" + a + "_desc")));
  return [head].concat(lines).join("<br>");
}

function logLineCd(e) {
  const name = (id) => cardNameCd(id);
  switch (e.k) {
    case "turn": return fillCd("cd_log_turn", { p: playerNameCd(e.p), n: e.n });
    case "play": return fillCd("cd_log_play", { p: playerNameCd(e.p), c: name(e.c) });
    case "attack": return fillCd("cd_log_attack", { c: name(e.c), t: name(e.t), n: e.n, m: e.m });
    case "attackmage": return fillCd("cd_log_attack_mage", { c: name(e.c), p: playerNameCd(1 - e.p), n: e.n });
    case "hit": return fillCd("cd_log_hit", { c: name(e.c), t: name(e.t), n: e.n });
    case "hitmage": return fillCd("cd_log_hit_mage", { c: name(e.c), p: playerNameCd(e.side), n: e.n });
    case "aoe": return fillCd("cd_log_aoe", { c: name(e.c), p: playerNameCd(1 - e.p), n: e.n });
    case "quake": return fillCd("cd_log_quake", { c: name(e.c), n: e.n });
    case "heal": return fillCd("cd_log_heal", { p: playerNameCd(e.p), n: e.n });
    case "draw": return fillCd("cd_log_draw", { p: playerNameCd(e.p), n: e.n });
    case "insight": return fillCd("cd_log_insight", { p: playerNameCd(e.p), c: name(e.c) });
    case "bounce": return fillCd("cd_log_bounce", { t: name(e.t) });
    case "buff": return fillCd("cd_log_buff", { t: name(e.t), n: e.n, m: e.m });
    case "buffall": return fillCd("cd_log_buffall", { p: playerNameCd(e.p), n: e.n, m: e.m });
    case "summon": return fillCd("cd_log_summon", { p: playerNameCd(e.p), n: e.n, t: name(e.t) });
    case "dies": return fillCd("cd_log_dies", { c: name(e.c) });
    case "ward": return fillCd("cd_log_ward", { c: name(e.c), t: name(e.t), n: e.n });
    case "full": return fillCd("cd_log_full", { p: playerNameCd(e.p) });
    case "reshuffle": return fillCd("cd_log_reshuffle", { p: playerNameCd(e.p), n: e.n });
    case "win": return fillCd("cd_log_win", { p: playerNameCd(e.p) });
    default: return "";
  }
}

function renderCd() {
  const s = AppStateCd.state;
  if (!s) return;
  const me = viewerCd(), op = 1 - me;
  const targets = targetsCd();
  const covered = AppStateCd.mode === "hotseat" && !AppStateCd.revealed && !AppStateCd.gameOver;

  const top = document.getElementById("cd-mage-top");
  const bottom = document.getElementById("cd-mage-bottom");
  top.innerHTML = mageHtmlCd(op, targets);
  bottom.innerHTML = mageHtmlCd(me, targets);
  top.className = "cd-mage-btn" + (targets.some((t) => t.side === op && t.index === "mage") ? " cd-target" : "");
  bottom.className = "cd-mage-btn" + (targets.some((t) => t.side === me && t.index === "mage") ? " cd-target" : "");
  top.setAttribute("aria-label", playerNameCd(op) + ": " + mageFactsLongCd(op));
  bottom.setAttribute("aria-label", playerNameCd(me) + ": " + mageFactsLongCd(me));
  top.onclick = () => onTargetCd(op, "mage");
  bottom.onclick = () => onTargetCd(me, "mage");

  [["cd-board-top", op], ["cd-board-bottom", me]].forEach((pair) => {
    const box = document.getElementById(pair[0]);
    const side = pair[1];
    const list = s.players[side].board;
    box.innerHTML = list.length ? list.map((m, i) => creatureHtmlCd(m, side, i, targets)).join("") : '<span class="cd-empty">' + escCd(tCd("cd_no_creatures")) + "</span>";
    box.setAttribute("aria-label", tCd(side === me ? "cd_board_own" : "cd_board_other"));
    box.querySelectorAll(".cd-creature").forEach((btn) => {
      const i = parseInt(btn.getAttribute("data-index"), 10);
      btn.setAttribute("aria-label", creatureLabelCd(list[i], side));
      btn.addEventListener("click", () => onTargetCd(side, i));
    });
  });

  const myTurn = humanTurnCd() && s.current === me;
  const selHand = AppStateCd.sel && AppStateCd.sel.kind === "hand";
  document.getElementById("cd-play").disabled = !(myTurn && selHand && !AppStateCd.targeting && (!hintsCd() || coreCd().canPlay(s, AppStateCd.sel.index)));
  document.getElementById("cd-cancel").disabled = !(myTurn && AppStateCd.sel);
  document.getElementById("cd-end").disabled = !myTurn;
  document.getElementById("resign-button").classList.toggle("hidden", AppStateCd.gameOver);

  document.getElementById("cd-info").innerHTML = infoHtmlCd();
  const viewBtn = document.getElementById("cd-view");
  if (viewBtn) viewBtn.disabled = !viewedCardCd();

  const cover = document.getElementById("cd-hand-cover");
  const hand = document.getElementById("cd-hand");
  cover.classList.toggle("hidden", !covered);
  if (covered) document.getElementById("cd-hand-cover-text").textContent = fillCd("cd_status_pass", { p: playerNameCd(s.current) });
  hand.classList.toggle("hidden", covered);
  if (!covered) {
    const pl = s.players[me];
    hand.innerHTML = pl.hand.map((id, i) => handCardHtmlCd(id, i, !myTurn || !hintsCd() || coreCd().canPlay(s, i), selHand && AppStateCd.sel.index === i)).join("");
    hand.setAttribute("aria-label", fillCd("cd_hand_label", { n: pl.hand.length }));
    hand.querySelectorAll(".cd-card").forEach((btn) => {
      const i = parseInt(btn.getAttribute("data-hand"), 10);
      btn.setAttribute("aria-label", handLabelCd(pl.hand[i], !myTurn || !hintsCd() || coreCd().canPlay(s, i)));
      btn.addEventListener("click", () => onHandCd(i));
    });
  }

  const lines = s.log.filter((e) => e.k !== "end").slice(-CD_LOG_LINES).map(logLineCd).filter(Boolean);
  document.getElementById("cd-log").innerHTML = lines.map((l) => "<li>" + escCd(l) + "</li>").join("");
}

document.addEventListener("DOMContentLoaded", initCdApp);
