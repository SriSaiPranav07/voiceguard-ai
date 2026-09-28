from typing import Any, Dict


class SpeakerVerifier:
    """Report speaker verification as unavailable without a trained embedder."""

    def __init__(self, default_threshold: float = 0.75):
        self.default_threshold = default_threshold
        self.model_status = "MODEL_UNAVAILABLE"
        self.engine_name = "VoiceGuard-SpeakerVerification"

    def verify(
        self,
        ref_features: Dict[str, Any],
        incoming_features: Dict[str, Any],
        threshold: float = None,
    ) -> Dict[str, Any]:
        return {
            "available": False,
            "similarity": None,
            "match": None,
            "threshold": threshold if threshold is not None else self.default_threshold,
            "explanation": "Speaker identity comparison is unavailable because no validated speaker-embedding model is configured.",
            "model_status": self.model_status,
        }
