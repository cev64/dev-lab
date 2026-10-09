"""scout: turn a transcript into an LLM-readable map (scout.md) plus the top AI-dense windows (windows.json)."""

from __future__ import annotations

import time

import numpy as np

from . import audio, ledger
from .common import Paths, hms, log, read_json, write_json
from .discover import find_episode
from .keywords import ad_hits, ai_hits, ai_score, matched_phrases

PARA_MIN, PARA_MAX = 25.0, 40.0
WINDOW, STEP, TOP_N = 75.0, 10.0, 10
TOKEN_BUDGET = 60_000
AD_PENALTY = 8.0  # per ad phrase inside a window
RMS_HOP = 0.5


def paragraphs(segments: list[dict]) -> list[dict]:
    """Group segments into ~30 s paragraphs, preferring to break after a sentence end."""
    out, cur = [], []
    for seg in segments:
        cur.append(seg)
        dur = cur[-1]["e"] - cur[0]["s"]
        ends_sentence = seg["text"].rstrip().endswith((".", "?", "!"))
        if dur >= PARA_MAX or (dur >= PARA_MIN and ends_sentence):
            out.append(_para(cur))
            cur = []
    if cur:
        out.append(_para(cur))
    return out


def _para(segs: list[dict]) -> dict:
    text = " ".join(s["text"].strip() for s in segs)
    return {"s": segs[0]["s"], "e": segs[-1]["e"], "text": text, "ai": ai_hits(text), "ad": ad_hits(text) > 0}


def energy_levels(paras: list[dict], rms: np.ndarray, hop: float = RMS_HOP) -> None:
    """Annotate paragraphs with energy ratio vs the median paragraph, and a low/mid/high label."""
    vals = []
    for p in paras:
        frames = rms[int(p["s"] / hop): max(int(p["s"] / hop) + 1, int(p["e"] / hop))]
        vals.append(float(np.sqrt(np.mean(frames.astype(np.float64) ** 2))) if len(frames) else 0.0)
    med = float(np.median([v for v in vals if v > 0])) if any(vals) else 1.0
    for p, v in zip(paras, vals):
        ratio = v / med if med else 1.0
        p["energyRatio"] = round(ratio, 2)
        p["energy"] = "high" if ratio >= 1.2 else "low" if ratio <= 0.8 else "mid"


def top_windows(segments: list[dict], rms: np.ndarray, used: list[dict], hop: float = RMS_HOP) -> list[dict]:
    """Slide a 75 s window in 10 s steps, score AI density (+ a small energy bonus), keep the best non-overlapping."""
    if not segments:
        return []
    end_t = segments[-1]["e"]
    med = float(np.median(rms[rms > 0])) if np.any(rms > 0) else 1.0
    cands = []
    t = segments[0]["s"]
    while t < end_t - 30:
        w_end = min(t + WINDOW, end_t)
        text = " ".join(s["text"] for s in segments if t <= (s["s"] + s["e"]) / 2 < w_end)
        ads = ad_hits(text)
        score = ai_score(text) - AD_PENALTY * ads
        if score > 0:
            frames = rms[int(t / hop): int(w_end / hop)]
            ratio = float(np.sqrt(np.mean(frames.astype(np.float64) ** 2))) / med if len(frames) and med else 1.0
            score += 2.0 * max(0.0, ratio - 1.0)
            cands.append({"start": round(t, 2), "end": round(w_end, 2), "score": round(score, 2), "ai": ai_hits(text),
                          "energyRatio": round(ratio, 2), "ad": ads > 0, "keywords": matched_phrases(text)[:6], "text": text})
        t += STEP
    cands.sort(key=lambda c: -c["score"])
    chosen: list[dict] = []
    for c in cands:
        if any(ledger.ranges_overlap(c["start"], c["end"], o["start"], o["end"]) for o in chosen):
            continue
        c["used"] = any(ledger.ranges_overlap(c["start"], c["end"], u["start"], u["end"]) for u in used)
        chosen.append(c)
        if len(chosen) >= TOP_N:
            break
    for i, c in enumerate(chosen, 1):
        c["rank"] = i
    return chosen


def _summary(text: str, words: int) -> str:
    toks = text.split()
    return " ".join(toks[:words]) + (" ..." if len(toks) > words else "")


def render_md(meta: dict, transcript: dict, paras: list[dict], windows: list[dict]) -> str:
    def in_window(p):
        return next((w["rank"] for w in windows if ledger.ranges_overlap(p["s"], p["e"], w["start"], w["end"])), None)

    near = set()  # paragraphs inside or adjacent to a top window keep full text when compacting
    for i, p in enumerate(paras):
        if in_window(p):
            near.update({i - 1, i, i + 1})

    src = transcript["source"] + (f" {transcript['model']}" if transcript.get("model") else "")
    covered = f"first {transcript['maxMinutes']:g} min" if transcript.get("maxMinutes") else "full episode"
    head = [
        f"# Scout: {meta.get('show', '')} - {meta.get('title', '')}",
        "",
        f"eid `{meta['eid']}` | audio {hms(meta.get('audioDuration') or transcript['duration'])} | transcript: {src} "
        f"({covered}) | {len(paras)} paragraphs | link {meta.get('link', '')}",
        "",
        "Tags: `ai:N` = strong AI keyword hits; `energy` = loudness vs this episode's median (low/mid/high); "
        "`ad?` = sounds like an ad read (skip); `W3` = inside top window 3. Times are source-episode seconds; selections use them directly.",
        "",
        "## Top AI windows (75 s, best first; `make` snaps to sentence/pause boundaries and keeps 58-80 s)",
        "",
    ]
    for w in windows:
        flag = (" ALREADY USED" if w.get("used") else "") + (" ad?" if w.get("ad") else "")
        head.append(f"{w['rank']}. [{hms(w['start'])}-{hms(w['end'])}] ({w['start']:.0f}-{w['end']:.0f}s) "
                    f"score {w['score']:g} ai:{w['ai']} energy x{w['energyRatio']}{flag} | "
                    f"{', '.join(w['keywords'])} | \"{_summary(w['text'], 18)}\"")
    if not windows:
        head.append("(no AI keyword hits in the transcribed part)")
    head += ["", "## Transcript", ""]

    def body(mode: int) -> list[str]:
        lines = []
        for i, p in enumerate(paras):
            w = in_window(p)
            tag = f"{{ai:{p['ai']} energy:{p['energy']}{' ad?' if p['ad'] else ''}{f' W{w}' if w else ''}}}"
            text = p["text"]
            if mode >= 1 and i not in near and p["ai"] == 0:
                text = "(summary) " + _summary(text, 15)
            if mode >= 2 and i not in near:
                text = "(summary) " + _summary(p["text"], 10)
            if mode >= 3 and i not in near:
                text = _summary(p["text"], 5)
            lines.append(f"[{hms(p['s'])}] {tag} {text}")
        return lines

    for mode in range(4):
        md = "\n".join(head + body(mode)) + "\n"
        if len(md) / 4 <= TOKEN_BUDGET:
            break
    return md


def scout(paths: Paths, eid: str) -> dict:
    t0 = time.time()
    ep_dir = paths.episode_dir(eid)
    transcript = read_json(ep_dir / "transcript.json")
    if not transcript:
        raise SystemExit(f"no transcript for {eid}: run `transcribe {eid}` first")
    meta = find_episode(paths, eid)
    meta.setdefault("eid", eid)

    rms_path = ep_dir / "rms.npy"
    max_s = transcript["maxMinutes"] * 60 if transcript.get("maxMinutes") else None
    need = transcript["segments"][-1]["e"] - 1 if transcript["segments"] else 0.0
    rms = np.load(rms_path) if rms_path.exists() else None
    if rms is None or len(rms) * RMS_HOP < need:  # cache covers less than the transcript: recompute
        rms = audio.episode_rms(ep_dir / "audio.mp3", hop=RMS_HOP, max_seconds=max_s)
        np.save(rms_path, rms)

    paras = paragraphs(transcript["segments"])
    energy_levels(paras, rms)
    used = (ledger.load(paths.ledger)["episodes"].get(eid) or {}).get("clips", [])
    windows = top_windows(transcript["segments"], rms, used)
    md = render_md(meta, transcript, paras, windows)
    (ep_dir / "scout.md").write_text(md, encoding="utf-8")
    write_json(ep_dir / "windows.json", {"eid": eid, "window": WINDOW, "windows": windows})
    log(f"scout: {len(paras)} paragraphs, {len(windows)} windows, ~{len(md) // 4} tokens -> {ep_dir / 'scout.md'} "
        f"({time.time() - t0:.1f}s)")
    return {"paragraphs": len(paras), "windows": windows, "tokens": len(md) // 4}
