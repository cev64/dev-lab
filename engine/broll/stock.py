"""Stock footage/photos: Pexels (preferred) and Pixabay (fallback). Keys come from PEXELS_API_KEY / PIXABAY_API_KEY;
a provider without a key is skipped. Only stdlib HTTP. Search responses are cached for 24 h (Pixabay's API terms
require caching), downloads are cached by asset id in ~/.cache/broll/media.

Selection (per beat): portrait first, file height >= 1280, a video at least as long as the beat, and a penalty for
assets whose title/tags suggest visible text, logos, screens full of UI, or close-up faces (we cannot see the
pixels before downloading, so this is a metadata heuristic; the lead still looks at the stills in QA).
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

USER_AGENT = "Mozilla/5.0 (compatible; broll/1.0; explainer b-roll fetcher)"
CACHE = Path(os.environ.get("BROLL_CACHE", Path.home() / ".cache" / "broll"))
MIN_HEIGHT = 1280
MAX_DOWNLOAD = 250 * 1024 * 1024
SEARCH_TTL = 24 * 3600

# Metadata words that usually mean on-screen text/brands (bad under our captions and cards, and a rights risk).
TEXT_WORDS = {"text", "logo", "logos", "sign", "signs", "signage", "neon", "billboard", "typography", "letters",
              "lettering", "words", "word", "quote", "font", "brand", "branding", "advertising", "advertisement",
              "newspaper", "headline", "label", "poster", "banner", "screen", "website", "app", "interface", "ui",
              "chart", "graph", "map", "subtitles", "title", "watermark", "trademark", "packaging"}
# Close-up people: allowed, but scenes/hands/silhouettes read better as anonymous B-roll (and avoid implying that an
# identifiable stranger is part of the story; Pexels/Pixabay terms forbid showing people in a bad light).
FACE_WORDS = {"portrait", "face", "faces", "selfie", "headshot", "closeup", "close-up", "smiling", "model", "posing"}


class ProviderError(RuntimeError):
    pass


@dataclass
class Candidate:
    provider: str            # "pexels" | "pixabay"
    id: str
    media: str               # "video" | "photo"
    download_url: str
    page_url: str
    width: int
    height: int
    duration: float | None   # seconds (videos)
    author: str
    author_url: str
    words: set = field(default_factory=set)  # lower-case title/tag words for the heuristics
    score: float = 0.0

    @property
    def credit(self) -> str:
        what = "Video" if self.media == "video" else "Photo"
        return f"{what}: {self.author} / {self.provider.capitalize()}"

    @property
    def key(self) -> str:
        return f"{self.provider}-{self.id}"


def _words(*texts) -> set:
    out = set()
    for t in texts:
        out.update(w for w in re.split(r"[^a-z0-9-]+", str(t or "").lower()) if w)
    return out


def score(c: Candidate, need: float) -> float:
    """Higher is better. `need` = beat length in seconds."""
    s = 0.0
    if c.height > c.width:
        s += 3.0
    elif c.height == c.width:
        s += 0.5
    else:
        s -= 1.5  # landscape: centre crop to 9:16 keeps only a third of the frame
    if c.media == "video":
        s += 1.0  # motion beats a still
        if c.duration and need > 0:
            s += 2.0 if c.duration >= need else -2.0 * (need - c.duration) / need  # short clips must loop
    s -= 3.0 * len(c.words & TEXT_WORDS)
    s -= 1.0 * min(2, len(c.words & FACE_WORDS))
    s += min(c.height, 2160) / 2160 * 0.5  # mild preference for resolution, capped (no 8K downloads)
    return round(s, 3)


def usable(c: Candidate) -> bool:
    return c.height >= MIN_HEIGHT and bool(c.download_url)


# ---------------------------------------------------------------- HTTP

def http_json(url: str, headers: dict | None = None, timeout: float = 30) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise ProviderError(f"HTTP {e.code} from {urllib.parse.urlsplit(url).netloc}") from None


def cached_json(url: str, headers: dict | None, fetch=http_json, ttl: float = SEARCH_TTL) -> dict:
    """GET JSON with a 24 h disk cache keyed by the URL (keys are hashed, never stored in clear)."""
    path = CACHE / "api" / (hashlib.sha256(url.encode()).hexdigest()[:32] + ".json")
    try:
        if time.time() - path.stat().st_mtime < ttl:
            return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        pass
    data = fetch(url, headers)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data), encoding="utf-8")
    except OSError:
        pass
    return data


def download(c: Candidate, dest_dir: Path, stem: str) -> Path:
    """Download (or reuse from cache) and link/copy into dest_dir as <stem>.<ext>."""
    ext = ".mp4" if c.media == "video" else ".jpg"
    cached = CACHE / "media" / f"{c.key}-{c.width}x{c.height}{ext}"
    if not cached.exists() or cached.stat().st_size == 0:
        cached.parent.mkdir(parents=True, exist_ok=True)
        tmp = cached.with_suffix(ext + ".part")
        req = urllib.request.Request(c.download_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=120) as r, open(tmp, "wb") as f:
            n = 0
            while chunk := r.read(1 << 20):
                n += len(chunk)
                if n > MAX_DOWNLOAD:
                    raise ProviderError(f"{c.key}: download larger than {MAX_DOWNLOAD >> 20} MB")
                f.write(chunk)
        os.replace(tmp, cached)
    dest_dir.mkdir(parents=True, exist_ok=True)
    out = dest_dir / f"{stem}{ext}"
    if out.exists():
        out.unlink()
    try:
        os.link(cached, out)
    except OSError:
        shutil.copyfile(cached, out)
    return out


# ---------------------------------------------------------------- Pexels

class Pexels:
    """https://www.pexels.com/api/documentation/ - header `Authorization: <key>`; 200 req/h, 20k/month."""

    name = "pexels"
    BASE = "https://api.pexels.com"

    def __init__(self, key: str | None = None, fetch=None):
        self.key = key if key is not None else os.environ.get("PEXELS_API_KEY", "").strip()
        self.fetch = fetch or (lambda url, headers: cached_json(url, headers))

    @property
    def available(self) -> bool:
        return bool(self.key)

    def _get(self, path: str, params: dict) -> dict:
        url = f"{self.BASE}{path}?{urllib.parse.urlencode(params)}"
        return self.fetch(url, {"Authorization": self.key})

    def search_videos(self, query: str, per_page: int = 20) -> list[Candidate]:
        data = self._get("/videos/search", {"query": query, "orientation": "portrait", "size": "large",
                                            "per_page": per_page})
        out = []
        for v in data.get("videos", []):
            f = pick_rendition(v.get("video_files", []))
            if not f:
                continue
            user = v.get("user") or {}
            slug = urllib.parse.urlsplit(v.get("url", "")).path.rstrip("/").rsplit("/", 1)[-1]
            out.append(Candidate("pexels", str(v["id"]), "video", f["link"], v.get("url", ""),
                                 int(f.get("width") or v.get("width") or 0), int(f.get("height") or v.get("height") or 0),
                                 float(v.get("duration") or 0), user.get("name", "Pexels"), user.get("url", ""),
                                 _words(slug.replace("-", " "), " ".join(t for t in v.get("tags", []) if isinstance(t, str)))))
        return out

    def search_photos(self, query: str, per_page: int = 20) -> list[Candidate]:
        data = self._get("/v1/search", {"query": query, "orientation": "portrait", "size": "large",
                                        "per_page": per_page})
        out = []
        for p in data.get("photos", []):
            src = p.get("src") or {}
            w, h = int(p.get("width") or 0), int(p.get("height") or 0)
            if src.get("original") and w and h:
                # Pexels images take imgix-style params: centre-crop to 9:16 with Ken Burns headroom (no upscaling).
                ch = min(h, w * 16 / 9)
                s = min(1.0, 2160 / ch)
                url, cw, ch = src["original"] + "?auto=compress&cs=tinysrgb&fit=crop&w=1215&h=2160", ch * 9 / 16 * s, ch * s
            else:
                url, cw, ch = src.get("large2x", ""), w, h
            out.append(Candidate("pexels", str(p["id"]), "photo", url, p.get("url", ""), int(cw), int(ch), None,
                                 p.get("photographer", "Pexels"), p.get("photographer_url", ""),
                                 _words(p.get("alt", ""))))
        return out


def pick_rendition(files: list[dict], url_key: str = "link") -> dict | None:
    """Smallest mp4 rendition whose height >= 1920, else the tallest >= MIN_HEIGHT (avoids 4K downloads)."""
    mp4 = [f for f in files if (f.get("file_type") or "video/mp4") == "video/mp4" and f.get(url_key)
           and int(f.get("height") or 0) >= MIN_HEIGHT]
    if not mp4:
        return None
    big = sorted((f for f in mp4 if int(f["height"]) >= 1920), key=lambda f: int(f["height"]) * int(f.get("width") or 1))
    return big[0] if big else max(mp4, key=lambda f: int(f["height"]))


# ---------------------------------------------------------------- Pixabay

class Pixabay:
    """https://pixabay.com/api/docs/ - `key` query param; 100 req/60 s; results must be cached 24 h and media
    downloaded (no hotlinking). Free API: images up to 1280 px (largeImageURL)."""

    name = "pixabay"
    BASE = "https://pixabay.com/api/"

    def __init__(self, key: str | None = None, fetch=None):
        self.key = key if key is not None else os.environ.get("PIXABAY_API_KEY", "").strip()
        self.fetch = fetch or (lambda url, headers: cached_json(url, headers))

    @property
    def available(self) -> bool:
        return bool(self.key)

    def _get(self, path: str, params: dict) -> dict:
        url = f"{self.BASE}{path}?{urllib.parse.urlencode({'key': self.key, **params})}"
        return self.fetch(url, None)

    def search_videos(self, query: str, per_page: int = 30) -> list[Candidate]:
        data = self._get("videos/", {"q": query, "video_type": "film", "safesearch": "true",
                                     "per_page": per_page})
        out = []
        for v in data.get("hits", []):
            vids = v.get("videos") or {}
            # No orientation filter for Pixabay videos: portrait ones win in scoring.
            best = pick_rendition([vids[k] for k in ("large", "medium", "small", "tiny") if vids.get(k)], "url")
            if not best:
                continue
            out.append(Candidate("pixabay", str(v["id"]), "video", best["url"], v.get("pageURL", ""),
                                 int(best.get("width") or 0), int(best.get("height") or 0),
                                 float(v.get("duration") or 0), v.get("user", "Pixabay"),
                                 f"https://pixabay.com/users/{v.get('user', '')}-{v.get('user_id', '')}/",
                                 _words(v.get("tags", ""))))
        return out

    def search_photos(self, query: str, per_page: int = 30) -> list[Candidate]:
        data = self._get("", {"q": query, "image_type": "photo", "orientation": "vertical", "safesearch": "true",
                              "min_height": MIN_HEIGHT, "per_page": per_page})
        out = []
        for p in data.get("hits", []):
            w, h = int(p.get("imageWidth") or 0), int(p.get("imageHeight") or 0)
            s = min(1.0, 1280 / max(w, h, 1))  # largeImageURL is scaled to <= 1280 px on the long side
            out.append(Candidate("pixabay", str(p["id"]), "photo", p.get("largeImageURL", ""), p.get("pageURL", ""),
                                 round(w * s), round(h * s), None, p.get("user", "Pixabay"),
                                 f"https://pixabay.com/users/{p.get('user', '')}-{p.get('user_id', '')}/",
                                 _words(p.get("tags", ""))))
        return out


# ---------------------------------------------------------------- resolve

def providers() -> list:
    return [p for p in (Pexels(), Pixabay()) if p.available]


def find(query: str, need: float, media: str = "any", provs=None, exclude: set | None = None,
         log=lambda m: None) -> Candidate | None:
    """Best usable candidate across providers (in order: Pexels, then Pixabay only if Pexels has nothing usable).
    Videos and photos are scored together (videos get a bonus); `exclude` = asset keys already used tonight."""
    provs = providers() if provs is None else provs
    exclude = exclude or set()
    for p in provs:
        cands: list[Candidate] = []
        try:
            if media in ("any", "video"):
                cands += p.search_videos(query)
            if media in ("any", "photo"):
                cands += p.search_photos(query)
        except (ProviderError, OSError, ValueError) as e:
            log(f"  {p.name}: search failed ({e}); trying next provider")
            continue
        ok = [c for c in cands if usable(c) and c.key not in exclude]
        for c in ok:
            c.score = score(c, need)
        ok.sort(key=lambda c: -c.score)
        if ok:
            log(f"  {p.name}: {len(ok)}/{len(cands)} usable for {query!r}; best {ok[0].key} score {ok[0].score}")
            return ok[0]
        log(f"  {p.name}: nothing usable for {query!r} ({len(cands)} results)")
    return None
