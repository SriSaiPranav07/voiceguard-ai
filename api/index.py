import sys
from pathlib import Path

# Add project root to sys.path so 'backend' module is findable by Python
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app import app

# Export app for Vercel Serverless Function
__all__ = ["app"]
