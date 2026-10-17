// text/zh/futoshiki.js
// Rules and history texts of futoshiki (zh). Loaded by futoshiki-rules.html and futoshiki-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    futoshiki_rules_title: "不等式数独规则",
    futoshiki_rules_intro: "PaperGames中不等式数独玩法的简明说明。这是一种来自日本的不等式谜题。",
    futoshiki_rules_basics_title: "基本玩法",
    futoshiki_term_grid: "方格",
    futoshiki_rules_grid: "方格有4 x 4、5 x 5或6 x 6个格子。在其中填入从1到方格边长的数字，使每个数字在每一行恰好出现一次，在每一列也恰好出现一次。",
    futoshiki_term_signs: "符号",
    futoshiki_rules_signs: "有些相邻格子之间有一个小三角形。它的作用就像小于号：窄的尖端指向数字较小的格子，宽的一端指向数字较大的格子。在完成的方格中，每个符号都必须成立。",
    futoshiki_term_givens: "已给数字",
    futoshiki_rules_givens: "有些题目开始时已经填好几个数字，以粗体显示；很多题目一个也没有。已给数字不能更改。",
    futoshiki_term_unique: "唯一解",
    futoshiki_rules_unique: "每道题都是新生成的，并经过检查，确保只有唯一解，而且无需猜测就能一步步找到。",
    futoshiki_rules_play_title: "游戏操作",
    futoshiki_term_entering: "输入数字",
    futoshiki_rules_entering: "选择一个格子，然后在方格下方选一个数字。“擦除”清空选中的格子，“撤销”收回你上一次的输入。在同行或同列中重复的数字，或者违反某个符号的两个数字，会以反色显示。",
    futoshiki_term_hint: "提示",
    futoshiki_rules_hint: "“提示”分三次按下显示下一步：第一次标出一个格子，第二次给出理由，第三次填入数字。它从不猜测。使用提示取得的胜利会在统计中单独计数。",
    futoshiki_term_daily: "每日挑战和打印",
    futoshiki_rules_daily: "每日挑战是一道5 x 5的题目，同一天对所有人都相同。“打印”会把空白题目放在一张A4纸上，供你在纸上解答。",
    futoshiki_rules_end_title: "完成一局",
    futoshiki_term_win: "已解出",
    futoshiki_rules_win: "当每个格子都已填满、任何行或列中都没有重复数字，并且每个符号都成立时，题目就解出了。",
    futoshiki_history_title: "不等式数独的历史",
    futoshiki_history_name_title: "名字说明一切",
    futoshiki_history_name_p1: "Futoshiki（不等式）在日语中就是“不等式”的意思。这种谜题在拉丁方阵上进行——也就是没有宫的数独方格，或没有笼子的Calcudoku方格——唯一额外的线索就是格子之间的符号。",
    futoshiki_history_spread_title: "从日本走进报纸",
    futoshiki_history_spread_p1: "和许多同类数字谜题一样，它最先在日本为人所知。在2000年代中期的数独热潮之后，其他地方的报纸和谜题杂志也开始刊登它。",
    futoshiki_history_modern_title: "在PaperGames上",
    futoshiki_history_modern_p1: "这里的每道题都在你的设备上生成，并经过检查，确保只有唯一解，而且无需猜测就能解出。符号画成小三角形，而不是输入的字符，这样在电子墨水屏上也能保持又大又清晰。"
});
I18n.markTextLoaded("zh");
