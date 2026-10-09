"""package: append post copy + credits to deliveries/<date>.md and record the clip in data/ledger.json."""

from __future__ import annotations

import re
from pathlib import Path

from . import ledger
from .common import Paths, hms, log, read_json


def source_for(paths: Paths, show_slug: str | None, show_name: str) -> dict:
    cfg = read_json(paths.sources) or {"sources": []}
    for s in cfg["sources"]:
        if s["slug"] == show_slug or s["name"] == show_name:
            return s
    return {"name": show_name, "creditFormat": "Clip from {show} {episode}", "hosts": ""}


def credit_line(fmt: str, show: str, episode: str) -> str:
    return (fmt or "Clip from {show} {episode}").format(show=show, episode=episode).strip()


def hashtags(tags: list[str]) -> str:
    return " ".join("#" + re.sub(r"[^\w]", "", t.lstrip("#")) for t in tags if t.strip("# "))


def delivery_block(clip: dict, sel: dict, meta: dict, credit: str, video_rel: str | None) -> str:
    src = clip["source"]
    post = sel.get("caption", "").strip()
    tags = hashtags(sel.get("hashtags", []))
    lines = [
        f"## {sel.get('title') or clip['hook']}",
        "",
        f"**Hook:** {clip['hook']}  ",
        f"**Video:** `{video_rel}` ({clip['duration']:.1f} s)" if video_rel else "**Video:** not rendered",
        "",
        "Post text (paste as is):",
        "",
        "```",
        post + ("\n\n" + tags if tags else ""),
        "```",
        "",
        f"- Credit: {credit}",
        f"- Source: {meta.get('show', '')}, {meta.get('title', '')}, {hms(src['start'])}-{hms(src['end'])}",
    ]
    if meta.get("link"):
        lines.append(f"- Episode: {meta['link']}")
    if sel.get("score") is not None:
        lines.append(f"- Rubric score: {sel['score']}")
    lines += [f"- Clip id: `{clip['id']}`", ""]
    return "\n".join(lines) + "\n"


def package(paths: Paths, *, date: str, clip: dict, sel: dict, meta: dict, video: Path | None) -> None:
    src_cfg = source_for(paths, meta.get("showSlug"), meta.get("show", ""))
    credit = credit_line(src_cfg.get("creditFormat", ""), meta.get("show", ""), meta.get("title", ""))
    video_rel = str(video.relative_to(paths.root)) if video and video.is_relative_to(paths.root) else (str(video) if video else None)

    path = paths.deliveries / f"{date}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    existing = path.read_text(encoding="utf-8") if path.exists() else f"# Deliveries {date}\n\n"
    if f"`{clip['id']}`" in existing:
        log(f"package: {clip['id']} already in {path}")
    else:
        path.write_text(existing + delivery_block(clip, sel, meta, credit, video_rel), encoding="utf-8")
        log(f"package: appended to {path}")

    data = ledger.load(paths.ledger)
    if any(c["id"] == clip["id"] for c in data["clips"]):
        log(f"package: {clip['id']} already in ledger")
        return
    ledger.add_clip(
        data,
        eid=meta["eid"],
        episode={"show": meta.get("show", ""), "title": meta.get("title", ""), "link": meta.get("link", "")},
        clip={
            "id": clip["id"], "date": date, "start": clip["source"]["start"], "end": clip["source"]["end"],
            "title": sel.get("title", ""), "hook": clip["hook"], "video": video_rel,
        },
    )
    ledger.save(paths.ledger, data)
    log(f"package: ledger updated ({len(data['clips'])} clips total)")
