import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { randomToken } from "./lib";

export const add = internalMutation({
  args: { email: v.string(), source: v.optional(v.string()) },
  handler: async (ctx, { email, source }) => {
    const existing = await ctx.db.query("subscribers").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (existing && existing.status === "confirmed") return "already";
    const confirmToken = randomToken();
    if (existing) {
      await ctx.db.patch(existing._id, { status: "pending", confirmToken });
    } else {
      await ctx.db.insert("subscribers", {
        email,
        source,
        status: "pending",
        confirmToken,
        unsubToken: randomToken(),
        createdAt: Date.now(),
      });
    }
    await ctx.scheduler.runAfter(0, internal.email.sendConfirm, { email, confirmToken });
    return "pending";
  },
});

export const confirm = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db.query("subscribers").withIndex("by_confirmToken", (q) => q.eq("confirmToken", token)).unique();
    if (!s) return false;
    if (s.status !== "confirmed") await ctx.db.patch(s._id, { status: "confirmed", confirmedAt: Date.now() });
    return true;
  },
});

export const unsubscribe = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db.query("subscribers").withIndex("by_unsubToken", (q) => q.eq("unsubToken", token)).unique();
    if (!s) return false;
    await ctx.db.patch(s._id, { status: "unsubscribed" });
    return true;
  },
});
