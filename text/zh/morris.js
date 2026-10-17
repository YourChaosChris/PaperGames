// text/zh/morris.js
// Rules and history texts of morris (zh). Loaded by morris-rules.html and morris-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    morris_rules_title: "九子棋规则",
    morris_rules_intro: "关于 PaperGames 如何演绎九子棋（Mühle）的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    morris_rules_basics_title: "基本玩法",
    morris_term_board: "棋盘",
    morris_rules_board: "棋盘由三个嵌套的正方形组成，共 24 个点，正方形之间以中点连线相连。每位玩家有 9 枚棋子。游戏分两个阶段：先依次摆放全部棋子，之后每回合将一枚棋子滑动到相邻的空点。",
    morris_term_mill: "三连",
    morris_rules_mill: "三连指沿一条直线连成一排的三枚己方棋子。无论是摆子阶段还是之后的移动阶段，只要凑成三连，就可以立即从棋盘上移走一枚对方棋子。",
    morris_term_protected: "受保护的棋子",
    morris_rules_protected: "你不能移走正处于对方三连中的棋子，除非对方所有棋子都已经处于三连之中。",
    morris_rules_flying_title: "飞子规则",
    morris_term_flying: "飞子",
    morris_rules_flying: "当一方棋子只剩 3 枚时，这些棋子可以飞到棋盘上任意一个空点，而不必局限于相邻的点。",
    morris_rules_end_title: "对局如何结束",
    morris_term_win: "获胜",
    morris_rules_win: "当对手棋子只剩两枚，或对手轮到走棋时没有任何合法着法，你便获胜。",
    morris_term_resignation: "认输",
    morris_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    morris_history_title: "九子棋的历史",
    morris_history_origins_title: "一款年代与名字一样令人困惑的游戏",
    morris_history_origins_p1: "这款游戏的真实年代众说纷纭——埃及库尔纳神庙屋顶石板上刻着的一块棋盘，有时被认为可追溯到公元前 1400 年左右，不过许多历史学家认为这一说法并不可靠。比较确定的是，这款游戏的一个版本“Terni Lapilli”曾在罗马帝国流行一时。",
    morris_history_origins_p2: "“Nine Men's Morris”这个名字与摩里斯舞（Morris dancing）并无关系——两者很可能各自独立源自拉丁语 merellus，意为“小筹码”或棋子。",
    morris_history_spread_title: "刻进大教堂",
    morris_history_spread_p1: "这款游戏在中世纪欧洲极为流行，无论平民还是贵族都爱玩。人们在英格兰各地的大教堂房梁与回廊座椅上都发现了刻出的棋盘，可见就连修士和石匠也会在劳作间隙下上一局。",
    morris_history_spread_p2: "它甚至出现在文学作品中：在莎士比亚的《仲夏夜之梦》里，泰坦妮亚抱怨“九子棋盘已被泥泞填满”，描述的正是一块刻在草地上的户外棋盘，因积水而无法再用来对弈。",
    morris_history_modern_title: "至今仍在全世界流行",
    morris_history_modern_p1: "这款游戏如今仍以数十个地方名称流传于世——在德国叫 Mühle，在英国部分地区叫 Merels，各地还有无数本地变体——它的完整博弈论价值也已经被计算出来：在双方都下出最佳着法的情况下，九子棋必和。",
    morris_history_modern_p2: "这一结果由计算机分析在 20 世纪 90 年代确立，使它与西洋跳棋一样跻身一个稀有的行列：一款古老到曾被中世纪君王对弈过的游戏，如今却被现代计算机精确破解。"
});
I18n.markTextLoaded("zh");
