"""Shared helpers: repo paths, JSON IO, slugs, time formatting, logging."""

from __future__ import annotations

import datetime as _dt
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path

FPS = 30


@dataclass(frozen=True)
class Paths:
    """All filesystem locations, derived from one root so tests can point at a temp dir."""

    root: Path

    @classmethod
    def default(cls) -> "Paths":
        env = os.environ.get("CLIPPER_ROOT")
        return cls(Path(env).resolve() if env else Path(__file__).resolve().parents[2])

    @property
    def sources(self) -> Path:
        return self.root / "config" / "sources.json"

    @property
    def work(self) -> Path:
        return self.root / "work"

    @property
    def episodes_index(self) -> Path:
        return self.work / "episodes.json"

    def episode_dir(self, eid: str) -> Path:
        return self.work / "episodes" / eid

    def clip_dir(self, clip_id: str) -> Path:
        return self.work / "clips" / clip_id

    def out_dir(self, date: str) -> Path:
        return self.root / "out" / date

    @property
    def deliveries(self) -> Path:
        return self.root / "deliveries"

    @property
    def ledger(self) -> Path:
        return self.root / "data" / "ledger.json"

    @property
    def renderer(self) -> Path:
        return self.root / "engine" / "render" / "render.mjs"



def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def read_json(path: Path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def write_json(path: Path, data, indent: int | None = 2) -> None:
    """Atomic write (tmp + rename) so a killed run never leaves half a file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, path)


def slugify(text: str, max_len: int = 40) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    if len(text) > max_len:
        text = text[:max_len].rsplit("-", 1)[0] or text[:max_len]
    return text


def hms(seconds: float) -> str:
    s = int(max(0, seconds))
    return f"{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}"


def parse_hms(text: str) -> float:
    """'1:02:03.5' / '02:03' / '123' -> seconds."""
    parts = [float(p) for p in str(text).strip().replace(",", ".").split(":")]
    total = 0.0
    for p in parts:
        total = total * 60 + p
    return total


def today_et() -> str:
    """Delivery date in America/New_York (the nightly routine runs at 3am ET)."""
    try:
        from zoneinfo import ZoneInfo

        return _dt.datetime.now(ZoneInfo("America/New_York")).date().isoformat()
    except Exception:
        return _dt.date.today().isoformat()


def r2(x: float) -> float:
    return round(float(x), 2)
