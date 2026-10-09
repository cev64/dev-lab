"""CLI (run from engine/):
  python -m broll fetch --script <script.json> --out <dir> [--timings voice.json] [--duration S] [--ai|--no-ai]
                        [--model sd-turbo] [--steps N] [--darken 0.5] [--no-track]
  python -m broll track --out <dir> [--darken 0.5]        rebuild <dir>/broll.mp4 from <dir>/broll.json
  python -m broll check --script <script.json>            validate broll fields + AI prompts, show the plan
Writes <dir>/broll.json (manifest) and <dir>/broll.mp4 (background track). See docs/specs/broll.md.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

from . import AI_LABEL, FPS, H, W
from . import ai, stock, track
from .spec import SpecError, load_timings, parse_broll


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def write_json(path: Path, data) -> None:
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def default_timings(script_path: Path) -> Path | None:
    p = script_path.parent / "voice.json"
    return p if p.exists() else None


def plan(script: dict) -> list:
    """Parse every beat's broll and pre-check AI prompts (a refused prompt stops the run before any work)."""
    specs = []
    for i, beat in enumerate(script.get("beats", [])):
        try:
            spec = parse_broll(beat.get("broll"))
            if spec.prompt:
                ai.check_subject(spec.prompt)
        except (SpecError, ai.PromptRefused) as e:
            raise SystemExit(f"beat {i}: broll refused: {e}")
        specs.append(spec)
    return specs


def credits_line(items: list[dict]) -> str:
    by: dict[str, list[str]] = {}
    for it in items:
        if it["kind"] == "stock":
            names = by.setdefault(it["source"].capitalize(), [])
            if it["author"] not in names:
                names.append(it["author"])
    parts = [f"{src} ({', '.join(n)})" for src, n in by.items()]
    if any(it["kind"] == "ai" for it in items):
        parts.append("AI-generated illustrations")
    return ("B-roll: " + "; ".join(parts)) if parts else ""


def labels(items: list[dict]) -> list[dict]:
    return [{"t0": it["t0"], "t1": it["t1"], "text": AI_LABEL} for it in items if it["kind"] == "ai"]


def cmd_fetch(a) -> int:
    script_path = Path(a.script).resolve()
    script = json.loads(script_path.read_text(encoding="utf-8"))
    out = Path(a.out).resolve()
    media_dir = out / "media"
    specs = plan(script)
    timings = Path(a.timings).resolve() if a.timings else default_timings(script_path)
    spans, total = load_timings(script, timings, a.duration)
    if not timings:
        log(f"no voice.json: splitting {total:.1f}s evenly over {len(spans)} beats (testing only)")
    sid = script.get("id") or script_path.parent.name

    provs = stock.providers()
    log("stock providers: " + (", ".join(p.name for p in provs) or "none (set PEXELS_API_KEY / PIXABAY_API_KEY)"))
    ai_on = a.ai if a.ai is not None else ai.enabled()
    log(f"AI stills: {'on (' + a.model + ')' if ai_on else 'off (CLIPPER_AI_BROLL=1 or --ai to enable)'}")
    gen = ai.Generator(a.model, a.steps, log=log) if ai_on else None

    used: set[str] = set()
    items = []
    for i, (spec, (t0, t1)) in enumerate(zip(specs, spans)):
        it = {"beat": i, "t0": round(t0, 3), "t1": round(t1, 3), "kind": "none", "media": None, "file": None,
              "credit": None, "source": None, "url": None, "width": None, "height": None, "duration": None}
        for prov in spec.order():
            if prov == "stock":
                if not provs:
                    continue
                c = stock.find(spec.query, t1 - t0 + 0.5, spec.media, provs, used, log=log)
                if not c:
                    continue
                try:
                    f = stock.download(c, media_dir, f"beat{i:02d}-{c.key}")
                except (stock.ProviderError, OSError) as e:
                    log(f"  beat {i}: download failed ({e})")
                    continue
                used.add(c.key)
                dur = track.probe_duration(f) if c.media == "video" else None
                it.update(kind="stock", media=c.media, file=str(f), credit=c.credit, source=c.provider,
                          url=c.page_url, author=c.author, author_url=c.author_url, width=c.width, height=c.height,
                          duration=round(dur or c.duration or 0, 2) or None, query=spec.query, seed=1000 + i)
                break
            if prov == "ai":
                if not gen:
                    continue
                prompt, negative = ai.build_prompt(spec.prompt)
                seed = spec.seed if spec.seed is not None else ai.seed_for(sid, i, spec.prompt)
                cfg = gen.cfg
                h = hashlib.sha256(f"{cfg.repo}|{gen.steps}|{cfg.width}x{cfg.height}|{prompt}|{seed}".encode()).hexdigest()[:10]
                f = media_dir / f"beat{i:02d}-ai-{h}.jpg"
                if f.exists():
                    log(f"  beat {i}: reusing {f.name}")
                    from PIL import Image

                    size = Image.open(f).size
                else:
                    try:
                        size = ai.finish(gen.generate(prompt, negative, seed), f)
                    except Exception as e:  # noqa: BLE001 - a failed AI still must not kill the night
                        log(f"  beat {i}: AI generation failed ({type(e).__name__}: {e})")
                        continue
                it.update(kind="ai", media="image", file=str(f), credit=AI_LABEL, source=cfg.name, url=None,
                          width=size[0], height=size[1], duration=None, prompt=spec.prompt, seed=seed,
                          model=cfg.repo, steps=gen.steps, label=AI_LABEL)
                break
        log(f"beat {i} [{t0:.1f}-{t1:.1f}s]: {it['kind']}" + (f" {Path(it['file']).name}" if it["file"] else
                                                              f" (wanted {spec.kind})" if spec.kind != "none" else ""))
        items.append(it)

    manifest = {"version": 1, "script": sid, "duration": round(total, 3), "fps": FPS, "size": [W, H],
                "timings": str(timings) if timings else None, "track": None, "items": items,
                "labels": labels(items), "credits": credits_line(items)}
    out.mkdir(parents=True, exist_ok=True)
    write_json(out / "broll.json", manifest)
    if not a.no_track:
        build_track(out, manifest, a.darken)
    print(out / "broll.json")
    return 0


def build_track(out: Path, manifest: dict, darken: float) -> None:
    t = time.time()
    items = manifest["items"]
    spans = [(it["t0"], it["t1"]) for it in items]
    mp4 = track.build(items, spans, manifest["duration"], out / "broll.mp4", out / ".segments", darken=darken, log=log)
    manifest["track"] = str(mp4)
    manifest["darken"] = darken
    write_json(out / "broll.json", manifest)
    log(f"track {mp4} ({manifest['duration']:.1f}s) built in {time.time() - t:.0f}s")


def cmd_track(a) -> int:
    out = Path(a.out).resolve()
    manifest = json.loads((out / "broll.json").read_text(encoding="utf-8"))
    build_track(out, manifest, a.darken)
    return 0


def cmd_check(a) -> int:
    script = json.loads(Path(a.script).read_text(encoding="utf-8"))
    specs = plan(script)
    provs = [p.name for p in stock.providers()]
    for i, s in enumerate(specs):
        what = s.query if s.kind == "stock" else s.prompt if s.kind == "ai" else ""
        log(f"beat {i}: {s.kind:<5} {what or ''}  -> try {s.order() or ['nothing']}")
    log(f"stock keys: {provs or 'none'}; AI: {'on' if ai.enabled() else 'off'}")
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="broll")
    sub = ap.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("fetch", help="resolve every beat's broll into media + manifest + background track")
    f.add_argument("--script", required=True)
    f.add_argument("--out", required=True)
    f.add_argument("--timings", help="voice.json with beats [{t0,t1}] (default: next to the script)")
    f.add_argument("--duration", type=float, help="total seconds when there is no voice.json (even split)")
    g = f.add_mutually_exclusive_group()
    g.add_argument("--ai", dest="ai", action="store_true", default=None, help="force AI stills on")
    g.add_argument("--no-ai", dest="ai", action="store_false", help="force AI stills off")
    f.add_argument("--model", default=ai.DEFAULT_MODEL, choices=sorted(ai.MODELS))
    f.add_argument("--steps", type=int)
    f.add_argument("--darken", type=float, default=0.5)
    f.add_argument("--no-track", action="store_true")
    t = sub.add_parser("track", help="rebuild broll.mp4 from an existing broll.json")
    t.add_argument("--out", required=True)
    t.add_argument("--darken", type=float, default=0.5)
    c = sub.add_parser("check", help="validate broll fields and AI prompts")
    c.add_argument("--script", required=True)
    a = ap.parse_args(argv)
    return {"fetch": cmd_fetch, "track": cmd_track, "check": cmd_check}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
