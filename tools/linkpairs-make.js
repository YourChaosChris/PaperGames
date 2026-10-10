// tools/linkpairs-make.js
// Writes linkpairs-puzzles.js: "Link the Pairs" puzzles made ahead of
// time from fixed seeds, because making a 9 x 9 one with a single
// solution takes too long on a slow e-reader. Run: node tools/linkpairs-make.js [count]
const fs = require("fs");
const path = require("path");
const C = require(path.join(__dirname, "..", "linkpairs-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const COUNT = parseInt(process.argv[2], 10) || 300;
const out = {};
for (const level of ["easy", "medium", "hard"]) {
  out[level] = [];
  const seen = new Set();
  for (let seed = 1; out[level].length < COUNT; seed++) {
    const p = C.generatePuzzle(level, rng(seed * 2654435761 + level.length));
    if (!p) continue;
    const text = C.encode(p);
    if (seen.has(text)) continue;
    seen.add(text);
    out[level].push(text);
  }
}
let js = "// linkpairs-puzzles.js\n" +
  "// \"Link the Pairs\" puzzles, made ahead of time by tools/linkpairs-make.js\n" +
  "// (each checked to have exactly one solution). One puzzle per string:\n" +
  "// its lines, each a start cell in base 36 and the steps U/R/D/L.\n\n" +
  "const LinkPairsPuzzles = {\n";
for (const level of ["easy", "medium", "hard"]) {
  js += "  " + level + ": [\n" + out[level].map((t) => '    "' + t + '"').join(",\n") + "\n  ],\n";
}
js = js.replace(/,\n$/, "\n") + "};\n\n" +
  "if (typeof module !== \"undefined\" && module.exports) {\n  module.exports = LinkPairsPuzzles;\n}\n" +
  "if (typeof window !== \"undefined\") {\n  window.LinkPairsPuzzles = LinkPairsPuzzles;\n}\n";
fs.writeFileSync(path.join(__dirname, "..", "linkpairs-puzzles.js"), js);
console.log("linkpairs-puzzles.js: " + ["easy", "medium", "hard"].map((l) => l + " " + out[l].length).join(", ") + ", " + js.length + " bytes");
