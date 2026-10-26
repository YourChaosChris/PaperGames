// text/zh/advent.js
// Rules and history texts of advent (zh). Loaded by advent-rules.html and advent-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    adv_rules_title: "谜题降临节日历：玩法介绍",
    adv_rules_intro: "12月1日至24日共有24扇门，每扇门后都有一道小谜题。越接近24日，谜题会稍微变难。",
    adv_rules_basics_title: "规则",
    adv_term_doors: "门",
    adv_rules_doors: "第n扇门会在12月n日开启（以设备时钟为准），但要先解开第n - 1扇门。12月1日之前所有门都关闭；从12月25日起所有门都开启。关闭的门显示为条纹背景和虚线边框，打开的门有粗边框，解开的门为黑色并带有勾号。",
    adv_term_kinds: "谜题类型",
    adv_rules_kinds: "电灯开关、迷你数独（4 x 4和6 x 6）、数织、Futoshiki、高楼谜题和Calcudoku，每种谜题都只有一个解。所有设备在同一扇门后显示相同的谜题。",
    adv_term_input: "操作",
    adv_rules_input: "点按一个格子，再点下面的数字；点按“擦除”可清空格子。在数织中，每次点按都会让格子依次变为填满、打叉、空白。在电灯开关中，点按会切换灯和相邻的灯。所有内容正确后，这扇门就解开了。",
    adv_term_try: "试试看",
    adv_rules_try: "在菜单中点按“打开所有门（试试看）”即可一次打开所有门；默认关闭。进度保存在本设备上，不会发送到任何地方。",
    adv_history_title: "降临节日历的历史",
    adv_history_home_title: "粉笔线和图画",
    adv_history_home_p1: "19世纪，德国的家庭会在家中倒数圣诞节的日子，例如在门上画粉笔线，每天擦掉一条，或一幅接一幅地挂上图画。据认为，现存最早的自制日历大约出现在19世纪中期。",
    adv_history_print_title: "最早的印刷日历",
    adv_history_print_p1: "印刷日历出现在20世纪初：1902年，汉堡的一家书店为儿童推出了“圣诞钟”，不久后慕尼黑的出版商Gerhard Lang推出了图画日历（不同资料记载为1903年或1908年）。",
    adv_history_doors_title: "小门",
    adv_history_doors_p1: "带有可开启小门或小窗的日历约从1920年开始普及。第二次世界大战期间纸张实行配给，这类日历的印刷基本停止；1945年后它们重新出现，其中包括斯图加特出版商Richard Sellmer的产品，他的首个日历于1946年节日季推出。",
    adv_history_today_title: "巧克力和谜题",
    adv_history_today_p1: "加入巧克力的日历从1950年代起广为人知。如今也有每扇门后藏着一道谜题的日历；这款日历收录了PaperGames的小型逻辑谜题。",
});
I18n.markTextLoaded("zh");
