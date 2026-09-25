// ai-pacing.js
// Wartezeit vor Computerzügen, zentral und auf dem Gerät einstellbar.
// Auf E-Ink dauert ein vollständiger Bildaufbau länger als die
// ursprünglich gesetzten 250 bis 400 Millisekunden, der Zug war also
// vorbei, bevor er zu sehen war. Die Spiele behalten ihre relativen
// Zeiten, dieses Modul streckt sie nur um einen gemeinsamen Faktor.

const AiPacing = (function () {
  const KEY = "papergames_ai_pacing";
  const FACTORS = { fast: 1, normal: 2.5, slow: 5 };
  const DEFAULT_MODE = "normal";
  const MIN_DELAY = 150;

  function getMode() {
    try {
      const stored = window.localStorage && window.localStorage.getItem(KEY);
      return FACTORS[stored] ? stored : DEFAULT_MODE;
    } catch (e) {
      return DEFAULT_MODE;
    }
  }

  function setMode(mode) {
    if (!FACTORS[mode]) return;
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, mode);
    } catch (e) { /* Speicher nicht verfügbar - dann eben nicht merken */ }
  }

  function delay(baseMs) {
    const base = typeof baseMs === "number" && baseMs > 0 ? baseMs : 0;
    return Math.max(MIN_DELAY, Math.round(base * FACTORS[getMode()]));
  }

  return { getMode: getMode, setMode: setMode, delay: delay };
})();

if (typeof window !== "undefined") window.AiPacing = AiPacing;
