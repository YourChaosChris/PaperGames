// text/zh/wallmaze.js
// Rules and history texts of wallmaze (zh). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    wallmaze_rules_title: "墙壁迷宫规则",
    wallmaze_rules_intro: "关于PaperGames中墙壁迷宫玩法的快速参考 - 无论你是想重温规则还是刚开始学习都会有帮助。",
    wallmaze_rules_basics_title: "基本玩法",
    wallmaze_term_setup: "初始摆放",
    wallmaze_rules_setup: "每位玩家有一枚棋子，起始位于 9x9 棋盘自己那一边的正中央，并各自持有十面木墙作为储备。玩家 1 的目标是到达最下方那一排，玩家 2 的目标是到达最上方那一排——谁先把自己的棋子送到目标排，谁就获胜。",
    wallmaze_term_moving: "移动棋子",
    wallmaze_rules_moving: "轮到你时，可以把自己的棋子向上、下、左或右移动一格，或者放置一面木墙。如果两枚棋子相邻，你可以直接跳过对方的棋子；如果一面木墙或棋盘边缘挡住了这次跳跃，你可以改为斜向绕过对方棋子。",
    wallmaze_term_walls: "放置木墙",
    wallmaze_rules_walls: "一面木墙占两格长度，会挡住双方跨越它的直线移动。木墙之间不能重叠，也不能交叉，而且如果放置某面墙会彻底封死任何一方通往其目标排的最后一条路径，就不允许放置——始终至少要留有一条可通行的路。",
    wallmaze_rules_end_title: "赢得对局",
    wallmaze_term_win: "对局如何结束",
    wallmaze_rules_win: "只要一名玩家的棋子抵达自己目标排上的任意一格，他就获胜——具体是哪一列并不重要。",
    wallmaze_history_title: "墙壁迷宫的历史",
    wallmaze_history_origins_title: "一款诞生于 1990 年代的设计",
    wallmaze_history_origins_p1: "夸若多棋由米尔科·马尔凯西（Mirko Marchesi）设计，1997 年由法国游戏公司 Gigamic 首次出版，很快便与该公司其他几款精巧的双人抽象游戏一道，成为其最知名的作品之一。",
    wallmaze_history_origins_p2: "它属于更广义的“阻挡迷宫”类游戏家族：棋盘本身会随着对局进行而不断改变形状，而不像国际象棋棋盘那样始终固定不变——玩家放下的每一面木墙，都会永久性地重新塑造此后整局对局中双方棋子可走的路径。",
    wallmaze_history_design_title: "简单规则，真实深度",
    wallmaze_history_design_p1: "整套规则一张卡片就能写完——移动棋子或放置木墙，先到对面即获胜——然而在“加速冲刺”与“花一回合阻挡对手”之间的取舍，赋予了它真正的战略深度，常被游戏设计的相关文章引用，视为极简主义设计的典范。",
    wallmaze_history_design_p2: "夸若多棋也被当作一个计算机科学问题加以研究：由于其状态空间庞大却结构清晰（棋子位置加上木墙布局，并需要维持路径连通性这一约束），它成了传统搜索式人工智能，以及近年来强化学习智能体都青睐的研究对象。",
    wallmaze_history_names_title: "为什么用另一个名字",
    wallmaze_history_names_p1: "同样的玩法在市面上以 Quoridor 之名出售，由 Mirko Marchesi 于 1997 年设计，Gigamic 出版。Quoridor 是注册商标。PaperGames 与 Gigamic 及该游戏没有任何关联，因此使用自己的名称“墙壁迷宫”。",
    wallmaze_history_version_title: "本应用的版本",
    wallmaze_history_version_p1: "PaperGames 采用标准的 9x9 棋盘和每人十面木墙的标准规则。放置木墙自成一种独立的操作模式：点击“放置木墙”，在棋盘上任意位置点击即可预览最近的合法放置位置，再点击确认——这是特意为触屏设备设计的、更为宽容的操作方式，而不需要精确点中某个特定位置。"
});
I18n.markTextLoaded("zh");
