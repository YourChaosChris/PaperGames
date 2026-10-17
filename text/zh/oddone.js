// text/zh/oddone.js
// Rules and history texts of oddone (zh). Loaded by oddone-rules.html and oddone-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    oddone_rules_title: "哪个不一样规则",
    oddone_rules_intro: "几张卡片在某一方面相同，只有一张例外。点一下不属于这一组的那张。",
    oddone_rules_basics_title: "规则",
    oddone_term_goal: "目标",
    oddone_rules_goal: "每局有 6 轮。每一轮会出现几张卡片。除一张外，其余都有共同点：属于同一类事物，或者形状相同、填充相同、图形个数相同。点一下那张不一样的卡片，然后点“下一个”。",
    oddone_term_answer: "对与错",
    oddone_rules_answer: "选对的卡片会出现双层边框。选错的卡片会被划掉，可以再试另一张。没有时间限制，只会记录错误的次数。",
    oddone_term_levels: "难度",
    oddone_rules_levels: "简单：四幅图画，其中三幅属于同一类（动物、交通工具、植物或家里的东西）。中等：五张卡片；有的轮次是图画，有的是在某个特征上不同的图形，同时另一个特征在卡片之间变化。困难：六张卡片，有两个特征在卡片之间变化，要找出除一张外都相同的那个特征。",
    oddone_term_hint: "提示",
    oddone_rules_hint: "提示会标出那张不一样的卡片。用过提示的一局同样算作完成。",
    oddone_rules_example_title: "例子",
    oddone_rules_example: "三个圆形和一个正方形：正方形不一样，因为其余的都是圆形。",
    oddone_history_title: "“找不同类”题的历史",
    oddone_history_sort_title: "分类与归组",
    oddone_history_sort_p1: "按共同特征把东西分组，是孩子最早练习的思维方式之一：这边是动物，那边是工具，圆的东西和有棱角的东西。图画书、幼儿园游戏和练习册早就在让孩子说出那个不属于本组的东西。",
    oddone_history_clear_title: "只有一个明确的答案",
    oddone_history_clear_p1: "在做得不好的题目里，好几张卡片都可以各自因不同原因被称为“不一样的那张”，孩子们提出异议是有道理的。好题目的规则是隐藏的，答案却是确定的：只有一张卡片在某个特征上与其余所有卡片都不同。",
    oddone_history_modern_title: "PaperGames 如何生成每一轮",
    oddone_history_modern_p1: "分组轮从二十幅图画的某一组中取卡片，再加一张来自别组的；图形轮则用形状、填充和个数来构造卡片。每一轮在使用前，程序会检查是否恰好只有一张卡片可以算作“不一样的”，所以只有一个正确答案。"
});
I18n.markTextLoaded("zh");
