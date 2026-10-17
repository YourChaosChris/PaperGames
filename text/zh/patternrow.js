// text/zh/patternrow.js
// Rules and history texts of patternrow (zh). Loaded by patternrow-rules.html and patternrow-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    patternrow_rules_title: "找规律规则",
    patternrow_rules_intro: "一排图形按某种规律排列。点一下下一个应该出现的图形。",
    patternrow_rules_basics_title: "规则",
    patternrow_term_goal: "目标",
    patternrow_rules_goal: "每局有 6 排。每一排里，几个图形不断重复，最后一格是空的。点一下应该放在那里的图形，然后点“下一个”进入下一排。",
    patternrow_term_answer: "对与错",
    patternrow_rules_answer: "选对的图形会移到空格里。选错的图形会被划掉，可以再试另一个。没有时间限制，只会记录错误的次数。",
    patternrow_term_levels: "难度",
    patternrow_rules_levels: "简单：两种图形，重复的小组很短，有三个答案。中等：最多三种图形，重复的小组更长，有四个答案。困难：图形的形状和填充（实心或空心）各自按自己的规律同时变化。",
    patternrow_term_hint: "提示",
    patternrow_rules_hint: "提示会标出正确的图形。用过提示的一局同样算作完成。",
    patternrow_rules_example_title: "例子",
    patternrow_rules_example: "这一排里圆形和正方形轮流出现。最后一个是圆形，所以下一个是正方形。",
    patternrow_history_title: "图案排的历史",
    patternrow_history_craft_title: "边饰与带状纹样",
    patternrow_history_craft_p1: "在许多文化和许多时代，重复符号组成的带状纹样环绕在陶罐上、织物边缘和古建筑的墙壁上。织或画这样一条纹样的人，必须知道下一个是什么。",
    patternrow_history_tests_title: "在学校和测验中",
    patternrow_history_tests_p1: "把一排接着排下去，是儿童练习册和智力测验里的经典题型。例如约翰·C·瑞文在 20 世纪 30 年代末发表了他的“渐进矩阵”，要求找出图案中缺少的那一块。",
    patternrow_history_modern_title: "PaperGames 如何生成每一排",
    patternrow_history_modern_p1: "每一排都由一个至少展示两遍的短小图形组构成。程序随后检查是否没有别的图形组会在空格里放入不同的图形，因此每一排都恰好只有一个正确答案。"
});
I18n.markTextLoaded("zh");
