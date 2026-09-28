import numpy as np
from typing import Any, Dict


class SpeakerVerifier:
    """
    Forensic Speaker Biometric & Voiceprint Comparison Engine.
    Constructs a normalized acoustic speaker embedding from multi-dimensional
    cepstral (MFCC), spectral, and fundamental frequency distributions.
    Computes biometric cosine similarity when enrolled reference audio is supplied.
    """

    def __init__(self, default_threshold: float = 0.75):
        self.default_threshold = default_threshold
        self.model_status = "BASELINE_MODEL"
        self.engine_name = "VoiceGuard-SpeakerVerification"

    def _build_speaker_embedding(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Builds a 30-dimensional normalized acoustic speaker descriptor vector:
        - 13 MFCC means (vocal tract envelope)
        - 13 MFCC standard deviations (formant transition dynamics)
        - Spectral Centroid & Bandwidth (normalized)
        - Pitch mean and jitter (glottal vocal fold signature)
        """
        vec = []
        mfcc_mean = features.get("mfcc_mean")
        if mfcc_mean is not None and len(mfcc_mean) >= 13:
            vec.extend(mfcc_mean[:13])
        else:
            vec.extend([0.0] * 13)

        mfcc_std = features.get("mfcc_std")
        if mfcc_std is not None and len(mfcc_std) >= 13:
            vec.extend(mfcc_std[:13])
        else:
            vec.extend([0.0] * 13)

        sc_mean = float(features.get("spectral_centroid_mean", 1500.0)) / 4000.0
        sb_mean = float(features.get("spectral_bandwidth_mean", 1500.0)) / 4000.0
        f0_mean = float(features.get("f0_mean", 150.0)) / 300.0
        jitter = float(features.get("pitch_jitter", 0.01)) * 10.0

        vec.extend([sc_mean, sb_mean, f0_mean, jitter])
        arr = np.array(vec, dtype=np.float32)
        norm = np.linalg.norm(arr)
        if norm > 1e-6:
            arr = arr / norm
        return arr

    def verify(
        self,
        ref_features: Dict[str, Any],
        incoming_features: Dict[str, Any],
        threshold: float = None,
    ) -> Dict[str, Any]:
        """
        Compares reference enrolled voice with incoming speech sample.
        """
        th = threshold if threshold is not None else self.default_threshold

        if not ref_features or not incoming_features:
            return {
                "available": False,
                "similarity": None,
                "match": None,
                "threshold": th,
                "explanation": "Speaker verification unavailable — reference voice not provided.",
                "model_status": self.model_status,
            }

        ref_emb = self._build_speaker_embedding(ref_features)
        inc_emb = self._build_speaker_embedding(incoming_features)

        # Cosine similarity
        similarity = float(np.dot(ref_emb, inc_emb))
        similarity = float(np.clip(similarity, 0.0, 1.0))
        match = bool(similarity >= th)

        explanation = (
            f"Speaker acoustic similarity is {round(similarity * 100, 1)}% (Threshold: {round(th * 100, 1)}%). "
            f"Acoustic biometric characteristics {'MATCH' if match else 'DO NOT MATCH'} the enrolled reference speaker profile."
        )

        return {
            "available": True,
            "similarity": round(similarity, 3),
            "match": match,
            "threshold": th,
            "explanation": explanation,
            "model_status": self.model_status,
        }
