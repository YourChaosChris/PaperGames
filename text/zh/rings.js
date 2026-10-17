// text/zh/rings.js
// Rules and history texts of rings (zh). Loaded by rings-rules.html and rings-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    rg_rules_title: "转动圆环规则",
    rg_rules_intro: "转动圆环，直到每条射线上只有一种图形。",
    rg_rules_basics_title: "规则",
    rg_term_rings: "圆环",
    rg_rules_rings: "三到五个圆环一个套一个，从里到外编号。每个圆环有8格，每格一个图形：圆、圆圈、三角形、正方形、星形、菱形、十字或月牙。实心和空心的图形不用颜色也能分辨。",
    rg_term_turn: "转动",
    rg_rules_turn: "图下方每个圆环都有两个按钮：↺ 把它向左（逆时针）转一格，↻ 向右（顺时针）转一格。圆环会立刻跳到新位置。",
    rg_term_goal: "目标",
    rg_rules_goal: "虚线把图分成从中心向外的8条射线。当每条射线在所有圆环上都是同一种图形时，谜题就解开了。不同的射线可以是不同的图形。",
    rg_term_coupled: "联动圆环",
    rg_rules_coupled: "困难模式下圆环是联动的：转动一个圆环时，外侧的下一个圆环也会朝同一方向转一格。最外面的圆环单独转动。",
    rg_term_levels: "难度",
    rg_rules_levels: "简单：3个圆环，4种图形，3到5步。中等：4个圆环，6种图形，5到8步。困难：5个联动圆环，8种图形，7到11步。电脑会为每道题算出最少步数，从一开始就显示出来。",
    rg_term_help: "提示",
    rg_rules_help: "“提示”会框出一步能让你离答案更近一步的按钮。“撤销”收回上一步；这也算一步。",
    rg_rules_example_title: "例子",
    rg_rules_example: "圆环2比圆环1多转了一格。把圆环2向左转一次，每条射线上就都是同一种图形了。",
    rg_history_title: "转动圆环的历史",
    rg_history_disk_title: "阿尔伯蒂的密码盘",
    rg_history_disk_p1: "1467年，意大利学者莱昂·巴蒂斯塔·阿尔伯蒂在他关于密码的论著中描述了一个由销钉连起来的双环圆盘：外环固定，写着字母；内环可以转动，写着其他符号。转动内环，每个字母就对应到另一个符号。它被认为是使用多套字母表的密码的第一个例子。",
    rg_history_game_title: "作为谜题的圆环",
    rg_history_game_p1: "转动带图案的圆环或圆盘，直到全部对齐，这样的谜题如今有许多形式，有玩具，也出现在谜题书里。这里的版本最多有五个圆环，困难模式下圆环还会带着邻居一起转，是为PaperGames制作的。电脑会检查每道题并算出最少步数。"
});
I18n.markTextLoaded("zh");
