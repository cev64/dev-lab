// End-to-end backend test against a local, account-free Convex backend (CONVEX_AGENT_MODE=anonymous).
// Starts a mock Lemon Squeezy + nflverse server, pushes functions, sets env vars, exercises every route.
import { spawn, execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
process.env.CONVEX_AGENT_MODE ??= "anonymous";
const fixtures = join(root, "tests/fixtures");
const results = [];
const ok = (name, cond, extra = "") => {
  results.push([cond ? "ok  " : "FAIL", name, extra]);
  console.log(`${cond ? "ok  " : "FAIL"} ${name} ${extra}`);
};

// ---- mock upstreams ----
const FIXTURE_ROUTES = {
  "/nflverse/stats_player/stats_player_week_2026.csv": "stats_player_week_2026.csv",
  "/nflverse/schedules/games.csv": "games_2026.csv",
};
const mock = createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (process.env.SMOKE_DEBUG) console.log("mock", req.method, url.pathname);
  if (url.pathname === "/v1/licenses/validate") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const key = new URLSearchParams(body).get("license_key");
      const good = key === "GOOD-KEY-123", other = key === "OTHER-STORE-KEY";
      res.writeHead(good || other ? 200 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify(good || other
        ? { valid: true, license_key: { status: "active" }, meta: { store_id: other ? 999 : 111, product_id: 222 } }
        : { valid: false, error: "license_key not found" }));
    });
    return;
  }
  if (url.pathname.startsWith("/nflverse/")) {
    const rel = FIXTURE_ROUTES[url.pathname] ?? url.pathname.replace("/nflverse/", "").split("/").pop();
    const f = join(fixtures, rel);
    if (existsSync(f)) { res.writeHead(200); res.end(readFileSync(f)); return; }
  }
  res.writeHead(404); res.end("nope");
});
await new Promise((r) => mock.listen(0, "127.0.0.1", r));
const mockBase = `http://127.0.0.1:${mock.address().port}`;

// ---- local convex backend ----
const dev = spawn("npx", ["convex", "dev", "--tail-logs", "disable"], { cwd: root, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
let devOut = "";
dev.stdout.on("data", (d) => (devOut += d));
dev.stderr.on("data", (d) => (devOut += d));
const t0 = Date.now();
while (!/Convex functions ready/.test(devOut)) {
  if (Date.now() - t0 > 180000 || dev.exitCode !== null) { console.error(devOut); process.exit(1); }
  await new Promise((r) => setTimeout(r, 500));
}
const envLocal = readFileSync(join(root, ".env.local"), "utf8");
const SITE = envLocal.match(/CONVEX_SITE_URL=(\S+)/)?.[1];
const cx = (...args) => {
  try {
    return execFileSync("npx", ["convex", ...args], { cwd: root, env: process.env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (e) {
    throw new Error(`convex ${args.join(" ")} failed:\n${e.stdout}\n${e.stderr}`);
  }
};

const WEBHOOK_SECRET = "whsec_test_0123456789abcdef";
const METRICS_TOKEN = "metrics_test_token_0123456789abcdef";
const ADMIN_TOKEN = "admin_test_token_0123456789abcdef0";
for (const [k, v] of Object.entries({
  LEMONSQUEEZY_API_BASE: mockBase, LEMONSQUEEZY_STORE_ID: "111", LEMONSQUEEZY_PRODUCT_IDS: "222,333",
  LEMONSQUEEZY_WEBHOOK_SECRET: WEBHOOK_SECRET, METRICS_TOKEN, ADMIN_TOKEN, NFLVERSE_BASE: `${mockBase}/nflverse`,
  NFL_SEASON: "2026", SITE_URL: "https://example.com",
})) cx("env", "set", k, v);

try {
  // Unique client IP per run so rate-limit buckets from earlier runs don't leak in.
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const get = (p, h = {}) => fetch(SITE + p, { headers: { "X-Forwarded-For": ip, ...h } });
  const post = (p, body, h = {}) => fetch(SITE + p, { method: "POST", body, headers: { "X-Forwarded-For": ip, ...h } });
  const json = { "Content-Type": "application/json" };

  ok("health", (await get("/health")).status === 200);
  ok("cors preflight", (await fetch(SITE + "/subscribe", { method: "OPTIONS" })).headers.get("access-control-allow-origin") === "*");

  // analytics (local data persists across runs, so measure deltas)
  const today = new Date().toISOString().slice(0, 10);
  const before = JSON.parse(cx("run", "events:rollup", JSON.stringify({ day: today })));
  const runPath = `/smoke-${Date.now()}/`;
  ok("beacon accepted", (await post("/e", JSON.stringify({ n: "view", p: runPath + "?x=1", r: "www.google.com", s: "X" }))).status === 204);
  await post("/e", JSON.stringify({ n: "evil", p: "/" }));
  await post("/e", "not json");
  const roll = JSON.parse(cx("run", "events:rollup", JSON.stringify({ day: today })));
  ok("rollup counts views only from allowed names", roll.counts.view === (before.counts.view ?? 0) + 1 && !roll.counts.evil, JSON.stringify(roll.counts));
  ok("rollup strips query + www", roll.topPaths.some((t) => t.key === runPath) && roll.topRefs.some((t) => t.key === "google.com") && roll.topSources.some((t) => t.key === "x"));

  // email list
  ok("subscribe rejects bad email", (await post("/subscribe", JSON.stringify({ email: "nope" }), json)).status === 400);
  ok("subscribe accepts email", (await post("/subscribe", JSON.stringify({ email: "Fan@Example.com", source: "home" }), json)).status === 200);
  ok("subscribe idempotent", (await post("/subscribe", JSON.stringify({ email: "fan@example.com" }), json)).status === 200);

  // data refresh (from fixtures via mock nflverse)
  const r = JSON.parse(cx("run", "refresh:nfl", "{}"));
  ok("refresh builds snapshot", r.players > 100 && r.throughWeek >= 1, `players=${r.players} week=${r.throughWeek}`);
  ok("refresh got every input", r.missing.length === 0, JSON.stringify(r.missing));
  ok("admin refresh needs token", (await post("/admin/refresh", "", { Authorization: "Bearer wrong" })).status === 401);
  const ar = await post("/admin/refresh", "", { Authorization: `Bearer ${ADMIN_TOKEN}` });
  ok("admin refresh works", ar.status === 200 && (await ar.json()).ok === true);

  const free = await get("/nfl/free");
  const freeJson = await free.json();
  ok("free snapshot served", free.status === 200 && freeJson.tier === "free" && freeJson.players.length > 100);

  // license gate
  ok("pro without key -> 403", (await get("/nfl/pro")).status === 403);
  ok("pro with bad key -> 403", (await get("/nfl/pro?key=BAD-KEY-000")).status === 403);
  ok("pro with other store's key -> 403", (await get("/nfl/pro?key=OTHER-STORE-KEY")).status === 403);
  const pro = await get("/nfl/pro?key=GOOD-KEY-123");
  const proJson = pro.status === 200 ? await pro.json() : {};
  ok("pro with good key -> pro snapshot", pro.status === 200 && proJson.tier === "pro");
  const act = await post("/license/activate", JSON.stringify({ key: "GOOD-KEY-123" }), json);
  ok("activate good key", act.status === 200 && (await act.json()).ok === true);
  ok("activate bad key", (await post("/license/activate", JSON.stringify({ key: "BAD-KEY-000" }), json)).status === 403);
  const csv = await (await get("/nfl.csv?key=GOOD-KEY-123&table=defenses")).text();
  ok("csv defenses feed", csv.split("\n").filter(Boolean).length === 33, `${csv.split("\n").length} lines`);
  ok("csv players feed", (await (await get("/nfl.csv?key=GOOD-KEY-123")).text()).startsWith("name,pos,team"));
  ok("csv without key -> 403", (await get("/nfl.csv?table=players")).status === 403);

  // webhook (unique order ids per run)
  const m0 = await (await get("/metrics?days=7", { Authorization: `Bearer ${METRICS_TOKEN}` })).json();
  const oid = String(Date.now());
  const order = (event, id, extra = {}) => JSON.stringify({
    meta: { event_name: event },
    data: { id, attributes: { status: "paid", total: 900, currency: "USD", user_email: "buyer@example.com", test_mode: false,
      first_order_item: { product_name: "NFL Season Pass" }, ...extra } },
  });
  const sign = (b) => createHmac("sha256", WEBHOOK_SECRET).update(b).digest("hex");
  const b1 = order("order_created", oid);
  ok("webhook bad signature -> 401", (await post("/webhooks/lemonsqueezy", b1, { "X-Signature": "00" })).status === 401);
  ok("webhook order_created", (await post("/webhooks/lemonsqueezy", b1, { "X-Signature": sign(b1) })).status === 200);
  await post("/webhooks/lemonsqueezy", b1, { "X-Signature": sign(b1) }); // retry
  const b2 = order("order_created", oid + "-t", { test_mode: true });
  await post("/webhooks/lemonsqueezy", b2, { "X-Signature": sign(b2) });

  // metrics
  ok("metrics needs token", (await get("/metrics")).status === 401);
  let m = await (await get("/metrics?days=7", { Authorization: `Bearer ${METRICS_TOKEN}` })).json();
  ok("metrics counts one real order (dedup, test excluded)", m.sales.lifetimeOrders === m0.sales.lifetimeOrders + 1 && m.sales.lifetimeRevenueCents === m0.sales.lifetimeRevenueCents + 900 && m.sales.testOrders >= 1, JSON.stringify(m.sales));
  ok("metrics list counts", m.list.pending >= 1, JSON.stringify(m.list));
  ok("metrics data block", m.data?.throughWeek >= 1);
  const b3 = order("order_refunded", oid);
  await post("/webhooks/lemonsqueezy", b3, { "X-Signature": sign(b3) });
  m = await (await get("/metrics", { Authorization: `Bearer ${METRICS_TOKEN}` })).json();
  ok("refund removes revenue", m.sales.lifetimeOrders === m0.sales.lifetimeOrders, JSON.stringify(m.sales));
} catch (e) {
  ok("unexpected error", false, e.stack);
  try {
    console.log(execFileSync("npx", ["convex", "logs", "--history", "15"], { cwd: root, env: process.env, encoding: "utf8", timeout: 15000 }));
  } catch (le) { console.log(String(le.stdout ?? "")); }
} finally {
  dev.kill("SIGINT");
  mock.close();
  try { execFileSync("pkill", ["-f", ["convex", "local", "backend"].join("-")]); } catch { /* not running */ }
}
const failed = results.filter((r) => r[0] === "FAIL");
console.log(`\n${results.length - failed.length}/${results.length} backend checks passed`);
process.exit(failed.length ? 1 : 0);
