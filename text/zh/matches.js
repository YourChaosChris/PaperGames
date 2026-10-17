// text/zh/matches.js
// Rules and history texts of matches (zh). Loaded by matches-rules.html and matches-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    mt_rules_title: "火柴谜题规则",
    mt_rules_intro: "移动一两根火柴，让算式成立或摆出正方形。",
    mt_rules_basics_title: "规则",
    mt_term_move: "移动",
    mt_rules_move: "点一根火柴：你把它拿了起来，虚线框会显示它原来的位置。再点一个空位（点线）把它放下；点它原来的位置就放回去。火柴上方会显示有几根已经不在开始的位置。",
    mt_term_sums: "算式",
    mt_rules_sums: "数字像电子钟一样由火柴组成。符号有两个位置：两根都在是加号，只有横的那根是减号。最后每个数字和符号都必须是有效的形状，而且算式要成立。两位或更多位的数不以0开头。",
    mt_term_squares: "正方形",
    mt_rules_squares: "图形由小正方形组成。按题目要求摆出正好那么多个小正方形；每根火柴都必须属于至少一个小正方形——不能有散落的火柴。",
    mt_term_levels: "难度",
    mt_rules_levels: "简单：一位数的算式，移1根；正方形移1根或2根。中等：有两位数的算式，移1根；正方形移2根。困难：算式移2根；正方形移2根，最多两种解法。每个难度30道题；电脑检验过，每道题都正好用这么多根火柴就能解开，用更少则不行。解开的题目在列表中会打勾。",
    mt_term_help: "提示",
    mt_rules_help: "“提示”会标出一根火柴和它该去的位置。“撤销”收回上一步；“重新开始”把所有火柴放回原处。",
    mt_rules_example_title: "例子",
    mt_rules_example: "移动1根火柴：9 + 3 = 6 是错的。拿走9右上方的火柴——它变成5——放到6上，6就变成8：5 + 3 = 8。",
    mt_history_title: "火柴谜题的历史",
    mt_history_matches_title: "从摩擦火柴到安全火柴",
    mt_history_matches_p1: "最早的摩擦火柴是英国化学家约翰·沃克在1826年制作的；他从未申请专利。这种火柴太容易点着。只能在火柴盒侧面的擦皮上点燃的安全火柴来自瑞典：古斯塔夫·帕施在1844年提出单独的擦皮，约翰·爱德华·伦德斯特伦在1855年为安全火柴取得专利，并在延雪平大量生产。",
    mt_history_puzzles_title: "作为谜题的火柴",
    mt_history_puzzles_p1: "火柴便宜，家家都有，很快就成了谜题材料。霍夫曼教授（Professor Hoffmann，安杰洛·约翰·刘易斯的笔名）在1893年于伦敦出版的《Puzzles Old and New》中为火柴专门写了一整章“Puzzles with Lucifer Matches”。电子钟样式的火柴算式是较新的形式，出现在这种显示方式普及之后。这里的90道题是电脑为PaperGames找出来的。"
});
I18n.markTextLoaded("zh");
