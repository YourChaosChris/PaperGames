// text/zh/shapesort.js
// Rules and history texts of shapesort (zh). Loaded by shapesort-rules.html and shapesort-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    shapesort_rules_title: "形状分类规则",
    shapesort_rules_intro: "用形状代替颜色的分类谜题：移动石子，直到每根试管里只剩一种形状。",
    shapesort_rules_basics_title: "规则",
    shapesort_term_tubes: "试管",
    shapesort_rules_tubes: "每根试管能装的石子数在“每管石子数”中选择:4、6、8或10。开始时石子是混在一起的,有两根试管是空的。",
    shapesort_term_move: "一步",
    shapesort_rules_move: "点一根试管：它最上面的石子会被标出，连同正下方相同形状的石子。然后点另一根试管。如果那根试管是空的，或者最上面是相同形状，石子就移过去——能放多少放多少。再点一次被标出的试管，就把石子放回去。",
    shapesort_term_goal: "目标",
    shapesort_rules_goal: "当每根试管要么是空的、要么装满同一种形状的石子时,谜题就解开了。",
    shapesort_term_shapes: "形状",
    shapesort_rules_shapes: "圆形、正方形、三角形、星形、心形、十字、菱形和月亮。它们靠轮廓区分；有的是实心的，有的只画轮廓，但那只是额外的帮助。",
    shapesort_term_levels: "难度",
    shapesort_rules_levels: "简单:4种形状,6根试管。中等:6种形状,8根试管。困难:8种形状,10根试管。每管石子数另外选择;石子越多,形状越小,试管越高。在较窄的屏幕上,试管分几排显示。",
    shapesort_term_tools: "撤销、重新洗牌、提示",
    shapesort_rules_tools: "“撤销”可以撤回任意多步。“重新洗牌”会发一道新谜题。“提示”会标出两根试管：把第一根最上面的石子移到第二根。每道谜题都检查过可以解开；如果你卡住了，提示会告诉你，你可以撤销几步。",
    shapesort_rules_example_title: "例子",
    shapesort_rules_example: "图中是游戏进行中的试管。第一根试管上面被标出的石子，可以移到最上面是相同形状的试管，或者移进空试管。",
    shapesort_history_title: "分类谜题的历史",
    shapesort_history_origins_title: "物件、柱子和规则",
    shapesort_history_origins_p1: "按固定规则在容器之间移动物件的谜题由来已久。法国数学家爱德华·卢卡斯在1883年发表的汉诺塔中，圆盘要一个一个地在三根柱子之间移动，大圆盘永远不能放在小圆盘上。",
    shapesort_history_sort_title: "按种类分开",
    shapesort_history_sort_p1: "近年来出现了许多这样的谜题：把混在一起的物件在容器之间移动，直到每个容器里只有一种——大多是手机游戏，而且几乎都用颜色。黑白电子墨水屏上颜色行不通，所以PaperGames改用形状来分类。",
    shapesort_history_modern_title: "PaperGames如何生成每道题",
    shapesort_history_modern_p1: "这里的每道题都是随机发出的。然后由求解程序寻找把它完全分好类的方法；只有找到方法的发牌才会被采用，而且开始时没有已经完成的试管。提示也由同一个求解程序给出。"
});
I18n.markTextLoaded("zh");
