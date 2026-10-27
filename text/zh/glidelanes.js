// text/zh/glidelanes.js
// Rules and history texts of arrows (zh). Loaded by glidelanes-rules.html and glidelanes-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    aw_rules_title: "畅通道规则",
    aw_rules_intro: "把每个畅通道都送出格子。",
    aw_rules_basics_title: "规则",
    aw_term_move: "移动",
    aw_rules_move: "点一下畅通道。它会朝畅通道尖指的方向滑出格子——但只有从畅通道尖到边缘的每一格都空着才行。由好几格组成的畅通道会跟着畅通道尖走；它自己的身体也不能挡路。",
    aw_term_blocked: "被挡住",
    aw_rules_blocked: "如果有别的畅通道挡路，被点的畅通道会留在原地，挡路的畅通道会出现点线框。不扣分：先把那个畅通道移出去。",
    aw_term_glide: "会滑动的畅通道（困难和大师）",
    aw_rules_glide: "在“困难”中，被挡住的畅通道不会停在原地：它会向前滑，身体跟着畅通道，直到下一个畅通道前停下。这可能把别的畅通道永远挡住——先想再点。“撤销”可以退回一步，“提示”会从当前局面寻找出路。那里的畅通道最多有两个拐角，棋盘为11×11格。",
    aw_term_master: "大师",
    aw_rules_master: "与困难相同，但没有提示。没有让箭头离开棋盘的点击会计为失误。",
    aw_term_goal: "目标",
    aw_rules_goal: "把整个格子清空。每道题都保证有解，而且移走一个畅通道绝不会挡住另一个，所以不会卡住。最少步数就是畅通道的数量；撤销也算一步。",
    aw_term_levels: "难度",
    aw_rules_levels: "简单：5 × 5 棋盘和短箭头。中等：7 × 7，箭头长二至四格。困难：11 × 11，滑动箭头最长七格，有两个弯。大师：与困难相同，并统计失误。宗师：15 × 15，箭头最长15格，有六个弯。图形谜题使用十二种轮廓之一。",
    aw_term_help: "提示",
    aw_rules_help: "“提示”会标出一个现在可以出去的畅通道。",
    aw_rules_example_title: "例子",
    aw_rules_example: "长畅通道指向右边，但短畅通道挡在它前面。短畅通道可以向上出去；之后长畅通道的路就通了。",
    aw_history_title: "畅通道的历史",
    aw_history_slide_title: "滑动的拼块",
    aw_history_slide_p1: "让拼块在框里滑动的谜题由来已久。最有名的是“十五谜题”：一个能放十六块的盒子里装着十五块带数字的方块。它的发明者是纽约州卡纳斯托塔的邮政局长诺伊斯·帕尔默·查普曼。从1879年12月起，波士顿的木匠马蒂亚斯·赖斯把它做成“Gem Puzzle”出售，1880年它在美国风靡一时，很快又传到欧洲。后来萨姆·劳埃德声称是他发明的，但其实与他毫无关系。",
    aw_history_arrows_title: "离开的畅通道",
    aw_history_arrows_p1: "在畅通道谜题里，每个拼块只能朝一个方向移动，而且是离开格子，而不是来回滑动。这类谜题近年来在触屏游戏中流行起来；并没有一位可以指名的发明者。这里的题目是为PaperGames制作的：倒着搭建，所以每个格子都能清空。"
});
I18n.markTextLoaded("zh");
