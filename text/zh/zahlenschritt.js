// text/zh/zahlenschritt.js
// Rules and history texts of zahlenschritt (zh). Loaded by zahlenschritt-rules.html and zahlenschritt-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    zahlenschritt_rules_title: "数字一步规则",
    zahlenschritt_rules_intro: "每一方在自己纸上的中间一列写下数字，然后翻牌。一张牌只能写在相邻数字旁：左边小一，右边大一。先填满所有格子的人获胜。",
    zahlenschritt_rules_basics_title: "规则",
    zahlenschritt_term_sheet: "你的纸",
    zahlenschritt_rules_sheet: "每一方有一张纸，每行三个格子。开局前，每一方在中间一列写下相同数量的数字：简单为 0 到 5 的 4 个数字，中等为 0 到 9 的 7 个数字，困难为 0 到 15 的 10 个数字。数字可以重复使用。黑方先写。点一个数字；“随机数字”填满其余部分，“撤销”收回最后一个数字。",
    zahlenschritt_term_cards: "牌",
    zahlenschritt_rules_cards: "牌堆里每个数字有四张牌。轮到你时，抽最上面的一张。比某个中间数字小一的牌放进那一行的左格；大一的牌放进右格。如果有几个格子合适，点你想要的那个。如果没有合适的格子，这张牌作废，轮到另一方。牌堆抽完后重新洗牌。",
    zahlenschritt_term_edge: "边缘",
    zahlenschritt_rules_edge: "永远填不上的格子（0 的左边，或最大数字的右边）从一开始就算已填。因此中间数字在边缘时只需要一张牌。",
    zahlenschritt_term_win: "获胜",
    zahlenschritt_rules_win: "先把自己纸上所有格子填满的人获胜。黑方翻第一张牌。",
    zahlenschritt_term_computer: "电脑",
    zahlenschritt_rules_computer: "写入时几乎没有选择，所以实力体现在中间一列。简单随机选数字，中等从两个随机数字中取更好的，困难选需要牌少且需求分布均匀的数字。提示按钮显示困难会怎么做。",
    zahlenschritt_history_title: "数字一步的历史",
    zahlenschritt_history_origins_title: "在纸上想出来的",
    zahlenschritt_history_origins_p1: "简单的纸上数字游戏常常是孩子们在桌边想出来的：几列、一叠数字牌，以及牌只能写在合适位置的规则。这类相邻数字游戏在课堂上也有许多版本，这个想法不属于任何人。",
    zahlenschritt_history_here_title: "这里的数字一步",
    zahlenschritt_history_here_p1: "PaperGames 把这样的纸上游戏做成一人或两人的游戏。数字保持很小，一局不需要计时，三个难度改变一张纸上有多少个数字。"
});
I18n.markTextLoaded("zh");
