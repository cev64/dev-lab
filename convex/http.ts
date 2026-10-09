import { httpRouter } from "convex/server";
import { httpAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { clip, dayOf, EMAIL_RE, hmacSha256Hex, safeEqual, sha256Hex } from "./lib";

const http = httpRouter();

// ---------- helpers ----------
function cors(req: Request): Record<string, string> {
  const allowed = (process.env.SITE_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.get("Origin") ?? "";
  const allow = allowed.length === 0 ? "*" : allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
function json(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors(req), ...extra },
  });
}
function redirect(to: string) {
  return new Response(null, { status: 302, headers: { Location: to } });
}
function siteUrl(path: string) {
  return (process.env.SITE_URL ?? "").replace(/\/$/, "") + path;
}
async function limited(ctx: ActionCtx, req: Request, bucket: string, limit: number, windowMs: number) {
  const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anon").split(",")[0].trim();
  const key = bucket + ":" + (await sha256Hex(ip + dayOf(Date.now()))).slice(0, 20); // daily-salted, never stored raw
  return !(await ctx.runMutation(internal.rateLimit.hit, { key, limit, windowMs }));
}
function bearerOk(req: Request, secret: string | undefined) {
  const got = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  return !!secret && secret.length >= 24 && safeEqual(got, secret);
}
const MIN = 60 * 1000;

http.route({ pathPrefix: "/", method: "OPTIONS", handler: httpAction(async (_ctx, req) => new Response(null, { status: 204, headers: cors(req) })) });

http.route({ path: "/health", method: "GET", handler: httpAction(async (_ctx, req) => json(req, { ok: true })) });

// ---------- analytics beacon (text/plain body so sendBeacon skips CORS preflight) ----------
http.route({
  path: "/e",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (await limited(ctx, req, "e", 120, 10 * MIN)) return new Response(null, { status: 204, headers: cors(req) });
    let b: any = {};
    try { b = JSON.parse((await req.text()).slice(0, 2000)); } catch { /* ignore */ }
    const name = clip(b.n, 32), path = clip(b.p, 200);
    if (name && path) {
      await ctx.runMutation(internal.events.log, {
        name, path: path.split("?")[0], ref: clip(b.r, 100)?.replace(/^www\./, ""), src: clip(b.s, 50)?.toLowerCase(),
      });
    }
    return new Response(null, { status: 204, headers: cors(req) });
  }),
});

// ---------- email list ----------
http.route({
  path: "/subscribe",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (await limited(ctx, req, "sub", 5, 60 * MIN)) return json(req, { ok: false, error: "rate_limited" }, 429);
    let b: any = {};
    try { b = await req.json(); } catch { /* ignore */ }
    const email = clip(b.email, 254)?.toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return json(req, { ok: false, error: "invalid_email" }, 400);
    await ctx.runMutation(internal.subscribers.add, { email, source: clip(b.source, 40) });
    return json(req, { ok: true });
  }),
});
http.route({
  path: "/confirm",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const t = new URL(req.url).searchParams.get("t") ?? "";
    const ok = await ctx.runMutation(internal.subscribers.confirm, { token: t });
    return redirect(siteUrl(ok ? "/subscribed/" : "/"));
  }),
});
http.route({
  path: "/unsubscribe",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const t = new URL(req.url).searchParams.get("t") ?? "";
    await ctx.runMutation(internal.subscribers.unsubscribe, { token: t });
    return redirect(siteUrl("/unsubscribed/"));
  }),
});

// ---------- licenses + data ----------
async function licenseOk(ctx: ActionCtx, req: Request, key: string | null): Promise<{ valid: boolean; reason?: string }> {
  if (!key || key.length < 8 || key.length > 100) return { valid: false, reason: "missing_key" };
  if (await limited(ctx, req, "lic", 60, 10 * MIN)) return { valid: false, reason: "rate_limited" };
  return ctx.runAction(internal.licenses.check, { key: key.trim() });
}

http.route({
  path: "/license/activate",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    let b: any = {};
    try { b = await req.json(); } catch { /* ignore */ }
    const r = await licenseOk(ctx, req, clip(b.key, 100) ?? null);
    return r.valid ? json(req, { ok: true, product: "nfl-season-pass" }) : json(req, { ok: false, error: r.reason ?? "invalid" }, 403);
  }),
});

async function serveFile(ctx: ActionCtx, req: Request, id: any, type: string, gz: boolean, cache: string) {
  const blob = await ctx.storage.get(id);
  if (!blob) return json(req, { error: "missing_file" }, 503);
  const headers: Record<string, string> = { "Content-Type": type, "Cache-Control": cache, ...cors(req) };
  if (gz) headers["Content-Encoding"] = "gzip";
  return new Response(blob, { status: 200, headers });
}

// Free snapshot: fetched by the site build (Cloudflare serves it to visitors), so it is rarely hit directly.
http.route({
  path: "/nfl/free",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const snap: Doc<"snapshots"> | null = await ctx.runQuery(internal.snapshots.latest, { sport: "nfl" });
    if (!snap) return json(req, { error: "no_snapshot" }, 503);
    return serveFile(ctx, req, snap.freeGz, "application/json", true, "public, max-age=900");
  }),
});

http.route({
  path: "/nfl/pro",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const r = await licenseOk(ctx, req, new URL(req.url).searchParams.get("key"));
    if (!r.valid) return json(req, { error: r.reason ?? "invalid" }, 403);
    const snap: Doc<"snapshots"> | null = await ctx.runQuery(internal.snapshots.latest, { sport: "nfl" });
    if (!snap) return json(req, { error: "no_snapshot" }, 503);
    return serveFile(ctx, req, snap.proGz, "application/json", true, "private, max-age=1800");
  }),
});

// Google Sheets IMPORTDATA / Excel Power Query feed.
http.route({
  path: "/nfl.csv",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const u = new URL(req.url);
    const r = await licenseOk(ctx, req, u.searchParams.get("key"));
    if (!r.valid) return new Response(`error,${r.reason ?? "invalid"}\n`, { status: 403, headers: { "Content-Type": "text/csv", ...cors(req) } });
    const snap: Doc<"snapshots"> | null = await ctx.runQuery(internal.snapshots.latest, { sport: "nfl" });
    if (!snap) return json(req, { error: "no_snapshot" }, 503);
    const id = u.searchParams.get("table") === "defenses" ? snap.proCsvDefenses : snap.proCsvPlayers;
    return serveFile(ctx, req, id, "text/csv; charset=utf-8", false, "private, max-age=1800");
  }),
});

// ---------- Lemon Squeezy webhook (orders, for metrics) ----------
http.route({
  path: "/webhooks/lemonsqueezy",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const raw = await req.text();
    if (!secret) return new Response("not configured", { status: 503 });
    const expected = await hmacSha256Hex(secret, raw);
    if (!safeEqual(expected, req.headers.get("X-Signature") ?? "")) return new Response("bad signature", { status: 401 });
    const body = JSON.parse(raw);
    const event = body?.meta?.event_name;
    const a = body?.data?.attributes ?? {};
    const providerOrderId = String(body?.data?.id ?? a.identifier ?? "");
    if (!providerOrderId) return new Response("no order id", { status: 400 });
    if (event === "order_created" && a.status === "paid") {
      await ctx.runMutation(internal.orders.recordPaid, {
        providerOrderId,
        productName: String(a.first_order_item?.product_name ?? "unknown").slice(0, 100),
        totalCents: Number(a.total ?? 0),
        currency: String(a.currency ?? "USD"),
        emailHash: (await sha256Hex("email:" + String(a.user_email ?? "").toLowerCase())).slice(0, 32),
        testMode: !!a.test_mode,
      });
    } else if (event === "order_refunded") {
      await ctx.runMutation(internal.orders.recordRefund, { providerOrderId });
    }
    return new Response("ok", { status: 200 });
  }),
});

// ---------- operator endpoints (nightly agent) ----------
http.route({
  path: "/ops/metrics",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    if (!bearerOk(req, process.env.METRICS_TOKEN)) return json(req, { error: "unauthorized" }, 401);
    const days = Number(new URL(req.url).searchParams.get("days") ?? 7);
    return json(req, await ctx.runQuery(internal.metrics.summary, { days }));
  }),
});

http.route({
  path: "/admin/refresh",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!bearerOk(req, process.env.ADMIN_TOKEN)) return json(req, { error: "unauthorized" }, 401);
    try {
      return json(req, { ok: true, ...(await ctx.runAction(internal.refresh.nfl, {})) });
    } catch (e: any) {
      return json(req, { ok: false, error: String(e?.message ?? e) }, 500);
    }
  }),
});

export default http;
