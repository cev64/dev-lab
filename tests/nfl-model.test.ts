// Tests for the NFL snapshot model (docs/specs/nfl-snapshot.md, v2).
// Run: npm test   (node --experimental-strip-types --test 'tests/**/*.test.ts' ...)

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, buildNflSnapshot, toFree, SCORE_WEIGHTS, MATCHUP_WEIGHTS } from "../convex/model/nfl.ts";
import type { NflInputs, NflSnapshot, Player } from "../convex/model/nfl.ts";

// Fixtures keep upstream nflverse basenames; .gz files are gunzipped here, outside the model.
const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const rd = (f: string) => {
  const buf = readFileSync(join(fixtures, f));
  return (f.endsWith(".gz") ? gunzipSync(buf) : buf).toString("utf8");
};
const inputs: NflInputs = {
  stats: rd("stats_player_week_2026.csv"),
  games: rd("games_2026.csv"),
  pbp: rd("play_by_play_2026.csv.gz"),
  snaps: rd("snap_counts_2026.csv"),
  pfrRec: rd("advstats_week_rec_2026.csv"),
  pfrRush: rd("advstats_week_rush_2026.csv"),
  pfrPass: rd("advstats_week_pass_2026.csv"),
  ngsRec: rd("ngs_receiving.csv.gz"),
  ngsRush: rd("ngs_rushing.csv.gz"),
  ngsPass: rd("ngs_passing.csv.gz"),
  injuries: rd("injuries_2026.csv"),
};
const OPTS = { season: 2026, generatedAt: "2026-10-09T00:00:00.000Z" };

const t0 = performance.now();
const snap: NflSnapshot = buildNflSnapshot(inputs, OPTS);
const buildMs = performance.now() - t0;
const free = toFree(snap);
const byId = new Map(snap.players.map((p) => [p.id, p]));
const byName = (n: string) => snap.players.find((p) => p.name === n) as Player;
const POS = ["QB", "RB", "WR", "TE"] as const;
const JSN = "00-0038543"; // Jaxon Smith-Njigba, SEA WR

const close = (actual: number, expected: number, tol = 0.006) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
const inRange = (v: number | null | undefined, lo: number, hi: number, label: string) => {
  if (v === null || v === undefined) return;
  assert.ok(Number.isFinite(v) && v >= lo && v <= hi, `${label}=${v} not in [${lo}, ${hi}]`);
};

// ---------------------------------------------------------------------------
// v1 contract
// ---------------------------------------------------------------------------

test("parseCsv handles quoted commas, escaped quotes, CRLF, blank lines and column projection", () => {
  const csv = 'a,b,c\r\n1,"x, y",3\r\n\r\n"say ""hi""",,"multi\nline"\n4,5,\n';
  assert.deepEqual(parseCsv(csv), [
    { a: "1", b: "x, y", c: "3" },
    { a: 'say "hi"', b: "", c: "multi\nline" },
    { a: "4", b: "5", c: "" },
  ]);
  assert.deepEqual(parseCsv(csv, ["a", "c"]), [
    { a: "1", c: "3" },
    { a: 'say "hi"', c: "multi\nline" },
    { a: "4", c: "" },
  ]);
  // Real fixture: headshot URLs contain commas inside quotes ("f_auto,q_auto").
  const stats = parseCsv(inputs.stats);
  assert.equal(stats.length, 4449);
  const rodgers = stats.find((r) => r.player_id === "00-0023459" && r.week === "1")!;
  assert.match(rodgers.headshot_url, /f_auto,q_auto/);
  assert.equal(rodgers.team, "PIT");
});

test("builds well under a second with every input", () => {
  assert.ok(buildMs < 1000, `build took ${buildMs.toFixed(0)} ms`);
});

test("header fields", () => {
  assert.equal(snap.sport, "nfl");
  assert.equal(snap.version, 2);
  assert.equal(snap.season, 2026);
  assert.equal(snap.throughWeek, 4);
  assert.equal(snap.tier, "pro");
  assert.equal(snap.source, "Data: nflverse (CC-BY 4.0)");
  assert.deepEqual(snap.playoffWeeks, [15, 16, 17]);
  assert.deepEqual(snap.inputs, ["stats", "games", "pbp", "snaps", "pfrRec", "pfrRush", "pfrPass", "ngsRec", "ngsRush", "ngsPass", "injuries"]);
});

test("players: fantasy positions only, >= 1 game, sorted by ppg desc", () => {
  assert.ok(snap.players.length > 300);
  for (const p of snap.players) {
    assert.ok(POS.includes(p.pos), `bad pos ${p.pos} for ${p.name}`);
    assert.ok(p.games >= 1 && p.games <= 4);
    assert.ok(p.id && p.name && p.team);
  }
  for (let i = 1; i < snap.players.length; i++) assert.ok(snap.players[i - 1].ppg >= snap.players[i].ppg);
  assert.equal(new Set(snap.players.map((p) => p.id)).size, snap.players.length);
});

test("32 defenses with ease in 0..100 per position", () => {
  assert.equal(snap.defenses.length, 32);
  assert.equal(new Set(snap.defenses.map((d) => d.team)).size, 32);
  for (const pos of POS) {
    const eases = snap.defenses.map((d) => d.ease[pos]);
    for (const e of eases) assert.ok(e >= 0 && e <= 100);
    assert.equal(Math.min(...eases), 0);
    assert.equal(Math.max(...eases), 100);
    // More points allowed => easier (all teams have 4 games, so shrinkage keeps the order).
    const sorted = snap.defenses.slice().sort((a, b) => a.allowedPpg[pos] - b.allowedPpg[pos]);
    for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].ease[pos] >= sorted[i - 1].ease[pos]);
  }
});

test("shares are within 0..1 and null where not meaningful", () => {
  for (const p of snap.players) {
    for (const k of ["tgtShare", "tgtShareL3", "airShare", "rushShare", "rushShareL3"] as const) inRange(p[k], 0, 1, `${p.name} ${k}`);
    if (p.pos === "QB") assert.equal(p.tgtShare, null);
    if (p.pos === "WR" || p.pos === "TE") assert.equal(p.rushShare, null);
    inRange(p.wopr, 0, 2.2, `${p.name} wopr`);
    inRange(p.trend, -1, 1, `${p.name} trend`);
  }
});

test("known player: Jaxon Smith-Njigba matches hand-computed CSV values", () => {
  // stats CSV weeks 1-4 PPR: 26.2, 42.5, 35.36, 12.6 -> 116.66 / 4 = 29.165; L3 = 90.46 / 3 = 30.153
  // touches (rec + carries): 8, 9, 10, 5 -> 8.0 per game
  const p = byId.get(JSN)!;
  assert.equal(p.name, "Jaxon Smith-Njigba");
  assert.equal(p.pos, "WR");
  assert.equal(p.team, "SEA");
  assert.equal(p.games, 4);
  close(p.ppg, 29.165);
  close(p.ppgL3, 30.153);
  assert.equal(p.touchesPg, 8);
  assert.ok(p.headshot?.startsWith("https://"));
});

test("remaining schedule excludes played weeks and byes; ease matches defense table", () => {
  const games = parseCsv(inputs.games).filter((g) => g.season === "2026" && g.game_type === "REG");
  const ease = new Map(snap.defenses.map((d) => [d.team, d.ease]));
  for (const p of snap.players) {
    const expected = games
      .filter((g) => Number(g.week) > 4 && (g.home_team === p.team || g.away_team === p.team))
      .map((g) => Number(g.week))
      .sort((a, b) => a - b);
    assert.deepEqual(p.schedule!.map((g) => g.week), expected, p.name);
    for (const g of p.schedule!) {
      assert.ok(g.week > snap.throughWeek);
      assert.notEqual(g.opp, p.team);
      assert.equal(g.ease, ease.get(g.opp)![p.pos]);
    }
  }
  // SEA: bye in week 11, so 13 remaining games (weeks 5-18 minus 11).
  const jsn = byId.get(JSN)!;
  assert.ok(!jsn.schedule!.some((g) => g.week === 11));
  assert.equal(jsn.schedule!.length, 13);
  assert.deepEqual(jsn.schedule![0], { week: 5, opp: "SF", home: true, ease: ease.get("SF")!.WR });
});

test("playoffEase is the mean of weeks 15-17 ease; rosEase the mean of all remaining", () => {
  for (const p of snap.players) {
    const po = p.schedule!.filter((g) => [15, 16, 17].includes(g.week));
    if (po.length === 0) assert.equal(p.playoffEase, null);
    else close(p.playoffEase!, po.reduce((a, g) => a + g.ease, 0) / po.length);
    close(p.rosEase!, p.schedule!.reduce((a, g) => a + g.ease, 0) / p.schedule!.length);
  }
});

test("risers/fallers obey min-sample rules and are disjoint", () => {
  assert.equal(snap.risers.length, 10);
  assert.equal(snap.fallers.length, 10);
  const check = (ids: string[], sign: 1 | -1) => {
    let prev = Infinity;
    for (const id of ids) {
      const p = byId.get(id) as Player;
      assert.ok(p, `unknown id ${id}`);
      assert.ok(p.games >= 3, `${p.name} games=${p.games}`);
      assert.ok(p.ppg >= 5, `${p.name} ppg=${p.ppg}`);
      assert.ok(sign * p.trend >= 0, `${p.name} trend=${p.trend}`);
      assert.ok(sign * p.trend <= prev + 0.01, "ordered by trend");
      prev = sign * p.trend;
    }
  };
  check(snap.risers, 1);
  check(snap.fallers, -1);
  const r = new Set(snap.risers);
  assert.ok(!snap.fallers.some((id) => r.has(id)));
});

// ---------------------------------------------------------------------------
// v2: expected points, opportunity, efficiency, role, team context, score
// ---------------------------------------------------------------------------

test("xFP is calibrated: league xFP ~ actual PPR for skill players (within 10%)", () => {
  const sum = (ps: Player[], f: (p: Player) => number) => ps.reduce((a, p) => a + f(p) * p.games, 0);
  const skill = snap.players.filter((p) => p.pos !== "QB");
  const ratio = sum(skill, (p) => p.xfp!) / sum(skill, (p) => p.ppg);
  console.log(`  xFP / actual PPR (RB+WR+TE): ${ratio.toFixed(3)}`);
  assert.ok(Math.abs(ratio - 1) < 0.1, `skill ratio ${ratio}`);
  for (const pos of POS) {
    const ps = snap.players.filter((p) => p.pos === pos);
    const r = sum(ps, (p) => p.xfp!) / sum(ps, (p) => p.ppg);
    assert.ok(Math.abs(r - 1) < 0.1, `${pos} ratio ${r}`);
  }
});

test("xFP / FPOE / xfpRank are consistent and in range", () => {
  for (const pos of POS) {
    const ps = snap.players.filter((p) => p.pos === pos);
    const ranks = ps.map((p) => p.xfpRank!).sort((a, b) => a - b);
    assert.deepEqual(ranks, ps.map((_, i) => i + 1), `${pos} ranks 1..n`);
    const top = ps.find((p) => p.xfpRank === 1)!;
    assert.equal(top.xfp, Math.max(...ps.map((p) => p.xfp!)));
  }
  for (const p of snap.players) {
    inRange(p.xfp, 0, 45, `${p.name} xfp`);
    inRange(p.xfpL3, 0, 45, `${p.name} xfpL3`);
    close(p.fpoe!, p.ppg - p.xfp!, 0.011); // fpoe = actual - expected, per game
    inRange(p.fpoe, -30, 40, `${p.name} fpoe`);
  }
  // Volume WR1 should carry a big xFP: JSN had 42 targets in 4 games.
  assert.ok(byId.get(JSN)!.xfp! > 15);
});

test("opportunity quality: hand-checked JSN values and ranges", () => {
  // pbp fixture: JSN 42 targets, 414 air yards -> aDOT 9.857; 6 targets reached the end zone.
  const o = byId.get(JSN)!.opp!;
  close(o.adot!, 9.857);
  assert.equal(o.ezTgt, 6);
  assert.equal(o.hvtPg, 10.5); // (0 carries inside 10 + 42 targets) / 4
  for (const p of snap.players) {
    const q = p.opp!;
    assert.ok(q, `${p.name} has opp block`);
    for (const k of ["rzTgtShare", "rzCarShare", "i10CarShare", "tgtShare3D2M"] as const) inRange(q[k], 0, 1, `${p.name} ${k}`);
    inRange(q.adot, -10, 50, `${p.name} adot`);
    inRange(q.hvtPg, 0, 30, `${p.name} hvtPg`);
    if (q.ezTgt !== undefined) assert.ok(Number.isInteger(q.ezTgt) && q.ezTgt >= 0);
    if (p.pos !== "RB") assert.equal(q.tgtShare3D2M, undefined);
    if (p.pos === "QB") assert.equal(q.adot, undefined);
  }
});

test("role: snap share hand-checked (JSN 203 of 247 SEA snaps) and in range", () => {
  close(byId.get(JSN)!.snapShare!, 203 / 247, 0.001);
  const withSnaps = snap.players.filter((p) => p.snapShare !== null);
  assert.ok(withSnaps.length / snap.players.length > 0.9, "most players join to snap counts");
  for (const p of snap.players) {
    inRange(p.snapShare, 0, 1, `${p.name} snapShare`);
    inRange(p.snapShareL3, 0, 1, `${p.name} snapShareL3`);
    inRange(p.tgtPerSnap, 0, 1, `${p.name} tgtPerSnap`);
  }
  // Starting QBs play (nearly) every snap.
  assert.ok(byName("Josh Allen").snapShare! > 0.95);
});

test("efficiency block: every metric in a sane range, position-appropriate", () => {
  for (const p of snap.players) {
    const e = p.eff!;
    assert.ok(e && e.n >= 0, p.name);
    const big = e.n >= 10; // per-play EPA is wild on tiny samples
    if (big) for (const k of ["epaTgt", "epaRush", "epaDb"] as const) inRange(e[k], -2, 2, `${p.name} ${k}`);
    for (const k of ["srTgt", "srRush", "srDb", "roePct", "dropPct", "pressure"] as const) inRange(e[k], 0, 1, `${p.name} ${k}`);
    if (big) inRange(e.cpoe, -40, 40, `${p.name} cpoe`);
    inRange(e.yacoe, -10, 15, `${p.name} yacoe`);
    inRange(e.sep, 0, 10, `${p.name} sep`);
    inRange(e.cushion, 0, 20, `${p.name} cushion`);
    inRange(e.ryoe, -10, 10, `${p.name} ryoe`);
    inRange(e.ybc, -10, 20, `${p.name} ybc`);
    inRange(e.yaco, -10, 20, `${p.name} yaco`);
    inRange(e.brkTkl, 0, 100, `${p.name} brkTkl`);
    inRange(e.drops, 0, 50, `${p.name} drops`);
    inRange(e.ttt, 1.5, 5, `${p.name} ttt`);
    inRange(e.aggr, 0, 100, `${p.name} aggr`);
    if (p.pos !== "QB") for (const k of ["epaDb", "cpoe", "ttt", "aggr", "pressure"] as const) assert.equal(e[k], undefined);
    if (p.pos === "QB") for (const k of ["epaTgt", "sep", "drops"] as const) assert.equal(e[k], undefined);
  }
  // Coverage: sources actually joined.
  const has = (f: (p: Player) => unknown) => snap.players.filter((p) => f(p) !== undefined).length;
  assert.ok(has((p) => p.eff!.cpoe) >= 32, "cpoe for starting QBs");
  assert.ok(has((p) => p.eff!.sep) >= 100, "NGS receiving joined");
  assert.ok(has((p) => p.eff!.ryoe) >= 40, "NGS rushing joined");
  assert.ok(has((p) => p.eff!.ttt) >= 32, "NGS passing joined");
  assert.ok(has((p) => p.eff!.yaco) >= 80, "PFR rushing joined");
  assert.ok(has((p) => p.eff!.drops) >= 250, "PFR receiving joined");
  assert.ok(has((p) => p.eff!.pressure) >= 32, "PFR passing joined");
});

test("teams: 32 offenses with plausible context", () => {
  assert.equal(snap.teams.length, 32);
  for (const t of snap.teams) {
    assert.equal(t.games, 4);
    inRange(t.playsPg, 45, 85, `${t.team} playsPg`);
    inRange(t.secPerPlay, 20, 45, `${t.team} secPerPlay`);
    inRange(t.passRate, 0.3, 0.8, `${t.team} passRate`);
    inRange(t.proe, -0.25, 0.25, `${t.team} proe`);
    inRange(t.rzTripsPg, 0, 8, `${t.team} rzTripsPg`);
    for (const k of ["epaPlay", "epaPass", "epaRush"] as const) inRange(t[k], -0.8, 0.8, `${t.team} ${k}`);
  }
  // hand-checked: SEA ran 234 pass/run plays (no 2-pt tries) in 4 games
  assert.equal(snap.teams.find((t) => t.team === "SEA")!.playsPg, 58.5);
  // every player's team has a context row
  const teams = new Set(snap.teams.map((t) => t.team));
  assert.ok(snap.players.every((p) => teams.has(p.team)));
});

test("defense EPA allowed and matchupEase blend", () => {
  for (const d of snap.defenses) {
    inRange(d.epaPass, -1, 1, `${d.team} epaPass`);
    inRange(d.epaRush, -1, 1, `${d.team} epaRush`);
    for (const pos of POS) {
      inRange(d.matchupEase[pos], 0, 100, `${d.team} matchupEase.${pos}`);
      const w = MATCHUP_WEIGHTS[pos];
      close(w.fp + w.pass + w.rush, 1, 1e-9);
    }
  }
  // The worst pass defense by EPA should be an easier WR matchup than its fp-only ease alone suggests.
  const worstPass = snap.defenses.slice().sort((a, b) => b.epaPass! - a.epaPass!)[0];
  assert.ok(worstPass.matchupEase.WR >= worstPass.ease.WR * MATCHUP_WEIGHTS.WR.fp + 0.4 * 90);
});

test("injury status comes from the next week's report", () => {
  const baker = byName("Baker Mayfield");
  assert.deepEqual(baker.injury, { status: "Out", body: "Thumb" }); // week-5 report in the fixture
  const statuses = new Set(snap.players.filter((p) => p.injury).map((p) => p.injury!.status));
  for (const s of statuses) assert.ok(["Out", "Doubtful", "Questionable"].includes(s), s);
  assert.equal(byId.get(JSN)!.injury, null);
});

test("Fieldglass Score: 0..100, equals the weighted sum of its stored parts", () => {
  close(SCORE_WEIGHTS.opp + SCORE_WEIGHTS.eff + SCORE_WEIGHTS.trend + SCORE_WEIGHTS.sched, 1, 1e-9);
  for (const p of snap.players) {
    const s = p.scoreParts!;
    for (const k of ["opp", "eff", "trend", "sched"] as const) inRange(s[k], 0, 100, `${p.name} part ${k}`);
    inRange(p.score, 0, 100, `${p.name} score`);
    const w = SCORE_WEIGHTS;
    close(p.score!, w.opp * s.opp + w.eff * s.eff + w.trend * s.trend + w.sched * s.sched, 0.06);
  }
  // A one-game spot starter shouldn't crack the top 5 at his position (games/(games+1) damping).
  for (const pos of POS) {
    const top5 = snap.players.filter((p) => p.pos === pos).sort((a, b) => b.score! - a.score!).slice(0, 5);
    assert.ok(top5.every((p) => p.games >= 2), `${pos} top 5: ${top5.map((p) => `${p.name}(${p.games})`).join(", ")}`);
  }
});

test("optional inputs: stats + games alone still build (v2 fields degrade to null/empty)", () => {
  const s = buildNflSnapshot({ stats: inputs.stats, games: inputs.games }, OPTS);
  assert.deepEqual(s.inputs, ["stats", "games"]);
  assert.equal(s.players.length, snap.players.length);
  assert.deepEqual(s.teams, []);
  const p = s.players.find((x) => x.id === JSN)!;
  assert.equal(p.xfp, null);
  assert.equal(p.fpoe, null);
  assert.equal(p.opp, null);
  assert.equal(p.snapShare, null);
  assert.equal(p.injury, null);
  assert.ok(p.score !== null && p.scoreParts!.eff === 50);
  for (const d of s.defenses) assert.deepEqual(d.matchupEase, d.ease);
  // v1 numbers are unchanged by the extra inputs
  assert.equal(p.ppg, byId.get(JSN)!.ppg);
  assert.deepEqual(s.risers, snap.risers);
  // a single missing file only removes its own metrics
  const noSnaps = buildNflSnapshot({ ...inputs, snaps: undefined }, OPTS);
  const q = noSnaps.players.find((x) => x.id === JSN)!;
  assert.equal(q.snapShare, null);
  assert.equal(q.xfp, byId.get(JSN)!.xfp);
});

// ---------------------------------------------------------------------------
// Free tier and size
// ---------------------------------------------------------------------------

test("toFree: free keeps usage/xFP/snaps/score/teams; Pro fields only for the top 12 per position", () => {
  assert.equal(free.tier, "free");
  assert.equal(snap.tier, "pro", "input not mutated");
  assert.equal(free.players.length, snap.players.length);
  assert.deepEqual(free.risers, snap.risers);
  assert.deepEqual(free.fallers, snap.fallers);
  assert.deepEqual(free.defenses, snap.defenses);
  assert.deepEqual(free.teams, snap.teams);
  const PRO = ["schedule", "rosEase", "playoffEase", "fpoe", "fpoeL3", "eff", "scoreParts"] as const;
  const FREE = ["ppg", "ppgL3", "trend", "wopr", "tgtShare", "rushShare", "xfp", "xfpL3", "xfpRank", "opp", "snapShare",
    "snapShareL3", "tgtPerSnap", "injury", "score"] as const;
  for (const pos of POS) {
    const proPos = snap.players.filter((p) => p.pos === pos);
    const freePos = free.players.filter((p) => p.pos === pos);
    freePos.forEach((p, i) => {
      const src = proPos[i];
      assert.equal(p.id, src.id);
      for (const k of FREE) assert.deepEqual(p[k], src[k], `${p.name} ${k}`);
      for (const k of PRO) {
        if (i < 12) assert.deepEqual(p[k], src[k], `teaser ${p.name} ${k}`);
        else assert.equal(p[k], null, `${p.name} ${k} should be stripped`);
      }
    });
    assert.equal(freePos.filter((p) => p.eff !== null).length, 12);
  }
  assert.ok(snap.players.every((p) => Array.isArray(p.schedule) && p.eff !== null));
});

test("snapshot JSON size is reasonable", () => {
  const proKb = Buffer.byteLength(JSON.stringify(snap)) / 1024;
  const freeKb = Buffer.byteLength(JSON.stringify(free)) / 1024;
  console.log(`  snapshot size: pro ${proKb.toFixed(1)} KB, free ${freeKb.toFixed(1)} KB, build ${buildMs.toFixed(0)} ms`);
  assert.ok(proKb < 1200, `pro ${proKb.toFixed(1)} KB`);
  assert.ok(freeKb < proKb * 0.7);
});
