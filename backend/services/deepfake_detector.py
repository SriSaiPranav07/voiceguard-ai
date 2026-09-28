from typing import Any, Dict, List


class DeepfakeDetector:
    """Expose measured acoustic checks without claiming an unvalidated classifier.

    The repository does not contain a trained anti-spoof model. The small
    ``weights.pkl`` artifact was trained from generated feature vectors and is
    deliberately not loaded for inference. Until benchmark-trained weights are
    configured, authenticity probabilities and classifications are unavailable.
    """

    def __init__(self, model_weights_path: str = None):
        self.model_weights_path = model_weights_path
        self.model_status = "MODEL_UNAVAILABLE"
        self.engine_name = "VoiceGuard-Acoustic-Checks"
        self.engine_version = "v1.1.0"

    def analyze(self, features: Dict[str, Any]) -> Dict[str, Any]:
        evidence: List[str] = []
        measurements = {
            "high_freq_ratio": features.get("high_freq_ratio"),
            "spectral_rolloff_mean_hz": features.get("spectral_rolloff_mean"),
            "pitch_jitter": features.get("pitch_jitter"),
            "spectral_centroid_std_hz": features.get("spectral_centroid_std"),
        }

        # These are observations against explicit screening thresholds only;
        # they are not treated as proof of synthetic or human speech.
        hf_ratio = measurements["high_freq_ratio"]
        if hf_ratio is not None and hf_ratio < 0.015:
            evidence.append(f"Measured high-frequency energy ratio is low ({hf_ratio:.4f}; screening threshold 0.015).")

        pitch_jitter = measurements["pitch_jitter"]
        if pitch_jitter is not None and pitch_jitter < 0.004:
            evidence.append(f"Measured pitch jitter is low ({pitch_jitter:.4f}; screening threshold 0.004).")

        centroid_std = measurements["spectral_centroid_std_hz"]
        if centroid_std is not None and centroid_std < 250:
            evidence.append(f"Measured spectral-centroid variation is low ({centroid_std:.1f} Hz; screening threshold 250 Hz).")

        if not evidence:
            evidence.append("No configured acoustic screening threshold was crossed; this does not establish that speech is human.")

        return {
            "label": "unknown",
            "classification": "UNAVAILABLE",
            "score": None,
            "human_speech_probability": None,
            "synthetic_speech_probability": None,
            "model_confidence": None,
            "evidence": evidence,
            "measurements": measurements,
            "model_metadata": {
                "engine_name": self.engine_name,
                "engine_version": self.engine_version,
                "status": self.model_status,
                "model_type": "Acoustic measurements only; no trained anti-spoof classifier is configured",
                "is_demo_mode": False,
            },
        }
