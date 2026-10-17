// text/zh/shadowmatch.js
// Rules and history texts of shadowmatch (zh). Loaded by shadowmatch-rules.html and shadowmatch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    shadowmatch_rules_title: "这是谁的影子？规则",
    shadowmatch_rules_intro: "屏幕上会出现一幅图画和几个黑色影子。点一下属于这幅图的影子。",
    shadowmatch_rules_basics_title: "规则",
    shadowmatch_term_goal: "目标",
    shadowmatch_rules_goal: "每局有 6 幅图。每幅图下面有几个黑色影子，其中恰好有一个与图画轮廓相同。点一下它，然后点“下一个”进入下一幅图。",
    shadowmatch_term_answer: "对与错",
    shadowmatch_rules_answer: "选对的影子会出现双层边框。选错的影子会被划掉，可以再试另一个。没有时间限制，只会记录错误的次数。",
    shadowmatch_term_levels: "难度",
    shadowmatch_rules_levels: "简单：三个影子，对应外形差别很大的东西。中等：四个影子，对应同一类东西，例如四种动物。困难：四个影子，其中两个是同一幅图的镜像、倒置或横放。",
    shadowmatch_term_hint: "提示",
    shadowmatch_rules_hint: "提示会标出正确的影子。用过提示的一局同样算作完成。",
    shadowmatch_rules_example_title: "例子",
    shadowmatch_rules_example: "图画是一个带光芒的太阳。它的影子是带光芒的圆形黑块，而不是那个黑色方块。",
    shadowmatch_history_title: "影子图案的历史",
    shadowmatch_history_art_title: "剪影与皮影戏",
    shadowmatch_history_art_p1: "用黑纸剪出的人物轮廓叫作“剪影”（silhouette），这个词在 18 世纪的法国成为此类肖像的常用说法。把平面人偶举在光前表演的影子戏更为古老，在亚洲和欧洲都有流传。",
    shadowmatch_history_school_title: "仔细观察",
    shadowmatch_history_school_p1: "儿童练习册里常有“哪个影子属于哪幅图”的题目。要回答，就要比较轮廓，并发现细小的差别：尾巴在哪里、朝向哪一边、是不是倒过来了。",
    shadowmatch_history_modern_title: "PaperGames 如何生成每一轮",
    shadowmatch_history_modern_p1: "二十幅图画都是为 PaperGames 绘制的。影子就是同一幅画填成纯黑，所以总能与原图完全吻合。错误的影子来自别的图画，或来自旋转后的同一幅图，程序还会确保同一轮里没有两个相同的影子。"
});
I18n.markTextLoaded("zh");
