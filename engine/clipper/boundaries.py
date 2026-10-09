"""Boundary refinement: snap a rough [start, end] to sentence ends / pauses so clips never cut mid-word.

Pure functions (no IO) so they are unit-testable. Cuts always fall inside a gap between two words.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

MIN_LEN, MAX_LEN = 58.0, 80.0  # hard limits (contract)
SOFT_MIN, SOFT_MAX = 61.0, 75.0  # preferred: > 60 s for TikTok Creator Rewards, <= 75 s for retention
SEARCH = 4.0  # seconds either side of the requested boundary
LEAD_IN = 0.15  # start this long before the first word (never before the previous word's end)
TAIL = 0.30  # end this long after the last word (never after the next word's start)

SENTENCE_END = (".", "?", "!", '."', '?"', '!"')
SOFT_BREAK = (",", ";", ":", "--", "-")
WEAK_OPENERS = {"and", "but", "or", "um", "uh", "because", "like", "which", "that"}


@dataclass
class Gap:
    prev: dict | None  # word before the gap
    next: dict | None  # word after the gap

    @property
    def t0(self) -> float:
        return self.prev["e"] if self.prev else max(0.0, self.next["s"] - 1.0)

    @property
    def t1(self) -> float:
        return self.next["s"] if self.next else self.prev["e"] + 1.0

    @property
    def length(self) -> float:
        return max(0.0, self.t1 - self.t0)

    def start_cut(self) -> float:
        return max(self.t0, self.t1 - LEAD_IN) if self.prev else max(0.0, self.t1 - LEAD_IN)

    def end_cut(self) -> float:
        return min(self.t1, self.t0 + TAIL) if self.next else self.t0 + TAIL


def gaps(words: list[dict]) -> list[Gap]:
    return [Gap(words[i - 1] if i > 0 else None, words[i] if i < len(words) else None) for i in range(len(words) + 1)]


def _break_score(g: Gap, quiet: Callable[[float, float], float] | None) -> float:
    s = 0.0
    if g.prev is None or g.prev["w"].endswith(SENTENCE_END):
        s += 3.0
    elif g.prev["w"].endswith(SOFT_BREAK):
        s += 1.0
    s += 2.0 * min(g.length, 1.0)
    if quiet and g.length >= 0.02:
        s += 1.5 * quiet(g.t0, g.t1)
    return s


def _start_score(g: Gap, target: float, quiet) -> float:
    s = _break_score(g, quiet) - 0.3 * abs(g.t1 - target)
    if g.next and g.next["w"].strip(",.?!\"'").lower() in WEAK_OPENERS:
        s -= 1.0
    return s


def _end_score(g: Gap, target: float, quiet) -> float:
    return _break_score(g, quiet) - 0.3 * abs(g.t0 - target)


def _length_penalty(d: float) -> float:
    if d < SOFT_MIN:
        return 3.0 * (SOFT_MIN - d)
    if d > SOFT_MAX:
        return 0.5 * (d - SOFT_MAX)
    return 0.0


def snap(words: list[dict], start: float, end: float,
         quiet: Callable[[float, float], float] | None = None) -> tuple[float, float, dict]:
    """Return (start, end, info). `words` are [{w, s, e}] in source time, sorted. `quiet(t0, t1)` -> 0..1."""
    if not words:
        d = min(max(end - start, MIN_LEN), MAX_LEN)
        return round(start, 2), round(start + d, 2), {"method": "clamp-no-words"}
    all_gaps = gaps(words)
    starts = [g for g in all_gaps if g.next and abs(g.t1 - start) <= SEARCH]
    if not starts:  # requested start falls in a long silence or outside the transcript: nearest word start
        starts = [min((g for g in all_gaps if g.next), key=lambda g: abs(g.t1 - start))]
    ends_near = [g for g in all_gaps if g.prev and abs(g.t0 - end) <= SEARCH]

    best = None
    for pool, method in ((ends_near, "snap"), ([g for g in all_gaps if g.prev], "snap-extended")):
        for gs in starts:
            s_cut = gs.start_cut()
            ss = _start_score(gs, start, quiet)
            for ge in pool:
                e_cut = ge.end_cut()
                d = e_cut - s_cut
                if not (MIN_LEN <= d <= MAX_LEN):
                    continue
                score = ss + _end_score(ge, end, quiet) - _length_penalty(d)
                if best is None or score > best[0]:
                    best = (score, s_cut, e_cut, gs, ge, method)
        if best:
            break
    if best is None:  # transcript too short around here; keep word-safe start and clamp the length
        gs = starts[0]
        s_cut = gs.start_cut()
        d = min(max(end - start, MIN_LEN), MAX_LEN)
        return round(s_cut, 2), round(s_cut + d, 2), {"method": "clamp"}
    score, s_cut, e_cut, gs, ge, method = best
    info = {
        "method": method,
        "score": round(score, 2),
        "firstWord": gs.next["w"] if gs.next else None,
        "lastWord": ge.prev["w"] if ge.prev else None,
        "startShift": round(s_cut - start, 2),
        "endShift": round(e_cut - end, 2),
    }
    return round(s_cut, 2), round(e_cut, 2), info


def quiet_from_rms(rms, t_origin: float, hop: float) -> Callable[[float, float], float]:
    """Build a quiet(t0, t1) function from an RMS array that starts at source time `t_origin`.

    1.0 = the quietest frame in the gap is near-silent relative to the local median speech level, 0.0 = not quiet.
    """
    import numpy as np

    med = float(np.median(rms)) if len(rms) else 0.0

    def quiet(t0: float, t1: float) -> float:
        if med <= 0:
            return 0.0
        a = max(0, int((t0 - t_origin) / hop))
        b = max(a + 1, int(np.ceil((t1 - t_origin) / hop)))
        seg = rms[a:b]
        if len(seg) == 0:
            return 0.0
        return float(np.clip(1.0 - 2.0 * float(seg.min()) / med, 0.0, 1.0))

    return quiet
