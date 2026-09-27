import hashlib
import os
from typing import Set

ALLOWED_AUDIO_EXTENSIONS: Set[str] = {
    ".wav",
    ".mp3",
    ".m4a",
    ".flac",
    ".ogg",
    ".webm",
    ".aac",
    ".opus",
}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB

def compute_file_hash(data: bytes) -> str:
    """Compute deterministic SHA-256 hash of audio data."""
    return hashlib.sha256(data).hexdigest()

def is_allowed_audio_file(filename: str) -> bool:
    """Validate file extension against allowed audio formats."""
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_AUDIO_EXTENSIONS

def safe_cleanup_file(filepath: str) -> None:
    """Safely delete temporary files from disk without leaking sensitive voice recordings."""
    try:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass
