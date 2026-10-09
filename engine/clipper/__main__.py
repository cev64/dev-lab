"""CLI: python -m clipper <discover|fetch|transcribe|scout|make|status> (run from engine/)."""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

from .common import Paths, hms, read_json


def cmd_status(paths: Paths) -> None:
    idx = read_json(paths.episodes_index) or {}
    eps = idx.get("episodes", [])
    print(f"work/episodes.json: {len(eps)} candidates (generated {idx.get('generated', '-')})")
    for e in eps[:8]:
        print(f"  {e['score']:>7.3f}  {e['eid']:<22} {e['show'][:28]:<28} {e['title'][:60]}")
    for f in idx.get("failures", []):
        print(f"  feed failed: {f['show']}: {f['error']}")

    ep_root = paths.work / "episodes"
    print("\nwork/episodes/:")
    for d in sorted(ep_root.iterdir()) if ep_root.exists() else []:
        parts = []
        a = d / "audio.mp3"
        if a.exists():
            parts.append(f"audio {a.stat().st_size / 1e6:.0f} MB")
        t = read_json(d / "transcript.json")
        if t:
            cov = f"{t['maxMinutes']:g} min" if t.get("maxMinutes") else "full"
            parts.append(f"transcript {t['source']} {t.get('model') or ''} ({cov}, {len(t['segments'])} segs)".replace("  ", " "))
        elif (d / "transcript.partial.json").exists():
            p = read_json(d / "transcript.partial.json") or {}
            parts.append(f"transcript partial to {hms(p.get('pos', 0))}")
        w = read_json(d / "windows.json")
        if w:
            parts.append(f"scout {len(w['windows'])} windows")
        print(f"  {d.name:<24} " + (", ".join(parts) or "empty"))

    clip_root = paths.work / "clips"
    print("\nwork/clips/:")
    for d in sorted(clip_root.iterdir()) if clip_root.exists() else []:
        c = read_json(d / "clip.json")
        if not c:
            print(f"  {d.name}  (no clip.json)")
            continue
        date = d.name[:10]
        video = paths.out_dir(date) / f"{d.name}.mp4"
        src = c.get("source", {})
        print(f"  {d.name}  {c['duration']:.1f}s  src {hms(src.get('start', 0))}-{hms(src.get('end', 0))}  "
              f"{'video ok' if video.exists() else 'no video'}")

    led = read_json(paths.ledger) or {"episodes": {}, "clips": []}
    print(f"\nledger: {len(led['episodes'])} episodes used, {len(led['clips'])} clips delivered")
    for c in led["clips"][-5:]:
        print(f"  {c['date']}  {c['id']}  {hms(c['start'])}-{hms(c['end'])}")


def print_text(paths: Paths, eid: str, start: float, end: float) -> None:
    """Segments overlapping [start, end], each prefixed with its start second, so a candidate can be judged and
    its boundaries chosen precisely."""
    tr = read_json(paths.episode_dir(eid) / "transcript.json")
    if not tr:
        raise SystemExit(f"no transcript for {eid}")
    for seg in tr["segments"]:
        if seg["e"] >= start and seg["s"] <= end:
            print(f"[{seg['s']:8.2f}-{seg['e']:8.2f}] {seg['text'].strip()}")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="clipper", description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("discover", help="rank recent AI episodes -> work/episodes.json")
    p.add_argument("--days", type=int, default=45)
    p.add_argument("--limit", type=int, default=30)
    p.add_argument("--include-used", action="store_true", help="keep episodes already in the ledger")

    p = sub.add_parser("fetch", help="download episode audio")
    p.add_argument("eid")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("transcribe", help="publisher transcript or faster-whisper -> transcript.json")
    p.add_argument("eid")
    p.add_argument("--model", default="base.en")
    p.add_argument("--max-minutes", type=float, default=None, help="only the first N minutes (testing)")
    p.add_argument("--beam", type=int, default=1, help="whisper beam size (1 = greedy, fastest)")
    p.add_argument("--no-publisher", action="store_true", help="ignore the feed's transcript, use whisper")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("scout", help="scout.md + windows.json")
    p.add_argument("eid")

    p = sub.add_parser("make", help="cut, refine, render and package selections")
    p.add_argument("--selections", required=True, type=Path)
    p.add_argument("--date", default=None, help="delivery date YYYY-MM-DD (default: today, America/New_York)")
    p.add_argument("--no-render", action="store_true")
    p.add_argument("--no-package", action="store_true", help="do not touch deliveries/ or the ledger")
    p.add_argument("--force-package", action="store_true", help="package even if no video was rendered")

    p = sub.add_parser("text", help="print the transcript between two times (for re-reading a candidate)")
    p.add_argument("eid")
    p.add_argument("start", type=float)
    p.add_argument("end", type=float)

    sub.add_parser("status", help="show work/ and ledger state")

    a = ap.parse_args(argv)
    paths = Paths.default()
    t0 = time.time()
    if a.cmd == "discover":
        from .discover import discover

        discover(paths, days=a.days, limit=a.limit, include_used=a.include_used)
    elif a.cmd == "fetch":
        from .fetch import fetch

        fetch(paths, a.eid, force=a.force)
    elif a.cmd == "transcribe":
        from .transcribe import transcribe

        transcribe(paths, a.eid, model=a.model, max_minutes=a.max_minutes, use_publisher=not a.no_publisher,
                   force=a.force, beam_size=a.beam)
    elif a.cmd == "scout":
        from .scout import scout

        scout(paths, a.eid)
    elif a.cmd == "make":
        from .make import make

        res = make(paths, a.selections, date=a.date, render=not a.no_render, do_package=not a.no_package,
                   force_package=a.force_package)
        if any("error" in r for r in res):
            return 1
    elif a.cmd == "text":
        print_text(paths, a.eid, a.start, a.end)
    elif a.cmd == "status":
        cmd_status(paths)
    if a.cmd != "status":
        print(f"[{a.cmd}] done in {time.time() - t0:.1f}s", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
