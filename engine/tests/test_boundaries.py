import unittest

import _path  # noqa: F401

from clipper import boundaries as b


def make_words(sentences, t0=0.0, word_dur=0.3, word_gap=0.05, sentence_gap=0.6):
    """Build a word list; each sentence is a list of tokens, the last token gets a period."""
    words, t = [], t0
    for sent in sentences:
        for i, tok in enumerate(sent):
            w = tok + ("." if i == len(sent) - 1 else "")
            words.append({"w": w, "s": round(t, 2), "e": round(t + word_dur, 2)})
            t += word_dur + word_gap
        t += sentence_gap - word_gap
    return words


def inside_word(words, t):
    return any(w["s"] < t < w["e"] for w in words)


class Snap(unittest.TestCase):
    def setUp(self):
        # 8-word sentences: each is 8*0.35 - 0.05 + 0.6 ~= 3.35 s; ~60 sentences = ~200 s of speech
        self.words = make_words([[f"w{i}_{j}" for j in range(8)] for i in range(60)])

    def test_snaps_to_sentence_boundaries(self):
        s, e, info = b.snap(self.words, 31.0, 98.0)
        first = next(w for w in self.words if w["s"] >= s)
        last = [w for w in self.words if w["e"] <= e][-1]
        prev = [w for w in self.words if w["e"] <= s]
        self.assertTrue(last["w"].endswith("."), info)
        self.assertTrue(not prev or prev[-1]["w"].endswith("."), info)
        self.assertLessEqual(abs(first["s"] - 31.0), b.SEARCH + 0.2)

    def test_never_mid_word_and_length_limits(self):
        for start, end in [(10.0, 70.0), (33.3, 101.7), (55.5, 120.0), (5.0, 300.0), (40.0, 60.0)]:
            s, e, _ = b.snap(self.words, start, end)
            self.assertFalse(inside_word(self.words, s), (start, s))
            self.assertFalse(inside_word(self.words, e), (end, e))
            self.assertGreaterEqual(e - s, b.MIN_LEN)
            self.assertLessEqual(e - s, b.MAX_LEN)

    def test_too_short_request_is_extended(self):
        s, e, info = b.snap(self.words, 40.0, 60.0)
        self.assertGreaterEqual(e - s, b.MIN_LEN)
        self.assertEqual(info["method"], "snap-extended")

    def test_prefers_longer_pause_and_quiet(self):
        words = [{"w": "a", "s": 0.0, "e": 0.3}, {"w": "b", "s": 0.35, "e": 0.6}, {"w": "c", "s": 2.0, "e": 2.3}]
        gaps = b.gaps(words)
        quiet = lambda t0, t1: 1.0 if t1 - t0 > 1 else 0.0
        self.assertGreater(b._break_score(gaps[2], quiet), b._break_score(gaps[1], quiet))

    def test_no_words_clamps(self):
        s, e, info = b.snap([], 10.0, 20.0)
        self.assertEqual((s, e), (10.0, 68.0))


if __name__ == "__main__":
    unittest.main()
