// text/zh/teufelsieben.js
// Rules and history texts of teufelsieben (zh). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    ts_rules_title: "魔鬼七规则",
    ts_rules_intro: "一张一张翻牌，及时停下：翻到已有的数字就爆掉。有人达到目标后，分数最多者获胜。",
    ts_rules_basics_title: "规则",
    ts_term_cards: "卡牌",
    ts_rules_cards: "共60张牌。数字1至10：1有3张、2有4张、3有5张、4至7各6张、8有5张、9有4张、10有3张。勇气、划掉、传递、桥梁、收藏家、窥视各2张。",
    ts_term_turn: "你的回合",
    ts_rules_turn: "每位玩家每轮有一个完整回合。逐张翻开卡牌；翻开第一张后可随时停止。所有人行动后本轮结束。每轮起始玩家向后移动一位。",
    ts_term_bust: "爆掉",
    ts_rules_bust: "翻到已有数字就会爆掉：本轮得0分。勇气可救你一次；弃掉重复数字和勇气。每使用一张勇气，回合结束扣5分。",
    ts_term_run: "连续数字",
    ts_rules_run: "最长的连续数字达到4张或更多时，得5 ×（长度−2）分：连续4张得10分，5张得15分。每张桥梁可补一个缺失数字。",
    ts_term_extreme: "狂野连串",
    ts_rules_extreme: "开局前可以选择“狂野连串”牌组：加入12张牌，共72张——数字11、12、13和14（各2张），链环（2张，最长连续数字（至少2个）中的每个数字+2分，两张则+4分）和镜子（2张：你最后一个数字n变成15−n，即1和14、2和13……7和8互换；如果你已经有这个数字，或者还没有数字，则什么也不发生）。连续数字可以到14。打到250或500分。",
    ts_term_special: "特殊卡",
    ts_rules_special: "勇气可救一次，使用后扣5分。划掉移除你最后一个数字。传递：本轮还要行动的下一位玩家必须从一张已经翻开的牌开始回合，这张牌也可能让他爆掉；如果已经没有人要行动，就没有效果。桥梁：本轮一直留在你面前，代替你连续数字中缺少的一个数，所以 4 5 _ 7 算作四个连续数字。收藏家每张数字牌加1分。窥视显示牌堆顶牌。",
    ts_term_points: "得分与结束",
    ts_rules_points: "回合得分为数字总和，加连续奖励及每位收藏家每张数字牌1分，再减每张已用勇气5分（最低0）。目标为60、90或120分，默认90。有人达到目标后的该轮结束后，最高分获胜；并列者共同获胜。",
    ts_term_computer: "电脑",
    ts_rules_computer: "电脑只计算明牌和窥视展示的牌。简单模式会较早停下；困难模式会权衡潜在收益和风险。",
    ts_rules_example_title: "示例",
    ts_rules_example: "你有3、4、5、6和9：数字共27分。连续4张加10分，特殊牌效果前共37分。",
    ts_history_title: "关于魔鬼七",
    ts_history_family_title: "继续还是停止",
    ts_history_family_p1: "这类游戏需要反复选择是否再冒一次险，或保住已有成果。许多骰子和卡牌游戏都采用这种玩法。",
    ts_history_modern_title: "本版本",
    ts_history_modern_p1: "魔鬼七为PaperGames制作，采用自有卡牌、规则和文字：数字1至10的独特配比、连续数字奖励，以及勇气、划掉、传递、桥梁、收藏家和窥视。",
});
I18n.markTextLoaded("zh");
