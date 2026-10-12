// release-notes.js
// What changed in each version, for the "new version available" banner
// (update-banner.js). Every bump of CACHE_NAME in sw.js MUST get an entry
// here - tests/static-checks.js fails otherwise:
//   version  the number in CACHE_NAME ("papergames-cache-v223" -> "v223")
//   date     "YYYY-MM-DD"
//   key      i18n key of one short sentence on what changed, in all 12
//            languages (i18n.js and every lang/xx.js)
//   text     the same sentence in English, the fallback while a page still
//            runs an older i18n.js
// Newest entry first. New games need no sentence here: the banner takes
// them from games-catalog.js (`added`) and names them itself.

const RELEASE_NOTES = [
  {
    version: "v229",
    date: "2026-10-12",
    key: "release_v229",
    text: "The home page is shorter now; the categories have pages of their own."
  },
  {
    version: "v228",
    date: "2026-10-12",
    key: "release_v228",
    text: "A small link in the footer of the home page leads to Quillwild, a new project in progress."
  },
  {
    version: "v227",
    date: "2026-10-12",
    key: "release_v227",
    text: "Adventure Book: a role-playing game for one – create a hero and explore a cave, a tower or a forest."
  },
  {
    version: "v226",
    date: "2026-10-12",
    key: "release_v226",
    text: "Forest Village: forest animals build a village through the seasons, for 1 to 4 players."
  },
  {
    version: "v225",
    date: "2026-10-11",
    key: "release_v225",
    text: "Fairy-Tale Villains: six villains from the Grimms' tales with goals of their own, for 2 to 4 players."
  },
  {
    version: "v224",
    date: "2026-10-11",
    key: "release_v224",
    text: "Card Duel: four decks of equal strength, against the computer or with two players on one device."
  },
  {
    version: "v223",
    date: "2026-10-11",
    key: "release_v223",
    text: "Saving for offline use is more robust, games are grouped into families, Domino has the variant “Triangles”, and “Who Took the Cake?” has the theme “Cats and fish” and gives more hints."
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = RELEASE_NOTES;
}
