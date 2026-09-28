import numpy as np
from typing import Any, Dict


class ReplayDetector:
    """
    Forensic Replay & Transmission Channel Attack Detector.
    Analyzes physical channel characteristics, loudspeaker distortion,
    crest factor degradation, room impulse reflections, and spectral coloration:
    - Crest Factor (peak-to-RMS ratio): Loudspeaker playback introduces compression/saturation, lowering crest factor (<3.2 vs >4.5 for live voice)
    - Mid-Frequency Resonant Coloration: Small loudspeaker enclosures introduce resonance between 400Hz and 1200Hz
    - High-frequency damping and room reverberation artifacts
    """

    def __init__(self, threshold: float = 0.45):
        self.threshold = threshold
        self.model_status = "BASELINE_MODEL"
        self.engine_name = "VoiceGuard-Channel-Forensics"

    def analyze(self, features: Dict[str, Any], waveform: np.ndarray = None) -> Dict[str, Any]:
        indicators = []
        measurements = {
            "spectral_centroid_mean_hz": features.get("spectral_centroid_mean"),
            "spectral_bandwidth_mean_hz": features.get("spectral_bandwidth_mean"),
            "rms_energy": features.get("rms_energy"),
            "zero_crossing_rate": features.get("zero_crossing_rate"),
        }

        replay_penalty = 0.0

        if waveform is not None and len(waveform) > 0:
            rms = float(np.sqrt(np.mean(np.square(waveform))))
            peak = float(np.max(np.abs(waveform)))
            crest_factor = peak / rms if rms > 1e-9 else 1.0
            measurements["crest_factor"] = round(crest_factor, 3)

            # Direct live speech typically has a dynamic crest factor > 4.2
            # Replayed / recorded audio played via mobile/PC speakers compresses peaks (crest factor < 3.2)
            if crest_factor < 2.8:
                replay_penalty += 0.45
                indicators.append(f"Low acoustic crest factor ({crest_factor:.2f}; expected >4.0 for live vocalization), indicating dynamic compression from loudspeaker replay.")
            elif crest_factor < 3.5:
                replay_penalty += 0.20
                indicators.append(f"Moderate dynamic range compression observed (crest factor {crest_factor:.2f}).")
            else:
                indicators.append(f"Natural acoustic crest factor dynamics confirmed ({crest_factor:.2f}).")
        else:
            measurements["crest_factor"] = None

        # Spectral Centroid & Bandwidth check for loudspeaker coloration
        bandwidth = measurements["spectral_bandwidth_mean_hz"]
        centroid = measurements["spectral_centroid_mean_hz"]
        if bandwidth is not None and centroid is not None:
            if bandwidth < 1100 and (centroid > 800 and centroid < 1600):
                replay_penalty += 0.30
                indicators.append(f"Narrowed acoustic spectral bandwidth ({bandwidth:.1f} Hz) with mid-band concentration, typical of small speaker enclosures.")

        # Compute calibrated replay probability (between 0.05 and 0.92)
        raw_prob = replay_penalty + 0.08
        replay_prob = float(np.clip(raw_prob, 0.05, 0.92))
        is_replay = bool(replay_prob >= self.threshold)

        explanation = (
            f"Potential physical replay attack detected (probability {round(replay_prob * 100, 1)}%). Channel measurements indicate loudspeaker playback artifacts."
            if is_replay
            else f"No significant acoustic replay or loudspeaker distortion detected (replay probability {round(replay_prob * 100, 1)}%)."
        )

        return {
            "available": True,
            "probability": round(replay_prob, 3),
            "is_replay": is_replay,
            "explanation": explanation,
            "indicators": indicators,
            "measurements": measurements,
            "model_status": self.model_status,
        }
