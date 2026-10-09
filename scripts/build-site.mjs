// Build: copy site/ -> dist/, apply config/public.json (brand, API base, checkout URL),
// pull the latest free snapshot from Convex (falls back to the committed sample), write sitemap.xml.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const src = join(root, "site");
const out = join(root, "dist");
const cfg = JSON.parse(readFileSync(join(root, "config/public.json"), "utf8"));
const apiBase = (process.env.PUBLIC_API_BASE || cfg.apiBase || "").replace(/\/$/, "");
const siteUrl = (process.env.PUBLIC_SITE_URL || cfg.siteUrl || "").replace(/\/$/, "");
const PLACEHOLDER = "Fieldglass";

rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true });

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(out);

// 1. Brand + canonical URLs in text files.
for (const f of files.filter((f) => /\.(html|js|css|json|xml|txt|svg|webmanifest)$/.test(f))) {
  let s = readFileSync(f, "utf8");
  const before = s;
  s = s.split(PLACEHOLDER).join(cfg.brand);
  if (siteUrl) s = s.split("https://example.com").join(siteUrl);
  if (s !== before) writeFileSync(f, s);
}

// 2. Runtime config.
const configJs = join(out, "assets/config.js");
if (existsSync(configJs)) {
  let s = readFileSync(configJs, "utf8");
  s = s.replace(/apiBase:\s*"[^"]*"/, `apiBase: ${JSON.stringify(apiBase)}`)
    .replace(/checkoutUrl:\s*"[^"]*"/, `checkoutUrl: ${JSON.stringify(cfg.checkoutUrl || "")}`)
    .replace(/supportEmail:\s*"[^"]*"/, `supportEmail: ${JSON.stringify(cfg.supportEmail || "")}`);
  writeFileSync(configJs, s);
}

// 3. Free data snapshot.
mkdirSync(join(out, "data"), { recursive: true });
let dataNote = "sample";
if (apiBase) {
  try {
    const res = await fetch(`${apiBase}/nfl/free`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snap = await res.json();
    if (!Array.isArray(snap.players) || snap.players.length < 100) throw new Error("snapshot too small");
    writeFileSync(join(out, "data/nfl-free.json"), JSON.stringify(snap));
    dataNote = `live, through week ${snap.throughWeek}`;
  } catch (e) {
    console.warn(`! could not fetch live snapshot (${e.message}); using sample`);
  }
}
if (dataNote === "sample" && existsSync(join(out, "data/sample-nfl-free.json"))) {
  cpSync(join(out, "data/sample-nfl-free.json"), join(out, "data/nfl-free.json"));
}

// 4. Sitemap (every index.html except error/utility pages).
if (siteUrl) {
  const skip = /^(404|subscribed|unsubscribed|thanks)/;
  const urls = walk(out)
    .filter((f) => f.endsWith("index.html"))
    .map((f) => "/" + relative(out, f).replace(/index\.html$/, ""))
    .filter((p) => !skip.test(p.slice(1)));
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") + "\n</urlset>\n");
}

console.log(`built dist/ (${walk(out).length} files, brand=${cfg.brand}, api=${apiBase || "none"}, data=${dataNote})`);
