// text/zh/halma.js
// Rules and history texts of halma (zh). Loaded by halma-rules.html and halma-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    halma_rules_title: "哈尔玛跳棋规则",
    halma_rules_intro: "关于 PaperGames 如何演绎哈尔玛跳棋的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    halma_rules_basics_title: "基本玩法",
    halma_term_setup: "初始摆放",
    halma_rules_setup: "每位玩家起始有十枚棋子，占满棋盘一角的三角形营地，目标是率先把每一枚棋子都移动到对角另一端的营地。玩家 1 先行。",
    halma_term_moving: "移动",
    halma_rules_moving: "轮到你时，要么把一枚棋子朝 8 个方向中的任意一个，移动到相邻的空格上；要么进行一次或多次连续跳跃：越过相邻的一枚棋子（无论是自己的还是对手的——都不会被吃掉），落在它正后方的空格上，然后可以选择从那里继续跳。一回合要么恰好走一步，要么进行任意长度的一连串跳跃——你可以在任意一次跳跃之后选择停下，而不是被迫继续跳下去。",
    halma_term_win: "获胜",
    halma_rules_win: "率先把自己全部十枚棋子都送进目标营地的玩家获胜——即使对手还有几枚棋子留在那里也没关系，只有自己的棋子才算数。",
    halma_rules_end_title: "策略小贴士",
    halma_term_chains: "连跳是取胜关键",
    halma_rules_chains: "一次长长的连续跳跃，可以让一枚棋子在一回合内几乎跨越整个棋盘，因此提前搭建一条自己的棋子可以沿着跳跃的“走廊”，通常比一步一步走要快得多。",
    halma_history_title: "哈尔玛跳棋的历史",
    halma_history_origins_title: "从德国到马萨诸塞州",
    halma_history_origins_p1: "哈尔玛跳棋大约创作于 1883 至 1884 年间，作者是波士顿外科医生乔治·霍华德·蒙克斯（George Howard Monks）。他在德国求学期间接触到一款名为“Hoppity”的德国老游戏（其本身又受到法国游戏 Salta 的启发），并据此加以改编。",
    halma_history_origins_p2: "“Halma”这个名字来自希腊语中表示“跳跃”或“跳高”的词——对于一款乐趣全在于在棋盘上连续跳跃的游戏来说，这个名字恰如其分——它自 1885 年起，由波士顿的游戏制造商 E. I. Horsman 公司在美国推广开来。",
    halma_history_legacy_title: "深远的影响",
    halma_history_legacy_p1: "哈尔玛跳棋通常被视为“中国跳棋”的直接祖先，后者把哈尔玛的方形棋盘、以及支持四人对局的矩形布局，换成了一块六角星形棋盘——尽管名字里带着“中国”，中国跳棋其实与中国并无特别关联，也并非在中国发明。",
    halma_history_legacy_p2: "原版哈尔玛跳棋支持二人或四人对局，传统上在 16x16 的棋盘上进行，每方营地各有 19 枚棋子；不过更小巧、节奏更快的双人变体也早已十分常见，尤其常见于旅行套装和儿童版本。",
    halma_history_version_title: "本应用的版本",
    halma_history_version_p1: "PaperGames 采用一种更小巧、也更常见的双人变体：10x10 的棋盘、每方十枚棋子、四排三角形营地，保留了与原版相同的移动和连跳规则，但对局明显比完整的 16x16 原版要短得多。"
});
I18n.markTextLoaded("zh");
