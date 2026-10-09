// Tests for the daily post generator (scripts/make-posts.ts).
// Run: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNflSnapshot, toFree } from "../convex/model/nfl.ts";
import { loadFixtureInputs } from "../scripts/make-sample.ts";
import { makePosts, MAX_LEN, BANNED, CREDIT } from "../scripts/make-posts.ts";

const snap = buildNflSnapshot(loadFixtureInputs(), { season: 2026, generatedAt: "2026-10-10T00:00:00.000Z" });

// 30 consecutive days covers every template pair and position rotation several times.
const dates = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10));
const days = dates.map((d) => makePosts(snap, d));
const allPosts = days.flatMap((d) => d.posts);

test("exactly 2 posts per day with the queue shape", () => {
  for (const d of days) {
    assert.equal(d.posts.length, 2);
    for (const p of d.posts) {
      assert.deepEqual(Object.keys(p).sort(), ["id", "platform_text", "text"]);
      assert.ok(p.id.startsWith(d.date + "-"));
      assert.ok(p.text.length > 40);
    }
    assert.notEqual(d.posts[0].id, d.posts[1].id);
  }
});

test("every post fits in 270 characters", () => {
  assert.equal(MAX_LEN, 270);
  for (const p of allPosts) {
    assert.ok(p.text.length <= 270, `${p.id}: ${p.text.length}`);
    assert.ok(p.platform_text.length <= 270, `${p.id}: ${p.platform_text.length}`);
  }
});

test("no banned words, URLs, exclamation marks or emoji", () => {
  const words = ["bet", "betting", "odds", "picks", "lock", "parlay", "sportsbook", "wager", "guaranteed"];
  for (const w of words) assert.ok(BANNED.test(`x ${w.toUpperCase()} y`), w);
  for (const p of allPosts) {
    for (const t of [p.text, p.platform_text]) {
      assert.ok(!BANNED.test(t), `${p.id}: ${t}`);
      assert.ok(!t.includes("!"), p.id);
      assert.ok(!/https?:|www\.|\.(com|io|app|net)\b/i.test(t), p.id);
      assert.ok(!/\p{Extended_Pictographic}/u.test(t), p.id);
    }
  }
});

test("deterministic by date, and topics rotate across days", () => {
  for (const d of dates.slice(0, 10)) assert.deepEqual(makePosts(snap, d), makePosts(snap, d));
  assert.notDeepEqual(days[0].posts.map((p) => p.id.slice(11)), days[1].posts.map((p) => p.id.slice(11)));
  const templates = new Set(allPosts.map((p) => p.id.slice(11)));
  assert.deepEqual([...templates].sort(), ["fpoe-outliers", "playoff-ease", "proe-teams", "risers", "xfp-leaders"]);
});

test("credit line is appended when it fits, and posts cite real snapshot numbers", () => {
  for (const p of allPosts) {
    if (p.text.length + 2 + CREDIT.length <= 270) assert.equal(p.platform_text, `${p.text}\n\n${CREDIT}`);
    else assert.equal(p.platform_text, p.text);
    assert.ok(p.text.includes(`Week`), p.id);
  }
  const top = snap.players.filter((p) => p.pos === "RB" && p.games >= 3).sort((a, b) => b.xfp! - a.xfp!)[0];
  const rbXfp = allPosts.find((p) => p.id.endsWith("xfp-leaders") && p.text.includes("RBs"));
  assert.ok(rbXfp && rbXfp.text.includes(`${top.name} ${top.team} ${top.xfp!.toFixed(1)}`));
});

test("bad dates are rejected; a free snapshot still yields 2 posts", () => {
  assert.throws(() => makePosts(snap, "2026-13-40"));
  assert.throws(() => makePosts(snap, "Oct 10"));
  assert.equal(makePosts(toFree(snap), "2026-10-10").posts.length, 2);
});
