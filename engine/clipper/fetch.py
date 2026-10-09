"""fetch: download an episode's audio enclosure to work/episodes/<eid>/audio.mp3 (+ meta.json)."""

from __future__ import annotations

import os
import time

from . import audio
from .common import Paths, log, r2, write_json
from .discover import find_episode
from .feeds import http_open


def fetch(paths: Paths, eid: str, force: bool = False) -> dict:
    ep = find_episode(paths, eid)
    ep_dir = paths.episode_dir(eid)
    ep_dir.mkdir(parents=True, exist_ok=True)
    dst = ep_dir / "audio.mp3"
    if dst.exists() and not force:
        log(f"fetch: cached {dst} ({dst.stat().st_size / 1e6:.1f} MB)")
    else:
        _download(ep["audioUrl"], dst)
    meta = dict(ep)
    meta["audioPath"] = str(dst)
    meta["audioDuration"] = r2(audio.probe_duration(dst))
    write_json(ep_dir / "meta.json", meta)
    return meta


def _download(url: str, dst) -> None:
    t0 = time.time()
    tmp = dst.with_suffix(".part")
    with http_open(url, timeout=120) as r, open(tmp, "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        got, next_report = 0, 0.1
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
            got += len(chunk)
            if total and got / total >= next_report:
                log(f"fetch: {100 * got / total:.0f}% of {total / 1e6:.0f} MB")
                next_report += 0.1
    if total and got < total:
        tmp.unlink(missing_ok=True)
        raise SystemExit(f"fetch: truncated download ({got} of {total} bytes)")
    os.replace(tmp, dst)
    log(f"fetch: {got / 1e6:.1f} MB in {time.time() - t0:.1f}s -> {dst}")
