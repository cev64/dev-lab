import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { sha256Hex } from "./lib";

const VALID_TTL = 6 * 3600 * 1000; // re-check a good key with Lemon Squeezy every 6h (catches refunds)
const INVALID_TTL = 10 * 60 * 1000; // re-check a bad key after 10 min (buyer may paste before it is issued)

export const cached = internalQuery({
  args: { keyHash: v.string() },
  handler: (ctx, { keyHash }) =>
    ctx.db.query("licenses").withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash)).unique(),
});

export const save = internalMutation({
  args: { keyHash: v.string(), valid: v.boolean(), productId: v.optional(v.string()), reason: v.optional(v.string()) },
  handler: async (ctx, a) => {
    const row = await ctx.db.query("licenses").withIndex("by_keyHash", (q) => q.eq("keyHash", a.keyHash)).unique();
    if (row) await ctx.db.patch(row._id, { ...a, checkedAt: Date.now() });
    else await ctx.db.insert("licenses", { ...a, checkedAt: Date.now(), firstSeenAt: Date.now(), uses: 0 });
  },
});

export const countUse = internalMutation({
  args: { keyHash: v.string() },
  handler: async (ctx, { keyHash }) => {
    const row = await ctx.db.query("licenses").withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash)).unique();
    if (row) await ctx.db.patch(row._id, { uses: row.uses + 1 });
  },
});

// Lemon Squeezy's license API needs no API key: POST license_key, get validity + store/product ids.
// LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_PRODUCT_IDS (comma list) pin keys to our products.
export const check = internalAction({
  args: { key: v.string() },
  handler: async (ctx, { key }): Promise<{ valid: boolean; reason?: string }> => {
    const keyHash = await sha256Hex("lic:" + key);
    const hit = await ctx.runQuery(internal.licenses.cached, { keyHash });
    const now = Date.now();
    if (hit && now - hit.checkedAt < (hit.valid ? VALID_TTL : INVALID_TTL)) {
      if (hit.valid) await ctx.runMutation(internal.licenses.countUse, { keyHash });
      return { valid: hit.valid, reason: hit.reason };
    }
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const productIds = (process.env.LEMONSQUEEZY_PRODUCT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const base = process.env.LEMONSQUEEZY_API_BASE ?? "https://api.lemonsqueezy.com";
    if (!storeId || productIds.length === 0) return { valid: false, reason: "not_configured" };

    let res: Response;
    try {
      res = await fetch(`${base}/v1/licenses/validate`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ license_key: key }).toString(),
      });
    } catch {
      // Provider down: honour a previously valid key rather than locking out a buyer.
      return hit?.valid ? { valid: true } : { valid: false, reason: "provider_unreachable" };
    }
    const body: any = await res.json().catch(() => ({}));
    let valid = res.ok && body?.valid === true;
    let reason: string | undefined = valid ? undefined : (body?.error ?? body?.license_key?.status ?? "invalid");
    const productId = body?.meta?.product_id != null ? String(body.meta.product_id) : undefined;
    if (valid && String(body?.meta?.store_id) !== storeId) [valid, reason] = [false, "wrong_store"];
    if (valid && (!productId || !productIds.includes(productId))) [valid, reason] = [false, "wrong_product"];
    await ctx.runMutation(internal.licenses.save, { keyHash, valid, productId, reason });
    if (valid) await ctx.runMutation(internal.licenses.countUse, { keyHash });
    return { valid, reason };
  },
});
