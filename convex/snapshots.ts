import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const latest = internalQuery({
  args: { sport: v.string() },
  handler: (ctx, { sport }) =>
    ctx.db.query("snapshots").withIndex("by_sport", (q) => q.eq("sport", sport)).order("desc").first(),
});

// Keep the newest 3 snapshots per sport; delete older rows and their files.
export const save = internalMutation({
  args: {
    sport: v.string(),
    season: v.number(),
    throughWeek: v.number(),
    generatedAt: v.string(),
    players: v.number(),
    proGz: v.id("_storage"),
    freeGz: v.id("_storage"),
    proCsvPlayers: v.id("_storage"),
    proCsvDefenses: v.id("_storage"),
  },
  handler: async (ctx, a) => {
    await ctx.db.insert("snapshots", a);
    const all = await ctx.db.query("snapshots").withIndex("by_sport", (q) => q.eq("sport", a.sport)).order("desc").collect();
    for (const old of all.slice(3)) {
      for (const id of [old.proGz, old.freeGz, old.proCsvPlayers, old.proCsvDefenses]) await ctx.storage.delete(id);
      await ctx.db.delete(old._id);
    }
  },
});
