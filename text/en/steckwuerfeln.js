// text/en/steckwuerfeln.js
// Rules and history texts of steckwuerfeln (en). Loaded by steckwuerfeln-rules.html and steckwuerfeln-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sw_rules_title: "Steckwürfeln Rules",
    sw_rules_intro: "Roll two dice and peg the holes numbered 2 to 12; the fewest points win.",
    sw_rules_basics_title: "The rules",
    sw_term_holes: "The holes",
    sw_rules_holes: "There are eleven holes numbered 2 to 12. At the start of a turn no hole has a peg.",
    sw_term_turn: "A turn",
    sw_rules_turn: "Roll two dice. Either put one peg into the hole with the total, or two pegs into the holes of the two single dice - with a 2 and a 4 that is hole 6, or holes 2 and 4. A hole takes one peg only. With two equal dice (3 and 3) only the total counts, and there is no hole 1.",
    sw_term_go_on: "Going on",
    sw_rules_go_on: "Keep rolling and pegging as long as a peg fits. When a roll cannot be pegged, the turn is over: add up the numbers of the free holes. That is your score.",
    sw_term_sixes: "Double six",
    sw_rules_sixes: "Double six is a joker, and players agree what it means. Here you choose: roll again (nothing is pegged), the turn ends at once, or no special rule - then 6 and 6 pegs hole 12 like any other total.",
    sw_term_win: "Winning",
    sw_rules_win: "After the chosen number of rounds the fewest points in total win; equal points are a draw. Pegging all eleven holes gives 0 points and wins at once.",
    sw_term_shared: "Shared board",
    sw_rules_shared: "In this variant all players use one board and roll once per turn. Whoever cannot peg any more is out; the last player left wins.",
    sw_term_computer: "The computer",
    sw_rules_computer: "On its own board it pegs the way that keeps the most later rolls playable. On a shared board it does the opposite: it leaves the next player as few playable rolls as it can.",
    sw_term_help: "Help",
    sw_rules_help: "Undo takes back your last pegging. There is no time limit.",
    sw_history_title: "History of Steckwürfeln",
    sw_history_old_title: "A small wooden game",
    sw_history_old_p1: "A board with numbered holes, loose pegs and two dice: games like this are made as small wooden pocket games and sold as simple dice games for children and adults. Several makers sell a version under their own names. The rules are very simple and were handed on by playing, so details differ - for example what a double six means, or whether everybody uses the same board.",
    sw_history_version_title: "This version",
    sw_history_version_p1: "Steckwürfeln follows the usual rules: holes 2 to 12, one peg or two pegs per roll, the free holes as points. Double six, the number of rounds and the shared board are choices. The name and the drawings are our own."
});
I18n.markTextLoaded("en");
