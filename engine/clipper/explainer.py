"""explainer: script.json -> narrated, illustrated MP4 (the original-content track).

Steps: voice (TTS + timings, via `python -m clipper voice` if voice.json is missing) -> optional B-roll background
(work/explainers/<id>/broll/broll.mp4 + broll.json from `python -m broll fetch`) -> clip.json for the ai-explainer
template -> render -> delivery note (with sources) + ledger "explainers" entry.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from . import audio, ledger
from .common import FPS, Paths, log, read_json, today_et, write_json
from .make import STYLES, render_clip, theme_seed
from .package import hashtags

REPEAT_DAYS = 7  # no-repeat window for stories (skill section 1); a script with "followUp": true may revisit one
MIN_NARRATION = 58.0  # contract floor; the skill asks for >= 62 s so TikTok's one-minute rule is met


def explainer_dir(paths: Paths, eid: str) -> Path:
    return paths.work / "explainers" / eid


def load_script(path: Path) -> dict:
    script = json.loads(path.read_text(encoding="utf-8"))
    missing = [k for k in ("id", "hook", "beats", "sources", "post") if not script.get(k)]
    if missing:
        raise ValueError(f"script missing {missing}")
    if len(script["sources"]) < 2:
        raise ValueError("script needs >= 2 sources (fact-checking rule)")
    for i, b in enumerate(script["beats"]):
        if not b.get("say") or not (b.get("visual") or {}).get("type"):
            raise ValueError(f"beat {i} needs 'say' and 'visual.type'")
    return script


def check_repeat(script: dict, explainers: list[dict], date: str, days: int = REPEAT_DAYS) -> None:
    """Refuse a script that retells a story we published in the last `days` days (shares a source URL with it),
    unless the script says it is a follow-up on a new development ("followUp": true)."""
    if script.get("followUp"):
        return
    from datetime import date as _d
    urls = {s.get("url") for s in script["sources"]} - {None, ""}
    for e in explainers:
        if e["id"] == script["id"] or not e.get("date"):
            continue
        age = (_d.fromisoformat(date) - _d.fromisoformat(e["date"])).days
        if 0 <= age <= days and urls & set(e.get("sources", [])):
            raise SystemExit(f"repeat: {script['id']} shares sources with {e['id']} ({e['date']}); pick another "
                             'story, or set "followUp": true if there is a genuinely new development')


def drive_card(script: dict, clip: dict, date: str) -> tuple[str, str]:
    """Title + text of the small Google Doc the nightly run files in Charlie's Drive folder (config/drive.json):
    one per explainer, named by topic, so the archive is searchable and repeats are easy to spot."""
    post = script["post"]
    title = f"{date} · {(post.get('title') or script['hook']).strip()}"
    lines = [title, "", f"Hook: {script['hook']}", f"Topic: {script.get('topic', '')}",
             f"Length: {clip['duration']:.1f} s", f"Explainer id: {script['id']}",
             f"Video: GitHub cev64/dev-lab, branch videos/{date}, file {script['id']}.mp4", "",
             "Post text:", post.get("caption", "").strip(), hashtags(post.get("hashtags", [])), "", "Sources:"]
    lines += [f"- {s.get('publisher', '')}: {s.get('title', '')} {s.get('url', '')}".rstrip() for s in script["sources"]]
    lines += ["", "Narration:"] + [b["say"] for b in script["beats"]]
    return title, "\n".join(lines) + "\n"


def ensure_voice(script_path: Path, vdir: Path) -> dict:
    voice = read_json(vdir / "voice.json")
    if voice and (vdir / "voice.wav").exists():
        return voice
    log("explainer: no voice yet; running `clipper voice`")
    subprocess.run([sys.executable, "-m", "clipper", "voice", "--script", str(script_path)], check=True,
                   cwd=Path(__file__).resolve().parents[1])
    voice = read_json(vdir / "voice.json")
    if not voice:
        raise RuntimeError("voice step produced no voice.json")
    return voice


SHARED_SCENES = Path(__file__).resolve().parents[1] / "render" / "templates" / "ai-explainer"


def resolve_visual(visual: dict, vdir: Path) -> dict:
    """Scene modules may be given as 'scenes/x.js': look in the story folder first (work/explainers/<id>/), then the
    shared library (engine/render/templates/ai-explainer/), and pass the renderer an absolute path."""
    if visual.get("type") != "scene" or not visual.get("module"):
        return visual
    mod = Path(visual["module"])
    if mod.is_absolute():
        return visual
    for base in (vdir, SHARED_SCENES):
        if (base / mod).exists():
            return {**visual, "module": str((base / mod).resolve())}
    raise FileNotFoundError(f"scene module {mod} not found in {vdir} or {SHARED_SCENES}")


def build_clip(script: dict, voice: dict, vdir: Path, date: str, broll_dir: Path | None) -> dict:
    wav = vdir / "voice.wav"
    duration = float(voice.get("duration") or audio.probe_duration(wav))
    if duration < MIN_NARRATION:
        raise ValueError(f"narration is {duration:.1f}s; needs >= {MIN_NARRATION}s (add words to the script)")
    samples = audio.decode(wav, sr=audio.SR)
    labels: dict[int, str] = {}
    background = None
    if broll_dir and (broll_dir / "broll.mp4").exists():
        background = {"video": str((broll_dir / "broll.mp4").resolve())}
        for m in read_json(broll_dir / "broll.json") or []:
            if m.get("kind") == "ai":
                labels[int(m["beat"])] = "AI-generated illustration"
    vbeats = voice.get("beats") or []
    beats = []
    for i, b in enumerate(script["beats"]):
        t = vbeats[i] if i < len(vbeats) else {"t0": duration * i / len(script["beats"]),
                                               "t1": duration * (i + 1) / len(script["beats"])}
        beat = {"t0": float(t["t0"]), "t1": float(t["t1"]), "visual": resolve_visual(b["visual"], vdir)}
        if i in labels:
            beat["label"] = labels[i]
        beats.append(beat)
    style = script.get("style") or STYLES[theme_seed(script["id"]) % len(STYLES)]
    clip = {
        "id": script["id"],
        "template": "ai-explainer",
        "fps": FPS,
        "duration": round(duration, 2),
        "audio": str(wav.resolve()),
        "envelope": audio.compute_envelope(samples, audio.SR, duration, FPS),
        "words": voice["words"],
        "hook": script["hook"],
        "topic": script.get("topic", ""),
        "emphasis": script.get("emphasis", []),
        "credit": {},  # owner: nothing at the bottom of explainers; AI-narrator disclosure is in the caption + platform label
        "theme": {"seed": theme_seed(script["id"]), "style": style},
        "beats": beats,
        "source": {"kind": "explainer", "date": date, "sources": script["sources"]},
    }
    if background:
        clip["background"] = background
    return clip


def delivery_block(script: dict, clip: dict, video_rel: str | None, stock_credits: list[str]) -> str:
    post = script["post"]
    caption = post.get("caption", "").strip()
    tags = hashtags(post.get("hashtags", []))
    lines = [
        f"## Explainer: {post.get('title') or script['hook']}",
        "",
        f"**Hook:** {script['hook']}  ",
        f"**Video:** `{video_rel}` ({clip['duration']:.1f} s)" if video_rel else "**Video:** not rendered",
        "",
        "Post text (paste as is). Switch ON the platform's AI-generated content label for this one.",
        "",
        "```",
        caption + ("\n\n" + tags if tags else ""),
        "```",
        "",
        "Sources:",
    ]
    lines += [f"- {s.get('publisher', '')}: {s.get('title', '')} {s.get('url', '')}".rstrip() for s in script["sources"]]
    if stock_credits:
        lines += ["", "Stock footage: " + "; ".join(stock_credits)]
    lines += ["", f"- Explainer id: `{script['id']}`", ""]
    return "\n".join(lines) + "\n"


def explainer(paths: Paths, script_path: Path, date: str | None = None, render: bool = True) -> dict:
    date = date or today_et()
    script = load_script(script_path)
    eid = script["id"]
    check_repeat(script, (ledger.load(paths.ledger) or {}).get("explainers", []), date)
    vdir = explainer_dir(paths, eid)
    vdir.mkdir(parents=True, exist_ok=True)
    voice = ensure_voice(script_path, vdir)
    broll_dir = vdir / "broll"
    clip = build_clip(script, voice, vdir, date, broll_dir if broll_dir.exists() else None)
    clip_path = vdir / "clip.json"
    write_json(clip_path, clip)
    log(f"explainer: {eid} {clip['duration']:.1f}s, {len(clip['beats'])} beats, style {clip['theme']['style']}"
        + (", video background" if clip.get("background") else ""))

    video = None
    if render:
        out = paths.root / "out" / date / f"{eid}.mp4"
        video = render_clip(paths, clip_path, out)
        title, text = drive_card(script, clip, date)
        write_json(out.with_suffix(".drive.json"), {"title": title, "text": text})

    stock = sorted({m["credit"] for m in (read_json(broll_dir / "broll.json") or [])
                    if m.get("kind") == "stock" and m.get("credit")})
    video_rel = str(video.relative_to(paths.root)) if video else None
    dpath = paths.root / "deliveries" / f"{date}.md"
    dpath.parent.mkdir(parents=True, exist_ok=True)
    existing = dpath.read_text(encoding="utf-8") if dpath.exists() else f"# Deliveries {date}\n\n"
    block = delivery_block(script, clip, video_rel, stock)
    if f"`{eid}`" in existing:  # re-run: replace this explainer's block, keep everything else
        parts = re.split(r"(?=^## )", existing, flags=re.M)
        existing = "".join(block if f"`{eid}`" in part else part for part in parts)
        dpath.write_text(existing, encoding="utf-8")
    else:
        dpath.write_text(existing + block, encoding="utf-8")
    if video:
        data = ledger.load(paths.ledger)
        exp = data.setdefault("explainers", [])
        if not any(e["id"] == eid for e in exp):
            exp.append({"id": eid, "date": date, "hook": script["hook"], "topic": script.get("topic", ""),
                        "title": script["post"].get("title", ""), "followUp": bool(script.get("followUp")),
                        "sources": [s.get("url", "") for s in script["sources"]], "video": video_rel})
            ledger.save(paths.ledger, data)
    return {"id": eid, "video": video_rel, "duration": clip["duration"]}
