import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Idempotent: Lemon Squeezy retries webhooks, so the provider order id is the key.
export const recordPaid = internalMutation({
  args: {
    providerOrderId: v.string(),
    productName: v.string(),
    totalCents: v.number(),
    currency: v.string(),
    emailHash: v.string(),
    testMode: v.boolean(),
  },
  handler: async (ctx, a) => {
    const dup = await ctx.db
      .query("orders")
      .withIndex("by_providerOrderId", (q) => q.eq("providerOrderId", a.providerOrderId))
      .unique();
    if (dup) return "duplicate";
    await ctx.db.insert("orders", { ...a, status: "paid", createdAt: Date.now() });
    return "recorded";
  },
});

export const recordRefund = internalMutation({
  args: { providerOrderId: v.string() },
  handler: async (ctx, { providerOrderId }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_providerOrderId", (q) => q.eq("providerOrderId", providerOrderId))
      .unique();
    if (!order) return "unknown";
    await ctx.db.patch(order._id, { status: "refunded" });
    return "refunded";
  },
});
