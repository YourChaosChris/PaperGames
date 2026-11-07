// move-link.js
// Move link (task 187): play a two-player game with someone else without any
// server. "Send move" packs the game in progress into a link
// (<game>.html#zug=<code>) and hands it to the share menu of the device (or
// copies it). The other player opens the link; the game is loaded and it is
// their turn. The link carries the game, nothing else; nothing is stored or
// sent anywhere by the site.
//
// It works with the save every game already keeps (GameStorage, key
// einkchess_save_<game>): a link is that save, minus the undo list, packed
// with deflate when the browser can, and switched to the two-players-on-one-
// device mode. Opening a link writes the save and reloads the page, so the
// game restores it exactly like after a standby. A save that does not fit
// the game is set aside by the game's own safety net (error-banner.js).
//
// Only games without chance and for two players take part (SLUGS).

const MoveLink = (function () {
  const WEB_BASE = "https://yourchaoschris.github.io/PaperGames/";
  const SAVE_PREFIX = "einkchess_save_";
  const MAX_CODE = 12000;          // characters of the code after #zug=
  const VERSION = 1;
  const SLUGS = ["alquerque", "amazons", "baghchal", "checkers", "chess", "dotsandboxes", "fanorona",
    "fourinarow", "foxandgeese", "go", "gomoku", "halma", "hex", "hnefatafl", "konane", "mancala",
    "marblepush", "morris", "reversi", "seega", "shogi", "sternhalma", "surakarta", "tablut",
    "tictactoe", "wallmaze", "xiangqi"];

  function t(key, fallback) {
    try {
      if (window.I18n && typeof I18n.t === "function") {
        const v = I18n.t(key);
        if (v && v !== key) return v;
      }
    } catch (e) { /* use fallback */ }
    return fallback;
  }

  function currentSlug() {
    const m = /([a-z0-9]+)\.html?$/.exec(window.location.pathname);
    return m ? m[1] : "";
  }

  // ---- packing ---------------------------------------------------------

  function toB64Url(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).split("+").join("-").split("/").join("_").replace(/=+$/, "");
  }

  function fromB64Url(str) {
    let s = str.split("-").join("+").split("_").join("/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function streamBytes(bytes, Stream, format) {
    const s = new Blob([bytes]).stream().pipeThrough(new Stream(format));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }

  // "z" = deflated, "p" = plain
  async function pack(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === "function") {
      try { return "z" + toB64Url(await streamBytes(bytes, CompressionStream, "deflate-raw")); } catch (e) { /* plain */ }
    }
    return "p" + toB64Url(bytes);
  }

  async function unpack(code) {
    if (typeof code !== "string" || code.length < 2 || code.length > MAX_CODE) throw new Error("size");
    if (!/^[zp][A-Za-z0-9_-]+$/.test(code)) throw new Error("chars");
    let bytes = fromB64Url(code.slice(1));
    if (code[0] === "z") {
      if (typeof DecompressionStream !== "function") throw new Error("nodecompress");
      bytes = await streamBytes(bytes, DecompressionStream, "deflate-raw");
    }
    if (bytes.length > 400000) throw new Error("big");
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // Only plain JSON data of sensible depth and size is accepted.
  function plainData(v, depth) {
    if (depth > 12) return false;
    if (v === null || typeof v === "string" || typeof v === "boolean") return true;
    if (typeof v === "number") return isFinite(v);
    if (Array.isArray(v)) return v.length <= 5000 && v.every((x) => plainData(x, depth + 1));
    if (typeof v === "object") {
      const keys = Object.keys(v);
      if (keys.length > 200) return false;
      return keys.every((k) => k !== "__proto__" && k !== "constructor" && k !== "prototype" && plainData(v[k], depth + 1));
    }
    return false;
  }

  // ---- links -----------------------------------------------------------

  // The link for a save of the given game. Returns null when the save is not
  // a game in progress for two players on one device.
  async function makeLink(slug, save) {
    if (SLUGS.indexOf(slug) === -1 || !save || typeof save !== "object") return null;
    if (save.mode !== "offline") return null;
    if (save.gameOver || save.over) return null;
    const copy = JSON.parse(JSON.stringify(save));
    copy.undoStack = [];
    const code = await pack({ v: VERSION, g: slug, s: copy });
    if (code.length > MAX_CODE) return null;
    return WEB_BASE + slug + ".html#zug=" + code;
  }

  // The save inside a code, checked; throws when it cannot be used.
  async function readCode(slug, code) {
    const data = await unpack(code);
    if (!data || data.v !== VERSION || data.g !== slug || SLUGS.indexOf(slug) === -1) throw new Error("game");
    const s = data.s;
    if (!s || typeof s !== "object" || Array.isArray(s) || !plainData(s, 0)) throw new Error("save");
    if (s.mode !== "offline") throw new Error("mode");
    s.undoStack = [];
    return s;
  }

  function readSave(slug) {
    try {
      const raw = window.localStorage.getItem(SAVE_PREFIX + slug);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // ---- opening a link --------------------------------------------------

  // While a link is being opened, the game on the page (which starts at
  // once and may save by itself) must not overwrite the game from the link.
  function guardSave(slug) {
    const key = SAVE_PREFIX + slug;
    const original = Storage.prototype.setItem;
    const originalRemove = Storage.prototype.removeItem;
    let open = false;
    Storage.prototype.setItem = function (k, v) {
      if (this === window.localStorage && k === key && !open) return;
      return original.call(this, k, v);
    };
    Storage.prototype.removeItem = function (k) {
      if (this === window.localStorage && k === key && !open) return;
      return originalRemove.call(this, k);
    };
    return {
      write: function (value) { open = true; try { original.call(window.localStorage, key, value); } finally { open = false; } },
      release: function () { Storage.prototype.setItem = original; Storage.prototype.removeItem = originalRemove; },
    };
  }

  async function openFromHash() {
    const slug = currentSlug();
    const m = /^#zug=(.*)$/.exec(window.location.hash || "");
    if (!m || SLUGS.indexOf(slug) === -1) return "stay";
    const code = m[1];
    const clean = window.location.pathname + window.location.search;
    const guard = guardSave(slug);
    try {
      const save = await readCode(slug, code);
      const existing = readSave(slug);
      const running = existing && !existing.gameOver && !existing.over;
      if (running && JSON.stringify(existing.board) !== JSON.stringify(save.board)) {
        if (!window.confirm(t("movelink_replace_confirm", "This link replaces your current game. Continue?"))) {
          guard.release();
          window.history.replaceState(null, "", clean);
          return "stay";
        }
      }
      guard.write(JSON.stringify(save));
      try { window.sessionStorage.setItem("papergames_movelink_loaded", slug); } catch (e) { /* ignore */ }
      window.location.replace(clean);
      return "reload";
    } catch (e) {
      guard.release();
      window.history.replaceState(null, "", clean);
      try { window.sessionStorage.setItem("papergames_movelink_error", "1"); } catch (e2) { /* ignore */ }
      window.setTimeout(() => notice(t("movelink_invalid", "This link cannot be used.")), 300);
    }
    return "stay";
  }

  // ---- page ------------------------------------------------------------

  let noteEl = null;

  function notice(text) {
    if (!noteEl) return;
    noteEl.textContent = text;
    noteEl.classList.remove("hidden");
  }

  async function send() {
    const slug = currentSlug();
    const save = readSave(slug);
    if (!save || save.mode !== "offline" || save.gameOver || save.over) {
      notice(t("movelink_need_two", "Start a game for two players on one device first, then make a move."));
      return;
    }
    const link = await makeLink(slug, save);
    if (!link) {
      notice(t("movelink_too_big", "This game is too long for a link."));
      return;
    }
    const text = t("movelink_share_text", "Your turn in PaperGames. Open the link to continue:");
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.pg) {
      window.webkit.messageHandlers.pg.postMessage({ type: "share", text: text, url: link });
      return;
    }
    if (typeof navigator.share === "function") {
      try { await navigator.share({ text: text, url: link }); return; } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      notice(t("movelink_copied", "Link copied. Send it to your opponent."));
    } catch (e) {
      window.prompt(t("movelink_copy_manually", "Copy this link and send it to your opponent:"), link);
    }
  }

  function inject() {
    const slug = currentSlug();
    if (SLUGS.indexOf(slug) === -1 || document.getElementById("movelink-button")) return;
    const info = document.getElementById("board-info");
    if (!info || !info.parentNode) return;
    const wrap = document.createElement("div");
    wrap.className = "movelink";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "movelink-button";
    btn.className = "secondary";
    btn.setAttribute("data-i18n", "movelink_button");
    btn.textContent = t("movelink_button", "Send move");
    btn.addEventListener("click", () => { send(); });
    noteEl = document.createElement("p");
    noteEl.id = "movelink-note";
    noteEl.className = "status-text hidden";
    noteEl.setAttribute("aria-live", "polite");
    wrap.appendChild(btn);
    wrap.appendChild(noteEl);
    info.parentNode.insertBefore(wrap, info.nextSibling);
    let loaded = null;
    try {
      loaded = window.sessionStorage.getItem("papergames_movelink_loaded");
      window.sessionStorage.removeItem("papergames_movelink_loaded");
    } catch (e) { /* ignore */ }
    if (loaded === slug) notice(t("movelink_loaded", "Game loaded from the link. It is your turn."));
    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(() => { btn.textContent = t("movelink_button", "Send move"); });
    }
  }

  if (typeof document !== "undefined") {
    if (!/^#zug=/.test(window.location.hash || "")) {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
      else inject();
    } else {
      // The saved game must be in place before the game's own script runs.
      openFromHash().then((what) => {
        if (what === "reload") return; // the page is being reloaded, it shows the message then
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
        else inject();
      });
    }
  }

  // A link opened in a tab that already shows the game only changes the
  // address (no new page load); take it up as well.
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      if (/^#zug=/.test(window.location.hash || "")) openFromHash();
    });
  }

  return { SLUGS: SLUGS, makeLink: makeLink, readCode: readCode, pack: pack, unpack: unpack };
})();

if (typeof window !== "undefined") window.MoveLink = MoveLink;
