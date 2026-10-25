// text/zh/nim.js
// Rules and history texts of nim (zh). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    nim_rules_title: "尼姆游戏规则",
    nim_rules_intro: "两名玩家轮流从几堆石子中拿石子。按普通规则，拿到最后一颗石子的人获胜。",
    nim_rules_basics_title: "规则",
    nim_term_move: "一步",
    nim_rules_move: "选一行，从中拿任意多颗石子，至少一颗。点你想拿到的那颗石子：它和右边所有石子都会打上叉。然后点“拿走石子”。",
    nim_term_end: "结束",
    nim_rules_end: "普通规则：拿最后一颗石子的人赢。反常规则：拿最后一颗石子的人输。",
    nim_term_heaps: "石堆",
    nim_rules_heaps: "3、4、5颗（默认），经典的1、3、5、7颗，或随机石堆（3或4堆，每堆1到7颗）。",
    nim_term_secret: "必胜规律",
    nim_rules_secret: "把每堆的数量写成二进制，按列相加但不进位（异或），结果就是尼姆和。如果它为0，在对方完美应对时轮到走的一方必输；否则总有一步能让它变成0。反常规则下，前面照样这样走，直到下一步会只剩每堆一颗时——这时要留下奇数个一颗的堆。",
    nim_term_computer: "电脑",
    nim_rules_computer: "简单难度随意走一步，中等难度一半时候走最好的一步，困难难度总是走最好的一步。从必胜局面开始，困难难度无法被打败；所以石堆下面会显示开局对先手是必胜还是必败——据此决定谁先走。",
    nim_history_title: "尼姆游戏的历史",
    nim_history_origins_title: "拿石子",
    nim_history_origins_p1: "从堆里拿东西的游戏自古就有；尼姆的起源并不确定。人们常把它与中国的“捡石子”联系在一起，而欧洲最早的记载可追溯到16世纪初。",
    nim_history_bouton_title: "布顿，1901年",
    nim_history_bouton_p1: "1901年，哈佛大学的查尔斯·L·布顿发表了这个游戏的完整理论，并给它取名“尼姆”（Nim）。他从未解释这个名字；人们常认为它来自德语单词“nimm”（“拿！”）。",
    nim_history_machines_title: "尼姆机器",
    nim_history_machines_p1: "尼姆是最早由机器来玩的游戏之一：1940年纽约世界博览会上的Nimatron，以及1951年英国节上展出的费兰蒂计算机。"
});
I18n.markTextLoaded("zh");
