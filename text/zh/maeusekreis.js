// text/zh/maeusekreis.js
// Rules and history texts of maeusekreis (zh). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    maeusekreis_rules_title: "鼠圈规则",
    maeusekreis_rules_intro: "猫和老鼠在一个由点组成的圆圈上追逐。老鼠只能沿圆圈移动，猫还可以沿直线穿过圆圈。猫能在步数用完前抓到老鼠吗？",
    maeusekreis_rules_basics_title: "规则",
    maeusekreis_term_board: "棋盘",
    maeusekreis_rules_board: "这些点围成一个圆，每个点都和左右相邻的点相连。几条虚线穿过圆圈。简单模式有8个点，中等有10个，困难有12个。猫和老鼠从随机点出发，彼此至少相隔三个点。",
    maeusekreis_term_moves: "移动",
    maeusekreis_rules_moves: "老鼠先走，然后是猫，依次轮流。每回合棋子移动一步，到相邻的点；不能停在原地。老鼠只能沿圆圈走。猫可以沿圆圈或虚线走。老鼠不能走到猫所在的点。点按标记的点即可移动到那里。",
    maeusekreis_term_end: "被抓住或逃脱",
    maeusekreis_rules_end: "猫走到老鼠所在的点时，就抓住老鼠并获胜。没人会受伤，游戏只是结束。猫的步数固定，显示在棋盘上方。如果猫用完步数时老鼠仍然自由，老鼠就逃脱并获胜。",
    maeusekreis_term_steps: "步数有多少",
    maeusekreis_rules_steps: "每种起始位置的步数都会单独计算。双人游戏中，如果你扮演猫，猫的步数刚好够抓住老鼠，但一步也不能浪费。如果你和电脑对战并扮演老鼠，猫会少一步，谨慎的老鼠就有机会逃走。",
    maeusekreis_term_computer: "电脑",
    maeusekreis_rules_computer: "和电脑对战时选择猫或老鼠。简单模式常犯错，中等模式会犯几次，困难模式不会犯错。提示按钮会显示最佳走法，撤销可以收回你上一步。",
    maeusekreis_history_title: "鼠圈的历史",
    maeusekreis_history_origins_title: "古老的追逐游戏",
    maeusekreis_history_origins_p1: "一方追捕、另一方逃跑的游戏在许多国家都很常见。在欧洲，狐狸与鹅这种在线和点组成的棋盘上玩的游戏已有数百年历史，亚洲也有类似的狩猎游戏。一方力量强，另一方则靠数量或空间周旋。",
    maeusekreis_history_maths_title: "点与线上的追逐",
    maeusekreis_history_maths_p1: "从20世纪70年代末开始，数学家研究点和线组成的网络上的追逐：在什么样的网络中，追捕者总能抓到逃跑者？这种游戏常叫作警察与强盗。在简单的圆圈上，逃跑者总能逃脱；穿过圆圈的捷径会改变结果。",
    maeusekreis_history_here_title: "这里的鼠圈",
    maeusekreis_history_here_p1: "猫和老鼠在圆圈上追逐的点子来自一位玩家。PaperGames有自己的规则：老鼠沿圆圈走，猫可以抄近路；程序会搜索所有位置来确定猫的步数。"
});
I18n.markTextLoaded("zh");
