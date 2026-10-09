"""Make `clipper` importable when tests run from the repo root (python -m unittest discover -s engine/tests)."""
import sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parents[1]
if str(ENGINE) not in sys.path:
    sys.path.insert(0, str(ENGINE))
FIXTURES = Path(__file__).resolve().parent / "fixtures"
