// text/zh/gipfelwurf.js
// Rules and history texts of gipfelwurf (zh). Loaded by gipfelwurf-rules.html and gipfelwurf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    gw_rules_title: "山脊骰规则",
    gw_rules_intro: "掷四颗骰子，组成两对，沿七道山脊向上攀登。只要你敢就继续掷——如果没有一对合适，这一回合的攀登就失去了。最先登上三道山脊顶峰的人获胜。",
    gw_rules_basics_title: "规则",
    gw_term_board: "棋盘",
    gw_rules_board: "七道山脊，每道对应两颗骰子的和：2 到 4（11 级）、5（8 级）、6（10 级）、7（11 级）、8（10 级）、9（8 级）以及 10 到 12（11 级）。每道山脊从山脚开始，到顶峰结束。",
    gw_term_turn: "你的回合",
    gw_rules_turn: "点击“掷骰子”：掷出四颗骰子。按钮显示组成两对的各种方式及两个和。选一个：每个和让你的登山者在对应山脊上升一级。然后继续掷，或停下并扎营。",
    gw_term_climbers: "三名登山者",
    gw_rules_climbers: "一个回合里最多有三名登山者。已经有本回合登山者的山脊会继续使用他。如果一对的两个和都合适，就都用上；只有一个合适，就只用它；如果各自都合适但不能同时用，你选其中一个。",
    gw_term_lost: "失去回合",
    gw_rules_lost: "如果这次掷出的和都不合适——山脊已被登山者占满、已归别人或已爬到顶——这一回合就失去了：本回合的攀登全部作废。你的营地保留。",
    gw_term_camp: "扎营",
    gw_rules_camp: "停下时，你的登山者变成营地：下次从那里继续。营地是你自己的黑色标记（圆、方、三角或星）；本回合的登山者是带粗黑边的白色圆环。",
    gw_term_top: "顶峰",
    gw_rules_top: "如果你在山脊顶峰扎营，这道山脊就归你：它会画上斜线，对所有人关闭，其他玩家在上面的营地会被移走。",
    gw_term_end: "获胜",
    gw_rules_end: "最先拿下三道山脊的人立即获胜（开局前也可以选择两道）。如果所有山脊都已被占而没人达到数量，拥有最多山脊的人获胜；数量相同则一起获胜。",
    gw_term_start: "谁先开始",
    gw_rules_start: "谁先开始由抽签决定。在电脑之间的测试对局中，先手明显赢得更多，抽签让游戏保持公平。",
    gw_term_computer: "电脑",
    gw_rules_computer: "简单级选能走最多级的对子，三次顺利掷骰后停下。中等和困难级更喜欢已经在攀登的山脊和通往顶峰的短路；困难级会计算下一次掷骰失去回合的概率。",
    gw_rules_example_title: "示例",
    gw_rules_example: "你掷出 3、4、1 和 5。对子可以是 3 + 4 = 7 和 1 + 5 = 6，或 3 + 1 = 4 和 4 + 5 = 9，或 3 + 5 = 8 和 4 + 1 = 5。你选择 7 和 6：在 7 的山脊上升一级，在 6 的山脊上升一级。现在你有两名登山者，可以继续掷。",
    gw_history_title: "关于山脊骰",
    gw_history_family_title: "有风险的骰子游戏",
    gw_history_family_p1: "在许多骰子游戏里，你要一次次决定：为了更多收获再掷一次，还是保住已有的。游戏设计师赖纳·克尼齐亚在他的书《Dice Games Properly Explained》（1999 年）中把它们称为“jeopardy dice games”。",
    gw_history_pig_title: "猪骰（Pig）",
    gw_history_pig_p1: "一个著名的例子是 Pig，1945 年由美国魔术师约翰·斯卡尼首次见诸文字。用一颗骰子想掷几次就掷几次，把点数加起来；掷出 1 回合结束，本回合的分数作废。停下的人保住总和。这个游戏大概比它最早的记载还要古老。",
    gw_history_modern_title: "这个版本",
    gw_history_modern_p1: "山脊骰是为 PaperGames 制作的，有自己的棋盘和文字：对应两颗骰子之和的七道山脊（两侧的各对应三个和），通过电脑对局测量确定的长度，营地和登山者，以及抽签决定的先手。"
});
I18n.markTextLoaded("zh");
