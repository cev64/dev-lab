"use node";
// Nightly data job: download nflverse files, build the snapshot, store gzipped JSON + CSV feeds.
import { gunzipSync, gzipSync } from "node:zlib";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { buildNflSnapshot, toFree, type NflSnapshot } from "./model/nfl";

// NFLVERSE_BASE override exists so the smoke test can serve fixtures offline.
const NFLVERSE = () => process.env.NFLVERSE_BASE ?? "https://github.com/nflverse/nflverse-data/releases/download";

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  if (!url.endsWith(".gz")) return res.text();
  return gunzipSync(new Uint8Array(await res.arrayBuffer())).toString("utf8");
}

// Optional inputs: a missing or broken file degrades the snapshot instead of failing it.
async function maybeText(url: string, missing: string[], name: string): Promise<string | undefined> {
  try {
    return await getText(url);
  } catch (e) {
    missing.push(`${name}: ${(e as Error).message}`);
    return undefined;
  }
}

function csvCell(x: unknown): string {
  if (x === null || x === undefined) return "";
  const s = String(x);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function playersCsv(s: NflSnapshot): string {
  const cols = ["name", "pos", "team", "games", "ppg", "ppgL3", "tgtShare", "tgtShareL3", "airShare", "wopr", "woprL3",
    "rushShare", "rushShareL3", "touchesPg", "trend", "rosEase", "playoffEase"] as const;
  const rows = s.players.map((p: any) => cols.map((c) => csvCell(p[c])).join(","));
  return [cols.join(","), ...rows].join("\n") + "\n";
}

export function defensesCsv(s: NflSnapshot): string {
  const pos = ["QB", "RB", "WR", "TE"] as const;
  const head = ["team", ...pos.map((p) => `allowed_${p}`), ...pos.map((p) => `ease_${p}`)];
  const rows = s.defenses.map((d) => [d.team, ...pos.map((p) => d.allowedPpg[p]), ...pos.map((p) => d.ease[p])].map(csvCell).join(","));
  return [head.join(","), ...rows].join("\n") + "\n";
}

export const nfl = internalAction({
  args: { season: v.optional(v.number()) },
  handler: async (ctx, { season }): Promise<{ season: number; throughWeek: number; players: number; missing: string[] }> => {
    const yr = season ?? Number(process.env.NFL_SEASON ?? new Date().getUTCFullYear());
    const base = NFLVERSE();
    const missing: string[] = [];
    const opt = (name: string, path: string) => maybeText(`${base}/${path}`, missing, name);
    const [stats, games, pbp, snaps, pfrRec, pfrRush, pfrPass, ngsRec, ngsRush, ngsPass, injuries] = await Promise.all([
      getText(`${base}/stats_player/stats_player_week_${yr}.csv`),
      getText(`${base}/schedules/games.csv`),
      opt("pbp", `pbp/play_by_play_${yr}.csv.gz`),
      opt("snaps", `snap_counts/snap_counts_${yr}.csv`),
      opt("pfrRec", `pfr_advstats/advstats_week_rec_${yr}.csv`),
      opt("pfrRush", `pfr_advstats/advstats_week_rush_${yr}.csv`),
      opt("pfrPass", `pfr_advstats/advstats_week_pass_${yr}.csv`),
      opt("ngsRec", `nextgen_stats/ngs_receiving.csv.gz`),
      opt("ngsRush", `nextgen_stats/ngs_rushing.csv.gz`),
      opt("ngsPass", `nextgen_stats/ngs_passing.csv.gz`),
      opt("injuries", `injuries/injuries_${yr}.csv`),
    ]);
    const pro = buildNflSnapshot(
      { stats, games, pbp, snaps, pfrRec, pfrRush, pfrPass, ngsRec, ngsRush, ngsPass, injuries },
      { season: yr, generatedAt: new Date().toISOString() },
    );
    if (missing.length) console.warn("optional inputs missing:", missing.join("; "));
    const prev: Doc<"snapshots"> | null = await ctx.runQuery(internal.snapshots.latest, { sport: "nfl" });
    // Guard against a bad upstream file wiping the product: refuse a snapshot that goes backwards or is tiny.
    if (pro.players.length < 100) throw new Error(`suspiciously few players: ${pro.players.length}`);
    if (prev && prev.season === yr && pro.throughWeek < prev.throughWeek)
      throw new Error(`throughWeek went backwards: ${prev.throughWeek} -> ${pro.throughWeek}`);

    const store = (data: string | Uint8Array, type: string) =>
      ctx.storage.store(new Blob([typeof data === "string" ? data : new Uint8Array(data)], { type }));
    const [proGz, freeGz, proCsvPlayers, proCsvDefenses] = await Promise.all([
      store(gzipSync(JSON.stringify(pro)), "application/json"),
      store(gzipSync(JSON.stringify(toFree(pro))), "application/json"),
      store(playersCsv(pro), "text/csv"),
      store(defensesCsv(pro), "text/csv"),
    ]);
    await ctx.runMutation(internal.snapshots.save, {
      sport: "nfl", season: yr, throughWeek: pro.throughWeek, generatedAt: pro.generatedAt,
      players: pro.players.length, proGz, freeGz, proCsvPlayers, proCsvDefenses,
    });
    return { season: yr, throughWeek: pro.throughWeek, players: pro.players.length, missing };
  },
});
