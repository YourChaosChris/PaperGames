// text/zh/viererzug.js
// Rules and history texts of viererzug (zh). Loaded by viererzug-rules.html and viererzug-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    viererzug_rules_title: "四步棋规则",
    viererzug_rules_intro: "两位玩家各在 5 x 5 的棋盘上放四枚棋子，然后移动它们。先让自己的四枚棋子连成一行或组成方块的一方获胜。",
    viererzug_rules_basics_title: "规则",
    viererzug_term_place: "放子",
    viererzug_rules_place: "黑方先手。双方轮流把一枚棋子放在任意空格上，直到双方棋盘上各有四枚棋子。",
    viererzug_term_move: "移动",
    viererzug_rules_move: "之后双方轮流把自己的一枚棋子向相邻空格移动一步，斜向也可以。棋子不能跳跃，也不会被吃掉。点按自己的棋子，再点按它要去的格子。",
    viererzug_term_win: "获胜",
    viererzug_rules_win: "自己的四枚棋子连成一条直线（横、竖或斜）或组成 2 x 2 的方块，立即获胜。放最后几枚棋子时也同样适用。",
    viererzug_term_draw: "和棋",
    viererzug_rules_draw: "同一局面且同一方走棋第三次出现时，为和棋。无法移动的一方跳过本回合。",
    viererzug_term_computer: "电脑",
    viererzug_rules_computer: "简单难度随机下子，但看到能赢的一步会下。中等难度向前看一步，避开让你立即获胜的走法。困难难度会向前想好几步。提示按钮显示困难难度会走的一步。",
    viererzug_history_title: "四步棋的历史",
    viererzug_history_origins_title: "先放，后走",
    viererzug_history_origins_p1: "先放子、再走子的游戏已经玩了许多世纪：三子棋和九子棋（磨坊棋）就是这样。这种模式很容易学，因为前半段简单，后半段充满选择。",
    viererzug_history_modern_title: "5 x 5 上的四枚棋子",
    viererzug_history_modern_p1: "20 世纪，这种模式被用到一块很小的棋盘上：1945 年美国出现了一款商品游戏，双方各四枚棋子，在 5 x 5 的棋盘上，四子连成一行或组成方块者获胜。后来木制游戏用自己的规则采用了同样的想法。原理本身，即少量棋子一步一步移动直到组成某种形状，不属于任何人。",
    viererzug_history_here_title: "这里的四步棋",
    viererzug_history_here_p1: "PaperGames 用这条古老的原理做了一款有自己名字的游戏。棋盘小到任何电子书阅读器都放得下，对局不需要计时，电脑有三个难度。"
});
I18n.markTextLoaded("zh");
