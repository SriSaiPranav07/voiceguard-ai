import numpy as np
from typing import Dict, Any

class SpeakerVerifier:
    """
    Speaker Biometric Verification Service.
    Compares reference speaker voice embeddings with incoming voice audio.
    Distinct task from deepfake / anti-spoofing detection.

    STATUS: BASELINE_MODEL (Cosine similarity over multi-band acoustic & spectral fingerprint vectors).
    """

    def __init__(self, default_threshold: float = 0.75):
        self.default_threshold = default_threshold
        self.model_status = "BASELINE_MODEL"
        self.engine_name = "VoiceGuard-SpeakerBiometrics-Baseline"

    def compute_embedding(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Derives a normalized 32-dimensional acoustic speaker fingerprint from extracted features:
        - 13 MFCC means
        - 13 MFCC stds
        - Spectral centroid, bandwidth, roll-off (normalized)
        - F0 mean & pitch jitter
        - Zero crossing rate
        """
        mfcc_mean = features.get("mfcc_mean", np.zeros(13))
        mfcc_std = features.get("mfcc_std", np.zeros(13))
        
        spectral_norm = np.array([
            features.get("spectral_centroid_mean", 2000.0) / 4000.0,
            features.get("spectral_bandwidth_mean", 1500.0) / 3000.0,
            features.get("spectral_rolloff_mean", 3500.0) / 8000.0,
            min(features.get("f0_mean", 150.0) / 300.0, 1.0),
            min(features.get("pitch_jitter", 0.02) * 20.0, 1.0),
            min(features.get("zero_crossing_rate", 0.05) * 10.0, 1.0),
        ])

        embedding = np.concatenate([mfcc_mean, mfcc_std, spectral_norm])
        # L2 Normalization
        norm = np.linalg.norm(embedding)
        if norm > 1e-9:
            embedding = embedding / norm
        return embedding

    def verify(
        self,
        ref_features: Dict[str, Any],
        incoming_features: Dict[str, Any],
        threshold: float = None,
    ) -> Dict[str, Any]:
        """
        Calculates cosine similarity between reference and incoming speaker embeddings.
        Returns match verdict, similarity score, and explanation.
        """
        if threshold is None:
            threshold = self.default_threshold

        ref_emb = self.compute_embedding(ref_features)
        inc_emb = self.compute_embedding(incoming_features)

        # Cosine similarity in range [-1.0, 1.0], mapped to [0.0, 1.0]
        dot_product = float(np.dot(ref_emb, inc_emb))
        similarity = float(np.clip((dot_product + 1.0) / 2.0, 0.0, 1.0))

        is_match = similarity >= threshold

        if is_match:
            explanation = (
                f"Speaker similarity score ({round(similarity * 100, 1)}%) exceeds the verification threshold "
                f"({round(threshold * 100, 1)}%). Acoustic vocal tract resonance profile matches the reference enrollment."
            )
        else:
            explanation = (
                f"Speaker similarity score ({round(similarity * 100, 1)}%) is below the configured threshold "
                f"({round(threshold * 100, 1)}%). Significant divergence detected in vocal tract formants and timbre."
            )

        return {
            "available": True,
            "similarity": round(similarity, 3),
            "match": is_match,
            "threshold": threshold,
            "explanation": explanation,
            "model_status": self.model_status,
        }
