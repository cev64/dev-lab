"""AI keyword matcher. Word-boundary regexes with weights; used by discover (episodes) and scout (paragraphs)."""

from __future__ import annotations

import re
from collections import Counter

# (label, regex, weight, case_sensitive)
# Weight 3 = unambiguous AI topic, 2 = strong signal, 1 = AI-adjacent (only meaningful in combination).
_TERMS: list[tuple[str, str, float, bool]] = [
    ("AI", r"AIs?|A\.I\.?", 3, True),
    ("artificial intelligence", r"artificial[\s-]+(?:general[\s-]+|super[\s-]?)?intelligence", 3, False),
    ("AGI", r"AGI|ASI", 3, True),
    ("superintelligence", r"super[\s-]?intelligen(?:ce|t)", 3, False),
    ("ChatGPT", r"chat\s?gpt|GPT[\s-]?\d(?:\.\d)?o?|GPTs?", 3, False),
    ("OpenAI", r"open\s?ai", 3, False),
    ("Anthropic", r"anthropic", 3, False),
    ("Claude", r"Claude", 2, True),
    ("Gemini", r"Gemini", 2, True),
    ("DeepMind", r"deep\s?mind", 3, False),
    ("LLM", r"LLMs?|large language models?|language models?", 3, False),
    ("machine learning", r"machine learning|deep learning|neural (?:net|network)s?", 3, False),
    ("chatbot", r"chat\s?bots?", 2, False),
    ("AI lab people", r"Sam Altman|Altman|Dario Amodei|Demis Hassabis|Hassabis|Ilya Sutskever|Sutskever|"
                      r"Geoffrey Hinton|Hinton|Yann LeCun|LeCun|Mustafa Suleyman|Fei-Fei Li|Karpathy", 3, False),
    # Public AI-debate figures whose episode titles are often just their name (e.g. "JRE #2551 - Daniel Kokotajlo").
    ("AI debate figures", r"Kokotajlo|Bostrom|Yudkowsky|Eliezer|Tegmark|Mo Gawdat|Yampolskiy|Tristan Harris|"
                          r"Gary Marcus|Stuart Russell|Connor Leahy|Aschenbrenner|AI 2027", 3, False),
    ("Nvidia", r"nvidia|Jensen Huang|Jensen", 2, False),
    ("xAI", r"xAI|Grok", 3, True),
    ("Elon", r"Elon|Musk", 1, False),
    ("singularity", r"(?:the )?singularity", 2, False),
    ("robots", r"robots?|robotics|humanoids?|Optimus", 2, False),
    ("automation", r"automation|automate[sd]?|automating", 1, False),
    ("AI agents", r"(?:AI |autonomous )agents?|agentic", 2, False),
    ("alignment", r"alignment|AI safety|x-risk|existential risk", 2, False),
    ("compute", r"data ?cent(?:er|re)s?|GPUs?|compute", 1, False),
    ("deepfake", r"deep\s?fakes?", 2, False),
    ("other labs", r"Perplexity|Mistral|Midjourney|Copilot|Llama|Meta AI|Stargate|Neuralink|Waymo", 2, False),
    ("algorithm", r"algorithms?", 1, False),
    ("tech jobs", r"(?:jobs?|work(?:ers)?) (?:replaced|displacement)|replace (?:jobs|workers|humans)", 1, False),
]

_COMPILED = [
    (label, re.compile(rf"(?<![\w.]){pat}(?![\w])", 0 if cs else re.IGNORECASE), w)
    for label, pat, w, cs in _TERMS
]


def find_terms(text: str) -> list[tuple[str, float]]:
    """All keyword hits in text as (label, weight), one per occurrence."""
    hits: list[tuple[str, float]] = []
    if not text:
        return hits
    for label, rx, w in _COMPILED:
        hits.extend((label, w) for _ in rx.finditer(text))
    return hits


def ai_score(text: str, per_term_cap: int = 3) -> float:
    """Weighted keyword score with diminishing returns: each label counts at most `per_term_cap` times."""
    counts = Counter()
    weights = {}
    for label, w in find_terms(text):
        counts[label] += 1
        weights[label] = w
    return float(sum(weights[l] * min(c, per_term_cap) for l, c in counts.items()))


def ai_hits(text: str) -> int:
    """Number of strong (weight >= 2) keyword occurrences; used for the `ai:N` tag in scout."""
    return sum(1 for _, w in find_terms(text) if w >= 2)


def matched_phrases(text: str) -> list[str]:
    """Distinct matched surface strings (original casing), strongest first. Used for clip `emphasis`."""
    found: dict[str, float] = {}
    for _label, rx, w in _COMPILED:
        if w < 2:
            continue
        for m in rx.finditer(text or ""):
            key = m.group(0).strip()
            found[key] = max(found.get(key, 0), w)
    return sorted(found, key=lambda k: -found[k])


# Ad reads often mention AI ("AI cloud for builders..."). Flag them so scout can down-rank those stretches.
_AD = re.compile(
    r"brought to you by|support for (?:this|the) (?:podcast|show)|sponsor(?:ed)?\b|promo code|use code|"
    r"free trial|sign up (?:at|today|now)|learn more at|terms (?:and conditions )?apply|limited time|"
    r"\b\w+\.(?:com|org|ai|io)\b|dot com|pricing|special offer|go to \w+\.\w+|ad council",
    re.IGNORECASE,
)


def ad_hits(text: str) -> int:
    """Number of ad-read phrases (heuristic)."""
    return len(_AD.findall(text or ""))
