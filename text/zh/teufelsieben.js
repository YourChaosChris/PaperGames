// text/zh/teufelsieben.js
// Rules and history texts of teufelsieben (zh). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    ts_rules_title: "魔鬼七规则",
    ts_rules_intro: "逐张翻牌并及时停手：翻到已有的数字就爆掉。有人达到目标分数后，得分最高的人获胜。",
    ts_rules_basics_title: "游戏规则",
    ts_term_cards: "卡牌",
    ts_rules_cards: "共90张牌。数字牌为0到12，每个数字的张数等于其数值（12有12张，1有1张，0有1张）：共79张。特殊牌：暂停（2张）、加餐（2张）、救援（2张）、+3（2张）、+5（2张）和双倍（1张）。",
    ts_term_turn: "你的回合",
    ts_rules_turn: "每轮开始时，每人拿一张牌。之后仍在本轮的玩家依次点击“翻牌”或“停手”。停手的人保留本轮得分。",
    ts_term_bust: "爆掉",
    ts_rules_bust: "如果翻到自己面前已有的数字，就会爆掉：本轮不得分。救援牌能保护你一次：第二张相同数字会被移走，救援牌也会用掉。",
    ts_term_seven: "七种数字",
    ts_rules_seven: "谁面前有七种不同数字，谁就立即结束本轮并获得20分奖励。",
    ts_term_special: "特殊牌",
    ts_rules_special: "暂停：选择一名仍在本轮的玩家（也可以选自己），对方必须立即停手并保留得分。加餐：选择一名仍在本轮的玩家，对方必须连续翻三张牌。加餐期间翻出的暂停或加餐无效。+3和+5增加分数，双倍会将你的数字总和翻倍。",
    ts_term_points: "得分与游戏结束",
    ts_rules_points: "本轮得分：你的数字总和（使用双倍后翻倍），再加上+3和+5；集齐七种数字再加20分。当所有人都退出本轮时，本轮结束。有人达到目标（开局前选择100、150或200分）的那一轮结束后，游戏结束：得分最高者获胜；最高分相同则并列获胜。",
    ts_term_computer: "电脑",
    ts_rules_computer: "电脑会根据难度，在下一张牌爆掉的风险太高时停手。它只计算已翻开的牌，绝不会查看暗牌。简单难度较早停手，困难难度更敢冒险。",
    ts_rules_example_title: "示例",
    ts_rules_example: "你有5、9和2，共16分。未翻开的牌中还有4张5、8张9和1张2会让你爆掉。如果停手，你保留16分；如果翻到9，本轮得分为零。",
    ts_history_title: "关于魔鬼七",
    ts_history_family_title: "碰运气游戏",
    ts_history_family_p1: "在游戏中，你要反复决定是否再冒一次险，或保住已有成果。这类游戏叫碰运气游戏，许多骰子和纸牌游戏都采用这种玩法。",
    ts_history_modern_title: "本版本",
    ts_history_modern_p1: "魔鬼七是为PaperGames制作的，拥有自己的卡牌、名称和文本：特殊牌包括暂停、加餐、救援、+3、+5和双倍；集齐七种不同数字可额外获得20分。"
});
I18n.markTextLoaded("zh");
