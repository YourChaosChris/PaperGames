// text/ja/tictactoe.js
// Rules and history texts of tictactoe (ja). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ja, {
    tictactoe_rules_title: "三目並べのルール",
    tictactoe_rules_intro: "PaperGamesでの三目並べ（○×ゲーム、tic-tac-toe）の遊び方を簡単にまとめました。",
    tictactoe_rules_basics_title: "基本",
    tictactoe_term_board: "盤と印",
    tictactoe_rules_board: "盤は3x3の9マスです。交互に、空いているマスに自分の印を書き込みます。プレイヤー1は×、プレイヤー2は○です。プレイヤー1が常に先手です。書いた印は最後まで動きません。",
    tictactoe_rules_end_title: "ゲームの終わり方",
    tictactoe_term_win: "勝ち",
    tictactoe_rules_win: "自分の印を縦・横・斜めのいずれかに3つ先に並べたプレイヤーが、その場で勝ちです。勝ちの列は黒く塗りつぶして表示されます。",
    tictactoe_term_draw: "引き分け",
    tictactoe_rules_draw: "9マスがすべて埋まり、誰も3つ並べていなければ引き分けです。ミスをしない2人が対戦すると必ず引き分けになります。そのため「難しい」のコンピューターは決して負けず、相手にできる最善の結果は引き分けです。",
    tictactoe_term_resignation: "投了",
    tictactoe_rules_resignation: "プレイヤーはいつでも投了でき、その時点で相手の勝ちとしてゲームが終わります。",
    tictactoe_rules_hard_title: "「むずかしい」レベル",
    tictactoe_rules_hard: "「むずかしい」では、コンピューターがありうるすべての続きを読み、決してミスをしません。3x3の盤では、ありうるすべての対局を調べることで、ミスをしない2人が対戦すると必ず引き分けになることが証明されています。そのため、このレベルを相手に取れる最善の結果は引き分けです。1回ミスをすれば負けます。",
    tictactoe_history_title: "三目並べの歴史",
    tictactoe_history_origins_title: "ローマの3つの小石",
    tictactoe_history_origins_p1: "紀元前1世紀ごろのローマ帝国では、おそらくテルニ・ラピリ（terni lapilli、「一度に3つの小石」）という名で、よく似たゲームが遊ばれていました。各プレイヤーの駒は3つだけで、すべて置き終わったら、空いている点へ駒を動かして続けました。",
    tictactoe_history_origins_p2: "このゲームの盤の線は、ローマの多くの場所で見つかっています。",
    tictactoe_history_spread_title: "Noughts and Crosses、Tic-Tac-Toe",
    tictactoe_history_spread_p1: "このゲームにはさまざまな名前があります。イギリスでの名前「noughts and crosses（ゼロと×）」は、19世紀半ばにはすでに印刷物に見られます。たとえば1858年の雑誌『Notes and Queries』がその一例です。",
    tictactoe_history_spread_p2: "アメリカでは20世紀にtic-tac-toeという名前が定着しました。16世紀のイングランドですでに知られていた、バックギャモンの古い形「tick-tack」に由来する可能性があります。",
    tictactoe_history_modern_title: "最初期のコンピューターゲーム",
    tictactoe_history_modern_p1: "1952年、A・S・（サンディ・）ダグラスはケンブリッジ大学のコンピューターEDSAC用にOXOを作りました。人とコンピューターの関わりに関する博士論文の一部です。プレイヤーは電話のダイヤルでマスを選び、コンピューターは完璧に指しました。OXOは最初期の知られたビデオゲームの一つとされています。",
    tictactoe_history_modern_p2: "このゲームは小さいので完全に計算しつくせます。回転と鏡映を同一視すると可能なゲームは26,830通りで、互いに最善を尽くせば必ず引き分けになります。ここの「難しい」はまさにそれを行い、一手ごとにすべての続きを調べています。"
});
I18n.markTextLoaded("ja");
