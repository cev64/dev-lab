#!/usr/bin/env python3
"""Package one night's explainers for delivery to Charlie's Claude Duet chat.

Pulls the backup branch videos/<date> (pushed by scripts/publish-videos.sh) into DEST, then reads its README.md
(a copy of deliveries/<date>.md) and writes, per video in posting order, <id>.tiktok.txt with the TikTok description
to paste. Prints a JSON manifest the Duet routine posts from:
  {"date", "videos": [{"slot", "hook", "id", "mp4", "cover", "caption_file", "caption"}]}
Usage: python3 scripts/duet-package.py 2026-10-26 /mnt/project-files/tiktok/2026-10-26
Exit 2 if the night has no videos branch yet (the run hasn't finished or didn't run).
"""
import json, re, subprocess, sys
from pathlib import Path

def git(*args, cwd):
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True)

def fetch(date, dest, root):
    branch = f"videos/{date}"
    if not subprocess.run(["git", "ls-remote", "--exit-code", "--heads", "origin", branch], cwd=root,
                          capture_output=True).stdout:
        sys.exit(2)
    git("fetch", "-q", "--depth", "1", "origin", branch, cwd=root)
    dest.mkdir(parents=True, exist_ok=True)
    tar = git("archive", "FETCH_HEAD", cwd=root).stdout
    subprocess.run(["tar", "-x", "-C", str(dest)], input=tar, check=True)

def parse(readme):
    text = readme.read_text()
    order = re.findall(r"^\d+\.\s+(\w+)[^:]*:\s+(.+?)\s+\(`([^`]+)`\)\s*$", text, re.M)
    captions = {}
    for block in re.split(r"^## Explainer", text, flags=re.M)[1:]:
        vid = re.search(r"\*\*Video:\*\*\s+`[^`]*?([^/`]+)\.mp4`", block)
        cap = re.search(r"TikTok description \(paste as is\):\s*```\n(.*?)\n```", block, re.S)
        if vid and cap:
            captions[vid.group(1)] = cap.group(1).strip()
    return order, captions

def main():
    date, dest = sys.argv[1], Path(sys.argv[2])
    root = Path(__file__).resolve().parent.parent
    fetch(date, dest, root)
    order, captions = parse(dest / "README.md")
    videos = []
    for slot, hook, vid in order:
        mp4, cover = dest / f"{vid}.mp4", dest / f"{vid}.cover.png"
        caption = captions.get(vid, "")
        cap_file = dest / f"{vid}.tiktok.txt"
        cap_file.write_text(caption + "\n")
        videos.append({"slot": slot, "hook": hook, "id": vid,
                       "mp4": str(mp4) if mp4.exists() else None,
                       "cover": str(cover) if cover.exists() else None,
                       "caption_file": str(cap_file), "caption": caption})
    print(json.dumps({"date": date, "videos": videos}, indent=2))

if __name__ == "__main__":
    main()
