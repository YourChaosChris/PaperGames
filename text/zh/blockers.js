// text/zh/blockers.js
// Rules and history texts of blockers (zh). Loaded by blockers-rules.html and blockers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    bl_rules_title: "拦路石规则",
    bl_rules_intro: "掷骰赛跑到棋盘顶端——但石块挡住道路，你还能把它们放到别人面前。",
    bl_rules_basics_title: "规则",
    bl_term_board: "棋盘",
    bl_rules_board: "道路连接各格，终点在最上方。每位玩家在棋盘下方有一个装有5枚棋子的家，从最下面一行自己的格子（以粗圈标记）进入棋盘。开始时，道路上有6块石块。",
    bl_term_move: "一回合",
    bl_rules_move: "掷骰子，将自己的一枚棋子正好走相应的格数。从家出发时，第一步走到你的入口格。在任何岔路口都可以转弯，但一步移动不能两次经过同一格。如果没有棋子能用这个点数，就轮到下一位。",
    bl_term_stones: "石块",
    bl_rules_stones: "任何棋子都不能越过石块。正好停在石块上的棋子会拿起它，并放到任意空格上——但不能放在最下面一行，也不能放在终点。终点同样不能越过：必须用正好的点数到达。",
    bl_term_hit: "打回家",
    bl_rules_hit: "棋子正好停在其他玩家的棋子上,就把它送回家——但只在棋盘上半部分,那里的格子是圆的。下半部分的格子是方的:那里的棋子是安全的,任何一步都不能停在其他玩家的棋子上。自己的两枚棋子不能站在同一格。",
    bl_term_win: "胜者",
    bl_rules_win: "游戏怎样结束在开局前选择。“一枚棋子到终点”(默认):第一个把一枚棋子送进终点的玩家获胜;每人 5 枚棋子。“全部棋子到终点”:每人 3 或 5 枚棋子,按所选;到达终点的棋子离开棋盘,终点重新空出;终点前的最后三格上没有石头。最先把全部棋子送进终点的玩家获胜,其他玩家按送进终点的棋子数排名。",
    bl_term_players: "玩家",
    bl_rules_players: "同一设备上2至4名玩家；任何一位都可以由电脑扮演（简单、中等或困难）。棋子以形状区分：圆形、三角形、菱形和星形。",
    bl_rules_example_title: "挡路的石块",
    bl_rules_example: "图中一枚棋子（圆形）位于一块石块（黑色方块）前。掷出2时，它停在石块上，拿起石块并放到另一个空格上。掷出3时，它不能直走，因为那样就得越过石块。",
    bl_history_title: "拦路石的历史",
    bl_history_origins_title: "古老的竞速游戏",
    bl_history_origins_p1: "竞速游戏是让棋子按骰子沿路线走向终点的游戏，属于最古老的棋盘游戏之一；乌尔王族局戏是规则流传至今的最古老的游戏。打回家和堵路也是古老的想法：在帕奇西中，停在对方棋子上的棋子会把它送回起点；在西洋双陆棋中，连续几个点上的棋子组成一道墙，称为“prime”，把对方的棋子挡在后面。",
    bl_history_modern_title: "PaperGames中的拦路石",
    bl_history_modern_p1: "拦路石是PaperGames的原创游戏：一个有49格的道路网，终点在顶端，6块石块，最多4名玩家。被停上的石块不会被拿走，而是重新放置，因此通往终点的路不断变化。各家的入口格与终点的距离相同，棋子以形状而不是颜色区分，让游戏在黑白电子墨水屏上也能玩。"
});
I18n.markTextLoaded("zh");
