// text/zh/kleeberg.js
// Rules and history texts of kleeberg (zh). Loaded by kleeberg-rules.html and kleeberg-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    kb_rules_title: "Kleeberg 规则",
    kb_rules_intro: "一起搭建金字塔，率先让自己的三个符号连成一条直线。",
    kb_rules_basics_title: "基本规则",
    kb_term_board: "棋盘",
    kb_rules_board: "棋盘是五行、十五个圆形格子的金字塔：顶部一个，底部五个。一位玩家用红心，另一位用四叶草。旗子标出塔顶。",
    kb_term_turn: "轮到你时",
    kb_rules_turn: "把你的一个符号放在空格上。只能搭在两个已填满的格子上方：正下方的两个格子都已填满时，这个格子才开放。最底下一行始终开放。开放的格子带有圆圈，点按其中一个。",
    kb_term_win: "获胜",
    kb_rules_win: "最先让自己的三个符号在相邻格子上连成一条直线的人获胜。直线可以沿着一行，也可以沿着金字塔的任一条斜边。获胜的线会画成粗线。",
    kb_term_draw: "平局",
    kb_rules_draw: "如果十五个格子都已填满，而且没有人连成三子线，则为平局。",
    kb_term_start: "谁先走",
    kb_rules_start: "每局开始时随机决定谁先走，因为先手有优势。",
    kb_term_computer: "电脑",
    kb_rules_computer: "电脑能连成线时会连成线。否则会拦住你的线。再否则，它会避免打开让你能获胜的格子，并随机选择另一个开放的格子。",
    kb_term_help: "撤销",
    kb_rules_help: "“撤销”可收回你的上一步，对战电脑时也可以。",
    kb_history_title: "Kleeberg 的历史",
    kb_history_old_title: "三子连线",
    kb_history_old_p1: "两人轮流放子、想连成三个一排的游戏，很早以前就在许多地方流行，常常刻在木板上或画在纸上。它们究竟起源于何时何地，并不确定。",
    kb_history_version_title: "本版本",
    kb_history_version_p1: "Kleeberg 是我们自己的创作。金字塔棋盘、只能搭在两个已填满格子上方的规则、红心与四叶草以及文字都是我们自己的设计，不是现有游戏的复制品。"
});
I18n.markTextLoaded("zh");
