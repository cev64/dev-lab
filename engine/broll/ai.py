"""Local AI stills (CPU only, no key): SD-Turbo via diffusers, upscaled to a 9:16 frame with Ken Burns headroom.

HARD RULES (enforced here, not by convention):
- `build_prompt` REFUSES (raises PromptRefused) any subject that names a real person or public figure, a real
  brand/product/logo, or a real news event, and any proper noun at all: subjects must be generic and fictional
  ("a person working late at a laptop", "rows of servers"). The blocklists are a backstop; the capitalisation rule
  is the main gate (every capitalised word except the first must be on a small allowlist like AI/GPU/LED).
- The negative prompt always lists text, letters, logos, watermarks, brand names, celebrity likeness.
- Every image from here is tagged kind "ai" in the manifest so the renderer shows "AI-generated illustration".
- Seeds are fixed per beat (script id + beat index + prompt), so a re-run reproduces the same image.
"""

from __future__ import annotations

import hashlib
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path

from . import H, W

STYLE = ("editorial photo, photorealistic, cinematic lighting, shallow depth of field, 35mm lens, natural color, "
         "high detail, clean composition")
NEGATIVE = ("text, letters, words, caption, subtitles, typography, logo, brand name, trademark, watermark, "
            "signature, label, sign, screen text, user interface, celebrity, famous person, cartoon, illustration, "
            "painting, 3d render, anime, lowres, blurry, deformed, distorted face, extra fingers, extra limbs, "
            "duplicate, tiling, frame, border")


class PromptRefused(ValueError):
    pass


# Capitalised tokens allowed after the first word (generic tech nouns, not names).
CAPS_OK = {"AI", "GPU", "GPUs", "CPU", "CPUs", "LED", "LEDs", "3D", "VR", "AR", "TV", "USB", "DNA", "CCTV", "PC", "I"}

# Capitalised first words that are plainly generic (anything else must be written in lower case).
STARTERS = {"a", "an", "the", "one", "two", "three", "several", "many", "rows", "row", "close-up", "closeup", "aerial",
            "wide", "inside", "interior", "empty", "modern", "futuristic", "abstract", "hands", "hand", "person",
            "people", "robot", "robots", "robotic", "glowing", "dark", "silhouette", "silhouettes", "view", "macro",
            "overhead", "top-down", "night", "sunrise", "sunset", "city", "data", "server", "servers", "laptop",
            "office", "factory", "students", "student", "engineers", "engineer", "workers", "worker", "doctor",
            "scientist", "lab", "laboratory", "microchip", "circuit", "cables", "light", "blue", "green", "warm"}

# Backstop blocklists (lower-case; matched as whole words/phrases). Not exhaustive by design: the caps rule
# catches most names; these catch lower-cased ones.
PEOPLE = """altman musk zuckerberg pichai nadella huang amodei hassabis suleyman sutskever karpathy lecun hinton
bengio brockman murati bezos wozniak ballmer dorsey thiel andreessen masayoshi trump biden obama kamala vance putin
jinping zelensky modi macron sunak starmer netanyahu beyonce kardashian rogan fridman elon sundar satya jensen
dario demis ilya andrej yann geoffrey sergey""".split()
BRANDS = """openai chatgpt gpt gpt-4 gpt-5 sora dall-e dalle google gemini bard deepmind alphabet youtube iphone
ipad macbook siri microsoft copilot xbox bing azure nvidia geforce rtx cuda facebook instagram whatsapp llama
aws alexa kindle tesla spacex starlink twitter xai grok anthropic claude mistral perplexity midjourney
huggingface intel amd ibm oracle samsung huawei tiktok bytedance baidu alibaba tencent netflix disney marvel pixar
coca-cola pepsi nike adidas starbucks mcdonalds uber lyft airbnb optimus neuralink waymo""".split()
EVENTS = ["news photo", "press photo", "photojournalism", "reportage", "breaking news", "real event", "historical",
          "protest", "riot", "rally", "election", "ballot", "war", "battle", "bombing", "explosion", "attack",
          "shooting", "terror", "disaster", "earthquake", "hurricane", "wildfire", "crash", "accident", "arrest",
          "courtroom", "trial", "hearing", "testimony", "congress", "senate", "parliament", "white house",
          "capitol", "summit", "keynote", "press conference", "launch event", "inauguration", "funeral",
          "celebrity", "famous", "politician", "president", "prime minister", "ceo", "founder", "billionaire",
          "lookalike", "look-alike", "likeness", "in the style of", "portrait of", "photo of the real"]
TEXTY = ["text", "logo", "logos", "words", "lettering", "letters", "headline", "newspaper", "billboard", "signage",
         "sign", "caption", "watermark", "brand", "trademark", "slogan", "label", "poster", "banner", "typography"]

_WORD = re.compile(r"[A-Za-z0-9][A-Za-z0-9'\-.]*")


def check_subject(subject: str) -> str:
    """Return the cleaned subject or raise PromptRefused with the reason."""
    s = " ".join(str(subject or "").split()).strip(" ,.")
    if not s:
        raise PromptRefused("empty prompt")
    if len(s) > 300:
        raise PromptRefused("prompt too long (max 300 chars): describe one generic scene")
    low = s.lower()
    words = [w.strip("'.-") for w in _WORD.findall(s)]
    lw = {w.lower() for w in words}
    if re.search(r"\b(1[89]\d\d|20\d\d)\b", s):
        raise PromptRefused("prompt contains a year: AI stills must not depict dated real events")
    if words and words[0][0].isupper() and words[0] not in CAPS_OK and words[0].lower() not in STARTERS:
        raise PromptRefused(f"starts with {words[0]!r}: write the subject in lower case (generic, no names)")
    for w in words[1:]:
        if w and w[0].isupper() and w not in CAPS_OK:
            raise PromptRefused(f"proper noun {w!r}: AI stills must show generic, fictional subjects "
                                "(no real people, brands, places or events); describe it in lower case")
    for name in PEOPLE:
        if name in lw:
            raise PromptRefused(f"names a real person ({name!r})")
    for b in BRANDS:
        if b in lw:
            raise PromptRefused(f"names a real brand or product ({b!r})")
    for e in EVENTS:
        if re.search(r"\b" + re.escape(e) + r"\b", low):
            raise PromptRefused(f"real people/events are not allowed in AI stills ({e!r})")
    for t in TEXTY:
        if t in lw:
            raise PromptRefused(f"asks for {t!r}: the model draws garbled text, and logos are banned")
    return s


def build_prompt(subject: str) -> tuple[str, str]:
    """-> (prompt, negative_prompt). Raises PromptRefused."""
    s = check_subject(subject)
    s = re.sub(r",?\s*\b(photorealistic|photo-realistic|realistic photo)\b", "", s, flags=re.I).strip(" ,")
    return f"{s}, {STYLE}", NEGATIVE


def seed_for(script_id: str, beat: int, prompt: str) -> int:
    return int(hashlib.sha256(f"{script_id}|{beat}|{prompt}".encode()).hexdigest()[:8], 16) & 0x7FFFFFFF


# ---------------------------------------------------------------- generation

@dataclass(frozen=True)
class ModelCfg:
    name: str
    repo: str
    width: int
    height: int
    steps: int


# Benchmarks (4 shared CPU cores, fp32): see docs/specs/broll.md. SD-Turbo is the default; SDXL-Turbo is ~3x
# slower per step and needs ~11 GB RAM in fp32, so it only runs when asked for.
MODELS = {
    "sd-turbo": ModelCfg("sd-turbo", "stabilityai/sd-turbo", 512, 768, 2),
    "sdxl-turbo": ModelCfg("sdxl-turbo", "stabilityai/sdxl-turbo", 512, 768, 1),
}
DEFAULT_MODEL = os.environ.get("CLIPPER_AI_MODEL", "sd-turbo")


def enabled() -> bool:
    return os.environ.get("CLIPPER_AI_BROLL", "").strip() in ("1", "true", "yes")


class Generator:
    """Lazy diffusers pipeline. torch/diffusers are imported only when the first image is generated."""

    def __init__(self, model: str = DEFAULT_MODEL, steps: int | None = None, log=lambda m: None):
        if model not in MODELS:
            raise ValueError(f"unknown model {model!r}; choose from {sorted(MODELS)}")
        self.cfg = MODELS[model]
        self.steps = steps or self.cfg.steps
        self.log = log
        self._pipe = None

    def _load(self):
        if self._pipe is not None:
            return self._pipe
        try:
            import torch
            from diffusers import AutoPipelineForText2Image
        except ImportError as e:
            raise RuntimeError("AI B-roll needs torch + diffusers: CLIPPER_AI_BROLL=1 bash scripts/setup.sh") from e
        torch.set_num_threads(max(1, os.cpu_count() or 4))
        t = time.time()
        kw = dict(variant="fp16", torch_dtype=torch.float32)
        if os.environ.get("HF_HUB_OFFLINE") is None:
            os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
        pipe = AutoPipelineForText2Image.from_pretrained(self.cfg.repo, **kw)
        pipe.set_progress_bar_config(disable=True)
        self._pipe = pipe
        self.log(f"  loaded {self.cfg.repo} in {time.time() - t:.0f}s")
        return pipe

    def generate(self, prompt: str, negative: str, seed: int):
        import torch

        pipe = self._load()
        g = torch.Generator("cpu").manual_seed(seed)
        # Turbo models are distilled for guidance 0 (no CFG). With CFG off diffusers ignores the negative prompt,
        # so it only applies when CLIPPER_AI_CFG > 1 (2x slower); the prompt builder's refusals do the real work.
        cfg = float(os.environ.get("CLIPPER_AI_CFG", "0"))
        t = time.time()
        img = pipe(prompt=prompt, negative_prompt=negative if cfg > 1 else None, num_inference_steps=self.steps,
                   guidance_scale=cfg, width=self.cfg.width, height=self.cfg.height, generator=g).images[0]
        self.log(f"  generated {self.cfg.width}x{self.cfg.height} in {time.time() - t:.1f}s (seed {seed})")
        return img


def finish(img, out: Path, headroom: float = 1.125) -> tuple[int, int]:
    """Centre-crop to 9:16, Lanczos-upscale to (W, H) x headroom (room for Ken Burns without a second upscale),
    light unsharp mask, save as a high-quality JPEG. -> (width, height)."""
    from PIL import Image, ImageFilter

    w, h = img.size
    if w / h > 9 / 16:
        cw = round(h * 9 / 16)
        img = img.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
    else:
        ch = round(w * 16 / 9)
        img = img.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
    tw, th = round(W * headroom), round(H * headroom)
    img = img.convert("RGB").resize((tw, th), resample=Image.Resampling.LANCZOS)
    img = img.filter(ImageFilter.UnsharpMask(radius=2.0, percent=55, threshold=2))
    return _save(img, out)


def _save(img, out: Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, quality=94, subsampling=0)
    return img.size
