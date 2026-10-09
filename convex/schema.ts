import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // One row per nightly build. Files hold gzipped JSON so pro responses stay small.
  snapshots: defineTable({
    sport: v.string(),
    season: v.number(),
    throughWeek: v.number(),
    generatedAt: v.string(),
    players: v.number(),
    proGz: v.id("_storage"),
    freeGz: v.id("_storage"),
    proCsvPlayers: v.id("_storage"),
    proCsvDefenses: v.id("_storage"),
  }).index("by_sport", ["sport"]),

  // Cache of Lemon Squeezy license validations, keyed by a hash of the key (never the raw key).
  licenses: defineTable({
    keyHash: v.string(),
    valid: v.boolean(),
    productId: v.optional(v.string()),
    reason: v.optional(v.string()),
    checkedAt: v.number(),
    firstSeenAt: v.number(),
    uses: v.number(),
  }).index("by_keyHash", ["keyHash"]),

  orders: defineTable({
    providerOrderId: v.string(),
    productName: v.string(),
    totalCents: v.number(),
    currency: v.string(),
    status: v.union(v.literal("paid"), v.literal("refunded")),
    emailHash: v.string(),
    testMode: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_providerOrderId", ["providerOrderId"])
    .index("by_createdAt", ["createdAt"]),

  subscribers: defineTable({
    email: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("unsubscribed")),
    confirmToken: v.string(),
    unsubToken: v.string(),
    source: v.optional(v.string()),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_confirmToken", ["confirmToken"])
    .index("by_unsubToken", ["unsubToken"]),

  // Cookieless analytics: no IP, no visitor id. Rolled up nightly into dailyStats, then pruned.
  events: defineTable({
    day: v.string(),
    name: v.string(),
    path: v.string(),
    ref: v.optional(v.string()),
    src: v.optional(v.string()),
  }).index("by_day", ["day"]),

  dailyStats: defineTable({
    day: v.string(),
    counts: v.record(v.string(), v.number()),
    topPaths: v.array(v.object({ key: v.string(), n: v.number() })),
    topRefs: v.array(v.object({ key: v.string(), n: v.number() })),
    topSources: v.array(v.object({ key: v.string(), n: v.number() })),
  }).index("by_day", ["day"]),

  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),
});
