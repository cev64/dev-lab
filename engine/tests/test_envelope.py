import unittest

import numpy as np

import _path  # noqa: F401

from clipper.audio import compute_envelope, rms_frames
from clipper.make import clip_id, coverage_problem, fix_case, theme_seed, tidy_words


class Envelope(unittest.TestCase):
    def test_length_matches_frames(self):
        sr = 16000
        for duration in (58.0, 60.01, 66.4, 70.11, 79.983, 0.5):
            samples = (np.random.default_rng(1).standard_normal(int(duration * sr)) * 0.1).astype(np.float32)
            env = compute_envelope(samples, sr, duration, fps=30)
            self.assertEqual(len(env), round(duration * 30), duration)
            self.assertTrue(all(0.0 <= v <= 1.0 for v in env))

    def test_follows_loudness(self):
        sr = 16000
        quiet = np.zeros(sr, dtype=np.float32)
        loud = (np.sin(np.arange(sr) / sr * 2 * np.pi * 220) * 0.5).astype(np.float32)
        env = compute_envelope(np.concatenate([quiet, loud]), sr, 2.0)
        self.assertLess(max(env[:25]), 0.05)
        self.assertGreater(env[-1], 0.9)

    def test_handles_short_audio(self):
        env = compute_envelope(np.zeros(100, dtype=np.float32), 16000, 1.0)
        self.assertEqual(len(env), 30)

    def test_rms_frames(self):
        x = np.ones(16000, dtype=np.float32)
        self.assertEqual(len(rms_frames(x, 16000, 0.5)), 2)


class ClipHelpers(unittest.TestCase):
    def test_id_and_seed_stable(self):
        cid = clip_id("2026-10-09", "lex-452", {"hook": "h", "topic": "AGI timeline"})
        self.assertEqual(cid, "2026-10-09-lex-452-agi-timeline")
        self.assertEqual(theme_seed(cid), theme_seed(cid))
        self.assertTrue(0 <= theme_seed(cid) < 100000)

    def test_tidy_words_clamps_and_sorts(self):
        segs = [{"words": [{"w": "openai's", "s": -0.05, "e": 0.3}, {"w": "b", "s": 0.2, "e": 0.1}, {"w": "c", "s": 9.0, "e": 11.0}]}]
        out = tidy_words(segs, 10.0)
        self.assertEqual(out[0], {"w": "OpenAI's", "s": 0.0, "e": 0.3})
        self.assertLessEqual(out[1]["s"], out[1]["e"])
        self.assertEqual(out[2]["e"], 10.0)

    def test_fix_case_keeps_punctuation(self):
        self.assertEqual(fix_case('"anthropic,'), '"Anthropic,')
        self.assertEqual(fix_case("random."), "random.")

    def test_coverage(self):
        words = [{"w": "a", "s": 0.1, "e": 0.5}, {"w": "b", "s": 0.6, "e": 30.0}]
        self.assertIsNone(coverage_problem(words, 32.0))
        self.assertIsNotNone(coverage_problem(words, 70.0))  # 40 s with no words at the end
        self.assertIsNotNone(coverage_problem([], 60.0))


if __name__ == "__main__":
    unittest.main()
