# Voice (TTS narrator): notes and decisions

Owner: voice engineer. Measured 2026-10-09 in this container (4 cores, no GPU, Python 3.13). Code:
`engine/clipper/voice.py`, `engine/clipper/tts_backends.py`, tests `engine/tests/test_voice.py`.

## Decision
**Default narrator: Kokoro-82M v1.0 (kokoro-onnx 0.6.1, fp32 export), voice `af_heart`, speed 0.85.**
**Fallback: Piper `en_US-ljspeech-medium`** (`"voice": "piper:en_US-ljspeech-medium"`).

Why: both are equally intelligible to whisper, but Kokoro is the more natural voice (StyleTTS2-based; graded A for
af_heart by its authors), its licence is the cleanest (Apache-2.0 weights), and it fits the research playbook
(docs/explainer-playbook.md section 6). It is about 2.6-3x realtime here, so a 70 s narration takes about 25 s,
which is fine for 1-3 explainers a night. Piper is about 8x faster and kept as a fallback (also good when CPU is
contended).

## Measurements (173-word paragraph, speed 1.0 for all; WER = whisper small.en, beam 5, on the TTS output)

| Engine / voice | Install | Download | Speed (s audio / s wall) | Words/s | WER | Clipping / silence |
|---|---|---|---|---|---|---|
| Kokoro v1.0 fp32, af_heart | `pip install kokoro-onnx` ok | 325 MB model + 28 MB voices | 3.1x (1.3x while another job used all cores) | 3.00 | 1.2% * | peak 1.27 (float, >1) -> rescaled before loudnorm; longest pause 0.62 s; edges 0.04-0.06 s |
| Kokoro v1.0 int8, af_heart | same | 92 MB + 28 MB | 2.6x (1.2x contended) | 2.99 | 1.2% * | peak 1.03; same pauses |
| Kokoro int8, af_bella / am_michael / bm_george | same | same | 2.4x / 1.2x / 0.6x (contended) | 2.95 / 2.76 / 2.91 | 1.2% * each | no clipping |
| Piper ljspeech-medium | `pip install piper-tts` ok | 63 MB | 22x (10x contended) | 2.97 | 1.7-2.3% | 14 samples at 1.0 (int16 full scale); longest pause 0.34-0.46 s |
| Piper ljspeech-high | same | 114 MB | 1.8x (contended) | 3.06 | 2.9% | 14 samples at 1.0 |

\* Every Kokoro "error" was whisper writing "eight thousand" as "8,000" (2 words); real misrecognitions: 0.
Piper medium: 1-2 real errors ("novels" heard as "models"); Piper high: 3 ("as one long block of text, the model",
"is a reading"). Piper output also varies run to run (noise sampling). fp32 Kokoro was faster than the int8 export
on this CPU in both runs, so the default uses fp32 (the reference weights). Several timings were taken while another
process held all 4 cores; the paired numbers in each row were taken under the same conditions.

End-to-end on `engine/samples/explainer-sample.json` (7 beats, 177 words):

| Voice | Duration | Words/s (speech) | WER | Loudness | Synth | Whisper align |
|---|---|---|---|---|---|---|
| kokoro:af_heart@0.85 (default) | 67.3 s | 2.72 | 0.0% | -14.1 LUFS / -4.0 dBTP | 24 s | 22 s |
| piper:en_US-ljspeech-medium@0.9 | 69.2 s | 2.64 | 0.0% | -14.7 LUFS / -4.0 dBTP | 5 s | 26 s |

## Pace vs the contract (needs the lead's attention)
Kokoro af_heart at speed 1.0 reads about **3.0 words/s**, not the 2.5 the contract assumes. At 1.0, 150 words would
be ~52 s and fail the 58 s floor. The default speed is therefore 0.85 (Kokoro's speed is not linear: 0.85 gives
~2.72 words/s, still a brisk read; the playbook's "speed ~1.0-1.1" is wrong for this voice).
At the default, a 7-beat script runs `words / 2.72 + 2.25 s` (lead-in, 6 gaps, tail):

| Words | 150 | 160 | 177 | 185 | 195 |
|---|---|---|---|---|---|
| Seconds | 57.4 | 61.1 | 67.3 | 70.3 | 74.0 |

So the contract's 150-185 words gives 57-70 s. **To meet the playbook's >= 62 s rule, aim for 165-195 words**
(proposal for the contract; I have not edited it). Per script you can also set `"voiceSpeed": 0.8` (0.5-2.0) or put
the speed in the voice spec: `"voice": "kokoro:af_heart@0.9"`.

## Pronunciation (lexicon) findings
Both engines phonemize with espeak-ng, which already reads all-caps acronyms as letters. A whisper round-trip of
raw text got GPT, LLM, LLMs, API, GPU, TPUs, AGI, RLHF, TSMC, H100, OpenAI, Nvidia, ChatGPT, Anthropic, Mistral,
Hugging Face, Copilot, Perplexity, Sam Altman, Satya Nadella, "40%", "2,000,000", "$13 billion", "2026", "1990s",
"3x" and "Gemini 2.5" right. **Spelling acronyms out made it worse**: "Open A I and en-vidia trained a new L L M" came
back as "Open a eye on NVIDIA, trained in new LLM", and "an A P I" as "a PI". So the suggested "G P T" / "Open A I" /
"L L M" / "en-vidia" entries were not added. Entries that fixed real failures:

| Script | TTS gets | Why |
|---|---|---|
| LLaMA | Llama | mixed case read as "Elizame" |
| A.I. | AI | read as "8i" |
| GPT-4o / o1 / o3 | GPT four oh / oh 1 / oh 3 | read as "GPT-40", "01" |
| Hassabis, Amodei | Hassabbis, Ah-mo-day | "Hasabas", "Amodi" |
| Qwen | Chwen | read as "QN" |
| vs. / e.g. / i.e. / SaaS | versus / for example / that is / sass | "VSRS" |
| $5B, $5M, $5K | 5 billion dollars ... | letter suffix |
| 40% | 40 percent | harmless, explicit |

The lexicon is `LEXICON` in voice.py (regex, case-sensitive). Add an entry only after a round-trip check. A script
can add its own: `"lexicon": {"Kaggle": "Kag-gull"}` (whole word, exact case). Captions always show the script's
own tokens; the lexicon only changes what the TTS is given.

## How `voice` works
`cd engine && python -m clipper voice --script <script.json> [--force] [--no-length-check]`
1. Each beat is synthesized separately (cached by voice + text in `work/explainers/.tts-cache/`, so editing one beat
   only re-voices that beat), edge silence trimmed, then joined: 0.15 s lead-in, 0.25 s between beats, 0.6 s tail.
   Sentence pauses inside a beat come from the TTS.
2. Length guard 58-80 s, before the slow steps. Outside it the command prints the duration and how many words to
   add/cut at the measured words/s (and how many to land at 62 s / 75 s), writes nothing, and exits 3.
3. Two-pass loudnorm to -14 LUFS / -1 dBTP via `audio.extract_normalized` -> `voice.wav` (48 kHz stereo s16).
4. whisper small.en (beam 5, no VAD) transcribes voice.wav for timings only. Script tokens are matched to whisper's
   words character by character on their spoken form, so "40%" is timed over "forty percent", "2,000,000" over
   "2 million", and "OpenAI" over "Open AI". The whole narration is matched at once, then each word is clamped into
   its beat's exact spoken span; words whisper missed are interpolated between their neighbours (listed in
   `interpolated`). Finally a word's start is moved past any real pause (>= 0.12 s of silence) that whisper
   swallowed into it, and words are at least 0.08 s long and never overlap.
5. Numeric QA, recorded in `warnings`: TTS pace per beat outside 1.6-4.2 words/s, a pause > 1.2 s inside a beat,
   loudness off target, clipped samples after normalisation, WER > 8%, many interpolated words.

`work/explainers/<id>/voice.json`:
```json
{ "id": "...", "voice": "kokoro:af_heart@0.85", "duration": 67.29, "sampleRate": 48000,
  "wordsPerSecond": 2.72, "speechSeconds": 65.04, "wer": 0.0, "lufs": -14.14, "truePeak": -3.98,
  "loudnorm": "dynamic", "interpolated": [], "transcript": "whisper's text, for QA", "warnings": [],
  "beats": [ { "t0": 0.0, "t1": 3.94, "speech": [0.15, 3.79] } ],
  "words": [ { "w": "Your", "s": 0.15, "e": 0.36 } ],
  "scriptHash": "...", "timing": { "synthSeconds": 24.1, "whisperSeconds": 22.1 } }
```
`beats` tile 0..duration (a beat's visual starts up to 0.1 s before its first word); `speech` is the exact spoken
span. `words[].w` are the script's tokens with punctuation attached (clip contract format). A cached voice.json is
reused when the beats' text, voice, speed and lexicon are unchanged.

Setup: `bash scripts/setup.sh` runs `python -m clipper.tts_backends fetch default piper:en_US-ljspeech-medium`,
which downloads into `~/.cache/clipper-tts` (or `$CLIPPER_TTS_CACHE`) once, verifies pinned sha256s, and retries
cut-off transfers. Synthesis itself never touches the network.

## Licences (quoted from the files fetched 2026-10-09)

**Kokoro-82M weights and voice packs** (hexgrad/Kokoro-82M README.md on Hugging Face; front matter
`license: apache-2.0`): "With Apache-licensed weights, Kokoro can be deployed anywhere from production environments
to personal projects." and "This is an Apache-licensed model, and Kokoro has been deployed in numerous projects and
commercial APIs." Training data: "Kokoro was trained exclusively on **permissive/non-copyrighted audio data** and IPA
phoneme labels", including "Synthetic audio generated by closed TTS models from large providers". CC BY audio in the
training set (Koniwa, CC BY 3.0; SIWIS, CC BY 4.0) is listed in the card's attribution section. The ONNX export
and voices-v1.0.bin come from the kokoro-onnx GitHub release (github.com/thewh1teagle/kokoro-onnx), whose README
says "kokoro-onnx: MIT" and "kokoro model: Apache 2.0"; the installed package ships an MIT LICENSE ("Copyright (c)
2025 github.com/thewh1teagle").

**Piper en_US-ljspeech** (MODEL_CARD, medium and high): "Dataset ... URL: https://keithito.com/LJ-Speech-Dataset/
... License: public domain". The rhasspy/piper-voices repo README front matter says `license: mit`.

**Software**: piper-tts 1.8.0 metadata "License: GPL-3.0-or-later" (github.com/OHF-voice/piper1-gpl).
phonemizer 3.4.0 (pulled in by kokoro-onnx) ships the GNU GPL v3 text. Both engines use espeak-ng (GPL-3.0), loaded
from the espeakng-loader wheel (no licence in its metadata) or bundled inside piper. onnxruntime: MIT.

### Flags (not clearly OK; decide before scaling)
1. **GPL software in-process.** voice.py imports piper (GPL-3.0+) and kokoro-onnx imports phonemizer (GPL-3.0) and
   loads espeak-ng. Running GPL code privately to make audio puts no GPL terms on the audio. The obligations apply if
   this engine's code is ever distributed (e.g. the repo made public or shipped). The playbook suggests running
   Piper as a separate process for that reason; the Kokoro path has the same issue through phonemizer. Low risk
   while the repo is private.
2. **Kokoro voice provenance.** The weights are Apache-2.0, but some training audio was "synthetic audio generated
   by closed TTS models from large providers", and the card does not say which voice came from what. Voices named
   like another vendor's voices (af_alloy, af_nova, af_sky, am_echo, am_onyx, bm_fable) are blocked in
   tts_backends.BLOCKED. "Sky" is also the name of a commercial voice pulled over its resemblance to a real actor.
   af_heart's source is undocumented. The narrator is labelled "AI narrator" on screen and must carry the platform
   AI label.
3. **Piper ljspeech imitates one real reader** (the LJ Speech recordings, public domain). The licence is fine, but
   rule 2 (no real person's likeness) makes Kokoro the safer default; keep Piper as a fallback only.
4. **Piper voice weights' own licence** is not stated in the ljspeech MODEL_CARD (only the dataset's). The repo is
   tagged MIT. Treated as OK; flagging it because it is inferred.
5. Blocked Piper voices (per playbook): lessac (research-only), ryan, hfc_*, semaine, l2arctic (non-commercial),
   amy (unverified).

## Known limits
- loudnorm runs in "dynamic" mode on this material, so true peak lands around -4 dBTP (under the -1 ceiling) and
  integrated loudness within 0.2-0.7 LU of -14.
- Word timings come from whisper (±50-100 ms typical). Very short function words are stretched to 0.08 s.
- Kokoro is weaker on very short utterances (< 10-20 phonemes, per its VOICES.md); keep beat 1 to a full sentence.
