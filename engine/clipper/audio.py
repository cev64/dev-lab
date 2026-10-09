"""ffmpeg/ffprobe helpers. Audio is decoded by ffmpeg into numpy (faster-whisper's PyAV path is broken here)."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Iterator

import numpy as np

SR = 16000  # whisper / analysis sample rate


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(json.loads(out)["format"]["duration"])


def _decode_cmd(path: Path, sr: int, start: float | None = None, duration: float | None = None) -> list[str]:
    # Output-side -ss (after -i) is sample-accurate and matches a full sequential decode, which keeps clip
    # timestamps consistent with the transcript. It costs a fast decode-and-discard up to `start`.
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", str(path)]
    if start:
        cmd += ["-ss", f"{start:.3f}"]
    if duration is not None:
        cmd += ["-t", f"{duration:.3f}"]
    return cmd + ["-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"]


def decode(path: Path, sr: int = SR, start: float | None = None, duration: float | None = None) -> np.ndarray:
    """Decode (a range of) a file to mono float32 at `sr`."""
    raw = subprocess.run(_decode_cmd(path, sr, start, duration), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def stream(path: Path, block_seconds: float = 60.0, sr: int = SR, max_seconds: float | None = None) -> Iterator[np.ndarray]:
    """Yield consecutive mono float32 blocks so a 3-hour episode never sits in memory at once."""
    proc = subprocess.Popen(_decode_cmd(path, sr, None, max_seconds), stdout=subprocess.PIPE)
    nbytes = int(block_seconds * sr) * 4
    try:
        assert proc.stdout is not None
        while True:
            buf = proc.stdout.read(nbytes)
            if not buf:
                break
            usable = len(buf) - len(buf) % 4
            yield np.frombuffer(buf[:usable], dtype=np.float32)
    finally:
        if proc.stdout:
            proc.stdout.close()
        proc.wait()


def rms_frames(samples: np.ndarray, sr: int, hop: float) -> np.ndarray:
    """RMS per non-overlapping window of `hop` seconds (last partial window included)."""
    n = max(1, int(round(hop * sr)))
    count = int(np.ceil(len(samples) / n)) if len(samples) else 0
    if count == 0:
        return np.zeros(0, dtype=np.float32)
    padded = np.zeros(count * n, dtype=np.float32)
    padded[: len(samples)] = samples
    return np.sqrt(np.mean(padded.reshape(count, n) ** 2, axis=1)).astype(np.float32)


def episode_rms(path: Path, hop: float = 0.5, max_seconds: float | None = None) -> np.ndarray:
    """RMS every `hop` seconds over the whole episode, streamed (used by scout for energy tags)."""
    parts = []
    carry = np.zeros(0, dtype=np.float32)
    n = int(hop * SR)
    for block in stream(path, block_seconds=120.0, max_seconds=max_seconds):
        data = np.concatenate([carry, block])
        whole = len(data) - len(data) % n
        if whole:
            parts.append(rms_frames(data[:whole], SR, hop))
        carry = data[whole:]
    if len(carry):
        parts.append(rms_frames(carry, SR, hop))
    return np.concatenate(parts) if parts else np.zeros(0, dtype=np.float32)


def extract_normalized(src: Path, dst: Path, start: float, end: float, lufs: float = -14.0, tp: float = -1.0,
                       sr: int = 48000) -> dict:
    """Cut [start, end] from src, two-pass loudnorm to `lufs` / `tp`, write 48 kHz stereo 16-bit WAV.

    The cut is done with atrim inside the filter graph (sample-accurate, same timeline as a full decode) and
    timestamps are reset before the fades so fade times are clip-relative.
    Returns the pass-1 measurement and the pass-2 output stats parsed from ffmpeg's JSON.
    """
    dur = end - start
    pre = (f"atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS,"
           f"afade=t=in:d=0.04,afade=t=out:st={max(0.0, dur - 0.12):.3f}:d=0.12")
    base = ["ffmpeg", "-nostdin", "-hide_banner", "-i", str(src), "-vn"]
    target = f"I={lufs}:TP={tp}:LRA=11"
    p1 = subprocess.run(
        base + ["-af", f"{pre},loudnorm={target}:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    )
    m = _last_json(p1.stderr)
    ln2 = (
        f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
        f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
    )
    dst.parent.mkdir(parents=True, exist_ok=True)
    p2 = subprocess.run(
        base + ["-af", f"{pre},{ln2}", "-ar", str(sr), "-ac", "2", "-c:a", "pcm_s16le", "-y", str(dst)],
        capture_output=True, text=True, check=True,
    )
    return {"pass1": m, "pass2": _last_json(p2.stderr)}


def _last_json(stderr: str) -> dict:
    blocks = re.findall(r"\{[^{}]*\}", stderr)
    if not blocks:
        raise RuntimeError("loudnorm produced no JSON stats:\n" + stderr[-2000:])
    return json.loads(blocks[-1])


def measure_loudness(path: Path) -> dict:
    """Integrated loudness / true peak of a file (for verification)."""
    p = subprocess.run(
        ["ffmpeg", "-nostdin", "-hide_banner", "-i", str(path), "-af", "loudnorm=print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    )
    m = _last_json(p.stderr)
    return {"lufs": float(m["input_i"]), "truePeak": float(m["input_tp"])}


def read_wav_mono(path: Path, sr: int) -> np.ndarray:
    return decode(path, sr=sr)


def compute_envelope(samples: np.ndarray, sr: int, duration: float, fps: int = 30,
                     range_db: float = 30.0, attack: float = 0.6, release: float = 0.15) -> list[float]:
    """Per-frame loudness envelope in 0..1, exactly round(duration * fps) values.

    RMS per frame -> dB -> mapped so the 95th percentile is ~1 and `range_db` below it is 0 -> smoothed with a
    fast attack / slow release so visuals pulse on syllables but don't flicker.
    """
    n = int(round(duration * fps))
    if n <= 0:
        return []
    edges = np.minimum((np.arange(n + 1) * sr / fps).astype(np.int64), len(samples))
    rms = np.zeros(n, dtype=np.float64)
    for i in range(n):
        seg = samples[edges[i]: edges[i + 1]]
        if len(seg):
            rms[i] = np.sqrt(np.mean(seg.astype(np.float64) ** 2))
    db = 20 * np.log10(rms + 1e-9)
    top = float(np.percentile(db, 95)) if np.any(rms > 0) else 0.0
    x = np.clip((db - (top - range_db)) / range_db, 0.0, 1.0)
    out, y = [], 0.0
    for v in x:
        y += (v - y) * (attack if v > y else release)
        out.append(round(float(y), 3))
    return out
