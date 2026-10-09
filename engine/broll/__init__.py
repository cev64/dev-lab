"""B-roll for original explainers: stock footage (Pexels, Pixabay) or local AI stills, per beat, plus a
graded 1080x1920 background track. See docs/specs/broll.md. CLI: python -m broll fetch --script ... --out ...
"""

W, H, FPS = 1080, 1920, 30
AI_LABEL = "AI-generated illustration"
