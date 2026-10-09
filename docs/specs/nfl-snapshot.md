# NFL snapshot contract (v2; all v1 fields kept)

The nightly Convex cron downloads public nflverse files (CC-BY 4.0, attribution required),
builds ONE snapshot object with the pure function in `convex/model/nfl.ts`, and stores it.
The site renders from it. Free visitors get `toFree(snapshot)`; season-pass holders get the full object.

Inputs
- `stats_player_week_<season>.csv` from `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_<season>.csv`
- `games.csv` from `https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv` (all seasons; filter by season)

v2 optional inputs (same base URL; each may be missing and the snapshot still builds, see `inputs`):
`pbp/play_by_play_<season>.csv.gz`, `snap_counts/snap_counts_<season>.csv`,
`pfr_advstats/advstats_week_{rec,rush,pass}_<season>.csv`, `nextgen_stats/ngs_{receiving,rushing,passing}.csv.gz`
(all seasons; filter by season), `injuries/injuries_<season>.csv`. Not used: `ftn_charting` (licence unverified).

Fixtures for tests (2026 weeks 1-4, upstream basenames, trimmed to `NFL_COLUMNS` by `scripts/trim-nfl-fixtures.ts`):
`stats_player_week_2026.csv`, `games_2026.csv`, `play_by_play_2026.csv.gz`, `snap_counts_2026.csv`,
`advstats_week_{rec,rush,pass}_2026.csv`, `ngs_{receiving,rushing,passing}.csv.gz`, `injuries_2026.csv` (includes the week-5 report).

## Functions (pure, no imports, no Node/Convex APIs, so `node --test` and Convex both run them)

```ts
// v2: a bag of CSV texts (gz already decompressed by the caller). Only stats + games are required.
buildNflSnapshot(inputs: { stats: string; games: string; pbp?; snaps?; pfrRec?; pfrRush?; pfrPass?;
                           ngsRec?; ngsRush?; ngsPass?; injuries? }, opts: { season: number; generatedAt: string }): NflSnapshot
toFree(s: NflSnapshot): NflSnapshot   // same shape, Pro-only fields removed / truncated (see below)
parseCsv(text: string, columns?: string[]): Record<string,string>[]  // quoted fields; optional column projection
NFL_COLUMNS   // columns read from each input (callers may pre-trim the ~370-column pbp file to these)
SCORE_WEIGHTS, MATCHUP_WEIGHTS   // exported so the UI can quote them
```

## Shape

```ts
type NflSnapshot = {
  sport: "nfl";
  season: number;
  throughWeek: number;          // last REG week with stats
  generatedAt: string;          // ISO
  tier: "free" | "pro";
  source: string;               // "Data: nflverse (CC-BY 4.0)"
  playoffWeeks: number[];       // [15, 16, 17]
  players: Player[];            // QB, RB, WR, TE with >= 1 game; sorted by ppg desc
  defenses: Defense[];          // 32 teams
  risers: string[];             // player ids, top 10 by usage trend (min sample rules below)
  fallers: string[];            // player ids, bottom 10
};

type Player = {
  id: string; name: string; pos: "QB"|"RB"|"WR"|"TE"; team: string; headshot?: string;
  games: number;
  ppg: number;            // PPR fantasy points per game, season
  ppgL3: number;          // last 3 games played
  // usage (season / last 3). Shares are 0..1. Null where not meaningful for the position.
  tgtShare: number|null; tgtShareL3: number|null;
  airShare: number|null; wopr: number|null; woprL3: number|null;
  rushShare: number|null; rushShareL3: number|null;   // player carries / team carries in the same games
  touchesPg: number;      // carries + receptions per game
  trend: number;          // usage trend score, roughly -1..1: L3 opportunity vs season (see model)
  // schedule (Pro): defense ease vs this player's position, 0..100 (100 = easiest)
  rosEase: number|null;           // mean ease over remaining REG weeks (after throughWeek)
  playoffEase: number|null;       // mean ease over playoffWeeks
  schedule: { week: number; opp: string; home: boolean; ease: number }[] | null; // remaining weeks, BYE omitted
};

type Defense = {
  team: string;
  allowedPpg: { QB: number; RB: number; WR: number; TE: number };  // PPR pts allowed per game to that position
  ease: { QB: number; RB: number; WR: number; TE: number };        // 0..100 percentile, 100 = gives up most
};
```

## Model rules
- Use `season_type == "REG"` rows only. Team totals for shares come from summing all players of that team in that week.
- `ppg` uses `fantasy_points_ppr`. Round all numbers to 2 decimals (shares to 3).
- Allowed points: sum by (opponent_team, week, position), average across weeks that defense played.
  Ease = percentile rank of allowedPpg among 32 teams (0..100). Early-season noise: shrink toward league mean
  with weight games/(games+3) before ranking.
- Remaining schedule from games.csv `game_type == "REG"`, weeks > throughWeek; opp = the other team; home if home_team == team.
- `trend`: compare L3 vs season for opportunity: WR/TE use wopr; RB use (rushShare + tgtShare); QB use ppg ratio.
  trend = clamp((L3 - season) / max(season, small), -1, 1). Require games >= 3 for risers/fallers and ppg >= 5.
- Players with team changes: use the team from their latest week.

## Free vs Pro (`toFree`)
- Free: all players' usage fields + `ppg`, `ppgL3`, `trend`; `risers`/`fallers`; `defenses` included.
- Free strips `rosEase`, `playoffEase`, `schedule` (set to null) EXCEPT for the top 12 players by ppg at each position
  (a teaser so visitors see what Pro looks like). `tier` = "free".

## Deviations / judgment calls (v1)
- Position comes from `position_group` (so fullbacks count as RB); rows with no `player_id` are skipped.
- Shares use team totals over the same weeks the player played (season and L3). `airShare` is clamped to 0..1
  (negative air yards can push it outside). `wopr` = 1.5·tgtShare + 0.7·airShare, rounded to 3 decimals; it can exceed 1.
- Null by position: QB has no receiving shares (`tgtShare*`, `airShare`, `wopr*`); WR/TE have no `rushShare*`.
- `trend` floor ("small"): 0.05 for share-based opportunity, 1.0 ppg for QBs. Risers need trend > 0 and fallers
  trend < 0, so the lists are disjoint and can be shorter than 10. Note: with games == 3, L3 equals season, so trend is 0.
- Defense "weeks played" = weeks with any stat row against that defense. `allowedPpg` is the raw average; only the
  ranking uses the shrunk value. Ease ties share the average rank. A remaining opponent with no defense row gets ease 50.
- `toFree` teaser = top 12 by ppg per position with no minimum-games filter, as written.
- Tests run with `npm test` (`node --experimental-strip-types --test 'tests/**/*.test.ts' ...`); a bare `tests/` directory
  argument does not work on Node 22.

## v2 additions to the shape

```ts
type NflSnapshot = { ...v1, version: 2; inputs: string[]; teams: Team[] };  // inputs = which files were present

type Player = { ...v1,
  xfp: number|null; xfpL3: number|null;   // expected PPR points per game (pbp)
  xfpRank: number|null;                    // rank of xfp within position, 1 = most opportunity
  fpoe: number|null; fpoeL3: number|null;  // PRO: PPR points over expected per game = ppg - xfp
  opp: Opportunity|null;                   // opportunity quality (free)
  snapShare: number|null; snapShareL3: number|null; tgtPerSnap: number|null;  // role (free)
  injury: { status: string; body: string|null }|null;   // next week's game status (Out/Doubtful/Questionable)
  eff: Efficiency|null;                    // PRO: efficiency block
  score: number|null;                      // Fieldglass Score 0..100 within position (free)
  scoreParts: { opp; eff; trend; sched }|null;   // PRO: sub-scores 0..100 that explain the score
};
// Keys inside opp / eff are OMITTED (not null) when not applicable to the position or the source has no row.
type Opportunity = { adot?; ezTgt?; rzTgtShare?; rzCarShare?; i10CarShare?; hvtPg: number; tgtShare3D2M? /* RB only */ };
type Efficiency = { n: number;               // opportunities: targets + carries (QB: dropbacks + designed runs)
  epaTgt?; srTgt?; epaRush?; srRush?; epaDb?; srDb?; cpoe?;   // pbp
  yacoe?; sep?; cushion?;  ryoe?; roePct?;  ttt?; aggr?;      // NGS receiving / rushing / passing
  ybc?; yaco?; brkTkl?; drops?; dropPct?; pressure?;          // PFR rushing / receiving / passing
};
type Team = { team; games; playsPg; secPerPlay|null; passRate|null; proe|null; rzTripsPg; epaPlay|null; epaPass|null; epaRush|null };
type Defense = { ...v1, epaPass: number|null; epaRush: number|null; matchupEase: { QB; RB; WR; TE } };
```

## v2 methods

All pbp work uses `play_type` in (pass, run) and drops 2-point tries, kneels, spikes and penalty-nullified plays
(`no_play`). Everything is limited to REG weeks 1..throughWeek of the season.

**Expected fantasy points (xFP, PPR).** Every play a player gets is valued at the league-average fantasy outcome of
comparable plays this season, and xFP/g is the sum over his plays divided by his games:
- Target: cell = air-yards bucket (NA, <0, 0-4, 5-9, 10-14, 15-19, 20-29, 30+) x yardline_100 bucket (1-5, 6-10, 11-20,
  21-40, 41-99). Outcome = 1 per catch + 0.1 per receiving yard + 6 per receiving TD.
- Carry: cell = yardline_100 bucket (1-2, 3-5, 6-10, 11-20, 21-50, 51-99) x down group (1st-2nd / 3rd-4th).
  Outcome = 0.1 per rushing yard + 6 per rushing TD. Scrambles count as carries.
- Pass attempt (QBs): same cells as targets. Outcome = 0.04 per passing yard + 4 per TD - 2 per INT.
- Thin cells are shrunk: cell value = (sum + 20 x parent) / (n + 20), where the parent is the air-yards bucket
  (targets/passes) or yardline bucket (carries), itself shrunk toward the league mean the same way.
- FPOE/g = actual `fantasy_points_ppr`/g - xFP/g. Fumbles, 2-point conversions and return TDs are in actual points but
  not in xFP, so they land in FPOE. Calibration on the fixture: league xFP / actual = 0.99 for RB+WR+TE
  (QB 0.92, TE 0.92). Tests require every position within 10%.

**Opportunity quality** (pbp, shares over the player's own games, team = his team that week):
aDOT = air yards / targets; end-zone target = air yards >= yardline_100; red-zone = yardline_100 <= 20, inside-10 <= 10;
`hvtPg` = (carries inside the 10 + targets) / games; `tgtShare3D2M` (RB) = targets on 3rd/4th down or with
<= 2:00 left in the half / team targets in those situations.

**Efficiency.** pbp: EPA and success (`success` column) per target, per rush (designed + scrambles), per QB dropback
(attempts + sacks + scrambles); CPOE = mean pbp `cpoe` on QB attempts (percentage points).
NGS weekly rows (week 0 season rows ignored) are combined as weighted means: separation/cushion by targets, YACOE by
receptions, RYOE/att and share of rushes over expected by attempts, time to throw and aggressiveness by attempts.
PFR: yards before/after contact per carry, broken tackles (rushing + receiving), drops and drops / targets, pressure
rate = times pressured / pbp dropbacks. PFR and snap files carry PFR ids, so rows are joined to gsis ids by
(team, normalized name), then unique name, then unique last name on the team (skill-position rows only).

**Role.** Snap share = player offensive snaps / team offensive snaps (max of any player that team-week) over his games;
`tgtPerSnap` = targets / offensive snaps. Route participation is skipped (no licensed participation source yet).

**Team context** (`teams[]`, joined to players by `team`): neutral situation = win prob 20-80% and quarters 1-3.
`passRate` = neutral dropback rate; `proe` = neutral dropback rate - mean nflverse `xpass`; `secPerPlay` = mean clock
seconds between consecutive neutral snaps by the same offense on the same drive (gaps over 60 s dropped);
`playsPg` = pass+run plays / games; `rzTripsPg` = drives with a snap inside the 20 / games; `epaPlay/Pass/Rush` = mean EPA.

**Defense.** `epaPass` / `epaRush` = EPA per dropback / per designed run allowed. Both are shrunk toward the league mean
by games/(games+3) and percentile-ranked (higher EPA allowed = easier). `matchupEase[pos]` =
fp ease x w.fp + pass-EPA percentile x w.pass + rush-EPA percentile x w.rush with weights
QB 0.6/0.3/0.1, RB 0.6/0.1/0.3, WR 0.6/0.4/0, TE 0.6/0.4/0 (`MATCHUP_WEIGHTS`). Without pbp it equals `ease`.
The v1 `schedule[].ease`, `rosEase` and `playoffEase` still use fp-only `ease` (unchanged contract).

**Injury.** The injuries file's `report_status` for week throughWeek + 1 (the upcoming game). No row or blank status
= null. Practice-only listings are ignored.

**Fieldglass Score** (0-100 within position; every sub-score is 0-100 and stored in `scoreParts`):
- `opp` (weight 0.50) = percentile within position of xFP/g x games/(games+1) (ppg if no pbp). The games factor keeps
  a one-game spot starter from topping the list.
- `eff` (0.20) = percentile within position of FPOE/g x n/(n+40), n = opportunities (FPOE regressed toward 0 by
  sample). 50 if no pbp.
- `trend` (0.15) = 50 + 50 x trend.
- `sched` (0.15) = rosEase (50 if no games left).
- score = 0.5 opp + 0.2 eff + 0.15 trend + 0.15 sched (`SCORE_WEIGHTS`).

## Free vs Pro (v2)
- Free: all v1 free fields plus `xfp`, `xfpL3`, `xfpRank`, `opp`, `snapShare*`, `tgtPerSnap`, `injury`, `score`,
  `teams`, and the full `defenses` table.
- Pro only (null in free except the top 12 by ppg per position, which keep everything as a teaser):
  `fpoe`, `fpoeL3`, `eff`, `scoreParts`, `rosEase`, `playoffEase`, `schedule`.
- Fixture sizes: pro 664 KB, free 344 KB (uncompressed JSON; target pro < 1.2 MB).

## Deviations / judgment calls (v2)
- QB xFP also values pass attempts (passing outcome table). Without it QB FPOE would mostly measure passing volume.
- Kneels are excluded from xFP and opportunity counts but stay in the stats-based `rushShare` (v1 rule unchanged).
- "High-value touches" uses the requested definition (carries inside the 10 + targets), not receptions.
- `xfpRank` ranks every player at the position (no minimum games). Use `games` to filter in the UI.
- `score` itself is free and only `scoreParts` is Pro, which reads "Pro-only: Fieldglass Score components" literally.
- Production memory: a full-season pbp file is ~100 MB uncompressed. On the 22 MB, 4-week raw file the build takes
  ~0.4 s and ~110 MB heap. Run the refresh in a Node action, or trim to `NFL_COLUMNS` before calling the model.

## Metrics roadmap (ranked by value / effort; highest first)
1. Opponent-adjusted FPOE and xFP: adjust each play's expectation by the defense's EPA/fp allowed (cheap, pbp only).
2. Weekly projection model: xFP/g blended with FPOE (regressed) x matchupEase x implied team total from `games.csv`
   spread/total lines, with a walk-forward backtest (MAE vs a naive ppg baseline) stored in the snapshot.
3. Rest-of-season projections with uncertainty bands: bootstrap weekly residuals to give 10th/50th/90th percentiles.
4. Red-zone efficiency over expected: TD rate on RZ targets/carries vs the xFP TD component (TD regression flags).
5. Game-script splits: usage when leading / trailing / neutral (pbp `wp`, score differential).
6. Vegas-implied team totals and player share of team implied points (from `games.csv` lines).
7. Target quality: catchable-target proxy (not intercepted, not thrown away) and expected catch rate (nflverse `cp`).
8. Air-yards conversion (RACR) and expected-vs-actual YAC from pbp `xyac_mean_yardage` (no NGS threshold needed).
9. Rushing success over expected by box count (NGS `percent_attempts_gte_eight_defenders`).
10. QB rushing value split: designed runs vs scrambles, goal-line QB carries.
11. Stability-weighted "true talent" priors from the previous season (load prior-season stats, regress early weeks).
12. Usage volatility / boom-bust: weekly SD of PPR and xFP, floor/ceiling percentiles (DFS and best-ball use).
13. Coverage-shell / man-zone splits and route-based metrics (TPRR, YPRR, route participation): only after a
    licensed participation/charting source is confirmed (not `ftn_charting` until its licence is verified).
14. Injury-adjusted usage: shares recomputed excluding games a teammate missed ("with/without" splits).
15. Defense vs position by alignment (slot/wide/TE): needs charting data, gated on licensing like item 13.
16. Kicker and team-defense models (FG attempt xFP by distance, D/ST sacks/turnovers over expected).
17. Strength-of-schedule for past games (how hard were the matchups that produced the current numbers).
18. Trade/waiver value index: Fieldglass Score delta vs ADP-like consensus (needs a licensed ADP source).
