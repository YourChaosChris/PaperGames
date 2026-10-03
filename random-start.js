// random-start.js
// Gemeinsame Einstellung "Wer anfängt": wie gewählt (Vorgabe) oder
// Zufall. Bei Zufall lost das Spiel beim Start einer Partie gegen den
// Computer aus, welche Seite der Mensch bekommt. Welche Seite laut Regel
// zuerst zieht, bleibt Sache des Spiels. Die Liste der erlaubten Seiten
// kommt immer aus dem Spiel, nicht aus diesem Modul. Muster wie
// ai-pacing.js: eine Einstellung für alle Seiten, in localStorage.

const RandomStart = (function () {
  const KEY = "papergames_random_start";

  function enabled() {
    try {
      return !!(window.localStorage && window.localStorage.getItem(KEY) === "random");
    } catch (e) {
      return false;
    }
  }

  function setEnabled(flag) {
    try {
      if (!window.localStorage) return;
      if (flag) window.localStorage.setItem(KEY, "random");
      else window.localStorage.removeItem(KEY);
    } catch (e) { /* Speicher nicht verfügbar - dann eben nicht merken */ }
  }

  function pick(options) {
    if (!options || !options.length) return undefined;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Die Funktion, die die Spiele aufrufen: die gewählte Seite, oder bei
  // eingeschalteter Einstellung eine zufällige aus `options`.
  function choose(chosen, options) {
    return enabled() && options && options.length ? pick(options) : chosen;
  }

  // Macht aus der englischen Startmeldung "You play X, ..." die Meldung
  // "Chance decided: you play X, ...", wenn der Zufall entschieden hat.
  // Jede Form hat einen eigenen msg_t_random_*-Textbaustein.
  function label(text) {
    if (!enabled() || typeof text !== "string") return text;
    return text.replace(/^You play /, "Chance decided: you play ");
  }

  return { enabled: enabled, setEnabled: setEnabled, pick: pick, choose: choose, label: label };
})();

if (typeof window !== "undefined") window.RandomStart = RandomStart;
