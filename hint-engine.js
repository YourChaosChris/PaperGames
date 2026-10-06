// hint-engine.js
// Step-by-step hints for the number puzzles that have their own solver
// (Sudoku, Killer Sudoku, Calcudoku, Number Blocks). Dependency-free, no
// DOM. A hint works on the player's current grid, never on a stored
// solution, and it never guesses: it only reports a step that follows by
// plain deduction, in this order of simplicity -
//   hidden - in a row/column/box/block a number has one cell left
//   naked  - a cell has one number left that its neighbours allow
//   cage   - a cage can only be completed with one number in that cell
//   deep   - repeated deduction (the three above, chained) pins it down
// If none applies the hint says so honestly ("stuck") instead of
// entering a value. Before looking for a step it checks the player's
// entries: a broken rule ("conflict") or a number that differs from the
// puzzle's one solution - worked out here from the givens alone -
// ("wrong") is reported first.
//
// A model describes one puzzle:
//   size      - number of cells
//   maxOf(i)  - highest digit cell i may hold (digits are 1..maxOf(i))
//   units     - [{ kind: "row"|"column"|"box"|"block", cells, values }]
//               every value in `values` appears exactly once in `cells`
//   cages     - [{ cells, distinct, test(vals) }] test() checks a
//               complete assignment of the cage (in `cells` order)
//   peers     - peers[i]: cells that may never hold the same digit as i

const HintEngine = (function () {
  function range(n) {
    const out = [];
    for (let v = 1; v <= n; v++) out.push(v);
    return out;
  }

  function finishModel(size, maxOf, units, cages, extraPairs) {
    const peers = [];
    for (let i = 0; i < size; i++) peers.push(new Set());
    units.forEach((u) => u.cells.forEach((a) => u.cells.forEach((b) => { if (a !== b) peers[a].add(b); })));
    cages.forEach((c) => {
      if (!c.distinct) return;
      c.cells.forEach((a) => c.cells.forEach((b) => { if (a !== b) peers[a].add(b); }));
    });
    (extraPairs || []).forEach(([a, b]) => { peers[a].add(b); peers[b].add(a); });
    return { size, maxOf, units, cages, peers: peers.map((s) => Array.from(s)) };
  }

  function rowsCols(n, units) {
    for (let r = 0; r < n; r++) {
      const cells = [];
      for (let c = 0; c < n; c++) cells.push(r * n + c);
      units.push({ kind: "row", cells, values: range(n) });
    }
    for (let c = 0; c < n; c++) {
      const cells = [];
      for (let r = 0; r < n; r++) cells.push(r * n + c);
      units.push({ kind: "column", cells, values: range(n) });
    }
  }

  function sudokuUnits() {
    const units = [];
    rowsCols(9, units);
    for (let b = 0; b < 9; b++) {
      const cells = [];
      const r0 = Math.floor(b / 3) * 3, c0 = (b % 3) * 3;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push((r0 + r) * 9 + c0 + c);
      units.push({ kind: "box", cells, values: range(9) });
    }
    return units;
  }

  function sudokuModel() {
    return finishModel(81, () => 9, sudokuUnits(), [], null);
  }

  // cages: [{ cells, sum }] - digits in a Killer cage never repeat.
  function killerModel(cages) {
    const kc = cages.map((cage) => ({
      cells: cage.cells.slice(),
      distinct: true,
      sum: cage.sum,
      test: (vals) => vals.reduce((a, b) => a + b, 0) === cage.sum
    }));
    const units = sudokuUnits();
    // The law of 45: every row, column and box adds up to 45, so the cells
    // of a unit not covered by cages lying wholly inside it add up to 45
    // minus those cages - a further (virtual) cage when it is small.
    units.forEach((u) => {
      const inside = cages.filter((cage) => cage.cells.every((i) => u.cells.indexOf(i) !== -1));
      const covered = new Set();
      inside.forEach((cage) => cage.cells.forEach((i) => covered.add(i)));
      const rest = u.cells.filter((i) => !covered.has(i));
      if (rest.length === 0 || rest.length > 4) return;
      const sum = 45 - inside.reduce((t, cage) => t + cage.sum, 0);
      kc.push({ cells: rest, distinct: true, sum, virtual: true, test: (vals) => vals.reduce((x, y) => x + y, 0) === sum });
    });
    return finishModel(81, () => 9, units, kc, null);
  }

  // cages: [{ cells, op, target }] with op "+", "-", "*", "/", "=".
  function calcudokuModel(n, cages) {
    const units = [];
    rowsCols(n, units);
    const cc = cages.map((cage) => ({
      cells: cage.cells.slice(),
      distinct: false,
      test: (vals) => {
        const t = cage.target;
        if (cage.op === "=") return vals[0] === t;
        if (cage.op === "+") return vals.reduce((a, b) => a + b, 0) === t;
        if (cage.op === "*") return vals.reduce((a, b) => a * b, 1) === t;
        const hi = Math.max(vals[0], vals[1]), lo = Math.min(vals[0], vals[1]);
        if (cage.op === "-") return hi - lo === t;
        if (cage.op === "/") return lo * t === hi;
        return false;
      }
    }));
    // Like the law of 45: a block of whole rows (or columns) holds each
    // digit once per line, so its digits add up to k * (1 + ... + n) and
    // multiply to (n!)^k. Take the "+" (or "*") and "=" cages touching
    // the block: the block's cells outside them ("innies") and those
    // cages' cells outside the block ("outies") then obey
    //   sum(innies) - sum(outies) = block total - cage totals
    // (and the same with products) - a further (virtual) cage when small.
    let fact = 1;
    for (let v = 2; v <= n; v++) fact *= v;
    const blocks = [];
    for (let k = 1; k < n; k++) {
      for (let s0 = 0; s0 + k <= n; s0++) {
        const rowsB = [], colsB = [];
        for (let r = s0; r < s0 + k; r++) for (let c = 0; c < n; c++) { rowsB.push(r * n + c); colsB.push(c * n + r); }
        blocks.push({ cells: rowsB, k }, { cells: colsB, k });
      }
    }
    const seen = new Set();
    [["+", (a, b) => a + b, 0, (k) => k * n * (n + 1) / 2],
     ["*", (a, b) => a * b, 1, (k) => Math.pow(fact, k)]].forEach(([op, f, unit, blockTotal]) => {
      blocks.forEach((blk) => {
        const inBlock = new Set(blk.cells);
        const known = cages.filter((cage) => (cage.op === op || cage.op === "=") && cage.cells.some((i) => inBlock.has(i)));
        const covered = new Set();
        known.forEach((cage) => cage.cells.forEach((i) => covered.add(i)));
        const innies = blk.cells.filter((i) => !covered.has(i));
        const outies = [];
        known.forEach((cage) => cage.cells.forEach((i) => { if (!inBlock.has(i)) outies.push(i); }));
        const cnt = innies.length + outies.length;
        if (cnt === 0 || cnt > 5) return;
        const key = op + innies.join(",") + "|" + outies.join(",");
        if (seen.has(key)) return;
        seen.add(key);
        const cageTotal = known.reduce((t, cage) => f(t, cage.target), unit);
        const cells = innies.concat(outies), ni = innies.length;
        const rest = blockTotal(blk.k);
        const vc = { cells, distinct: false, virtual: true };
        if (op === "+") {
          // sum(innies) - sum(outies) = rest - cageTotal
          const want = rest - cageTotal;
          vc.test = (vals) => { let t = 0; vals.forEach((v, j) => { t += j < ni ? v : -v; }); return t === want; };
          if (!outies.length) vc.sum = want;
        } else {
          // prod(innies) * cageTotal = rest * prod(outies)
          vc.test = (vals) => { let a = cageTotal, b = rest; vals.forEach((v, j) => { if (j < ni) a *= v; else b *= v; }); return a === b; };
        }
        cc.push(vc);
      });
    });
    return finishModel(n * n, () => n, units, cc, null);
  }

  // Number Blocks: a block of k cells holds 1..k; equal digits never
  // touch, not even diagonally.
  function numberBlocksModel(rows, cols, blocks) {
    const size = rows * cols;
    const max = new Array(size).fill(1);
    const units = blocks.map((cells) => {
      cells.forEach((i) => { max[i] = cells.length; });
      return { kind: "block", cells: cells.slice(), values: range(cells.length) };
    });
    const pairs = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (let dr = 0; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc <= 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr < rows && nc >= 0 && nc < cols) pairs.push([r * cols + c, nr * cols + nc]);
          }
        }
      }
    }
    return finishModel(size, (i) => max[i], units, [], pairs);
  }

  /*** Domains ***/

  function initialDomains(model, grid) {
    const d = [];
    for (let i = 0; i < model.size; i++) d.push(grid[i] ? [grid[i]] : range(model.maxOf(i)));
    return d;
  }

  // Removes every placed (or already single) digit from its peers.
  function eliminateSingles(model, d) {
    let changed = false;
    for (let i = 0; i < model.size; i++) {
      if (d[i].length !== 1) continue;
      const v = d[i][0];
      model.peers[i].forEach((p) => {
        const k = d[p].indexOf(v);
        if (k !== -1 && d[p].length > 1) { d[p].splice(k, 1); changed = true; }
      });
    }
    return changed;
  }

  // For each cell of a cage, the digits that appear in at least one
  // complete assignment of the cage that respects its test and the peers
  // inside the cage. Returns null if the cage cannot be completed.
  function cageSupport(model, cage, d, keep) {
    const cells = cage.cells;
    const support = cells.map(() => new Set());
    const vals = new Array(cells.length);
    let found = false;
    let assignments = 0;
    const inAll = new Map(); // digit -> number of assignments containing it
    const list = [];
    let budget = 400000;
    function rec(k) {
      if (--budget < 0) return;
      if (k === cells.length) {
        if (cage.test(vals)) {
          found = true;
          assignments++;
          vals.forEach((v, j) => support[j].add(v));
          if (keep && list.length < 3000) list.push(vals.slice());
          new Set(vals).forEach((v) => inAll.set(v, (inAll.get(v) || 0) + 1));
        }
        return;
      }
      const i = cells[k];
      for (const v of d[i]) {
        let ok = true;
        for (let j = 0; j < k; j++) {
          if (vals[j] === v && model.peers[i].indexOf(cells[j]) !== -1) { ok = false; break; }
        }
        if (!ok) continue;
        if (cage.sum !== undefined) {
          let s = v;
          for (let j = 0; j < k; j++) s += vals[j];
          if (s > cage.sum) continue;
        }
        vals[k] = v;
        rec(k + 1);
      }
    }
    rec(0);
    if (budget < 0) { const all = cells.map((i) => new Set(d[i])); all.required = []; return all; } // too big to tell
    if (!found) return null;
    support.required = Array.from(inAll.keys()).filter((v) => inAll.get(v) === assignments);
    if (keep && list.length < 3000) support.assignments = list;
    return support;
  }

  function applyCages(model, d) {
    let changed = false;
    for (const cage of model.cages) {
      const sup = cageSupport(model, cage, d);
      if (!sup) return null;
      cage.cells.forEach((i, j) => {
        const next = d[i].filter((v) => sup[j].has(v));
        if (next.length !== d[i].length) { d[i] = next; changed = true; }
      });
    }
    return changed;
  }

  function applyHidden(model, d) {
    let changed = false;
    for (const u of model.units) {
      for (const v of u.values) {
        const where = u.cells.filter((i) => d[i].indexOf(v) !== -1);
        if (where.length === 0) return null;
        if (where.length === 1 && d[where[0]].length > 1) { d[where[0]] = [v]; changed = true; }
      }
    }
    return changed;
  }

  // Locked candidates: if every cell of unit U that can still take v
  // lies in unit W as well, no other cell of W can take v.
  function applyLocked(model, d) {
    let changed = false;
    if (!model.intersections) {
      model.intersections = [];
      model.units.forEach((u, a) => model.units.forEach((w, b) => {
        if (a === b) return;
        const shared = u.cells.filter((i) => w.cells.indexOf(i) !== -1);
        if (shared.length > 1) model.intersections.push([u, w]);
      }));
    }
    for (const [u, w] of model.intersections) {
      for (const v of u.values) {
        if (w.values.indexOf(v) === -1) continue;
        const where = u.cells.filter((i) => d[i].indexOf(v) !== -1);
        if (where.length < 2 || !where.every((i) => w.cells.indexOf(i) !== -1)) continue;
        w.cells.forEach((i) => {
          if (u.cells.indexOf(i) !== -1) return;
          const k = d[i].indexOf(v);
          if (k !== -1) { d[i].splice(k, 1); changed = true; }
        });
      }
    }
    return changed;
  }

  // Removes v from every cell outside `where` that is a peer of all of
  // `where` - one of those cells must hold v, so such a cell never can.
  function eliminateCommonPeers(model, d, where, v) {
    let changed = false;
    if (!where.length) return false;
    let common = model.peers[where[0]].filter((p) => where.indexOf(p) === -1);
    for (let k = 1; k < where.length && common.length; k++) {
      const pk = model.peers[where[k]];
      common = common.filter((p) => pk.indexOf(p) !== -1);
    }
    common.forEach((p) => {
      const k = d[p].indexOf(v);
      if (k !== -1 && d[p].length > 1) { d[p].splice(k, 1); changed = true; }
    });
    return changed;
  }

  function applyCommonPeers(model, d) {
    let changed = false;
    for (const u of model.units) {
      for (const v of u.values) {
        const where = u.cells.filter((i) => d[i].indexOf(v) !== -1);
        if (where.length >= 2 && where.length <= 4 && eliminateCommonPeers(model, d, where, v)) changed = true;
      }
    }
    for (const cage of model.cages) {
      const sup = cageSupport(model, cage, d);
      if (!sup) return null;
      (sup.required || []).forEach((v) => {
        const where = cage.cells.filter((i, j) => sup[j].has(v));
        if (where.length >= 1 && eliminateCommonPeers(model, d, where, v)) changed = true;
      });
    }
    return changed;
  }

  // Fish (X-Wing k=2, Swordfish k=3) over the rows and columns: if in k
  // rows a digit fits only within the same k columns, those columns lose
  // it everywhere else (and the same with rows and columns swapped).
  function applyFish(model, d) {
    let changed = false;
    const rows = model.units.filter((u) => u.kind === "row");
    const cols = model.units.filter((u) => u.kind === "column");
    if (!rows.length || !cols.length) return false;
    const colOf = (i, lines) => lines.findIndex((l) => l.cells.indexOf(i) !== -1);
    [[rows, cols], [cols, rows]].forEach(([base, cover]) => {
      const values = base[0].values;
      values.forEach((v) => {
        const spots = base.map((l) => {
          const where = l.cells.filter((i) => d[i].length > 1 && d[i].indexOf(v) !== -1);
          if (l.cells.some((i) => d[i].length === 1 && d[i][0] === v)) return null;
          return where.map((i) => colOf(i, cover));
        });
        for (let k = 2; k <= 3; k++) {
          const cand = [];
          spots.forEach((sp, idx) => { if (sp && sp.length >= 2 && sp.length <= k) cand.push(idx); });
          combinations(cand, k, (lines) => {
            const coverSet = new Set();
            lines.forEach((idx) => spots[idx].forEach((c) => coverSet.add(c)));
            if (coverSet.size !== k) return;
            coverSet.forEach((c) => cover[c].cells.forEach((i) => {
              if (lines.some((idx) => base[idx].cells.indexOf(i) !== -1)) return;
              const pos = d[i].indexOf(v);
              if (pos !== -1 && d[i].length > 1) { d[i].splice(pos, 1); changed = true; }
            }));
          });
        }
      });
    });
    return changed;
  }

  // Chains of strong and weak links (alternating inference chains).
  // A strong link joins two candidates of which at least one is true: the
  // two digits of a cell with two left, or the two cells of a unit (or a
  // cage that needs the digit) where a digit has two places left. A weak
  // link joins two candidates that cannot both be true: two digits of one
  // cell, or one digit in two peer cells. If candidate A is false, the
  // chain makes every candidate it reaches by a strong link true; so A or
  // that candidate is true, and anything that sees both is false.
  function applyChains(model, d) {
    const n = model.size;
    const id = (i, v) => i * 16 + v;
    const strong = new Map();
    const addStrong = (a, b) => {
      if (!strong.has(a)) strong.set(a, new Set());
      if (!strong.has(b)) strong.set(b, new Set());
      strong.get(a).add(b); strong.get(b).add(a);
    };
    for (let i = 0; i < n; i++) if (d[i].length === 2) addStrong(id(i, d[i][0]), id(i, d[i][1]));
    const places = (cells, v) => cells.filter((i) => d[i].length > 1 && d[i].indexOf(v) !== -1);
    model.units.forEach((u) => u.values.forEach((v) => {
      if (u.cells.some((i) => d[i].length === 1 && d[i][0] === v)) return;
      const w = places(u.cells, v);
      if (w.length === 2) addStrong(id(w[0], v), id(w[1], v));
    }));
    model.cages.forEach((cage) => {
      const sup = cageSupport(model, cage, d);
      if (!sup) return;
      (sup.required || []).forEach((v) => {
        const w = cage.cells.filter((i, j) => sup[j].has(v) && d[i].length > 1);
        if (w.length === 2 && !cage.cells.some((i) => d[i].length === 1 && d[i][0] === v)) addStrong(id(w[0], v), id(w[1], v));
      });
    });
    // Inside a cage two candidates are also weakly linked when no way of
    // completing the cage holds both, and strongly linked when every way
    // holds one of them.
    const weak = new Map();
    const addWeak = (a, b) => {
      if (!weak.has(a)) weak.set(a, []);
      if (!weak.has(b)) weak.set(b, []);
      weak.get(a).push(b); weak.get(b).push(a);
    };
    model.cages.forEach((cage) => {
      const sup = cageSupport(model, cage, d, true);
      if (!sup || !sup.assignments) return;
      const list = sup.assignments, m = cage.cells.length;
      const open = [];
      for (let j = 0; j < m; j++) if (d[cage.cells[j]].length > 1) sup[j].forEach((v) => open.push([j, v]));
      for (let x = 0; x < open.length; x++) {
        for (let y = x + 1; y < open.length; y++) {
          const [ja, va] = open[x], [jb, vb] = open[y];
          if (ja === jb) continue;
          let both = 0, either = 0;
          list.forEach((vals) => {
            const a = vals[ja] === va, b = vals[jb] === vb;
            if (a && b) both++;
            if (a || b) either++;
          });
          const na = id(cage.cells[ja], va), nb = id(cage.cells[jb], vb);
          if (both === 0) addWeak(na, nb);
          if (either === list.length) addStrong(na, nb);
        }
      }
    });
    const weakOf = (node) => {
      const i = Math.floor(node / 16), v = node % 16, out = (weak.get(node) || []).slice();
      d[i].forEach((x) => { if (x !== v) out.push(id(i, x)); });
      model.peers[i].forEach((p) => { if (d[p].length > 1 && d[p].indexOf(v) !== -1) out.push(id(p, v)); });
      return out;
    };
    const sees = (a, b) => {
      const ia = Math.floor(a / 16), va = a % 16, ib = Math.floor(b / 16), vb = b % 16;
      if (ia === ib) return va !== vb;
      if (va === vb && model.peers[ia].indexOf(ib) !== -1) return true;
      return (weak.get(a) || []).indexOf(b) !== -1;
    };
    for (const start of strong.keys()) {
      // on: reached as true (given start false); off: reached as false
      const on = new Set(), off = new Set([start]);
      let frontierOff = [start];
      while (frontierOff.length) {
        const nextOn = [];
        frontierOff.forEach((x) => (strong.get(x) || []).forEach((y) => { if (!on.has(y)) { on.add(y); nextOn.push(y); } }));
        frontierOff = [];
        nextOn.forEach((y) => weakOf(y).forEach((z) => { if (!off.has(z)) { off.add(z); frontierOff.push(z); } }));
      }
      const si = Math.floor(start / 16), sv = start % 16;
      if (on.has(start)) { d[si] = [sv]; return true; } // start false leads to start true
      for (const z of on) {
        if (z === start) continue;
        const zi = Math.floor(z / 16), zv = z % 16;
        // remove every candidate that sees both start and z
        const cand = new Set([si, zi]);
        model.peers[si].forEach((p) => cand.add(p));
        (weak.get(start) || []).forEach((x) => cand.add(Math.floor(x / 16)));
        let changed = false;
        cand.forEach((c) => {
          d[c].slice().forEach((v) => {
            const x = id(c, v);
            if (x === start || x === z || d[c].length < 2) return;
            if (sees(x, start) && sees(x, z)) { d[c].splice(d[c].indexOf(v), 1); changed = true; }
          });
        });
        if (changed) return true;
      }
    }
    return false;
  }

  function combinations(arr, k, cb) {
    const pick = [];
    (function rec(start) {
      if (pick.length === k) { cb(pick.slice()); return; }
      for (let i = start; i < arr.length; i++) { pick.push(arr[i]); rec(i + 1); pick.pop(); }
    })(0);
  }

  // Naked groups: k cells of a unit that together can only take k
  // digits keep those digits for themselves. Hidden groups: k digits that
  // fit only in the same k cells of a unit push every other digit out.
  function applyGroups(model, d) {
    let changed = false;
    for (const u of model.units) {
      const open = u.cells.filter((i) => d[i].length > 1);
      for (let k = 2; k <= 4 && k < open.length; k++) {
        combinations(open.filter((i) => d[i].length <= k), k, (cells) => {
          const union = new Set();
          cells.forEach((i) => d[i].forEach((v) => union.add(v)));
          if (union.size !== k) return;
          open.forEach((i) => {
            if (cells.indexOf(i) !== -1) return;
            const next = d[i].filter((v) => !union.has(v));
            if (next.length !== d[i].length) { d[i] = next; changed = true; }
          });
        });
        if (k > 3) continue;
        const openVals = u.values.filter((v) => !u.cells.some((i) => d[i].length === 1 && d[i][0] === v));
        combinations(openVals, k, (vals) => {
          const where = new Set();
          open.forEach((i) => { if (vals.some((v) => d[i].indexOf(v) !== -1)) where.add(i); });
          if (where.size !== k) return;
          where.forEach((i) => {
            const next = d[i].filter((v) => vals.indexOf(v) !== -1);
            if (next.length !== d[i].length) { d[i] = next; changed = true; }
          });
        });
      }
    }
    return changed;
  }

  // Repeats every deduction until nothing changes. Returns false if the
  // grid turns out to be impossible.
  function propagate(model, d, full) {
    for (let guard = 0; guard < 500; guard++) {
      let changed = eliminateSingles(model, d);
      if (d.some((x) => x.length === 0)) return false;
      const h = applyHidden(model, d);
      if (h === null) return false;
      if (d.some((x) => x.length === 0)) return false;
      if (h || changed) continue;
      const c = applyCages(model, d);
      if (c === null) return false;
      if (d.some((x) => x.length === 0)) return false;
      if (c) continue;
      if (applyLocked(model, d)) continue;
      if (d.some((x) => x.length === 0)) return false;
      if (applyGroups(model, d)) continue;
      if (d.some((x) => x.length === 0)) return false;
      const cp = applyCommonPeers(model, d);
      if (cp === null) return false;
      if (d.some((x) => x.length === 0)) return false;
      if (cp) continue;
      if (applyFish(model, d)) continue;
      if (d.some((x) => x.length === 0)) return false;
      if (full && applyChains(model, d)) continue;
      if (d.some((x) => x.length === 0)) return false;
      return true;
    }
    return true;
  }

  // The puzzle's solution from its givens (propagation plus search).
  function solve(model, givens) {
    const d0 = initialDomains(model, givens);
    let nodes = 0;
    function search(d) {
      if (++nodes > 200000) return null;
      if (!propagate(model, d)) return null;
      let best = -1;
      for (let i = 0; i < model.size; i++) {
        if (d[i].length > 1 && (best === -1 || d[i].length < d[best].length)) best = i;
      }
      if (best === -1) return d.map((x) => x[0]);
      for (const v of d[best]) {
        const nd = d.map((x) => x.slice());
        nd[best] = [v];
        const r = search(nd);
        if (r) return r;
      }
      return null;
    }
    return search(d0);
  }

  // True when the whole puzzle follows from the givens by these
  // deductions alone - so every hint on the way finds a step. The pages
  // use it to pass over the rare generated puzzle that would need trying
  // things out.
  function solvable(model, givens) {
    const d = initialDomains(model, givens);
    if (!propagate(model, d, true)) return false;
    return d.every((x) => x.length === 1);
  }

  // Calls make() until ok(puzzle) holds, at most `tries` times, and
  // returns the last puzzle made - so a page never ends up without one.
  function pickSolvable(make, ok, tries) {
    let p = null;
    for (let k = 0; k < (tries || 20); k++) {
      p = make();
      if (ok(p)) return p;
    }
    return p;
  }

  /*** Checking the player's entries ***/

  function conflicts(model, grid) {
    const bad = new Set();
    for (let i = 0; i < model.size; i++) {
      if (!grid[i]) continue;
      model.peers[i].forEach((p) => { if (grid[p] === grid[i]) { bad.add(i); bad.add(p); } });
    }
    model.cages.forEach((cage) => {
      if (cage.virtual) return;
      if (cage.cells.every((i) => grid[i]) && !cage.test(cage.cells.map((i) => grid[i]))) {
        cage.cells.forEach((i) => bad.add(i));
      }
    });
    return Array.from(bad).sort((a, b) => a - b);
  }

  /*** Finding the next step ***/

  // Returns one of
  //   { kind: "conflict", cells }      a rule is broken
  //   { kind: "wrong", cell }          an entry differs from the solution
  //   { kind: "step", tech, cell, value, unit }   unit: the row/column/
  //                                    box/block or cage that decides it
  //   { kind: "done" }                 nothing left to fill
  //   { kind: "stuck" }                no step without trying things out
  // `solution` may be passed in (cached per puzzle); otherwise it is
  // worked out from `givens`.
  function findHint(model, grid, givens, solution) {
    const conf = conflicts(model, grid);
    if (conf.length) return { kind: "conflict", cells: conf };
    const sol = solution || solve(model, givens);
    if (sol) {
      for (let i = 0; i < model.size; i++) {
        if (grid[i] && !givens[i] && grid[i] !== sol[i]) return { kind: "wrong", cell: i };
      }
    }
    if (grid.every((v, i) => v || model.maxOf(i) === 0)) return { kind: "done" };

    const d = initialDomains(model, grid);
    eliminateSingles(model, d);
    if (d.some((x) => x.length === 0)) return { kind: "stuck" };

    // hidden single, units in their natural order
    for (const u of model.units) {
      for (const v of u.values) {
        if (u.cells.some((i) => grid[i] === v)) continue;
        const where = u.cells.filter((i) => !grid[i] && d[i].indexOf(v) !== -1);
        if (where.length === 1) return { kind: "step", tech: "hidden", cell: where[0], value: v, unit: u };
      }
    }
    // naked single
    for (let i = 0; i < model.size; i++) {
      if (!grid[i] && d[i].length === 1) return { kind: "step", tech: "naked", cell: i, value: d[i][0], unit: null };
    }
    // cage (only the real ones; the law-of-45 cages count as "deep")
    for (const cage of model.cages) {
      if (cage.virtual) continue;
      const sup = cageSupport(model, cage, d);
      if (!sup) return { kind: "stuck" };
      for (let j = 0; j < cage.cells.length; j++) {
        const i = cage.cells[j];
        if (!grid[i] && sup[j].size === 1) {
          return { kind: "step", tech: "cage", cell: i, value: sup[j].values().next().value, unit: cage };
        }
      }
    }
    // deep: chained deduction
    const dd = d.map((x) => x.slice());
    if (!propagate(model, dd, true)) return { kind: "stuck" };
    for (let i = 0; i < model.size; i++) {
      if (!grid[i] && dd[i].length === 1) return { kind: "step", tech: "deep", cell: i, value: dd[i][0], unit: null };
    }
    return { kind: "stuck" };
  }


  /*** Hashi ***/

  // A hint for Hashi works on bridge counts per connection (edge). Each
  // edge has a range lo..hi of bridges still possible: lo is what the
  // player has drawn, hi is 2 - or 0 when a bridge already crosses it.
  // Returns
  //   { kind: "wrong", edge }          a drawn bridge is not in the solution
  //   { kind: "step", tech, edge, island }  one more bridge must go on edge;
  //       tech "island" (the island's number alone forces it), "connect"
  //       (else the islands could not all be joined) or "deep" (chained)
  //   { kind: "done" } / { kind: "stuck" }
  // The bridge ranges and the rules that narrow them, for one board.
  function hashiRules(board, counts) {
    const E = board.edges, I = board.islands;
    const inc = I.map(() => []);
    E.forEach((e, id) => { inc[e.a].push(id); inc[e.b].push(id); });
    const lo = E.map((e, id) => counts[id] || 0);
    const hi = E.map((e, id) => (lo[id] > 0 || !e.crosses.some((x) => (counts[x] || 0) > 0)) ? 2 : 0);

    function crossing() {
      let ch = false;
      E.forEach((e, id) => {
        if (lo[id] > 0) e.crosses.forEach((x) => { if (hi[x] > 0) { hi[x] = 0; ch = true; } });
      });
      return ch;
    }
    // Upper bounds from the numbers: an edge can take at most what each
    // end still needs once its other edges hold their minimum.
    function capHigh() {
      let ch = false;
      I.forEach((isl, k) => {
        const sumLo = inc[k].reduce((t, id) => t + lo[id], 0);
        inc[k].forEach((id) => {
          const cap = isl.need - (sumLo - lo[id]);
          if (hi[id] > cap) { hi[id] = Math.max(cap, lo[id]); ch = true; }
        });
      });
      return ch;
    }
    // The island rule: what the other edges can hold at most still falls
    // short, so this edge needs more. Returns [edge, island] or null.
    function islandForce(apply) {
      for (let k = 0; k < I.length; k++) {
        const sumHi = inc[k].reduce((t, id) => t + hi[id], 0);
        for (const id of inc[k]) {
          const need = I[k].need - (sumHi - hi[id]);
          if (need > lo[id]) {
            if (!apply) return [id, k];
            lo[id] = Math.min(need, hi[id]);
            return [id, k];
          }
        }
      }
      return null;
    }
    // Islands joined by edges in `use` (a predicate on edge ids).
    function components(use) {
      const comp = new Array(I.length).fill(-1);
      let c = 0;
      for (let s0 = 0; s0 < I.length; s0++) {
        if (comp[s0] !== -1) continue;
        const stack = [s0];
        comp[s0] = c;
        while (stack.length) {
          const k = stack.pop();
          inc[k].forEach((id) => {
            if (!use(id)) return;
            const o = E[id].a === k ? E[id].b : E[id].a;
            if (comp[o] === -1) { comp[o] = c; stack.push(o); }
          });
        }
        c++;
      }
      return { comp, count: c };
    }
    // Connection rule: if leaving edge id empty splits the islands that
    // could still be joined, it needs a bridge.
    function connectForce(apply) {
      for (let id = 0; id < E.length; id++) {
        if (lo[id] > 0 || hi[id] === 0) continue;
        if (components((x) => x !== id && hi[x] > 0).count > 1) {
          if (apply) lo[id] = 1;
          return [id, E[id].a];
        }
      }
      return null;
    }
    // Closed groups: filling edge id to hi would close a group of islands
    // that are all full but not all islands - so hi is one too many.
    function closedGroups() {
      let ch = false;
      for (let id = 0; id < E.length; id++) {
        if (hi[id] === 0 || hi[id] === lo[id]) continue;
        const saved = lo[id];
        lo[id] = hi[id];
        const { comp } = components((x) => lo[x] > 0);
        const group = comp[E[id].a];
        let full = true, size = 0;
        for (let k = 0; k < I.length && full; k++) {
          if (comp[k] !== group) continue;
          size++;
          const sum = inc[k].reduce((t, x) => t + lo[x], 0);
          if (sum !== I[k].need) full = false;
        }
        lo[id] = saved;
        if (full && size < I.length) { hi[id]--; ch = true; }
      }
      return ch;
    }
    function bad() {
      if (lo.some((v, id) => v > hi[id])) return true;
      return I.some((isl, k) => {
        const a = inc[k].reduce((t, id) => t + lo[id], 0), b = inc[k].reduce((t, id) => t + hi[id], 0);
        return isl.need < a || isl.need > b;
      });
    }

    return { lo, hi, E, crossing, capHigh, islandForce, connectForce, closedGroups, bad };
  }

  // Every rule repeated until nothing changes. False if the board turns
  // out impossible.
  function hashiSettle(R) {
    for (let guard = 0; guard < 1000; guard++) {
      if (R.bad()) return false;
      if (R.crossing() || R.capHigh() || R.islandForce(true) || R.connectForce(true) || R.closedGroups()) continue;
      break;
    }
    return !R.bad();
  }

  // True when the whole puzzle follows from these rules alone, from an
  // empty board - so every hint on the way finds a step.
  function hashiSolvable(board) {
    const R = hashiRules(board, new Array(board.edges.length).fill(0));
    return hashiSettle(R) && R.lo.every((v, id) => v === R.hi[id]);
  }

  function hashiHint(core, board, counts, solution) {
    const sol = solution || core.solve(board);
    if (sol) {
      for (let e = 0; e < board.edges.length; e++) if ((counts[e] || 0) > sol[e]) return { kind: "wrong", edge: e };
    }
    if (core.isComplete(board, counts)) return { kind: "done" };
    const R = hashiRules(board, counts);
    const { lo, crossing, capHigh, islandForce, connectForce, bad } = R;
    const E = R.E;
    crossing();
    while (capHigh()) { /* settle the obvious upper bounds */ }
    if (bad()) return { kind: "stuck" };
    let f = islandForce(false);
    if (f) return { kind: "step", tech: "island", edge: f[0], island: f[1] };
    f = connectForce(false);
    if (f) return { kind: "step", tech: "connect", edge: f[0], island: f[1] };
    const start = lo.slice();
    if (!hashiSettle(R)) return { kind: "stuck" };
    for (let id = 0; id < E.length; id++) {
      if (lo[id] > start[id]) return { kind: "step", tech: "deep", edge: id, island: E[id].a };
    }
    return { kind: "stuck" };
  }

  /*** Texts ***/

  // The English status text for stage 1-3 of a hint (I18n.msg translates
  // it through the msg_t_hint_* templates). opts: { cols, flavor:
  // "sudoku" | "killer" | "calcudoku" | "numberblocks", cageLabel(cage) }.
  function describe(h, stage, opts) {
    const cols = opts.cols;
    const rc = (i) => [Math.floor(i / cols) + 1, i % cols + 1];
    if (h.kind === "conflict") return "Some entries break a rule. The cells involved are marked.";
    if (h.kind === "wrong") {
      const [r, c] = rc(h.cell);
      return "The number in row " + r + ", column " + c + " does not belong there. Remove it, then ask for a hint again.";
    }
    if (h.kind === "stuck") return "From here, no step follows without trying things out. The hint does not guess.";
    if (h.kind !== "step") return "";
    const [r, c] = rc(h.cell);
    if (stage === 3) return "Entered " + h.value + " in row " + r + ", column " + c + ".";
    if (h.tech === "hidden") {
      const u = h.unit;
      if (stage === 1) {
        if (u.kind === "row") return "In row " + r + ", one number has only one cell left. The cell is marked.";
        if (u.kind === "column") return "In column " + c + ", one number has only one cell left. The cell is marked.";
        if (u.kind === "box") return "In this box, one number has only one cell left. The cell is marked.";
        return "In this block, one number has only one cell left. The cell is marked.";
      }
      return "The " + h.value + " is still missing there, and every other free cell is ruled out for it. So the " + h.value + " goes in the marked cell.";
    }
    if (h.tech === "naked") {
      if (stage === 1) return "Only one number fits the marked cell (row " + r + ", column " + c + ").";
      if (opts.flavor === "killer") return "Its row, column, box and cage already contain every other number. Only the " + h.value + " is left.";
      if (opts.flavor === "calcudoku") return "Its row and column already contain every other number. Only the " + h.value + " is left.";
      if (opts.flavor === "numberblocks") return "Its block and the cells touching it already contain every other number. Only the " + h.value + " is left.";
      return "Its row, column and box already contain every other number. Only the " + h.value + " is left.";
    }
    if (h.tech === "cage") {
      if (stage === 1) return "The cage of the marked cell (row " + r + ", column " + c + ") leaves only one number for it.";
      return "Every way to fill the cage " + opts.cageLabel(h.unit) + " that obeys the rules puts the " + h.value + " here.";
    }
    if (stage === 1) return "The marked cell (row " + r + ", column " + c + ") can be worked out without trying anything.";
    return "Ruling out numbers step by step, through pairs of cells and either-or chains, leaves only the " + h.value + " here. No guessing is needed.";
  }

  function describeHashi(h, stage, board) {
    if (h.kind === "wrong") return "The bridge between the two marked islands is not part of the solution. Remove it, then ask for a hint again.";
    if (h.kind === "stuck") return "From here, no step follows without trying things out. The hint does not guess.";
    if (h.kind !== "step") return "";
    const isl = board.islands[h.island];
    if (stage === 1) return "The two marked islands need another bridge between them.";
    if (stage === 3) return "Bridge added.";
    if (h.tech === "island") return "The island in row " + (isl.row + 1) + ", column " + (isl.col + 1) + " needs " + isl.need + " bridges. Its other connections cannot hold enough, so this one needs another bridge.";
    if (h.tech === "connect") return "Without a bridge here, the islands could no longer all be connected.";
    return "Ruling out bridges step by step, from the numbers, the crossings and the rule that all islands connect, forces another bridge here. No guessing is needed.";
  }

  // Three presses per step: 1 marks the place, 2 gives the reason, 3
  // enters it. A new step (or a changed board) starts again at 1.
  function createSession() {
    let key = null, stage = 0, hint = null;
    return {
      next(stateKey, compute) {
        if (stateKey !== key || !hint || hint.kind !== "step" || stage >= 3) {
          key = stateKey;
          hint = compute();
          stage = 1;
        } else {
          stage++;
        }
        return { hint, stage };
      },
      reset() { key = null; stage = 0; hint = null; }
    };
  }

  return { sudokuModel, killerModel, calcudokuModel, numberBlocksModel, findHint, solve, solvable, pickSolvable, conflicts, propagate, hashiHint, hashiSolvable, describe, describeHashi, createSession };
})();

if (typeof window !== "undefined") window.HintEngine = HintEngine;
if (typeof module !== "undefined" && module.exports) module.exports = HintEngine;
