// text/zh/checkers.js
// Rules and history texts of checkers (zh). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    checkers_rules_title: "西洋跳棋规则",
    checkers_rules_intro: "关于 PaperGames 如何演绎西洋跳棋（英式跳棋）的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    checkers_rules_basics_title: "基本玩法",
    checkers_term_men: "普通棋子",
    checkers_rules_men: "黑白双方各自在己方最后三排的深色格上摆放 12 枚棋子，轮流沿斜线向前走一格，黑方先行。",
    checkers_term_kings: "王棋",
    checkers_rules_kings: "普通棋子到达对方底线即升为王棋。王棋可以沿任意斜线方向移动，但每次仍只走一格。",
    checkers_rules_capture_title: "吃子",
    checkers_term_capture: "吃子",
    checkers_rules_capture: "跳过相邻的一枚敌方棋子、落在其正后方的空格上即可吃子，被跳过的棋子随即移出棋盘。",
    checkers_term_mandatory: "强制吃子",
    checkers_rules_mandatory: "只要存在可以吃子的着法，就必须吃子——在有吃子机会时，普通的移动是不允许的。若有多种吃子方式可选，你可以自行决定用哪枚棋子吃。",
    checkers_term_multijump: "连续跳吃",
    checkers_rules_multijump: "如果吃子后同一枚棋子立刻又能再次吃子，就必须继续跳吃，直到无法再吃为止。棋子一旦在连续跳吃途中落在对方底线，会立即升为王棋，并当场结束这一回合。",
    checkers_rules_end_title: "对局如何结束",
    checkers_term_win: "获胜",
    checkers_rules_win: "当对手所有棋子都被吃光，或对手轮到走棋时没有任何合法着法，你便获胜。",
    checkers_term_resignation: "认输",
    checkers_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    checkers_term_draw: "和棋",
    checkers_rules_draw: "如果双方连续四十步都没有吃子，此局为和棋。",
    checkers_history_title: "西洋跳棋的历史",
    checkers_history_origins_title: "古老的棋盘，中世纪的游戏",
    checkers_history_origins_p1: "西洋跳棋的棋盘与初始摆法可以追溯到阿尔盖克（Alquerque），这是一款在 5x5 有线棋盘上进行的吃子游戏，在埃及和中东地区已流行超过 3000 年，后来在摩尔人统治下的西班牙也颇受欢迎。",
    checkers_history_origins_p2: "大约在 12 世纪的法国南部，有人把阿尔盖克的斜向吃子方式与国际象棋棋盘结合了起来，创造出“Fierges”或“Jeu de Dames”——正是今天这款游戏的直系祖先。",
    checkers_history_spread_title: "从法国走向世界",
    checkers_history_spread_p1: "这款游戏以多种名称传遍欧洲——英格兰称之为 draughts，西班牙称之为 dama，德国称之为 dame——并随着殖民者跨越大西洋，在美国尤其流行，本应用采用的 8x8 棋盘与强制吃子规则（美式跳棋）正是在那里确立下来的。",
    checkers_history_spread_p2: "自 19 世纪起，各国及世界级的锦标赛陆续举办，英国、美国等地有组织的竞技对局，造就了一代又一代备受推崇的高手，也留下了许多被深入研究的开局。",
    checkers_history_modern_title: "一款被彻底破解的游戏",
    checkers_history_modern_p1: "西洋跳棋在博弈论中占有独特地位：2007 年，经过近二十年的计算，乔纳森·谢弗（Jonathan Schaeffer）编写的程序 Chinook 证明了在双方都下出最佳着法的情况下，西洋跳棋必和——这是当时被如此彻底破解过的最复杂的游戏。",
    checkers_history_modern_p2: "这丝毫没有让西洋跳棋变得不再有趣——就像国际象棋中一个已被破解的残局一样，知道理论上的结果，并不会改变真实对局时所需要的实战技巧。"
});
I18n.markTextLoaded("zh");
