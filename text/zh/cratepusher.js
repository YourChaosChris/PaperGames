// text/zh/cratepusher.js
// Rules and history texts of cratepusher (zh). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    cratepusher_rules_title: "推箱子规则",
    cratepusher_rules_intro: "PaperGames 中推箱子的玩法：一个人玩的益智游戏，在小仓库里移动箱子。",
    cratepusher_term_board: "棋盘",
    cratepusher_rules_board: "由墙（全黑）和地面（白色）组成的长方形格子。地面上有你（实心圆）、几个箱子（带叉的方块）以及数量相同的目标格（小空心方块）。站在目标格上的箱子会变成实心方块。",
    cratepusher_term_move: "移动",
    cratepusher_rules_move: "你每次向上、下、左或右移动一格——不能斜着走。你不能穿过墙或箱子。",
    cratepusher_rules_move_targets: "你可以走过空的目标格；只有墙和箱子会挡住你。",
    cratepusher_rules_hint: "“提示”只显示一次推动：从你当前局面出发的一种最短解法的第一步。要推的箱子加上虚线框，箱子要去的格子加上实线框，棋盘下方的一句话写明行、列和方向（不计外墙）。提示只显示这一步，推要你自己来。想要下一步，就再点一次“提示”。如果从当前局面已经无解，提示会告诉你。提示不会被保存，也不影响你的统计。",
    cratepusher_term_push: "推",
    cratepusher_rules_push: "走向箱子就会把它推前一格，但前提是箱子后面的格子是空的：没有墙，也没有第二个箱子。你一次只能推一个箱子，也永远不能把箱子拉向自己。",
    cratepusher_term_goal: "目标",
    cratepusher_rules_goal: "只要每个箱子都站在目标格上，本关就完成了。哪个箱子放在哪个目标格上都可以。",
    cratepusher_term_stuck: "卡死",
    cratepusher_rules_stuck: "因为箱子不能拉，一次不小心的推动就可能让关卡无解——例如把箱子推进不是目标格的角落。箱子卡在这样的角落时，游戏会提醒你。其他死路不会提示：请提前思考，并随时使用“撤销一步”。",
    cratepusher_term_controls: "操作",
    cratepusher_rules_controls: "点你旁边的格子就走过去（并推动那里的箱子）。点更远的地面格，你会沿最短路线走过去——但只有在不需要推动箱子时才行。方向键和 W、A、S、D 也能移动。“撤销一步”可以一步一步撤销，想撤多少都行；“重新开始本关”让本关从头开始。",
    cratepusher_term_levels: "关卡",
    cratepusher_rules_levels: "每一关都由 PaperGames 自己生成，每次都是新的：简单为 7x7 格、3 个箱子，中等为 9x9 格、4 个，困难为 10x10 格、5 个。程序从已完成的局面倒推出每一关，所以一定有解，然后再用自己的求解器检查一遍。最佳解需要的推动次数显示在棋盘上方，同时显示你的步数、推动次数，以及已经就位的箱子数。",
    cratepusher_history_title: "推箱子的历史",
    cratepusher_history_origins_title: "1981 年的构想",
    cratepusher_history_origins_p1: "把箱子一个个推到标记位置、而且永远不能拉的玩法，是今林宏行在 1981 年发明的。1982 年，日本公司 Thinking Rabbit 以 Sokoban 为名把它作为电脑游戏发行。",
    cratepusher_history_origins_p2: "简单的规则背后有真正的深度：即使是小房间也可能需要很长、经过仔细计划的步骤序列，计算机科学家还证明了这类谜题在一般情况下非常难解。此后，这一构想被无数益智游戏采用。",
    cratepusher_history_names_title: "为什么用另一个名字",
    cratepusher_history_names_p1: "Sokoban 是 Falcon Co., Ltd. 的注册商标。PaperGames 与 Falcon 或原版游戏没有任何关系，因此使用自己的名字：推箱子。Calcudoku 也是出于同样的原因使用自己的名字。",
    cratepusher_history_names_p2: "这里的关卡没有一个来自原版游戏或任何关卡合集。每一关都是在你需要时由 PaperGames 自己的程序生成的——从已完成的局面倒推构建，并用自己的求解器检查。"
});
I18n.markTextLoaded("zh");
