import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { dayOf } from "./lib";

const NAMES = new Set(["view", "checkout_click", "unlock_ok", "unlock_fail", "signup", "feed_copy"]);

export const log = internalMutation({
  args: { name: v.string(), path: v.string(), ref: v.optional(v.string()), src: v.optional(v.string()) },
  handler: async (ctx, a) => {
    if (!NAMES.has(a.name)) return;
    await ctx.db.insert("events", { ...a, day: dayOf(Date.now()) });
  },
});

function top(m: Map<string, number>, n = 10) {
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, count]) => ({ key, n: count }));
}

// Roll one day of raw events into dailyStats (idempotent: overwrites that day's row).
export const rollup = internalMutation({
  args: { day: v.optional(v.string()) },
  handler: async (ctx, { day }) => {
    const d = day ?? dayOf(Date.now() - 24 * 3600 * 1000);
    const rows = await ctx.db.query("events").withIndex("by_day", (q) => q.eq("day", d)).collect();
    const counts: Record<string, number> = {};
    const paths = new Map<string, number>(), refs = new Map<string, number>(), srcs = new Map<string, number>();
    for (const e of rows) {
      counts[e.name] = (counts[e.name] ?? 0) + 1;
      if (e.name !== "view") continue;
      paths.set(e.path, (paths.get(e.path) ?? 0) + 1);
      if (e.ref) refs.set(e.ref, (refs.get(e.ref) ?? 0) + 1);
      if (e.src) srcs.set(e.src, (srcs.get(e.src) ?? 0) + 1);
    }
    const doc = { day: d, counts, topPaths: top(paths), topRefs: top(refs), topSources: top(srcs) };
    const existing = await ctx.db.query("dailyStats").withIndex("by_day", (q) => q.eq("day", d)).unique();
    if (existing) await ctx.db.replace(existing._id, doc);
    else await ctx.db.insert("dailyStats", doc);
    return doc;
  },
});

// Raw events older than 14 days are deleted (stats are already rolled up).
export const prune = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = dayOf(Date.now() - 14 * 24 * 3600 * 1000);
    const old = await ctx.db.query("events").withIndex("by_day", (q) => q.lt("day", cutoff)).take(2000);
    for (const e of old) await ctx.db.delete(e._id);
    return old.length;
  },
});
