// text/zh/catplaces.js
// Rules and history texts of catplaces (zh). Loaded by catplaces-rules.html and catplaces-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    kz_rules_title: "猫咪的位置规则",
    kz_rules_intro: "猫咪的位置是一种逻辑谜题：为每只猫找到唯一正确的位置。一切都能一步步推出来，从不需要猜。",
    kz_rules_basics_title: "规则",
    kz_term_place: "每行、每列、每个房间各一只",
    kz_rules_place: "盘面的行数和列数等于房间数：5、7或8。每一行、每一列和每个房间（由粗线围成）里恰好有一只猫。",
    kz_term_touch: "不能相邻",
    kz_rules_touch: "两只猫永远不能相邻：不能左右并排，不能上下相连，也不能角碰角。一只猫周围的八个格子都保持空着。",
    kz_term_play: "玩法",
    kz_rules_play: "点一下格子放一只猫，点第二下放一个点（提醒自己这里没有猫），点第三下清空格子。违反规则的猫会被加上虚线框。",
    kz_term_levels: "难度",
    kz_rules_levels: "简单：5×5，中等：7×7，困难：8×8。简单只需逐一查看行、列和房间；中等还需要提前想一只猫，困难需要把几个房间和几行放在一起比较。",
    kz_term_help: "帮助",
    kz_rules_help: "“撤销”收回你最后一次点击。“提示”会框出放错的猫，或者一个应该放猫的格子。没有时间限制。",
    kz_rules_example_title: "示例",
    kz_rules_example: "一个有四个房间的小盘面：每一行、每一列和每个房间都有一只猫，没有两只猫相邻，连角也不碰。",
    kz_history_title: "猫咪的位置的历史",
    kz_history_genre_title: "2003年的谜题",
    kz_history_genre_p1: "在谜题爱好者中，这类谜题被称为“Star Battle”。荷兰谜题作者汉斯·恩德巴克为2003年在荷兰举行的世界谜题锦标赛设计了它。此后它以许多名字出现在谜题杂志、报纸和应用中，常见的是在更大的盘面上每行、每列和每个区域各放两颗星。",
    kz_history_cats_title: "为什么是猫？",
    kz_history_cats_p1: "猫咪的位置采用最简单的形式：每行、每列、每个房间各一只。这里没有星星，而是睡觉的猫：每只猫都想要自己的位置，也不想碰到邻居。图画是专门为这个游戏画的。"
});
I18n.markTextLoaded("zh");
