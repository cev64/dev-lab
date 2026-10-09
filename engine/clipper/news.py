"""news: gather recent AI headlines for the original explainer track -> work/news.json.

Reads config/news_sources.json ({"feeds": [{id, name, url, kind, weight}]}), parses RSS and Atom, keeps items from the
last N days, scores them (freshness x source weight x AI relevance, + a boost when the story is also on the Hacker
News front page) and merges near-duplicate headlines so one story lists all the outlets that covered it. The agent
picks tonight's story from this list and must still read >= 2 sources before writing the script.
"""

from __future__ import annotations

import html
import json
import re
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor

from .common import Paths, log, read_json, write_json
from .feeds import clean_description, http_get, parse_date
from .keywords import ai_score

HN_FRONT = "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=60"
STOP = set("a an the of to in on for and or with by at from is are be as its it this that new how why what".split())


def parse_when(text: str) -> float | None:
    """RFC 822 (RSS) via feeds.parse_date, else ISO 8601 (Atom: 2026-10-08T10:00:00Z)."""
    t = parse_date(text)
    if t:
        return t
    from datetime import datetime, timezone

    try:
        d = datetime.fromisoformat(text.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    return (d if d.tzinfo else d.replace(tzinfo=timezone.utc)).timestamp()


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def parse_news_feed(xml_bytes: bytes) -> list[dict]:
    """RSS <item> or Atom <entry> -> [{title, url, published, summary}]."""
    root = ET.fromstring(xml_bytes)
    out = []
    for el in root.iter():
        name = _local(el.tag)
        if name not in ("item", "entry"):
            continue
        fields: dict[str, str] = {}
        link = ""
        for c in el:
            cn = _local(c.tag)
            if cn == "link":
                link = link or (c.get("href") if c.get("href") and c.get("rel", "alternate") == "alternate"
                                else (c.text or "").strip())
            elif cn in ("title", "pubDate", "published", "updated", "date", "description", "summary", "encoded"):
                fields.setdefault(cn, "".join(c.itertext()).strip())
        title = html.unescape(re.sub(r"\s+", " ", fields.get("title", ""))).strip()
        if not title:
            continue
        when = None
        for k in ("pubDate", "published", "updated", "date"):
            if fields.get(k):
                when = parse_when(fields[k])
                if when:
                    break
        summary = clean_description(fields.get("description") or fields.get("summary") or fields.get("encoded") or "",
                                    max_chars=500)
        out.append({"title": title, "url": link, "published": when, "summary": summary})
    return out


def _tokens(title: str) -> set[str]:
    return {t for t in re.findall(r"[a-z0-9]+", title.lower()) if t not in STOP and len(t) > 2}


def similar(a: str, b: str) -> float:
    ta, tb = _tokens(a), _tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / min(len(ta), len(tb))


def score_item(item: dict, weight: float, now: float, hn_titles: list[str]) -> float:
    age_h = max(0.0, (now - (item["published"] or now)) / 3600)
    fresh = 1.0 / (1.0 + age_h / 24)  # 1.0 now, 0.5 after a day, 0.25 after three
    rel = ai_score(f"{item['title']} {item['title']} {item['summary']}")  # title counts double
    trending = 1.5 if any(similar(item["title"], h) >= 0.6 for h in hn_titles) else 1.0
    return round(fresh * weight * (1 + rel) * trending, 3)


def _fetch(feed: dict) -> tuple[dict, list[dict], str | None]:
    try:
        return feed, parse_news_feed(http_get(feed["url"], timeout=30)), None
    except Exception as e:  # noqa: BLE001 - one dead feed must not stop the rest
        return feed, [], f"{type(e).__name__}: {e}"


def hn_front_titles() -> list[str]:
    try:
        data = json.loads(http_get(HN_FRONT, timeout=20))
        return [h.get("title") or "" for h in data.get("hits", [])]
    except Exception as e:  # noqa: BLE001
        log(f"news: HN front page unavailable ({e})")
        return []


def merge_stories(items: list[dict], threshold: float = 0.6) -> list[dict]:
    """Group near-duplicate headlines (sorted by score first) into stories with all their sources."""
    stories: list[dict] = []
    for it in sorted(items, key=lambda x: -x["score"]):
        for s in stories:
            if similar(s["title"], it["title"]) >= threshold:
                s["sources"].append({k: it[k] for k in ("publisher", "title", "url", "published")})
                s["score"] = round(s["score"] + 0.25 * it["score"], 3)  # more coverage = bigger story
                break
        else:
            stories.append({"title": it["title"], "summary": it["summary"], "score": it["score"],
                            "sources": [{k: it[k] for k in ("publisher", "title", "url", "published")}]})
    return sorted(stories, key=lambda s: -s["score"])


def news(paths: Paths, days: float = 3, limit: int = 40) -> dict:
    cfg = read_json(paths.root / "config" / "news_sources.json") or {}
    feeds = cfg.get("feeds", [])
    if not feeds:
        raise SystemExit("config/news_sources.json has no feeds")
    now = time.time()
    hn = hn_front_titles()
    items, errors = [], []
    with ThreadPoolExecutor(max_workers=8) as pool:
        for feed, got, err in pool.map(_fetch, feeds):
            if err:
                errors.append({"feed": feed.get("id"), "error": err})
                continue
            kept = 0
            for it in got:
                if it["published"] and now - it["published"] > days * 86400:
                    continue
                if feed.get("kind") != "official" and ai_score(it["title"] + " " + it["summary"]) == 0:
                    continue  # press/research feeds mix in non-AI stories
                it["publisher"] = feed.get("name", feed.get("id"))
                it["kind"] = feed.get("kind", "")
                it["score"] = score_item(it, float(feed.get("weight", 1)), now, hn)
                items.append(it)
                kept += 1
            log(f"news: {feed.get('name')}: {len(got)} items, {kept} recent AI")
    stories = merge_stories(items)[:limit]
    out = {"generated": now, "days": days, "hnTitles": len(hn), "errors": errors, "stories": stories}
    write_json(paths.work / "news.json", out)
    for i, s in enumerate(stories[:15], 1):
        pubs = ", ".join(sorted({x["publisher"] for x in s["sources"]}))
        log(f"{i:2d}. [{s['score']:.2f}] {s['title'][:90]}  ({pubs})")
    if errors:
        log(f"news: {len(errors)} feeds failed: " + "; ".join(e["feed"] for e in errors))
    return out
