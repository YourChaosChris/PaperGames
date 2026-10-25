// text/zh/slidepuzzle.js
// Rules and history texts of slidepuzzle (zh). Loaded by slidepuzzle-rules.html and slidepuzzle-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    slidepuzzle_rules_title: "数字推盘规则",
    slidepuzzle_rules_intro: "带数字的方块放在一个有一个空位的方盒里。滑动它们，直到数字按顺序排好。",
    slidepuzzle_rules_basics_title: "规则",
    slidepuzzle_term_board: "棋盘",
    slidepuzzle_rules_board: "3 × 3格（方块1到8）、4 × 4（1到15）或5 × 5（1到24）；有一格是空的。",
    slidepuzzle_term_move: "一步",
    slidepuzzle_rules_move: "点空格旁边的方块，它就滑进空格。也可以点同一行或同一列更远的方块：这时它和空格之间的方块也都滑动一格。每点一次算一步。",
    slidepuzzle_term_goal: "目标",
    slidepuzzle_rules_goal: "从左上角开始一行一行按顺序排好数字，空格在右下角。",
    slidepuzzle_term_mix: "打乱",
    slidepuzzle_rules_mix: "新题只用从已完成的棋盘出发的真实步骤打乱，所以每道题都有解。（用手把方块随意放进盒子的摆法中，有一半是无解的。）",
    slidepuzzle_term_hint: "提示",
    slidepuzzle_rules_hint: "“提示”按钮用双边框标出一个方块。在3 × 3上，它是最短解法的第一步，完成时还会显示从开局最少需要几步；在更大的棋盘上，提示的那一步会让一个方块更接近自己的位置。",
    slidepuzzle_history_title: "数字推盘的历史",
    slidepuzzle_history_origins_title: "纽约州卡纳斯托塔",
    slidepuzzle_history_origins_p1: "推盘游戏通常被认为出自纽约州卡纳斯托塔的邮政局长诺伊斯·帕尔默·查普曼，据说他早在1874年就向朋友展示过它的前身。1880年，十五块方块的推盘在美国风靡一时；查普曼当年2月申请了专利，但被驳回。",
    slidepuzzle_history_loyd_title: "没有证据的说法",
    slidepuzzle_history_loyd_p1: "谜题作家萨姆·劳埃德从1891年直到1911年去世，一直声称是他发明了推盘。这没有任何证据：他与推盘的发明和最初的流行都没有关系。",
    slidepuzzle_history_math_title: "一半无解",
    slidepuzzle_history_math_p1: "早在1879年，数学家W. W. 约翰逊和W. E. 斯托里就证明了：把方块放进盒子的所有摆法中，只有一半有解，其余的永远排不好。所以PaperGames总是用真实的步骤打乱每一道题。"
});
I18n.markTextLoaded("zh");
