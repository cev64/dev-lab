import unittest

from clipper.make import apply_fixes


class FixesTest(unittest.TestCase):
    def test_whole_word_case_insensitive_keeps_punctuation(self):
        words = [{"w": "Aortman", "s": 0, "e": 1}, {"w": "openeye,", "s": 1, "e": 2}, {"w": "Aortmanish", "s": 2, "e": 3}]
        out = apply_fixes(words, {"aortman": "Altman", "OpenEye": "OpenAI"})
        self.assertEqual([w["w"] for w in out], ["Altman", "OpenAI,", "Aortmanish"])

    def test_no_fixes_is_identity(self):
        words = [{"w": "hi", "s": 0, "e": 1}]
        self.assertIs(apply_fixes(words, {}), words)


if __name__ == "__main__":
    unittest.main()


class ExactSnapTest(unittest.TestCase):
    def test_exact_keeps_weak_opener_and_payoff(self):
        from clipper.boundaries import snap
        # "But imagine ..." starts at 10.0; payoff "useful." ends at 75.0; a tempting sentence end at 72.0.
        words = [{"w": "end.", "s": 9.0, "e": 9.6}, {"w": "But", "s": 10.0, "e": 10.2}]
        words += [{"w": f"w{i}", "s": 10.5 + i * 0.5, "e": 10.9 + i * 0.5} for i in range(120)]
        words += [{"w": "years...", "s": 71.0, "e": 72.0}, {"w": "useful.", "s": 74.2, "e": 75.0},
                  {"w": "Next", "s": 75.1, "e": 75.4}]
        words.sort(key=lambda w: w["s"])
        s, e, info = snap(words, 10.0, 75.0, exact=True)
        self.assertEqual(info["method"], "exact")
        self.assertEqual(info["firstWord"], "But")
        self.assertEqual(info["lastWord"], "useful.")
        self.assertLessEqual(e, 75.1)


class PolishTest(unittest.TestCase):
    def test_numbers_rejoined_and_first_word_capitalised(self):
        from clipper.make import polish_words
        words = [{"w": "a", "s": 0, "e": 0.1}, {"w": "100", "s": 0.2, "e": 0.4}, {"w": ",000", "s": 0.4, "e": 0.6},
                 {"w": "workers,", "s": 0.7, "e": 1.0}]
        out = polish_words(words)
        self.assertEqual([w["w"] for w in out], ["A", "100,000", "workers,"])
        self.assertEqual(out[1]["e"], 0.6)


class AgreementTest(unittest.TestCase):
    def test_agreement(self):
        from clipper.make import word_agreement
        exp = [{"w": w} for w in "A lot of people say this phrase".split()]
        self.assertGreater(word_agreement(exp, [{"w": w} for w in "a lot of people say this phrase,".split()]), 0.9)
        self.assertLess(word_agreement(exp, [{"w": w} for w in "AI system they're not just trained".split()]), 0.3)
