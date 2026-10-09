// Metric definitions shared by the dashboard, the player card and the landing page.
// Every metric: key, labels, getter, formatter, direction (1 higher is better, -1 lower is better, 0 neutral),
// positions it applies to, and whether it is Season Pass data.
import { pct, dec, woprFmt, trendHTML } from "./core.js";

const MINUS = "−";
const DASH = "—";
const ALL = ["QB", "RB", "WR", "TE"];
const REC = ["RB", "WR", "TE"];

export const signed = (x, d = 1) => (x == null ? DASH : (x > 0 ? "+" : x < 0 ? MINUS : "") + Math.abs(x).toFixed(d));
export const epa = (x) => (x == null ? DASH : (x > 0 ? "+" : x < 0 ? MINUS : "") + Math.abs(x).toFixed(2).replace(/^0/, ""));
export const pct1 = (x) => (x == null ? DASH : (x * 100).toFixed(1) + "%");
export const signedPct = (x) => (x == null ? DASH : (x > 0 ? "+" : x < 0 ? MINUS : "") + Math.abs(x * 100).toFixed(1) + "%");
export const int = (x) => (x == null ? DASH : String(Math.round(x)));
export const ordinal = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

const primaryEpa = (p) => (p.pos === "QB" ? p.eff?.epaDb : p.pos === "RB" ? p.eff?.epaRush : p.eff?.epaTgt);
const primarySr = (p) => (p.pos === "QB" ? p.eff?.srDb : p.pos === "RB" ? p.eff?.srRush : p.eff?.srTgt);

const m = (k, label, short, get, fmt, o = {}) => ({ k, label, short, get, fmt, dir: 1, pos: ALL, pro: false, ...o });

export const M = {
  score: m("score", "Score", "Score", (p) => p.score, (v) => (v == null ? DASH : Math.round(v))),
  games: m("games", "Games", "G", (p) => p.games, int),
  ppg: m("ppg", "PPR points per game", "PPG", (p) => p.ppg, (v) => dec(v)),
  ppgL3: m("ppgL3", "PPG, last 3 games", "L3", (p) => p.ppgL3, (v) => dec(v)),
  tgtShare: m("tgtShare", "Target share", "Tgt %", (p) => p.tgtShare, pct, { pos: REC }),
  wopr: m("wopr", "WOPR", "WOPR", (p) => p.wopr, woprFmt, { pos: REC }),
  rushShare: m("rushShare", "Rush share", "Rush %", (p) => p.rushShare, pct, { pos: ["QB", "RB"] }),
  touchesPg: m("touchesPg", "Touches per game", "Touch/G", (p) => p.touchesPg, (v) => dec(v)),
  trend: m("trend", "Usage trend", "Trend", (p) => p.trend, (v) => trendHTML(v)),
  // opportunity (free)
  xfp: m("xfp", "Expected fantasy points per game", "xFP/G", (p) => p.xfp, (v) => dec(v)),
  xfpL3: m("xfpL3", "xFP per game, last 3", "xFP L3", (p) => p.xfpL3, (v) => dec(v)),
  snapShare: m("snapShare", "Snap share", "Snap %", (p) => p.snapShare, pct),
  tgtPerSnap: m("tgtPerSnap", "Targets per snap", "Tgt/snap", (p) => p.tgtPerSnap, (v) => (v == null ? DASH : v.toFixed(2).replace(/^0/, "")), { pos: REC }),
  adot: m("adot", "Average depth of target", "aDOT", (p) => p.opp?.adot, (v) => dec(v), { pos: REC, dir: 0 }),
  ezTgt: m("ezTgt", "End-zone targets", "EZ tgt", (p) => p.opp?.ezTgt, int, { pos: REC }),
  rzTgtShare: m("rzTgtShare", "Red-zone target share", "RZ tgt %", (p) => p.opp?.rzTgtShare, pct, { pos: REC }),
  rzCarShare: m("rzCarShare", "Red-zone carry share", "RZ car %", (p) => p.opp?.rzCarShare, pct, { pos: ["QB", "RB"] }),
  i10CarShare: m("i10CarShare", "Inside-10 carry share", "i10 car %", (p) => p.opp?.i10CarShare, pct, { pos: ["QB", "RB"] }),
  hvtPg: m("hvtPg", "High-value touches per game", "HVT/G", (p) => p.opp?.hvtPg, (v) => dec(v)),
  tgtShare3D2M: m("tgtShare3D2M", "Third-down and two-minute target share", "3D/2M tgt %", (p) => p.opp?.tgtShare3D2M, pct, { pos: ["RB"] }),
  // efficiency (Season Pass)
  fpoe: m("fpoe", "Fantasy points over expected per game", "FPOE/G", (p) => p.fpoe, (v) => signed(v), { pro: true }),
  epaPlay: m("epaPlay", "EPA per opportunity", "EPA/play", primaryEpa, epa, { pro: true }),
  srPlay: m("srPlay", "Success rate", "Success", primarySr, pct, { pro: true }),
  epaDb: m("epaDb", "EPA per dropback", "EPA/db", (p) => p.eff?.epaDb, epa, { pos: ["QB"], pro: true }),
  srDb: m("srDb", "Success rate per dropback", "Success/db", (p) => p.eff?.srDb, pct, { pos: ["QB"], pro: true }),
  cpoe: m("cpoe", "Completion % over expected", "CPOE", (p) => p.eff?.cpoe, (v) => signed(v), { pos: ["QB"], pro: true }),
  pressure: m("pressure", "Pressure rate", "Pressure", (p) => p.eff?.pressure, pct, { pos: ["QB"], pro: true, dir: -1 }),
  ttt: m("ttt", "Time to throw (s)", "TTT", (p) => p.eff?.ttt, (v) => dec(v, 2), { pos: ["QB"], pro: true, dir: 0 }),
  aggr: m("aggr", "Aggressiveness (tight-window %)", "Aggr", (p) => p.eff?.aggr, (v) => (v == null ? DASH : dec(v) + "%"), { pos: ["QB"], pro: true, dir: 0 }),
  epaRush: m("epaRush", "EPA per rush", "EPA/rush", (p) => p.eff?.epaRush, epa, { pos: ["QB", "RB"], pro: true }),
  srRush: m("srRush", "Success rate per rush", "Success/rush", (p) => p.eff?.srRush, pct, { pos: ["QB", "RB"], pro: true }),
  ryoe: m("ryoe", "Rush yards over expected per carry", "RYOE/att", (p) => p.eff?.ryoe, (v) => signed(v, 2), { pos: ["RB"], pro: true }),
  roePct: m("roePct", "Share of rushes over expected", "ROE %", (p) => p.eff?.roePct, pct, { pos: ["RB"], pro: true }),
  ybc: m("ybc", "Yards before contact per carry", "YBC", (p) => p.eff?.ybc, (v) => dec(v), { pos: ["QB", "RB"], pro: true }),
  yaco: m("yaco", "Yards after contact per carry", "YACO", (p) => p.eff?.yaco, (v) => dec(v), { pos: ["QB", "RB"], pro: true }),
  epaTgt: m("epaTgt", "EPA per target", "EPA/tgt", (p) => p.eff?.epaTgt, epa, { pos: REC, pro: true }),
  srTgt: m("srTgt", "Success rate per target", "Success/tgt", (p) => p.eff?.srTgt, pct, { pos: REC, pro: true }),
  yacoe: m("yacoe", "YAC over expected per catch", "YACOE", (p) => p.eff?.yacoe, (v) => signed(v), { pos: ["WR", "TE"], pro: true }),
  sep: m("sep", "Average separation (yds)", "Sep", (p) => p.eff?.sep, (v) => dec(v), { pos: ["WR", "TE"], pro: true }),
  cushion: m("cushion", "Average cushion (yds)", "Cushion", (p) => p.eff?.cushion, (v) => dec(v), { pos: ["WR", "TE"], pro: true, dir: 0 }),
  brkTkl: m("brkTkl", "Broken tackles", "Brk tkl", (p) => p.eff?.brkTkl, int, { pos: REC, pro: true }),
  dropPct: m("dropPct", "Drop rate", "Drop %", (p) => p.eff?.dropPct, pct1, { pos: REC, pro: true, dir: -1 }),
};

/** Table column sets per lens; position-specific sets when a position chip is on. */
export const LENSES = {
  usage: { label: "Usage", ALL: ["ppg", "ppgL3", "snapShare", "tgtShare", "wopr", "rushShare", "touchesPg", "trend"],
    QB: ["ppg", "ppgL3", "snapShare", "rushShare", "touchesPg", "trend"] },
  opportunity: { label: "Opportunity", ALL: ["xfp", "xfpL3", "snapShare", "hvtPg", "adot", "rzTgtShare", "rzCarShare", "ezTgt"],
    QB: ["xfp", "xfpL3", "snapShare", "hvtPg", "rzCarShare", "i10CarShare"],
    RB: ["xfp", "xfpL3", "snapShare", "hvtPg", "rzCarShare", "i10CarShare", "rzTgtShare", "tgtShare3D2M"],
    WR: ["xfp", "xfpL3", "snapShare", "tgtPerSnap", "adot", "ezTgt", "rzTgtShare", "hvtPg"] },
  efficiency: { label: "Efficiency", ALL: ["fpoe", "epaPlay", "srPlay", "dropPct", "brkTkl"],
    QB: ["fpoe", "epaDb", "srDb", "cpoe", "epaRush", "pressure", "ttt"],
    RB: ["fpoe", "epaRush", "srRush", "ryoe", "yaco", "brkTkl", "epaTgt"],
    WR: ["fpoe", "epaTgt", "srTgt", "yacoe", "sep", "dropPct", "brkTkl"] },
};
export function lensCols(lens, pos) {
  const L = LENSES[lens];
  const keys = L[pos === "TE" ? "WR" : pos] || L.ALL;
  return ["score", ...keys].map((k) => M[k]);
}

/** Player card metric lists. */
export const CARD = {
  opportunity: { QB: ["xfp", "snapShare", "hvtPg", "rzCarShare", "i10CarShare", "rushShare"],
    RB: ["xfp", "snapShare", "hvtPg", "rzCarShare", "i10CarShare", "rzTgtShare", "tgtShare3D2M", "tgtShare"],
    WR: ["xfp", "snapShare", "tgtPerSnap", "tgtShare", "adot", "rzTgtShare", "ezTgt", "hvtPg"] },
  efficiency: { QB: ["epaDb", "srDb", "cpoe", "epaRush", "pressure", "ttt", "aggr", "yaco"],
    RB: ["epaRush", "srRush", "ryoe", "roePct", "yaco", "ybc", "brkTkl", "epaTgt", "dropPct"],
    WR: ["epaTgt", "srTgt", "yacoe", "sep", "cushion", "dropPct", "brkTkl"] },
};
export const cardList = (block, pos) => (CARD[block][pos === "TE" ? "WR" : pos] || []).map((k) => M[k]);

/** Percentile (0..100) of a player's metric within his position. Lower-is-better metrics are flipped. */
const pools = new Map();
export function percentile(snap, metric, p) {
  const v = metric.get(p);
  if (v == null) return null;
  const key = metric.k + "|" + p.pos;
  let pool = pools.get(key);
  if (!pool || pool.snap !== snap) {
    const vals = snap.players.filter((q) => q.pos === p.pos && q.games >= 2 && (!metric.pro || (q.eff?.n ?? 0) >= 15 || metric.k === "fpoe"))
      .map((q) => metric.get(q)).filter((x) => x != null).sort((a, b) => a - b);
    pool = { snap, vals };
    pools.set(key, pool);
  }
  const n = pool.vals.length;
  if (n < 5) return null;
  let lo = 0, eq = 0;
  for (const x of pool.vals) { if (x < v) lo++; else if (x === v) eq++; }
  const raw = ((lo + eq / 2) / n) * 100;
  return Math.round(metric.dir < 0 ? 100 - raw : raw);
}

/** Rank (1 = best) of a player's score within his position. */
export function scoreRank(snap, p) {
  const same = snap.players.filter((q) => q.pos === p.pos && q.score != null);
  return { rank: 1 + same.filter((q) => q.score > p.score).length, of: same.length };
}

/** Injury pill: letter + full word for screen readers and hover. Never colour alone. */
export function injuryPill(inj) {
  if (!inj || !inj.status) return "";
  const s = inj.status;
  const letter = s[0].toUpperCase();
  const cls = letter === "O" ? "out" : letter === "D" ? "doubt" : "q";
  const full = s + (inj.body ? ` (${inj.body})` : "");
  return `<span class="inj ${cls}" title="${full.replace(/"/g, "&quot;")}"><span aria-hidden="true">${letter}</span><span class="sr-only">${s}</span></span>`;
}

export const TEAM_COLS = [
  m("epaPlay", "EPA per play", "EPA/play", (t) => t.epaPlay, epa),
  m("playsPg", "Plays per game", "Plays/G", (t) => t.playsPg, (v) => dec(v)),
  m("secPerPlay", "Seconds per play, neutral (lower is faster)", "Sec/play", (t) => t.secPerPlay, (v) => dec(v), { dir: -1 }),
  m("passRate", "Neutral dropback rate", "Pass %", (t) => t.passRate, pct, { dir: 0 }),
  m("proe", "Pass rate over expected", "PROE", (t) => t.proe, signedPct, { dir: 0 }),
  m("rzTripsPg", "Red-zone trips per game", "RZ trips/G", (t) => t.rzTripsPg, (v) => dec(v, 2)),
  m("epaPass", "EPA per dropback", "EPA/pass", (t) => t.epaPass, epa),
  m("epaRush", "EPA per rush", "EPA/rush", (t) => t.epaRush, epa),
];
export function teamRank(snap, col, t) {
  const v = col.get(t);
  if (v == null) return null;
  const better = snap.teams.filter((x) => { const y = col.get(x); return y != null && (col.dir < 0 ? y < v : y > v); }).length;
  return 1 + better;
}
