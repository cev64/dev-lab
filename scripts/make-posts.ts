// Daily post generator: turns an NFL snapshot into exactly 2 text-only posts for a date.
//
//   node --experimental-strip-types scripts/make-posts.ts <YYYY-MM-DD> [snapshot.json]
//
// With no snapshot path, the snapshot is built from tests/fixtures (same loader as make-sample.ts).
// Writes marketing/queue/<date>.json = { date, posts: [{ id, platform_text, text }] }.
//   text          = the fact line on its own
//   platform_text = what gets posted: text plus "Data: nflverse" when it fits in MAX_LEN
// Templates are picked deterministically from the date. Facts only, real numbers from the snapshot,
// no URLs, no emoji, no exclamation marks, none of the banned words (CLAUDE.md rule 4).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NflSnapshot, Player, Pos } from "../convex/model/nfl.ts";

export const MAX_LEN = 270;
export const CREDIT = "Data: nflverse";
export const BANNED = /\b(bet|betting|odds|picks|lock|parlay|sportsbook|wager|guaranteed)\b/i;

export type Post = { id: string; platform_text: string; text: string };
export type PostDay = { date: string; posts: Post[] };

const TEMPLATE_IDS = ["risers", "xfp-leaders", "fpoe-outliers", "proe-teams", "playoff-ease"] as const;
type TemplateId = (typeof TEMPLATE_IDS)[number];

// All 10 unordered pairs of the 5 templates; the date picks one, so consecutive days rotate topics.
const PAIRS: [number, number][] = [];
for (let i = 0; i < TEMPLATE_IDS.length; i++) for (let j = i + 1; j < TEMPLATE_IDS.length; j++) PAIRS.push([i, j]);
// Interleave so neighbouring days rarely share a template.
const ORDER = [0, 7, 3, 9, 5, 1, 8, 4, 2, 6];

const POS_LABEL: Record<Pos, string> = { QB: "QBs", RB: "RBs", WR: "WRs", TE: "TEs" };
const MIN_GAMES = 3;

function dayIndex(date: string): number {
  const ms = Date.parse(date + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(ms)) throw new Error(`bad date: ${date} (want YYYY-MM-DD)`);
  return Math.floor(ms / 86_400_000);
}

const f1 = (n: number) => n.toFixed(1);
const signed = (n: number, d = 1) => (n >= 0 ? "+" : "") + n.toFixed(d);
const pct = (n: number) => (n * 100).toFixed(0) + "%";
const pp = (n: number) => signed(n * 100, 1);
const safe = (p: { name: string }) => !BANNED.test(p.name);

/** Fit a list-style post: try the most items first, prefer a version that also fits the credit line. */
function fit(build: (k: number) => string | null, maxK: number, minK: number): string | null {
  let fallback: string | null = null;
  for (let k = maxK; k >= minK; k--) {
    const t = build(k);
    if (t === null) continue;
    if (t.length + 2 + CREDIT.length <= MAX_LEN) return t;
    if (fallback === null && t.length <= MAX_LEN) fallback = t;
  }
  return fallback;
}

function usageLine(p: Player): string {
  const tag = `${p.name} (${p.pos}, ${p.team})`;
  if ((p.pos === "WR" || p.pos === "TE") && p.wopr !== null && p.woprL3 !== null)
    return `${tag} WOPR ${p.woprL3.toFixed(2)} last 3 vs ${p.wopr.toFixed(2)} season`;
  if (p.pos === "RB" && p.rushShare !== null && p.rushShareL3 !== null) {
    const s = p.rushShare + (p.tgtShare ?? 0), l3 = p.rushShareL3 + (p.tgtShareL3 ?? 0);
    return `${tag} carry+target share ${pct(l3)} last 3 vs ${pct(s)} season`;
  }
  return `${tag} ${f1(p.ppgL3)} PPR/g last 3 vs ${f1(p.ppg)} season`;
}

type Template = (s: NflSnapshot, day: number) => string | null;

const TEMPLATES: Record<TemplateId, Template> = {
  risers(s) {
    const byId = new Map(s.players.map((p) => [p.id, p]));
    const ps = s.risers.map((id) => byId.get(id)).filter((p): p is Player => !!p && safe(p));
    if (ps.length === 0) return null;
    return fit((k) => {
      if (ps.length < k) return null;
      return `Biggest usage gains, last 3 games vs season, through Week ${s.throughWeek}: ` +
        ps.slice(0, k).map(usageLine).join("; ") + ".";
    }, 3, 1);
  },

  "xfp-leaders"(s, day) {
    const pos = (["RB", "WR", "TE", "QB"] as const)[day % 4];
    const ps = s.players.filter((p) => p.pos === pos && p.games >= MIN_GAMES && p.xfp !== null && safe(p))
      .sort((a, b) => b.xfp! - a.xfp!);
    if (ps.length === 0) return null;
    return fit((k) => {
      if (ps.length < k) return null;
      return `Expected PPR points per game, ${POS_LABEL[pos]}, through Week ${s.throughWeek} (min ${MIN_GAMES} games): ` +
        ps.slice(0, k).map((p) => `${p.name} ${p.team} ${f1(p.xfp!)}`).join(", ") +
        ". xFP values every play a player gets at the league-average result for similar plays.";
    }, 5, 2);
  },

  "fpoe-outliers"(s, day) {
    const pos = (["WR", "RB", "TE", "QB"] as const)[day % 4];
    const ps = s.players.filter((p) => p.pos === pos && p.games >= MIN_GAMES && p.fpoe !== null && p.xfp !== null && safe(p));
    if (ps.length < 2) return null;
    const hi = ps.slice().sort((a, b) => b.fpoe! - a.fpoe!);
    const lo = ps.slice().sort((a, b) => a.fpoe! - b.fpoe!).filter((p) => p.fpoe! < 0);
    const line = (p: Player) => `${p.name} ${p.team} ${signed(p.fpoe!)}/g on ${f1(p.xfp!)} xFP`;
    return fit((k) => {
      const above = hi.slice(0, k).filter((p) => p.fpoe! > 0);
      const below = lo.slice(0, k);
      if (above.length === 0 && below.length === 0) return null;
      const parts = [];
      if (above.length) parts.push(`above expected: ${above.map(line).join(", ")}`);
      if (below.length) parts.push(`below: ${below.map(line).join(", ")}`);
      return `PPR points over expected, ${POS_LABEL[pos]}, through Week ${s.throughWeek} (min ${MIN_GAMES} games). ` +
        parts.join("; ").replace(/^a/, "A") + ". Gaps this size on small samples often shrink.";
    }, 3, 1);
  },

  "proe-teams"(s) {
    const ts = s.teams.filter((t) => t.proe !== null);
    if (ts.length < 4) return null;
    const hi = ts.slice().sort((a, b) => b.proe! - a.proe!);
    const lo = ts.slice().sort((a, b) => a.proe! - b.proe!);
    const line = (t: (typeof ts)[number]) => `${t.team} ${pp(t.proe!)}`;
    return fit((k) =>
      `Neutral-situation pass rate over expected through Week ${s.throughWeek}, in percentage points. Most pass-leaning: ` +
      hi.slice(0, k).map(line).join(", ") + ". Most run-leaning: " + lo.slice(0, k).map(line).join(", ") +
      ". Neutral = win probability 20-80%, quarters 1-3.", 3, 1);
  },

  "playoff-ease"(s, day) {
    const pos = (["WR", "RB", "TE", "QB"] as const)[day % 4];
    const seen = new Map<string, Player>();
    for (const p of s.players)
      if (p.pos === pos && p.playoffEase !== null && p.schedule && !seen.has(p.team)) seen.set(p.team, p);
    const ps = [...seen.values()].sort((a, b) => b.playoffEase! - a.playoffEase! || a.team.localeCompare(b.team));
    if (ps.length === 0) return null;
    const wks = s.playoffWeeks;
    const line = (p: Player) => {
      const g = p.schedule!.filter((x) => wks.includes(x.week)).map((x) => (x.home ? "vs " : "@ ") + x.opp);
      return `${p.team} ${Math.round(p.playoffEase!)} (${g.join(", ")})`;
    };
    return fit((k) =>
      `Fantasy playoff schedules, Weeks ${wks[0]}-${wks[wks.length - 1]}, for ${POS_LABEL[pos]}: easiest by PPR points ` +
      `opponents allow to the position, 0-100 scale. ` + ps.slice(0, k).map(line).join("; ") +
      `. Based on Weeks 1-${s.throughWeek}, so expect movement.`, 4, 1);
  },
};

function clean(t: string): boolean {
  return t.length <= MAX_LEN && !BANNED.test(t) && !t.includes("!") && !/https?:|www\.|\.com\b/i.test(t) &&
    !/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t);
}

/** Pure: same snapshot + date always gives the same 2 posts. */
export function makePosts(s: NflSnapshot, date: string): PostDay {
  const day = dayIndex(date);
  const [a, b] = PAIRS[ORDER[((day % 10) + 10) % 10]];
  // Preferred pair first, then the remaining templates as fallbacks if a template has no data.
  const order = [a, b, ...TEMPLATE_IDS.map((_, i) => i).filter((i) => i !== a && i !== b)];
  const posts: Post[] = [];
  for (const i of order) {
    if (posts.length === 2) break;
    const id = TEMPLATE_IDS[i];
    const text = TEMPLATES[id](s, day);
    if (text === null || !clean(text)) continue;
    const withCredit = `${text}\n\n${CREDIT}`;
    posts.push({ id: `${date}-${id}`, platform_text: withCredit.length <= MAX_LEN ? withCredit : text, text });
  }
  if (posts.length !== 2) throw new Error(`only ${posts.length} post(s) could be built for ${date}`);
  return { date, posts };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const args = process.argv.slice(2);
  const date = args.find((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)) ?? new Date().toISOString().slice(0, 10);
  const snapPath = args.find((x) => x !== date);
  let snap: NflSnapshot;
  if (snapPath) {
    snap = JSON.parse(readFileSync(snapPath, "utf8"));
  } else {
    const { loadFixtureInputs } = await import("./make-sample.ts");
    const { buildNflSnapshot } = await import("../convex/model/nfl.ts");
    snap = buildNflSnapshot(loadFixtureInputs(), { season: 2026, generatedAt: `${date}T00:00:00.000Z` });
  }
  const out = makePosts(snap, date);
  const outPath = join(root, "marketing", "queue", `${date}.json`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
  for (const p of out.posts) console.log(`[${p.id}] ${p.platform_text.length} chars\n${p.platform_text}\n`);
  console.log(`-> ${outPath}`);
}
