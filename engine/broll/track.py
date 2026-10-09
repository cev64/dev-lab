"""Background track: one 1080x1920 / 30 fps / silent H.264 file covering the whole narration.

Per beat: stock video trimmed (or looped) to the beat, scaled/cropped to fill 9:16; stills (AI or stock photos) get a
slow Ken Burns move; beats with nothing get a dark slate. Beats are joined with short crossfades (centred on the
boundary between beats), then graded: lower contrast/saturation, darker overall, a vignette and a soft scrim over
the header and caption bands so the renderer's text and cards stay readable on any footage.

Ken Burns is done in Python (Pillow `resize(box=...)` with float coordinates, bicubic) and piped to ffmpeg:
ffmpeg's zoompan rounds the crop window to whole pixels, which visibly jitters on slow moves.
"""

from __future__ import annotations

import os
import random
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from . import FPS, H, W
from .spec import segment_frames

FADE_FRAMES = 10
COLOR_ARGS = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"]
SEG_X264 = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", "-x264-params", "threads=2"]


def _run(cmd: list[str], **kw):
    r = subprocess.run(cmd, capture_output=True, **kw)
    if r.returncode != 0:
        tail = (r.stderr or b"").decode("utf-8", "replace")[-1500:]
        raise RuntimeError(f"ffmpeg failed ({r.returncode}): {' '.join(cmd[:6])}...\n{tail}")
    return r


def probe_duration(path: Path) -> float | None:
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                           capture_output=True, text=True, timeout=30)
        return float(r.stdout.strip())
    except (ValueError, OSError, subprocess.SubprocessError):
        return None


# ---------------------------------------------------------------- Ken Burns

def kb_motion(seed: int) -> dict:
    """A gentle, seeded move: zoom in or out by ~10-13 % with a small drift, or a slow vertical/horizontal pan."""
    r = random.Random(seed)
    kind = r.choice(["in", "in", "out", "pan_v", "pan_h"])
    if kind == "in":
        return {"z0": 1.0, "z1": r.uniform(1.10, 1.14), "dx": r.uniform(-0.5, 0.5), "dy": r.uniform(-0.5, 0.3)}
    if kind == "out":
        return {"z0": r.uniform(1.10, 1.14), "z1": 1.0, "dx": r.uniform(-0.5, 0.5), "dy": r.uniform(-0.3, 0.5)}
    if kind == "pan_v":
        d = r.choice([-1, 1])
        return {"z0": 1.10, "z1": 1.12, "dx": 0.0, "dy": 0.9 * d, "from_edge": True}
    d = r.choice([-1, 1])
    return {"z0": 1.12, "z1": 1.12, "dx": 0.9 * d, "dy": 0.0, "from_edge": True}


def kb_boxes(img_w: int, img_h: int, n: int, motion: dict):
    """Per-frame float crop boxes (x0, y0, x1, y1) inside the image, all 9:16. dx/dy in [-1, 1] = fraction of the
    available margin used by the drift (pan moves from one side to the other when from_edge)."""
    # largest 9:16 rect centred in the image
    if img_w / img_h > W / H:
        bw, bh = img_h * W / H, float(img_h)
    else:
        bw, bh = float(img_w), img_w * H / W
    cx0, cy0 = img_w / 2, img_h / 2
    for i in range(n):
        p = i / max(1, n - 1)
        z = motion["z0"] + (motion["z1"] - motion["z0"]) * p
        vw, vh = bw / z, bh / z
        mx, my = (img_w - vw) / 2, (img_h - vh) / 2  # available margin each side
        if motion.get("from_edge"):
            fx, fy = motion["dx"] * (2 * p - 1), motion["dy"] * (2 * p - 1)
        else:
            fx, fy = motion["dx"] * p, motion["dy"] * p
        cx, cy = cx0 + fx * mx, cy0 + fy * my
        x0 = min(max(cx - vw / 2, 0.0), img_w - vw)
        y0 = min(max(cy - vh / 2, 0.0), img_h - vh)
        yield (x0, y0, x0 + vw, y0 + vh)


def render_still(image: Path, n: int, seed: int, out: Path) -> None:
    from PIL import Image

    im = Image.open(image).convert("RGB")
    # Pillow cannot sample outside the image, and a source smaller than the frame would be upscaled per frame:
    # pre-scale so the 9:16 base rect is at least W x H.
    s = max(W / min(im.width, im.height * W / H), H / min(im.height, im.width * H / W))
    if s > 1.0:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.Resampling.LANCZOS)
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-vf", "scale=out_color_matrix=bt709:out_range=tv", *SEG_X264, *COLOR_ARGS, str(out)]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        for box in kb_boxes(im.width, im.height, n, kb_motion(seed)):
            p.stdin.write(im.resize((W, H), Image.Resampling.BICUBIC, box=box).tobytes())
        p.stdin.close()
    except BrokenPipeError:
        pass
    err = p.stderr.read().decode("utf-8", "replace")
    if p.wait() != 0:
        raise RuntimeError(f"ffmpeg (still {image.name}) failed: {err[-1000:]}")


def render_video(src: Path, n: int, out: Path) -> None:
    dur = probe_duration(src) or 0.0
    need = n / FPS
    start = min(0.5, max(0.0, dur - need)) if dur else 0.0  # skip a possible fade-in when there is room
    vf = (f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=bicubic,crop={W}:{H},setsar=1,"
          "format=yuv420p")
    loop = ["-stream_loop", "-1"] if dur and dur < need + start else []
    _run(["ffmpeg", "-v", "error", "-y", *loop, "-ss", f"{start:.3f}", "-i", str(src), "-an", "-vf", vf,
          "-frames:v", str(n), *SEG_X264, *COLOR_ARGS, str(out)])


def render_slate(n: int, out: Path) -> None:
    src = f"gradients=s={W}x{H}:r={FPS}:c0=0x141a2a:c1=0x05070c:x0=0:y0=0:x1={W}:y1={H}:speed=0.004"
    _run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", src, "-frames:v", str(n), *SEG_X264, *COLOR_ARGS,
          str(out)])


# ---------------------------------------------------------------- grade + assembly

def make_scrim(path: Path, strength: float) -> Path:
    """RGBA PNG: transparent in the middle, darker behind the docked header (top) and the caption/credit band
    (y ~1000-1560), so text stays readable without killing the picture."""
    from PIL import Image

    import numpy as np

    y = np.arange(H, dtype=np.float32)

    def bump(c, half, soft):
        return np.clip(1 - (np.abs(y - c) - half) / soft, 0, 1)

    a = np.maximum(0.55 * bump(250, 140, 220), 0.70 * bump(1290, 270, 260))
    a = np.maximum(a, 0.45 * np.clip((y - 1500) / 420, 0, 1))
    alpha = (np.clip(a * strength, 0, 1) * 255).astype(np.uint8)
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[..., 3] = alpha[:, None]
    Image.fromarray(rgba, "RGBA").save(path)
    return path


def grade_filter(darken: float) -> str:
    """darken 0..1: 0 = untouched footage, ~0.5 = default (readable under white captions)."""
    lv = 1 - 0.45 * darken
    return (f"eq=contrast={1 + 0.06 * darken:.3f}:saturation={1 - 0.3 * darken:.3f}:gamma={1 - 0.12 * darken:.3f},"
            f"colorlevels=romax={lv:.3f}:gomax={lv:.3f}:bomax={min(1, lv + 0.03):.3f},"
            f"vignette=angle={0.35 + 0.35 * darken:.3f}")


def build(items: list[dict], spans, total: float, out: Path, work: Path, darken: float = 0.5,
          fade: int = FADE_FRAMES, jobs: int = 3, log=lambda m: None) -> Path:
    """items[i] = manifest entry for beat i ({kind, media, file, seed}). Writes `out` (mp4), returns it."""
    plan, total_f = segment_frames(spans, total, FPS, fade)
    work.mkdir(parents=True, exist_ok=True)

    def one(i):
        it, (_, n) = items[i], plan[i]
        seg = work / f"seg{i:02d}.mp4"
        f = it.get("file")
        if f and it.get("media") == "video":
            render_video(Path(f), n, seg)
        elif f:
            render_still(Path(f), n, int(it.get("seed") or 1000 + i), seg)
        else:
            render_slate(n, seg)
        return seg

    with ThreadPoolExecutor(max_workers=max(1, jobs)) as ex:
        segs = list(ex.map(one, range(len(items))))
    log(f"  {len(segs)} segments rendered")

    scrim = make_scrim(work / "scrim.png", min(1.0, 0.4 + darken))
    inputs, parts = [], []
    for i, s in enumerate(segs):
        inputs += ["-i", str(s)]
        parts.append(f"[{i}:v]fps={FPS},format=yuv420p,setsar=1,settb=AVTB[s{i}]")
    inputs += ["-loop", "1", "-framerate", str(FPS), "-i", str(scrim)]
    last = "s0"
    for i in range(1, len(segs)):
        off = plan[i][0] / FPS
        parts.append(f"[{last}][s{i}]xfade=transition=fade:duration={fade / FPS:.4f}:offset={off:.4f}[x{i}]")
        last = f"x{i}"
    parts.append(f"[{last}]{grade_filter(darken)}[g]")
    parts.append(f"[g][{len(segs)}:v]overlay=0:0:format=auto:shortest=1,tpad=stop_mode=clone:stop=30,"
                 "format=yuv420p[v]")
    tmp = out.with_suffix(".part.mp4")
    _run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(parts), "-map", "[v]", "-an",
          "-frames:v", str(total_f), "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
          "-pix_fmt", "yuv420p", *COLOR_ARGS, "-movflags", "+faststart", str(tmp)])
    os.replace(tmp, out)
    if os.environ.get("BROLL_KEEP_SEGMENTS") != "1":
        shutil.rmtree(work, ignore_errors=True)
    return out
