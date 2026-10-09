"""discover: recent AI-relevant episodes from config/sources.json, ranked, written to work/episodes.json."""

from __future__ import annotations

import datetime as dt
import math
import re
import time
from concurrent.futures import ThreadPoolExecutor

from . import ledger
from .common import Paths, log, read_json, write_json
from .feeds import Item, clean_description, http_get, parse_feed
from .keywords import ai_score, matched_phrases

PRIORITY_MULT = {1: 1.0, 2: 0.8, 3: 0.6}
TITLE_WEIGHT = 3.0
DESC_CAP = 9.0  # descriptions are noisy; cap their contribution
MIN_RELEVANCE = 6.0  # e.g. one strong title hit (3*3=9), or a description that is clearly about AI
MIN_DURATION = 15 * 60  # skip trailers / short news bites (unknown duration passes)
RECENCY_HALF_LIFE_DAYS = 21.0
PER_SHOW_CAP = 3  # at most this many episodes per show before others get a slot


def load_sources(paths: Paths) -> list[dict]:
    cfg = read_json(paths.sources)
    if not cfg:
        raise SystemExit(f"missing {paths.sources}")
    return cfg["sources"]


def episode_id(show_slug: str, item: Item) -> str:
    """Stable id: <showslug>-<number> when the title carries '#123' (or itunes:episode), else <showslug>-<yyyymmdd>."""
    m = re.search(r"#\s?(\d{1,5})\b", item.title)
    if m:
        return f"{show_slug}-{int(m.group(1))}"
    if item.episode_number:
        return f"{show_slug}-{item.episode_number}"
    if item.published:
        return f"{show_slug}-{dt.datetime.fromtimestamp(item.published, dt.timezone.utc):%Y%m%d}"
    return f"{show_slug}-{abs(hash(item.guid)) % 10**8}"


def relevance(title: str, description: str) -> tuple[float, float, float]:
    """(total, title_score, desc_score). Title is weighted heavily; cleaned description is capped."""
    t = ai_score(title)
    desc = clean_description(description)
    d = ai_score(desc)
    if len(desc) < 500:  # short guest blurbs (JRE-style) that still name AI are strong signals
        d *= 1.5
    d = min(d, DESC_CAP)
    return TITLE_WEIGHT * t + d, t, d


def recency_mult(published: float | None, now: float) -> float:
    if not published:
        return 0.5
    age_days = max(0.0, (now - published) / 86400)
    return math.pow(0.5, age_days / RECENCY_HALF_LIFE_DAYS)


def rank_items(source: dict, items: list[Item], now: float, days: int) -> list[dict]:
    out = []
    seen: set[str] = set()
    for it in items:
        if it.published and now - it.published > days * 86400:
            continue
        if it.episode_type == "trailer" or (it.duration and it.duration < MIN_DURATION):
            continue
        rel, t, d = relevance(it.title, it.description)
        if rel < MIN_RELEVANCE:
            continue
        eid = episode_id(source["slug"], it)
        if eid in seen and it.published:  # e.g. a bonus episode reusing a number
            eid = f"{eid}-{dt.datetime.fromtimestamp(it.published, dt.timezone.utc):%Y%m%d}"
        seen.add(eid)
        pri = int(source.get("priority", 2))
        score = rel * PRIORITY_MULT.get(pri, 0.6) * recency_mult(it.published, now)
        transcript = _pick_transcript(it.transcripts)
        out.append(
            {
                "eid": eid,
                "show": source["name"],
                "showSlug": source["slug"],
                "priority": pri,
                "title": it.title,
                "link": it.link,
                "guid": it.guid,
                "published": dt.datetime.fromtimestamp(it.published, dt.timezone.utc).isoformat() if it.published else None,
                "duration": it.duration,
                "audioUrl": it.audio_url,
                "transcriptUrl": transcript["url"] if transcript else None,
                "transcriptType": transcript["type"] if transcript else None,
                "relevance": round(rel, 2),
                "titleScore": t,
                "descScore": d,
                "score": round(score, 3),
                "keywords": matched_phrases(it.title + " " + clean_description(it.description))[:8],
                "description": clean_description(it.description, 600),
            }
        )
    return out


def _pick_transcript(transcripts: list[dict]) -> dict | None:
    """Only timed formats are useful (VTT/SRT/JSON); plain text has no timestamps."""
    order = ["text/vtt", "application/x-subrip", "application/srt", "application/json"]
    timed = [t for t in transcripts if (t.get("type") or "").lower() in order]
    timed.sort(key=lambda t: order.index(t["type"].lower()))
    return timed[0] if timed else None


def _fetch_source(src: dict) -> tuple[dict, list[Item] | None, str | None]:
    try:
        _title, items = parse_feed(http_get(src["feed"], timeout=60))
        return src, items, None
    except Exception as e:  # noqa: BLE001 - one bad feed must not stop the night
        return src, None, f"{type(e).__name__}: {e}"


def discover(paths: Paths, days: int = 45, limit: int = 30, include_used: bool = False) -> dict:
    t0 = time.time()
    sources = load_sources(paths)
    used = ledger.load(paths.ledger)
    now = time.time()
    episodes: list[dict] = []
    failures: list[dict] = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        for src, items, err in pool.map(_fetch_source, sources):
            if err:
                failures.append({"show": src["name"], "feed": src["feed"], "error": err})
                log(f"  ! {src['name']}: {err}")
                continue
            ranked = rank_items(src, items, now, days)
            fresh = [e for e in ranked if include_used or not ledger.has_episode(used, e["eid"])]
            log(f"  {src['name']}: {len(items)} items, {len(ranked)} AI-relevant in {days}d, {len(fresh)} unused")
            episodes.extend(fresh)
    episodes = diversify(sorted(episodes, key=lambda e: -e["score"]))
    result = {
        "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "days": days,
        "failures": failures,
        "episodes": episodes[:limit],
    }
    paths.work.mkdir(parents=True, exist_ok=True)
    write_json(paths.episodes_index, result)
    log(f"discover: {len(episodes)} candidates, kept {len(result['episodes'])} -> {paths.episodes_index} "
        f"({time.time() - t0:.1f}s)")
    return result


def diversify(ranked: list[dict], per_show: int = PER_SHOW_CAP) -> list[dict]:
    """Keep rank order but let each show take at most `per_show` slots before any show gets more."""
    counts: dict[str, int] = {}
    first, rest = [], []
    for e in ranked:
        counts[e["showSlug"]] = counts.get(e["showSlug"], 0) + 1
        (first if counts[e["showSlug"]] <= per_show else rest).append(e)
    return first + rest


def find_episode(paths: Paths, eid: str) -> dict:
    """Episode record from meta.json (after fetch) or work/episodes.json (after discover)."""
    meta = read_json(paths.episode_dir(eid) / "meta.json")
    if meta:
        return meta
    idx = read_json(paths.episodes_index) or {}
    for e in idx.get("episodes", []):
        if e["eid"] == eid:
            return e
    raise SystemExit(f"unknown episode {eid}: run `discover` first (or `discover --include-used`)")
