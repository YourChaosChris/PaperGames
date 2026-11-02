// text/zh/irrgarten.js
// Rules and history texts of irrgarten (zh). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    ig_rules_title: "迷宫规则",
    ig_rules_intro: "由格子和墙壁组成的方形迷宫。找到从起点到终点的路。",
    ig_rules_basics_title: "规则",
    ig_term_move: "行走",
    ig_rules_move: "你从有圆圈的格子出发，终点是旗子。两者可以在任何地方：边上或中间。点按你旁边的格子即可走进去，或点按笔直通道中更远的格子，直接走到那里。你走过的路显示为一条粗线。",
    ig_term_draw: "手指划动",
    ig_rules_draw: "可在设置中选择“手指划动”：用手指沿通道移动，圆圈会逐格跟随。点击也可以移动。",
    ig_term_walls: "墙壁和返回",
    ig_rules_walls: "不能穿过墙壁，屏幕会显示简短提示。退回刚才所在的格子时，该格会从路线中移除。点击路线上的任意格子即可返回那里。",
    ig_term_goal: "终点",
    ig_rules_goal: "从起点分出两条或三条路，但只有一条通向旗子，其余的都是死路。到达旗子，迷宫就完成了。每个迷宫从起点到终点都恰好只有一条路。",
    ig_term_levels: "难度",
    ig_rules_levels: "简单（适合儿童）：6 x 6 格，通道长、岔路少。中等：10 x 10。困难：15 x 15。很难：20 x 20。级别越高，岔路越多。每个级别每种玩法各有五个迷宫，依次出现；每个都由程序根据固定的数字生成，所以每次都一样。",
    ig_term_help: "返回和提示",
    ig_rules_help: "“返回”退回一格。“提示”用虚线圆环标出正确路线接下来的三格，即使在死路里也能使用。",
    ig_term_multi: "多个角色",
    ig_rules_multi: "在设置中可以选择“多个角色”：两个或三个角色从不同地方出发，各有自己的终点——孩子（实心圆）去学校（空心圆），狗（实心方块）去狗窝（空心方块），猫（实心三角）去篮子（空心三角）。点按角色或迷宫下方它的按钮来选择；被选中的角色有一个圆环。每个角色到终点都恰好只有一条路。所有角色都到达后，迷宫就完成了。",
    ig_history_title: "迷宫的历史",
    ig_history_old_title: "古老的图案",
    ig_history_old_p1: "许多古代文化的石头、硬币和地面上，都有通向中心的曲折图案。许多图案只有一条路，没有岔路；带死路的谜题后来才出现。",
    ig_history_puzzle_title: "树篱和谜题书",
    ig_history_puzzle_p1: "从16世纪起，人们在花园里种植树篱迷宫，游客可能会在里面迷路。19和20世纪，纸上迷宫成为儿童杂志和谜题书的常见内容。数学家把它们描述为图，计算机程序则能不断生成新的迷宫。",
    ig_history_here_title: "这个版本",
    ig_history_here_p1: "这里的每个迷宫都由程序生成：程序走遍网格并拆除墙壁，直到每个格子都能到达。没有迷宫是从书上复制的。"
});
I18n.markTextLoaded("zh");
