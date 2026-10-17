// text/en/adventurebook.js
// Rules and history texts of adventurebook (en). Loaded by adventurebook-rules.html and adventurebook-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    ab_rules_title: "Adventure Book Rules",
    ab_rules_intro: "You play one hero. Find the treasure of a cave, a tower or a forest and bring it back to the entrance.",
    ab_rules_basics_title: "The rules",
    ab_term_hero: "Your hero",
    ab_rules_hero: "Give a name, choose one of four classes and share 6 points among Strength, Agility and Knowledge (at most 4 on one value). Fighter: 16 life points, attacks with Strength. Scout: 13, attacks with Agility. Healer: 13, attacks with a staff of light (Knowledge). Scholar: 11, attacks with spells (Knowledge). Each class adds 1 to one value and has an ability it can use once per fight.",
    ab_term_place: "The place",
    ab_rules_place: "Every adventure is a new place of 12 to 20 rooms on a small grid: the Crystal Cave, the Raven Tower or the Misty Forest. Each room has a short text and two or three buttons. Every way goes in both directions, so you can always go back. The treasure lies in the room farthest from the entrance, guarded by a strong enemy.",
    ab_term_checks: "Checks",
    ab_rules_checks: "Pushing a boulder, jumping over a crack, reading runes, searching a room or fleeing: roll two dice and add the value. If the sum reaches the number needed, you succeed. Rope, crowbar and magnifying glass add 2 while you carry them; a four-leaf clover lets you roll again once. The result is always shown with the sum, for example “7 + Agility 2 = 9, needed 8: success”.",
    ab_term_fight: "Fights",
    ab_rules_fight: "A fight goes in rounds. Attack: two dice plus your attack value must reach the enemy’s defence, then it loses life points. Defend: the enemy hits less often and only half as hard. Item: a potion or a scroll. Ability: your class ability, once per fight. Flee (Agility check): back to the room you came from – the enemy stays, but keeps the damage it took. After your action the enemy attacks. An enemy at 0 life points gives up and runs away; you get experience and gold.",
    ab_term_pack: "Backpack and levels",
    ab_rules_pack: "The backpack holds 8 items: healing food and potions, weapons and armour (the better one is put on at once), charms that raise a value for good, scrolls for fights and useful tools. Chests, obstacles and searching bring items and gold. With experience you rise to level 5: each level gives 3 life points and +1 on attacks.",
    ab_term_end: "End and difficulty",
    ab_rules_end: "You win when you bring the treasure back to the entrance. At 0 life points the hero has no strength left and the adventure is over. Afterwards you can go on with the same hero (level and values stay, backpack and gold start new) or create a new one. Easy: weaker enemies and 3 healing potions to start with; Medium: 2 potions; Hard: stronger enemies, harder checks and 1 potion.",
    ab_term_playing: "Playing",
    ab_rules_playing: "At the top you read the room and what just happened, below are the choices as buttons, and at the bottom your hero’s values. Map and Backpack open with their own buttons. The map shows the rooms you have seen; your room has a thick frame. The game saves after every step, so you can stop at any time.",
    ab_rules_example_title: "Example",
    ab_rules_example: "Your scout wants to jump across a crack. She rolls 4 and 3, that is 7, plus Agility 2 makes 9. Needed was 8 – she makes it and finds a rope on the other side.",
    ab_history_title: "History of the Adventure Book",
    ab_history_origin_title: "Playing a hero",
    ab_history_origin_p1: "In the 1970s, role-playing games appeared in which every player takes the part of one hero with values written on paper. One person tells the story, dice decide whether something works. Soon there were also books in which you turn to a different page depending on your choice, and solo adventures with dice and a record sheet, for playing alone.",
    ab_history_screen_title: "Rooms on the screen",
    ab_history_screen_p1: "Around 1980, computer games took up the idea: a new set of rooms for every game, a hero who grows stronger, and turns that wait until you decide. Such games are still popular today because no two adventures are the same.",
    ab_history_here_title: "The Adventure Book in PaperGames",
    ab_history_here_p1: "The Adventure Book brings this together in a calm form for e-ink: no time pressure, every throw shown as a sum, three places with their own rooms, enemies and treasures, and a family-friendly tone – defeated enemies give up and run away. All names and texts are its own."
});
I18n.markTextLoaded("en");
