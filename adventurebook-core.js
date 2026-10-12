// adventurebook-core.js
// "Adventure Book" - a role-playing game for one person. Create a hero
// (name, one of 4 classes, 6 points on Strength / Agility / Knowledge),
// then explore a generated place (cave, tower or forest) of 12 to 20
// rooms on a small grid, find the goal item and bring it back to the
// entrance. Checks: two dice + a value against a difficulty. Fights in
// rounds: attack, defend, item, class ability, flee. Backpack of 8,
// experience and levels up to 5. Easy / Medium / Hard. Dependency-free,
// no DOM; every text is an i18n key ("ab_*") plus numbers.
//
// State: { hero, level ("easy"|"medium"|"hard"), dungeon: { setting,
// rooms: [{ x, y, exits: {n,e,s,w: roomIndex}, kind, desc, done, seen,
// visited, enemy, obstacle, item, searched }], start, goal }, room
// (index), prev, phase ("explore"|"fight"|"won"|"lost"), fight, log,
// rngState }.

const AdventureCore = (function () {
  const SETTINGS = ["cave", "tower", "forest"];
  const LEVELS = ["easy", "medium", "hard"];
  const STATS = ["str", "dex", "wis"];
  const POINTS = 6;
  const STAT_MAX = 4;
  const BACKPACK = 8;
  const MAX_LEVEL = 5;
  const XP_FOR = [0, 0, 10, 25, 45, 70];   // experience needed for level 1..5
  const DIRS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
  const OPP = { n: "s", e: "w", s: "n", w: "e" };
  const GRID_W = 7, GRID_H = 6;

  // Classes: life points, +1 on one value, the value used for attacks and
  // the class ability (once per fight).
  const CLASSES = {
    fighter: { hp: 16, bonus: "str", attack: "str", ability: "powerstrike" },
    scout: { hp: 13, bonus: "dex", attack: "dex", ability: "ambush" },
    healer: { hp: 13, bonus: "wis", attack: "wis", ability: "heal" },
    scholar: { hp: 11, bonus: "wis", attack: "wis", ability: "spark" }
  };
  const CLASS_IDS = Object.keys(CLASSES);

  // Difficulty: enemy life and attack, healing potions at the start.
  const DIFF = {
    easy: { hpMul: 0.75, atk: -1, potions: 3, check: -1 },
    medium: { hpMul: 1, atk: 0, potions: 2, check: 0 },
    hard: { hpMul: 1.25, atk: 1, potions: 1, check: 1 }
  };

  // Enemies per setting (6 each) and one guardian of the goal per setting.
  // [id, life, attack, defence, damage, experience, gold]
  const E = (id, hp, atk, def, dmg, xp, gold) => ({ id, hp, atk, def, dmg, xp, gold });
  const ENEMIES = {
    cave: [E("cavegoblin", 6, 1, 8, 3, 4, 3), E("dustbat", 4, 2, 9, 2, 3, 1), E("mosscrawler", 8, 0, 7, 3, 4, 2),
      E("stonebeetle", 9, 1, 10, 3, 6, 4), E("glowworm", 5, 1, 8, 2, 3, 2), E("tunneltroll", 12, 2, 9, 4, 8, 6)],
    tower: [E("inkimp", 5, 2, 9, 2, 3, 2), E("dustgolem", 10, 1, 10, 3, 6, 4), E("bookworm", 6, 1, 8, 3, 4, 3),
      E("candleghost", 7, 2, 9, 3, 5, 3), E("clockgargoyle", 11, 2, 10, 3, 7, 5), E("mirrorshade", 8, 2, 9, 3, 6, 4)],
    forest: [E("thornboar", 9, 1, 8, 3, 5, 3), E("nettlesprite", 5, 2, 9, 2, 3, 2), E("greywolf", 8, 2, 9, 3, 5, 3),
      E("mudtoad", 7, 1, 8, 3, 4, 2), E("barkbear", 12, 2, 9, 4, 8, 5), E("willowisp", 6, 2, 10, 2, 4, 3)]
  };
  const GUARDIANS = { cave: E("crystaldragon", 16, 3, 10, 4, 15, 15), tower: E("ravenwizard", 15, 3, 10, 4, 15, 15), forest: E("oldoakgiant", 18, 2, 9, 5, 15, 15) };
  const GOAL_ITEM = { cave: "starmap", tower: "silverbook", forest: "goldenseed" };

  // Items: kind and value.
  //   heal n (life back), weapon n (+damage), armor n (+defence),
  //   charm stat (+1 for good), scroll fx, tool fx.
  const I = (id, kind, v) => ({ id, kind, v });
  const ITEMS = [
    I("berries", "heal", 2), I("honeybread", "heal", 3), I("herbtea", "heal", 4),
    I("potion", "heal", 7), I("bigpotion", "heal", 12), I("elixir", "heal", 99),
    I("oakstaff", "weapon", 1), I("shortsword", "weapon", 1), I("spear", "weapon", 2),
    I("mace", "weapon", 2), I("runeblade", "weapon", 3), I("starbow", "weapon", 3),
    I("leathervest", "armor", 1), I("woodshield", "armor", 1), I("chainshirt", "armor", 2),
    I("mooncloak", "armor", 2), I("scalearmor", "armor", 3),
    I("beartooth", "charm", "str"), I("featheramulet", "charm", "dex"), I("owlfeather", "charm", "wis"),
    I("sparkscroll", "scroll", "damage"), I("fogscroll", "scroll", "escape"), I("sleepsand", "scroll", "sleep"), I("shieldscroll", "scroll", "shield"),
    I("rope", "tool", "dex"), I("crowbar", "tool", "str"), I("magnifier", "tool", "wis"),
    I("cloverleaf", "tool", "reroll"), I("lantern", "tool", "map"), I("compass", "tool", "compass")
  ];
  const ITEM = {};
  ITEMS.forEach((it) => { ITEM[it.id] = it; });
  ITEM.starmap = I("starmap", "goal", 0); ITEM.silverbook = I("silverbook", "goal", 0); ITEM.goldenseed = I("goldenseed", "goal", 0);
  // Items that can lie in chests (by rarity: common ones more often).
  const LOOT = ["berries", "berries", "honeybread", "honeybread", "herbtea", "herbtea", "potion", "potion", "bigpotion", "elixir",
    "oakstaff", "shortsword", "spear", "mace", "runeblade", "starbow", "leathervest", "woodshield", "chainshirt", "mooncloak", "scalearmor",
    "beartooth", "featheramulet", "owlfeather", "sparkscroll", "fogscroll", "sleepsand", "shieldscroll",
    "rope", "crowbar", "magnifier", "cloverleaf", "lantern", "compass"];

  // Room texts: 20 per setting (ab_room_<setting>_<1..20>).
  const ROOM_TEXTS = 20;
  // Obstacles per setting: [id, value, difficulty].
  const OBSTACLES = {
    cave: [["boulder", "str", 8], ["chasm", "dex", 8], ["runes", "wis", 8]],
    tower: [["stuckdoor", "str", 8], ["brokenstair", "dex", 8], ["riddle", "wis", 8]],
    forest: [["fallentree", "str", 8], ["stream", "dex", 8], ["oldsign", "wis", 8]]
  };

  // --- random numbers (state kept in the game, so a reload goes on alike) --
  function rngFrom(s) {
    return function () {
      s.rng = (s.rng + 0x6D2B79F5) >>> 0;
      let t = s.rng;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) { const box = { rng: seed >>> 0 }; return rngFrom(box); }
  function pick(a, r) { return a[Math.floor(r() * a.length)]; }
  function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function d6(r) { return 1 + Math.floor(r() * 6); }

  // --- hero -------------------------------------------------------------------
  // stats: { str, dex, wis } with 6 points in total, 0..4 each.
  function validStats(stats) {
    if (!stats) return false;
    let sum = 0;
    for (const k of STATS) {
      const v = stats[k];
      if (!Number.isInteger(v) || v < 0 || v > STAT_MAX) return false;
      sum += v;
    }
    return sum === POINTS;
  }
  function createHero(name, cls, stats) {
    if (!CLASSES[cls] || !validStats(stats)) return null;
    const C = CLASSES[cls];
    const st = { str: stats.str, dex: stats.dex, wis: stats.wis };
    st[C.bonus] += 1;
    const nm = String(name || "").trim().slice(0, 20);
    return { name: nm, cls, stats: st, base: { str: stats.str, dex: stats.dex, wis: stats.wis }, hpMax: C.hp, hp: C.hp, xp: 0, lvl: 1, gold: 0, pack: [], weapon: null, armor: null, wins: 0 };
  }
  function attackValue(h) { return h.stats[CLASSES[h.cls].attack] + (h.lvl - 1); }
  function defence(h) { return 7 + (h.armor ? ITEM[h.armor].v : 0) + Math.floor(h.stats.dex / 2); }
  function weaponBonus(h) { return h.weapon ? ITEM[h.weapon].v : 0; }
  function levelFor(xp) { let l = 1; for (let i = 2; i <= MAX_LEVEL; i++) if (xp >= XP_FOR[i]) l = i; return l; }

  // --- the place -----------------------------------------------------------------
  // A random place of n rooms (12..20) on a 7 x 6 grid: grown from the
  // entrance, every room with at most 3 exits (the entrance 2), a few
  // extra connections. All ways go both directions, so every room can be
  // reached and left. Rooms with something to do (chest, obstacle,
  // spring, the goal) have at most 2 exits, so no room shows more than 3
  // choices.
  function generate(setting, level, r) {
    const n = 12 + Math.floor(r() * 9);
    const at = {};
    const rooms = [];
    const key = (x, y) => x + "," + y;
    const add = (x, y) => { const i = rooms.length; rooms.push({ x, y, exits: {} }); at[key(x, y)] = i; return i; };
    const deg = (i) => Object.keys(rooms[i].exits).length;
    const maxDeg = (i) => (i === 0 ? 2 : 3);
    const link = (a, d, b) => { rooms[a].exits[d] = b; rooms[b].exits[OPP[d]] = a; };
    const sx = Math.floor(r() * GRID_W), sy = GRID_H - 1;
    add(sx, sy);
    let guard = 0;
    while (rooms.length < n && guard++ < 5000) {
      const a = Math.floor(r() * rooms.length);
      if (deg(a) >= maxDeg(a)) continue;
      const d = pick(["n", "e", "s", "w"], r);
      const x = rooms[a].x + DIRS[d][0], y = rooms[a].y + DIRS[d][1];
      if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H || at[key(x, y)] !== undefined) continue;
      link(a, d, add(x, y));
    }
    // A few loops.
    const loops = 1 + Math.floor(r() * 3);
    for (let k = 0, tries = 0; k < loops && tries < 200; tries++) {
      const a = Math.floor(r() * rooms.length);
      const d = pick(["n", "e", "s", "w"], r);
      const b = at[key(rooms[a].x + DIRS[d][0], rooms[a].y + DIRS[d][1])];
      if (b === undefined || rooms[a].exits[d] !== undefined || deg(a) >= maxDeg(a) || deg(b) >= maxDeg(b)) continue;
      link(a, d, b); k++;
    }
    // Distances from the entrance: the goal is the farthest room with at
    // most 2 exits (there always is one: the last room grown has 1).
    const dist = bfs(rooms, 0);
    let goal = -1;
    rooms.forEach((_, i) => { if (i !== 0 && deg(i) <= 2 && (goal < 0 || dist[i] > dist[goal])) goal = i; });
    // Room kinds: chests, obstacles and springs only in rooms with at
    // most 2 exits; enemies and empty rooms anywhere.
    const others = shuffle(rooms.map((_, i) => i).filter((i) => i !== 0 && i !== goal), r);
    const kinds = {};
    const nEnemy = Math.round(others.length * 0.4), nChest = Math.round(others.length * 0.2), nObst = Math.round(others.length * 0.15), nWell = Math.max(1, Math.round(others.length * 0.08));
    const want = [];
    for (let k = 0; k < nChest; k++) want.push("chest");
    for (let k = 0; k < nObst; k++) want.push("obstacle");
    for (let k = 0; k < nWell; k++) want.push("well");
    let enemies = nEnemy;
    others.filter((i) => deg(i) <= 2).forEach((i) => { if (want.length) kinds[i] = want.shift(); });
    others.forEach((i) => {
      if (kinds[i]) return;
      if (enemies > 0) { kinds[i] = "enemy"; enemies--; } else kinds[i] = "empty";
    });
    const texts = shuffle(Array.from({ length: ROOM_TEXTS }, (_, i) => i + 1), r);
    const D = DIFF[level];
    rooms.forEach((rm, i) => {
      rm.kind = i === 0 ? "start" : i === goal ? "goal" : kinds[i];
      rm.desc = texts[i % ROOM_TEXTS];
      rm.done = rm.kind === "start" || rm.kind === "empty";
      rm.visited = false;
      rm.seen = false;
      rm.searched = false;
      if (rm.kind === "enemy" || rm.kind === "goal") {
        const base = rm.kind === "goal" ? GUARDIANS[setting] : pick(ENEMIES[setting], r);
        rm.enemy = { id: base.id, hp: Math.max(2, Math.round(base.hp * D.hpMul)), hpMax: Math.max(2, Math.round(base.hp * D.hpMul)), atk: base.atk + D.atk, def: base.def, dmg: base.dmg, xp: base.xp, gold: base.gold };
      }
      if (rm.kind === "chest") { rm.item = pick(LOOT, r); rm.trap = r() < 0.3; }
      if (rm.kind === "obstacle") { const o = pick(OBSTACLES[setting], r); rm.obstacle = { id: o[0], stat: o[1], diff: o[2] + D.check }; rm.item = pick(LOOT, r); }
    });
    return { setting, rooms, start: 0, goal };
  }

  function bfs(rooms, from) {
    const dist = rooms.map(() => Infinity);
    dist[from] = 0;
    const q = [from];
    while (q.length) {
      const a = q.shift();
      Object.values(rooms[a].exits).forEach((b) => { if (dist[b] === Infinity) { dist[b] = dist[a] + 1; q.push(b); } });
    }
    return dist;
  }

  // --- game -----------------------------------------------------------------------
  function newGame(hero, level, setting, seed) {
    const s = { hero, level, rng: (seed === undefined ? Math.floor(Math.random() * 4294967296) : seed) >>> 0, log: [], phase: "explore", fight: null, prev: null, hasGoal: false, turns: 0 };
    const r = rngFrom(s);
    const st = setting && SETTINGS.indexOf(setting) !== -1 ? setting : pick(SETTINGS, r);
    s.dungeon = generate(st, level, r);
    s.room = 0;
    // A fresh start: full life, a few healing potions (by difficulty).
    hero.hp = hero.hpMax;
    hero.pack = [];
    for (let i = 0; i < DIFF[level].potions; i++) hero.pack.push("potion");
    if (!hero.weapon) hero.weapon = null;
    enter(s, 0);
    log(s, { k: "start", goal: GOAL_ITEM[st], setting: st });
    return s;
  }

  // Log entries are numbered (q), so a page can tell which ones are new.
  function log(s, e) { s.logN = (s.logN || 0) + 1; e.q = s.logN; s.log.push(e); if (s.log.length > 40) s.log.splice(0, s.log.length - 40); }
  function here(s) { return s.dungeon.rooms[s.room]; }

  function enter(s, i) {
    s.prev = s.room === i ? s.prev : s.room;
    s.room = i;
    const rm = here(s);
    rm.visited = true;
    rm.seen = true;
    Object.values(rm.exits).forEach((b) => { s.dungeon.rooms[b].seen = true; });
    if ((rm.kind === "enemy" || rm.kind === "goal") && !rm.done) startFight(s);
  }

  function startFight(s) {
    const rm = here(s);
    s.phase = "fight";
    s.fight = { round: 0, abilityUsed: false, defend: false, sleep: 0, shield: 0 };
    log(s, { k: "meet", e: rm.enemy.id });
  }

  // A check: 2 dice + value (+ tool) against a difficulty. Returns the
  // numbers for the text ("7 + Agility 2 = 9, needed 8: success").
  function check(s, stat, diff, r) {
    const h = s.hero;
    const a = d6(r), b = d6(r);
    const tool = ITEMS.find((it) => it.kind === "tool" && it.v === stat && h.pack.indexOf(it.id) !== -1);
    const bonus = tool ? 2 : 0;
    let total = a + b + h.stats[stat] + bonus;
    let ok = total >= diff;
    let reroll = false;
    if (!ok && h.pack.indexOf("cloverleaf") !== -1) {
      h.pack.splice(h.pack.indexOf("cloverleaf"), 1);
      const c = d6(r), d = d6(r);
      reroll = true;
      total = c + d + h.stats[stat] + bonus;
      ok = total >= diff;
      return { dice: c + d, stat, value: h.stats[stat], tool: tool ? tool.id : null, bonus, total, diff, ok, reroll };
    }
    return { dice: a + b, stat, value: h.stats[stat], tool: tool ? tool.id : null, bonus, total, diff, ok, reroll };
  }

  // The choices in the current situation:
  //   explore: { type: "go", dir } for each exit, { type: "open" } (chest),
  //   { type: "try" } (obstacle), { type: "drink" } (well), { type: "search" }
  //   (once per room), { type: "take" } (goal item after the fight),
  //   { type: "leave" } (back at the entrance with the goal item);
  //   fight: attack, defend, item (with index), ability, flee;
  //   always (explore): use (item index), equip, drop.
  function choices(s) {
    if (s.phase === "won" || s.phase === "lost") return [];
    const rm = here(s), h = s.hero;
    const out = [];
    if (s.phase === "fight") {
      out.push({ type: "attack" }, { type: "defend" });
      h.pack.forEach((id, i) => { const it = ITEM[id]; if (it.kind === "heal" || it.kind === "scroll") out.push({ type: "item", index: i }); });
      if (!s.fight.abilityUsed) out.push({ type: "ability" });
      out.push({ type: "flee" });
      return out;
    }
    // Room actions first, then the ways.
    if (rm.kind === "chest" && !rm.done) out.push({ type: "open" });
    if (rm.kind === "obstacle" && !rm.done) out.push({ type: "try" });
    if (rm.kind === "well" && !rm.done) out.push({ type: "drink" });
    if (rm.kind === "goal" && rm.done && !s.hasGoal) out.push({ type: "take" });
    if (rm.kind === "start" && s.hasGoal) out.push({ type: "leave" });
    ["n", "e", "s", "w"].forEach((d) => { if (rm.exits[d] !== undefined) out.push({ type: "go", dir: d }); });
    if (!rm.searched && Object.keys(rm.exits).length < 3 && out.length < 3) out.push({ type: "search" });
    return out;
  }
  // Backpack actions (explore only): use a healing item or charm, equip a
  // weapon / armour, drop anything.
  function packActions(s) {
    if (s.phase !== "explore") return [];
    const out = [];
    s.hero.pack.forEach((id, i) => {
      const it = ITEM[id];
      if (it.kind === "heal" || it.kind === "charm" || (it.kind === "tool" && it.v === "map")) out.push({ type: "use", index: i });
      if (it.kind === "weapon" || it.kind === "armor") out.push({ type: "equip", index: i });
      if (it.kind !== "goal") out.push({ type: "drop", index: i });
    });
    return out;
  }

  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function isLegal(s, act) { return choices(s).some((a) => same(a, act)) || packActions(s).some((a) => same(a, act)); }

  function gainXp(s, n) {
    const h = s.hero;
    h.xp += n;
    const l = levelFor(h.xp);
    while (h.lvl < l) {
      h.lvl++;
      h.hpMax += 3;
      h.hp = Math.min(h.hpMax, h.hp + 3);
      log(s, { k: "levelup", lvl: h.lvl });
    }
  }

  function addItem(s, id) {
    const h = s.hero;
    if (h.pack.length >= BACKPACK) { log(s, { k: "packfull", item: id }); return false; }
    h.pack.push(id);
    // Better weapon / armour is put on at once.
    const it = ITEM[id];
    if (it.kind === "weapon" && (!h.weapon || ITEM[h.weapon].v < it.v)) equip(s, h.pack.length - 1, true);
    else if (it.kind === "armor" && (!h.armor || ITEM[h.armor].v < it.v)) equip(s, h.pack.length - 1, true);
    return true;
  }
  function equip(s, i, quiet) {
    const h = s.hero, id = h.pack[i], it = ITEM[id];
    const slot = it.kind === "weapon" ? "weapon" : "armor";
    h.pack.splice(i, 1);
    if (h[slot]) h.pack.push(h[slot]);
    h[slot] = id;
    if (!quiet) log(s, { k: "equip", item: id });
    else log(s, { k: "found_equip", item: id });
  }

  function heal(h, n) { const before = h.hp; h.hp = Math.min(h.hpMax, h.hp + n); return h.hp - before; }

  // Carries out an action (false: not allowed now).
  function apply(s, act) {
    if (!isLegal(s, act)) return false;
    const r = rngFrom(s);
    const h = s.hero, rm = here(s);
    s.turns++;
    switch (act.type) {
      case "go": {
        log(s, { k: "go", dir: act.dir });
        enter(s, rm.exits[act.dir]);
        break;
      }
      case "search": {
        rm.searched = true;
        const c = check(s, "wis", 9 + DIFF[s.level].check, r);
        if (c.ok) {
          const g = 1 + Math.floor(r() * 4);
          h.gold += g;
          log(s, { k: "search_ok", c, gold: g });
        } else log(s, { k: "search_none", c });
        break;
      }
      case "open": {
        rm.done = true;
        if (rm.trap) {
          const c = check(s, "dex", 8 + DIFF[s.level].check, r);
          if (!c.ok) { h.hp -= 2; log(s, { k: "trap_hit", c, n: 2 }); if (h.hp <= 0) return lose(s); }
          else log(s, { k: "trap_ok", c });
        }
        const g = 2 + Math.floor(r() * 5);
        h.gold += g;
        log(s, { k: "chest", item: rm.item, gold: g });
        addItem(s, rm.item);
        break;
      }
      case "try": {
        const o = rm.obstacle;
        const c = check(s, o.stat, o.diff, r);
        rm.done = true;
        if (c.ok) { log(s, { k: "obstacle_ok", o: o.id, c, item: rm.item }); addItem(s, rm.item); gainXp(s, 2); }
        else {
          const n = 1 + Math.floor(r() * 3);
          h.hp -= n;
          log(s, { k: "obstacle_fail", o: o.id, c, n });
          if (h.hp <= 0) return lose(s);
        }
        break;
      }
      case "drink": {
        rm.done = true;
        const n = heal(h, Math.ceil(h.hpMax / 2));
        log(s, { k: "drink", n });
        break;
      }
      case "take": {
        s.hasGoal = true;
        log(s, { k: "take", item: GOAL_ITEM[s.dungeon.setting] });
        break;
      }
      case "leave": {
        s.phase = "won";
        h.wins++;
        gainXp(s, 5);
        log(s, { k: "won", item: GOAL_ITEM[s.dungeon.setting], gold: h.gold });
        break;
      }
      case "use": {
        const id = h.pack[act.index], it = ITEM[id];
        h.pack.splice(act.index, 1);
        if (it.kind === "heal") log(s, { k: "heal", item: id, n: heal(h, it.v) });
        else if (it.kind === "charm") { h.stats[it.v] += 1; log(s, { k: "charm", item: id, stat: it.v }); }
        else if (it.v === "map") { s.dungeon.rooms.forEach((x) => { x.seen = true; }); log(s, { k: "lantern" }); }
        break;
      }
      case "equip": equip(s, act.index, false); break;
      case "drop": { const id = h.pack.splice(act.index, 1)[0]; log(s, { k: "drop", item: id }); break; }
      default: return fightAction(s, act, r);
    }
    return true;
  }

  // --- fighting ------------------------------------------------------------------
  function fightAction(s, act, r) {
    const h = s.hero, rm = here(s), en = rm.enemy, f = s.fight;
    f.round++;
    f.defend = false;
    if (act.type === "attack") {
      const a = d6(r) + d6(r), val = attackValue(h);
      const total = a + val;
      if (total >= en.def) {
        const dmg = d6(r) + weaponBonus(h) + Math.floor(h.stats[CLASSES[h.cls].attack] / 2);
        en.hp -= dmg;
        log(s, { k: "hit", dice: a, value: val, stat: CLASSES[h.cls].attack, total, need: en.def, n: dmg, e: en.id });
      } else log(s, { k: "miss", dice: a, value: val, stat: CLASSES[h.cls].attack, total, need: en.def, e: en.id });
    } else if (act.type === "defend") {
      f.defend = true;
      log(s, { k: "defend" });
    } else if (act.type === "item") {
      const id = h.pack[act.index], it = ITEM[id];
      h.pack.splice(act.index, 1);
      if (it.kind === "heal") log(s, { k: "heal", item: id, n: heal(h, it.v) });
      else if (it.v === "damage") { en.hp -= 6; log(s, { k: "scroll_damage", item: id, n: 6, e: en.id }); }
      else if (it.v === "sleep") { f.sleep = 2; log(s, { k: "scroll_sleep", item: id, e: en.id }); }
      else if (it.v === "shield") { f.shield = 3; log(s, { k: "scroll_shield", item: id }); }
      else if (it.v === "escape") { log(s, { k: "scroll_escape", item: id }); return escape(s); }
    } else if (act.type === "ability") {
      f.abilityUsed = true;
      const ab = CLASSES[h.cls].ability;
      if (ab === "powerstrike") {
        const a = d6(r) + d6(r), val = attackValue(h) + 2, total = a + val;
        if (total >= en.def) { const dmg = 2 * (d6(r) + weaponBonus(h)) + h.stats.str; en.hp -= dmg; log(s, { k: "powerstrike", dice: a, value: val, total, need: en.def, n: dmg, e: en.id }); }
        else log(s, { k: "powerstrike_miss", dice: a, value: val, total, need: en.def, e: en.id });
      } else if (ab === "ambush") {
        const dmg = d6(r) + weaponBonus(h) + h.stats.dex;
        en.hp -= dmg;
        f.sleep = Math.max(f.sleep, 1);
        log(s, { k: "ambush", n: dmg, e: en.id });
      } else if (ab === "heal") {
        log(s, { k: "healspell", n: heal(h, 4 + 2 * h.stats.wis) });
      } else {
        const dmg = d6(r) + d6(r) + h.stats.wis;
        en.hp -= dmg;
        log(s, { k: "spark", n: dmg, e: en.id });
      }
    } else if (act.type === "flee") {
      const c = check(s, "dex", 8 + DIFF[s.level].check, r);
      if (c.ok) { log(s, { k: "flee_ok", c }); return escape(s); }
      log(s, { k: "flee_fail", c });
    }
    if (en.hp <= 0) return winFight(s);
    // The enemy's turn.
    if (f.sleep > 0) { f.sleep--; log(s, { k: "enemy_sleeps", e: en.id }); return true; }
    const a = d6(r) + d6(r), total = a + en.atk;
    const need = defence(h) + (f.defend ? 3 : 0) + f.shield;
    if (total >= need) {
      let dmg = 1 + Math.floor(r() * en.dmg);
      if (f.defend) dmg = Math.floor(dmg / 2);
      h.hp -= dmg;
      log(s, { k: "enemy_hit", e: en.id, dice: a, atk: en.atk, total, need, n: dmg });
      if (h.hp <= 0) return lose(s);
    } else log(s, { k: "enemy_miss", e: en.id, dice: a, atk: en.atk, total, need });
    return true;
  }

  function escape(s) {
    // Back to the room one came from; the enemy stays and keeps the
    // damage it took.
    const back = s.prev !== null && s.prev !== undefined ? s.prev : s.dungeon.start;
    s.phase = "explore";
    s.fight = null;
    s.room = back;
    return true;
  }

  function winFight(s) {
    const rm = here(s), en = rm.enemy, h = s.hero;
    rm.done = true;
    s.phase = "explore";
    s.fight = null;
    h.gold += en.gold;
    log(s, { k: "enemy_gone", e: en.id, xp: en.xp, gold: en.gold });
    gainXp(s, en.xp);
    return true;
  }

  function lose(s) {
    s.hero.hp = 0;
    s.phase = "lost";
    s.fight = null;
    log(s, { k: "lost" });
    return true;
  }

  // After an adventure: the same hero again (level and values stay, life
  // full, backpack and gold of the last adventure are gone) or a new one.
  function keepHero(h) {
    const k = JSON.parse(JSON.stringify(h));
    k.hp = k.hpMax;
    k.gold = 0;
    k.pack = [];
    k.weapon = null;
    k.armor = null;
    return k;
  }

  // For the map: way to the entrance (compass).
  function wayHome(s) {
    const dist = bfs(s.dungeon.rooms, s.dungeon.start);
    const rm = here(s);
    let best = null;
    Object.keys(rm.exits).forEach((d) => { if (best === null || dist[rm.exits[d]] < dist[rm.exits[best]]) best = d; });
    return best;
  }

  return { SETTINGS, LEVELS, STATS, POINTS, STAT_MAX, BACKPACK, MAX_LEVEL, XP_FOR, CLASSES, CLASS_IDS, DIFF, ENEMIES, GUARDIANS, GOAL_ITEM,
    ITEMS, ITEM, LOOT, OBSTACLES, ROOM_TEXTS, GRID_W, GRID_H,
    makeRng, validStats, createHero, generate, bfs, newGame, choices, packActions, isLegal, apply, here, attackValue, defence, levelFor, keepHero, wayHome };
})();

if (typeof module !== "undefined" && module.exports) module.exports = AdventureCore;
if (typeof window !== "undefined") window.AdventureCore = AdventureCore;
