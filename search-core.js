// Language-neutral search helpers, also used by tests without a DOM.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GamesSearch = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  function normalize(value) {
    return String(value || "").toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function matches(game, query, localized) {
    const q = normalize(query).trim();
    if (!q) return true;
    const fields = localized || {};
    return normalize([fields.name, fields.description, fields.family, fields.category]
      .concat(game.keywords || []).join(" ")).includes(q);
  }
  return { normalize, matches };
});
