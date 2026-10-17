// text/zh/mancala.js
// Rules and history texts of mancala (zh). Loaded by mancala-rules.html and mancala-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    mancala_rules_title: "曼卡拉规则",
    mancala_rules_intro: "关于 PaperGames 版本曼卡拉的简明参考——具体来说是卡拉哈棋（Kalaha），也是绝大多数数字版曼卡拉游戏采用的标准规则，无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    mancala_rules_basics_title: "基本玩法",
    mancala_term_board: "坑位与粮仓",
    mancala_rules_board: "每位玩家有一排六个坑，每个坑起始各有 4 颗棋子，己方那排的最右端还有一个粮仓。轮到你时，选择自己一个不为空的坑，将里面的棋子逐一播撒到后面每一个坑中，沿整个棋盘逆时针方向进行。",
    mancala_term_sowing: "播撒",
    mancala_rules_sowing: "播撒时会在你经过的每一个坑（包括自己的粮仓）里放入一颗棋子，但永远会跳过对方的粮仓——你的这一手棋不会给对方粮仓增加任何棋子。",
    mancala_term_extra: "额外回合",
    mancala_rules_extra: "如果你手中的最后一颗棋子恰好落入自己的粮仓，你可以立即再走一手。",
    mancala_rules_capture_title: "吃子",
    mancala_term_capture: "吃子",
    mancala_rules_capture: "如果你手中的最后一颗棋子落入自己一个原本为空的坑中，你就可以把这颗棋子连同正对面坑中的所有棋子一并收走——全部直接放入自己的粮仓。如果对面的坑是空的，就什么也收不走。",
    mancala_rules_end_title: "对局如何结束",
    mancala_term_win: "获胜",
    mancala_rules_win: "当轮到某一方走棋、而其六个坑全部为空时，对局立即结束。棋盘另一侧所有剩余的棋子都会被扫入那一方自己的粮仓，粮仓里棋子更多的一方获胜（平分则为和棋）。",
    mancala_term_resignation: "认输",
    mancala_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    mancala_history_title: "曼卡拉的历史",
    mancala_history_origins_title: "刻在石头上的坑穴",
    mancala_history_origins_p1: "考古学家在非洲和中东各地发现了直接刻在石头上的曼卡拉类棋盘，有些估计已超过千年历史，不过和许多古老游戏一样，具体的年代与起源在历史学家之间仍有争议。",
    mancala_history_origins_p2: "可以肯定的是，这种在坑穴间播撒种子的游戏在漫长的岁月中不断传播、分化，衍生出数以百计的地方变体，遍布非洲、中东与亚洲——从 Oware、Bao 到 Congkak，各自拥有不同的棋盘大小、种子数量和吃子规则，却都共享着“播种”这一核心理念。",
    mancala_history_spread_title: "同一家族，无数变体",
    mancala_history_spread_p1: "与国际象棋或围棋不同——那两者各自都统一成了一套全球通行的规则——曼卡拉家族的游戏从未真正走向统一：定义这个家族的，与其说是某一套固定规则，不如说是它们共享的核心机制：在坑穴组成的棋盘上逐一播撒种子。",
    mancala_history_spread_p2: "正是这种多样性，让曼卡拉游戏至今仍深深扎根于非洲和亚洲许多地区的日常生活之中，人们常常就在集市或庭院里随意对弈，工具不过是地上刻出的一块棋盘和一把种子或小石子。",
    mancala_history_modern_title: "卡拉哈棋：一套标准化规则",
    mancala_history_modern_p1: "PaperGames 采用的这套具体规则——两排各六个坑、两端各一个粮仓、吃子落入空坑、落入自己粮仓可获得额外回合——正是卡拉哈棋（Kalaha）。这一曼卡拉变体在 20 世纪中期的美国被注册为商标，并作为量产的桌面游戏而广为流行。",
    mancala_history_modern_p2: "卡拉哈棋规则清晰、定义精确，很早就自然而然地适合被搬上计算机，如今它也是数字游戏与应用中最常见的曼卡拉规则之一，本应用也不例外。"
});
I18n.markTextLoaded("zh");
