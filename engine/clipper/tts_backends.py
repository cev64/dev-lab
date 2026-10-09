"""Local CPU text-to-speech backends for the explainer narrator (no network at synthesis time).

Voice spec (script.json "voice"):
  "default"                      -> DEFAULT_SPEC
  "kokoro:<voice>"               Kokoro-82M v1.0 (kokoro-onnx), e.g. kokoro:af_heart, kokoro:bf_emma
  "piper:<voice>"                Piper, e.g. piper:en_US-ljspeech-medium
An optional "@<speed>" suffix overrides the backend's default speed, e.g. "kokoro:af_heart@0.9".

Model files live in CACHE (env CLIPPER_TTS_CACHE, default ~/.cache/clipper-tts) and are downloaded once by
scripts/setup.sh via `python -m clipper.tts_backends fetch <spec>...`. Licences: docs/specs/voice-notes.md.
"""

from __future__ import annotations

import hashlib
import os
import sys
import urllib.request
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np

CACHE = Path(os.environ.get("CLIPPER_TTS_CACHE", "~/.cache/clipper-tts")).expanduser()
DEFAULT_SPEC = "kokoro:af_heart"
FALLBACK_SPEC = "piper:en_US-ljspeech-medium"

# Default speed per engine. Kokoro at 1.0 reads ~3.0 words/s; 0.85 gives ~2.6-2.7 words/s, which puts the
# contract's 150-185 words at ~60-75 s (measurements in docs/specs/voice-notes.md).
DEFAULT_SPEED = {"kokoro": 0.85, "piper": 0.9}

_KOKORO_REL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
KOKORO_FILES = [  # (file, url, sha256). fp32 (325 MB) measured ~20% faster than the int8 export here, same WER.
    ("kokoro-v1.0.onnx", _KOKORO_REL + "kokoro-v1.0.onnx",
     "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"),
    ("voices-v1.0.bin", _KOKORO_REL + "voices-v1.0.bin",
     "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"),
]
PIPER_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
PIPER_SHA256 = {  # pinned where verified; other voices are fetched unpinned
    "en_US-ljspeech-medium.onnx": "6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22",
    "en_US-ljspeech-medium.onnx.json": "141d612cc0a95ed7efc1ca936b845c2364967f2e9217c5dbfcf69fc4d6c65860",
}
# Voices we must not use (licence or likeness); see docs/specs/voice-notes.md and docs/explainer-playbook.md.
BLOCKED = {
    "piper": ("lessac", "ryan", "hfc_female", "hfc_male", "semaine", "l2arctic", "amy"),
    # Named after another vendor's commercial voices (likely trained on that vendor's output) or the "Sky" voice
    # that was pulled over a resemblance to a real actor. Not worth the risk.
    "kokoro": ("af_alloy", "af_nova", "af_sky", "am_echo", "am_onyx", "bm_fable"),
}


@dataclass(frozen=True)
class VoiceSpec:
    engine: str
    voice: str
    speed: float

    @property
    def label(self) -> str:
        return f"{self.engine}:{self.voice}@{self.speed:g}"


def parse_spec(spec: str | None, speed: float | None = None) -> VoiceSpec:
    spec = (spec or "default").strip()
    if "@" in spec:
        spec, sp = spec.split("@", 1)
        speed = float(sp) if speed is None else speed
    if spec in ("", "default"):
        spec = DEFAULT_SPEC
    if ":" not in spec:
        raise ValueError(f"voice must be 'default', 'kokoro:<voice>' or 'piper:<voice>', got {spec!r}")
    engine, voice = spec.split(":", 1)
    if engine not in DEFAULT_SPEED:
        raise ValueError(f"unknown TTS engine {engine!r} (kokoro or piper)")
    name = voice.split("-")[1] if engine == "piper" and voice.count("-") >= 2 else voice
    if name in BLOCKED[engine]:
        raise ValueError(f"voice {spec} is blocked (licence or likeness risk; see docs/specs/voice-notes.md)")
    speed = DEFAULT_SPEED[engine] if speed is None else float(speed)
    if not 0.5 <= speed <= 2.0:
        raise ValueError(f"speed {speed} outside 0.5-2.0")
    return VoiceSpec(engine, voice, speed)


def piper_url(voice: str) -> str:
    """en_US-ljspeech-medium -> .../en/en_US/ljspeech/medium/en_US-ljspeech-medium"""
    try:
        lang, name, quality = voice.split("-", 2)
    except ValueError:
        raise ValueError(f"piper voice must look like en_US-<name>-<quality>, got {voice!r}") from None
    return f"{PIPER_BASE}{lang.split('_')[0]}/{lang}/{name}/{quality}/{voice}"


def files_for(vs: VoiceSpec) -> list[tuple[Path, str, str | None]]:
    """(local path, url, sha256 or None) for every file a voice needs."""
    if vs.engine == "kokoro":
        return [(CACHE / "kokoro" / f, url, sha) for f, url, sha in KOKORO_FILES]
    base = piper_url(vs.voice)
    out = []
    for suffix in (".onnx", ".onnx.json"):
        name = vs.voice + suffix
        out.append((CACHE / "piper" / name, base + suffix, PIPER_SHA256.get(name)))
    out.append((CACHE / "piper" / f"{vs.voice}.MODEL_CARD", base.rsplit("/", 1)[0] + "/MODEL_CARD", None))
    return out


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def fetch(vs: VoiceSpec) -> None:
    """Download a voice's files into CACHE once (idempotent; verifies pinned checksums)."""
    for path, url, sha in files_for(vs):
        if path.exists() and path.stat().st_size > 0 and (sha is None or _sha256(path) == sha):
            print(f"[tts] ok {path}", file=sys.stderr)
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + ".part")
        for attempt in range(1, 4):  # the egress proxy occasionally cuts a transfer short
            print(f"[tts] downloading {url}" + (f" (attempt {attempt})" if attempt > 1 else ""), file=sys.stderr)
            try:
                with urllib.request.urlopen(url, timeout=120) as r, open(tmp, "wb") as f:
                    expected = int(r.headers.get("content-length") or 0)
                    while chunk := r.read(1 << 20):
                        f.write(chunk)
                size = tmp.stat().st_size
                if expected and size != expected:
                    raise OSError(f"got {size} of {expected} bytes")
                if sha and _sha256(tmp) != sha:
                    raise OSError(f"checksum mismatch ({size} bytes)")
                os.replace(tmp, path)
                break
            except OSError as e:
                tmp.unlink(missing_ok=True)
                print(f"[tts] {url}: {e}", file=sys.stderr)
                if attempt == 3:
                    raise RuntimeError(f"could not download {url}: {e}") from e


def _require(vs: VoiceSpec) -> list[Path]:
    paths = [p for p, _u, _s in files_for(vs)]
    missing = [p for p in paths[:2] if not p.exists()]
    if missing:
        raise SystemExit(f"TTS files missing for {vs.label}: {', '.join(map(str, missing))}\n"
                         f"run: bash scripts/setup.sh   (or: python -m clipper.tts_backends fetch {vs.engine}:{vs.voice})")
    return paths


class Backend:
    """synth(text) -> mono float32 samples at self.sample_rate."""

    sample_rate: int
    spec: VoiceSpec

    def synth(self, text: str) -> np.ndarray:  # pragma: no cover - interface
        raise NotImplementedError


class KokoroBackend(Backend):
    def __init__(self, vs: VoiceSpec):
        from kokoro_onnx import Kokoro

        model, voices = _require(vs)
        self.spec = vs
        self.engine = Kokoro(str(model), str(voices))
        if vs.voice not in self.engine.voices:
            raise SystemExit(f"kokoro voice {vs.voice!r} not found; try af_heart, af_bella, bf_emma, am_michael")
        self.sample_rate = 24000

    def synth(self, text: str) -> np.ndarray:
        audio, sr = self.engine.create(text, voice=self.spec.voice, speed=self.spec.speed, lang="en-us")
        self.sample_rate = sr
        return np.asarray(audio, dtype=np.float32).ravel()


class PiperBackend(Backend):
    SENTENCE_GAP = 0.12  # piper returns one chunk per sentence; this joins them with a short breath

    def __init__(self, vs: VoiceSpec):
        from piper import PiperVoice

        model, config, *_ = _require(vs)
        self.spec = vs
        self.voice = PiperVoice.load(str(model), config_path=str(config))
        self.sample_rate = self.voice.config.sample_rate

    def synth(self, text: str) -> np.ndarray:
        from piper.config import SynthesisConfig

        cfg = SynthesisConfig(length_scale=1.0 / self.spec.speed)
        parts = []
        gap = np.zeros(int(self.SENTENCE_GAP * self.sample_rate), dtype=np.float32)
        for chunk in self.voice.synthesize(text, syn_config=cfg):
            if parts:
                parts.append(gap)
            parts.append(np.asarray(chunk.audio_float_array, dtype=np.float32).ravel())
            self.sample_rate = chunk.sample_rate
        return np.concatenate(parts) if parts else np.zeros(0, dtype=np.float32)


@lru_cache(maxsize=4)
def load(vs: VoiceSpec) -> Backend:
    return KokoroBackend(vs) if vs.engine == "kokoro" else PiperBackend(vs)


def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[0] != "fetch":
        print("usage: python -m clipper.tts_backends fetch <default|kokoro:<voice>|piper:<voice>> ...", file=sys.stderr)
        return 2
    for spec in argv[1:]:
        fetch(parse_spec(spec))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
