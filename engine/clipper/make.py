"""make: for each selection, refine -> cut + loudnorm -> re-transcribe (small.en) -> clip.json -> render -> package."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import time
from pathlib import Path

from . import audio, boundaries, ledger
from .common import FPS, Paths, hms, log, r2, read_json, slugify, today_et, write_json
from .discover import find_episode
from .keywords import matched_phrases
from .package import package, source_for
from .transcribe import whisper_segments

CLIP_MODEL = "small.en"
REQUIRED = ("eid", "start", "end", "hook")
VOCAB = ("AI, AGI, OpenAI, ChatGPT, Anthropic, Claude, Dario Amodei, Sam Altman, Demis Hassabis, Gemini, DeepMind, "
         "Nvidia, Jensen Huang, xAI, Grok, LLM.")
# Whisper often lower-cases brand names mid-sentence; captions should not.
PROPER = {k.lower(): k for k in ("Anthropic", "OpenAI", "ChatGPT", "Claude", "Gemini", "DeepMind", "Nvidia", "Grok",
                                  "xAI", "AGI", "LLM", "LLMs", "Altman", "Amodei", "Hassabis", "Copilot", "Perplexity")}


def clip_id(date: str, eid: str, sel: dict) -> str:
    if sel.get("id"):
        return slugify(sel["id"], 80)
    return f"{date}-{eid}-{slugify(sel.get('topic') or sel.get('title') or sel['hook'], 30)}"


STYLES = ["neural", "flow", "horizon", "orb"]  # engine/render/templates/ai-shorts styles


def theme_seed(cid: str) -> int:
    return int(hashlib.sha256(cid.encode()).hexdigest()[:8], 16) % 100000


def episode_label(title: str) -> str:
    """Short episode label for the on-screen credit, e.g. '#2392 - Jensen Huang'."""
    return re.sub(r"\s+", " ", title).strip()[:90]


def fix_case(word: str) -> str:
    """'anthropic's' -> 'Anthropic's'; punctuation and possessives kept."""
    m = re.match(r"^([^\w]*)(\w+)(.*)$", word)
    if not m or m.group(2).lower() not in PROPER:
        return word
    return m.group(1) + PROPER[m.group(2).lower()] + m.group(3)


def tidy_words(segments: list[dict], duration: float) -> list[dict]:
    """Flatten whisper words, clamp to [0, duration], keep them monotonic (renderer assumes sorted, non-negative)."""
    out, last = [], 0.0
    for seg in segments:
        for w in seg["words"]:
            s = min(max(w["s"], last), duration)
            e = min(max(w["e"], s), duration)
            out.append({"w": fix_case(w["w"]), "s": r2(s), "e": r2(e)})
            last = s
    return out


MIN_AGREEMENT = 0.6


def word_agreement(expected: list[dict], got: list[dict]) -> float:
    """Share of the expected (episode transcript) word tokens found in the clip's own transcription. Guards against
    cutting the wrong audio, e.g. publisher transcripts offset by dynamically inserted ads."""
    def toks(ws):
        out: dict[str, int] = {}
        for w in ws:
            t = re.sub(r"[^a-z0-9]", "", w["w"].lower())
            if t:
                out[t] = out.get(t, 0) + 1
        return out
    exp, have = toks(expected), toks(got)
    total = sum(exp.values())
    if total == 0:
        return 1.0
    return sum(min(n, have.get(t, 0)) for t, n in exp.items()) / total


def polish_words(words: list[dict]) -> list[dict]:
    """Caption cosmetics: re-join numbers whisper splits ("100" ",000" -> "100,000"; "3" ".5" -> "3.5") and capitalise
    the clip's first word (clips often start mid-paragraph)."""
    out: list[dict] = []
    for w in words:
        if out and re.match(r"^[,.]\d", w["w"]) and re.search(r"\d$", out[-1]["w"]):
            out[-1] = {**out[-1], "w": out[-1]["w"] + w["w"], "e": w["e"]}
            continue
        out.append(dict(w))
    if out:
        m = re.match(r"^([^\w]*)(\w)(.*)$", out[0]["w"])
        if m:
            out[0]["w"] = m.group(1) + m.group(2).upper() + m.group(3)
    return out


def apply_fixes(words: list[dict], fixes: dict[str, str]) -> list[dict]:
    """Caption corrections from the selection, e.g. {"Aortman": "Altman"}: whole-word, case-insensitive, punctuation
    kept. Only for transcription errors (names, jargon) — never to change what the speaker said."""
    if not fixes:
        return words
    table = {k.lower(): v for k, v in fixes.items()}
    out = []
    for w in words:
        m = re.match(r"^([^\w]*)([\w'.-]+?)([^\w]*)$", w["w"])
        if m and m.group(2).lower() in table:
            w = {**w, "w": m.group(1) + table[m.group(2).lower()] + m.group(3)}
        out.append(w)
    return out


def coverage_problem(words: list[dict], duration: float, max_gap: float = 6.0) -> str | None:
    """Whisper sometimes silently drops a stretch of speech. Detect long holes in the word timeline."""
    if not words:
        return "no words"
    edges = [0.0] + [x for w in words for x in (w["s"], w["e"])] + [duration]
    holes = [(edges[i], edges[i + 1]) for i in range(0, len(edges) - 1, 2) if edges[i + 1] - edges[i] > max_gap]
    return f"gap {holes[0][0]:.1f}-{holes[0][1]:.1f}s" if holes else None


def clip_words(paths: Paths, eid: str, samples, duration: float, start: float, prompt: str) -> tuple[list[dict], str]:
    """small.en word timings for the clip; retry without skip thresholds, then fall back to episode words."""
    segs = whisper_segments(samples, CLIP_MODEL, beam_size=5, vad=False, initial_prompt=prompt)
    words = tidy_words(segs, duration)
    problem = coverage_problem(words, duration)
    if not problem:
        return words, CLIP_MODEL
    log(f"make: small.en transcript has a {problem}; retrying with no-speech skipping disabled")
    segs = whisper_segments(samples, CLIP_MODEL, beam_size=5, vad=True, initial_prompt=prompt, strict=False)
    retry = tidy_words(segs, duration)
    if not coverage_problem(retry, duration):
        return retry, CLIP_MODEL + " (retry)"
    transcript = read_json(paths.episode_dir(eid) / "transcript.json") or {"segments": []}
    ep_words = [{"w": w["w"], "s": w["s"] - start, "e": w["e"] - start}
                for seg in transcript["segments"] for w in seg["words"] if start <= w["s"] < start + duration]
    fallback = tidy_words([{"words": ep_words}], duration)
    log(f"make: WARNING still {coverage_problem(retry, duration)}; using episode transcript words ({len(fallback)})")
    return fallback, "episode transcript (fallback)"


def pick_emphasis(sel: dict, words: list[dict]) -> list[str]:
    if sel.get("emphasis"):
        return list(sel["emphasis"])
    text = " ".join(w["w"] for w in words)
    seen, out = set(), []
    for p in matched_phrases(text):
        if p.lower() not in seen:
            seen.add(p.lower())
            out.append(p)
    return out[:5]


def refine(paths: Paths, eid: str, start: float, end: float, exact: bool = True) -> tuple[float, float, dict]:
    transcript = read_json(paths.episode_dir(eid) / "transcript.json") or {"segments": []}
    lo, hi = start - boundaries.SEARCH - 2, start + boundaries.MAX_LEN + boundaries.SEARCH + 2
    words = [w for seg in transcript["segments"] for w in seg["words"] if lo <= w["s"] <= hi]
    t_origin = max(0.0, lo)
    hop = 0.02
    samples = audio.decode(paths.episode_dir(eid) / "audio.mp3", start=t_origin, duration=hi - t_origin)
    quiet = boundaries.quiet_from_rms(audio.rms_frames(samples, audio.SR, hop), t_origin, hop)
    return boundaries.snap(words, start, end, quiet, exact=exact)


def make_one(paths: Paths, sel: dict, date: str, *, render: bool = True, do_package: bool = True,
             force_package: bool = False) -> dict:
    missing = [k for k in REQUIRED if k not in sel]
    if missing:
        raise ValueError(f"selection missing {missing}: {sel}")
    timings: dict[str, float] = {}
    t = time.time()
    eid = sel["eid"]
    meta = find_episode(paths, eid)
    meta.setdefault("eid", eid)
    led = ledger.load(paths.ledger)
    hit = ledger.find_overlap(led, eid, float(sel["start"]), float(sel["end"]))
    if hit:
        raise ValueError(f"{eid} {hms(sel['start'])}-{hms(sel['end'])} overlaps used clip {hit['id']}")

    start, end, info = refine(paths, eid, float(sel["start"]), float(sel["end"]), exact=not sel.get("rough"))
    hit = ledger.find_overlap(led, eid, start, end)
    if hit:
        raise ValueError(f"refined range overlaps used clip {hit['id']}")
    timings["refine"] = time.time() - t
    log(f"make: {eid} {hms(start)}-{hms(end)} ({end - start:.1f}s) via {info['method']}: "
        f"'{info.get('firstWord')}' ... '{info.get('lastWord')}'")

    cid = clip_id(date, eid, sel)
    cdir = paths.clip_dir(cid)
    wav = cdir / "audio.wav"
    t = time.time()
    loud = audio.extract_normalized(paths.episode_dir(eid) / "audio.mp3", wav, start, end)
    timings["cut+loudnorm"] = time.time() - t

    t = time.time()
    samples = audio.decode(wav, sr=audio.SR)
    duration = r2(audio.probe_duration(wav))
    prompt = f"{meta.get('show', '')}. {meta.get('title', '')}. {VOCAB}"
    words, words_note = clip_words(paths, eid, samples, duration, start, prompt)
    if "fallback" in words_note:
        raise ValueError("the clip's audio could not be transcribed, so its captions can't be verified against the "
                         "episode transcript; check the audio or pick another moment")
    ep_words = [w for seg in read_json(paths.episode_dir(eid) / "transcript.json")["segments"] for w in seg["words"]
                if start <= w["s"] < end]
    agree = word_agreement(ep_words, words)
    if agree < MIN_AGREEMENT:
        raise ValueError(f"alignment check failed: only {agree:.0%} of the selected transcript words are in the cut "
                         f"audio (episode transcript timings don't match this audio file; re-transcribe with whisper)")
    words = polish_words(apply_fixes(words, sel.get("fixes") or {}))
    timings["retranscribe"] = time.time() - t

    t = time.time()
    src_cfg = source_for(paths, meta.get("showSlug"), meta.get("show", ""))
    clip = {
        "id": cid,
        "fps": FPS,
        "duration": duration,
        "audio": str(wav.resolve()),
        "envelope": audio.compute_envelope(samples, audio.SR, duration, FPS),
        "words": words,
        "hook": sel["hook"],
        "topic": sel.get("topic", ""),
        "credit": {
            "show": meta.get("show", ""),
            "episode": episode_label(meta.get("title", "")),
            "speakers": sel.get("speakers") or src_cfg.get("hosts", ""),
        },
        "theme": {"seed": theme_seed(cid), "style": sel.get("style", "auto")},
        "emphasis": pick_emphasis(sel, words),
        "source": {  # provenance; the renderer ignores this
            "eid": eid, "start": start, "end": end, "requested": [sel["start"], sel["end"]], "refine": info,
            "link": meta.get("link", ""), "words": words_note, "loudness": {k: loud["pass2"].get(k) for k in ("output_i", "output_tp")},
        },
    }
    write_json(cdir / "clip.json", clip)
    write_json(cdir / "selection.json", sel)
    timings["clip.json"] = time.time() - t
    log(f"make: {len(words)} words, {len(clip['envelope'])} envelope frames, "
        f"{loud['pass2'].get('output_i')} LUFS / {loud['pass2'].get('output_tp')} dBTP -> {cdir / 'clip.json'}")

    video = None
    if render:
        t = time.time()
        video = render_clip(paths, cdir / "clip.json", paths.out_dir(date) / f"{cid}.mp4")
        timings["render"] = time.time() - t
    if do_package and (video or force_package):
        package(paths, date=date, clip=clip, sel=sel, meta=meta, video=video)
    elif do_package:
        log("make: not packaged (no video). Re-run `make` after the renderer works, or pass --force-package.")
    return {"id": cid, "clip": str(cdir / "clip.json"), "video": str(video) if video else None,
            "duration": duration, "timings": {k: round(v, 1) for k, v in timings.items()}}


def render_clip(paths: Paths, clip_json: Path, out: Path) -> Path | None:
    if not paths.renderer.exists():
        log(f"make: render skipped: {paths.renderer.relative_to(paths.root)} not found (clip.json is ready)")
        return None
    if not shutil.which("node"):
        log("make: render skipped: node not installed")
        return None
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["node", str(paths.renderer), "--clip", str(clip_json), "--out", str(out)]
    log("make: " + " ".join(cmd))
    proc = subprocess.run(cmd, cwd=paths.renderer.parent)
    if proc.returncode != 0 or not out.exists():
        log(f"make: render FAILED (exit {proc.returncode}); clip.json kept at {clip_json}")
        return None
    cover = out.with_name(out.stem + ".cover.png")
    if not cover.exists():  # the renderer normally writes its own cover; otherwise grab a frame while the hook is big
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-ss", "1.0", "-i", str(out), "-frames:v", "1", "-y",
                        str(cover)], check=False)
    return out


def make(paths: Paths, selections_file: Path, date: str | None = None, **kw) -> list[dict]:
    sels = json.loads(Path(selections_file).read_text(encoding="utf-8"))
    if isinstance(sels, dict):
        sels = [sels]
    date = date or today_et()
    results = []
    # Give each clip of the night a different visual style (an explicit "style" in a selection wins).
    for i, sel in enumerate(sels):
        sel.setdefault("style", STYLES[(theme_seed(date) + i) % len(STYLES)])
    for sel in sels:
        try:
            results.append(make_one(paths, sel, date, **kw))
        except Exception as e:  # noqa: BLE001 - one bad selection must not sink the rest
            log(f"make: FAILED {sel.get('eid')} {sel.get('start')}-{sel.get('end')}: {e}")
            results.append({"error": str(e), "selection": sel})
    print(json.dumps(results, indent=2))
    return results
