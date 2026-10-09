import unittest

from clipper.explainer import check_repeat, drive_card
from clipper.news import mark_covered

PAST = [{"id": "2026-10-09-explainer-claude-cruelty", "date": "2026-10-09",
         "hook": "Being cruel to an AI is now against the rules", "title": "Anthropic bans abusing Claude",
         "sources": ["https://a.com/policy", "https://v.com/story"]}]


def script(**kw):
    s = {"id": "2026-10-10-explainer-x", "hook": "h", "beats": [{"say": "One.", "visual": {"type": "title"}}],
         "sources": [{"publisher": "A", "title": "t", "url": "https://a.com/policy"},
                     {"publisher": "B", "title": "t", "url": "https://b.com/x"}],
         "post": {"title": "Claude can quit rude chats", "caption": "Line\nSources: A, B. AI narrator.\nWhy?",
                  "hashtags": ["thedailytoken", "ai"]}}
    s.update(kw)
    return s


class RepeatTest(unittest.TestCase):
    def test_news_flags_covered_by_url_or_title(self):
        stories = [{"title": "Unrelated chip news", "sources": [{"url": "https://c.com/1"}]},
                   {"title": "New story", "sources": [{"url": "https://v.com/story"}]},
                   {"title": "Anthropic bans abusing Claude users", "sources": [{"url": "https://d.com/2"}]}]
        out = mark_covered(stories, PAST)
        self.assertNotIn("covered", out[0])
        self.assertEqual(out[1]["covered"]["id"], PAST[0]["id"])
        self.assertEqual(out[2]["covered"]["id"], PAST[0]["id"])

    def test_explainer_refuses_recent_repeat(self):
        with self.assertRaises(SystemExit):
            check_repeat(script(), PAST, "2026-10-10")
        check_repeat(script(followUp=True), PAST, "2026-10-10")  # a real new development may revisit it
        check_repeat(script(), PAST, "2026-10-20")  # outside the 7-day window
        check_repeat(script(id=PAST[0]["id"]), PAST, "2026-10-09")  # re-rendering the same explainer

    def test_drive_card_named_by_topic(self):
        title, text = drive_card(script(), {"duration": 70.2}, "2026-10-10")
        self.assertEqual(title, "2026-10-10 · Claude can quit rude chats")
        self.assertIn("https://b.com/x", text)
        self.assertIn("#thedailytoken", text)
        self.assertIn("videos/2026-10-10", text)


if __name__ == "__main__":
    unittest.main()


class PostKitTest(unittest.TestCase):
    def test_kit_adds_brand_follow_sources_and_caps_tags(self):
        from clipper.explainer import post_kit
        s = script()
        s["post"].update({"tiktok": "Body line.\nWould you?", "pinnedComment": "Yes or no?", "cover": "Cover",
                          "hashtags": ["ai", "#AI", "a", "b", "c", "d"]})
        kit = post_kit(s)
        self.assertTrue(kit["hashtags"].startswith("#thedailytoken #ai"))
        self.assertEqual(len(kit["hashtags"].split()), 5)
        self.assertIn("Follow @thedailytoken", kit["tiktok"])
        self.assertIn("Sources: A, B. AI narrator.", kit["tiktok"])
        self.assertTrue(kit["instagram"].startswith("Body line."))  # falls back to the TikTok body
        self.assertEqual((kit["pinned"], kit["cover"]), ("Yes or no?", "Cover"))

    def test_old_caption_only_scripts_still_work(self):
        from clipper.explainer import post_kit
        kit = post_kit(script())
        self.assertEqual(kit["tiktok"].count("Sources:"), 1)
        self.assertEqual(kit["pinned"], "Why?")
        self.assertEqual(kit["cover"], "h")
