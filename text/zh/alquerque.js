// text/zh/alquerque.js
// Rules and history texts of alquerque (zh). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    alquerque_rules_title: "阿尔盖克规则",
    alquerque_rules_intro: "简要介绍 PaperGames 中阿尔盖克（Alquerque）的玩法。这是一种跳吃游戏，记载于卡斯蒂利亚国王阿方索十世的《游戏之书》中。",
    alquerque_rules_basics_title: "基本玩法",
    alquerque_term_board: "棋盘",
    alquerque_rules_board: "棋盘上有 25 个点，排成 5x5 的网格。相邻的点在横向和纵向上相连，其中一些也沿斜线相连：斜线只经过每隔一个的点，因此四个角和中心点在全部八个方向上都相连。棋子只能沿画出的线移动。",
    alquerque_term_setup: "摆子",
    alquerque_rules_setup: "双方各有 12 枚棋子：白方（圆环）在下，黑方（实心圆片）在上。每方占满离自己最近的两行，以及中间一行中位于自己右手边的两个点。中心点留空。白方先走。",
    alquerque_term_move: "走子",
    alquerque_rules_move: "轮到你时，沿线把自己的一枚棋子移到相邻的空点：向前、向侧面或斜向前。棋子永远不能后退，斜向后也不行。向前指朝对手一侧。",
    alquerque_term_capture: "吃子",
    alquerque_rules_capture: "棋子沿一条线跳过相邻的一枚敌方棋子，落在其正后方的空点上，即可吃子。被跳过的棋子随即移出棋盘。如果同一枚棋子随后还能再跳，就在同一回合内继续跳，甚至可以改变方向。跳吃可以朝任何方向，也可以向后——这是 PaperGames 的规定，因为资料只禁止向后移动。",
    alquerque_term_forced: "强制吃子",
    alquerque_rules_forced: "能吃就必须吃：只要有吃子的机会，PaperGames 就只允许你走吃子的着法，而能继续跳吃的棋子必须一直跳到无法再跳为止。若有多种吃法可选，你可以任选其一，不必选最长的那一种。",
    alquerque_rules_end_title: "对局如何结束",
    alquerque_term_win: "获胜",
    alquerque_rules_win: "当对手的棋子全部被吃光，或对手虽有棋子但轮到走棋时没有任何合法着法，你便获胜。",
    alquerque_term_resignation: "认输",
    alquerque_term_dead: "双方再也无法相遇",
    alquerque_rules_dead: "PaperGames 的规定：当每枚白子都比每枚黑子至少高出两行时，双方再也无法相遇——白方只能向上或向侧面走，黑方只能向下或向侧面走。此后谁也无法吃子，对局永远不会结束，因此立即结束：棋子多的一方获胜，数量相同则为和棋。",
    alquerque_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    alquerque_rules_versions_title: "这里采用哪种规则",
    alquerque_rules_versions: "关于阿奎卡的古老描述有些细节并不明确。下面列出的资料中吃子不是强制的：本可吃子却没有吃的棋子会被拿走（英文称“huffing”）。PaperGames 保留强制吃子，因为应用本来就只提供合法着法。棋子永远不能后退移动，但可以朝任何方向跳吃（PaperGames 的规定）。白方先走。",
    alquerque_rules_sources_title: "资料来源",
    alquerque_rules_sources: "禁止后退和终局规则依据：Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque（2026年10月6日查阅）。",
    alquerque_history_title: "阿尔盖克的历史",
    alquerque_history_origins_title: "源自阿拉伯语的名字",
    alquerque_history_origins_p1: "这个名字来自阿拉伯语 al-qirkat，即阿拉伯世界中一种为人熟知的棋盘游戏的名称。它在摩尔人统治时期传入西班牙，并以 alquerque 之名在那里流传下来。",
    alquerque_history_book_title: "《游戏之书》",
    alquerque_history_book_p1: "1283 年，卡斯蒂利亚国王阿方索十世主持完成了 Libro de los juegos，即《游戏之书》。除国际象棋、骰子游戏和双陆类游戏外，书中还记述了阿尔盖克的规则并配有插图，使其成为关于这款游戏最早的书面资料之一。",
    alquerque_history_checkers_title: "从阿尔盖克到西洋跳棋",
    alquerque_history_checkers_p1: "西洋跳棋通常被视为阿尔盖克的后代：它的跳吃方式以及必须吃子的规则，被移植到了国际象棋棋盘的方格上。阿尔盖克本身也一直有人在玩，许多地区都有类似的游戏。",
    alquerque_history_modern_title: "在 PaperGames 上",
    alquerque_history_modern_p1: "PaperGames 采用在 5x5 棋盘上、12 对 12 并强制吃子的玩法。棋盘上的线全部画出，因为只有这些线才能表明存在哪些斜向走法。"
});
I18n.markTextLoaded("zh");
