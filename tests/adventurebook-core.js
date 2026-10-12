// tests/adventurebook-core.js
// AdventureCore ("Adventure Book"): data, generated places, random runs.
//  1. At least 60 room texts, 20 enemies and 30 items; every class,
//     value, place, enemy, item, obstacle and room text has its text in
//     12 languages. Creating a hero: exactly 6 points, at most 4 each.
//  2. 1000 generated places per difficulty: 12 to 20 rooms, every way
//     goes both directions, every room (and so the goal) can be reached
//     from the entrance, at most 3 exits per room (the entrance 2), and
//     no room view offers more than 3 choices.
//  3. 1000 runs with random choices for every class and difficulty
//     (random values, random place): every run ends (treasure brought
//     back or no strength left) without an illegal step; the win rate of
//     each class and difficulty is printed, Easy must be above 75 %.
//  4. Single rules: a check shows dice + value against the number needed,
//     the backpack holds 8, levels go up to 5, a flight keeps the
//     enemy's damage, the treasure must be brought back to the entrance.
// No server or browser needed.

const path = require("path");
const A = require(path.join(__dirname, "..", "adventurebook-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.RUNS || "1000", 10);

// --- 1. data -------------------------------------------------------------------
const enemyIds = [].concat(...A.SETTINGS.map((s) => A.ENEMIES[s].map((e) => e.id))).concat(A.SETTINGS.map((s) => A.GUARDIANS[s].id));
check(A.SETTINGS.length * A.ROOM_TEXTS >= 60, "at least 60 room texts expected");
check(new Set(enemyIds).size >= 20, "at least 20 enemies expected, got " + new Set(enemyIds).size);
check(A.ITEMS.length >= 30 && new Set(A.ITEMS.map((i) => i.id)).size === A.ITEMS.length, "at least 30 different items expected");
const keys = [];
A.SETTINGS.forEach((s) => {
  keys.push("ab_setting_" + s, "ab_intro_" + s, "ab_goalitem_" + A.GOAL_ITEM[s], "ab_item_" + A.GOAL_ITEM[s]);
  for (let i = 1; i <= A.ROOM_TEXTS; i++) keys.push("ab_room_" + s + "_" + i);
  A.OBSTACLES[s].forEach((o) => keys.push("ab_obst_" + o[0], "ab_obst_" + o[0] + "_try"));
});
A.CLASS_IDS.forEach((c) => keys.push("ab_class_" + c, "ab_class_" + c + "_desc", "ab_ability_" + A.CLASSES[c].ability));
A.STATS.forEach((k) => keys.push("ab_stat_" + k));
enemyIds.forEach((e) => keys.push("ab_enemy_" + e));
A.ITEMS.forEach((it) => keys.push("ab_item_" + it.id));
keys.forEach((k) => Object.keys(STRINGS).forEach((l) => check(!!STRINGS[l][k], l + ": no text " + k)));
A.SETTINGS.forEach((s) => {
  const de = [];
  for (let i = 1; i <= A.ROOM_TEXTS; i++) de.push(STRINGS.de["ab_room_" + s + "_" + i]);
  check(new Set(de).size === de.length, s + ": German room texts repeat");
});
check(A.createHero("X", "fighter", { str: 3, dex: 2, wis: 1 }) !== null, "6 points should make a hero");
check(A.createHero("X", "fighter", { str: 3, dex: 2, wis: 0 }) === null, "5 points must not make a hero");
check(A.createHero("X", "fighter", { str: 5, dex: 1, wis: 0 }) === null, "5 on one value must not make a hero");
check(A.createHero("X", "wizard", { str: 2, dex: 2, wis: 2 }) === null, "unknown class must not make a hero");
const fh = A.createHero("Ada", "fighter", { str: 2, dex: 2, wis: 2 });
check(fh.stats.str === 3 && fh.hpMax === 16, "a fighter gets +1 Strength and 16 life points");

// --- 2. places ---------------------------------------------------------------------
const OPP = { n: "s", e: "w", s: "n", w: "e" };
let sizes = { min: 99, max: 0 };
A.LEVELS.forEach((lv) => {
  for (let g = 0; g < N; g++) {
    const r = A.makeRng(500000 + 7919 * g + lv.length);
    const D = A.generate(A.SETTINGS[g % 3], lv, r);
    const n = D.rooms.length;
    sizes.min = Math.min(sizes.min, n); sizes.max = Math.max(sizes.max, n);
    if (n < 12 || n > 20) { fails.push(lv + " place " + g + ": " + n + " rooms"); continue; }
    let bad = "";
    D.rooms.forEach((rm, i) => {
      const ex = Object.keys(rm.exits);
      if (ex.length > (i === D.start ? 2 : 3)) bad = "room " + i + " has " + ex.length + " exits";
      if (rm.kind !== "enemy" && rm.kind !== "empty" && ex.length > 2) bad = "room " + i + " (" + rm.kind + ") has " + ex.length + " exits";
      ex.forEach((d) => { if (D.rooms[rm.exits[d]].exits[OPP[d]] !== i) bad = "way " + i + " " + d + " has no way back"; });
    });
    const dist = A.bfs(D.rooms, D.start);
    if (dist.some((x) => x === Infinity)) bad = "a room cannot be reached";
    if (D.rooms[D.goal].kind !== "goal" || D.goal === D.start) bad = "no goal room";
    if (bad) fails.push(lv + " place " + g + ": " + bad);
  }
});
console.log("Places: " + (3 * N) + " generated, " + sizes.min + " to " + sizes.max + " rooms, all rooms and goals reachable, every way both directions");

// --- 3. random runs ------------------------------------------------------------------
const t0 = Date.now();
const rates = {};
A.LEVELS.forEach((lv) => {
  const row = [];
  A.CLASS_IDS.forEach((cls) => {
    let won = 0, steps = 0, maxChoices = 0;
    for (let g = 0; g < N; g++) {
      const r = A.makeRng(1000 * g + 17 + cls.length);
      const st = { str: 0, dex: 0, wis: 0 };
      for (let k = 0; k < 6;) { const s = A.STATS[Math.floor(r() * 3)]; if (st[s] < 4) { st[s]++; k++; } }
      const s = A.newGame(A.createHero("Test", cls, st), lv, null, 99991 * g + 3 + lv.length);
      let k = 0, err = "";
      while (s.phase !== "won" && s.phase !== "lost" && k < 20000) {
        let acts = A.choices(s);
        if (s.phase === "explore") maxChoices = Math.max(maxChoices, acts.length);
        if (s.phase === "explore" && s.hero.hp < s.hero.hpMax / 2) {
          acts = acts.concat(A.packActions(s).filter((a) => a.type === "use" && A.ITEM[s.hero.pack[a.index]].kind === "heal"));
        }
        if (!acts.length) { err = "no choice"; break; }
        const a = acts[Math.floor(r() * acts.length)];
        if (!A.apply(s, a)) { err = "illegal " + JSON.stringify(a); break; }
        if (s.hero.pack.length > A.BACKPACK) { err = "backpack over 8"; break; }
        k++;
      }
      if (err) { fails.push(cls + "/" + lv + " run " + g + ": " + err); continue; }
      if (s.phase !== "won" && s.phase !== "lost") { fails.push(cls + "/" + lv + " run " + g + ": did not end"); continue; }
      if (s.phase === "won") won++;
      steps += k;
    }
    if (maxChoices > 3) fails.push(cls + "/" + lv + ": a room offered " + maxChoices + " choices");
    const pct = 100 * won / N;
    rates[lv + "/" + cls] = pct;
    if (lv === "easy") check(pct > 75, "easy " + cls + " wins only " + pct.toFixed(1) + " %");
    row.push(cls + " " + pct.toFixed(1) + " %");
  });
  console.log(lv + ", " + N + " random runs per class: " + row.join(", "));
});
console.log("(" + Math.round((Date.now() - t0) / 1000) + " s)");

// --- 4. single rules ------------------------------------------------------------------
(function rules() {
  const h = A.createHero("Ada", "scout", { str: 1, dex: 3, wis: 2 });
  const s = A.newGame(h, "medium", "cave", 12345);
  // Backpack of 8.
  check(s.hero.pack.length === A.DIFF.medium.potions, "medium starts with " + A.DIFF.medium.potions + " potions");
  // Levels up to 5.
  check(A.levelFor(0) === 1 && A.levelFor(10) === 2 && A.levelFor(70) === 5 && A.levelFor(999) === 5, "levels 1 to 5 by experience");
  // Leaving without the treasure is not possible; with it, it wins.
  check(!A.choices(s).some((a) => a.type === "leave"), "no leaving without the treasure");
  s.hasGoal = true;
  check(A.choices(s).some((a) => a.type === "leave"), "with the treasure at the entrance one can leave");
  A.apply(s, { type: "leave" });
  check(s.phase === "won", "leaving with the treasure wins");
  // A flight keeps the enemy's damage.
  const t = A.newGame(A.createHero("Bo", "fighter", { str: 3, dex: 3, wis: 0 }), "easy", "forest", 777);
  const ei = t.dungeon.rooms.findIndex((rm) => rm.kind === "enemy");
  const way = Object.keys(t.dungeon.rooms[ei].exits)[0];
  t.room = t.dungeon.rooms[ei].exits[way];
  t.dungeon.rooms[t.room].kind = "empty"; t.dungeon.rooms[t.room].done = true;
  A.apply(t, { type: "go", dir: { n: "s", e: "w", s: "n", w: "e" }[way] });
  check(t.phase === "fight", "entering an enemy room starts a fight");
  const en = t.dungeon.rooms[ei].enemy;
  en.hp -= 1;
  const hpLeft = en.hp;
  for (let k = 0; k < 50 && t.phase === "fight"; k++) A.apply(t, { type: "flee" });
  if (t.phase === "explore") check(en.hp <= hpLeft && t.room !== ei, "after a flight the enemy keeps its damage and the hero is back in the room before");
  // A check log shows dice, value and the number needed.
  const u = A.newGame(A.createHero("Cy", "scholar", { str: 0, dex: 2, wis: 4 }), "easy", "tower", 4242);
  const r0 = u.dungeon.rooms[u.room];
  r0.searched = false;
  A.apply(u, { type: "search" });
  const e = u.log[u.log.length - 1];
  check(e.c && e.c.dice >= 2 && e.c.dice <= 12 && e.c.value === u.hero.stats.wis && e.c.total === e.c.dice + e.c.value + e.c.bonus && e.c.diff > 0, "a check keeps dice, value, sum and the number needed: " + JSON.stringify(e));
})();

if (fails.length) {
  fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
  console.log("=== ADVENTURE BOOK CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== ADVENTURE BOOK CORE: 0 failures ===");
