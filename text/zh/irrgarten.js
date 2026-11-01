// text/zh/irrgarten.js
// Rules and history texts of irrgarten (zh). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    ig_rules_title: "迷宫规则",
    ig_rules_intro: "由格子和墙壁组成的方形迷宫。找到从起点到终点的路。",
    ig_rules_basics_title: "规则",
    ig_term_move: "行走",
    ig_rules_move: "从左上角带圆圈的格子出发，终点是右下角的旗子。点击相邻格子即可前进；在笔直畅通的通道中，也可点击远处格子直接过去。走过的路线会显示为粗线。",
    ig_term_draw: "手指划动",
    ig_rules_draw: "可在设置中选择“手指划动”：用手指沿通道移动，圆圈会逐格跟随。点击也可以移动。",
    ig_term_walls: "墙壁和返回",
    ig_rules_walls: "不能穿过墙壁，屏幕会显示简短提示。退回刚才所在的格子时，该格会从路线中移除。点击路线上的任意格子即可返回那里。",
    ig_term_goal: "终点",
    ig_rules_goal: "到达旗子后，迷宫就解开了。每个迷宫从起点到终点只有一条路。",
    ig_term_levels: "难度",
    ig_rules_levels: "简单（儿童）：6 x 6格，通道较宽。中等：10 x 10。困难：15 x 15。很难：20 x 20。每个难度有五个迷宫，依次进行。程序根据固定数字生成每个迷宫，所以每次都相同。",
    ig_term_help: "返回和提示",
    ig_rules_help: "“返回”退回一格。“提示”用虚线圆环标出正确路线接下来的三格，即使在死路里也能使用。",
    ig_history_title: "迷宫的历史",
    ig_history_old_title: "古老的图案",
    ig_history_old_p1: "许多古代文化的石头、硬币和地面上，都有通向中心的曲折图案。许多图案只有一条路，没有岔路；带死路的谜题后来才出现。",
    ig_history_puzzle_title: "树篱和谜题书",
    ig_history_puzzle_p1: "从16世纪起，人们在花园里种植树篱迷宫，游客可能会在里面迷路。19和20世纪，纸上迷宫成为儿童杂志和谜题书的常见内容。数学家把它们描述为图，计算机程序则能不断生成新的迷宫。",
    ig_history_here_title: "这个版本",
    ig_history_here_p1: "这里的每个迷宫都由程序生成：程序走遍网格并拆除墙壁，直到每个格子都能到达。没有迷宫是从书上复制的。"
});
I18n.markTextLoaded("zh");
