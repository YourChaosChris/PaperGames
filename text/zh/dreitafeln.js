// text/zh/dreitafeln.js
// Rules and history texts of dreitafeln (zh). Loaded by dreitafeln-rules.html and dreitafeln-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    dreitafeln_rules_title: "三块棋盘规则",
    dreitafeln_rules_intro: "三块小棋盘，每块有3×3个格子，还有一叠数字牌。拿一张正面朝上的牌，在任意一块棋盘上把标记放到对应数字的格子里。先赢下两块棋盘的人获胜。",
    dreitafeln_rules_basics_title: "规则",
    dreitafeln_term_boards: "棋盘",
    dreitafeln_rules_boards: "一共有三块棋盘。每块棋盘的格子从左上角开始，按行标上1到9。X画叉，O画圈。X先走。",
    dreitafeln_term_cards: "牌",
    dreitafeln_rules_cards: "牌堆有27张牌：1到9每个数字各有三张，每块棋盘对应一张。桌面上始终有三张正面朝上的牌。因此，每张明牌至少能用于一块棋盘。",
    dreitafeln_term_turn: "轮到你了",
    dreitafeln_rules_turn: "点一张明牌，再点你想选的棋盘上对应数字的空格。你的标记会放在那里，牌堆的下一张牌会补上用掉的牌。再点一次这张牌，可以改选另一张。",
    dreitafeln_term_board_win: "赢下一块棋盘",
    dreitafeln_rules_board_win: "你的三个标记连成一行、一列或一条对角线，就永久赢下这块棋盘。赢下后仍可继续落子，但之后连成的线不再算任何一方获胜。有时可以把不想留给对手的牌用在这里。",
    dreitafeln_term_win: "获胜",
    dreitafeln_rules_win: "先赢下两块棋盘的人获胜。27张牌全部用完后，赢下棋盘较多的人获胜；数量相同则平局。",
    dreitafeln_term_computer: "电脑",
    dreitafeln_rules_computer: "和电脑对战时，可以选X、O或随机一方。先走稍有优势，所以偶尔换边会更公平。简单模式大多随机选择，中等模式会寻找好连线，困难模式还会考虑留给你的牌。提示按钮会显示困难模式的走法，撤销可以收回你上一步。",
    dreitafeln_history_title: "三块棋盘的历史",
    dreitafeln_history_origins_title: "连成三子",
    dreitafeln_history_origins_p1: "三子连线游戏已有很长历史。古埃及的屋瓦上发现过这类棋盘，罗马人则会在铺路石上刻出terni lapilli来玩。1858年，带叉和圈的纸上游戏以英文名noughts and crosses印刷出版；在美国，它叫tic-tac-toe。",
    dreitafeln_history_more_title: "不止一块棋盘",
    dreitafeln_history_more_p1: "在一块棋盘上，两位谨慎的玩家总会打成平局。因此，人们很早就给这个老游戏加入更多棋盘、数字或运气。多块棋盘同时进行、抽取数字牌，都是许多家庭和课堂会用的点子，没有人拥有它们。",
    dreitafeln_history_here_title: "这里的三块棋盘",
    dreitafeln_history_here_p1: "PaperGames版本源自一位玩家提交的点子。它有自己的规则：27张总能用上的牌、三张可选牌，以及赢下后仍保持开放的棋盘。"
});
I18n.markTextLoaded("zh");
