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
    version: "v268",
    date: "2026-10-27",
    key: "release_v268",
    text: "Lucky Chain: choose the cards \"Wild Chain\" with numbers up to 15 and new special cards, and play to 250 or 500. Bigger buttons in the result window; after a round no raw placeholder shows any more."
  },
  {
    version: "v267",
    date: "2026-10-26",
    key: "release_v267",
    text: "Devilish Seven is now Lucky Chain, with its own rules: numbers 1 to 10, a bonus for numbers in a row, six new special cards and targets of 60, 90 or 120 points. A game saved under the old rules starts anew."
  },
  {
    version: "v266",
    date: "2026-10-26",
    key: "release_v266",
    text: "Sternjagd: with 2 players the second player has two turns in a row the first time; you can switch this off. 15 more history pages checked and corrected."
  },
  {
    version: "v265",
    date: "2026-10-25",
    key: "release_v265",
    text: "Blocked Path: choose few, normal or many blocks. Small buttons are now big enough to tap, and three more games have a large board. Picture help for War and Pairs. Sternjagd names who starts. Ludo texts and 15 history pages checked and corrected."
  },
  {
    version: "v264",
    date: "2026-10-25",
    key: "release_v264",
    text: "Ludo: a board for 6 players. Blocked Path: a quick board with rest fields, and up to 6 players. Hex: Black and White with a clear colour choice. Picture help for Link the Pairs, Old Maid and Snakes and Ladders. Licence notes, privacy policy and three history pages updated."
  },
  {
    version: "v263",
    date: "2026-10-25",
    key: "release_v263",
    text: "The dice race game with blocks on the paths has a new name: “Blocked Path”. Rules, saved games and statistics stay the same."
  },
  {
    version: "v262",
    date: "2026-10-25",
    key: "release_v262",
    text: "Minesweeper: the clock stays hidden unless you switch on “Show time”, and too many flags are named clearly. Hex: new swap rule (on by default). Domino: the stock button is always shown and big enough to tap. Chess: a note that the online mode needs internet and a Lichess account."
  },
  {
    version: "v261",
    date: "2026-10-24",
    key: "release_v261",
    text: "Rummy: a joker that fits at both ends of a run now goes where you choose, and there are two new options - Hand-Rommé (lay out all cards at once, the others' penalty points count double) and knocking on a discarded card against two or three computers."
  },
  {
    version: "v260",
    date: "2026-10-22",
    key: "release_v260",
    text: "Every game now has a link “Report an idea or bug” at the bottom that opens your email program with game, version and language filled in. In Rummy the note on swapping a joker now names the house rule."
  },
  {
    version: "v259",
    date: "2026-10-21",
    key: "release_v259",
    text: "Sudoku and Killer Sudoku start and make new puzzles faster on slow e-readers, and pages no longer show English text for a moment before your language."
  },
  {
    version: "v258",
    date: "2026-10-20",
    key: "release_v258",
    text: "On a browser that is too old for PaperGames (for example the older Kindle browser), every page now shows a short note instead of a broken or blank page."
  },
  {
    version: "v257",
    date: "2026-10-19",
    key: "release_v257",
    text: "Home page title and description now name Kindle, Kobo, Tolino and Boox (search results and link previews)."
  },
  {
    version: "v256",
    date: "2026-10-19",
    key: "release_v256",
    text: "Offline: when the internet drops during an update, the old version now stays complete and keeps working, and the home page says in plain words what is missing and what to do."
  },
  {
    version: "v255",
    date: "2026-10-19",
    key: "release_v255",
    text: "Forest Village: the game description and the rules now name clay, seeds and feathers and the Clearing everywhere."
  },
  {
    version: "v254",
    date: "2026-10-18",
    key: "release_v254",
    text: "The license changed: PaperGames may now be used for noncommercial purposes only (PolyForm Noncommercial 1.0.0). Nothing changes for playing."
  },
  {
    version: "v253",
    date: "2026-10-17",
    key: "release_v253",
    text: "Zoo Toss: you now put the paws on the card yourself, and after the computer's turn you see its card, dice and paws and tap Next."
  },
  {
    version: "v252",
    date: "2026-10-17",
    key: "release_v252",
    text: "Bingo, Steckwürfeln, Klappenkasten, Zoo Toss and Pasture Friends now explain themselves with pictures, Zoo Toss has a beginner level, and the cake board names its rooms with numbers and has larger squares."
  },
  {
    version: "v251",
    date: "2026-10-17",
    key: "release_v251",
    text: "New game: Zoo Toss. Pasture Friends now explains itself with pictures, Schwimmen shows the right player's turn, the Kleeberg board is no longer cut off, and link previews show no game count."
  },
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
