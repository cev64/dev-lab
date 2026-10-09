// Dashboard: players (usage / opportunity / efficiency lenses), risers & fallers, playoff planner,
// team environments, defenses; filters, sorting and the player card sheet.
import {
  initPage, loadSnapshot, wireCheckout, trendLists, trendParts, trendHTML, oppLine, oppText,
  easeWord, esc, dot, bar, pct, dec, fmtDate, icon, ROOT,
} from "./core.js";
import { M, LENSES, lensCols, TEAM_COLS, injuryPill, signed, epa } from "./metrics.js";
import { cardHTML } from "./card.js";

initPage();

const $ = (s, el = document) => el.querySelector(s);
const VIEWS = ["players", "risers", "playoffs", "teams", "defenses"];
const TITLES = { players: "Player board", risers: "Risers & fallers", playoffs: "Playoff Planner", teams: "Team environments", defenses: "Defenses" };
const POSS = ["QB", "RB", "WR", "TE"];
const PAGE = 50;
const hashView = location.hash.slice(1) === "usage" ? "players" : location.hash.slice(1);

const state = {
  view: VIEWS.includes(hashView) ? hashView : "players",
  lens: "usage", pos: "ALL", q: "", limit: PAGE,
  sort: { usage: ["score", -1], opportunity: ["score", -1], efficiency: ["score", -1],
          playoffs: ["playoffEase", -1], teams: ["epaPlay", -1], defenses: ["ease", -1] },
};
let snap = null, pro = false;

/* ---------- helpers ---------- */
const sortKey = () => (state.view === "players" ? state.lens : state.view);
function sortBy(list, [k, dir], get) {
  return list.slice().sort((a, b) => {
    const x = get(a, k), y = get(b, k);
    if (x == null && y == null) return 0;
    if (x == null) return 1;           // missing values always last
    if (y == null) return -1;
    return (x - y) * dir;
  });
}
const matchQ = (p) => { const q = state.q.toLowerCase(); return !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase() === q; };
const filtered = () => snap.players.filter((p) => (state.pos === "ALL" || p.pos === state.pos) && matchQ(p));
const empty = (text) => `<div class="empty">${esc(text)}</div>`;
const lockCell = `<span class="na" title="Season Pass">${icon("lock", "sm")}<span class="sr-only">Season Pass</span></span>`;

function headCell(c, key, extra = "") {
  const [k, dir] = state.sort[key];
  const active = k === c.k;
  const aria = active ? ` aria-sort="${dir < 0 ? "descending" : "ascending"}"` : "";
  const arrow = active ? `<span class="arrow" aria-hidden="true">${dir < 0 ? "▼" : "▲"}</span>` : "";
  return `<th scope="col"${aria} title="${esc(c.label)}"${extra}><button type="button" data-sort="${c.k}">${esc(c.short)}${arrow}</button></th>`;
}
function playerCell(p, meta) {
  return `<td class="player"><span class="name-line"><button type="button" class="pname row-title" data-id="${esc(p.id)}">${esc(p.name)}</button>${injuryPill(p.injury)}</span>
    <span class="row-meta">${dot(p.pos)}<span>${esc(p.pos)} · ${esc(p.team)}<span class="meta-lg"> · ${p.games} G</span>${meta ? `<span class="meta-sm"> · ${meta}</span>` : ""}</span></span></td>`;
}
const keyCell = (html, word) => `<td class="cell-key"><div class="row-key"><span class="k num">${html}</span><span class="w">${esc(word)}</span></div></td>`;
const moreButton = (total) => (total > state.limit
  ? `<div class="more"><button class="btn small" type="button" data-more>Show ${Math.min(PAGE, total - state.limit)} more · ${total - state.limit} left</button></div>` : "");
const isLocked = (c, p) => c.pro && !pro && p.eff == null && p.fpoe == null;
const cellVal = (c, p) => { if (isLocked(c, p)) return lockCell; const v = c.get(p); return v == null ? `<span class="na">—</span>` : c.fmt(v); };

/* ---------- players (lenses) ---------- */
function lensMeta(p) {
  if (state.lens === "opportunity") {
    const xs = `xFP ${dec(p.xfp)}`;
    if (p.pos === "QB") return `${xs} · ${pct(p.opp?.rzCarShare)} RZ car`;
    if (p.pos === "RB") return `${xs} · ${dec(p.opp?.hvtPg)} HVT/g`;
    return `${xs} · aDOT ${dec(p.opp?.adot)}`;
  }
  if (state.lens === "efficiency") {
    if (!p.eff && p.fpoe == null) return pro ? "Not enough plays" : "Season Pass";
    const e = p.pos === "QB" ? `EPA/db ${epa(p.eff?.epaDb)}` : p.pos === "RB" ? `EPA/rush ${epa(p.eff?.epaRush)}` : `EPA/tgt ${epa(p.eff?.epaTgt)}`;
    return `FPOE ${signed(p.fpoe)} · ${e}`;
  }
  if (p.pos === "QB") return `${dec(p.ppg)} PPG · ${pct(p.rushShare)} rush`;
  if (p.pos === "RB") return `${dec(p.ppg)} PPG · ${pct(p.rushShare)} rush`;
  return `${dec(p.ppg)} PPG · ${pct(p.tgtShare)} tgt`;
}
function renderPlayers() {
  const cols = lensCols(state.lens, state.pos);
  let [k, dir] = state.sort[state.lens];
  if (!cols.some((c) => c.k === k)) { k = "score"; state.sort[state.lens] = ["score", -1]; }
  const col = M[k];
  const list = sortBy(filtered(), [k, dir], (p, key) => (isLocked(M[key], p) ? null : M[key].get(p)));
  const intro = state.lens === "efficiency" && !pro
    ? `<div class="glass callout">${icon("lock")}<p>Efficiency is Season Pass data. Free preview: the top 12 scorers at each position.</p><a class="btn small" data-checkout href="#">Season Pass · $9</a></div>` : "";
  if (!list.length) return intro + `<div class="glass panel">${empty("No players match. Try another name or position.")}</div>`;
  const rows = list.slice(0, state.limit).map((p, i) => {
    const kv = isLocked(col, p) ? lockCell : col.get(p) == null ? "—" : col.fmt(col.get(p));
    return `<tr data-id="${esc(p.id)}"><td class="rank-cell">${i + 1}</td>${playerCell(p, lensMeta(p))}
      ${cols.map((c) => `<td class="${c.k === "score" ? "key score-cell" : ""}">${cellVal(c, p)}</td>`).join("")}
      ${keyCell(kv, col.short)}</tr>`;
  }).join("");
  return intro + `<div class="glass panel"><table class="tbl"><caption class="sr-only">${LENSES[state.lens].label} lens, ${list.length} players</caption>
    <thead><tr><th scope="col"><span class="sr-only">Rank</span></th><th scope="col">Player</th>${cols.map((c) => headCell(c, state.lens)).join("")}<th class="cell-key"></th></tr></thead>
    <tbody>${rows}</tbody></table>${moreButton(list.length)}</div>`;
}

/* ---------- risers & fallers ---------- */
function trendRow(p, i) {
  const t = trendParts(p.trend);
  return `<li><button type="button" class="row" data-id="${esc(p.id)}">
    <span class="rank">${i + 1}</span>
    <span class="row-main"><span class="row-title">${esc(p.name)} ${injuryPill(p.injury)}</span>
      <span class="row-meta">${dot(p.pos)}<span>${esc(p.pos)} · ${esc(p.team)} · ${esc(oppLine(p))}</span></span></span>
    <span class="row-key"><span class="k num">${trendHTML(p.trend)}</span><span class="w">${t.word}</span></span></button></li>`;
}
function renderRisers() {
  const { risers, fallers } = trendLists(snap, state.pos, 10);
  const card = (title, ic, list, none) => `<section class="glass list-card" aria-label="${title}">
      <div class="card-head">${icon(ic)}<h2 class="card-title">${title}</h2></div>
      ${list.length ? `<ol class="rows">${list.map(trendRow).join("")}</ol>` : empty(none)}</section>`;
  return `<p class="quiet lead-note">Last 3 games vs season. WR/TE: WOPR. RB: rush + target share. QB: points per game. Minimum 3 games and 5 PPG.</p>
    <div class="split">${card("Heating up", "up", risers.filter(matchQ), "No risers match.")}${card("Cooling off", "down", fallers.filter(matchQ), "No fallers match.")}</div>`;
}

/* ---------- playoff planner ---------- */
const PLAYOFF = [
  { k: "score", short: "Score", label: "Score", get: (p) => p.score, fmt: (v) => Math.round(v) },
  { k: "ppg", short: "PPG", label: "PPR points per game", get: (p) => p.ppg, fmt: (v) => dec(v) },
  { k: "rosEase", short: "ROS ease", label: "Rest-of-season schedule ease", get: (p) => p.rosEase, fmt: (v) => `${Math.round(v)}${bar(v)}` },
  { k: "playoffEase", short: "Playoff ease", label: "Weeks 15-17 schedule ease", get: (p) => p.playoffEase, fmt: (v) => `${Math.round(v)}${bar(v)}` },
];
function weekCell(p, w) {
  const g = (p.schedule || []).find((x) => x.week === w);
  if (!g) return `<td class="na">Bye</td>`;
  return `<td class="ease-cell"><span class="opp">${esc(oppText(g))}</span> ${Math.round(g.ease)}${bar(g.ease)}</td>`;
}
function lockPanel(count) {
  const fake = Array.from({ length: 5 }, (_, i) => `<div class="row"><span class="rank">${i + 1}</span>
    <span class="row-main"><span class="row-title">Season Pass player</span><span class="row-meta">W15 · W16 · W17</span></span>
    <span class="row-key"><span class="k">${[71, 64, 58, 52, 47][i]}</span><span class="w">Soft</span></span></div>`).join("");
  return `<div class="locked glass panel" style="margin-top:12px">
    <div class="blurred" aria-hidden="true">${fake}</div>
    <div class="lock-card"><div class="glass">${icon("lock")}
      <p class="card-title">Season Pass unlocks all ${count} players</p>
      <p class="quiet" style="margin:6px 0 14px">Rest-of-season and Weeks 15–17 ease for every QB, RB, WR and TE.</p>
      <a class="btn primary block" data-checkout href="#">Get the Season Pass · $9</a>
      <p class="quiet" style="margin-top:10px"><a href="${new URL("pro/#unlock", ROOT).href}">Enter a license key</a></p>
    </div></div></div>`;
}
function renderPlayoffs() {
  const weeks = snap.playoffWeeks || [15, 16, 17];
  const [k, dir] = state.sort.playoffs;
  const getter = (p, key) => PLAYOFF.find((c) => c.k === key).get(p);
  const list = sortBy(filtered().filter((p) => p.playoffEase != null), [k, dir], getter);
  const lockedCount = snap.players.filter((p) => p.playoffEase == null).length;
  const col = PLAYOFF.find((c) => c.k === k);
  const intro = pro ? "" : `<div class="glass callout">${icon("calendar")}<p>Free preview: the top 12 scorers at each position. Ease runs 0–100; higher means a softer matchup for that position.</p></div>`;
  const rows = list.slice(0, state.limit).map((p, i) => {
    const po = weeks.map((w) => { const g = (p.schedule || []).find((x) => x.week === w); return g ? (g.home ? "" : "@") + g.opp : "bye"; }).join(", ");
    const kv = k === "ppg" ? dec(p.ppg) : Math.round(col.get(p) ?? 0);
    return `<tr data-id="${esc(p.id)}"><td class="rank-cell">${i + 1}</td>${playerCell(p, po)}
      ${PLAYOFF.map((c) => `<td class="${c.k === "playoffEase" ? "key " : ""}${c.k.endsWith("Ease") ? "ease-cell" : ""}">${c.get(p) == null ? "—" : c.fmt(c.get(p))}</td>`).join("")}
      ${weeks.map((w) => weekCell(p, w)).join("")}
      ${keyCell(kv, k === "ppg" || k === "score" ? col.short : easeWord(col.get(p)))}</tr>`;
  }).join("");
  const table = list.length ? `<div class="glass panel"><table class="tbl"><caption class="sr-only">Playoff schedule ease</caption>
    <thead><tr><th scope="col"><span class="sr-only">Rank</span></th><th scope="col">Player</th>${PLAYOFF.map((c) => headCell(c, "playoffs")).join("")}
    ${weeks.map((w) => `<th scope="col">W${w}</th>`).join("")}<th class="cell-key"></th></tr></thead>
    <tbody>${rows}</tbody></table>${moreButton(list.length)}</div>`
    : `<div class="glass panel">${empty(pro ? "No players match." : "No preview players match. The Season Pass covers everyone.")}</div>`;
  return intro + table + (pro ? "" : lockPanel(lockedCount));
}

/* ---------- teams ---------- */
function renderTeams() {
  const q = state.q.toLowerCase();
  const [k, dir] = state.sort.teams;
  const col = TEAM_COLS.find((c) => c.k === k);
  const list = sortBy((snap.teams || []).filter((t) => !q || t.team.toLowerCase().includes(q)), [k, dir], (t, key) => TEAM_COLS.find((c) => c.k === key).get(t));
  const rows = list.map((t, i) => {
    const meta = `PROE ${TEAM_COLS[4].fmt(t.proe)} · ${dec(t.secPerPlay)} s/play`;
    return `<tr data-team="${esc(t.team)}"><td class="rank-cell">${i + 1}</td>
      <td class="player"><button type="button" class="pname row-title" data-team="${esc(t.team)}">${esc(t.team)}</button>
        <span class="row-meta"><span class="meta-sm">${esc(meta)}</span><span class="meta-lg">${t.games} G · see players</span></span></td>
      ${TEAM_COLS.map((c) => `<td class="${c.k === k ? "key" : ""}">${c.get(t) == null ? "—" : c.fmt(c.get(t))}</td>`).join("")}
      ${keyCell(col.get(t) == null ? "—" : col.fmt(col.get(t)), col.short)}</tr>`;
  }).join("");
  return `<p class="quiet lead-note">Offensive environment. Pass rate, PROE and pace use neutral situations (win probability 20–80%, quarters 1–3). Choose a team to see its players.</p>
    <div class="glass panel"><table class="tbl"><caption class="sr-only">Team offensive environments</caption>
    <thead><tr><th scope="col"><span class="sr-only">Rank</span></th><th scope="col">Offense</th>${TEAM_COLS.map((c) => headCell(c, "teams")).join("")}<th class="cell-key"></th></tr></thead>
    <tbody>${rows}</tbody></table>${list.length ? "" : empty("No team matches.")}</div>`;
}

/* ---------- defenses ---------- */
const defEase = (d) => (state.pos === "ALL" ? POSS.reduce((s, x) => s + (d.matchupEase || d.ease)[x], 0) / 4 : (d.matchupEase || d.ease)[state.pos]);
function renderDefenses() {
  const [k, dir] = state.sort.defenses;
  const q = state.q.toLowerCase();
  const getter = (d, key) => (key === "ease" ? defEase(d) : d[key]);
  const list = sortBy(snap.defenses.filter((d) => !q || d.team.toLowerCase().includes(q)), [k, dir], getter);
  const arrow = (on) => (on ? `<span class="arrow" aria-hidden="true">${dir < 0 ? "▼" : "▲"}</span>` : "");
  const posHead = POSS.map((x) => {
    const on = k === "ease" && state.pos === x;
    return `<th scope="col"${on ? ` aria-sort="${dir < 0 ? "descending" : "ascending"}"` : ""} title="Blended matchup ease vs ${x}"><button type="button" data-defpos="${x}">vs ${x}${arrow(on)}</button></th>`;
  }).join("");
  const epaHead = [["epaPass", "EPA/db allowed"], ["epaRush", "EPA/rush allowed"]].map(([key, label]) => {
    const on = k === key;
    return `<th scope="col"${on ? ` aria-sort="${dir < 0 ? "descending" : "ascending"}"` : ""} title="${label}, higher is easier"><button type="button" data-sort="${key}">${label.replace(" allowed", "")}${arrow(on)}</button></th>`;
  }).join("");
  const rows = list.map((d, i) => {
    const me = d.matchupEase || d.ease;
    const e = Math.round(defEase(d));
    const meta = state.pos === "ALL" ? POSS.map((x) => `${x} ${Math.round(me[x])}`).join(" · ")
      : `${dec(d.allowedPpg[state.pos])} pts/g · EPA/db ${epa(d.epaPass)}`;
    const kv = k === "ease" ? e : epa(d[k]);
    const kw = k === "ease" ? easeWord(e) : k === "epaPass" ? "EPA/db" : "EPA/rush";
    return `<tr class="static"><td class="rank-cell">${i + 1}</td>
      <td class="player"><span class="row-title">${esc(d.team)}</span><span class="row-meta"><span class="meta-sm">${esc(meta)}</span><span class="meta-lg">Overall ${Math.round(POSS.reduce((s, x) => s + me[x], 0) / 4)}</span></span></td>
      ${POSS.map((x) => `<td class="ease-cell${state.pos === x ? " key" : ""}">${Math.round(me[x])} <span class="opp">${dec(d.allowedPpg[x])} pts</span>${bar(me[x])}</td>`).join("")}
      <td>${epa(d.epaPass)}</td><td>${epa(d.epaRush)}</td>
      ${keyCell(kv, kw)}</tr>`;
  }).join("");
  return `<p class="quiet lead-note">Matchup ease 0–100 blends fantasy points allowed to the position with EPA allowed per dropback and per rush. Higher is softer.</p>
    <div class="glass panel"><table class="tbl"><caption class="sr-only">Defense matchup ease by position</caption>
    <thead><tr><th scope="col"><span class="sr-only">Rank</span></th><th scope="col">Defense</th>${posHead}${epaHead}<th class="cell-key"></th></tr></thead>
    <tbody>${rows}</tbody></table>${list.length ? "" : empty("No team matches.")}</div>`;
}

/* ---------- render + controls ---------- */
const panel = $("#panel");
const sortSel = $("#sort");

function sortOptions() {
  if (state.view === "players") return lensCols(state.lens, state.pos);
  if (state.view === "playoffs") return PLAYOFF;
  if (state.view === "teams") return TEAM_COLS;
  if (state.view === "defenses") return [{ k: "ease", short: "Matchup ease" }, { k: "epaPass", short: "EPA/db allowed" }, { k: "epaRush", short: "EPA/rush allowed" }];
  return null;
}
function fillSortSelect() {
  const cols = sortOptions();
  sortSel.hidden = !cols;
  if (!cols) return;
  const [k, dir] = state.sort[sortKey()];
  sortSel.innerHTML = cols.map((c) => `<option value="${c.k}"${c.k === k ? " selected" : ""}>Sort: ${esc(c.short)}${c.k === k && dir > 0 ? " (low first)" : ""}</option>`).join("");
}

function render() {
  if (!snap) return;
  panel.innerHTML = { players: renderPlayers, risers: renderRisers, playoffs: renderPlayoffs, teams: renderTeams, defenses: renderDefenses }[state.view]();
  panel.setAttribute("aria-labelledby", "tab-" + state.view);
  wireCheckout(panel);
  fillSortSelect();
  $("#lens").hidden = state.view !== "players";
  $("#chips").hidden = state.view === "teams";
  $("#search").placeholder = state.view === "teams" || state.view === "defenses" ? "Search team" : "Search player or team";
}

function setSeg(seg, id) {
  seg.querySelectorAll("[role=tab]").forEach((b) => { const on = b.id === id; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  moveThumb(seg);
}
function setView(v, focus = false) {
  state.view = v; state.limit = PAGE;
  setSeg($("#views"), "tab-" + v);
  if (focus) $("#tab-" + v).focus();
  $("#view-title").textContent = TITLES[v];
  $(".compact-title").textContent = TITLES[v];
  history.replaceState(null, "", location.pathname + location.search + (v === "players" ? "" : "#" + v));
  render();
  moveThumb($("#lens .seg"));
}
function setLens(l, focus = false) {
  state.lens = l; state.limit = PAGE;
  setSeg($("#lens .seg"), "lens-" + l);
  if (focus) $("#lens-" + l).focus();
  render();
}

function moveThumb(seg) {
  if (!seg || !seg.offsetParent) return;
  const thumb = $(".thumb", seg), on = $("[aria-selected=true]", seg);
  if (!on) return;
  const first = !thumb.dataset.ready;
  if (first) thumb.style.transition = "none";
  thumb.style.width = on.offsetWidth + "px";
  thumb.style.transform = `translateX(${on.offsetLeft}px)`;
  if (first) requestAnimationFrame(() => requestAnimationFrame(() => { thumb.style.transition = ""; thumb.dataset.ready = "1"; }));
}
const moveAll = () => document.querySelectorAll(".seg").forEach(moveThumb);

function segKeys(seg, list, cur, set) {
  seg.addEventListener("keydown", (e) => {
    const i = list.indexOf(cur());
    const n = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: list.length - 1 - i }[e.key];
    if (n === undefined) return;
    e.preventDefault();
    set(list[(i + n + list.length) % list.length], true);
  });
}
$("#views").addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) setView(b.id.slice(4)); });
segKeys($("#views"), VIEWS, () => state.view, setView);
const LENS_KEYS = Object.keys(LENSES);
$("#lens .seg").addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) setLens(b.id.slice(5)); });
segKeys($("#lens .seg"), LENS_KEYS, () => state.lens, setLens);
window.addEventListener("resize", moveAll);
document.fonts?.ready.then(moveAll);

function setPos(pos) {
  state.pos = pos; state.limit = PAGE;
  document.querySelectorAll("#chips [data-pos]").forEach((c) => c.setAttribute("aria-pressed", c.dataset.pos === pos));
}
$("#chips").addEventListener("click", (e) => { const b = e.target.closest("[data-pos]"); if (b) { setPos(b.dataset.pos); render(); } });
let qT;
$("#search").addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { state.q = e.target.value.trim(); state.limit = PAGE; render(); }, 120); });
sortSel.addEventListener("change", () => {
  const key = sortKey();
  const dir = state.view === "teams" ? (TEAM_COLS.find((c) => c.k === sortSel.value)?.dir < 0 ? 1 : -1) : -1;
  state.sort[key] = [sortSel.value, dir]; render();
});

panel.addEventListener("click", (e) => {
  const s = e.target.closest("[data-sort]");
  if (s) {
    const key = sortKey(), cur = state.sort[key];
    const lowFirst = state.view === "teams" && TEAM_COLS.find((c) => c.k === s.dataset.sort)?.dir < 0;
    state.sort[key] = [s.dataset.sort, cur[0] === s.dataset.sort ? -cur[1] : lowFirst ? 1 : -1];
    render();
    panel.querySelector(`[data-sort="${s.dataset.sort}"]`)?.focus();
    return;
  }
  const d = e.target.closest("[data-defpos]");
  if (d) {
    const same = state.pos === d.dataset.defpos && state.sort.defenses[0] === "ease";
    state.sort.defenses = ["ease", same ? -state.sort.defenses[1] : -1];
    setPos(d.dataset.defpos);
    render();
    panel.querySelector(`[data-defpos="${state.pos}"]`)?.focus();
    return;
  }
  if (e.target.closest("[data-more]")) { state.limit += PAGE; render(); return; }
  const team = e.target.closest("[data-team]");
  if (team) {
    state.q = team.dataset.team; $("#search").value = team.dataset.team;
    setPos("ALL"); setView("players");
    return;
  }
  const row = e.target.closest("[data-id]");
  if (row && !e.target.closest("a")) openSheet(row.dataset.id, e.target.closest("button") || row);
});

/* ---------- player card sheet ---------- */
const modal = $("#sheet");
const sheet = $(".sheet", modal);
let lastFocus = null, closeT;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function openSheet(id, from) {
  const p = snap.players.find((x) => x.id === id);
  if (!p) return;
  lastFocus = from;
  $("#sheet-title").textContent = p.name;
  const inj = p.injury?.status ? ` · <span class="inj-word">${esc(p.injury.status)}${p.injury.body ? ` (${esc(p.injury.body)})` : ""}</span>` : "";
  $("#sheet-meta").innerHTML = `${dot(p.pos)}<span>${esc(p.pos)} · ${esc(p.team)} · ${p.games} games${inj}</span>`;
  $(".sheet-body", modal).innerHTML = cardHTML(snap, p, pro);
  $(".sheet-body", modal).scrollTop = 0;
  wireCheckout(modal);
  clearTimeout(closeT);
  modal.classList.add("shown");
  document.documentElement.classList.add("modal-lock");
  document.body.style.overflow = "hidden";
  sheet.style.transform = "";
  void modal.offsetWidth; // commit the start state before animating
  modal.classList.add("open");
  $("#sheet-close").focus({ preventScroll: true });
}
function closeSheet() {
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  sheet.style.transform = "";
  document.documentElement.classList.remove("modal-lock");
  document.body.style.overflow = "";
  closeT = setTimeout(() => modal.classList.remove("shown"), reduced() ? 0 : 240);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
$("#sheet-close").addEventListener("click", closeSheet);
modal.addEventListener("click", (e) => { if (e.target === modal) closeSheet(); });
modal.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { e.preventDefault(); closeSheet(); return; }
  if (e.key !== "Tab") return;
  const f = [...modal.querySelectorAll("a[href], button:not([disabled]), input, [tabindex]:not([tabindex='-1'])")].filter((x) => x.offsetParent);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// Drag the grabber or header down to dismiss (phones).
(() => {
  let y0 = 0, t0 = 0, dy = 0, dragging = false;
  const start = (e) => {
    if (innerWidth >= 760 || e.target.closest("button")) return;
    dragging = true; y0 = e.clientY; t0 = performance.now(); dy = 0;
    sheet.classList.add("dragging");
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!dragging) return;
    dy = e.clientY - y0;
    sheet.style.transform = `translateY(${dy >= 0 ? dy : -Math.sqrt(-dy) * 4}px)`;
  };
  const end = () => {
    if (!dragging) return;
    dragging = false; sheet.classList.remove("dragging");
    if (dy > 120 || dy / Math.max(1, performance.now() - t0) > 0.6) closeSheet();
    else sheet.style.transform = "";
  };
  for (const el of [$(".grabber", modal), $(".sheet-head", modal)]) {
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }
})();

/* ---------- boot ---------- */
async function main() {
  setView(state.view);
  setSeg($("#lens .seg"), "lens-" + state.lens);
  try {
    const r = await loadSnapshot();
    snap = r.data; pro = r.pro;
    $("#season").textContent = snap.season;
    $("#updated").textContent = `Updated through Week ${snap.throughWeek} · generated ${fmtDate(snap.generatedAt)}`;
    $("#tier").textContent = pro ? "Season Pass" : "Free";
    if (r.keyError) { const k = $("#key-error"); k.hidden = false; $("p", k).textContent = r.keyError; }
    render();
    const pid = new URLSearchParams(location.search).get("player");
    if (pid) openSheet(pid, null);
  } catch {
    $("#updated").textContent = "Data is unavailable right now. Try again in a few minutes.";
    panel.innerHTML = `<div class="glass panel">${empty("No data loaded.")}</div>`;
  }
}
main();
