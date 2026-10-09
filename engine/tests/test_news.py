import unittest

from clipper.news import merge_stories, parse_news_feed, similar

RSS = b"""<?xml version="1.0"?><rss version="2.0"><channel><title>T</title>
<item><title>OpenAI launches new reasoning model</title><link>https://ex.com/a</link>
<pubDate>Thu, 08 Oct 2026 12:00:00 GMT</pubDate><description>&lt;p&gt;Big news about AI.&lt;/p&gt;</description></item>
</channel></rss>"""

ATOM = b"""<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>A</title>
<entry><title>Anthropic publishes Claude research</title><link rel="alternate" href="https://ex.com/b"/>
<updated>2026-10-08T10:00:00Z</updated><summary>Interpretability results.</summary></entry></feed>"""


class NewsTest(unittest.TestCase):
    def test_rss_and_atom(self):
        r = parse_news_feed(RSS)
        self.assertEqual(r[0]["title"], "OpenAI launches new reasoning model")
        self.assertEqual(r[0]["url"], "https://ex.com/a")
        self.assertIsNotNone(r[0]["published"])
        self.assertIn("Big news", r[0]["summary"])
        a = parse_news_feed(ATOM)
        self.assertEqual(a[0]["url"], "https://ex.com/b")
        self.assertIsNotNone(a[0]["published"])

    def test_merge_near_duplicates(self):
        items = [
            {"title": "OpenAI launches new reasoning model o5", "summary": "", "score": 2.0, "publisher": "Verge",
             "url": "u1", "published": 1},
            {"title": "OpenAI's new reasoning model o5 launches today", "summary": "", "score": 1.5,
             "publisher": "TechCrunch", "url": "u2", "published": 1},
            {"title": "Nvidia earnings beat estimates", "summary": "", "score": 1.0, "publisher": "Reuters",
             "url": "u3", "published": 1},
        ]
        stories = merge_stories(items)
        self.assertEqual(len(stories), 2)
        self.assertEqual(len(stories[0]["sources"]), 2)
        self.assertGreater(similar(items[0]["title"], items[1]["title"]), 0.6)


if __name__ == "__main__":
    unittest.main()
