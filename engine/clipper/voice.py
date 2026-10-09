"""voice: script.json beats -> narration audio with exact beat timings and script-aligned word timings.

  python -m clipper voice --script work/explainers/<id>/script.json [--force] [--no-length-check]

1. Each beat's `say` is synthesized on its own (TTS input passes through the pronunciation LEXICON), trimmed of
   edge silence and joined with BEAT_GAP pauses, so every beat's start/end sample is known exactly.
2. Narration must be 58-80 s (contract). Outside that it stops before the slow steps and says how many words to
   cut/add at the measured pace (LengthError, CLI exit 3).
3. Two-pass loudnorm to -14 LUFS / -1 dBTP (audio.extract_normalized) -> voice.wav (48 kHz stereo s16).
4. faster-whisper small.en transcribes voice.wav for timings only. Script tokens are the caption source of truth:
   they are aligned to whisper's words on a character level of their *spoken* form ("40%" ~ "forty percent",
   "2,000,000" ~ "2 million"), so a script token is timed over whatever words whisper wrote for it. Tokens whisper
   missed are interpolated inside their beat.

voice.json: { duration, words: [{w,s,e}], beats: [{t0,t1,speech:[s,e]}], wordsPerSecond, wer, lufs, truePeak,
              voice, warnings, ... }  (beats tile 0..duration; `speech` is the exact spoken span)
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import time
import wave
from pathlib import Path

import numpy as np

from . import audio
from .common import Paths, log, r2, read_json, write_json

VERSION = 1  # bump when synthesis/assembly changes so cached voice.json is rebuilt
MIN_S, MAX_S = 58.0, 80.0
TARGET_LO, TARGET_HI = 62.0, 75.0  # what the cut/add advice aims for (playbook: >= 62 s for creator programs)
LEAD, BEAT_GAP, TAIL = 0.15, 0.25, 0.6  # seconds of silence: before beat 1, between beats, after the last beat
WHISPER_MODEL = "small.en"
WHISPER_BEAM = 5

# ---------- pronunciation (TTS input only; captions always show the script's own words) ----------

# Kokoro and Piper both phonemize with espeak-ng, which already reads all-caps acronyms as letters (GPT, LLM, API,
# GPU, AGI, TSMC), "Nvidia", "OpenAI", "40%", "$13 billion" and "2026" correctly (whisper round-trip, see
# docs/specs/voice-notes.md). Spelling acronyms out as "G P T" / "Open A I" made it WORSE ("a eye", "a PI"), so
# only add an entry after checking it with a round-trip. (pattern, replacement), case-sensitive, applied in order.
LEXICON: list[tuple[str, str]] = [
    (r"\bLLaMA\b", "Llama"),                 # mixed case was read as "Elizame"
    (r"\bA\.I\.", "AI"),                     # dotted form was read as "8i"
    (r"\bGPT-4o\b", "GPT four oh"),
    (r"(?<![\w-])o([1-9])(?=\b)", r"oh \1"),  # o1, o3 model names
    (r"\bQwen\b", "Chwen"),
    (r"\bHassabis\b", "Hassabbis"),
    (r"\bAmodei\b", "Ah-mo-day"),
    (r"\bSaaS\b", "sass"),
    (r"\bvs\.(?=\s)", "versus"),
    (r"\be\.g\.,?", "for example,"),
    (r"\bi\.e\.,?", "that is,"),
    (r"\$(\d[\d,]*(?:\.\d+)?)\s?([KMB]|bn)\b",
     lambda m: f"{m.group(1)} {_SCALE[m.group(2).lower()]} dollars"),  # $5B -> 5 billion dollars
    (r"(\d)\s?%", r"\1 percent"),
]
_SCALE = {"k": "thousand", "m": "million", "b": "billion", "bn": "billion"}


def tts_text(text: str, extra: dict[str, str] | None = None) -> str:
    """Script text -> what the TTS engine is given. `extra` = script.json "lexicon" {word: respelling}."""
    out = " ".join(text.split())
    for word, say in (extra or {}).items():
        out = re.sub(rf"(?<!\w){re.escape(word)}(?!\w)", say, out)
    for pat, rep in LEXICON:
        out = re.sub(pat, rep, out)
    return out


# ---------- spoken form (for alignment and WER only) ----------

_ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
         "seventeen eighteen nineteen").split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
_SCALES = ((10**12, "trillion"), (10**9, "billion"), (10**6, "million"), (1000, "thousand"))
_ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth", "nine": "ninth",
        "twelve": "twelfth"}


def int_words(n: int) -> list[str]:
    if n < 20:
        return [_ONES[n]]
    if n < 100:
        return [_TENS[n // 10]] + ([_ONES[n % 10]] if n % 10 else [])
    if n < 1000:
        return [_ONES[n // 100], "hundred"] + (int_words(n % 100) if n % 100 else [])
    for value, name in _SCALES:
        if n >= value:
            rest = n % value
            return int_words(n // value) + [name] + (int_words(rest) if rest else [])
    raise AssertionError(n)


def year_words(n: int) -> list[str]:
    if 2000 <= n <= 2009:
        return ["two", "thousand"] + ([_ONES[n % 10]] if n % 10 else [])
    hi, lo = divmod(n, 100)
    if lo == 0:
        return int_words(hi) + ["hundred"]
    return int_words(hi) + (["oh", _ONES[lo]] if lo < 10 else int_words(lo))


def _ordinal(words: list[str]) -> list[str]:
    last = words[-1]
    last = _ORD.get(last) or (last[:-1] + "ieth" if last.endswith("y") else last + "th")
    return words[:-1] + [last]


def _plural(words: list[str]) -> list[str]:
    last = words[-1]
    return words[:-1] + [last[:-1] + "ies" if last.endswith("y") else last + "s"]


_NUM = re.compile(r"(\d[\d,]*(?:\.\d+)?)(st|nd|rd|th|s|k|m|bn|b)?(?![a-z\d]|\.\d)|(\d[\d,]*(?:\.\d+)?)")


def _number(m: re.Match) -> str:
    raw, suffix = (m.group(1), m.group(2)) if m.group(1) else (m.group(3), None)
    trail = "," if raw.endswith(",") else ""
    raw = raw.rstrip(",")
    digits = raw.replace(",", "")
    if "." in digits:
        whole, frac = digits.split(".", 1)
        words = int_words(int(whole or 0)) + ["point"] + [_ONES[int(d)] for d in frac]
    else:
        n = int(digits)
        is_year = "," not in raw and len(digits) == 4 and 1100 <= n <= 2099 and suffix in (None, "s")
        words = year_words(n) if is_year else int_words(n)
    if suffix in ("st", "nd", "rd", "th"):
        words = _ordinal(words)
    elif suffix == "s":
        words = _plural(words)
    elif suffix:
        words = words + [_SCALE[suffix]]
    return " " + " ".join(words) + " " + trail


def spoken_words(text: str) -> list[str]:
    """Canonical spoken words of some text: lowercase letters only, numbers expanded ("40%" -> forty percent)."""
    t = text.lower().replace("%", " percent ").replace("&", " and ").replace("+", " plus ")
    t = re.sub(r"['’]", "", t)
    t = _NUM.sub(_number, t)
    return re.sub(r"[^a-z]+", " ", t).split()


def spoken_key(token: str) -> str:
    return "".join(spoken_words(token))


def caption_tokens(say: str) -> list[str]:
    """Whitespace tokens of a beat; punctuation-only tokens (an em dash) are glued to the previous token."""
    out: list[str] = []
    for tok in say.split():
        if not spoken_key(tok) and out:
            out[-1] += " " + tok
        elif out and not spoken_key(out[-1]):
            out[-1] += " " + tok
        else:
            out.append(tok)
    return out


# ---------- alignment ----------

def _char_pairs(a: str, b: str) -> list[tuple[int, int, bool]]:
    """Levenshtein alignment of two strings -> (i, j, exact) for every match/substitution."""
    n, m = len(a), len(b)
    d = [list(range(m + 1))] + [[i] + [0] * m for i in range(1, n + 1)]
    for i in range(1, n + 1):
        row, prev, ai = d[i], d[i - 1], a[i - 1]
        for j in range(1, m + 1):
            row[j] = min(prev[j - 1] + (ai != b[j - 1]), prev[j] + 1, row[j - 1] + 1)
    pairs, i, j = [], n, m
    while i > 0 and j > 0:
        if d[i][j] == d[i - 1][j - 1] + (a[i - 1] != b[j - 1]):
            pairs.append((i - 1, j - 1, a[i - 1] == b[j - 1]))
            i, j = i - 1, j - 1
        elif d[i][j] == d[i - 1][j] + 1:
            i -= 1
        else:
            j -= 1
    return pairs[::-1]


def align_tokens(tokens: list[str], wwords: list[dict],
                 span: tuple[float, float]) -> tuple[list[tuple[float, float]], list[int]]:
    """Time each script token from whisper words (dicts with w, s, e) inside span (s0, s1).

    Returns ([(s, e)] per token, indices of tokens whisper did not match, whose times were interpolated)."""
    s0, s1 = span
    keys = [spoken_key(t) for t in tokens]
    a_chars, owner = [], []
    for k_i, k in enumerate(keys):
        a_chars.append(k)
        owner += [k_i] * len(k)
    b_chars, times = [], []
    for w in wwords:
        k = spoken_key(w["w"])
        if not k:
            continue
        ws, we = max(s0, min(w["s"], s1)), max(s0, min(w["e"], s1))
        step = (we - ws) / len(k)
        b_chars.append(k)
        times += [(ws + c * step, ws + (c + 1) * step) for c in range(len(k))]

    hits: list[list[tuple[int, bool]]] = [[] for _ in tokens]
    for i, j, exact in _char_pairs("".join(a_chars), "".join(b_chars)):
        hits[owner[i]].append((j, exact))

    timed: list[tuple[float, float] | None] = []
    for k, h in zip(keys, hits):
        exact = sum(1 for _j, ex in h if ex)
        if k and exact >= max(1, math.ceil(0.5 * len(k))):
            timed.append((times[h[0][0]][0], times[h[-1][0]][1]))
        else:
            timed.append(None)
    missing = [k for k, t in enumerate(timed) if t is None]
    return _fill_and_order(timed, keys, s0, s1), missing


def _fill_and_order(timed: list[tuple[float, float] | None], keys: list[str], s0: float, s1: float,
                    min_word: float = 0.08) -> list[tuple[float, float]]:
    out = list(timed)
    i = 0
    while i < len(out):
        if out[i] is not None:
            i += 1
            continue
        j = i
        while j < len(out) and out[j] is None:
            j += 1
        lo = out[i - 1][1] if i > 0 else s0  # type: ignore[index]
        hi = out[j][0] if j < len(out) else s1  # type: ignore[index]
        need = min_word * (j - i)
        if hi - lo < need:  # no gap for the missing words: borrow half of each neighbour
            if i > 0:
                ps, pe = out[i - 1]  # type: ignore[misc]
                lo = max(s0, (ps + pe) / 2)
                out[i - 1] = (ps, lo)
            if j < len(out):
                ns, ne = out[j]  # type: ignore[misc]
                hi = min(s1, (ns + ne) / 2)
                out[j] = (hi, ne)
            if hi - lo < need:
                lo, hi = lo, max(hi, lo + need)
        weights = [len(keys[k]) + 2 for k in range(i, j)]
        t = lo
        for k, wgt in zip(range(i, j), weights):
            d = (hi - lo) * wgt / sum(weights)
            out[k] = (t, t + d)
            t += d
        i = j
    res, prev_e = [], s0
    for s, e in out:  # type: ignore[misc]
        s = min(max(s, prev_e, s0), s1)
        e = min(max(e, s + 0.02), max(s1, s + 0.02))
        res.append((r2(s), r2(e)))
        prev_e = e
    return res


def snap_to_speech(words: list[dict], samples: np.ndarray, sr: int, floor_db: float = -35.0,
                   min_gap: float = 0.12, min_word: float = 0.08) -> None:
    """Whisper often starts a word where the previous one ended, swallowing the pause between them (and sometimes
    runs a word's end into the next pause). If a word's span contains a real pause (>= min_gap of audio
    `floor_db` below the loud level), move its start to after the pause / its end to before it. In place; spans
    only shrink, so order and non-overlap are preserved."""
    hop = 0.01
    rms = audio.rms_frames(samples, sr, hop)
    if len(rms) == 0:
        return
    db = 20 * np.log10(rms + 1e-9)
    quiet = db < float(np.percentile(db, 95)) + floor_db
    need = int(round(min_gap / hop))
    for w in words:
        a, b = int(round(w["s"] / hop)), int(round(w["e"] / hop))
        runs, k = [], a
        while k < b:  # silent runs [i, j) inside the word
            if quiet[k] if k < len(quiet) else True:
                j = k
                while j < b and (j >= len(quiet) or quiet[j]):
                    j += 1
                if j - k >= need:
                    runs.append((k, j))
                k = j
            else:
                k += 1
        for i, j in reversed(runs):  # speech starts after the last long pause that leaves room for the word
            if (b - j) * hop >= min_word:
                w["s"] = r2(j * hop)
                break
        a = int(round(w["s"] / hop))
        for i, j in runs:  # and ends before the first long pause after it
            if i > a and (i - a) * hop >= min_word:
                w["e"] = r2(i * hop)
                break


def word_error_rate(ref: list[str], hyp: list[str]) -> float:
    if not ref:
        return 0.0
    prev = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        cur = [i] + [0] * len(hyp)
        for j, h in enumerate(hyp, 1):
            cur[j] = min(prev[j - 1] + (r != h), prev[j] + 1, cur[j - 1] + 1)
        prev = cur
    return prev[-1] / len(ref)


# ---------- beat timing and the length guard ----------

def beat_windows(speech: list[tuple[float, float]], duration: float) -> list[dict]:
    """Beats tile [0, duration]; a beat's visual starts a little (<= 0.1 s) before its first spoken word."""
    starts = [0.0]
    for (_ps, pe), (ns, _ne) in zip(speech, speech[1:]):
        starts.append(ns - min(0.1, max(0.0, ns - pe) / 2))
    ends = starts[1:] + [duration]
    return [{"t0": r2(t0), "t1": r2(t1), "speech": [r2(s), r2(e)]}
            for t0, t1, (s, e) in zip(starts, ends, speech)]


class LengthError(Exception):
    pass


def length_problem(duration: float, n_words: int, speech_seconds: float,
                   lo: float = MIN_S, hi: float = MAX_S) -> str | None:
    """None if lo <= duration <= hi, else advice with word counts at the measured pace."""
    if lo <= duration <= hi:
        return None
    wps = n_words / speech_seconds if speech_seconds > 0 else 2.6
    if duration < lo:
        need, aim = math.ceil((lo - duration) * wps), math.ceil((TARGET_LO - duration) * wps)
        return (f"narration is {duration:.1f} s, under the {lo:g} s minimum: ADD at least {need} words "
                f"(about {aim} to reach {TARGET_LO:g} s) at the measured {wps:.2f} words/s ({n_words} words now)")
    need, aim = math.ceil((duration - hi) * wps), math.ceil((duration - TARGET_HI) * wps)
    return (f"narration is {duration:.1f} s, over the {hi:g} s maximum: CUT at least {need} words "
            f"(about {aim} to land at {TARGET_HI:g} s) at the measured {wps:.2f} words/s ({n_words} words now)")


# ---------- audio assembly ----------

def trim_silence(x: np.ndarray, sr: int, floor_db: float = -45.0, pad_in: float = 0.02,
                 pad_out: float = 0.05) -> np.ndarray:
    """Cut leading/trailing audio quieter than `floor_db` below the loudest 10 ms frame."""
    if len(x) == 0:
        return x
    hop = max(1, int(0.01 * sr))
    rms = audio.rms_frames(x, sr, 0.01)
    db = 20 * np.log10(rms + 1e-9)
    loud = np.nonzero(db > max(db.max() + floor_db, -70.0))[0]
    if len(loud) == 0:
        return x[:0]
    a = max(0, loud[0] * hop - int(pad_in * sr))
    b = min(len(x), (loud[-1] + 1) * hop + int(pad_out * sr))
    return x[a:b]


def longest_pause(x: np.ndarray, sr: int, floor_db: float = -40.0) -> float:
    rms = audio.rms_frames(x, sr, 0.01)
    if len(rms) == 0:
        return 0.0
    quiet = 20 * np.log10(rms + 1e-9) < (20 * np.log10(rms.max() + 1e-9) + floor_db)
    best = run = 0
    for q in quiet:
        run = run + 1 if q else 0
        best = max(best, run)
    return best * 0.01


def write_wav16(path: Path, x: np.ndarray, sr: int) -> None:
    peak = float(np.max(np.abs(x))) if len(x) else 0.0
    if peak > 0.99:  # kokoro can overshoot 1.0; loudnorm sets the final level anyway
        x = x * (0.99 / peak)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def read_wav16(path: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path), "rb") as w:
        sr = w.getframerate()
        data = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2")
    return data.astype(np.float32) / 32767, sr


def synth_beat(backend, text: str, cache_dir: Path) -> tuple[np.ndarray, int]:
    """Synthesize + trim one beat, cached by (voice, text) so editing one beat only re-voices that beat."""
    key = hashlib.sha1(f"{VERSION}|{backend.spec.label}|{text}".encode()).hexdigest()[:16]
    cached = cache_dir / f"{key}.wav"
    if cached.exists():
        return read_wav16(cached)
    x = backend.synth(text)
    if len(x) == 0 or not np.all(np.isfinite(x)):
        raise RuntimeError(f"TTS returned empty or invalid audio for: {text[:60]!r}")
    x = trim_silence(x, backend.sample_rate)
    write_wav16(cached, x, backend.sample_rate)
    return read_wav16(cached)


# ---------- command ----------

def script_hash(script: dict, spec_label: str) -> str:
    payload = json.dumps({"v": VERSION, "voice": spec_label, "say": [b["say"] for b in script["beats"]],
                          "lexicon": script.get("lexicon"),
                          "global": [(p, r if isinstance(r, str) else "fn") for p, r in LEXICON]}, sort_keys=True)
    return hashlib.sha1(payload.encode()).hexdigest()[:16]


def voice(paths: Paths, script_path: Path, force: bool = False, check_length: bool = True) -> dict:
    from . import tts_backends as tts

    script = read_json(Path(script_path))
    if not script or not script.get("beats"):
        raise SystemExit(f"{script_path}: no beats")
    if not script.get("id"):
        raise SystemExit(f"{script_path}: missing id")
    spec = tts.parse_spec(script.get("voice"), script.get("voiceSpeed"))
    out_dir = paths.work / "explainers" / script["id"]
    wav_path, json_path = out_dir / "voice.wav", out_dir / "voice.json"
    h = script_hash(script, spec.label)
    cached = read_json(json_path)
    if cached and not force and cached.get("scriptHash") == h and wav_path.exists():
        log(f"voice: cached {json_path} ({cached['duration']:.1f} s)")
        return cached

    t_start = time.time()
    backend = tts.load(spec)
    beat_tokens = [caption_tokens(b["say"]) for b in script["beats"]]
    pieces, warnings = [], []
    sr = backend.sample_rate
    for i, b in enumerate(script["beats"]):
        x, sr = synth_beat(backend, tts_text(b["say"], script.get("lexicon")), out_dir / ".tts-cache")
        pieces.append(x)
        d = len(x) / sr
        n = len(beat_tokens[i])
        if n >= 4 and not 1.6 <= n / d <= 4.2:
            warnings.append(f"beat {i + 1}: odd pace {n / d:.2f} words/s (garbled or truncated TTS?)")
        pause = longest_pause(x, sr)
        if pause > 1.2:
            warnings.append(f"beat {i + 1}: {pause:.1f} s silence inside the beat")
    synth_s = time.time() - t_start
    gap, lead, tail = (np.zeros(int(round(s * sr)), dtype=np.float32) for s in (BEAT_GAP, LEAD, TAIL))
    joined = [lead]
    for i, x in enumerate(pieces):
        joined += [x] + ([gap] if i < len(pieces) - 1 else [tail])
    narration = np.concatenate(joined)
    pos, speech = len(lead), []
    for i, x in enumerate(pieces):
        speech.append((pos / sr, (pos + len(x)) / sr))
        pos += len(x) + (len(gap) if i < len(pieces) - 1 else 0)
    duration = len(narration) / sr
    n_words = sum(len(t) for t in beat_tokens)
    speech_s = sum(e - s for s, e in speech)
    wps = n_words / speech_s
    log(f"voice: {spec.label}, {len(pieces)} beats, {n_words} words, {duration:.1f} s "
        f"({wps:.2f} words/s of speech), synth {synth_s:.0f} s ({duration / max(synth_s, 1e-6):.1f}x realtime)")
    problem = length_problem(duration, n_words, speech_s)
    if problem and check_length:
        raise LengthError(problem)
    if problem:
        warnings.append(problem)

    raw = out_dir / "voice.raw.wav"
    write_wav16(raw, narration, sr)
    norm = audio.extract_normalized(raw, wav_path, 0.0, duration)
    raw.unlink(missing_ok=True)
    loud = audio.measure_loudness(wav_path)
    if abs(loud["lufs"] + 14) > 1.0 or loud["truePeak"] > -0.5:
        warnings.append(f"loudness {loud['lufs']:.1f} LUFS / {loud['truePeak']:.1f} dBTP (target -14 / -1)")
    final = audio.decode(wav_path)
    clipped = int(np.sum(np.abs(final) >= 0.999))
    if clipped:
        warnings.append(f"{clipped} clipped samples after normalisation")

    from .transcribe import whisper_segments

    t_w = time.time()
    segs = whisper_segments(final, WHISPER_MODEL, vad=False, beam_size=WHISPER_BEAM)
    wwords = [w for s in segs for w in s["words"]]
    whisper_s = time.time() - t_w
    hyp = [w for s in segs for w in spoken_words(s["text"])]
    ref = [w for b in script["beats"] for w in spoken_words(b["say"])]
    wer = word_error_rate(ref, hyp)
    if wer > 0.08:
        warnings.append(f"whisper WER {wer:.1%}: narration may be garbled; check pronunciation/lexicon")

    # whisper words -> beats by midpoint, cut halfway through each inter-beat pause
    cuts = [(pe + ns) / 2 for (_ps, pe), (ns, _ne) in zip(speech, speech[1:])] + [math.inf]
    per_beat: list[list[dict]] = [[] for _ in speech]
    for w in wwords:
        mid = (w["s"] + w["e"]) / 2
        per_beat[next(k for k, c in enumerate(cuts) if mid < c)].append(w)
    words, unaligned = [], []
    for k, (toks, span) in enumerate(zip(beat_tokens, speech)):
        timed, missing = align_tokens(toks, per_beat[k], span)
        unaligned += [len(words) + m for m in missing]
        words += [{"w": tok, "s": s, "e": e} for tok, (s, e) in zip(toks, timed)]
        if len(missing) > max(2, 0.2 * len(toks)):
            warnings.append(f"beat {k + 1}: {len(missing)}/{len(toks)} words not found by whisper (timings interpolated)")
    snap_to_speech(words, final, audio.SR)

    result = {
        "id": script["id"],
        "voice": spec.label,
        "duration": r2(duration),
        "sampleRate": 48000,
        "wordsPerSecond": round(wps, 2),
        "speechSeconds": r2(speech_s),
        "wer": round(wer, 4),
        "lufs": loud["lufs"],
        "truePeak": loud["truePeak"],
        "loudnorm": norm["pass2"].get("normalization_type"),
        "interpolated": [words[i]["w"] for i in unaligned],
        "transcript": " ".join(s["text"] for s in segs),
        "warnings": warnings,
        "beats": beat_windows(speech, duration),
        "words": words,
        "scriptHash": h,
        "timing": {"synthSeconds": round(synth_s, 1), "whisperSeconds": round(whisper_s, 1)},
    }
    write_json(json_path, result)
    log(f"voice: {duration:.1f} s, WER {wer:.1%}, {loud['lufs']:.1f} LUFS / {loud['truePeak']:.1f} dBTP, "
        f"{len(unaligned)} interpolated words, whisper {whisper_s:.0f} s -> {wav_path}")
    for w in warnings:
        log(f"voice: WARNING {w}")
    return result
