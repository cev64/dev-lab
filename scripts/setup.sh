#!/usr/bin/env bash
# One-shot, idempotent environment setup for the clip engine (safe to run every night in a fresh container).
#   - checks ffmpeg/ffprobe (installs via apt-get when missing and possible)
#   - creates .venv and installs engine/requirements.txt
#   - installs engine/render npm deps when engine/render/package.json exists (+ its optional `setup` script)
#   - pre-downloads the faster-whisper models base.en and small.en
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY="${PYTHON:-python3}"
VENV="$ROOT/.venv"
say() { printf '[setup] %s\n' "$*"; }

# 1. ffmpeg
if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  if command -v apt-get >/dev/null && [ "$(id -u)" = "0" ]; then
    say "installing ffmpeg"
    apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg >/dev/null
  else
    say "ERROR: ffmpeg/ffprobe not found and cannot install them"; exit 1
  fi
fi
case "$(ffmpeg -hide_banner -filters 2>/dev/null)" in
  *loudnorm*) ;;
  *) say "ERROR: ffmpeg lacks the loudnorm filter"; exit 1 ;;
esac

# 2. Python venv + requirements
if [ ! -x "$VENV/bin/python" ]; then
  say "creating $VENV"
  "$PY" -m venv "$VENV"
fi
say "installing Python requirements"
"$VENV/bin/python" -m pip install --quiet --disable-pip-version-check -r "$ROOT/engine/requirements.txt"

# 3. Renderer npm deps (owned by engine/render; only installed here)
RENDER="$ROOT/engine/render"
if [ -f "$RENDER/package.json" ]; then
  if ! command -v npm >/dev/null; then
    say "WARNING: npm not found; renderer deps not installed (make will skip rendering)"
  else
    if [ -f "$RENDER/package-lock.json" ]; then
      if [ ! -f "$RENDER/node_modules/.package-lock.json" ] || [ "$RENDER/package-lock.json" -nt "$RENDER/node_modules/.package-lock.json" ]; then
        say "npm ci in engine/render"
        (cd "$RENDER" && npm ci --no-audit --no-fund --loglevel=error)
      else
        say "engine/render node_modules up to date"
      fi
    else
      say "npm install in engine/render"
      (cd "$RENDER" && npm install --no-audit --no-fund --loglevel=error)
    fi
    (cd "$RENDER" && npm run --if-present --silent setup)
  fi
fi

# 4. Whisper models (cached in ~/.cache/huggingface; no-op when present)
say "checking whisper models base.en + small.en"
"$VENV/bin/python" - <<'PY'
from faster_whisper import WhisperModel
for name in ("base.en", "small.en"):
    WhisperModel(name, device="cpu", compute_type="int8")
    print(f"[setup] model {name} ready")
PY

# 5. Explainer narrator TTS files (Kokoro default + Piper fallback) into ~/.cache/clipper-tts (or $CLIPPER_TTS_CACHE).
#    Idempotent: files already present with the pinned sha256 are skipped. A failed download only warns, so the
#    clip pipeline still works; `python -m clipper voice` then says what is missing.
say "checking TTS voices (kokoro:af_heart, piper:en_US-ljspeech-medium)"
if ! (cd "$ROOT/engine" && "$VENV/bin/python" -m clipper.tts_backends fetch default piper:en_US-ljspeech-medium); then
  say "WARNING: TTS voice download failed; explainer narration unavailable until it succeeds"
fi

say "done. Try: cd engine && ../.venv/bin/python -m clipper status"
