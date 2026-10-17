// text/zh/tangram.js
// Rules and history texts of tangram (zh). Loaded by tangram-rules.html and tangram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    tg_rules_title: "七巧板规则",
    tg_rules_intro: "用七块拼板填满一个轮廓。",
    tg_rules_basics_title: "规则",
    tg_term_pieces: "拼板",
    tg_rules_pieces: "两个大三角形、一个中三角形、两个小三角形、一个正方形和一个平行四边形——合起来是一个正方形。每块拼板都有自己的黑白花纹。",
    tg_term_lay: "摆放",
    tg_rules_lay: "在轮廓下方选一块拼板，然后点它该去的位置：它会卡进最近的、完全在轮廓内且不压在别的拼板上的位置。点已放的拼板可以重新拿起。不需要拖动。",
    tg_term_turn: "转动",
    tg_rules_turn: "“转45°”把手里的拼板转八分之一圈；“翻转”把它镜像翻过来（只对平行四边形有意义）。这里所有轮廓都在网格上，所以转了45度或135度的拼板哪里都放不进——再转一次。",
    tg_term_levels: "难度",
    tg_rules_levels: "简单：20个有很多解法的轮廓；细线会显示其中一种。中等：20个没有线的轮廓。困难：21个只有一种或几种解法的轮廓。电脑检验过每个轮廓：七块拼板都能放进去。",
    tg_term_outline: "只有轮廓",
    tg_rules_outline: "29个新轮廓：数字、字母、动物、人物、房子和船。只画出外线——里面没有任何线——拼板会留在你点的地方，即使放不进去或伸出外面。不断尝试，直到填满整个轮廓；每个轮廓都有经电脑验证的解法。",
    tg_term_help: "提示",
    tg_rules_help: "“提示”会把一块拼板放到电脑解法中的位置；挡路的拼板会回到轮廓下方。解开的轮廓在列表中会打勾。",
    tg_rules_example_title: "例子",
    tg_rules_example: "房子：两个大三角形组成屋顶，其余五块拼板填满墙壁。",
    tg_history_title: "七巧板的历史",
    tg_history_china_title: "七块巧板",
    tg_history_china_p1: "在中国，这个谜题叫“七巧板”。发明者已不可考；现存最早的七巧板图谱于1813年在中国印行。拼板由一个正方形切成，每个图形——人物、动物、物品或符号——都要用上全部七块。",
    tg_history_west_title: "风靡西方",
    tg_history_west_p1: "1816年，中国的七巧板书籍随船到达费城；1817年，伦敦出版了《The Fashionable Chinese Puzzle》。1817年和1818年，这个谜题在英国、法国、丹麦等国风靡一时。“tangram”一词最早见于1848年美国人托马斯·希尔的一本书。这里的轮廓是为PaperGames绘制的。"
});
I18n.markTextLoaded("zh");
