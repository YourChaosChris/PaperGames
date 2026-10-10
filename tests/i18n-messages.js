#!/usr/bin/env node
// i18n-messages.js
// Checks I18n.msg(), which translates the English status lines, result
// popups and info lines the games build at runtime (see i18n.js). No
// server or browser needed: i18n.js is loaded into a plain Node VM.
//
// For every sample message and every non-English language it checks that
//  - the message is translated at all (output differs from the input),
//  - no {placeholder} is left unfilled,
//  - for languages without Latin script (uk, ru, ja, zh), no English word
//    is left over - i.e. every sentence of the message was matched.
// Screen-reader label samples are checked the same way.
// It also checks that every msg_t_* template has the same placeholders
// in all 11 languages.
//
// A game page loads only i18n.js and lang/xx.js; the rules/history texts
// (i18n-text.js, lang/xx-text.js) come only on rules and history pages.
// So the messages, which games show, are checked against the main files
// alone - otherwise a rules-page text that happens to match a message
// would count as its translation although the game page stays English.
// The texts each page refers to (data-i18n, data-i18n-attr) are checked
// against what that page loads: game and other pages against the main
// files, rules and history pages against both.

const fs = require("fs");
const path = require("path");
const { loadI18n } = require("./load-i18n");
const { I18n, STRINGS } = loadI18n({ texts: false });
const FULL = loadI18n();

// One sample per message shape, as the games actually produce them.
const SAMPLES = [
  "White: place a stone (1 of 2).",
  "Black: place a stone (2 of 2).",
  "Black can capture again with the same stone. Tap it to end the turn.",
  "Move undone. White can capture again with the same stone. Tap it to end the turn.",
  "White: move a stone onto the centre.",
  "Black: move a stone.",
  "White cannot move and passes. Black: move a stone.",
  "Black captured 2. White: move a stone.",
  "Placing phase · stones to place – Black: 12 · White: 10",
  "Moving phase · stones – Black: 11 · White: 9 · turns without capture: 3 of 40",
  "White wins: every stone of the other side is captured.",
  "Black wins on stones (7 to 5) after 40 turns without a capture.",
  "White wins on stones (9 to 4): neither side can move.",
  "Draw: 6 stones each after 40 turns without a capture.",
  "Draw: 3 stones each, neither side can move.",
  "White cannot move and passes. Computer thinking…",
  "Move undone. White: move a stone.",
  "Player 1: draw a card from the stock or take the top discard.",
  "Lay out the joker you took back in a new meld first.",
  "Staged for the first meld: 25 of 40 points.",
  "Player 2: start the round by discarding a card (you may lay out melds first).",
  "Player 1: your first meld needs at least 40 points - lay out melds or discard a card.",
  "Player 1 draws a card. Player 1: your first meld needs at least 40 points - lay out melds or discard a card.",
  "Player 2 discards the 9♣. Player 1: draw a card from the stock or take the top discard.",
  "Player 2 takes the 4♦. Player 2's turn.",
  "Player 3: lay out melds or add to melds, then discard a card.",
  "The discard pile is shuffled into a new stock. Player 2 draws a card.",
  "Player 2 lays out a meld.",
  "Player 1 makes the first meld with 43 points.",
  "Player 3 swaps the 7♣ for a joker.",
  "Player 2 takes the Q♥.",
  "Player 1 adds the Joker to a meld.",
  "Player 4 discards the 10♠.",
  "Nothing is left to draw - the round ends without a winner.",
  "Player 2 discards the 2♦. Player 2 has no cards left and wins the round.",
  "These cards don't form a set (one rank, different suits) or a run (one suit in order).",
  "You may add to melds only after your first meld.",
  "You can only swap that joker if you can lay it out again in a new meld right away.",
  "Lay out the staged melds or take them back before discarding.",
  "Draw a card first.",
  "You have already drawn a card this turn.",
  "The discard pile is empty.",
  "That card doesn't fit this meld.",
  "Not enough yet: the first meld needs at least 51 points.",
  "Select three or more cards for a meld.",
  "Select exactly one card.",
  "First meld made · Penalty points: 37",
  "No first meld yet · Penalty points: 0",
  "Round 2 · first meld: at least 30 points",
  "No melds on the table yet.",
  "Player 3: your cards",
  "Player 2: 64 penalty points this round, 101 in total",
  "Game on one device for 3 players (no computer).",
  "You play Player 1, computer level: Medium.",
  "Player 2 discards the 5♥. Pass the device to Player 3.",
  "Player 1 (you)",
  "Player 3 (computer)",
  "13 cards",
  "1 card",
  "Player 1 resigned.",
  "Player 4's turn.",
  "The sides can no longer meet - White wins with 5 to 3 pieces.",
  "The sides can no longer meet - Black wins with 4 to 2 pieces.",
  "The sides can no longer meet - a draw with 3 pieces each.",
  "Lay out the card you took in a new meld first, or take it back.",
  "Player 2 takes the 7♠ from a meld.",
  "At least three cards must stay in the meld - from a run only the first or the last card.",
  "Jokers can't be taken - swap them instead.",
  "A card taken from the table must go into a new meld.",
  "Round 3 of 10 · first meld: at least 40 points",
  "Player 2 has no cards left and wins the round. Game over after 3 rounds: Player 1 wins with 25 penalty points.",
  "Nothing is left to draw - the round ends without a winner. Game over after 5 rounds: a draw at 40 penalty points.",
  "Round 2 of 3",
  "No melds yet.",
  "You",
  "Lay out the card from the discard pile in a meld first - or put it back and draw from the stock.",
  "Player 2 puts the 10♥ back and draws from the stock.",
  "Your turn: draw a card from the stock or take the top discard.",
  "Your turn: start the round by discarding a card (you may lay out melds first).",
  "Your turn: your first meld needs at least 40 points - lay out melds or discard a card.",
  "Your turn: lay out melds or add to melds, then discard a card.",
  "You draw a card.",
  "The discard pile is shuffled into a new stock. You draw a card.",
  "You take the Q♥.",
  "You lay out a meld.",
  "You make the first meld with 43 points.",
  "You add the 5♥ to a meld.",
  "You swap the 7♣ for a joker.",
  "You take the 5♥ from a meld.",
  "You put the 10♥ back and draw from the stock.",
  "You discard the 9♣. Computer 1's turn.",
  "You have no cards left and win the round.",
  "You discard the K♦. You have no cards left and win the round. Game over after 3 rounds: you win with 12 penalty points.",
  "You resigned.",
  "Your cards",
  "Computer opponents: 2 · computer level: Medium",
  "Computer 2 draws a card.",
  "Computer 3 discards the 4♦. Your turn: draw a card from the stock or take the top discard.",
  "Computer 1 has no cards left and wins the round.",
  "You: 26 penalty points this round, 34 in total",
  "Computer 2: 0 penalty points this round, 12 in total",
  "Computer 1 makes the first meld with 41 points.",
  "Fox to move.",
  "Geese to move.",
  "Fox played. Geese to move.",
  "Geese played. Fox to move.",
  "You play Geese, computer level: Hard.",
  "You play Fox, computer level: Easy.",
  "Jump on, or tap the fox to stop here.",
  "The geese win: the fox cannot move.",
  "The fox wins: the geese cannot move.",
  "The fox wins: too few geese are left to trap it.",
  "The fox wins by resignation.",
  "The geese win by resignation.",
  "The fox wins",
  "The geese win",
  "Geese left: 12 of 13 · the fox wins at 5.",
  "In row 3, one number has only one cell left. The cell is marked.",
  "In column 7, one number has only one cell left. The cell is marked.",
  "In this box, one number has only one cell left. The cell is marked.",
  "In this block, one number has only one cell left. The cell is marked.",
  "The 5 is still missing there, and every other free cell is ruled out for it. So the 5 goes in the marked cell.",
  "Only one number fits the marked cell (row 2, column 9).",
  "Its row, column and box already contain every other number. Only the 4 is left.",
  "Its row, column, box and cage already contain every other number. Only the 4 is left.",
  "Its row and column already contain every other number. Only the 4 is left.",
  "Its block and the cells touching it already contain every other number. Only the 4 is left.",
  "The cage of the marked cell (row 1, column 1) leaves only one number for it.",
  "Every way to fill the cage 12× that obeys the rules puts the 3 here.",
  "Every way to fill the cage 17 that obeys the rules puts the 8 here.",
  "The marked cell (row 4, column 6) can be worked out without trying anything.",
  "Ruling out numbers step by step, through pairs of cells and either-or chains, leaves only the 7 here. No guessing is needed.",
  "Entered 7 in row 4, column 6.",
  "Some entries break a rule. The cells involved are marked.",
  "The number in row 5, column 2 does not belong there. Remove it, then ask for a hint again.",
  "From here, no step follows without trying things out. The hint does not guess.",
  "The two marked islands need another bridge between them.",
  "The island in row 1, column 3 needs 4 bridges. Its other connections cannot hold enough, so this one needs another bridge.",
  "Without a bridge here, the islands could no longer all be connected.",
  "Ruling out bridges step by step, from the numbers, the crossings and the rule that all islands connect, forces another bridge here. No guessing is needed.",
  "Bridge added.",
  "The bridge between the two marked islands is not part of the solution. Remove it, then ask for a hint again.",
  "Perpetual check is not allowed - this move would repeat the position a third time. Choose another move.",
  "Perpetual chase is not allowed - this move would repeat the position a third time. Choose another move.",
  "Draw by repetition: the same position occurred three times.",
  "Red wins: Black has no move left that avoids perpetual check or chase.",
  "Placing - 14 pieces left to place",
  "Placing - 1 piece left to place",
  "Computer thinking…",
  "Black to move.",
  "Move undone. White to move. Roll the dice.",
  "You play Black, computer level: Easy.",
  "White wins by resignation.",
  "Game is over. Start a new game to play again.",
  "Local 2‑player game (no computer).",
  "You win!",
  "You lose",
  "The computer wins",
  "Draw",
  "Solved!",
  "Move undone. Goats to move.",
  "Defenders played. Attackers to move.",
  "Defenders win",
  "Red moved token 2 forward 5.",
  "Red brought token 1 into play.",
  "Blue moved token 3 forward 6 and captured Red, Green!",
  "Yellow brought token 4 into play and captured Blue!",
  "Green moved token 1 forward 2 and got it home!",
  "Goats win",
  "Solved “Hourglass” - well done!",
  "Black wins (6 marbles pushed off the board).",
  "White wins (no legal moves).",
  "Black played. Marble pushed off! White to move.",
  "Black wins (backgammon) - 6 points!",
  "White wins (gammon, cube x2) - 8 points!",
  "Black wins (single game) - 1 point!",
  "Black wins by resignation - 1 point.",
  "White accepts. Cube is now 2. Black to roll.",
  "White declines the double. Black wins 1 point.",
  "Black doubles to 2. Computer is thinking…",
  "Black played. 1 die left to play.",
  "Black to move. 2 dice left to play.",
  "Black rolled 3-5. Choose a piece to move.",
  "Black rolled 6-6. No legal move - turn passes.",
  "Goats win by capturing 5 goats!",
  "Tigers win by capturing 5 goats!",
  "Goats win by trapping every tiger!",
  "Tigers win - the other side has no legal move!",
  "Goats win.",
  "Tigers played. A goat was captured! Goats to move.",
  "Attackers win by capturing the king!",
  "Defenders win as the king reaches a corner!",
  "Attackers win - the other side has no legal move!",
  "Red wins by reaching the shrine!",
  "Blue wins by capturing the master!",
  "Black wins (no pieces left).",
  "Black wins (reduced to two pieces).",
  "White wins (no legal moves left).",
  "Black wins (checkmate).",
  "It's a draw - Player 1: 12 · Player 2: 12.",
  "Player 1 wins! Player 1: 14 · Player 2: 10.",
  "Black wins 40-24!",
  "It's a draw, 32-32!",
  "White has no legal move and passes. Black to move again.",
  "Red wins - all 4 tokens home! Blue, Green sent home.",
  "Red captured Blue, Yellow!",
  "Red got a token home!",
  "Red played.",
  "Blue resigned. Red wins.",
  "Black threw a 4 - throw again!",
  "White captured a piece and throws again!",
  "Player 1 wins!",
  "It's a draw!",
  "Player 1 played, captured 4! Player 2 to move.",
  "Player 1 played. Player 2 to move.",
  "Black played. Mill! A piece was removed. White to move.",
  "Black captured. White to move.",
  "Both passed. Black wins by 7.5 (Black 45 – White 37.5).",
  "Invalid move: that point is already occupied.",
  "Invalid move: that would leave your stones with no liberties.",
  "Invalid move: forbidden by the ko rule (recaptures immediately).",
  "Invalid move: it would repeat an earlier board position (superko rule).",
  "You play White, computer level 3 (~1400 Elo (~2–4s/move)).",
  "Computer level 1 (~800 Elo (instant)).",
  "Computer level 2 active.",
  "Online game active. You play White. Opponent to move.",
  "Online game active. You play Black. Your move.",
  "Online: White vs Computer (level 3)",
  "Time control: 300s",
  "Your time: 4:59",
  "No game active",
  "Move: e2–e4. Black to move.",
  "Moving from e2 …",
  "Computer plays e7–e5. Your move.",
  "Checkmate! White wins.",
  "Resigned. Black wins.",
  "Resign failed: Unknown error.",
  "Searching for opponent…",
  "Sending move e2e4 …",
  "Move 12",
  "Captured – Black: 3 · White: 2",
  "Pushed off (of 6 to lose) – Black: 1 · White: 0",
  "Reachable squares – Player 1: 20 · Player 2: 18",
  "Cube: 2 (Black)",
  "Cube: 1",
  "Pips - Black: 167 · White: 167",
  "Goats placed: 3/20 · Captured: 0/5",
  "Movement phase · Captured: 2/5",
  "Boxes – Player 1: 3 · Player 2: 4",
  "12 / 30 satisfied",
  "40 / 81 filled",
  "Moves: 7",
  "44 tiles left",
  "12 cells revealed",
  "20 pegs",
  "Discs – Black: 10 · White: 8",
  "Black borne off: 1 / 5     White borne off: 0 / 5",
  "Score: 128   Best: 2048",
  "Walls left – Player 1: 10 · Player 2: 9",
  "Red (computer)",
  "Blue (you)",
  "You play Red against 3 computer player(s), level: Hard.",
  "Local 4-player hotseat game (no computer).",
  "Computer (Blue) rolled 6, thinking…",
  "Red rolled a third 6 in a row - turn forfeited!",
  "Red rolled a 6 - roll again!",
  "Red's turn. Roll the die.",
  "Move undone. Red's turn. Roll the die.",
  "All clear in 42 seconds - well done!",
  "All lights off in 1 move - well done!",
  "All lights off in 12 moves - well done!",
  "All lights off in 12 moves - well done! Hints used: 2.",
  "7 lights still on. Moves: 3",
  "1 light still on. Moves: 3 · Hints: 1",
  "Hint: row 3, column 2.",
  "Filled the cell in row 2, column 3.",
  "The cell in row 2, column 3 must stay empty. Clear it, then ask for a hint again.",
  "The cell in row 4, column 1 belongs to the picture. Remove the cross, then ask for a hint again.",
  "The line on the marked edge is not part of the loop. Remove it, then ask for a hint again.",
  "The marked edge is part of the loop. Remove its cross, then ask for a hint again.",
  "Drew a line on the marked edge.",
  "Entered 7 in row 2, column 3.",
  "The number in row 5, column 6 does not belong there. Remove it, then ask for a hint again.",
  "No more jumps available, with 3 pegs left. Try again!",
  "You reached 2048! Keep going for a higher score, or start a new game.",
  "No more moves left. Final score: 1234",
  "Not a match. Now click a matching free tile.",
  "White wins: Black repeated the position four times by perpetual check (sennichite).",
  "White to move. Check!",
  "Board ready. Black to move.",
  "Black wins (no legal jump available).",
  // Domino
  "Player 1 opens with 6-6. Player 2's turn. Choose a tile, then an open end.",
  "Player 3 drew 2 tiles. Player 3 played 4-1. Pass the device to Player 4.",
  "Player 2 drew 1 tile. Player 2 passed. The line is blocked. Player 1 wins with the lowest pip total.",
  "Player 4 passed. The line is blocked. The lowest pip total is shared - it's a draw.",
  "Player 2 played 0-5. Player 2 played their last tile.",
  "Player 1 played 3-3. No tile fits - draw from the stock.",
  "Tile 2-5 fits on both ends - tap one.",
  "Player 1 resigned. Player 2 wins.",
  "7 tiles, 23 pips",
  "Stock: 14 tiles",
  // Mau Mau
  "The first card is 10♥. Choose a card to play.",
  "Player 2 played 7♠. Player 1 must draw 4 cards or play a Seven. Play a Seven or draw 4 cards from the stock.",
  "Player 1 played J♣. Player 1: Mau! Player 1 asks for Hearts.",
  "Player 3 played 8♦. Player 4 misses a turn. Pass the device to Player 1.",
  "Player 2 played A♠. Player 2 plays again.",
  "The discard pile was shuffled into a new stock. Player 1 drew a card. The drawn card fits: play it or keep it.",
  "Player 2 drew a card. Player 2 keeps the card.",
  "Player 1 played Q♦. Mau Mau! Player 1 wins.",
  "There is no card left to draw. Player 3 passes.",
  // Drawn cards named (Rommé, Concan, Mau Mau, Durak, Domino)
  "You draw the 7♥. Your turn: lay out melds or add to melds, then discard a card.",
  "Player 2 draws the K♠. Player 2: lay out melds or add to melds, then discard a card.",
  "You put the 9♠ back and draw the 4♦.",
  "Player 1 puts the 9♠ back and draws the 4♦.",
  "You draw the 5♣. Your turn. Lay out melds or add to yours, then select a card and discard it.",
  "You drew the 7♥. The drawn card fits: play it or keep it.",
  "Player 1 drew the 7♥. The drawn card fits: play it or keep it.",
  "Computer 1 played 7♠. You must draw 2 cards or play a Seven.",
  // Shape Sort
  "Tap a tube, then the tube the stones should go to.",
  "Hint: move the top stones from tube 3 to tube 7.",
  "Sorted! Every tube holds one shape. Moves: 23.",
  "From here the stones can no longer all be sorted. Undo a few moves.",
  "Stones can only go onto the same shape or into an empty tube.",
  // Old Maid
  "Cards dealt, pairs laid down. Your turn: tap one of Computer 1's cards to draw it.",
  "You drew: Giraffe. A pair - laid down.",
  "You drew the Black Peter!",
  "Computer 2 drew a card from you: Owl. Computer 2 lays down a pair.",
  "Computer 1 drew a card from Computer 3. Computer 3 has no cards left.",
  "Computer 2 has the Black Peter. You win!",
  "You have the Black Peter - you lose.",
  "Cards: 5 · Pairs: 3",
  "Computer 1's cards - tap one",
  // War
  "War! You win the round: K♣ beats 8♦. You take 6 cards.",
  "2 wars in a row! The computer wins the round: A♠ beats 10♥. The computer takes 10 cards.",
  "You have no card left for the war. The computer takes 3 cards.",
  "30 rounds played: you have 18 cards, the computer 14. You win!",
  "After 2000 rounds there is still no winner. Draw.",
  "The computer has all 32 cards. You lose.",
  "Round 12 / 30",
  // Snakes and Ladders
  "You rolled 4. You move to field 22. Ladder: up to field 41! Computer 1's turn.",
  "Computer 2 rolled 6. Computer 2 moves to field 49. Snake: down to field 30. Player 1's turn: tap Roll.",
  "You rolled 5. Too far - you need exactly 2 to finish. Your turn: tap Roll.",
  "Player 3 reaches field 100 and wins!",
  "You are on field 17.",
  "Computer 1 is at the start.",
  "Ladder from field 2 to 23.",
  // Path Blockers
  "You rolled 3. No move is possible with 3. Computer 1's turn.",
  "Computer 1 rolled 5. Computer 1 brings a token onto the board. Your turn: tap Roll.",
  "You rolled 4. Tap a token with a dashed ring (or the house button) to move it 4 fields.",
  "Now tap one of the marked fields.",
  "You move a token. You send a token of Computer 2 back to the house! Computer 1's turn.",
  "Computer 2 moves a token. Computer 2 sends one of your tokens back to the house! Player 1's turn: tap Roll.",
  "Player 2 moves a token. Player 2 sends a token of Player 1 back to the house! Player 3's turn: tap Roll.",
  "You move a token. You take a stone. Tap a free field to put the stone on (not in the bottom row).",
  "Computer 3 moves a token. Computer 3 takes a stone and puts it on another field. Computer 3's turn.",
  "You bring a token onto the board. You reach the goal and win!",
  "Computer 1 moves a token. Computer 1 reaches the goal and wins!",
  "This token cannot move 6 fields.",
  "The stone can only go on a free field, not in the bottom row.",
  "House: 5",
  // Blackjack / 17 and 4
  "Choose your bet and tap Deal.",
  "You draw 7♥. Your turn: tap Card or Stand.",
  "You draw K♠. Over 21! You lose 10 chips. Choose your bet and tap Deal.",
  "You stand at 18. The bank draws 5♦.",
  "You stand at 18. 18 against 17: you win 10 chips. Choose your bet and tap Deal.",
  "You stand at 16. 16 against 20: you lose 20 chips. Choose your bet and tap Deal.",
  "You double: 20 chips on this hand. You draw 9♣. The bank plays.",
  "The bank is over 21. You win 5 chips.",
  "Equal points (19): you keep your chips.",
  "Equal points (19): the bank wins. You lose 10 chips.",
  "Blackjack! You win 15 chips. Choose your bet and tap Deal.",
  "The bank has blackjack. You lose 10 chips.",
  "You and the bank both have blackjack: you keep your chips.",
  "Two aces - fire! You win 20 chips.",
  "The bank has two aces - fire. You lose 5 chips.",
  "Over 21! You lose 5 chips. No chips left. Tap New game to start again with 100 chips.",
  "Your turn: tap Card, Stand or Double.",
  "Points: 17", "Points: 10 + ?", "Bet: 20", "No chips left",
  // Poker
  "Hand 3, dealer: Computer 2. Your cards: A♠ K♦. Your turn: choose an action below.",
  "Hand 1, dealer: You. Your cards: 7♣ 7♥. Computer 1's turn.",
  "Computer 1 calls. Computer 2 raises to 20. Your turn: choose an action below.",
  "You raise to 30. Computer 1 folds.",
  "You call. The flop: K♠ 7♦ 2♣. Computer 1's turn.",
  "Computer 2 checks. The turn: 9♥. Your turn: choose an action below.",
  "You check. The river: Q♣. Computer 1's turn.",
  "Computer 3 bets 20. Computer 3 is all in.",
  "You call. You are all in. The flop: 5♦ 6♦ 7♦. The turn: 8♠. The river: J♣. You win 40 chips with Straight. Tap Next hand to go on.",
  "Computer 1 folds. You win 15 chips - everyone else folded. Tap Next hand to go on.",
  "You fold. Computer 2 wins 25 chips - everyone else folded. Tap Next hand to go on.",
  "Computer 1 wins 120 chips with Two pair. Computer 2 wins 60 chips with Full house.",
  "You have all the chips - you win!",
  "You have no chips left - you lose.",
  "You have: Three of a kind", "You have: Royal flush", "Call 10", "Bet 20", "Raise to 40",
  "High card", "One pair", "Two pair", "Four of a kind", "Dealer", "folded",
  // Skat
  "New game: Computer 2 deals. Computer 1's turn.",
  "Computer 1 says 18. Computer 2 says 18: hold or pass?",
  "You hold. Computer 1 says 20.",
  "Computer 2 passes. You are the declarer for 20. Take the skat or play Hand?",
  "Computer 1 passes. Computer 2 is the declarer for 23.",
  "Nobody has bid: play for 18 or pass?",
  "You pass. All pass - the deal is passed in.",
  "You take the skat: 7♦ and A♣. Choose two cards to put away.",
  "You take the skat: Bell 7 and Acorn Ace. Choose two cards to put away.",
  "You put away 10♠ and K♠. Choose your game.",
  "You announce Hearts Hand. Computer 1's turn.",
  "Computer 2 takes the skat. Computer 2 announces Leaves. Your turn: play a card.",
  "Computer 1 plays Hand. Computer 1 announces Null Ouvert Hand.",
  "You play Acorn Unter. Computer 1 plays Leaf 10. Computer 1 wins the trick (12 points).",
  "Computer 2 plays J♣. You win the trick (21 points).",
  "You win Diamonds with 74 points.",
  "Computer 1 loses Grand Hand, Schneider announced with 66 points.",
  "Computer 2 wins Null.",
  "You lose Bells Hand, Schwarz announced with 88 points.",
  "Overbid: the bid was 30, so the game counts 36.",
  "Declarer: 74 points, defenders: 46 points.",
  "Lost: counts double, minus 72",
  "Won: plus 36",
  "You must follow suit.",
  "This Null game is worth less than your bid.",
  "Schneider, Schwarz and Ouvert can only be announced in a Hand game.",
  "Declarer: Computer 1, bid 23",
  "Your values:", "Hold 20", "I pass", "Play for 18", "Put away (1 / 2)", "Bid: 23. Skat put away: Heart King and Bell 10.",
  "with 2", "without 3", "game 4", "announced 6", "passed in", "Forehand", "Middlehand", "Rearhand",
  "Acorns", "Leaves", "Bells", "Acorn Ober", "Leaf Unter", "Heart Ace", "Bell 9",
  // Link the Pairs: status line, hints, screen-reader labels
  "Tap a symbol or drag from it to draw its line.",
  "Now tap the cells one after another, or drag.",
  "Pair 4 is joined.",
  "Pair Giraffe is joined.",
  "Hint: the line for Owl is drawn.",
  "All pairs are joined, but every cell must be used. Empty cells: 3.",
  "Joined: 3 / 9",
  "Only a cell right next to the end of the line can come next.",
  // Animal Sudoku: status line, hints, screen-reader labels
  "Choose an animal below, then tap a cell.",
  "Placed: 7 / 16",
  "Placed: Owl in row 2, column 5.",
  "In row 3, one animal has only one cell left. The cell is marked.",
  "In column 4, one animal has only one cell left. The cell is marked.",
  "Still missing there: Fish. Every other free cell is ruled out for it, so it goes in the marked cell.",
  "Only one animal fits the marked cell (row 1, column 2).",
  "Its row, column and box already hold every other animal. Only one is left: Rabbit.",
  "The animal in row 4, column 1 does not belong there. Remove it, then ask for a hint again.",
  "Solved! Every animal is in its place.",
  // Mau Mau children's version: animal cards ("Dog 3") inside sentences
  "The first card is Dog 3. Choose a card to play.",
  "You played Cat 5. Computer 1: Mau!",
  "Computer 2 played Rabbit 1. No card fits - draw a card from the stock.",
  "You drew the Mouse 6. The drawn card fits: play it or keep it.",
  "You drew Dog 2 and Cat 4.",
  "You drew 8♣ and K♦. Computer 1's turn.",
  "You drew 8♣, Q♥ and K♦.",
  "Computer 1 takes the cards. You draw the 9♥.",
  "Computer 1 takes the cards. You draw 6♠, 9♥ and A♣.",
  "You drew the tile 4-1. Choose a tile, then an open end.",
  "You drew the tiles 2-2, 0-5 and 6-3. Choose a tile, then an open end.",
  "Player 2 drew the tile 4-1. Choose a tile, then an open end.",
  "Player 2 drew the tiles 2-2 and 6-3. No tile fits and the stock is empty - pass.",
  // Rommé, taken card swapped for a joker
  "You swap the 6♥ for a joker. Lay out the joker you took back in a new meld first.",
  "A joker freed by a card you took must go into a new meld - you have no cards for one.",
  // Rommé, house rule "add the swapped joker"
  "You swap the J♣ for a joker. Lay out the joker you took back in a new meld or add it to a meld first.",
  "You add the joker to a meld.",
  "Computer 1 adds the joker to a meld.",
  // Rommé, house rule "split runs"
  "Computer 1 splits a run with the 4♠. Computer 1 discards the 9♥.",
  "You split a run with the 4♠.",
  "Player 2 splits a run with the 8♥.",
  "Sets can't be split.",
  "Both runs must have at least three cards after the split.",
  "A joker stands for that card - the run can't be split there.",
  "This card fits both ways: add it to the meld or split the run?",
  // Against the computer: "You" and "Computer n" (Schwimmen, Durak, Concan,
  // Doppelkopf, Trix, Mau Mau, Domino)
  "Computer opponents: 2 · computer level: Medium",
  "Your turn. Tap one of your cards and a middle card to swap them - or swap all, pass or knock.",
  "Computer 1's turn.",
  "You swapped Q♠ for 10♥.",
  "You swapped all three cards.",
  "You knocked.",
  "You passed.",
  "You have 31! Computer 2 loses a life.",
  "Computer 1 has 31! You lose a life.",
  "You are swimming.",
  "You are out. Computer 1 wins.",
  "Computer 2 is out. You win.",
  "You resigned. Computer 1 wins.",
  "Computer opponents: 1 · computer level: Hard",
  "You have the lowest trump and attack first.",
  "Computer 2 has the lowest trump and attacks first.",
  "Nobody has a trump - you attack first.",
  "You attack with 7♠.",
  "You beat 8♥ with Q♥.",
  "You throw in 8♣.",
  "You take the cards.",
  "You pass the attack on with 9♦.",
  "Computer 1 attacks with 6♣. You pick up 1 card.",
  "Computer 1 attacks with 6♣. You pick up 3 cards.",
  "You have no cards left.",
  "You are left holding cards and are the durak.",
  "Computer 2 is left holding cards and is the durak.",
  "You resigned and are the durak.",
  "You take the 7♦.",
  "You draw a card.",
  "You lay out 5♠ 6♠ 7♠.",
  "You add the 4♠ to a meld.",
  "You discard the K♣.",
  "You have eleven cards laid out and win.",
  "Computer 1 has eleven cards laid out and wins.",
  "Computer opponents: 3 · computer level: Easy",
  "You have both Queens of Clubs: marriage.",
  "Computer 3 has both Queens of Clubs: marriage.",
  "You play 10♥.",
  "You play Q♣. You play Re.",
  "Computer 2 plays A♠. You win the trick with 25 points.",
  "You become the partner of the marriage.",
  "No partner within three tricks: you play alone against the other three.",
  "Marriage: you are looking for a partner",
  "Marriage: you play alone",
  "Marriage: Computer 1 plays alone",
  "Kingdom 1 / 4. You hold the Seven of Hearts and own the first kingdom.",
  "Kingdom 1 / 4. Computer 2 holds the Seven of Hearts and owns the first kingdom.",
  "You choose Trix.",
  "Computer 1 chooses King of Hearts.",
  "You play J♥. You have no cards left and get 200 points.",
  "Computer 3 plays K♥. You take the trick with 75 penalty points.",
  "Computer 3 plays 2♣. You take the trick.",
  "You win the game.",
  "Computer 2 wins the game.",
  "You played 7♠. Computer 1 must draw 2 cards or play a Seven.",
  "Computer 1 played 7♣. You must draw 2 cards or play a Seven.",
  "Computer 2 played 8♦. You miss a turn.",
  "You played J♣. You: Mau! You ask for Hearts.",
  "You played A♠. You play again.",
  "You drew 4 cards.",
  "There is no card left to draw. You pass.",
  "You drew a card.",
  "You drew a card. You keep the card.",
  "You played Q♦. Mau Mau! You win.",
  "You open with 6-6. Computer 1's turn.",
  "Computer 1 opens with 5-5. Your turn. Choose a tile, then an open end.",
  "Your turn. No tile fits - draw from the stock.",
  "Your turn. No tile fits and the stock is empty - pass.",
  "You drew 1 tile. You played 4-1.",
  "You drew 3 tiles. You passed.",
  "Computer 2 passed. The line is blocked. You win with the lowest pip total.",
  "You played 0-5. You played your last tile.",
  "Computer 1 played 0-5. Computer 1 played their last tile."
];

// Screen-reader labels, translated part by part (I18n.setAria()).
const ARIA_SAMPLES = [
  // Skat
  "Acorn Unter, selected",
  "Leaves, value 33",
  "Spades, value 22",
  // Poker
  "Computer 2, Dealer, Chips: 180, Bet: 20, all in",
  "You, Chips: 200",
  "Computer 1, Chips: 0, out",
  "no card yet",
  // Blackjack
  "Bet 10 chips",
  "face-down card",
  // Path Blockers
  "Row 10, column 3, your token, house entry",
  "Row 1, column 6, goal, possible",
  "Row 5, column 4, stone, possible",
  "Row 4, column 5, token of Computer 2",
  "Computer 1, diamond, House: 4",
  "You, circle, House: 5, can move",
  "Player 2, triangle, House: 3",
  "Computer 3, star, House: 0",
  "Computer 1, triangle, Field 33",
  "You, circle, Start",
  "Rolled 6",
  "Your pile, 15 cards - tap to turn up a card",
  "The computer's pile, 17 cards",
  "Hidden card 3 of 7",
  "Black Peter",
  // Link the Pairs cells
  "Row 4, column 6, line Frog, end of the line",
  "Row 1, column 1, symbol 7, joined",
  "Row 9, column 9, empty",
  "Row 2, column 4, light on",
  "Hint: Row 3, column 2, light off",
  "Take 5♥",
  "Card 7♣, selected",
  "Joker, selected",
  "Meld 6♠ 6♥ 6♣, joker as 6",
  "Meld 5♠ 6♠ 7♠, joker as 6♠",
  "Stock: 42",
  "Discard pile Q♥",
  "Discard pile Joker",
  "Discard pile empty",
  // Calcudoku, Number Blocks, Killer Sudoku (region-puzzle.js)
  "Row 3, column 4, empty, cage 12+",
  "Row 1, column 1, 5 (given), block of 4 cells, conflict",
  "Row 9, column 2, 7, cage 23",
  "Path square 1, safe square, 1 token",
  "Path square 3, 2 tokens",
  "Row 3, column 4, White stone, movable",
  "e4, White knight, selected",
  "Square 3,4, Black 銀",
  "Square 12, House of Water, empty",
  "Red Chariot",
  "Bar, 2 Black checkers",
  "Borne off, 1 White checker",
  "Slot 2: Triangle. Tap to cycle through the shapes.",
  "Go board",
  "Tile ★, free",
  "Vertical line, row 2, column 3, drawn by Player 1",
  "Island 3,4: needs 2",
  "Row 1, column 2, on",
  "Free cell 2, empty",
  "Foundation ♠, up to K♠",
  "Black start, 3 pieces waiting",
  "Player 1 pit, 4 seeds",
  "Black piece (2), movable",
  "White hand, S, 2 available",
  "Die 1: 4",
  "Stock: 3 deals left",
  "Row 2, column 3, 3 adjacent mines",
  "top clue, 4, satisfied",
  "Black's hand",
  "Red home token, waiting",
  "Blue master",
  "Point 7, Tiger, capture available",
  "Row 4, column 5, King",
  "Left end 4, fits",
  "Right end 6",
  "Tile 3-5, selected",
  "Card 10♥",
  "Discard pile 9♣",
  "Asked for: Spades",
  "Card 7♥, new",
  "Card 7♥, selected, new",
  "Tile 4-1, new"
];

// Words that legitimately stay Latin in every language.
const LATIN_OK = /^(Elo|Lichess|OK|Done|Place|x\d*)$/;
const NON_LATIN = ["uk", "ru", "ja", "zh", "ar"];

let failures = 0;
function fail(msg) {
  failures++;
  console.log("FAIL " + msg);
}

const langs = Object.keys(STRINGS).filter((l) => l !== "en");
for (const lang of langs) {
  for (const sample of SAMPLES) {
    const out = I18n.msg(sample, lang);
    if (out === sample) fail(lang + ": not translated: " + JSON.stringify(sample));
    else if (/\{\w+\}/.test(out)) fail(lang + ": unfilled placeholder: " + JSON.stringify(out));
    else if (NON_LATIN.indexOf(lang) !== -1) {
      const leftover = (out.match(/[A-Za-z]{3,}/g) || []).filter((w) => !LATIN_OK.test(w));
      if (leftover.length) fail(lang + ": English left in " + JSON.stringify(out));
    }
  }
}

for (const lang of langs) {
  for (const sample of ARIA_SAMPLES) {
    const out = I18n.msg(sample, lang, { segments: true });
    if (out === sample) fail(lang + ": label not translated: " + JSON.stringify(sample));
    else if (NON_LATIN.indexOf(lang) !== -1) {
      const leftover = (out.match(/[A-Za-z]{3,}/g) || []).filter((w) => !LATIN_OK.test(w));
      if (leftover.length) fail(lang + ": English left in label " + JSON.stringify(out));
    }
  }
}

// English must pass through unchanged.
for (const sample of SAMPLES) {
  if (I18n.msg(sample, "en") !== sample) fail("en: changed " + JSON.stringify(sample));
}

// Template placeholders must match across languages.
const placeholders = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
for (const key of Object.keys(FULL.STRINGS.en).filter((k) => k.indexOf("msg_t_") === 0)) {
  const want = placeholders(FULL.STRINGS.en[key]);
  for (const lang of langs) {
    if (placeholders(FULL.STRINGS[lang][key] || "") !== want) fail(lang + ": placeholders differ in " + key);
  }
}

// Every text a page refers to must be there in every language, among the
// files that page loads. Arabic keeps the legal pages in English on
// purpose (see static-checks.js).
const ROOT = path.join(__dirname, "..");
const LEGAL_ENGLISH = { ar: /^(impressum|privacy)_/ };
const KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
function pageKeys(content) {
  const keys = new Set();
  let m;
  const plain = /data-i18n="([^"]+)"/g;
  while ((m = plain.exec(content))) if (KEY_RE.test(m[1])) keys.add(m[1]);
  const attr = /data-i18n-attr="([^"]+)"/g;
  while ((m = attr.exec(content))) {
    m[1].split(",").forEach((pair) => {
      const key = (pair.split(":")[1] || "").trim();
      if (KEY_RE.test(key)) keys.add(key);
    });
  }
  return keys;
}
const pageCount = { game: 0, text: 0 };
fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).sort().forEach((f) => {
  const content = fs.readFileSync(path.join(ROOT, f), "utf8");
  const textPage = /<html[^>]*\sdata-i18n-text=/.test(content);
  const table = textPage ? FULL.STRINGS : STRINGS;
  const keys = pageKeys(content);
  if (!keys.size) return;
  pageCount[textPage ? "text" : "game"]++;
  for (const lang of Object.keys(table)) {
    const missing = [...keys].filter((k) => typeof table[lang][k] !== "string" && !(LEGAL_ENGLISH[lang] && LEGAL_ENGLISH[lang].test(k)));
    if (missing.length) fail(`${lang}: ${f} (${textPage ? "main and text files" : "main files only"}) lacks ${missing.slice(0, 5).join(", ")}`);
  }
});

// "Who Took the Cake?" builds its clue sentences from ready-made phrases
// (CakeCore.clueText), not through msg(). Every clue type, with every
// animal, room and fitting piece of furniture, in every language: no
// placeholder or key may be left over, and the sentence must differ from
// English.
const CakeCore = require(path.join(__dirname, "..", "cake-core.js"));
let cakeSamples = 0;
{
  const cakePuzzle = { n: 6, rooms: [0], roomNames: CakeCore.ROOM_NAMES.slice() };
  const clueSamples = [];
  for (let a = 0; a < CakeCore.ANIMALS.length; a++) {
    CakeCore.ROOM_NAMES.forEach((r, room) => { clueSamples.push({ t: "in", a, room }); clueSamples.push({ t: "notin", a, room }); });
    ["chair", "rug"].forEach((f) => clueSamples.push({ t: "on", a, f }));
    ["plant", "cupboard"].forEach((f) => clueSamples.push({ t: "next", a, f }));
    clueSamples.push({ t: "window", a });
    ["top", "bottom", "left", "right"].forEach((side) => clueSamples.push({ t: "edge", a, side }));
    for (let b = 0; b < CakeCore.ANIMALS.length; b++) if (b !== a) clueSamples.push({ t: "same", a, b });
  }
  const tEn = (k) => STRINGS.en[k] || k;
  for (const lang of ["en"].concat(langs)) {
    const tl = (k) => (STRINGS[lang] && STRINGS[lang][k]) || k;
    for (const clue of clueSamples) {
      const out = CakeCore.clueText(cakePuzzle, clue, tl);
      cakeSamples++;
      if (/\{|cake_/.test(out)) fail(lang + ": cake clue incomplete " + JSON.stringify(out));
      else if (lang !== "en" && out === CakeCore.clueText(cakePuzzle, clue, tEn)) fail(lang + ": cake clue untranslated " + JSON.stringify(out));
    }
  }
}

console.log(`=== I18N MESSAGES: ${SAMPLES.length + ARIA_SAMPLES.length} samples x ${langs.length} languages (main files only), ` +
  `page texts on ${pageCount.game} other and ${pageCount.text} rules/history pages, ${cakeSamples} cake clues, ${failures} failure(s) ===`);
process.exit(failures ? 1 : 0);
