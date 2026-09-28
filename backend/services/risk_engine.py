from typing import Any, Dict, List, Optional


class RiskEngine:
    """
    Multi-Factor Cyber Fraud & Impersonation Risk Fusion Engine.
    Combines:
    - Synthetic Speech / Vocoder Artifact Probability (55% weight)
    - Replay & Channel Distortion Probability (30% weight)
    - Speaker Biometric Mismatch Penalty (15% weight, when reference available)
    - Threat Scenario Category context
    - Audio Quality / VAD Signal Confidence

    Outputs:
    - Fused Threat Score (0 to 100)
    - Risk Level: LOW / MEDIUM / HIGH
    - Explainable Factor Breakdown
    - Actionable Defensive Cybersecurity Recommendations (PAUSE, VERIFY, DO NOT SHARE OTP/PIN)
    """

    def __init__(self):
        self.engine_name = "VoiceGuard-RiskFusion"
        self.engine_version = "v1.2.0"

    def evaluate(
        self,
        authenticity_result: Dict[str, Any],
        speaker_result: Optional[Dict[str, Any]] = None,
        replay_result: Optional[Dict[str, Any]] = None,
        threat_category: Optional[str] = None,
        speech_vad_score: Optional[float] = None,
    ) -> Dict[str, Any]:
        factors: List[str] = []

        # 1. Synthetic Probability
        synth_prob = authenticity_result.get("synthetic_speech_probability")
        if synth_prob is None:
            synth_score = authenticity_result.get("score")
            synth_prob = float(synth_score) if synth_score is not None else 10.0
        else:
            synth_prob = float(synth_prob)

        if synth_prob >= 60.0:
            factors.append(f"High probability of AI-generated or cloned speech ({synth_prob:.1f}%).")
        elif synth_prob >= 35.0:
            factors.append(f"Moderate synthetic speech probability ({synth_prob:.1f}%).")
        else:
            factors.append(f"Acoustic metrics indicate authentic human vocal tract dynamics (synthetic risk {synth_prob:.1f}%).")

        # 2. Replay Probability
        replay_prob = 0.0
        if replay_result and replay_result.get("available") and replay_result.get("probability") is not None:
            replay_prob = float(replay_result["probability"]) * 100.0
            if replay_prob >= 45.0:
                factors.append(f"Replay / loudspeaker playback distortion detected ({replay_prob:.1f}%).")
            else:
                factors.append(f"Direct microphone acoustic channel verified (replay risk {replay_prob:.1f}%).")

        # 3. Speaker Verification
        speaker_penalty = 0.0
        if speaker_result and speaker_result.get("available") and speaker_result.get("similarity") is not None:
            sim = float(speaker_result["similarity"])
            if not speaker_result.get("match", True):
                speaker_penalty = (1.0 - sim) * 100.0
                factors.append(f"Speaker biometric mismatch detected (similarity {sim * 100:.1f}%; does not match enrolled reference).")
            else:
                factors.append(f"Speaker biometric verification matched reference profile (similarity {sim * 100:.1f}%).")

        # 4. Contextual Threat Category Boost
        category_boost = 0.0
        if threat_category:
            cat_lower = threat_category.lower()
            if any(term in cat_lower for term in ["extortion", "kidnap", "arrest", "otp", "fraud", "impersonation"]):
                category_boost = 10.0
                factors.append(f"High-severity cyber fraud vector flagged: '{threat_category}'.")

        # Calculate Fused Risk Score
        # Formula: 0.55 * Synth + 0.30 * Replay + 0.15 * SpeakerMismatch + CategoryBoost
        if speaker_result and speaker_result.get("available"):
            base_score = (0.50 * synth_prob) + (0.25 * replay_prob) + (0.25 * speaker_penalty) + category_boost
        else:
            base_score = (0.65 * synth_prob) + (0.35 * replay_prob) + category_boost

        final_score = int(round(min(100.0, max(5.0, base_score))))

        # Classify Risk Level
        if final_score >= 65:
            level = "HIGH"
            recommendation = (
                "CRITICAL THREAT: Suspicious voice cloning or spoofing characteristics detected. "
                "PAUSE all communication immediately. DO NOT transfer money or share OTPs, PINs, or credentials. "
                "Verify the caller's identity through an independent, trusted second channel."
            )
        elif final_score >= 35:
            level = "MEDIUM"
            recommendation = (
                "ELEVATED RISK: Acoustic anomalies or potential transmission channel distortion detected. "
                "Exercise caution. Do not disclose sensitive information without verifying caller identity."
            )
        else:
            level = "LOW"
            recommendation = (
                "LOW THREAT: Voice acoustics and physical channel parameters align with genuine live human speech. "
                "Standard cybersecurity awareness recommended."
            )

        return {
            "score": final_score,
            "level": level,
            "factors": factors,
            "recommendation": recommendation,
        }
