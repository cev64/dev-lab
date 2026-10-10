#!/usr/bin/env bash
# Backup delivery: push tonight's videos to their own orphan branch `videos/<date>` so Charlie can always download
# them from GitHub (repo -> branch -> file -> Download raw), then delete video branches older than KEEP_DAYS.
# Usage: scripts/publish-videos.sh 2026-10-09
set -euo pipefail
DATE="${1:?usage: publish-videos.sh YYYY-MM-DD}"
KEEP_DAYS="${KEEP_DAYS:-14}"
ROOT="$(git rev-parse --show-toplevel)"
SRC="$ROOT/out/$DATE"
[ -d "$SRC" ] || { echo "no $SRC"; exit 1; }
ls "$SRC"/*.mp4 >/dev/null 2>&1 || { echo "no mp4 files in $SRC"; exit 1; }

TMP="$(mktemp -d)"
trap 'cd "$ROOT"; git worktree remove --force "$TMP" >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT
git -C "$ROOT" worktree add --detach "$TMP" >/dev/null
# A same-day re-run finds the local branch left by the previous run: drop it (the push below is forced anyway).
git -C "$ROOT" branch -D "videos/$DATE" >/dev/null 2>&1 || true
cd "$TMP"
git checkout -q --orphan "videos/$DATE"
git rm -rfq . >/dev/null 2>&1 || true
cp "$SRC"/*.mp4 .
cp "$SRC"/*.png . 2>/dev/null || true
if [ -f "$ROOT/deliveries/$DATE.md" ]; then cp "$ROOT/deliveries/$DATE.md" README.md; else echo "# Clips $DATE" > README.md; fi
git add -A
git -c user.name="clip-bot" -c user.email="clip-bot@users.noreply.github.com" commit -qm "Clips for $DATE"
for i in 1 2 3 4; do
  git push -q -f origin "videos/$DATE" && break
  sleep $((2 ** i))
done
echo "pushed videos/$DATE"

# Prune old video branches (they hold large binaries; deleting them lets GitHub reclaim the space).
CUTOFF="$(date -u -d "-$KEEP_DAYS days" +%F)"
git ls-remote --heads origin 'videos/*' | awk '{print $2}' | sed 's#refs/heads/##' | while read -r b; do
  d="${b#videos/}"
  if [[ "$d" < "$CUTOFF" ]]; then git push -q origin --delete "$b" && echo "deleted $b"; fi
done
