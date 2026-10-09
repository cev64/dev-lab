// Post-deploy check: key pages load, free data is present and fresh-ish, API health responds.
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync(new URL("../config/public.json", import.meta.url), "utf8"));
const site = (process.env.PUBLIC_SITE_URL || cfg.siteUrl || `https://${process.env.CF_PAGES_PROJECT || "fieldwren"}.pages.dev`).replace(/\/$/, "");
const api = (process.env.PUBLIC_API_BASE || cfg.apiBase || "").replace(/\/$/, "");
const fails = [];
async function check(url, test) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url);
      const body = await res.text();
      const err = res.ok ? test?.(body) : `HTTP ${res.status}`;
      if (!err) return console.log(`ok   ${url}`);
      if (i === 2) fails.push(`${url}: ${err}`);
    } catch (e) {
      if (i === 2) fails.push(`${url}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}
await check(`${site}/`, (b) => (b.includes(cfg.brand) ? null : "brand missing"));
await check(`${site}/nfl/`);
await check(`${site}/pro/`);
await check(`${site}/data/nfl-free.json`, (b) => {
  const s = JSON.parse(b);
  if (!Array.isArray(s.players) || s.players.length < 100) return "too few players";
  const ageH = (Date.now() - Date.parse(s.generatedAt)) / 3.6e6;
  return api && ageH > 72 ? `snapshot is ${ageH.toFixed(0)}h old` : null;
});
if (api) await check(`${api}/health`);
if (fails.length) {
  console.error("SMOKE FAILURES:\n" + fails.join("\n"));
  process.exit(1);
}
