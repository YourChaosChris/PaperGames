// text/en/doppelkopf.js
// Rules and history texts of doppelkopf (en). Loaded by doppelkopf-rules.html and doppelkopf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_basics_title: "The basic idea",
    doppelkopf_rules_title: "Doppelkopf Rules",
    doppelkopf_rules_intro: "How PaperGames plays Doppelkopf. Only the normal game is offered here, with the marriage rule; the section at the end lists what is left out.",
    doppelkopf_term_setup: "Cards and players",
    doppelkopf_rules_setup: "Four players and 48 cards: Nine, Ten, Jack, Queen, King and Ace in four suits, every card twice. Everyone gets twelve cards. The player after the dealer leads the first trick; the dealer moves on by one seat every deal.",
    doppelkopf_term_trumps: "Trumps",
    doppelkopf_rules_trumps: "There are 26 trumps. From the highest down: the two Heart Tens, the Queens (Clubs, Spades, Hearts, Diamonds), the Jacks (in the same suit order), then Diamond Ace, Ten, King and Nine. When two identical cards fall in the same trick, the first one wins - with one exception: the second Heart Ten beats the first. The button \"Trump order\" above the table shows the whole list at any time, and your trumps sit in a row of their own above your other cards.",
    doppelkopf_term_plain: "Plain suits",
    doppelkopf_rules_plain: "Everything that is not a trump belongs to a plain suit: Clubs and Spades each have Ace, Ten, King and Nine; Hearts only has Ace, King and Nine, because the Heart Ten is a trump. Within a plain suit the Ace is highest, then Ten, King, Nine.",
    doppelkopf_term_follow: "Following suit",
    doppelkopf_rules_follow: "You must follow the suit that was led, and trump counts as one suit of its own. If a trump is led, you must play a trump if you have one. If Hearts are led, a Heart Ten does not count - it is a trump - and neither do Queens or Jacks. Only when you cannot follow may you play any card, including a trump, which then beats all plain cards. The game shows the cards you may not play lower with a dashed border and tells you why if you tap one.",
    doppelkopf_term_parties: "Who plays with whom",
    doppelkopf_rules_parties: "The two players holding a Queen of Clubs form the Re party; the other two are Kontra. At the start nobody knows who is together - only you know whether you hold a Queen of Clubs. A player's party becomes known when they play their Queen of Clubs. Until then the table shows a question mark for them.",
    doppelkopf_term_marriage: "Marriage",
    doppelkopf_rules_marriage: "If one player holds both Queens of Clubs, it is a marriage, and the game announces it. The first trick within the first three that is led with a plain suit and won by another player decides: that player becomes the partner, and the two play Re against the other two. If no such trick happens in the first three tricks, the marriage player plays alone against the other three.",
    doppelkopf_term_points: "Card points and winning",
    doppelkopf_rules_points: "Aces count 11, Tens 10, Kings 4, Queens 3, Jacks 2 and Nines nothing - 240 points in all. After the twelfth trick each party adds up the cards in its tricks. Re needs at least 121 points to win; with 120 points Kontra wins.",
    doppelkopf_term_scoring: "Scoring",
    doppelkopf_rules_scoring: "The winning party gets one game point for winning, and one more if Kontra wins (for winning against the Queens of Clubs). There is one more point each when the losers have fewer than 90, fewer than 60 and fewer than 30 points, and one more when they took no trick at all. Each player of the winning party gains these points, each player of the losing party loses them. When one player plays alone against three, that player scores three times as much.",
    doppelkopf_term_extras: "Extra points",
    doppelkopf_rules_extras: "When two play against two, there are also extra points for the party that earns them: a trick worth 40 points or more (a \"Doppelkopf\"), catching a Diamond Ace (the \"fox\") of the other party in a trick, and winning the last trick with a Jack of Clubs (\"Charlie\"). Extra points are counted on top of the game points, so the losing party can win some of them back.",
    doppelkopf_term_left_out: "What is left out",
    doppelkopf_rules_left_out: "PaperGames plays only the normal game. There are no solos, no announcements of Re, Kontra or \"no 90\" and so on, no poverty rule (a player with very few trumps), no special ways of finding a marriage partner beyond the rule above, and no tournament rules. Clubs and families often add some of these; they are not part of this version.",
    doppelkopf_history_title: "The History of Doppelkopf",
    doppelkopf_history_origins_title: "From Schafkopf to Doppelkopf",
    doppelkopf_history_origins_p1: "Doppelkopf grew out of Schafkopf, a trick-taking game with a similar ranking of Queens and Jacks as permanent trumps that was played in Germany from the 18th century on. Somewhere in the 19th century, players in northern and central Germany began to play it with two packs mixed together - hence the name, which means roughly \"double head\".",
    doppelkopf_history_origins_p2: "Doubling the pack brought in what makes the game special: every card exists twice, so it matters which copy falls first, and partnerships can be secret, because nobody knows who holds the other Queen of Clubs.",
    doppelkopf_history_names_title: "Many Tables, Many Rules",
    doppelkopf_history_names_p1: "For a long time every region, club and family played by its own rules, from how the Heart Tens rank to which solos are allowed. In the 20th century players' associations set down common rules for tournaments, but at home many groups still keep their own house rules.",
    doppelkopf_history_names_p2: "PaperGames offers the normal game with the marriage - the core that almost every group plays the same way - and says on the rules page which additions are left out."
});
I18n.markTextLoaded("en");
