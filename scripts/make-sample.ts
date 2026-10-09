// Build the NFL snapshot from the test fixtures and write the FREE-tier sample the site
// uses for local dev. Never writes a pro snapshot into site/.
//
//   node --experimental-strip-types scripts/make-sample.ts [generatedAt]
//
// Also prints sizes and sanity-check lists (movers, WR playoff schedules, xFP / FPOE leaders).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildNflSnapshot, toFree } from "../convex/model/nfl.ts";
import type { NflInputs, NflSnapshot, Player } from "../convex/model/nfl.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Read every fixture (gunzipping .gz) into the model's input bag. */
export function loadFixtureInputs(dir = join(root, "tests", "fixtures")): NflInputs {
  const rd = (f: string) => {
    const buf = readFileSync(join(dir, f));
    return (f.endsWith(".gz") ? gunzipSync(buf) : buf).toString("utf8");
  };
  return {
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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const generatedAt = process.argv[2] ?? new Date().toISOString();
  const inputs = loadFixtureInputs();
  const t0 = performance.now();
  const pro: NflSnapshot = buildNflSnapshot(inputs, { season: 2026, generatedAt });
  const ms = performance.now() - t0;
  const free = toFree(pro);

  const outPath = join(root, "site", "data", "sample-nfl-free.json");
  mkdirSync(dirname(outPath), { recursive: true });
  const freeJson = JSON.stringify(free);
  writeFileSync(outPath, freeJson + "\n");

  const kb = (s: string) => (Buffer.byteLength(s) / 1024).toFixed(1) + " KB";
  console.log(`built in ${ms.toFixed(0)} ms: season ${pro.season}, throughWeek ${pro.throughWeek}, ` +
    `${pro.players.length} players, ${pro.defenses.length} defenses, ${pro.teams.length} teams`);
  console.log(`inputs: ${pro.inputs.join(", ")}`);
  console.log(`pro  snapshot: ${kb(JSON.stringify(pro))} (not written)`);
  console.log(`free snapshot: ${kb(freeJson)} -> ${outPath}`);

  const byId = new Map(pro.players.map((p) => [p.id, p]));
  const line = (p: Player) =>
    `  ${p.name.padEnd(24)} ${p.pos} ${p.team.padEnd(3)} g=${p.games} ppg=${p.ppg} L3=${p.ppgL3} trend=${p.trend}`;
  console.log("\nTop 5 risers:");
  pro.risers.slice(0, 5).forEach((id) => console.log(line(byId.get(id)!)));
  console.log("Top 5 fallers:");
  pro.fallers.slice(0, 5).forEach((id) => console.log(line(byId.get(id)!)));

  const wrTeams = new Map<string, Player>();
  for (const p of pro.players) if (p.pos === "WR" && p.playoffEase !== null && !wrTeams.has(p.team)) wrTeams.set(p.team, p);
  const po = [...wrTeams.values()].sort((a, b) => b.playoffEase! - a.playoffEase!);
  const poLine = (p: Player) =>
    `  ${p.team.padEnd(3)} ease=${String(p.playoffEase).padEnd(6)} ` +
    p.schedule!.filter((g) => pro.playoffWeeks.includes(g.week)).map((g) => `W${g.week} ${g.home ? "vs" : "@"} ${g.opp}`).join(", ");
  console.log("\nWR playoff schedule (weeks 15-17), easiest 5:");
  po.slice(0, 5).forEach((p) => console.log(poLine(p)));
  console.log("WR playoff schedule, hardest 5:");
  po.slice(-5).reverse().forEach((p) => console.log(poLine(p)));

  // xFP / FPOE leaders per position (min 3 games so one-week flukes don't dominate)
  for (const pos of ["QB", "RB", "WR", "TE"] as const) {
    const g = pro.players.filter((p) => p.pos === pos && p.games >= 3 && p.xfp !== null);
    const fmt = (p: Player) => `${p.name} ${p.team} (${p.xfp}/${p.fpoe! >= 0 ? "+" : ""}${p.fpoe})`;
    console.log(`\n${pos} xFP/g top 10 (xfp/fpoe): ` + g.slice().sort((a, b) => b.xfp! - a.xfp!).slice(0, 10).map(fmt).join("; "));
    console.log(`${pos} FPOE/g top 10 (xfp/fpoe): ` + g.slice().sort((a, b) => b.fpoe! - a.fpoe!).slice(0, 10).map(fmt).join("; "));
    console.log(`${pos} Fieldglass top 5: ` + pro.players.filter((p) => p.pos === pos).sort((a, b) => b.score! - a.score!)
      .slice(0, 5).map((p) => `${p.name} ${p.score} ${JSON.stringify(p.scoreParts)}`).join("; "));
  }
  console.log("\nTeams (PROE top 5): " + pro.teams.slice().sort((a, b) => b.proe! - a.proe!).slice(0, 5)
    .map((t) => `${t.team} proe=${t.proe} pace=${t.secPerPlay}s plays=${t.playsPg} rz=${t.rzTripsPg} epa=${t.epaPlay}`).join("; "));
  console.log("Teams (PROE bottom 5): " + pro.teams.slice().sort((a, b) => a.proe! - b.proe!).slice(0, 5)
    .map((t) => `${t.team} proe=${t.proe} pace=${t.secPerPlay}s`).join("; "));
}
