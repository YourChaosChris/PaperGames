// text/zh/gipfelwurf.js
// Rules and history texts of gipfelwurf (zh). Loaded by gipfelwurf-rules.html and gipfelwurf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    gw_rules_title: "山脊骰规则",
    gw_rules_intro: "掷三颗骰子，每回合攀登七道山脊中的一道。只要你敢就继续掷；如果结果不适合你的山脊，本回合的攀登就会失去。营地和顶峰都能得分。",
    gw_rules_basics_title: "规则",
    gw_term_board: "棋盘",
    gw_rules_board: "两颗骰子的和对应七道山脊：2到4（15步）、5（8步）、6（9步）、7（10步）、8（7步）、9（6步）以及10到12（6步）。较低的山脊更长，因为第三颗骰子在那里通常点数较大。每道山脊都有一座山间小屋和一道冰隙。",
    gw_term_turn: "你的回合",
    gw_rules_turn: "点击“掷骰子”掷出三颗骰子。每颗都可以作为步数骰：1或2走一步，3或4走两步，5或6走三步。其余两颗的和决定山脊。按钮会显示可选方式；选择一种。",
    gw_term_climbers: "每回合一道山脊",
    gw_rules_climbers: "每回合第一次掷骰时选择一道山脊（尚未登顶的山脊）。之后每次掷骰都必须再次适合这道山脊。",
    gw_term_lost: "失去回合",
    gw_rules_lost: "如果掷出的结果无法让你沿自己的山脊前进，本回合就失去了：本回合的攀登作废，但营地保留。",
    gw_term_special: "山间小屋和冰隙",
    gw_rules_special: "如果你的登山者本回合到达山间小屋，即使失去回合，你仍会在小屋处留下营地。正好落在冰隙上会让登山者后退两步（不会退到营地以下）；越过冰隙没有影响。",
    gw_term_camp: "扎营",
    gw_rules_camp: "每次掷骰成功后，你都可以停下：登山者变成营地，下次从那里出发。营地是你自己的黑色标记（圆形、方形、三角形或星形）；本回合的登山者是带粗黑边的白色圆环。",
    gw_term_top: "顶峰",
    gw_rules_top: "最先在顶峰扎营的人额外得6分，之后的人得3分。其他人仍可攀登这道山脊。",
    gw_term_end: "获胜",
    gw_rules_end: "营地的每一步得1分，另加顶峰分。有人达到目标（游戏前选择30或45分）后，继续完成本轮，让每个人的回合数相同。得分最高者获胜；若分数相同，平分的玩家一起获胜。",
    gw_term_start: "谁先开始",
    gw_rules_start: "抽签决定谁先开始。",
    gw_term_computer: "电脑",
    gw_rules_computer: "简单级选择步数最多的路线，两次成功掷骰后停下。中等和困难级会判断再掷一次是否值得冒险；困难级还会争取顶峰分。",
    gw_rules_example_title: "示例",
    gw_rules_example: "你掷出5、2和4。可选方式：2 + 4 = 6，用5作步数骰（山脊6，向上三步）；5 + 4 = 9，用2（山脊9，向上一步）；5 + 2 = 7，用4（山脊7，向上两步）。你选择山脊6，向上三步。下一次掷出1、3、3：3 + 3 = 6，用1作步数骰，符合条件——再走一步。然后你停下：营地在山脊6的第4步。",
    gw_history_title: "关于山脊骰",
    gw_history_family_title: "有风险的骰子游戏",
    gw_history_family_p1: "在许多骰子游戏里，你要一次次决定：为了更多收获再掷一次，还是保住已有的。游戏设计师赖纳·克尼齐亚在他的书《Dice Games Properly Explained》（1999 年）中把它们称为“jeopardy dice games”。",
    gw_history_pig_title: "猪骰（Pig）",
    gw_history_pig_p1: "一个著名的例子是 Pig，1945 年由美国魔术师约翰·斯卡尼首次见诸文字。用一颗骰子想掷几次就掷几次，把点数加起来；掷出 1 回合结束，本回合的分数作废。停下的人保住总和。这个游戏大概比它最早的记载还要古老。",
    gw_history_modern_title: "这个版本",
    gw_history_modern_p1: "山脊骰是为PaperGames创作的，拥有自己的棋盘、规则和文本：两颗骰子点数和对应的七道不同长度的山脊；三颗骰子中一颗决定步数；每回合一道山脊；山间小屋和冰隙；营地和顶峰得分。"
});
I18n.markTextLoaded("zh");
