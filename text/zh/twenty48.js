// text/zh/twenty48.js
// Rules and history texts of twenty48 (zh). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    twenty48_rules_title: "2048 规则",
    twenty48_rules_intro: "关于 PaperGames 如何演绎 2048 的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    twenty48_rules_basics_title: "基本玩法",
    twenty48_term_board: "棋盘与滑动",
    twenty48_rules_board: "每一步操作都会让 4x4 棋盘上的所有方块朝一个方向（上、下、左或右）尽可能远地滑动。只要这一步真正移动了什么，就会在一个随机的空格中出现一个新方块（通常是 2，偶尔是 4）。",
    twenty48_term_merging: "合并",
    twenty48_rules_merging: "滑动过程中两个数值相同的方块相撞时，会合并成一个数值为两者之和的方块，并把这个新数值加到你的分数上。每个方块每回合只能合并一次，所以三个相同的方块一起滑动时，只有最前面的一对会合并，第三个方块保持不变，而不会连锁合并下去。",
    twenty48_rules_end_title: "对局如何结束",
    twenty48_term_win: "达成 2048",
    twenty48_rules_win: "合并出一个 2048 方块即算获胜——但游戏并不会就此停止。你可以继续挑战，把分数（和棋盘上的数字）再往上推。",
    twenty48_term_loss: "无路可走",
    twenty48_rules_loss: "当棋盘完全填满、且没有任何两个相邻方块数值相同时，游戏立即结束——此时无论朝哪个方向滑动都不会有任何改变。",
    twenty48_history_title: "2048 的历史",
    twenty48_history_origins_title: "建立在“Threes!”之上",
    twenty48_history_origins_p1: "2048 由 19 岁的意大利开发者加布里埃莱·奇鲁利（Gabriele Cirulli）在 2014 年 3 月的一个周末独立完成，最初只是他为了练习快速做出一款完整游戏而进行的个人练习。它的核心玩法并非从零发明：2048 是一款名为“1024”（由 Veewo Studio 制作）的游戏的直接翻版，而“1024”本身又受到了更早的游戏“Threes!”（由 Asher Vollmer、Greg Wohlwend 和 Jimmy Hinson 制作）的启发，后者当时已经过了一年多精心打磨的开发。",
    twenty48_history_origins_p2: "奇鲁利从第一天起就以开放许可免费公开了 2048 的源代码，这一决定后来被证明意义非凡：它没有去堵截各种克隆版，反而是主动敞开了大门，这款游戏也因此借由被无数次、合法地重新实现，而不仅仅是被玩，从而广泛传播开来。",
    twenty48_history_spread_title: "一场病毒式的克隆狂潮",
    twenty48_history_spread_p1: "这款游戏发布仅数天便迅速走红，据称在头两周内就吸引了数百万玩家，并引发了一波庞大的克隆、移植与变体浪潮——各种换皮版本，把方块换成了从表情符号到流行文化角色的一切元素，还出现了不同尺寸、彩色方块乃至三维版本。",
    twenty48_history_spread_p2: "这个 PaperGames 版本刻意保留了原版的 4x4 棋盘和 90%/10% 的“2 或 4”生成概率，而没有选用那些变体——这也是本合集在其他每一处都秉持的选择：优先采用标准、广为人知的规则，而不是对其加以标新立异的改造。",
    twenty48_history_modern_title: "一块小棋盘，一个被认真研究的课题",
    twenty48_history_modern_p1: "尽管规则简单，最优的 2048 玩法却是一个货真价实的高难度搜索问题，原因在于方块生成时的随机性：强力的电脑玩家会采用期望极大化搜索（根据每种可能出现的下一个方块的概率来权衡各种走法），而不是国际象棋这类确定性游戏所能使用的普通极小极大搜索。",
    twenty48_history_modern_p2: "目前记录在案的最强电脑玩家，能够以很高的概率达到 32768 方块，偶尔还能达到 65536——比大多数人类玩家一辈子只求能见上一次的那个方块，还要再翻两番。"
});
I18n.markTextLoaded("zh");
