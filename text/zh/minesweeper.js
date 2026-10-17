// text/zh/minesweeper.js
// Rules and history texts of minesweeper (zh). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    minesweeper_rules_title: "扫雷规则",
    minesweeper_rules_intro: "关于 PaperGames 如何演绎扫雷的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    minesweeper_rules_basics_title: "基本玩法",
    minesweeper_term_board: "网格与第一步",
    minesweeper_rules_board: "隐藏的地雷散布在整个网格中。你的第一次点击永远保证是安全的——地雷是在这之后才被放置的，会避开这一格及其周围所有格子——所以游戏绝不会还没开始就结束。",
    minesweeper_term_numbers: "读懂数字",
    minesweeper_rules_numbers: "揭开一个安全格会显示一个数字：表示它周围八个相邻格子中隐藏着多少枚地雷。空白格代表数字为零，揭开它会自动展开与它相连的整片空白区域。",
    minesweeper_term_flags: "插旗",
    minesweeper_rules_flags: "如果你认为某个格子藏有地雷，可以用插旗模式（适用于触屏设备）或右键点击（适用于桌面浏览器）为其做上标记——已插旗的格子不会被误触揭开。点击一个已揭开、且周围插旗数量与其数字相符的格子，会一次性揭开它周围其余所有格子，效果就和经典桌面版游戏里的中键点击一样——但如果旗子插错了位置，这样做仍有可能让你输掉整局游戏。",
    minesweeper_rules_end_title: "对局如何结束",
    minesweeper_term_win: "获胜",
    minesweeper_rules_win: "揭开所有不是地雷的格子，你就成功清空了整个棋盘。",
    minesweeper_term_loss: "失败",
    minesweeper_rules_loss: "揭开一枚地雷，游戏立即结束——棋盘上所有地雷都会显示出来，让你踩到的那一枚会单独标出，与其他地雷区分开来。",
    minesweeper_history_title: "扫雷的历史",
    minesweeper_history_origins_title: "从大型机到桌面电脑",
    minesweeper_history_origins_p1: "揭示并推理的扫雷式游戏最早可追溯到 20 世纪 60 年代初，此后以各种名字出现在大型机和早期个人电脑上，一直延续到 1980 年代，其中包括 1989 年一款名为“Mined-Out”的 Windows/OS2 版本，以及若干名为“RLogic”“Cube”的免费克隆版。",
    minesweeper_history_origins_p2: "真正让这款游戏家喻户晓的版本，是微软的罗伯特·唐纳（Robert Donner）和柯特·约翰逊（Curt Johnson）为 1992 年的 Windows 3.1 编写的，它取代了此前 Windows 自带的黑白棋，成为教新用户学习使用鼠标的“预装小游戏”——当年，左键点击和右键点击都还是需要真正练习的操作。",
    minesweeper_history_spread_title: "装进了每一台电脑",
    minesweeper_history_spread_p1: "由于 Windows 在 1990 年代和 2000 年代占据了全球个人电脑的绝对主导份额，扫雷几乎是理所当然地成了历史上被玩得最多的电脑游戏之一——它无处不在，不需要任何说明书，也很适合在工作间隙的碎片时间里玩上一把。",
    minesweeper_history_spread_p2: "如今被视为核心规则之一的“第一次点击保证安全”，本身也是一次改良：1992 年的最初版本，第一次点击偶尔也会直接踩雷，令人相当沮丧，后来的版本通过把地雷的放置推迟到第一次揭开之后，才修正了这一缺陷——本应用采用的正是这种做法。",
    minesweeper_history_modern_title: "一道真正意义上的高难度谜题",
    minesweeper_history_modern_p1: "抛开怀旧情怀不谈，扫雷在数学上确实颇为严肃：2000 年，理查德·凯伊（Richard Kaye）证明，判断一个部分揭开的扫雷局面是否存在与其数字提示相符的解，属于 NP 完全问题，与旅行商问题等一系列著名难题属于同一计算复杂度级别。",
    minesweeper_history_modern_p2: "这一结果意味着，不存在一种已知的捷径算法，能够快速求解任意扫雷局面——在最棘手的情况下，玩家（或电脑）可能会被迫面对一次真正的“五五开”猜测，无法仅凭逻辑推理出哪个格子是安全的，而这正是每一位老练玩家都学会了要提防的时刻。"
});
I18n.markTextLoaded("zh");
