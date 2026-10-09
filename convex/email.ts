"use node";
// Sends transactional email through Resend when RESEND_API_KEY is set; otherwise logs and
// does nothing, so the list still collects signups before email is configured.
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const sendConfirm = internalAction({
  args: { email: v.string(), confirmToken: v.string() },
  handler: async (_ctx, { email, confirmToken }) => {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const api = process.env.CONVEX_SITE_URL;
    const brand = process.env.BRAND_NAME ?? "our shop";
    if (!key || !from || !api) {
      console.log("email not configured; skipping confirm email");
      return;
    }
    const link = `${api}/confirm?t=${confirmToken}`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email,
        subject: `Confirm your email for ${brand}`,
        text: `Tap to confirm and get new templates and calculators from ${brand}:\n\n${link}\n\nIf you didn't sign up, ignore this email.`,
      }),
    });
    if (!res.ok) console.error("resend failed", res.status, await res.text());
  },
});
