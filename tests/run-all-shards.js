// run-all-shards.js - no server or browser needed.
// Checks the split of tests/run-all.sh into parallel parts: for 1 to 6 parts
// every test of tests/test-list.txt stands in exactly one part, none is
// missing, no file is listed twice, every file exists, and the heaviest tests
// are spread over different parts. Also: run-all.sh uses nothing that bash 3.2
// or macOS lacks.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
let bad = 0;
function check(ok, msg) { if (!ok) { bad++; console.log("FAIL: " + msg); } }

const entries = fs.readFileSync(path.join(root, "tests", "test-list.txt"), "utf8")
  .split("\n").filter((l) => l.trim() && !/^\s*#/.test(l))
  .map((l, i) => { const p = l.trim().split(/\s+/); return { idx: i + 1, weight: Number(p[0]), file: p[1], key: p.slice(1).join(" ") }; });
check(entries.length > 0, "test-list.txt is empty");
const seen = {};
entries.forEach((e) => {
  check(Number.isFinite(e.weight) && e.weight > 0, e.file + ": weight is not a positive number");
  check(fs.existsSync(path.join(root, "tests", e.file)), e.file + " does not exist");
  check(!seen[e.key], e.key + " is listed twice");
  seen[e.key] = true;
  seen[e.file] = true;
});

// Every check script that run-all.sh is meant to run is in the list: files
// named in the old run-all.sh style are all listed; helpers are exempt.
const helpers = /^(lib|eink-sim|run-all-shards)\.js$|^_/;
const unlisted = fs.readdirSync(path.join(root, "tests")).filter((f) => /\.js$/.test(f) && !helpers.test(f) && !seen[f]);
if (process.env.SHOW_UNLISTED) console.log("not in the list (info): " + unlisted.join(" "));

for (let n = 1; n <= 6; n++) {
  const out = execFileSync("bash", [path.join(root, "tests", "run-all.sh"), "--plan"], { env: Object.assign({}, process.env, { SHARDS: String(n) }), encoding: "utf8" });
  const lines = out.trim().split("\n");
  check(lines[0] === "SHARDS " + n, "n=" + n + ": first line is '" + lines[0] + "'");
  const part = {};
  lines.slice(1).forEach((l) => {
    const m = /^TEST (\d+) (\d+)$/.exec(l);
    check(!!m, "n=" + n + ": bad plan line '" + l + "'");
    if (!m) return;
    const idx = Number(m[1]), s = Number(m[2]);
    check(s >= 1 && s <= n, "n=" + n + ": test " + idx + " in part " + s);
    check(!(idx in part), "n=" + n + ": test " + idx + " in two parts");
    part[idx] = s;
  });
  entries.forEach((e) => check(e.idx in part, "n=" + n + ": " + e.file + " is in no part"));
  check(Object.keys(part).length === entries.length, "n=" + n + ": plan has " + Object.keys(part).length + " tests, list has " + entries.length);
  const heavy = entries.slice().sort((a, b) => b.weight - a.weight).slice(0, n);
  const parts = {}; heavy.forEach((e) => { parts[part[e.idx]] = true; });
  check(Object.keys(parts).length === Math.min(n, heavy.length), "n=" + n + ": the " + n + " heaviest tests share a part");
  const load = {}; entries.forEach((e) => { load[part[e.idx]] = (load[part[e.idx]] || 0) + e.weight; });
  const vals = Object.keys(load).map((k) => load[k]);
  console.log("n=" + n + ": loads " + vals.join(", "));
}

const src = fs.readFileSync(path.join(root, "tests", "run-all.sh"), "utf8").split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
[/\bwait -n\b/, /\bmapfile\b/, /\breadarray\b/, /\bdeclare -A\b/, /\bsetsid\b/, /\bss -/, /xargs -r/, /readlink -f/, /sed -i/, /date -d/, /pgrep -f/].forEach((re) => check(!re.test(src), "run-all.sh uses " + re));


// Retry logic with a small fake list: a test that fails once is run once more
// and named ("WIEDERHOLT: ..." and the summary line before the last line);
// a test that fails twice keeps the run red; the last line is exactly
// "ALL CHECKS PASS" only without a final failure.
const os = require("os");
const { spawnSync } = require("child_process");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pg-retry-"));
fs.writeFileSync(path.join(tmp, "ok.js"), 'console.log("ok");\n');
fs.writeFileSync(path.join(tmp, "once.js"), 'const fs=require("fs"),m=process.argv[2];if(fs.existsSync(m)){console.log("second ok");}else{fs.writeFileSync(m,"x");console.log("first fails");process.exit(1);}\n');
fs.writeFileSync(path.join(tmp, "always.js"), 'console.log("always fails");process.exit(1);\n');
function runList(lines, extra) {
  fs.writeFileSync(path.join(tmp, "list.txt"), lines.join("\n") + "\n");
  const r = spawnSync("bash", [path.join(root, "tests", "run-all.sh")], { encoding: "utf8", env: Object.assign({}, process.env, { SHARDS: "2", PORT: "8061", TEST_LIST: path.join(tmp, "list.txt"), TESTS_DIR: tmp, RETRY: "1" }, extra || {}) });
  return { code: r.status, lines: (r.stdout || "").trim().split("\n") };
}
const marker = path.join(tmp, "marker");
let r = runList(["1 ok.js", "1 once.js " + marker]);
check(r.code === 0, "retry: a test that passes the second time should keep the run green (exit " + r.code + ")");
check(r.lines[r.lines.length - 1] === "ALL CHECKS PASS", "retry: last line is '" + r.lines[r.lines.length - 1] + "'");
check(r.lines.some((l) => /^WIEDERHOLT: once\.js/.test(l)), "retry: no 'WIEDERHOLT: once.js' line");
check(r.lines[r.lines.length - 2] === "1 Test(s) wiederholt: once.js", "retry: summary line before the last line is '" + r.lines[r.lines.length - 2] + "'");
r = runList(["1 ok.js", "1 always.js"]);
check(r.code === 1 && r.lines[r.lines.length - 1] !== "ALL CHECKS PASS", "retry: a test that fails twice must keep the run red");
check(r.lines.filter((l) => l === "always fails").length === 2, "retry: always.js should run exactly twice");
fs.rmSync(tmp, { recursive: true, force: true });

if (bad) { console.log(bad + " problem(s)"); process.exit(1); }
console.log("run-all-shards: " + entries.length + " tests, 1 to 6 parts, each test in exactly one part, ok");
