import unittest

import _path  # noqa: F401
from _path import FIXTURES

from clipper.discover import episode_id, rank_items
from clipper.feeds import clean_description, parse_feed
from clipper.transcribe import parse_timed_text


class FeedParsing(unittest.TestCase):
    def setUp(self):
        self.show, self.items = parse_feed((FIXTURES / "feed.xml").read_bytes())

    def test_channel_and_items(self):
        self.assertEqual(self.show, "Test Show & Friends")
        self.assertEqual(len(self.items), 3)  # the item without an enclosure is dropped
        ep = self.items[0]
        self.assertTrue(ep.title.startswith("#452 – Dario Amodei"))
        self.assertEqual(ep.audio_url, "https://cdn.example.com/452.mp3")
        self.assertEqual(ep.duration, 2 * 3600 + 41 * 60 + 10)
        self.assertEqual(ep.episode_number, 452)
        self.assertEqual(len(ep.transcripts), 2)
        self.assertEqual(self.items[1].duration, 3600)
        self.assertEqual(self.items[2].episode_type, "trailer")

    def test_content_encoded_preferred_and_sponsors_removed(self):
        desc = clean_description(self.items[1].description)
        self.assertIn("Tomatoes", desc)
        self.assertNotIn("AI", desc)
        self.assertNotIn("http", desc)

    def test_episode_ids(self):
        self.assertEqual(episode_id("lex", self.items[0]), "lex-452")
        self.assertEqual(episode_id("lex", self.items[1]), "lex-20261004")

    def test_rank_filters_and_prefers_timed_transcript(self):
        now = self.items[0].published + 86400
        ranked = rank_items({"slug": "t", "name": "Test", "priority": 1}, self.items, now, days=45)
        self.assertEqual([e["eid"] for e in ranked], ["t-452"])  # garden: sponsor-only AI; trailer: skipped
        self.assertEqual(ranked[0]["transcriptType"], "text/vtt")

    def test_vtt_parse(self):
        vtt = "WEBVTT\n\n1\n00:00:06.730 --> 00:00:11.654\nHello there, AI world.\n\n2\n00:01:00.000 --> 00:01:02.000 align:start\n<v Bob>Yes.\n"
        segs = parse_timed_text(vtt)
        self.assertEqual(len(segs), 2)
        self.assertAlmostEqual(segs[0]["s"], 6.73)
        self.assertEqual([w["w"] for w in segs[0]["words"]], ["Hello", "there,", "AI", "world."])
        self.assertAlmostEqual(segs[0]["words"][-1]["e"], 11.65, places=2)
        self.assertEqual(segs[1]["text"], "Yes.")


if __name__ == "__main__":
    unittest.main()
