import json
import tempfile
import unittest
from pathlib import Path

import _path  # noqa: F401

from clipper import ledger
from clipper.common import Paths
from clipper.package import package


class Overlap(unittest.TestCase):
    def test_ranges(self):
        self.assertTrue(ledger.ranges_overlap(0, 60, 59, 120))
        self.assertFalse(ledger.ranges_overlap(0, 60, 60, 120))  # touching is fine without margin
        self.assertTrue(ledger.ranges_overlap(0, 60, 63, 120, margin=5))
        self.assertFalse(ledger.ranges_overlap(0, 60, 66, 120, margin=5))
        self.assertTrue(ledger.ranges_overlap(10, 20, 0, 100))  # containment

    def test_find_and_add(self):
        data = ledger.empty()
        ep = {"show": "S", "title": "T", "link": "L"}
        ledger.add_clip(data, eid="x-1", episode=ep, clip={"id": "c1", "date": "2026-10-09", "start": 100.0, "end": 165.0})
        self.assertTrue(ledger.has_episode(data, "x-1"))
        self.assertIsNotNone(ledger.find_overlap(data, "x-1", 160.0, 230.0))
        self.assertIsNotNone(ledger.find_overlap(data, "x-1", 168.0, 230.0))  # within default 5 s margin
        self.assertIsNone(ledger.find_overlap(data, "x-1", 171.0, 240.0))
        self.assertIsNone(ledger.find_overlap(data, "other", 100.0, 165.0))
        with self.assertRaises(ValueError):
            ledger.add_clip(data, eid="x-1", episode=ep, clip={"id": "c2", "date": "d", "start": 150.0, "end": 210.0})
        ledger.add_clip(data, eid="x-1", episode=ep, clip={"id": "c3", "date": "d", "start": 300.0, "end": 365.0})
        self.assertEqual(len(data["episodes"]["x-1"]["clips"]), 2)
        self.assertEqual([c["id"] for c in data["clips"]], ["c1", "c3"])


class Package(unittest.TestCase):
    def test_delivery_and_ledger(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "config").mkdir()
            (root / "config" / "sources.json").write_text(json.dumps({"sources": [
                {"slug": "lex", "name": "Lex Fridman Podcast", "creditFormat": "Clip from {show} {episode}", "hosts": "Lex"}]}))
            paths = Paths(root)
            video = root / "out" / "2026-10-09" / "c1.mp4"
            clip = {"id": "c1", "duration": 66.4, "hook": "Hook text", "source": {"start": 3725.0, "end": 3791.4}}
            sel = {"title": "Title", "caption": "Cap", "hashtags": ["AI", "#AGI news"]}
            meta = {"eid": "lex-452", "show": "Lex Fridman Podcast", "showSlug": "lex", "title": "#452 - Dario Amodei",
                    "link": "https://lexfridman.com/dario"}
            package(paths, date="2026-10-09", clip=clip, sel=sel, meta=meta, video=video)
            package(paths, date="2026-10-09", clip=clip, sel=sel, meta=meta, video=video)  # idempotent
            md = (root / "deliveries" / "2026-10-09.md").read_text()
            self.assertEqual(md.count("`c1`"), 1)
            self.assertIn("Clip from Lex Fridman Podcast #452 - Dario Amodei", md)
            self.assertIn("01:02:05-01:03:11", md)
            self.assertIn("#AI #AGInews", md)
            self.assertIn("https://lexfridman.com/dario", md)
            self.assertIn("out/2026-10-09/c1.mp4", md)
            led = json.loads((root / "data" / "ledger.json").read_text())
            self.assertEqual(led["episodes"]["lex-452"]["clips"][0]["start"], 3725.0)
            self.assertEqual(len(led["clips"]), 1)


if __name__ == "__main__":
    unittest.main()
