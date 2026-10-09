// Shared runtime: brand text, analytics beacon, data loading, license key, forms, chrome.
export const APP = window.APP || {};
export const API = (APP.apiBase || "").replace(/\/+$/, "");
export const ROOT = new URL("../", import.meta.url); // site root (this file lives in assets/)

const FREE_PATHS = ["data/nfl-free.json", "data/sample-nfl-free.json"];
const KEY_STORE = "seasonPassKey";

/* ---------- storage (every access guarded: private mode can throw) ---------- */
const safe = (area) => ({
  get(k) { try { return window[area].getItem(k); } catch { return null; } },
  set(k, v) { try { window[area].setItem(k, v); } catch { /* full or blocked */ } },
  del(k) { try { window[area].removeItem(k); } catch { /* blocked */ } },
});
export const local = safe("localStorage");
export const session = safe("sessionStorage");
export const getKey = () => local.get(KEY_STORE) || "";
export const setKey = (k) => local.set(KEY_STORE, k);
export const clearKey = () => { const k = getKey(); if (k) session.del("nflPro:" + k); local.del(KEY_STORE); };

/* ---------- analytics: cookieless beacon, skipped without an API ---------- */
export function track(n) {
  if (!API || !navigator.sendBeacon) return;
  let r = "";
  try { r = document.referrer ? new URL(document.referrer).host : ""; } catch { r = ""; }
  const s = new URLSearchParams(location.search).get("utm_source") || "";
  const body = JSON.stringify({ n, p: location.pathname, r, s });
  try { navigator.sendBeacon(API + "/e", new Blob([body], { type: "text/plain" })); } catch { /* ignore */ }
}

/* ---------- data ---------- */
export async function loadSnapshot() {
  const key = getKey();
  let keyError = "";
  if (key && API) {
    const cacheKey = "nflPro:" + key;
    const cached = session.get(cacheKey);
    if (cached) { try { return { data: JSON.parse(cached), pro: true }; } catch { session.del(cacheKey); } }
    try {
      const res = await fetch(`${API}/nfl/pro?key=${encodeURIComponent(key)}`);
      if (res.ok) {
        const data = await res.json();
        session.set(cacheKey, JSON.stringify(data));
        return { data, pro: true };
      }
      const body = await res.json().catch(() => ({}));
      keyError = body.error || "Your license key was not accepted.";
    } catch { keyError = "The Pro feed is unreachable right now. Showing free data."; }
  }
  for (const p of FREE_PATHS) {
    try {
      const res = await fetch(new URL(p, ROOT), { cache: "no-cache" });
      if (res.ok) return { data: await res.json(), pro: false, keyError };
    } catch { /* try next */ }
  }
  throw new Error("No data available");
}

export async function postJSON(path, payload) {
  const res = await fetch(API + path, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ...body };
}

/* ---------- formatting ---------- */
const MINUS = "−";
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const pct = (x) => (x == null ? "—" : Math.round(x * 100) + "%");
export const dec = (x, d = 1) => (x == null ? "—" : Number(x).toFixed(d).replace("-", MINUS));
export const woprFmt = (x) => (x == null ? "—" : Number(x).toFixed(2).replace(/^0/, ""));
export function trendParts(t) {
  const v = Math.round((t || 0) * 100);
  if (v > 0) return { cls: "up", arrow: "▲", text: `+${v}%`, word: "Heating up" };
  if (v < 0) return { cls: "down", arrow: "▼", text: `${MINUS}${Math.abs(v)}%`, word: "Cooling off" };
  return { cls: "", arrow: "", text: "0%", word: "Steady" };
}
export const trendHTML = (t) => { const p = trendParts(t); return `<span class="${p.cls}">${p.arrow ? `<span class="arr" aria-hidden="true">${p.arrow}</span>` : ""}${p.text}</span>`; };
export const easeWord = (e) => (e == null ? "" : e >= 67 ? "Soft" : e >= 34 ? "Fair" : "Tough");
export const oppText = (g) => (g.home ? "vs " : "@ ") + g.opp;
export const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
export const dot = (pos) => `<span class="dot ${esc(pos)}" aria-hidden="true"></span>`;
export const bar = (v, cls = "") => `<span class="bar ${cls}" aria-hidden="true"><i style="width:${Math.max(3, Math.min(100, v || 0))}%"></i></span>`;

/** Opportunity line used for trends: L3 vs season, per position. */
export function oppLine(p) {
  if (p.pos === "QB") return `PPG ${dec(p.ppg)} → ${dec(p.ppgL3)}`;
  if (p.pos === "RB") {
    const s = (p.rushShare || 0) + (p.tgtShare || 0), l = (p.rushShareL3 || 0) + (p.tgtShareL3 || 0);
    return `Opp. share ${pct(s)} → ${pct(l)}`;
  }
  return `WOPR ${woprFmt(p.wopr)} → ${woprFmt(p.woprL3)}`;
}

/** Risers/fallers: the snapshot lists for ALL, recomputed per position with the same sample rules. */
export function trendLists(data, pos = "ALL", n = 10) {
  const byId = new Map(data.players.map((p) => [p.id, p]));
  if (pos === "ALL") {
    return { risers: data.risers.map((id) => byId.get(id)).filter(Boolean).slice(0, n),
             fallers: data.fallers.map((id) => byId.get(id)).filter(Boolean).slice(0, n) };
  }
  const pool = data.players.filter((p) => p.pos === pos && p.games >= 3 && p.ppg >= 5);
  return { risers: pool.filter((p) => p.trend > 0).sort((a, b) => b.trend - a.trend).slice(0, n),
           fallers: pool.filter((p) => p.trend < 0).sort((a, b) => a.trend - b.trend).slice(0, n) };
}

/* ---------- icons (Lucide paths, stroke 1.75) ---------- */
const P = {
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  up: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  down: '<path d="M22 17 13.5 8.5 8.5 13.5 2 7"/><path d="M16 17h6v-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
};
export const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ""}</svg>`;

/* ---------- toast ---------- */
let toastEl, toastT;
export function toast(text) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast"; toastEl.setAttribute("role", "status");
    document.body.append(toastEl);
  }
  toastEl.textContent = text;
  requestAnimationFrame(() => toastEl.classList.add("on"));
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove("on"), 2400);
}

/* ---------- page chrome ---------- */
function fillBrand() {
  document.querySelectorAll("[data-brand]").forEach((el) => { el.textContent = APP.brand || el.textContent; });
  document.querySelectorAll("[data-tagline]").forEach((el) => { if (APP.tagline) el.textContent = APP.tagline; });
  document.querySelectorAll("[data-support]").forEach((el) => {
    if (!APP.supportEmail) return;
    const a = el.querySelector("a") || el;
    a.href = "mailto:" + APP.supportEmail;
    a.textContent = APP.supportEmail;
    el.hidden = false;
  });
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}

function wireTopbar() {
  const bar = document.querySelector(".topbar");
  if (!bar) return;
  const onScroll = () => bar.classList.toggle("condensed", window.scrollY > 4);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const title = document.querySelector(".page-title");
  if (title && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => bar.classList.toggle("titled", !e.isIntersecting && e.boundingClientRect.top < 0),
      { rootMargin: "-56px 0px 0px 0px" }).observe(title);
  }
}

function focusSignup(target) {
  target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  const input = target.querySelector("input[type=email]");
  if (input) setTimeout(() => input.focus({ preventScroll: true }), 400);
}

export function wireCheckout(scope = document) {
  scope.querySelectorAll("[data-checkout]").forEach((a) => {
    if (a.dataset.wired) return;
    a.dataset.wired = "1";
    if (APP.checkoutUrl) {
      a.href = APP.checkoutUrl;
      a.addEventListener("click", () => track("checkout_click"));
    } else {
      a.textContent = "Season Pass opens soon";
      const local = document.getElementById("signup");
      a.href = local ? "#signup" : new URL("#signup", ROOT).href;
      if (local) a.addEventListener("click", (e) => { e.preventDefault(); focusSignup(local); });
    }
  });
}

function wireSubscribe() {
  document.querySelectorAll("form[data-subscribe]").forEach((form) => {
    const msg = form.querySelector(".msg");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      msg.className = "msg";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = "msg err"; msg.textContent = "Enter a valid email address."; return; }
      if (!API) { msg.textContent = "Signups open with the launch. Check back soon."; return; }
      const btn = form.querySelector("button"); btn.disabled = true;
      try {
        const r = await postJSON("/subscribe", { email, source: form.dataset.subscribe });
        if (r.ok) { msg.className = "msg ok"; msg.textContent = "You are on the list. The next email goes out Tuesday."; form.reset(); track("signup"); }
        else { msg.className = "msg err"; msg.textContent = r.error || "That did not work. Try again in a minute."; }
      } catch { msg.className = "msg err"; msg.textContent = "Network error. Try again in a minute."; }
      btn.disabled = false;
    });
  });
}

export function initPage() {
  fillBrand();
  wireTopbar();
  wireCheckout();
  wireSubscribe();
  track("view");
}
