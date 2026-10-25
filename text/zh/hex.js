// text/zh/hex.js
// Rules and history texts of hex (zh). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    hex_rules_title: "六贯棋规则",
    hex_rules_intro: "关于 PaperGames 如何演绎六贯棋的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    hex_rules_basics_title: "基本玩法",
    hex_term_setup: "初始设置",
    hex_rules_setup: "棋盘是由六边形格子组成的菱形。红方拥有上下两条边，蓝方拥有左右两条边。红方先行。",
    hex_term_moving: "走一步棋",
    hex_rules_moving: "轮到你时，在任意一个空格上放置一枚己方颜色的棋子——没有吃子这回事，棋子一旦放下便不再移动。",
    hex_term_swap: "交换规则",
    hex_rules_swap: "先手有优势，因此除非你在开局前关闭，交换规则默认开启。红方下第一颗棋子后，蓝方可以不落子而点“交换”：双方互换颜色，第一颗棋子归原来的蓝方，另一方改执蓝继续。红方仍连接上下两边，蓝方仍连接左右两边。当第一颗棋子位于棋盘中部时，电脑会选择交换。",
    hex_term_win: "获胜",
    hex_rules_win: "用己方棋子连出一条不间断的链条，连通你所属的两条边。六贯棋永远不可能以和棋收场：一旦棋盘被下满，必定会有一方的链条已经形成，无论双方是否真的在尝试阻挡对方。",
    hex_rules_end_title: "策略小贴士",
    hex_term_blocking: "进攻与防守其实是同一步棋",
    hex_rules_blocking: "既然和棋是不可能的，那么阻断对手的连接与搭建自己的连接，其实就是同一件事的两面——一个能帮你连成一线的格子，往往同时也能斩断对方的连接。",
    hex_history_title: "六贯棋的历史",
    hex_history_origins_title: "两次发明",
    hex_history_origins_p1: "六贯棋最早由丹麦数学家、诗人兼设计师皮特·海因（Piet Hein）于 1942 年发明，他在丹麦以“Polygon”之名将其公之于世，缘起于他对“一款四色地图式的游戏是否可能永远不会以和棋收场”这一问题的思考。",
    hex_history_origins_p2: "1948 年，数学家约翰·纳什（John Nash）——后来的诺贝尔经济学奖得主，电影《美丽心灵》的原型人物——在普林斯顿大学读研究生期间，独立地重新发明了这款游戏。当时学生们在铺着六边形瓷砖的浴室地板上下这款棋，称之为“纳什棋”。",
    hex_history_origins_p3: "1957 年，马丁·加德纳（Martin Gardner）在《科学美国人》杂志的“数学游戏”专栏中撰文介绍了这款游戏，为它取名“Hex”，这个名字自此沿用至今。",
    hex_history_math_title: "数学家钟爱的对象",
    hex_history_math_p1: "六贯棋是博弈论与拓扑学中备受青睐的研究对象，原因在于一个简洁而可证明的事实：这款游戏永远不可能以和棋收场——这是与布劳威尔不动点定理背后同一套数学原理相关的结论——由此还可以通过“策略窃取”论证证明，先手方必定拥有必胜策略，尽管对于更大的棋盘，至今没有人知道这个必胜策略具体是什么。",
    hex_history_math_p2: "随着棋盘变大，要完全解开六贯棋会急剧变难：较小的棋盘（最大约到 10x10）已经被计算机搜索彻底解开，但标准的 11x11 锦标赛尺寸及更大的棋盘至今仍未被解开，这也让六贯棋持续成为游戏人工智能研究与组合博弈论共同关注的目标。",
    hex_history_version_title: "本应用的版本",
    hex_history_version_p1: "PaperGames 采用 9x9 的棋盘，这一尺寸能让对局明显更快结束，同时依然给连接策略和阻挡策略留下真正施展的空间。"
});
I18n.markTextLoaded("zh");
