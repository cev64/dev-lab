// Trim raw nflverse downloads into small test fixtures: only the columns the model reads
// (NFL_COLUMNS), season 2026 regular season, weeks 1..THROUGH (injuries: 1..THROUGH+1),
// and NGS week 0 (season aggregate) dropped. Files keep their upstream names (.gz stays gzipped).
//
//   node --experimental-strip-types scripts/trim-nfl-fixtures.ts <rawDir> [throughWeek=4]
//
// <rawDir> holds the files as downloaded from
// https://github.com/nflverse/nflverse-data/releases/download/ (see docs/specs/nfl-snapshot.md).

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, NFL_COLUMNS } from "../convex/model/nfl.ts";
import type { NflInputs } from "../convex/model/nfl.ts";

const [rawDir, tw = "4"] = process.argv.slice(2);
if (!rawDir) throw new Error("usage: trim-nfl-fixtures.ts <rawDir> [throughWeek]");
const through = Number(tw);
const SEASON = 2026;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "tests", "fixtures");

// Fixtures keep the UPSTREAM basenames (the backend smoke test serves them by that name).
const files: [keyof NflInputs, string, boolean][] = [
  ["pbp", "play_by_play_2026.csv.gz", true],
  ["snaps", "snap_counts_2026.csv", false],
  ["pfrRec", "advstats_week_rec_2026.csv", false],
  ["pfrRush", "advstats_week_rush_2026.csv", false],
  ["pfrPass", "advstats_week_pass_2026.csv", false],
  ["ngsRec", "ngs_receiving.csv.gz", true],
  ["ngsRush", "ngs_rushing.csv.gz", true],
  ["ngsPass", "ngs_passing.csv.gz", true],
  ["injuries", "injuries_2026.csv", false],
];

const esc = (v: string) => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);

for (const [key, src, gz] of files) {
  const dst = src;
  const buf = readFileSync(join(rawDir, src));
  const text = (src.endsWith(".gz") ? gunzipSync(buf) : buf).toString("utf8");
  const cols = NFL_COLUMNS[key];
  const maxWeek = key === "injuries" ? through + 1 : through;
  let rows = parseCsv(text, cols).filter((r) => {
    const w = Number(r.week);
    const type = r.season_type || r.game_type;
    return Number(r.season) === SEASON && (!type || type === "REG") && w >= 1 && w <= maxWeek;
  });
  // snaps: offensive players only (defense/special-teams rows don't affect any metric)
  if (key === "snaps") rows = rows.filter((r) => Number(r.offense_snaps) > 0);
  const present = cols.filter((c) => rows.length === 0 || c in rows[0]);
  const csv = [present.join(","), ...rows.map((r) => present.map((c) => esc(r[c] ?? "")).join(","))].join("\n") + "\n";
  const out = join(outDir, dst);
  writeFileSync(out, gz ? gzipSync(csv, { level: 9 }) : csv);
  console.log(`${dst.padEnd(24)} ${String(rows.length).padStart(6)} rows  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}
