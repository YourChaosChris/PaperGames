// text/zh/klappenkasten.js
// Rules and history texts of klappenkasten (zh). Loaded by klappenkasten-rules.html and klappenkasten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    kk_rules_title: "Klappenkasten 规则",
    kk_rules_intro: "掷两个骰子，把编号加起来等于点数的翻板盖上。",
    kk_rules_basics_title: "规则",
    kk_term_flaps: "翻板",
    kk_rules_flaps: "每个回合开始时，1 到 9 号翻板都是开着的。12 块翻板的玩法是 1 到 12 号。",
    kk_term_turn: "回合",
    kk_rules_turn: "掷两个骰子。盖上与总点数相同编号的翻板，或者几块加起来等于总点数的开着的翻板——掷出 5 和 3 时，可以盖 8，或 1+7、2+6、3+5、1+2+5、1+3+4。然后再掷。",
    kk_term_one: "一个骰子",
    kk_rules_one: "当 7 号及更大的翻板都盖上后，可以只掷一个骰子，而不是两个。",
    kk_term_end: "回合结束",
    kk_rules_end: "如果没有开着的翻板能配合点数，回合就结束。还开着的翻板编号之和就是本回合的分数。下一位玩家重新从全部翻板打开开始。",
    kk_term_win: "获胜",
    kk_rules_win: "进行完所选回合数后，总分最少者获胜；分数相同则为平局。盖上全部翻板的人关上了箱子，立即获胜。",
    kk_term_computer: "电脑",
    kk_rules_computer: "它先盖上最大的翻板，并且在只掷一个骰子更容易盖板时才只掷一个。",
    kk_term_help: "帮助",
    kk_rules_help: "“撤销”可以收回上一次盖板。没有时间限制。",
    kk_history_title: "Klappenkasten 的历史",
    kk_history_old_title: "酒馆和船上的游戏",
    kk_history_old_p1: "英语国家称之为“shut the box”，是一种传统骰子游戏：一排编号翻板、两个骰子，再加一点心算。人们常把它与渔民、水手和酒馆联系起来，但它究竟起源于何时何地并没有可靠的记载。至今仍有 9 块或 12 块翻板的盒子出售，各家的规则也略有不同——例如什么时候可以只掷一个骰子。",
    kk_history_version_title: "本版本",
    kk_history_version_p1: "Klappenkasten 采用通行的规则：翻板 1 到 9 或 1 到 12，高号翻板都盖上后可以只掷一个骰子，开着的翻板就是分数。名字只是对这个游戏的德语描述；插图是为 PaperGames 绘制的。"
});
I18n.markTextLoaded("zh");
