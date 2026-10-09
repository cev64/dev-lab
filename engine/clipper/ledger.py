"""data/ledger.json: which episodes were used and which source ranges became clips (dedupe across nights).

Shape:
{
  "version": 1,
  "episodes": { "<eid>": { "show", "title", "link", "firstUsed", "clips": [ {"id", "start", "end", "date"} ] } },
  "clips": [ { "id", "eid", "date", "start", "end", "title", "hook", "video" } ]
}
"""

from __future__ import annotations

from pathlib import Path

from .common import read_json, write_json

# Two clips from the same episode must be at least this far apart (seconds) so they never feel like repeats.
DEFAULT_MARGIN = 5.0


def empty() -> dict:
    return {"version": 1, "episodes": {}, "clips": []}


def load(path: Path) -> dict:
    data = read_json(path) or empty()
    data.setdefault("version", 1)
    data.setdefault("episodes", {})
    data.setdefault("clips", [])
    return data


def save(path: Path, data: dict) -> None:
    write_json(path, data)


def has_episode(data: dict, eid: str) -> bool:
    return eid in data["episodes"]


def ranges_overlap(a_start: float, a_end: float, b_start: float, b_end: float, margin: float = 0.0) -> bool:
    """True if [a_start, a_end] and [b_start, b_end] overlap or come within `margin` seconds of each other."""
    return a_start < b_end + margin and b_start < a_end + margin


def find_overlap(data: dict, eid: str, start: float, end: float, margin: float = DEFAULT_MARGIN) -> dict | None:
    """Return the first already-used clip range of this episode that overlaps [start, end], else None."""
    ep = data["episodes"].get(eid)
    if not ep:
        return None
    for c in ep.get("clips", []):
        if ranges_overlap(start, end, c["start"], c["end"], margin):
            return c
    return None


def add_clip(data: dict, *, eid: str, episode: dict, clip: dict) -> None:
    """Record a delivered clip. `episode` has show/title/link; `clip` has id/date/start/end/title/hook/video."""
    if find_overlap(data, eid, clip["start"], clip["end"], margin=0.0):
        raise ValueError(f"clip {clip['id']} overlaps an existing clip range of {eid}")
    ep = data["episodes"].setdefault(
        eid,
        {
            "show": episode.get("show", ""),
            "title": episode.get("title", ""),
            "link": episode.get("link", ""),
            "firstUsed": clip["date"],
            "clips": [],
        },
    )
    ep["clips"].append({"id": clip["id"], "start": clip["start"], "end": clip["end"], "date": clip["date"]})
    data["clips"] = [c for c in data["clips"] if c["id"] != clip["id"]]
    data["clips"].append({"eid": eid, **clip})
