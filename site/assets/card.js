// The player card shown in the dashboard sheet: score + why, expected vs actual, opportunity,
// efficiency percentiles, team context and schedule. Season Pass blocks render blurred when locked.
import { APP, ROOT, esc, dec, pct, icon, bar, easeWord, oppText, oppLine, trendParts } from "./core.js";
import { M, cardList, percentile, scoreRank, signed, ordinal, TEAM_COLS, teamRank } from "./metrics.js";

const POS_PLURAL = { QB: "QBs", RB: "RBs", WR: "WRs", TE: "TEs" };
const PARTS = [
  ["opp", "Opportunity", "xFP volume"], ["eff", "Efficiency", "points over expected"],
  ["trend", "Trend", "last 3 vs season"], ["sched", "Schedule", "rest-of-season ease"],
];
const WEIGHTS = { opp: 0.5, eff: 0.2, trend: 0.15, sched: 0.15 }; // mirrors SCORE_WEIGHTS in convex/model/nfl.ts

const meter = (v, cls = "") => `<span class="meter ${cls}" aria-hidden="true"><i style="width:${Math.max(2, Math.min(100, v ?? 0))}%"></i></span>`;
const lockPill = `<span class="lock-pill">${icon("lock", "sm")}Season Pass</span>`;
let PRO = false;
const gate = (has, inner) => (has ? inner : PRO ? `<p class="quiet">Not enough plays yet.</p>` : locked(inner));
const locked = (inner) => `<div class="locked block-lock"><div class="blurred" aria-hidden="true">${inner}</div>${lockPill}</div>`;
const block = (title, sub, body, extra = "") => `<section class="pc-block"${extra}>
  <div class="pc-head"><h3 class="card-title">${title}</h3>${sub ? `<p class="quiet">${sub}</p>` : ""}</div>${body}</section>`;

function scoreBlock(snap, p) {
  const brand = esc(APP.brand || "Fieldglass");
  const { rank, of } = p.score != null ? scoreRank(snap, p) : { rank: 0, of: 0 };
  const left = `<div class="pc-score-num">
      <p class="micro">${brand} Score</p>
      <p class="score-n">${p.score == null ? "—" : Math.round(p.score)}</p>
      <p class="quiet">${rank ? `${ordinal(rank)} of ${of} ${POS_PLURAL[p.pos]}` : ""}</p></div>`;
  const parts = p.scoreParts || { opp: 72, eff: 58, trend: 50, sched: 44 };
  const rows = PARTS.map(([k, label, hint]) => `<li class="part">
      <span class="pl">${label}<span class="pw"> · ${Math.round(WEIGHTS[k] * 100)}%</span></span>
      <span class="pv num">${Math.round(parts[k])}</span>${meter(parts[k])}
      <span class="sr-only">${label} ${Math.round(parts[k])} of 100, ${hint}</span></li>`).join("");
  let why = "";
  if (p.scoreParts) {
    const sorted = PARTS.map(([k, l]) => [l.toLowerCase(), p.scoreParts[k]]).sort((a, b) => b[1] - a[1]);
    const top = sorted[0], low = sorted[sorted.length - 1];
    why = `<p class="why">Driven by ${top[0]} (${Math.round(top[1])}).${low[1] < 50 ? ` Held back by ${low[0]} (${Math.round(low[1])}).` : ""}</p>`;
  }
  const right = `<div class="pc-parts"><ul class="parts">${rows}</ul>${why}</div>`;
  return `<section class="pc-block pc-score" aria-label="${brand} Score">${left}${gate(!!p.scoreParts, right)}</section>`;
}

function statLine(p) {
  const t = trendParts(p.trend);
  const share = p.pos === "QB" ? ["Rush share", pct(p.rushShare)] : p.pos === "RB" ? ["Rush share", pct(p.rushShare)] : ["Target share", pct(p.tgtShare)];
  const tiles = [["PPG", dec(p.ppg)], ["Last 3", dec(p.ppgL3)],
    ["Trend", `<span class="${t.cls}">${t.arrow ? `<span class="arr" aria-hidden="true">${t.arrow}</span>` : ""}${t.text}</span>`], share];
  return `<div class="tiles four">${tiles.map(([l, v]) => `<div class="tile"><div class="micro">${l}</div><div class="v num">${v}</div></div>`).join("")}</div>
    <p class="quiet pc-note">${esc(oppLine(p))}, last 3 vs season · ${t.word}</p>`;
}

function dumbbell(label, xfp, actual, diff, max) {
  const x = (xfp / max) * 100, y = (actual / max) * 100;
  const cls = diff > 0 ? "up" : diff < 0 ? "down" : "";
  const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "";
  return `<li class="db-row">
    <span class="db-lab">${label}</span>
    <span class="db-track" aria-hidden="true">
      <i class="db-seg ${cls}" style="left:${Math.min(x, y)}%;width:${Math.abs(y - x)}%"></i>
      <i class="db-dot exp" style="left:${x}%"></i><i class="db-dot act ${cls}" style="left:${y}%"></i>
    </span>
    <span class="db-val ${cls} num">${arrow ? `<span class="arr" aria-hidden="true">${arrow}</span>` : ""}${signed(diff)}</span>
    <span class="db-meta">Expected ${dec(xfp)} · actual ${dec(actual)}</span>
  </li>`;
}
function xfpBlock(p) {
  const has = p.fpoe != null && p.xfp != null;
  const xfp = p.xfp ?? 14, act = has ? p.ppg : 18, l3x = p.xfpL3 ?? xfp, l3a = has ? p.ppgL3 : 15;
  const max = Math.max(10, Math.ceil(Math.max(xfp, act, l3x, l3a) / 5) * 5);
  const body = `<div class="db-legend" aria-hidden="true"><span><i class="db-dot exp"></i>Expected (xFP)</span><span><i class="db-dot act"></i>Actual</span><span class="db-scale">0–${max} pts/g</span></div>
    <ul class="db-list">${dumbbell("Season", xfp, act, has ? p.fpoe : act - xfp, max)}${dumbbell("Last 3", l3x, l3a, has ? (p.fpoeL3 ?? l3a - l3x) : l3a - l3x, max)}</ul>`;
  const sub = "Points per game against what his opportunities are worth on average.";
  const rank = p.xfpRank ? `<p class="pc-read"><strong>${ordinal(p.xfpRank)}</strong> in expected points among ${POS_PLURAL[p.pos]}.</p>` : "";
  const read = has ? `<p class="pc-read">${Math.abs(p.fpoe) < 1 ? "Scoring about what his opportunities predict."
    : p.fpoe > 0 ? `Scoring ${dec(p.fpoe)} more points per game than his opportunities predict. Touchdowns drive most of that gap, so expect some of it to fade.`
    : `Scoring ${dec(-p.fpoe)} fewer points per game than his opportunities predict. If the volume holds, the points tend to follow.`}</p>` : "";
  return block("Expected vs actual", sub, gate(has, body + read) + rank);
}

function metricRows(snap, p, list, fake) {
  return `<ul class="mrows">${list.map((mm) => {
    const v = fake ? 1 : mm.get(p);
    if (v == null) return "";
    const pc = fake ? [62, 81, 44, 70, 55, 38, 90, 66, 50][list.indexOf(mm)] : percentile(snap, mm, p);
    const neutral = mm.dir === 0;
    return `<li class="mrow"${neutral ? ' title="Style metric: neither higher nor lower is better"' : ""}>
      <span class="ml">${esc(mm.label)}</span>
      <span class="mv num">${fake ? "0.00" : mm.fmt(v)}</span>
      <span class="mp num">${pc == null ? "" : ordinal(pc)}</span>
      ${pc == null ? "" : meter(pc, neutral ? "neutral" : "")}
      ${pc == null ? "" : `<span class="sr-only">${ordinal(pc)} percentile among ${POS_PLURAL[p.pos]}${mm.dir < 0 ? ", lower is better" : ""}</span>`}
    </li>`;
  }).join("")}</ul>`;
}

function teamChips(snap, p) {
  const t = (snap.teams || []).find((x) => x.team === p.team);
  if (!t) return "";
  const keys = ["proe", "secPerPlay", "playsPg", "rzTripsPg", "epaPlay"];
  const chips = keys.map((k) => {
    const c = TEAM_COLS.find((x) => x.k === k);
    const v = c.get(t);
    if (v == null) return "";
    const r = teamRank(snap, c, t);
    return `<li class="ctx" title="${esc(c.label)}"><span class="micro">${esc(c.short)}</span><span class="cv num">${c.fmt(v)}</span>${r ? `<span class="cr">${ordinal(r)}</span>` : ""}</li>`;
  }).join("");
  return block(`${esc(p.team)} offense`, "Neutral-situation pass rate over expected, pace and volume. Rank of 32.", `<ul class="ctx-list">${chips}</ul>`);
}

function scheduleBlock(snap, p) {
  const weeks = snap.playoffWeeks || [15, 16, 17];
  const sched = p.schedule || [62, 38, 81, 24, 55, 70].map((e, i) => ({ week: (snap.throughWeek || 4) + i + 1, opp: "---", home: true, ease: e }));
  const body = `<div class="tiles two">
      <div class="tile"><div class="micro">Rest of season</div><div class="v num">${Math.round(p.rosEase ?? 50)} <span class="quiet">${easeWord(p.rosEase ?? 50)}</span></div></div>
      <div class="tile"><div class="micro">Weeks ${weeks[0]}–${weeks[weeks.length - 1]}</div><div class="v num">${Math.round(p.playoffEase ?? 50)} <span class="quiet">${easeWord(p.playoffEase ?? 50)}</span></div></div></div>
    <ol class="ease-list">${sched.map((g) => {
      const po = weeks.includes(g.week);
      return `<li class="ease-row${po ? " po" : ""}"><span class="wk">W${g.week}${po ? `<span class="tag">Playoffs</span>` : ""}</span>
        <span class="opp">${esc(oppText(g))}</span>${bar(g.ease)}<span class="val num">${Math.round(g.ease)}</span><span class="sr-only">${easeWord(g.ease)}</span></li>`;
    }).join("")}</ol>`;
  return block("Schedule ease", `0–100 vs ${POS_PLURAL[p.pos]}. Higher is a softer matchup.`, gate(!!p.schedule, body));
}

export function cardHTML(snap, p, pro) {
  PRO = pro;
  const free = !pro && !p.eff && !p.scoreParts && !p.schedule;
  const oppList = cardList("opportunity", p.pos);
  const effList = cardList("efficiency", p.pos);
  const opp = block("Role & opportunity", "Percentile within position. Free for every player.", metricRows(snap, p, oppList, false));
  const effSub = pro ? `Percentile within position, min. 15 opportunities. ${p.eff ? `${p.eff.n} opportunities.` : ""}`
    : "Percentile among the free preview players at his position.";
  const eff = block("Efficiency vs league", effSub, gate(!!p.eff, p.eff ? metricRows(snap, p, [M.fpoe, ...effList], false) : metricRows(snap, p, effList.slice(0, 6), true)));
  const cta = free ? `<section class="pc-cta glass">${icon("lock")}<div><p class="card-title">See why, not just who</p>
      <p class="quiet">Score breakdown, points over expected, efficiency percentiles and every remaining matchup.</p></div>
      <div class="pc-cta-actions"><a class="btn primary" data-checkout href="#">Get the Season Pass · $9</a>
      <a class="quiet" href="${new URL("pro/#unlock", ROOT).href}">Enter a license key</a></div></section>` : "";
  return scoreBlock(snap, p) + statLine(p) + `<div class="pc-grid">${xfpBlock(p)}${opp}</div>` + eff + teamChips(snap, p) + scheduleBlock(snap, p) + cta;
}
