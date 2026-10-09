"""RSS fetching and parsing (stdlib only)."""

from __future__ import annotations

import email.utils
import html
import re
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field

USER_AGENT = "Mozilla/5.0 (compatible; clipper/1.0; podcast feed reader)"


def http_get(url: str, timeout: float = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def http_open(url: str, timeout: float = 60):
    """Open a URL for streaming. Plain-http URLs are tried as https first (the egress proxy is https-only)."""
    candidates = [url]
    if url.startswith("http://"):
        candidates.insert(0, "https://" + url[len("http://"):])
    last = None
    for u in candidates:
        try:
            req = urllib.request.Request(u, headers={"User-Agent": USER_AGENT})
            return urllib.request.urlopen(req, timeout=timeout)
        except Exception as e:  # noqa: BLE001 - try the next candidate
            last = e
    raise last  # type: ignore[misc]


@dataclass
class Item:
    title: str
    link: str
    guid: str
    published: float | None  # unix seconds
    description: str  # raw (may be HTML)
    audio_url: str
    audio_type: str = ""
    duration: float | None = None  # seconds, from itunes:duration
    episode_number: int | None = None
    episode_type: str = "full"
    transcripts: list[dict] = field(default_factory=list)  # [{url, type}]


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag.split(":")[-1]


def _child(el: ET.Element, name: str) -> ET.Element | None:
    for c in el:
        if _local(c.tag) == name:
            return c
    return None


def _text(el: ET.Element, name: str) -> str:
    c = _child(el, name)
    return (c.text or "").strip() if c is not None else ""


def parse_duration(text: str) -> float | None:
    text = (text or "").strip()
    if not text:
        return None
    try:
        parts = [float(p) for p in text.split(":")]
    except ValueError:
        return None
    total = 0.0
    for p in parts:
        total = total * 60 + p
    return total


def parse_date(text: str) -> float | None:
    try:
        return email.utils.parsedate_to_datetime(text.strip()).timestamp()
    except Exception:  # noqa: BLE001
        return None


def parse_feed(xml_bytes: bytes) -> tuple[str, list[Item]]:
    """Return (channel title, items). Items without an audio enclosure are dropped."""
    root = ET.fromstring(xml_bytes)
    channel = _child(root, "channel") if _local(root.tag) == "rss" else root
    if channel is None:
        raise ValueError("no <channel> in feed")
    show_title = _text(channel, "title")
    items: list[Item] = []
    for el in channel:
        if _local(el.tag) != "item":
            continue
        enc = _child(el, "enclosure")
        if enc is None or not enc.get("url"):
            continue
        desc = ""
        for name in ("encoded", "description", "summary"):  # content:encoded is the richest
            desc = _text(el, name)
            if desc:
                break
        num = _text(el, "episode")
        transcripts = [
            {"url": c.get("url"), "type": c.get("type", "")}
            for c in el
            if _local(c.tag) == "transcript" and c.get("url")
        ]
        items.append(
            Item(
                title=html.unescape(_text(el, "title")),
                link=_text(el, "link"),
                guid=_text(el, "guid") or enc.get("url"),
                published=parse_date(_text(el, "pubDate")),
                description=desc,
                audio_url=enc.get("url"),
                audio_type=enc.get("type", ""),
                duration=parse_duration(_text(el, "duration")),
                episode_number=int(num) if num.isdigit() else None,
                episode_type=(_text(el, "episodeType") or "full").lower(),
                transcripts=transcripts,
            )
        )
    return html.unescape(show_title), items


_SKIP_SECTION = re.compile(
    r"sponsor|support (?:this|the) (?:show|podcast)|contact|links?\b|follow|hiring|feedback|ad choices|"
    r"privacy|subscribe|where to find|partners|socials?|merch|tickets",
    re.I,
)
_PROMO_LINE = re.compile(
    r"https?://|www\.|\.com\b|promo|use code|discount|% off|free trial|sponsored|brought to you|"
    r"-powered|go to |visit |check out|sign up|download|learn more|terms apply",
    re.I,
)


def clean_description(raw: str, max_chars: int = 2000) -> str:
    """Strip HTML and sponsor/link boilerplate so ads like 'AI-powered dictation app' don't count as topic."""
    text = re.sub(r"<\s*(br|/p|/li|/h\d|/div)\s*/?>", "\n", raw or "", flags=re.I)
    text = html.unescape(re.sub(r"<[^>]+>", " ", text))
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.split("\n")]
    out: list[str] = []
    skipping = False
    for i, ln in enumerate(lines):
        if not ln:
            continue
        is_header = (ln.endswith(":") and len(ln) < 60) or (ln.isupper() and len(ln) < 60)
        if is_header:
            skipping = bool(_SKIP_SECTION.search(ln))
            continue
        if skipping:
            continue
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        if _PROMO_LINE.search(ln) or re.match(r"(?i)go to |visit ", nxt):
            continue
        out.append(ln)
    return " ".join(out)[:max_chars]
