import unittest

import _path  # noqa: F401

from clipper.discover import relevance
from clipper.keywords import ad_hits, ai_hits, ai_score, matched_phrases


class Keywords(unittest.TestCase):
    def test_word_boundaries(self):
        self.assertEqual(ai_score("He said the main aim was fair."), 0)
        self.assertEqual(ai_score("Maintain the email chain"), 0)
        self.assertGreater(ai_score("AI is here"), 0)
        self.assertGreater(ai_score("the A.I. debate"), 0)
        self.assertGreater(ai_score("AI-powered tools"), 0)

    def test_case_rules(self):
        self.assertEqual(ai_score("ai"), 0)  # 'AI' is case-sensitive (avoids names / typos)
        self.assertGreater(ai_score("openai and chatgpt"), 0)  # brands are case-insensitive

    def test_terms(self):
        for text in ["Sam Altman", "artificial general intelligence", "superintelligence", "Anthropic", "AGI",
                     "large language models", "DeepMind", "Nvidia", "Grok", "humanoid robots", "the singularity"]:
            self.assertGreater(ai_score(text), 0, text)

    def test_diminishing_returns(self):
        self.assertEqual(ai_score("AI " * 10), ai_score("AI AI AI"))

    def test_hits_and_phrases(self):
        text = "OpenAI and Anthropic race toward AGI while automation grows"
        self.assertEqual(ai_hits(text), 3)  # automation is weight 1, not counted as a strong hit
        self.assertEqual(set(matched_phrases(text)), {"OpenAI", "Anthropic", "AGI"})

    def test_title_outweighs_description(self):
        title_only, _, _ = relevance("The future of AI with Sam Altman", "")
        desc_only, _, _ = relevance("A chat with a friend", "We talk about AI and OpenAI and AGI. " * 5)
        self.assertGreater(title_only, desc_only)

    def test_ad_detector(self):
        self.assertGreater(ad_hits("Support for this podcast comes from Dell. Visit dell.com/ai"), 0)
        self.assertEqual(ad_hits("We talked about whether models can reason."), 0)


if __name__ == "__main__":
    unittest.main()
