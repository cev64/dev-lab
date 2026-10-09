import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { dayOf } from "./lib";

// KPIs for the nightly agent (served at GET /metrics behind METRICS_TOKEN). Aggregates only, no emails.
export const summary = internalQuery({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    const n = Math.min(Math.max(days ?? 7, 1), 60);
    const since = Date.now() - n * 24 * 3600 * 1000;
    const stats = await ctx.db.query("dailyStats").withIndex("by_day", (q) => q.gte("day", dayOf(since))).collect();
    const today = await ctx.db.query("events").withIndex("by_day", (q) => q.eq("day", dayOf(Date.now()))).collect();
    const todayCounts: Record<string, number> = {};
    for (const e of today) todayCounts[e.name] = (todayCounts[e.name] ?? 0) + 1;

    const orders = await ctx.db.query("orders").withIndex("by_createdAt", (q) => q.gte("createdAt", since)).collect();
    const live = orders.filter((o) => !o.testMode);
    const allOrders = await ctx.db.query("orders").collect();
    const subs = await ctx.db.query("subscribers").collect();
    const lic = await ctx.db.query("licenses").collect();
    const snap = await ctx.db.query("snapshots").withIndex("by_sport", (q) => q.eq("sport", "nfl")).order("desc").first();

    const paid = (xs: typeof orders) => xs.filter((o) => o.status === "paid" && !o.testMode);
    return {
      window: { days: n, from: dayOf(since), to: dayOf(Date.now()) },
      traffic: { daily: stats.map((s) => ({ day: s.day, ...s.counts })), today: todayCounts,
        topPaths: stats.at(-1)?.topPaths ?? [], topRefs: stats.at(-1)?.topRefs ?? [], topSources: stats.at(-1)?.topSources ?? [] },
      sales: {
        windowOrders: paid(live).length,
        windowRevenueCents: paid(live).reduce((a, o) => a + o.totalCents, 0),
        refundsInWindow: live.filter((o) => o.status === "refunded").length,
        lifetimeOrders: paid(allOrders).length,
        lifetimeRevenueCents: paid(allOrders).reduce((a, o) => a + o.totalCents, 0),
        testOrders: orders.filter((o) => o.testMode).length,
      },
      list: {
        confirmed: subs.filter((s) => s.status === "confirmed").length,
        pending: subs.filter((s) => s.status === "pending").length,
        unsubscribed: subs.filter((s) => s.status === "unsubscribed").length,
      },
      licenses: { validKeysSeen: lic.filter((l) => l.valid).length, heavyUse: lic.filter((l) => l.uses > 500).length },
      data: snap ? { season: snap.season, throughWeek: snap.throughWeek, generatedAt: snap.generatedAt, players: snap.players } : null,
    };
  },
});
