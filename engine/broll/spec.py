"""The `broll` field of a script.json beat, beat timings, and the manifest helpers."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

KINDS = ("stock", "ai", "none")
MEDIA = ("any", "video", "photo")


class SpecError(ValueError):
    pass


@dataclass(frozen=True)
class BrollSpec:
    kind: str                 # preferred provider: "stock" | "ai" | "none"
    query: str | None = None  # stock search terms (also the stock fallback of an "ai" beat)
    prompt: str | None = None  # AI subject (also the AI fallback of a "stock" beat)
    media: str = "any"        # stock: "video" | "photo" | "any" (video preferred)
    seed: int | None = None   # AI: fixed seed (default: derived from script id + beat + prompt)

    def order(self) -> list[str]:
        """Providers to try, preferred first. A spec can carry both a query and a prompt."""
        if self.kind == "none":
            return []
        out = [self.kind]
        other = "ai" if self.kind == "stock" else "stock"
        if (other == "ai" and self.prompt) or (other == "stock" and self.query):
            out.append(other)
        return out


def parse_broll(raw) -> BrollSpec:
    """Validate a beat's `broll` value. Missing/None/"none" -> kind none. A bare string is a stock query."""
    if raw is None or raw == "none" or raw is False:
        return BrollSpec("none")
    if isinstance(raw, str):
        raw = {"kind": "stock", "query": raw}
    if not isinstance(raw, dict):
        raise SpecError(f"broll must be an object, got {type(raw).__name__}")
    kind = raw.get("kind", "stock" if raw.get("query") else "ai" if raw.get("prompt") else "none")
    if kind not in KINDS:
        raise SpecError(f"broll.kind must be one of {KINDS}, got {kind!r}")
    query = (raw.get("query") or "").strip() or None
    prompt = (raw.get("prompt") or "").strip() or None
    media = raw.get("media", "any")
    if media not in MEDIA:
        raise SpecError(f"broll.media must be one of {MEDIA}, got {media!r}")
    if kind == "stock" and not query:
        raise SpecError("broll.kind 'stock' needs a 'query'")
    if kind == "ai" and not prompt:
        raise SpecError("broll.kind 'ai' needs a 'prompt'")
    seed = raw.get("seed")
    if seed is not None and not isinstance(seed, int):
        raise SpecError("broll.seed must be an integer")
    return BrollSpec(kind, query, prompt, media, seed)


def estimate_duration(script: dict) -> float:
    """Narration length guess when there is no voice.json yet (the narrator reads ~2.6 words/s)."""
    words = sum(len(str(b.get("say", "")).split()) for b in script.get("beats", []))
    return max(10.0, round(words / 2.6, 2)) if words else 66.0


def load_timings(script: dict, timings_path: Path | None, duration: float | None = None):
    """-> (beats [(t0, t1)], total duration). Uses voice.json when given/found, else splits evenly
    (testing only: B-roll then will not line up with the narration)."""
    n = len(script.get("beats", []))
    if n == 0:
        raise SpecError("script has no beats")
    if timings_path and Path(timings_path).exists():
        v = json.loads(Path(timings_path).read_text(encoding="utf-8"))
        beats = v.get("beats") or []
        if len(beats) != n:
            raise SpecError(f"{timings_path}: {len(beats)} beat timings for {n} script beats")
        total = float(v.get("duration") or beats[-1]["t1"])
        spans = [(float(b["t0"]), float(b["t1"])) for b in beats]
        for i, (a, b) in enumerate(spans):
            if not (0 <= a < b <= total + 0.05):
                raise SpecError(f"beat {i}: bad timing {a}-{b} (duration {total})")
        return spans, total
    total = float(duration or estimate_duration(script))
    step = total / n
    return [(round(i * step, 3), round((i + 1) * step, 3)) for i in range(n)], total


def segment_frames(spans, total: float, fps: int, fade: int):
    """Frame plan for the background track. Each beat owns [boundary_{i-1}, boundary_i) where a boundary is the
    midpoint of the gap between beats (beat 0 starts at 0, the last ends at `total`). Segments overlap by `fade`
    frames centred on each boundary, so crossfades never eat into a neighbour's middle.
    -> list of (start_frame, n_frames), and the total frame count."""
    n = len(spans)
    total_f = int(round(total * fps))
    bounds = [0] + [int(round((spans[i][1] + spans[i + 1][0]) / 2 * fps)) for i in range(n - 1)] + [total_f]
    half = fade // 2
    out = []
    for i in range(n):
        a = bounds[i] - (half if i > 0 else 0)
        b = bounds[i + 1] + ((fade - half) if i < n - 1 else 0)
        if b - a < fade + 2:
            raise SpecError(f"beat {i} is too short ({(b - a) / fps:.2f}s) for a {fade}-frame crossfade")
        out.append((a, b - a))
    return out, total_f
