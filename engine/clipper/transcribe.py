"""transcribe: publisher transcript if the feed has a timed one, else faster-whisper (int8, CPU), chunked + resumable.

transcript.json:
{ "eid", "source": "whisper"|"publisher", "model", "maxMinutes", "duration", "complete",
  "segments": [ { "s", "e", "text", "words": [ { "w", "s", "e" } ] } ] }
Times in seconds, rounded to 0.01. Publisher transcripts carry `wordsApprox: true` (words spread across each cue).
"""

from __future__ import annotations

import os
import re
import time
from functools import lru_cache
from pathlib import Path

import numpy as np

from . import audio
from .common import Paths, hms, log, parse_hms, r2, read_json, write_json
from .discover import find_episode
from .feeds import http_get

CHUNK = 600.0  # seconds of audio per whisper call
CUT_SEARCH = 20.0  # look this far back from the chunk end for the quietest spot to cut


@lru_cache(maxsize=2)
def load_model(name: str):
    from faster_whisper import WhisperModel

    return WhisperModel(name, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)


def whisper_segments(samples: np.ndarray, model_name: str, offset: float = 0.0, *, beam_size: int = 1,
                     vad: bool = True, initial_prompt: str | None = None, strict: bool = True) -> list[dict]:
    """Run faster-whisper on a 16 kHz mono float32 array. Times are shifted by `offset`."""
    model = load_model(model_name)
    segs, _info = model.transcribe(
        samples,
        language="en",
        beam_size=beam_size,
        word_timestamps=True,
        vad_filter=vad,
        vad_parameters={"min_silence_duration_ms": 500} if vad else None,
        condition_on_previous_text=False,  # avoids runaway repetition loops on long audio
        initial_prompt=initial_prompt,
        **({} if strict else {"no_speech_threshold": None, "log_prob_threshold": None}),
    )
    out = []
    for s in segs:
        words = [
            {"w": w.word.strip(), "s": r2(w.start + offset), "e": r2(w.end + offset)}
            for w in (s.words or [])
            if w.word.strip()
        ]
        if not words:
            continue
        out.append({"s": words[0]["s"], "e": words[-1]["e"], "text": s.text.strip(), "words": words})
    return out


def _quiet_cut(buf: np.ndarray, chunk_end: float) -> float:
    """Index-time (seconds from buf start) of the quietest 50 ms frame in the last CUT_SEARCH s before chunk_end."""
    lo = max(0.0, chunk_end - CUT_SEARCH)
    seg = buf[int(lo * audio.SR): int(chunk_end * audio.SR)]
    if len(seg) < audio.SR:
        return chunk_end
    rms = audio.rms_frames(seg, audio.SR, 0.05)
    return lo + float(np.argmin(rms)) * 0.05 + 0.025


def transcribe_whisper(path: Path, model_name: str, max_seconds: float | None, partial_path: Path,
                       beam_size: int = 1) -> tuple[list[dict], float]:
    """Stream-decode the file and transcribe it in ~10-minute chunks cut at quiet points. Resumable."""
    total = audio.probe_duration(path)
    if max_seconds:
        total = min(total, max_seconds)
    partial = read_json(partial_path) or {}
    if partial.get("model") == model_name and partial.get("maxSeconds") == max_seconds:
        segments, pos = partial["segments"], float(partial["pos"])
        log(f"transcribe: resuming at {hms(pos)}")
    else:
        segments, pos = [], 0.0

    load_model(model_name)  # load (and download if needed) before timing
    t0 = time.time()
    done_at_start = pos
    buf = np.zeros(0, dtype=np.float32)
    buf_start = 0.0
    reader = audio.stream(path, block_seconds=60.0, max_seconds=max_seconds)
    eof = False
    while True:
        while not eof and buf_start + len(buf) / audio.SR < pos + CHUNK + 1.0:
            block = next(reader, None)
            if block is None:
                eof = True
            else:
                buf = np.concatenate([buf, block])
            drop = min(len(buf), int(round((pos - buf_start) * audio.SR)))
            if drop > 0:  # discard audio already transcribed (also skips ahead when resuming)
                buf = buf[drop:]
                buf_start += drop / audio.SR
        drop = min(len(buf), int(round((pos - buf_start) * audio.SR)))
        if drop > 0:
            buf = buf[drop:]
            buf_start += drop / audio.SR
        if len(buf) < audio.SR // 2:
            break
        avail = len(buf) / audio.SR
        cut = avail if (eof and avail <= CHUNK + 1.0) else _quiet_cut(buf, CHUNK)
        segments.extend(whisper_segments(buf[: int(cut * audio.SR)], model_name, offset=buf_start, beam_size=beam_size))
        pos = buf_start + cut
        write_json(partial_path, {"model": model_name, "maxSeconds": max_seconds, "pos": pos, "segments": segments}, None)
        elapsed = time.time() - t0
        speed = (pos - done_at_start) / elapsed if elapsed else 0.0
        eta = (total - pos) / speed if speed else 0.0
        log(f"transcribe: {hms(pos)} / {hms(total)} ({100 * pos / total:.0f}%), {speed:.1f}x realtime, eta {eta / 60:.1f} min")
        if eof and cut >= avail - 1e-3:
            break
    return segments, total


# ---------- publisher transcripts ----------

_CUE_TIME = re.compile(r"(\d+:)?\d{1,2}:\d{2}[.,]\d{1,3}")


def parse_timed_text(text: str) -> list[dict]:
    """Parse WebVTT or SRT into segments with approximate per-word timings."""
    segments = []
    for block in re.split(r"\n\s*\n", text.replace("\r\n", "\n")):
        lines = [l for l in block.strip().split("\n") if l.strip()]
        idx = next((i for i, l in enumerate(lines) if "-->" in l), None)
        if idx is None:
            continue
        times = _CUE_TIME.findall(lines[idx])
        parts = [p.strip().split(" ")[0] for p in lines[idx].split("-->")]
        if len(parts) < 2 or not times:
            continue
        s, e = parse_hms(parts[0]), parse_hms(parts[1])
        body = re.sub(r"<[^>]+>", "", " ".join(lines[idx + 1:])).strip()
        if body:
            segments.append(_segment_with_spread_words(s, e, body))
    return segments


def parse_json_transcript(data: dict) -> list[dict]:
    """Podcast Index JSON transcript: {"segments": [{"startTime", "endTime", "body"}]}."""
    segs = []
    for s in data.get("segments", []):
        body = (s.get("body") or "").strip()
        if body:
            segs.append(_segment_with_spread_words(float(s["startTime"]), float(s["endTime"]), body))
    return segs


def _segment_with_spread_words(s: float, e: float, body: str) -> dict:
    tokens = body.split()
    weights = [len(t) + 1 for t in tokens]
    total = sum(weights) or 1
    words, t = [], s
    for tok, w in zip(tokens, weights):
        d = (e - s) * w / total
        words.append({"w": tok, "s": r2(t), "e": r2(t + d)})
        t += d
    return {"s": r2(s), "e": r2(e), "text": body, "words": words}


def fetch_publisher_transcript(url: str, kind: str) -> list[dict]:
    raw = http_get(url, timeout=60).decode("utf-8", "replace")
    if "json" in (kind or "").lower():
        import json

        return parse_json_transcript(json.loads(raw))
    return parse_timed_text(raw)


# ---------- command ----------

def transcribe(paths: Paths, eid: str, model: str = "base.en", max_minutes: float | None = None,
               use_publisher: bool = True, force: bool = False, beam_size: int = 1) -> dict:
    ep_dir = paths.episode_dir(eid)
    audio_path = ep_dir / "audio.mp3"
    out_path = ep_dir / "transcript.json"
    meta = find_episode(paths, eid)
    cached = read_json(out_path)
    if cached and not force and _cache_ok(cached, model, max_minutes, use_publisher):
        log(f"transcribe: cached ({cached['source']}, {cached.get('model')}) {out_path}")
        return cached

    max_seconds = max_minutes * 60 if max_minutes else None
    t0 = time.time()
    if use_publisher and meta.get("transcriptUrl"):
        try:
            segments = fetch_publisher_transcript(meta["transcriptUrl"], meta.get("transcriptType", ""))
            if max_seconds:
                segments = [s for s in segments if s["s"] < max_seconds]
            if segments:
                duration = audio.probe_duration(audio_path) if audio_path.exists() else segments[-1]["e"]
                result = _result(eid, "publisher", None, max_minutes, duration, segments, wordsApprox=True)
                write_json(out_path, result, None)
                log(f"transcribe: publisher transcript, {len(segments)} cues ({time.time() - t0:.1f}s)")
                return result
        except Exception as e:  # noqa: BLE001 - fall back to whisper
            log(f"transcribe: publisher transcript failed ({e}); using whisper")

    if not audio_path.exists():
        raise SystemExit(f"no audio for {eid}: run `fetch {eid}` first")
    partial = ep_dir / "transcript.partial.json"
    segments, duration = transcribe_whisper(audio_path, model, max_seconds, partial, beam_size=beam_size)
    result = _result(eid, "whisper", model, max_minutes, duration, segments)
    write_json(out_path, result, None)
    partial.unlink(missing_ok=True)
    words = sum(len(s["words"]) for s in segments)
    log(f"transcribe: {len(segments)} segments, {words} words in {time.time() - t0:.0f}s -> {out_path}")
    return result


def _result(eid, source, model, max_minutes, duration, segments, **extra) -> dict:
    return {
        "eid": eid, "source": source, "model": model, "maxMinutes": max_minutes,
        "duration": r2(duration), "complete": max_minutes is None, **extra, "segments": segments,
    }


def _cache_ok(cached: dict, model: str, max_minutes: float | None, use_publisher: bool) -> bool:
    if cached.get("source") == "publisher":
        return use_publisher
    if cached.get("model") != model:
        return False
    have = cached.get("maxMinutes")
    return have is None or (max_minutes is not None and have >= max_minutes)
