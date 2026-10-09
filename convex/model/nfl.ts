// NFL snapshot model: turns nflverse files into one snapshot object the site renders from.
// Contract: docs/specs/nfl-snapshot.md (v2; every v1 field is kept).
//
// Pure TypeScript with NO imports and no Node/Convex APIs, so the Convex bundler and
// `node --experimental-strip-types --test` both run it. Only type-strippable syntax
// (no enums, namespaces, or parameter properties). Gzip decompression happens in the
// caller; this module only ever sees CSV text.

// ===========================================================================
// Types
// ===========================================================================

export type Pos = "QB" | "RB" | "WR" | "TE";

export type ScheduleGame = { week: number; opp: string; home: boolean; ease: number };

/** Opportunity quality (free tier). Omitted keys = not applicable / no pbp input. */
export type Opportunity = {
  adot?: number; // average depth of target: air yards / targets
  ezTgt?: number; // end-zone targets (air yards reach the goal line), season count
  rzTgtShare?: number; // share of team targets inside the opponent 20 (same games)
  rzCarShare?: number; // share of team carries inside the 20
  i10CarShare?: number; // share of team carries inside the 10
  hvtPg: number; // high-value touches per game: carries inside the 10 + targets
  tgtShare3D2M?: number; // RB only: share of team targets on 3rd down or the last 2 minutes of a half
};

/** Efficiency block (Pro). Season values; omitted keys = not applicable or no source row. */
export type Efficiency = {
  n: number; // opportunities: targets + carries (QB: dropbacks + designed runs)
  epaTgt?: number; srTgt?: number; // EPA per target, success rate on targets
  epaRush?: number; srRush?: number; // EPA per rush, success rate on rushes
  epaDb?: number; srDb?: number; // QB: EPA per dropback, success rate on dropbacks
  cpoe?: number; // QB: completion % over expected (pbp cpoe, percentage points)
  yacoe?: number; sep?: number; cushion?: number; // NGS receiving: YAC over expected/rec, separation & cushion (yds)
  ryoe?: number; roePct?: number; // NGS rushing: rush yards over expected per att, share of rushes over expected
  ybc?: number; yaco?: number; brkTkl?: number; // PFR: yards before / after contact per carry, broken tackles (rush + rec)
  drops?: number; dropPct?: number; // PFR receiving: drops, drops / targets
  pressure?: number; ttt?: number; aggr?: number; // QB: PFR pressure rate, NGS time to throw (s), aggressiveness (%)
};

export type ScoreParts = { opp: number; eff: number; trend: number; sched: number };

export type Injury = { status: string; body: string | null };

export type Player = {
  id: string;
  name: string;
  pos: Pos;
  team: string;
  headshot?: string;
  games: number;
  ppg: number;
  ppgL3: number;
  tgtShare: number | null;
  tgtShareL3: number | null;
  airShare: number | null;
  wopr: number | null;
  woprL3: number | null;
  rushShare: number | null;
  rushShareL3: number | null;
  touchesPg: number;
  trend: number;
  rosEase: number | null;
  playoffEase: number | null;
  schedule: ScheduleGame[] | null;
  // ---- v2 ----
  xfp: number | null; // expected PPR points per game (pbp)
  xfpL3: number | null;
  xfpRank: number | null; // opportunity rank by xfp within position (1 = most)
  fpoe: number | null; // PPR points over expected per game (Pro)
  fpoeL3: number | null; // (Pro)
  opp: Opportunity | null;
  snapShare: number | null; // offensive snaps / team offensive snaps (same games)
  snapShareL3: number | null;
  tgtPerSnap: number | null;
  injury: Injury | null; // this week's game-status designation, null = not listed
  eff: Efficiency | null; // (Pro)
  score: number | null; // Fieldglass Score 0..100 within position
  scoreParts: ScoreParts | null; // (Pro) component sub-scores, each 0..100
};

export type PosNumbers = { QB: number; RB: number; WR: number; TE: number };

export type Defense = {
  team: string;
  allowedPpg: PosNumbers;
  ease: PosNumbers;
  // ---- v2 ----
  epaPass: number | null; // EPA per dropback allowed
  epaRush: number | null; // EPA per designed run allowed
  matchupEase: PosNumbers; // blend of fantasy-points ease and EPA ease, 0..100
};

export type Team = {
  team: string;
  games: number;
  playsPg: number; // offensive plays (pass + run, incl. sacks/scrambles) per game
  secPerPlay: number | null; // neutral-situation seconds between snaps (pace; lower = faster)
  passRate: number | null; // neutral-situation dropback rate
  proe: number | null; // neutral pass rate over expected (dropback rate - nflverse xpass)
  rzTripsPg: number; // drives with a snap inside the opponent 20, per game
  epaPlay: number | null; // offensive EPA per play
  epaPass: number | null;
  epaRush: number | null;
};

export type NflSnapshot = {
  sport: "nfl";
  version: 2;
  season: number;
  throughWeek: number;
  generatedAt: string;
  tier: "free" | "pro";
  source: string;
  inputs: string[]; // which inputs were present (UI hides metrics whose source is missing)
  playoffWeeks: number[];
  players: Player[];
  defenses: Defense[];
  teams: Team[];
  risers: string[];
  fallers: string[];
};

/** CSV texts (already decompressed). Only stats + games are required. */
export type NflInputs = {
  stats: string;
  games: string;
  pbp?: string;
  snaps?: string;
  pfrRec?: string;
  pfrRush?: string;
  pfrPass?: string;
  ngsRec?: string;
  ngsRush?: string;
  ngsPass?: string;
  injuries?: string;
};

export type BuildOpts = { season: number; generatedAt: string };

/**
 * Columns the model reads from each input. Callers can trim large files to these
 * (the pbp file has ~370 columns) and the model passes them to parseCsv so unused
 * columns are never materialized.
 */
export const NFL_COLUMNS: { [K in keyof NflInputs]-?: string[] } = {
  stats: ["player_id", "player_name", "player_display_name", "position", "position_group", "headshot_url",
    "season", "week", "season_type", "team", "opponent_team", "carries", "receptions", "targets",
    "receiving_air_yards", "fantasy_points_ppr"],
  games: ["season", "game_type", "week", "home_team", "away_team"],
  pbp: ["season", "season_type", "week", "game_id", "posteam", "defteam", "play_type", "yardline_100", "down",
    "qtr", "half_seconds_remaining", "game_seconds_remaining", "fixed_drive", "air_yards", "complete_pass",
    "pass_attempt", "rush_attempt", "sack", "qb_dropback", "qb_scramble", "two_point_attempt", "pass_touchdown",
    "interception", "td_player_id", "passer_player_id", "receiver_player_id", "rusher_player_id",
    "passing_yards", "receiving_yards", "rushing_yards", "epa", "success", "wp", "cpoe", "xpass", "pass"],
  snaps: ["season", "game_type", "week", "player", "pfr_player_id", "position", "team", "offense_snaps"],
  pfrRec: ["season", "game_type", "week", "team", "pfr_player_name", "pfr_player_id", "receiving_broken_tackles",
    "receiving_drop"],
  pfrRush: ["season", "game_type", "week", "team", "pfr_player_name", "pfr_player_id", "carries",
    "rushing_yards_before_contact", "rushing_yards_after_contact", "rushing_broken_tackles"],
  pfrPass: ["season", "game_type", "week", "team", "pfr_player_name", "pfr_player_id", "times_pressured"],
  ngsRec: ["season", "season_type", "week", "player_gsis_id", "targets", "receptions", "avg_cushion",
    "avg_separation", "avg_yac_above_expectation"],
  ngsRush: ["season", "season_type", "week", "player_gsis_id", "rush_attempts", "rush_yards_over_expected_per_att",
    "rush_pct_over_expected"],
  ngsPass: ["season", "season_type", "week", "player_gsis_id", "attempts", "avg_time_to_throw", "aggressiveness"],
  injuries: ["season", "game_type", "week", "team", "gsis_id", "report_primary_injury", "report_status"],
};

const POSITIONS: Pos[] = ["QB", "RB", "WR", "TE"];
const PLAYOFF_WEEKS = [15, 16, 17];
const SOURCE = "Data: nflverse (CC-BY 4.0)";
const SHRINK_GAMES = 3; // ease shrinkage: weight = games / (games + 3)
const MOVER_MIN_GAMES = 3; // risers/fallers sample rules
const MOVER_MIN_PPG = 5;
const MOVER_COUNT = 10;
const FREE_TEASER_PER_POS = 12;
const XFP_PRIOR = 20; // xFP bucket shrinkage: pseudo-plays pulling a cell toward its parent bucket
const FPOE_PRIOR = 40; // FPOE regression for the score: weight = n / (n + 40 opportunities)
// Fieldglass Score weights (sum to 1). Kept in one place so the spec and UI can quote them.
export const SCORE_WEIGHTS = { opp: 0.5, eff: 0.2, trend: 0.15, sched: 0.15 };
// Matchup ease blend: share of fantasy-points ease vs EPA ease (pass / rush) per position.
export const MATCHUP_WEIGHTS: Record<Pos, { fp: number; pass: number; rush: number }> = {
  QB: { fp: 0.6, pass: 0.3, rush: 0.1 },
  RB: { fp: 0.6, pass: 0.1, rush: 0.3 },
  WR: { fp: 0.6, pass: 0.4, rush: 0 },
  TE: { fp: 0.6, pass: 0.4, rush: 0 },
};

// ===========================================================================
// CSV parsing
// ===========================================================================

/**
 * RFC 4180-style CSV parser: quoted fields may contain commas, newlines and doubled
 * quotes (""). First row is the header. Blank lines are skipped. Single pass; when
 * `columns` is given, only those columns are copied into the records (others are
 * skipped without allocating), which matters for the ~370-column pbp file.
 */
export function parseCsv(text: string, columns?: readonly string[]): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  const n = text.length;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0; // skip BOM
  let header: string[] | null = null;
  let keep: boolean[] = [];

  while (i < n) {
    let c0 = text.charCodeAt(i);
    if (c0 === 10 || c0 === 13) { i++; continue; } // blank line
    const row: string[] = [];
    let col = 0;
    for (;;) {
      // ---- one field starting at i ----
      const take = header === null || keep[col] === true;
      let value = "";
      if (text.charCodeAt(i) === 34) {
        // quoted: runs up to the closing quote; "" is an escaped quote
        i++;
        for (;;) {
          let j = text.indexOf('"', i);
          if (j < 0) j = n;
          if (take) value += text.slice(i, j);
          if (j >= n) { i = n; break; }
          if (text.charCodeAt(j + 1) === 34) { if (take) value += '"'; i = j + 2; continue; }
          i = j + 1;
          break;
        }
        while (i < n) { c0 = text.charCodeAt(i); if (c0 === 44 || c0 === 10 || c0 === 13) break; i++; }
      } else {
        let j = i;
        while (j < n) { c0 = text.charCodeAt(j); if (c0 === 44 || c0 === 10 || c0 === 13) break; j++; }
        if (take) value = text.slice(i, j);
        i = j;
      }
      row[col] = value;
      if (i < n && text.charCodeAt(i) === 44) { i++; col++; continue; }
      break;
    }
    // end of row: consume CRLF / LF / CR
    if (i < n) i += text.charCodeAt(i) === 13 && text.charCodeAt(i + 1) === 10 ? 2 : 1;

    if (header === null) {
      header = row;
      const set = columns ? new Set(columns) : null;
      keep = header.map((h) => (set ? set.has(h) : true));
      continue;
    }
    const rec: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) if (keep[c]) rec[header[c]] = row[c] ?? "";
    out.push(rec);
  }
  return out;
}

// ===========================================================================
// Small numeric helpers
// ===========================================================================

/** Parse a CSV number; blanks and "NA" become 0. */
function num(v: string | undefined): number {
  if (v === undefined || v === "") return 0;
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
/** Parse a CSV number; blanks and "NA" become null. */
function numOrNull(v: string | undefined): number | null {
  if (v === undefined || v === "" || v === "NA") return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

const round = (x: number, d: number): number => {
  const f = 10 ** d;
  const r = Math.round(x * f) / f;
  return r === 0 ? 0 : r; // avoid -0 in JSON
};
const r1 = (x: number) => round(x, 1);
const r2 = (x: number) => round(x, 2);
const r3 = (x: number) => round(x, 3);
const rn = (x: number | null, d: number) => (x === null ? null : round(x, d));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** a / b, or null when the denominator is not positive (share undefined). */
const ratio = (a: number, b: number): number | null => (b > 0 ? a / b : null);

/** Percentile rank 0..100 for each value (lowest = 0, highest = 100, ties share the average rank). */
function percentileRanks(values: number[]): number[] {
  const n = values.length;
  if (n <= 1) return values.map(() => 50);
  const idx = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const out = new Array<number>(n);
  let k = 0;
  while (k < n) {
    let j = k;
    while (j + 1 < n && Math.abs(idx[j + 1].v - idx[k].v) < 1e-9) j++;
    const avgRank = (k + j) / 2;
    for (let m = k; m <= j; m++) out[idx[m].i] = (100 * avgRank) / (n - 1);
    k = j + 1;
  }
  return out;
}

/** Keep only regular-season rows of this season up to throughWeek. */
function regRows(rows: Record<string, string>[], season: number, throughWeek: number): Record<string, string>[] {
  return rows.filter((r) => {
    const t = r.season_type || r.game_type;
    if (t && t !== "REG") return false;
    if (r.season && num(r.season) !== season) return false;
    const w = num(r.week);
    return w >= 1 && w <= throughWeek;
  });
}

const parseInput = (text: string | undefined, key: keyof NflInputs) =>
  text ? parseCsv(text, NFL_COLUMNS[key]) : null;

// ===========================================================================
// Internal accumulators
// ===========================================================================

// One player's box-score line for one week (stats file).
type WeekLine = {
  week: number;
  team: string;
  pts: number; // fantasy_points_ppr
  targets: number;
  carries: number;
  receptions: number;
  airYards: number; // receiving_air_yards (can be negative)
};

// Team totals for one (team, week) from the stats file: denominators for v1 shares.
type TeamWeek = { targets: number; carries: number; airYards: number };

// One player's play-by-play aggregates for one week.
type PbpWeek = {
  tgt: number; ay: number; ez: number; rzTgt: number; tgt3d2m: number;
  car: number; rzCar: number; i10Car: number;
  xfp: number; // expected PPR points from all of this player's plays
  epaTgt: number; sucTgt: number;
  rush: number; epaRush: number; sucRush: number; // designed runs + scrambles
  scr: number; // QB scrambles (counted as both dropbacks and rushes)
  db: number; epaDb: number; sucDb: number; // QB dropbacks
  cpoeSum: number; cpoeN: number;
};
// Pbp team totals for one (team, week): denominators for red-zone / situational shares.
type PbpTeamWeek = { tgt: number; rzTgt: number; rzCar: number; i10Car: number; tgt3d2m: number };

const newPbpWeek = (): PbpWeek => ({
  tgt: 0, ay: 0, ez: 0, rzTgt: 0, tgt3d2m: 0, car: 0, rzCar: 0, i10Car: 0, xfp: 0,
  epaTgt: 0, sucTgt: 0, rush: 0, scr: 0, epaRush: 0, sucRush: 0, db: 0, epaDb: 0, sucDb: 0, cpoeSum: 0, cpoeN: 0,
});

type Acc = { id: string; name: string; pos: Pos; headshot: string; lines: WeekLine[] };

/** Map nflverse position_group to a fantasy position (FB rolls into RB). */
function fantasyPos(row: Record<string, string>): Pos | null {
  const g = row.position_group || row.position;
  return g === "QB" || g === "RB" || g === "WR" || g === "TE" ? g : null;
}

/** Get-or-create in a nested Map<string, Map<number, T>>. */
function cell<T>(m: Map<string, Map<number, T>>, key: string, week: number, make: () => T): T {
  let inner = m.get(key);
  if (!inner) m.set(key, (inner = new Map()));
  let v = inner.get(week);
  if (!v) inner.set(week, (v = make()));
  return v;
}

/** Sum a field of per-week records over a set of weeks. */
function sumWeeks<T>(m: Map<number, T> | undefined, weeks: number[], f: (t: T) => number): number {
  if (!m) return 0;
  let s = 0;
  for (const w of weeks) {
    const t = m.get(w);
    if (t) s += f(t);
  }
  return s;
}

// ===========================================================================
// Expected fantasy points (xFP)
// ===========================================================================

/**
 * League-average outcome table with hierarchical shrinkage:
 * value(cell) = (sum_cell + K * value(parent)) / (n_cell + K), and
 * value(parent) = (sum_parent + K * leagueMean) / (n_parent + K).
 * So thin cells (e.g. 30+ air yards inside the 5) lean on their parent bucket.
 */
function makeExpect(k: number) {
  const cells = new Map<string, { n: number; s: number }>();
  const parents = new Map<string, { n: number; s: number }>();
  let n = 0, s = 0;
  const bump = (m: Map<string, { n: number; s: number }>, key: string, v: number) => {
    const c = m.get(key);
    if (c) { c.n++; c.s += v; } else m.set(key, { n: 1, s: v });
  };
  return {
    add(cellKey: string, parentKey: string, v: number) {
      bump(cells, cellKey, v);
      bump(parents, parentKey, v);
      n++; s += v;
    },
    value(cellKey: string, parentKey: string): number {
      const all = n ? s / n : 0;
      const p = parents.get(parentKey);
      const pv = p ? (p.s + k * all) / (p.n + k) : all;
      const c = cells.get(cellKey);
      return c ? (c.s + k * pv) / (c.n + k) : pv;
    },
  };
}

// Buckets. Air yards drive catch rate and yardage; field position drives TD odds.
function airBucket(ay: number | null): string {
  if (ay === null) return "na";
  if (ay < 0) return "b"; // behind the line
  if (ay < 5) return "0";
  if (ay < 10) return "5";
  if (ay < 15) return "10";
  if (ay < 20) return "15";
  if (ay < 30) return "20";
  return "30";
}
function ydlBucketTarget(y: number): string {
  return y <= 5 ? "5" : y <= 10 ? "10" : y <= 20 ? "20" : y <= 40 ? "40" : "99";
}
function ydlBucketCarry(y: number): string {
  return y <= 2 ? "2" : y <= 5 ? "5" : y <= 10 ? "10" : y <= 20 ? "20" : y <= 50 ? "50" : "99";
}

// ===========================================================================
// Build
// ===========================================================================

export function buildNflSnapshot(inputs: NflInputs, opts: BuildOpts): NflSnapshot {
  const season = opts.season;
  const stats = parseCsv(inputs.stats, NFL_COLUMNS.stats).filter(
    (r) => r.season_type === "REG" && (!r.season || num(r.season) === season),
  );
  const games = parseCsv(inputs.games, NFL_COLUMNS.games).filter(
    (g) => g.game_type === "REG" && num(g.season) === season,
  );

  // throughWeek = last regular-season week that has any stats.
  let throughWeek = 0;
  for (const r of stats) throughWeek = Math.max(throughWeek, num(r.week));

  const present: string[] = ["stats", "games"];
  const opt = (key: keyof NflInputs) => {
    const rows = parseInput(inputs[key], key);
    if (!rows) return null;
    present.push(key);
    return regRows(rows, season, throughWeek);
  };
  const pbp = opt("pbp");
  const snaps = opt("snaps");
  const pfrRec = opt("pfrRec");
  const pfrRush = opt("pfrRush");
  const pfrPass = opt("pfrPass");
  const ngsRec = opt("ngsRec");
  const ngsRush = opt("ngsRush");
  const ngsPass = opt("ngsPass");
  // Injuries are read separately: we want the report for the NEXT week (throughWeek + 1).
  const injRows = parseInput(inputs.injuries, "injuries");
  if (injRows) present.push("injuries");

  // ---- Pass 1 over stats: team totals, points allowed, each player's weekly lines ----
  const teamWeek = new Map<string, TeamWeek>();
  const allowed = new Map<string, Map<number, PosNumbers>>(); // defense -> week -> pts by pos
  const accs = new Map<string, Acc>();

  for (const r of stats) {
    const week = num(r.week);
    const team = r.team;
    const opp = r.opponent_team;
    const targets = num(r.targets);
    const carries = num(r.carries);
    const airYards = num(r.receiving_air_yards);

    const tk = team + "|" + week;
    let tw = teamWeek.get(tk);
    if (!tw) teamWeek.set(tk, (tw = { targets: 0, carries: 0, airYards: 0 }));
    tw.targets += targets;
    tw.carries += carries;
    tw.airYards += airYards;

    // Mark that this defense played this week even on a non-fantasy row, so a
    // 0-point week to (say) TEs still counts in the average.
    const wk = opp ? cell(allowed, opp, week, () => ({ QB: 0, RB: 0, WR: 0, TE: 0 })) : null;

    const pos = fantasyPos(r);
    if (!pos || !r.player_id) continue;
    const pts = num(r.fantasy_points_ppr);
    if (wk) wk[pos] += pts;

    let acc = accs.get(r.player_id);
    if (!acc) {
      acc = { id: r.player_id, name: r.player_display_name || r.player_name, pos, headshot: r.headshot_url, lines: [] };
      accs.set(r.player_id, acc);
    }
    acc.lines.push({ week, team, pts, targets, carries, receptions: num(r.receptions), airYards });
  }

  // ---- Play-by-play: xFP, opportunity quality, EPA, team context, defense EPA ----
  const pbpOut = pbp ? processPbp(pbp) : null;

  const defenses = buildDefenses(allowed, games, stats, pbpOut ? pbpOut.defEpa : null);
  const easeByTeam = new Map<string, PosNumbers>();
  for (const d of defenses) easeByTeam.set(d.team, d.ease);

  // ---- Remaining REG schedule per team (weeks after throughWeek; byes have no game) ----
  const remaining = new Map<string, { week: number; opp: string; home: boolean }[]>();
  for (const g of games) {
    const week = num(g.week);
    if (week <= throughWeek) continue;
    const sides: [string, string, boolean][] = [
      [g.home_team, g.away_team, true],
      [g.away_team, g.home_team, false],
    ];
    for (const [team, opp, home] of sides) {
      let list = remaining.get(team);
      if (!list) remaining.set(team, (list = []));
      list.push({ week, opp, home });
    }
  }
  for (const list of remaining.values()) list.sort((a, b) => a.week - b.week);

  // ---- Joins for PFR / snap files (they use PFR ids, so match on team + name) ----
  const resolve = makeNameResolver(accs);
  const snapW = snaps ? processSnaps(snaps, resolve) : null;
  const pfrW = processPfr(pfrRec, pfrRush, pfrPass, resolve);
  const ngs = processNgs(ngsRec, ngsRush, ngsPass);
  const injuries = injRows ? processInjuries(injRows, season, throughWeek + 1) : null;

  // ---- Pass 2: per-player metrics ----
  const players: Player[] = [];
  const trendRaw = new Map<string, number>();
  const fpoeReg = new Map<string, number>(); // regressed FPOE/g for the score
  for (const acc of accs.values()) {
    const lines = acc.lines.sort((a, b) => a.week - b.week);
    const last3 = lines.slice(-3);
    const weeks = lines.map((l) => l.week);
    const weeksL3 = last3.map((l) => l.week);
    const team = lines[lines.length - 1].team; // team changes: latest week wins
    const pos = acc.pos;
    const g = lines.length;

    const season = usage(lines, teamWeek);
    const l3 = usage(last3, teamWeek);
    const ppg = mean(lines.map((l) => l.pts));
    const ppgL3 = mean(last3.map((l) => l.pts));

    // trend: L3 opportunity vs season opportunity, as a relative change clamped to -1..1.
    //   WR/TE: WOPR; RB: rush share + target share; QB: fantasy points per game.
    let sNow: number, sL3: number, floor: number;
    if (pos === "QB") {
      sNow = ppg; sL3 = ppgL3; floor = 1; // 1 ppg floor so tiny bases don't explode
    } else if (pos === "RB") {
      sNow = (season.rush ?? 0) + (season.tgt ?? 0);
      sL3 = (l3.rush ?? 0) + (l3.tgt ?? 0);
      floor = 0.05;
    } else {
      sNow = season.wopr ?? 0; sL3 = l3.wopr ?? 0; floor = 0.05;
    }
    const trend = clamp((sL3 - sNow) / Math.max(sNow, floor), -1, 1);
    trendRaw.set(acc.id, trend);

    // Shares that don't mean anything for a position are null:
    //   QB -> no receiving shares; WR/TE -> no rush share.
    const recv = pos !== "QB";
    const rush = pos === "QB" || pos === "RB";
    const sh = (x: number | null) => (x === null ? null : r3(x));

    // Schedule: ease of each remaining opponent vs this player's position.
    const sched: ScheduleGame[] = (remaining.get(team) || []).map((gm) => ({
      week: gm.week,
      opp: gm.opp,
      home: gm.home,
      ease: r2(easeByTeam.get(gm.opp)?.[pos] ?? 50),
    }));
    const po = sched.filter((gm) => PLAYOFF_WEEKS.includes(gm.week));

    // ---- v2: play-by-play metrics ----
    let xfp: number | null = null, xfpL3: number | null = null;
    let fpoe: number | null = null, fpoeL3: number | null = null;
    let opp: Opportunity | null = null;
    const eff: Efficiency = { n: 0 };
    if (pbpOut) {
      const pw = pbpOut.player.get(acc.id);
      const S = (f: (t: PbpWeek) => number, ws = weeks) => sumWeeks(pw, ws, f);
      const T = (f: (t: PbpTeamWeek) => number, ws = weeks) => {
        // team denominators over the player's games, using his team in each week
        let s = 0;
        for (const l of lines) if (ws.includes(l.week)) {
          const t = pbpOut.teamWeek.get(l.team + "|" + l.week);
          if (t) s += f(t);
        }
        return s;
      };
      // xFP per game and FPOE per game = (actual PPR - xFP) / games
      const xTot = S((t) => t.xfp), xL3 = S((t) => t.xfp, weeksL3);
      xfp = xTot / g;
      xfpL3 = xL3 / last3.length;
      fpoe = ppg - xfp;
      fpoeL3 = ppgL3 - xfpL3;

      const tgt = S((t) => t.tgt);
      const car = S((t) => t.car);
      const o: Opportunity = { hvtPg: r2((S((t) => t.i10Car) + tgt) / g) };
      if (recv) {
        if (tgt > 0) o.adot = r2(S((t) => t.ay) / tgt);
        o.ezTgt = S((t) => t.ez);
        const rz = ratio(S((t) => t.rzTgt), T((t) => t.rzTgt));
        if (rz !== null) o.rzTgtShare = r3(rz);
      }
      if (rush) {
        const rzc = ratio(S((t) => t.rzCar), T((t) => t.rzCar));
        if (rzc !== null) o.rzCarShare = r3(rzc);
        const i10 = ratio(S((t) => t.i10Car), T((t) => t.i10Car));
        if (i10 !== null) o.i10CarShare = r3(i10);
      }
      if (pos === "RB") {
        const s3 = ratio(S((t) => t.tgt3d2m), T((t) => t.tgt3d2m));
        if (s3 !== null) o.tgtShare3D2M = r3(s3);
      }
      opp = o;

      // Efficiency from pbp: EPA and success rate per target / rush / dropback.
      const rushN = S((t) => t.rush);
      const db = S((t) => t.db);
      // opportunities: QB = dropbacks + designed runs (scrambles are already dropbacks)
      eff.n = pos === "QB" ? db + car - S((t) => t.scr) : tgt + car;
      if (recv && tgt >= 1) { eff.epaTgt = r3(S((t) => t.epaTgt) / tgt); eff.srTgt = r3(S((t) => t.sucTgt) / tgt); }
      if (rush && rushN >= 1) { eff.epaRush = r3(S((t) => t.epaRush) / rushN); eff.srRush = r3(S((t) => t.sucRush) / rushN); }
      if (pos === "QB" && db >= 1) {
        eff.epaDb = r3(S((t) => t.epaDb) / db);
        eff.srDb = r3(S((t) => t.sucDb) / db);
        const cn = S((t) => t.cpoeN);
        if (cn > 0) eff.cpoe = r2(S((t) => t.cpoeSum) / cn);
      }
      // Regressed FPOE (toward 0 by sample) feeds the efficiency sub-score.
      fpoeReg.set(acc.id, fpoe * (eff.n / (eff.n + FPOE_PRIOR)));
    } else {
      eff.n = lines.reduce((a, l) => a + l.targets + l.carries, 0);
    }

    // Snap share = player offensive snaps / team offensive snaps over his games.
    let snapShare: number | null = null, snapShareL3: number | null = null, tgtPerSnap: number | null = null;
    if (snapW) {
      const ps = snapW.player.get(acc.id);
      const share = (ws: WeekLine[]) => {
        let a = 0, b = 0;
        for (const l of ws) { a += ps?.get(l.week) ?? 0; b += snapW.team.get(l.team + "|" + l.week) ?? 0; }
        return { a, share: ratio(a, b) };
      };
      const s = share(lines);
      if (ps && s.share !== null) {
        snapShare = r3(clamp(s.share, 0, 1));
        const s3 = share(last3).share;
        snapShareL3 = s3 === null ? null : r3(clamp(s3, 0, 1));
        if (s.a > 0) tgtPerSnap = r3(lines.reduce((x, l) => x + l.targets, 0) / s.a);
      }
    }

    // Efficiency from PFR (contact / broken tackles / drops / pressure) and NGS.
    const pf = pfrW.get(acc.id);
    if (pf) {
      if (pf.car > 0 && pos !== "WR" && pos !== "TE") {
        eff.ybc = r2(pf.ybc / pf.car);
        eff.yaco = r2(pf.yaco / pf.car);
      }
      if (pos !== "QB") eff.brkTkl = pf.brk;
      const tg = lines.reduce((x, l) => x + l.targets, 0);
      if (recv && pf.hasRec) {
        eff.drops = pf.drops;
        if (tg > 0) eff.dropPct = r3(pf.drops / tg);
      }
      if (pos === "QB" && pf.hasPass && pbpOut) {
        const db = sumWeeks(pbpOut.player.get(acc.id), weeks, (t) => t.db);
        if (db > 0) eff.pressure = r3(clamp(pf.pressured / db, 0, 1));
      }
    }
    const nr = ngs.rec.get(acc.id), nu = ngs.rush.get(acc.id), np = ngs.pass.get(acc.id);
    if (nr && recv) {
      if (nr.yacoe !== null) eff.yacoe = r2(nr.yacoe);
      if (nr.sep !== null) eff.sep = r2(nr.sep);
      if (nr.cushion !== null) eff.cushion = r2(nr.cushion);
    }
    if (nu && rush) {
      if (nu.ryoe !== null) eff.ryoe = r2(nu.ryoe);
      if (nu.roePct !== null) eff.roePct = r3(nu.roePct);
    }
    if (np && pos === "QB") {
      if (np.ttt !== null) eff.ttt = r2(np.ttt);
      if (np.aggr !== null) eff.aggr = r1(np.aggr);
    }

    const p: Player = {
      id: acc.id,
      name: acc.name,
      pos,
      team,
      games: g,
      ppg: r2(ppg),
      ppgL3: r2(ppgL3),
      tgtShare: recv ? sh(season.tgt) : null,
      tgtShareL3: recv ? sh(l3.tgt) : null,
      airShare: recv ? sh(season.air) : null,
      wopr: recv ? sh(season.wopr) : null,
      woprL3: recv ? sh(l3.wopr) : null,
      rushShare: rush ? sh(season.rush) : null,
      rushShareL3: rush ? sh(l3.rush) : null,
      touchesPg: r2(mean(lines.map((l) => l.carries + l.receptions))),
      trend: r2(trend),
      rosEase: sched.length ? r2(mean(sched.map((gm) => gm.ease))) : null,
      playoffEase: po.length ? r2(mean(po.map((gm) => gm.ease))) : null,
      schedule: sched,
      xfp: rn(xfp, 2),
      xfpL3: rn(xfpL3, 2),
      xfpRank: null, // filled below
      fpoe: rn(fpoe, 2),
      fpoeL3: rn(fpoeL3, 2),
      opp,
      snapShare,
      snapShareL3,
      tgtPerSnap,
      injury: injuries?.get(acc.id) ?? null,
      eff,
      score: null,
      scoreParts: null,
    };
    if (acc.headshot) p.headshot = acc.headshot;
    players.push(p);
  }

  players.sort((a, b) => b.ppg - a.ppg || a.id.localeCompare(b.id));

  // ---- Opportunity rank and Fieldglass Score, within position ----
  for (const pos of POSITIONS) {
    const group = players.filter((p) => p.pos === pos);
    if (group.length === 0) continue;
    // xfpRank: 1 = most expected points per game at the position
    const byX = group.filter((p) => p.xfp !== null).sort((a, b) => (b.xfp as number) - (a.xfp as number));
    byX.forEach((p, i) => (p.xfpRank = i + 1));

    // Sub-scores, each 0..100:
    //   opp   = percentile of xFP/g x games/(games+1)      -- how much opportunity (ppg if no pbp);
    //           the games factor keeps one-game spot starters from topping the list
    //   eff   = percentile of regressed FPOE/g (50 if no pbp) -- what he does with it
    //   trend = 50 + 50 * trend                           -- direction of his role
    //   sched = rosEase (50 if no games left)             -- remaining schedule
    const oppPct = percentileRanks(group.map((p) => (p.xfp ?? p.ppg) * (p.games / (p.games + 1))));
    const effPct = pbpOut ? percentileRanks(group.map((p) => fpoeReg.get(p.id) ?? 0)) : group.map(() => 50);
    group.forEach((p, i) => {
      const parts: ScoreParts = {
        opp: r1(oppPct[i]),
        eff: r1(effPct[i]),
        trend: r1(50 + 50 * (trendRaw.get(p.id) as number)),
        sched: r1(p.rosEase ?? 50),
      };
      p.scoreParts = parts;
      p.score = r1(
        SCORE_WEIGHTS.opp * parts.opp + SCORE_WEIGHTS.eff * parts.eff +
        SCORE_WEIGHTS.trend * parts.trend + SCORE_WEIGHTS.sched * parts.sched,
      );
    });
  }

  // Risers / fallers: only players with a real sample (games >= 3, ppg >= 5).
  // Risers need a positive trend, fallers a negative one, so the lists never overlap.
  const eligible = players.filter((p) => p.games >= MOVER_MIN_GAMES && p.ppg >= MOVER_MIN_PPG);
  const byTrend = (dir: 1 | -1) =>
    eligible
      .filter((p) => dir * (trendRaw.get(p.id) as number) > 0)
      .sort((a, b) => dir * ((trendRaw.get(b.id) as number) - (trendRaw.get(a.id) as number)) || b.ppg - a.ppg)
      .slice(0, MOVER_COUNT)
      .map((p) => p.id);

  return {
    sport: "nfl",
    version: 2,
    season,
    throughWeek,
    generatedAt: opts.generatedAt,
    tier: "pro",
    source: SOURCE,
    inputs: present,
    playoffWeeks: PLAYOFF_WEEKS.slice(),
    players,
    defenses,
    teams: pbpOut ? pbpOut.teams : [],
    risers: byTrend(1),
    fallers: byTrend(-1),
  };
}

/**
 * v1 usage shares over a set of weeks. Each share is the player's total divided by his
 * team's total in the SAME weeks (so missed games don't dilute the share).
 *   tgt  = targets / team targets
 *   air  = receiving air yards / team air yards (clamped 0..1; single plays can go negative)
 *   wopr = 1.5 * tgt + 0.7 * air   (weighted opportunity rating, nflverse definition)
 *   rush = carries / team carries
 */
function usage(lines: WeekLine[], teamWeek: Map<string, TeamWeek>) {
  let tg = 0, ca = 0, ay = 0, TG = 0, CA = 0, AY = 0;
  for (const l of lines) {
    const t = teamWeek.get(l.team + "|" + l.week) as TeamWeek;
    tg += l.targets; ca += l.carries; ay += l.airYards;
    TG += t.targets; CA += t.carries; AY += t.airYards;
  }
  const tgt = ratio(tg, TG);
  const airRaw = ratio(ay, AY);
  const air = airRaw === null ? null : clamp(airRaw, 0, 1);
  const wopr = tgt === null ? null : 1.5 * tgt + 0.7 * (air ?? 0);
  return { tgt, air, wopr, rush: ratio(ca, CA) };
}

// ===========================================================================
// Play-by-play processing
// ===========================================================================

type PbpOut = {
  player: Map<string, Map<number, PbpWeek>>;
  teamWeek: Map<string, PbpTeamWeek>;
  teams: Team[];
  defEpa: Map<string, { games: number; pass: number | null; rush: number | null }>;
};

/**
 * One pass to classify plays and fit the xFP tables, a second to credit players.
 *
 * xFP method (PPR): every target, carry and pass attempt is valued at the league-average
 * fantasy outcome of comparable plays THIS season:
 *   target  -> cell = air-yards bucket x yardline_100 bucket (parent: air-yards bucket)
 *              outcome = 1 per catch + 0.1 per receiving yard + 6 per receiving TD
 *   carry   -> cell = yardline_100 bucket x down group (1-2 / 3-4) (parent: yardline bucket)
 *              outcome = 0.1 per rushing yard + 6 per rushing TD
 *   pass    -> same cells as targets, outcome = 0.04 per passing yard + 4 per TD - 2 per INT
 * Cells are shrunk toward their parent with 20 pseudo-plays (see makeExpect).
 * Kneels, spikes, 2-point tries and penalty-nullified plays are excluded.
 */
function processPbp(rows: Record<string, string>[]): PbpOut {
  const T_REC = makeExpect(XFP_PRIOR), T_PASS = makeExpect(XFP_PRIOR), T_RUSH = makeExpect(XFP_PRIOR);

  type Play = { kind: 0 | 1 | 2; pid: string; week: number; cell: string; parent: string };
  const plays: Play[] = [];

  const player = new Map<string, Map<number, PbpWeek>>();
  const teamWeek = new Map<string, PbpTeamWeek>();
  const pw = (id: string, week: number) => cell(player, id, week, newPbpWeek);
  const tw = (team: string, week: number) => {
    const k = team + "|" + week;
    let t = teamWeek.get(k);
    if (!t) teamWeek.set(k, (t = { tgt: 0, rzTgt: 0, rzCar: 0, i10Car: 0, tgt3d2m: 0 }));
    return t;
  };

  // Team context accumulators
  type TeamAcc = {
    games: Set<string>; plays: number; epa: number; passN: number; passEpa: number; rushN: number; rushEpa: number;
    neutralN: number; neutralPass: number; neutralX: number; neutralXN: number;
    paceSum: number; paceN: number; rzDrives: Set<string>;
  };
  const teamAcc = new Map<string, TeamAcc>();
  const ta = (team: string) => {
    let t = teamAcc.get(team);
    if (!t) {
      t = { games: new Set(), plays: 0, epa: 0, passN: 0, passEpa: 0, rushN: 0, rushEpa: 0, neutralN: 0,
        neutralPass: 0, neutralX: 0, neutralXN: 0, paceSum: 0, paceN: 0, rzDrives: new Set() };
      teamAcc.set(team, t);
    }
    return t;
  };
  type DefAcc = { games: Set<string>; passN: number; passEpa: number; rushN: number; rushEpa: number };
  const defAcc = new Map<string, DefAcc>();
  const da = (team: string) => {
    let d = defAcc.get(team);
    if (!d) defAcc.set(team, (d = { games: new Set(), passN: 0, passEpa: 0, rushN: 0, rushEpa: 0 }));
    return d;
  };

  // Previous neutral snap per (game, team, drive) for pace.
  let prevKey = "", prevSec = 0;

  for (const r of rows) {
    const type = r.play_type;
    if (type !== "pass" && type !== "run") continue; // drops no_play, kneels, spikes, special teams
    if (r.two_point_attempt === "1") continue;
    const week = num(r.week);
    const off = r.posteam, def = r.defteam;
    if (!off) continue;
    const ydl = num(r.yardline_100);
    const epa = numOrNull(r.epa);
    const success = r.success === "1" ? 1 : 0;
    const dropback = r.qb_dropback === "1";
    const scramble = r.qb_scramble === "1";

    // ---- team context ----
    const t = ta(off);
    t.games.add(r.game_id);
    t.plays++;
    if (epa !== null) {
      t.epa += epa;
      if (dropback) { t.passN++; t.passEpa += epa; } else { t.rushN++; t.rushEpa += epa; }
    }
    if (ydl > 0 && ydl <= 20) t.rzDrives.add(r.game_id + "|" + r.fixed_drive);
    const wp = numOrNull(r.wp);
    const neutral = wp !== null && wp >= 0.2 && wp <= 0.8 && num(r.qtr) <= 3;
    if (neutral) {
      t.neutralN++;
      if (r.pass === "1" || dropback) t.neutralPass++;
      const xp = numOrNull(r.xpass);
      if (xp !== null) { t.neutralX += xp; t.neutralXN++; }
      // pace: clock time since this offense's previous neutral snap on the same drive
      const key = r.game_id + "|" + off + "|" + r.fixed_drive;
      const sec = num(r.game_seconds_remaining);
      if (key === prevKey) {
        const d = prevSec - sec;
        if (d > 0 && d <= 60) { t.paceSum += d; t.paceN++; }
      }
      prevKey = key; prevSec = sec;
    } else {
      prevKey = "";
    }
    if (def && epa !== null) {
      const d = da(def);
      d.games.add(r.game_id);
      if (dropback) { d.passN++; d.passEpa += epa; } else { d.rushN++; d.rushEpa += epa; }
    }

    // ---- players ----
    const down = num(r.down);
    const late = down >= 3 || num(r.half_seconds_remaining) <= 120;
    const tdId = r.td_player_id;

    if (type === "pass") {
      const passer = r.passer_player_id;
      const receiver = r.receiver_player_id;
      const isAttempt = r.pass_attempt === "1" && r.sack !== "1";
      const ayRaw = numOrNull(r.air_yards);
      const ab = airBucket(ayRaw);
      const yb = ydlBucketTarget(ydl);
      // QB dropback (pass attempt or sack; scrambles are handled on run plays)
      if (passer && dropback) {
        const q = pw(passer, week);
        q.db++;
        if (epa !== null) { q.epaDb += epa; q.sucDb += success; }
        const cp = numOrNull(r.cpoe);
        if (cp !== null && isAttempt) { q.cpoeSum += cp; q.cpoeN++; }
      }
      if (isAttempt && passer) {
        const v = 0.04 * num(r.passing_yards) + (r.pass_touchdown === "1" ? 4 : 0) - (r.interception === "1" ? 2 : 0);
        T_PASS.add(ab + "|" + yb, ab, v);
        plays.push({ kind: 2, pid: passer, week, cell: ab + "|" + yb, parent: ab });
      }
      if (isAttempt && receiver) {
        const v = (r.complete_pass === "1" ? 1 : 0) + 0.1 * num(r.receiving_yards) + (tdId === receiver ? 6 : 0);
        T_REC.add(ab + "|" + yb, ab, v);
        plays.push({ kind: 0, pid: receiver, week, cell: ab + "|" + yb, parent: ab });
        const p = pw(receiver, week);
        p.tgt++;
        if (ayRaw !== null) p.ay += ayRaw;
        if (ayRaw !== null && ydl > 0 && ayRaw >= ydl) p.ez++;
        if (epa !== null) { p.epaTgt += epa; p.sucTgt += success; }
        const tt = tw(off, week);
        tt.tgt++;
        if (ydl <= 20) { p.rzTgt++; tt.rzTgt++; }
        if (late) { p.tgt3d2m++; tt.tgt3d2m++; }
      }
    } else {
      const rusher = r.rusher_player_id;
      if (!rusher || r.rush_attempt !== "1") continue;
      const p = pw(rusher, week);
      // EPA per rush counts designed runs and scrambles alike
      p.rush++;
      if (epa !== null) { p.epaRush += epa; p.sucRush += success; }
      if (scramble) {
        // a scramble is also a QB dropback
        p.db++;
        if (epa !== null) { p.epaDb += epa; p.sucDb += success; }
        p.scr++;
      }
      const yb = ydlBucketCarry(ydl);
      const dg = down >= 3 ? "L" : "E";
      const v = 0.1 * num(r.rushing_yards) + (tdId === rusher ? 6 : 0);
      T_RUSH.add(yb + "|" + dg, yb, v);
      plays.push({ kind: 1, pid: rusher, week, cell: yb + "|" + dg, parent: yb });
      p.car++;
      const tt = tw(off, week);
      if (ydl <= 20) { p.rzCar++; tt.rzCar++; }
      if (ydl <= 10) { p.i10Car++; tt.i10Car++; }
    }
  }

  // Second pass: credit each play's expected value to its player.
  const tables = [T_REC, T_RUSH, T_PASS];
  for (const pl of plays) pw(pl.pid, pl.week).xfp += tables[pl.kind].value(pl.cell, pl.parent);

  const teams: Team[] = Array.from(teamAcc.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([team, t]) => {
      const g = t.games.size;
      return {
        team,
        games: g,
        playsPg: r1(t.plays / g),
        secPerPlay: t.paceN ? r1(t.paceSum / t.paceN) : null,
        passRate: t.neutralN ? r3(t.neutralPass / t.neutralN) : null,
        proe: t.neutralN && t.neutralXN ? r3(t.neutralPass / t.neutralN - t.neutralX / t.neutralXN) : null,
        rzTripsPg: r2(t.rzDrives.size / g),
        epaPlay: t.passN + t.rushN ? r3(t.epa / (t.passN + t.rushN)) : null,
        epaPass: t.passN ? r3(t.passEpa / t.passN) : null,
        epaRush: t.rushN ? r3(t.rushEpa / t.rushN) : null,
      };
    });

  const defEpa = new Map<string, { games: number; pass: number | null; rush: number | null }>();
  for (const [team, d] of defAcc) {
    defEpa.set(team, {
      games: d.games.size,
      pass: d.passN ? d.passEpa / d.passN : null,
      rush: d.rushN ? d.rushEpa / d.rushN : null,
    });
  }
  return { player, teamWeek, teams, defEpa };
}

// ===========================================================================
// Defense table
// ===========================================================================

/**
 * Defense table.
 *   allowedPpg  = PPR points scored by that position against the defense, averaged over
 *                 the weeks it played.
 *   ease        = percentile rank (0..100, 100 = gives up the most) of a shrunk allowedPpg:
 *                 league mean + (raw - mean) * games / (games + 3), damping early noise.
 *   epaPass/Rush= EPA per play allowed (pbp), shrunk the same way before ranking.
 *   matchupEase = MATCHUP_WEIGHTS blend of ease and the pass/rush EPA percentiles.
 */
function buildDefenses(
  allowed: Map<string, Map<number, PosNumbers>>,
  games: Record<string, string>[],
  stats: Record<string, string>[],
  defEpa: Map<string, { games: number; pass: number | null; rush: number | null }> | null,
): Defense[] {
  const teams = new Set<string>();
  for (const g of games) {
    if (g.home_team) teams.add(g.home_team);
    if (g.away_team) teams.add(g.away_team);
  }
  if (teams.size === 0) for (const r of stats) if (r.team) teams.add(r.team);
  const list = Array.from(teams).sort();

  const raw = new Map<string, { games: number; ppg: PosNumbers }>();
  for (const team of list) {
    const weeks = allowed.get(team);
    const g = weeks ? weeks.size : 0;
    const sum: PosNumbers = { QB: 0, RB: 0, WR: 0, TE: 0 };
    if (weeks) for (const w of weeks.values()) for (const p of POSITIONS) sum[p] += w[p];
    const ppg: PosNumbers = { QB: 0, RB: 0, WR: 0, TE: 0 };
    for (const p of POSITIONS) ppg[p] = g ? sum[p] / g : 0;
    raw.set(team, { games: g, ppg });
  }

  /** Shrink each team's value toward the league mean by games/(games+3), then percentile-rank. */
  const shrunkPct = (val: (t: string) => number | null, gamesOf: (t: string) => number): number[] => {
    const known = list.filter((t) => gamesOf(t) > 0 && val(t) !== null);
    const m = mean(known.map((t) => val(t) as number));
    return percentileRanks(list.map((t) => {
      const v = val(t), g = gamesOf(t);
      return v === null || g === 0 ? m : m + (v - m) * (g / (g + SHRINK_GAMES));
    }));
  };

  const ease = new Map<string, PosNumbers>();
  for (const team of list) ease.set(team, { QB: 50, RB: 50, WR: 50, TE: 50 });
  for (const p of POSITIONS) {
    const pct = shrunkPct((t) => raw.get(t)!.ppg[p], (t) => raw.get(t)!.games);
    list.forEach((t, i) => (ease.get(t)![p] = r2(pct[i])));
  }

  const passPct = defEpa ? shrunkPct((t) => defEpa.get(t)?.pass ?? null, (t) => defEpa.get(t)?.games ?? 0) : null;
  const rushPct = defEpa ? shrunkPct((t) => defEpa.get(t)?.rush ?? null, (t) => defEpa.get(t)?.games ?? 0) : null;

  return list.map((team, i) => {
    const ppg = raw.get(team)!.ppg;
    const e = ease.get(team)!;
    const matchupEase: PosNumbers = { QB: 0, RB: 0, WR: 0, TE: 0 };
    for (const p of POSITIONS) {
      const w = MATCHUP_WEIGHTS[p];
      matchupEase[p] = passPct && rushPct
        ? r2(w.fp * e[p] + w.pass * passPct[i] + w.rush * rushPct[i])
        : e[p];
    }
    const de = defEpa?.get(team);
    return {
      team,
      allowedPpg: { QB: r2(ppg.QB), RB: r2(ppg.RB), WR: r2(ppg.WR), TE: r2(ppg.TE) },
      ease: e,
      epaPass: de && de.pass !== null ? r3(de.pass) : null,
      epaRush: de && de.rush !== null ? r3(de.rush) : null,
      matchupEase,
    };
  });
}

// ===========================================================================
// Joins: snaps, PFR, NGS, injuries
// ===========================================================================

/** Lowercase, strip accents/punctuation and Jr/Sr/II/III suffixes: "A.J. Brown Jr." -> "aj brown". */
function normName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/[^a-z ]/g, "")
    .split(/\s+/)
    .filter((w) => w && !["jr", "sr", "ii", "iii", "iv", "v"].includes(w))
    .join(" ");
}

/**
 * PFR-based files (snap counts, advstats) carry PFR ids, not gsis ids. Resolve by
 * (team, normalized name), then unique name league-wide, then unique last name on the
 * team (skipped when `strict`, e.g. snap rows for linemen). Results are cached per PFR id
 * so one good match covers every week.
 */
function makeNameResolver(accs: Map<string, Acc>) {
  const byTeamName = new Map<string, string>();
  const byName = new Map<string, Set<string>>();
  const byTeamLast = new Map<string, Set<string>>();
  for (const a of accs.values()) {
    const nm = normName(a.name);
    const last = nm.split(" ").pop() || nm;
    if (!byName.has(nm)) byName.set(nm, new Set());
    byName.get(nm)!.add(a.id);
    for (const l of a.lines) {
      byTeamName.set(l.team + "|" + nm, a.id);
      const k = l.team + "|" + last;
      if (!byTeamLast.has(k)) byTeamLast.set(k, new Set());
      byTeamLast.get(k)!.add(a.id);
    }
  }
  const cache = new Map<string, string | null>();
  return (pfrId: string, name: string, team: string, strict = false): string | null => {
    if (pfrId && cache.has(pfrId)) {
      const c = cache.get(pfrId)!;
      if (c) return c;
    }
    const nm = normName(name);
    let id: string | null = byTeamName.get(team + "|" + nm) ?? null;
    if (!id) {
      const s = byName.get(nm);
      if (s && s.size === 1) id = s.values().next().value as string;
    }
    if (!id && !strict) {
      const s = byTeamLast.get(team + "|" + (nm.split(" ").pop() || nm));
      if (s && s.size === 1) id = s.values().next().value as string;
    }
    if (pfrId && (id || !strict)) cache.set(pfrId, id);
    return id;
  };
}

type Resolver = ReturnType<typeof makeNameResolver>;

/** Offensive snaps per player-week, and team offensive snaps per team-week (max of any player). */
function processSnaps(rows: Record<string, string>[], resolve: Resolver) {
  const player = new Map<string, Map<number, number>>();
  const team = new Map<string, number>();
  for (const r of rows) {
    const s = num(r.offense_snaps);
    if (s <= 0) continue;
    const week = num(r.week);
    const tk = r.team + "|" + week;
    team.set(tk, Math.max(team.get(tk) ?? 0, s));
    // PFR snap positions are loose (HB, FB, OL-listed TEs...): match every row by name,
    // but only allow the last-name fallback for skill-position labels.
    const skill = ["QB", "RB", "HB", "FB", "WR", "TE"].includes(r.position);
    const id = resolve(r.pfr_player_id, r.player, r.team, !skill);
    if (!id) continue;
    let m = player.get(id);
    if (!m) player.set(id, (m = new Map()));
    m.set(week, (m.get(week) ?? 0) + s);
  }
  return { player, team };
}

type PfrAgg = { car: number; ybc: number; yaco: number; brk: number; drops: number; pressured: number; hasRec: boolean; hasPass: boolean };

/** Season sums of the PFR advanced stats we use, keyed by gsis id. */
function processPfr(
  rec: Record<string, string>[] | null,
  rush: Record<string, string>[] | null,
  pass: Record<string, string>[] | null,
  resolve: Resolver,
): Map<string, PfrAgg> {
  const out = new Map<string, PfrAgg>();
  const get = (r: Record<string, string>) => {
    const id = resolve(r.pfr_player_id, r.pfr_player_name, r.team);
    if (!id) return null;
    let a = out.get(id);
    if (!a) out.set(id, (a = { car: 0, ybc: 0, yaco: 0, brk: 0, drops: 0, pressured: 0, hasRec: false, hasPass: false }));
    return a;
  };
  for (const r of rush || []) {
    const a = get(r);
    if (!a) continue;
    a.car += num(r.carries);
    a.ybc += num(r.rushing_yards_before_contact);
    a.yaco += num(r.rushing_yards_after_contact);
    a.brk += num(r.rushing_broken_tackles);
  }
  for (const r of rec || []) {
    const a = get(r);
    if (!a) continue;
    a.hasRec = true;
    a.brk += num(r.receiving_broken_tackles);
    a.drops += num(r.receiving_drop);
  }
  for (const r of pass || []) {
    const a = get(r);
    if (!a) continue;
    a.hasPass = true;
    a.pressured += num(r.times_pressured);
  }
  return out;
}

/**
 * NGS weekly rows (week 0 = season aggregate is ignored), combined as a weighted mean
 * across weeks: receiving weighted by targets (YACOE by receptions), rushing by
 * attempts, passing by attempts.
 */
function processNgs(
  rec: Record<string, string>[] | null,
  rush: Record<string, string>[] | null,
  pass: Record<string, string>[] | null,
) {
  type W = Map<string, { w: number; s: number }>;
  const wmean = (rows: Record<string, string>[] | null, weightCol: string, cols: Record<string, string>) => {
    const acc = new Map<string, W>();
    for (const r of rows || []) {
      const id = r.player_gsis_id;
      const wt = num(r[weightCol]);
      if (!id || wt <= 0) continue;
      let m = acc.get(id);
      if (!m) acc.set(id, (m = new Map()));
      for (const [out, col] of Object.entries(cols)) {
        const [c, wc] = col.split("@");
        const v = numOrNull(r[c]);
        const w = wc ? num(r[wc]) : wt;
        if (v === null || w <= 0) continue;
        const e = m.get(out);
        if (e) { e.w += w; e.s += v * w; } else m.set(out, { w, s: v * w });
      }
    }
    const res = new Map<string, Record<string, number | null>>();
    for (const [id, m] of acc) {
      const o: Record<string, number | null> = {};
      for (const out of Object.keys(cols)) {
        const e = m.get(out);
        o[out] = e && e.w > 0 ? e.s / e.w : null;
      }
      res.set(id, o);
    }
    return res;
  };
  return {
    rec: wmean(rec, "targets", { yacoe: "avg_yac_above_expectation@receptions", sep: "avg_separation", cushion: "avg_cushion" }),
    rush: wmean(rush, "rush_attempts", { ryoe: "rush_yards_over_expected_per_att", roePct: "rush_pct_over_expected" }),
    pass: wmean(pass, "attempts", { ttt: "avg_time_to_throw", aggr: "aggressiveness" }),
  };
}

/** Game-status designation (Out / Doubtful / Questionable ...) for the given week. */
function processInjuries(rows: Record<string, string>[], season: number, week: number): Map<string, Injury> {
  const out = new Map<string, Injury>();
  for (const r of rows) {
    if (r.season && num(r.season) !== season) continue;
    if (r.game_type && r.game_type !== "REG") continue;
    if (num(r.week) !== week || !r.gsis_id || !r.report_status) continue;
    out.set(r.gsis_id, { status: r.report_status, body: r.report_primary_injury || null });
  }
  return out;
}

// ===========================================================================
// Free tier
// ===========================================================================

/**
 * Free view of a snapshot: same shape, tier "free".
 * Free keeps usage, xFP, opportunity quality, snap share, trend, injury, the overall
 * Fieldglass Score, team context and defenses. Pro-only fields (FPOE, efficiency block,
 * score components, rosEase/playoffEase/schedule) are nulled for everyone except the
 * top 12 by ppg at each position, which keep everything as a teaser.
 * Does not mutate the input.
 */
export function toFree(s: NflSnapshot): NflSnapshot {
  const ranked = s.players.slice().sort((a, b) => b.ppg - a.ppg || a.id.localeCompare(b.id));
  const teaser = new Set<string>();
  const seen: Record<string, number> = {};
  for (const p of ranked) {
    seen[p.pos] = (seen[p.pos] || 0) + 1;
    if (seen[p.pos] <= FREE_TEASER_PER_POS) teaser.add(p.id);
  }
  const copy = <T>(x: T): T => (x === null || x === undefined ? x : JSON.parse(JSON.stringify(x)));
  return {
    ...s,
    tier: "free",
    inputs: s.inputs.slice(),
    playoffWeeks: s.playoffWeeks.slice(),
    players: s.players.map((p) => {
      const base = { ...p, opp: copy(p.opp), injury: copy(p.injury) };
      return teaser.has(p.id)
        ? { ...base, schedule: copy(p.schedule), eff: copy(p.eff), scoreParts: copy(p.scoreParts) }
        : { ...base, rosEase: null, playoffEase: null, schedule: null, fpoe: null, fpoeL3: null, eff: null, scoreParts: null };
    }),
    defenses: copy(s.defenses),
    teams: copy(s.teams),
    risers: s.risers.slice(),
    fallers: s.fallers.slice(),
  };
}
