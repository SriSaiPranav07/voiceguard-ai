import numpy as np
from typing import Any, Dict


class ReplayDetector:
    """Report observable channel measurements, not uncalibrated replay odds."""

    def __init__(self, threshold: float = 0.35):
        self.threshold = threshold
        self.model_status = "MODEL_UNAVAILABLE"
        self.engine_name = "VoiceGuard-Channel-Measurements"

    def analyze(self, features: Dict[str, Any], waveform: np.ndarray = None) -> Dict[str, Any]:
        measurements = {
            "spectral_centroid_mean_hz": features.get("spectral_centroid_mean"),
            "spectral_bandwidth_mean_hz": features.get("spectral_bandwidth_mean"),
            "rms_energy": features.get("rms_energy"),
            "zero_crossing_rate": features.get("zero_crossing_rate"),
        }
        if waveform is not None and len(waveform) > 0:
            rms = float(np.sqrt(np.mean(np.square(waveform))))
            peak = float(np.max(np.abs(waveform)))
            measurements["crest_factor"] = peak / rms if rms > 1e-9 else None
        else:
            measurements["crest_factor"] = None

        return {
            "available": False,
            "probability": None,
            "is_replay": None,
            "explanation": "Replay classification is unavailable because no validated replay detector is configured.",
            "indicators": [],
            "measurements": measurements,
            "model_status": self.model_status,
        }
