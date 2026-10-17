// text/zh/steckwuerfeln.js
// Rules and history texts of steckwuerfeln (zh). Loaded by steckwuerfeln-rules.html and steckwuerfeln-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sw_rules_title: "Steckwürfeln 规则",
    sw_rules_intro: "掷两个骰子，把销插进 2 到 12 号孔；分数最少者获胜。",
    sw_rules_basics_title: "规则",
    sw_term_holes: "孔",
    sw_rules_holes: "共有十一个孔，编号 2 到 12。每个回合开始时，所有孔里都没有销。",
    sw_term_turn: "回合",
    sw_rules_turn: "掷两个骰子。可以把一枚销插进点数之和的孔，或把两枚销分别插进两个单独点数的孔——掷出 2 和 4 时，可以插 6 号孔，或 2 号和 4 号孔。一个孔只能插一枚销。两个骰子点数相同时（3 和 3）只能用和，而且没有 1 号孔。",
    sw_term_go_on: "继续",
    sw_rules_go_on: "只要还能插销，就继续掷骰和插销。掷出无法插的点数时，回合结束：把空着的孔的编号加起来，就是你的分数。",
    sw_term_sixes: "双六",
    sw_rules_sixes: "双六是百搭，具体含义由玩家约定。这里可以选择：再掷一次（什么都不插）、回合立即结束，或者没有特殊规则——这时 6 和 6 就像其他点数之和一样插进 12 号孔。",
    sw_term_win: "获胜",
    sw_rules_win: "进行完所选回合数后，总分最少者获胜；分数相同则为平局。十一个孔全部插满得 0 分，并立即获胜。",
    sw_term_shared: "共用板",
    sw_rules_shared: "在这个变体中，所有玩家共用一块板，每次轮到时只掷一次。插不下的人出局，最后留下的人获胜。",
    sw_term_computer: "电脑",
    sw_rules_computer: "在自己的板上，它会尽量让以后更多的点数仍然可以插。在共用板上则相反：尽量让下一位玩家能插的点数更少。",
    sw_term_help: "帮助",
    sw_rules_help: "“撤销”可以收回上一枚销。没有时间限制。",
    sw_history_title: "Steckwürfeln 的历史",
    sw_history_old_title: "小木制游戏",
    sw_history_old_p1: "带编号孔的板、散放的销钉和两个骰子：这类游戏被做成木制袖珍小游戏，作为适合儿童和成人的简单骰子游戏出售。好几家厂商以自己的名字出售类似的版本。规则非常简单，是在玩的过程中传下来的，所以细节各不相同——例如双六代表什么，或者大家是否共用一块板。",
    sw_history_version_title: "本版本",
    sw_history_version_p1: "Steckwürfeln 遵循通行的规则：2 到 12 号孔，每次掷骰插一枚或两枚销，空着的孔就是分数。双六、回合数和共用板都可以选择。名称和插图都是我们自己的。"
});
I18n.markTextLoaded("zh");
