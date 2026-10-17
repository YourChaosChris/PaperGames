// text/zh/reversi.js
// Rules and history texts of reversi (zh). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    reversi_rules_title: "黑白棋规则",
    reversi_rules_intro: "关于PaperGames中黑白棋玩法的快速参考 - 无论你是想重温规则还是刚开始学习都会有帮助。",
    reversi_rules_basics_title: "基本玩法",
    reversi_term_discs: "棋子与开局",
    reversi_rules_discs: "黑白棋在8x8的棋盘上进行。游戏开始时,棋盘中央四格按对角线摆放各两枚黑白棋子。黑方总是先行。",
    reversi_term_flanking: "夹吃",
    reversi_rules_flanking: "落子时，若新落下的棋子与自己另一枚棋子之间，沿一条直线（横、竖或斜线均可）夹住了一枚或多枚对方棋子，这些棋子就会被夹吃。所有被夹住的棋子会立即翻转为你的颜色。",
    reversi_rules_pass_title: "没有合法着法时",
    reversi_term_pass: "无合法着法",
    reversi_rules_pass: "如果你没有任何合法着法，你的回合会被自动跳过，轮到对方走棋——只要还存在合法着法，就不能主动选择停一手。如果双方都没有合法着法，对局立即结束。",
    reversi_rules_end_title: "对局如何结束",
    reversi_term_win: "获胜",
    reversi_rules_win: "当双方都没有合法着法时（通常是因为棋盘已满），对局立即结束。棋盘上棋子更多的一方获胜，平分则为和棋。",
    reversi_term_resignation: "认输",
    reversi_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    reversi_history_title: "黑白棋的历史",
    reversi_history_origins_title: "一款维多利亚时代的原创游戏",
    reversi_history_origins_p1: "黑白棋于19世纪80年代初首次出现在英格兰,伴随着一场颇具维多利亚时代特色的争议:刘易斯·沃特曼(Lewis Waterman)和约翰·W·莫利特(John W. Mollett)两人都声称自己发明了这款游戏,并于1888年各自出版小册子,互相指责对方剽窃了创意。时至今日,历史学家仍无法确定这份功劳究竟应归于谁。",
    reversi_history_origins_p2: "早期的黑白棋允许玩家将最初的几枚棋子放在棋盘的任意位置,一些维多利亚时代的规则甚至规定,若一方被完全包围,只需一步就会失去对整个棋盘的控制 - 这些古怪的规则随着规则标准化最终被淘汰。",
    reversi_history_spread_title: "在日本重获新生",
    reversi_history_spread_p1: "这款游戏于1973年在日本重新兴起,长谷川五郎完善了黑白棋的规则 - 将四枚起始棋子固定为如今熟悉的对角线排列,并去除了较旧的变体规则 - 并通过Tsukuda Original以一个新名字发行:奥赛罗(Othello),致敬莎士比亚的同名戏剧及其黑白对立的核心冲突。",
    reversi_history_spread_p2: "黑白棋在日本大受欢迎，随后风靡全球，自 1977 年起每年举办一届世界黑白棋锦标赛，也让本应用所采用的这套标准化规则，成为如今竞技对局通行的版本。",
    reversi_history_modern_title: "计算机博弈的战场",
    reversi_history_modern_p1: "事实证明，黑白棋是计算机博弈研究一个格外理想的课题：它的规则十分简单，但可能出现的局面数量极其庞大，长期以来令简单粗暴的策略难以奏效。",
    reversi_history_modern_p2: "1997 年 8 月，迈克尔·布罗（Michael Buro）编写的程序 Logistello 以 6 比 0 击败了卫冕人类世界冠军村上健（Takeshi Murakami）——这一里程碑式的结果，与国际象棋“深蓝”的胜利发生在同一年。此后黑白棋引擎的棋力持续增强，如今这款游戏在相当广泛的局面范围内，已被视为已解或近乎已解。",
    reversi_history_names_title: "为什么叫黑白棋",
    reversi_history_names_p1: "黑白棋（Reversi）本身诞生于 19 世纪，属于公有领域。Othello 是注册商标。PaperGames 与该商标的所有者没有任何关联，因此使用更古老的名称 Reversi（黑白棋）。"
});
I18n.markTextLoaded("zh");
