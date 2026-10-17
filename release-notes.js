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
    version: "v250",
    date: "2026-10-17",
    key: "release_v250",
    text: "In Steckwürfeln you can tap the holes, Klappenkasten shows what the computer closed, and Bingo allows up to four computer opponents. Durak and Skat buttons work again."
  },
  {
    version: "v249",
    date: "2026-10-17",
    key: "release_v249",
    text: "Pages load faster because they need less data. New games: Kleeberg and Pasture Friends."
  },
  {
    version: "v248",
    date: "2026-10-17",
    key: "release_v248",
    text: "Seven new games (Bingo, three dice games and three children's puzzles), a new hardest level in Arrows, a hint button in Cat Places, better search and a Card Games page."
  },
  {
    version: "v247",
    date: "2026-10-16",
    key: "release_v247",
    text: "All games use the same names and status texts (Against the computer, Two players, one device, New game, Your turn); every game page has a Home button; Undo takes back your move and the computer's answer in 32 games."
  },
  {
    version: "v246",
    date: "2026-10-16",
    key: "release_v246",
    text: "Game cards on all category pages are big tap targets; the kids page shows every kids game on one page with large icons; Large board makes tiny boards easier to tap; Cake is no longer listed as a kids game."
  },
  {
    version: "v245",
    date: "2026-10-16",
    key: "release_v245",
    text: "Game pages have a one-row header and no site navigation; Settings moved into the menu; the control panel closes after the start, so more boards fit on the screen."
  },
  {
    version: "v244",
    date: "2026-10-16",
    key: "release_v244",
    text: "Games open ready to play; the result window offers Play again; New game stays next to the board; Chess has its own two-player button."
  },
  {
    version: "v243",
    date: "2026-10-16",
    key: "release_v243",
    text: "Offline storage reloads less; Arabic spacing is fixed, active buttons are black, Shuffle asks first, and rules pages have a back link at the top."
  },
  {
    version: "v242",
    date: "2026-10-15",
    key: "release_v242",
    text: "The game has a new name and address; old addresses now redirect."
  },
  {
    version: "v241",
    date: "2026-10-15",
    key: "release_v241",
    text: "Forest Village has new rules, a renamed game, and revised descriptions; old Forest Village saves are discarded."
  },
  {
    version: "v240",
    date: "2026-10-15",
    key: "release_v240",
    text: "Game names have changed in all 12 languages."
  },
  {
    version: "v239",
    date: "2026-10-15",
    key: "release_v239",
    text: "Removed protected game names from rules and history page descriptions."
  },
  {
    version: "v238",
    date: "2026-10-15",
    key: "release_v238",
    text: "Quick rules now match the selected cake theme and picture search mode."
  },
  {
    version: "v237",
    date: "2026-10-12",
    key: "release_v237",
    text: "New Games now shows the 10 newest games."
  },
  {
    version: "v236",
    date: "2026-10-12",
    key: "release_v236",
    text: "Picture search with bathroom, cellar and bedroom; Who Took the Cake? with five more rooms and seven new pieces of furniture."
  },
  {
    version: "v235",
    date: "2026-10-12",
    key: "release_v235",
    text: "Picture search with nine rooms and over 40 new drawings; Who Took the Cake? with a family and with children and a treasure."
  },
  {
    version: "v234",
    date: "2026-10-12",
    key: "release_v234",
    text: "Tangram has a new level, Outline only, with 29 new figures."
  },
  {
    version: "v233",
    date: "2026-10-12",
    key: "release_v233",
    text: "Arrows on Hard: gliding arrows, 11 × 11 squares, and a new Master level with three hearts."
  },
  {
    version: "v232",
    date: "2026-10-12",
    key: "release_v232",
    text: "Move suggestions can be switched off in the Settings, and “Who Took the Cake?” has three new themes."
  },
  {
    version: "v231",
    date: "2026-10-12",
    key: "release_v231",
    text: "Spot the Difference has a new mode: picture search."
  },
  {
    version: "v230",
    date: "2026-10-12",
    key: "release_v230",
    text: "Card Duel: every card has a picture now."
  },
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
