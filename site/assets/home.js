// Landing page: live score leader, score cards per position, movers, playoff schedule teaser.
import { APP, initPage, loadSnapshot, trendLists, trendParts, trendHTML, oppLine, oppText, easeWord, esc, dot, bar, dec } from "./core.js";
import { signed, injuryPill } from "./metrics.js";

initPage();

const $ = (s) => document.querySelector(s);
const PARTS = [["opp", "Opportunity", 50], ["eff", "Efficiency", 20], ["trend", "Trend", 15], ["sched", "Schedule", 15]];
const playerHref = (p) => `nfl/?player=${encodeURIComponent(p.id)}`;

const partsHTML = (sp) => `<ul class="parts">${PARTS.map(([k, l, w]) => `<li class="part">
  <span class="pl">${l}<span class="pw"> · ${w}%</span></span><span class="pv num">${Math.round(sp[k])}</span>
  <span class="meter" aria-hidden="true"><i style="width:${Math.max(2, sp[k])}%"></i></span></li>`).join("")}</ul>`;
const xLine = (p) => `${p.pos} · ${p.team} · ${dec(p.xfp)} xFP/g${p.fpoe != null ? ` · ${signed(p.fpoe)} over expected` : ""}`;

function moverRow(p, i) {
  return `<li><a class="row" href="${playerHref(p)}">
    <span class="rank">${i + 1}</span>
    <span class="row-main"><span class="row-title">${esc(p.name)} ${injuryPill(p.injury)}</span>
      <span class="row-meta">${dot(p.pos)}<span>${esc(p.pos)} · ${esc(p.team)} · ${esc(oppLine(p))}</span></span></span>
    <span class="row-key"><span class="k num">${trendHTML(p.trend)}</span><span class="w">${trendParts(p.trend).word}</span></span>
  </a></li>`;
}

function playoffRow(p, i, weeks) {
  const cells = weeks.map((w) => {
    const g = (p.schedule || []).find((x) => x.week === w);
    return `<span class="wk-cell"><b>W${w}</b>${g ? `<span>${esc(oppText(g))}</span>${bar(g.ease)}` : `<span>Bye</span>`}</span>`;
  }).join("");
  const e = Math.round(p.playoffEase);
  return `<li><a class="row po-row" href="${playerHref(p)}">
    <span class="rank">${i + 1}</span>
    <span class="row-main"><span class="row-title">${esc(p.name)}</span>
      <span class="row-meta">${dot(p.pos)}<span>${esc(p.pos)} · ${esc(p.team)}</span></span></span>
    <span class="wk-cells hide-sm">${cells}</span>
    <span class="row-key"><span class="k num">${e}</span><span class="w">${easeWord(e)}</span></span>
  </a></li>`;
}

function scoreCard(p) {
  return `<a class="glass score-card" href="${playerHref(p)}">
    <p class="micro">Top ${p.pos}</p>
    <div class="top"><div style="min-width:0"><p class="card-title">${esc(p.name)}</p>
      <p class="row-meta">${dot(p.pos)}<span>${esc(p.team)} · ${dec(p.xfp)} xFP/g</span></p></div>
      <p class="score-n num" aria-label="Score ${Math.round(p.score)}">${Math.round(p.score)}</p></div>
    ${partsHTML(p.scoreParts)}</a>`;
}

async function main() {
  let snap;
  try { snap = (await loadSnapshot()).data; } catch { return; }
  document.querySelectorAll("[data-week]").forEach((el) => { el.textContent = snap.throughWeek; });
  document.querySelectorAll("[data-season]").forEach((el) => { el.textContent = snap.season; });

  const scored = snap.players.filter((p) => p.scoreParts && p.score != null && p.games >= 2).sort((a, b) => b.score - a.score);
  const top = scored[0];
  if (top) {
    $("#hero-num").textContent = Math.round(top.score);
    $("#hero-name").innerHTML = `${esc(top.name)} ${injuryPill(top.injury)}`;
    $("#hero-meta").textContent = xLine(top);
    $("#hero-parts").innerHTML = partsHTML(top.scoreParts);
    $("#hero-link").href = playerHref(top);
  }
  $("#score-cards").innerHTML = ["QB", "RB", "WR", "TE"].map((pos) => scored.find((p) => p.pos === pos)).filter(Boolean).map(scoreCard).join("");

  const { risers, fallers } = trendLists(snap, "ALL", 5);
  $("#risers").innerHTML = risers.map(moverRow).join("");
  $("#fallers").innerHTML = fallers.map(moverRow).join("");

  const weeks = snap.playoffWeeks || [15, 16, 17];
  const teaser = snap.players.filter((p) => p.playoffEase != null).sort((a, b) => b.playoffEase - a.playoffEase).slice(0, 12);
  $("#playoff-rows").innerHTML = teaser.map((p, i) => playoffRow(p, i, weeks)).join("");
  document.querySelectorAll("[data-brand-score]").forEach((el) => { el.textContent = `${APP.brand} Score`; });
}
main();
