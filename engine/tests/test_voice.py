import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

import _path  # noqa: F401

from clipper import tts_backends as tts
from clipper import voice as V
from clipper.common import Paths, read_json, write_json


class Lexicon(unittest.TestCase):
    def test_tts_text_rewrites_only_listed_terms(self):
        self.assertEqual(V.tts_text("LLaMA beat GPT on an API"), "Llama beat GPT on an API")
        self.assertEqual(V.tts_text("It is 40% faster"), "It is 40 percent faster")
        self.assertEqual(V.tts_text("a $5B round"), "a 5 billion dollars round")
        self.assertEqual(V.tts_text("o1 and GPT-4o"), "oh 1 and GPT four oh")
        self.assertEqual(V.tts_text("Claude vs. Gemini, e.g. today"), "Claude versus Gemini, for example, today")
        self.assertEqual(V.tts_text("  two   spaces\n"), "two spaces")

    def test_script_lexicon_is_whole_word(self):
        out = V.tts_text("Kaggle and Kagglers", {"Kaggle": "Kag-gull"})
        self.assertEqual(out, "Kag-gull and Kagglers")

    def test_captions_keep_script_tokens(self):
        say = "Say 40% of chats — about 2,000,000 — are small talk."
        toks = V.caption_tokens(say)
        self.assertIn("40%", toks)
        self.assertIn("2,000,000 —", toks)
        self.assertEqual(toks[2], "of")
        self.assertEqual(" ".join(toks), say)

    def test_leading_punctuation_token_glued_forward(self):
        self.assertEqual(V.caption_tokens("— so what?"), ["— so", "what?"])


class SpokenForm(unittest.TestCase):
    def test_numbers(self):
        sw = V.spoken_words
        self.assertEqual(sw("40%"), ["forty", "percent"])
        self.assertEqual(sw("2,000,000"), ["two", "million"])
        self.assertEqual(sw("2 million"), ["two", "million"])
        self.assertEqual(sw("1,500"), ["one", "thousand", "five", "hundred"])
        self.assertEqual(sw("in 2026."), ["in", "twenty", "twenty", "six"])
        self.assertEqual(sw("2005"), ["two", "thousand", "five"])
        self.assertEqual(sw("1990s"), ["nineteen", "nineties"])
        self.assertEqual(sw("3.5x"), ["three", "point", "five", "x"])
        self.assertEqual(sw("10x"), ["ten", "x"])
        self.assertEqual(sw("21st"), ["twenty", "first"])
        self.assertEqual(sw("$5B"), ["five", "billion"])
        self.assertEqual(sw("H100"), ["h", "one", "hundred"])
        self.assertEqual(sw("dog's"), ["dogs"])
        self.assertEqual(sw("short-form, AI!"), ["short", "form", "ai"])

    def test_wer(self):
        self.assertEqual(V.word_error_rate(["a", "b", "c"], ["a", "b", "c"]), 0.0)
        self.assertAlmostEqual(V.word_error_rate(["a", "b", "c", "d"], ["a", "x", "c"]), 0.5)


def ww(*items):
    return [{"w": w, "s": s, "e": e} for w, s, e in items]


class Alignment(unittest.TestCase):
    def check_order(self, timed, span):
        for (s, e), (s2, _e2) in zip(timed, timed[1:]):
            self.assertLess(s, e)
            self.assertLessEqual(e, s2 + 1e-9)
        self.assertGreaterEqual(timed[0][0], span[0])
        self.assertLessEqual(timed[-1][1], span[1] + 0.1)

    def test_percent_spoken_as_words(self):
        toks = ["Say", "40%", "of", "chats."]
        w = ww(("Say", 1.0, 1.2), ("forty", 1.2, 1.5), ("percent", 1.5, 1.9), ("of", 1.9, 2.0), ("chats.", 2.0, 2.4))
        timed, missing = V.align_tokens(toks, w, (1.0, 2.4))
        self.assertEqual(missing, [])
        self.assertEqual(timed[1], (1.2, 1.9))
        self.check_order(timed, (1.0, 2.4))

    def test_big_number_written_differently(self):
        toks = ["accept", "2,000,000", "tokens."]
        w = ww(("accept", 0.0, 0.4), ("2", 0.4, 0.6), ("million", 0.6, 1.0), ("tokens.", 1.0, 1.5))
        timed, missing = V.align_tokens(toks, w, (0.0, 1.5))
        self.assertEqual(missing, [])
        self.assertEqual(timed[1], (0.4, 1.0))
        w2 = ww(("accept", 0.0, 0.4), ("2,000,000", 0.4, 1.0), ("tokens", 1.0, 1.5))
        self.assertEqual(V.align_tokens(toks, w2, (0.0, 1.5))[0][1], (0.4, 1.0))

    def test_punctuation_and_case_ignored(self):
        toks = ["Here's", "the", "trick."]
        w = ww(("here's", 0.0, 0.3), ("the", 0.3, 0.45), ("trick", 0.45, 0.9))
        timed, missing = V.align_tokens(toks, w, (0.0, 0.9))
        self.assertEqual(missing, [])
        self.assertEqual(timed, [(0.0, 0.3), (0.3, 0.45), (0.45, 0.9)])

    def test_dropped_word_is_interpolated(self):
        toks = ["one", "long", "block", "of", "text."]
        w = ww(("one", 0.0, 0.3), ("long", 0.3, 0.6), ("of", 1.0, 1.1), ("text", 1.1, 1.5))  # "block" missing
        timed, missing = V.align_tokens(toks, w, (0.0, 1.5))
        self.assertEqual(missing, [2])
        self.assertEqual(timed[2], (0.6, 1.0))
        self.check_order(timed, (0.0, 1.5))

    def test_dropped_word_without_gap_borrows_time(self):
        toks = ["a", "very", "big", "deal"]
        w = ww(("a", 0.0, 0.2), ("very", 0.2, 0.6), ("deal", 0.6, 1.0))
        timed, missing = V.align_tokens(toks, w, (0.0, 1.0))
        self.assertEqual(missing, [2])
        self.check_order(timed, (0.0, 1.0))
        self.assertGreaterEqual(timed[2][1] - timed[2][0], 0.08)

    def test_extra_and_misheard_words(self):
        toks = ["The", "model", "predicts", "words."]
        w = ww(("The", 0.0, 0.1), ("uh", 0.1, 0.2), ("modal", 0.2, 0.5), ("predicts", 0.5, 0.9), ("words", 0.9, 1.2))
        timed, missing = V.align_tokens(toks, w, (0.0, 1.2))
        self.assertEqual(missing, [])
        self.assertAlmostEqual(timed[1][0], 0.2, delta=0.05)
        self.check_order(timed, (0.0, 1.2))

    def test_nothing_recognised_spreads_over_span(self):
        toks = ["alpha", "beta", "gamma"]
        timed, missing = V.align_tokens(toks, [], (2.0, 3.5))
        self.assertEqual(missing, [0, 1, 2])
        self.assertEqual(timed[0][0], 2.0)
        self.assertAlmostEqual(timed[-1][1], 3.5, delta=0.01)
        self.check_order(timed, (2.0, 3.5))

    def test_overlapping_whisper_times_become_monotonic(self):
        toks = ["a", "b", "c", "d"]
        w = ww(("a", 0.0, 0.5), ("b", 0.3, 0.6), ("c", 0.55, 0.58), ("d", 0.5, 1.0))
        timed, _ = V.align_tokens(toks, w, (0.0, 1.0))
        self.check_order(timed, (0.0, 1.0))
        for s, e in timed:
            self.assertGreaterEqual(round(e - s, 2), 0.02)

    def test_snap_moves_start_past_pause(self):
        sr = 16000
        x = np.zeros(int(2.0 * sr), dtype=np.float32)
        t = np.arange(int(0.5 * sr)) / sr
        x[: len(t)] = 0.3 * np.sin(2 * np.pi * 200 * t)            # word 1: 0.0-0.5
        x[int(1.0 * sr): int(1.0 * sr) + len(t)] = x[: len(t)]     # word 2: 1.0-1.5 (pause 0.5-1.0)
        words = [{"w": "top,", "s": 0.0, "e": 0.5}, {"w": "every", "s": 0.5, "e": 1.5}]
        V.snap_to_speech(words, x, sr)
        self.assertAlmostEqual(words[1]["s"], 1.0, delta=0.02)
        self.assertEqual(words[0], {"w": "top,", "s": 0.0, "e": 0.5})


class Beats(unittest.TestCase):
    def test_beats_tile_and_are_monotonic(self):
        speech = [(0.15, 3.0), (3.25, 10.0), (10.25, 20.0)]
        beats = V.beat_windows(speech, 20.6)
        self.assertEqual(beats[0]["t0"], 0.0)
        self.assertEqual(beats[-1]["t1"], 20.6)
        for b, nxt in zip(beats, beats[1:]):
            self.assertEqual(b["t1"], nxt["t0"])
        for b in beats:
            self.assertLess(b["t0"], b["t1"])
            self.assertLessEqual(b["t0"], b["speech"][0])
            self.assertLessEqual(b["speech"][1], b["t1"])
        self.assertAlmostEqual(beats[1]["t0"], 3.25 - 0.1, places=2)

    def test_trim_silence(self):
        sr = 24000
        tone = (0.5 * np.sin(np.arange(sr) / sr * 2 * np.pi * 220)).astype(np.float32)
        x = np.concatenate([np.zeros(sr, np.float32), tone, np.zeros(sr, np.float32)])
        y = V.trim_silence(x, sr)
        self.assertAlmostEqual(len(y) / sr, 1.07, delta=0.03)
        self.assertEqual(len(V.trim_silence(np.zeros(sr, np.float32), sr)), 0)


class LengthGuard(unittest.TestCase):
    def test_inside_range(self):
        self.assertIsNone(V.length_problem(58.0, 160, 55.0))
        self.assertIsNone(V.length_problem(80.0, 200, 76.0))

    def test_too_short_says_how_many_to_add(self):
        msg = V.length_problem(50.0, 135, 50.0)  # 2.7 words/s
        self.assertIn("ADD at least 22 words", msg)
        self.assertIn("2.70 words/s", msg)

    def test_too_long_says_how_many_to_cut(self):
        msg = V.length_problem(84.0, 220, 80.0)  # 2.75 words/s
        self.assertIn("CUT at least 11 words", msg)


class Specs(unittest.TestCase):
    def test_parse(self):
        self.assertEqual(tts.parse_spec("default"), tts.VoiceSpec("kokoro", "af_heart", tts.DEFAULT_SPEED["kokoro"]))
        self.assertEqual(tts.parse_spec(None).engine, "kokoro")
        vs = tts.parse_spec("piper:en_US-ljspeech-medium@1.1")
        self.assertEqual((vs.engine, vs.voice, vs.speed), ("piper", "en_US-ljspeech-medium", 1.1))
        self.assertEqual(tts.parse_spec("kokoro:bf_emma", 0.9).speed, 0.9)

    def test_rejects_bad_and_blocked(self):
        for bad in ("espeak:x", "af_heart", "piper:en_US-lessac-medium", "kokoro:af_sky", "kokoro:af_heart@3"):
            with self.assertRaises(ValueError, msg=bad):
                tts.parse_spec(bad)

    def test_piper_url(self):
        self.assertEqual(tts.piper_url("en_US-ljspeech-medium"),
                         tts.PIPER_BASE + "en/en_US/ljspeech/medium/en_US-ljspeech-medium")


class FakeBackend:
    """Tone bursts, 0.36 s per word, so durations are predictable without a TTS model."""

    sample_rate = 24000

    def __init__(self, spec):
        self.spec = spec

    def synth(self, text):
        sr, out = self.sample_rate, []
        t = np.arange(int(0.3 * sr)) / sr
        for _ in text.split():
            out += [0.4 * np.sin(2 * np.pi * 180 * t), np.zeros(int(0.06 * sr))]
        return np.concatenate(out).astype(np.float32)


def fake_whisper(samples, model, **kw):
    """Pretend whisper heard the script perfectly, word by word over the voiced tone bursts."""
    rms = np.array([np.sqrt(np.mean(samples[i:i + 160] ** 2)) for i in range(0, len(samples) - 160, 160)])
    on = rms > 0.05
    starts = [i for i in range(1, len(on)) if on[i] and not on[i - 1]] + ([0] if on[0] else [])
    starts.sort()
    words = []
    for k, i in enumerate(starts):
        j = i
        while j < len(on) and on[j]:
            j += 1
        words.append({"w": FAKE_WORDS[k] if k < len(FAKE_WORDS) else "x", "s": i / 100, "e": j / 100})
    return [{"s": words[0]["s"], "e": words[-1]["e"], "text": " ".join(w["w"] for w in words), "words": words}]


FAKE_WORDS: list[str] = []


class Pipeline(unittest.TestCase):
    def run_voice(self, n_words_per_beat, beats=6):
        global FAKE_WORDS
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp, True)
        say = [" ".join(f"word{chr(97 + b)}{chr(97 + i % 26)}" for i in range(n_words_per_beat)) for b in range(beats)]
        say[0] = say[0].replace("worda" + "c", "40%", 1)
        FAKE_WORDS = [w.replace("40", "forty") for s in say for w in V.tts_text(s).split()]
        script = {"id": "t-voice", "voice": "default", "beats": [{"say": s, "visual": {}} for s in say]}
        write_json(tmp / "script.json", script)
        with mock.patch.object(tts, "load", lambda spec: FakeBackend(spec)), \
                mock.patch("clipper.transcribe.whisper_segments", fake_whisper):
            res = V.voice(Paths(tmp), tmp / "script.json")
        return tmp, res, say

    def test_end_to_end_with_fake_tts_and_whisper(self):
        tmp, res, say = self.run_voice(28)  # 168 words * 0.36 s + gaps = ~62 s
        d = tmp / "work" / "explainers" / "t-voice"
        self.assertTrue((d / "voice.wav").exists())
        self.assertEqual(read_json(d / "voice.json")["duration"], res["duration"])
        self.assertTrue(V.MIN_S <= res["duration"] <= V.MAX_S)
        self.assertAlmostEqual(res["lufs"], -14.0, delta=1.0)
        self.assertLessEqual(res["truePeak"], -0.9)
        words = res["words"]
        self.assertEqual([w["w"] for w in words], [w for s in say for w in s.split()])
        self.assertIn("40%", [w["w"] for w in words])
        for a, b in zip(words, words[1:]):
            self.assertLess(a["s"], a["e"])
            self.assertLessEqual(a["e"], b["s"])
        beats = res["beats"]
        self.assertEqual(len(beats), 6)
        self.assertEqual(beats[0]["t0"], 0.0)
        self.assertEqual(beats[-1]["t1"], res["duration"])
        for b, nxt in zip(beats, beats[1:]):
            self.assertEqual(b["t1"], nxt["t0"])
            self.assertAlmostEqual(nxt["speech"][0] - b["speech"][1], V.BEAT_GAP, delta=0.06)
        # every word sits inside its own beat's spoken span
        k = 0
        for b, s in zip(beats, say):
            for _ in s.split():
                self.assertGreaterEqual(words[k]["s"], b["speech"][0] - 0.01)
                self.assertLessEqual(words[k]["e"], b["speech"][1] + 0.01)
                k += 1
        self.assertEqual(res["interpolated"], [])
        # second run is served from cache
        with mock.patch.object(tts, "load", side_effect=AssertionError("should be cached")):
            self.assertEqual(V.voice(Paths(tmp), tmp / "script.json")["scriptHash"], res["scriptHash"])

    def test_duration_guard_fails_before_writing(self):
        global FAKE_WORDS
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp, True)
        script = {"id": "t-short", "beats": [{"say": "too short " * 5, "visual": {}}] * 5}
        write_json(tmp / "script.json", script)
        with mock.patch.object(tts, "load", lambda spec: FakeBackend(spec)):
            with self.assertRaises(V.LengthError) as cm:
                V.voice(Paths(tmp), tmp / "script.json")
        self.assertIn("ADD at least", str(cm.exception))
        self.assertFalse((tmp / "work" / "explainers" / "t-short" / "voice.json").exists())


if __name__ == "__main__":
    unittest.main()
