// nonogram-puzzles.js
// A small curated set of Nonogram (Picross) pictures - simple
// geometric shapes rather than photo-realistic pixel art, since a
// clean symmetric shape is far easier to guarantee has one and only
// one solution than an arbitrary hand-drawn picture. Every grid below
// was verified offline with NonogramCore.countSolutions() to have
// exactly one valid solution matching its own row/column clues - a
// puzzle with more than one valid filling would let a player reach a
// different, equally correct grid and have the game wrongly refuse to
// call it solved.
//
// Each row is a string of "0"/"1" (empty/filled); `1` in a difficulty
// bucket is picked at random each "New puzzle" the same way the other
// difficulty-only games here work.

const NonogramPuzzles = {
  easy: [
    {
      name: "Plus",
      grid: ["00100", "00100", "11111", "00100", "00100"]
    },
    {
      name: "Diamond",
      grid: ["00100", "01110", "11111", "01110", "00100"]
    }
  ],
  medium: [
    {
      name: "Ring",
      grid: [
        "0000110000",
        "0011111100",
        "0111111110",
        "0110000110",
        "1110000111",
        "1110000111",
        "0110000110",
        "0111111110",
        "0011111100",
        "0000110000"
      ]
    },
    {
      name: "Hourglass",
      grid: [
        "1100000011",
        "1110000111",
        "0111001110",
        "0011111100",
        "0001111000",
        "0001111000",
        "0011111100",
        "0111001110",
        "1110000111",
        "1100000011"
      ]
    }
  ],
  hard: [
    {
      name: "Double Frame",
      grid: [
        "111111111111111",
        "100000000000001",
        "100000000000001",
        "100111111111001",
        "100100000001001",
        "100100000001001",
        "100100000001001",
        "100100000001001",
        "100100000001001",
        "100100000001001",
        "100100000001001",
        "100111111111001",
        "100000000000001",
        "100000000000001",
        "111111111111111"
      ]
    },
    {
      name: "Diamond",
      grid: [
        "000000010000000",
        "000000111000000",
        "000001111100000",
        "000011111110000",
        "000111111111000",
        "001111111111100",
        "011111111111110",
        "111111111111111",
        "011111111111110",
        "001111111111100",
        "000111111111000",
        "000011111110000",
        "000001111100000",
        "000000111000000",
        "000000010000000"
      ]
    }
  ]
};

function nonogramGridFromStrings(rows) {
  return rows.map((row) => row.split("").map((ch) => ch === "1"));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { NonogramPuzzles, nonogramGridFromStrings };
}
if (typeof window !== "undefined") {
  window.NonogramPuzzles = NonogramPuzzles;
  window.nonogramGridFromStrings = nonogramGridFromStrings;
}
