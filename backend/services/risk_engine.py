from typing import Dict, Any, List, Optional

class RiskEngine:
    """
    Multi-Factor Calibrated Risk Fusion Engine.
    Fuses multi-modal cyber threat signals:
    - Synthetic voice probability (W_syn = 0.50)
    - Speaker biometric mismatch penalty (W_spk = 0.25)
    - Replay attack probability (W_rep = 0.15)
    - Channel & acoustic anomalies (W_anom = 0.10)

    Weights are transparent, configurable, and produce explainable risk score (0-100) & risk tier.
    """

    def __init__(
        self,
        weight_synthetic: float = 0.50,
        weight_speaker: float = 0.25,
        weight_replay: float = 0.15,
        weight_anomaly: float = 0.10,
        high_risk_threshold: int = 60,
        medium_risk_threshold: int = 30,
    ):
        self.w_syn = weight_synthetic
        self.w_spk = weight_speaker
        self.w_rep = weight_replay
        self.w_anom = weight_anomaly
        self.high_thresh = high_risk_threshold
        self.med_thresh = medium_risk_threshold

    def evaluate(
        self,
        authenticity_result: Dict[str, Any],
        speaker_result: Optional[Dict[str, Any]] = None,
        replay_result: Optional[Dict[str, Any]] = None,
        threat_category: Optional[str] = None,
    ) -> Dict[str, Any]:
        factors: List[str] = []

        # 1. Synthetic component
        syn_prob = authenticity_result.get("score", 0.0)  # 0.0 - 1.0
        synthetic_contrib = syn_prob * self.w_syn

        if syn_prob >= 0.65:
            factors.append(f"High synthetic speech indicators ({round(syn_prob * 100, 1)}% probability).")
        elif syn_prob >= 0.40:
            factors.append(f"Suspicious synthetic speech characteristics ({round(syn_prob * 100, 1)}% probability).")
        else:
            factors.append(f"Low synthetic speech indicators ({round(syn_prob * 100, 1)}% probability).")

        # 2. Speaker verification component
        speaker_contrib = 0.0
        if speaker_result and speaker_result.get("available"):
            similarity = speaker_result.get("similarity", 1.0)
            is_match = speaker_result.get("match", True)
            if not is_match:
                mismatch_severity = 1.0 - similarity
                speaker_contrib = mismatch_severity * self.w_spk
                factors.append(f"Speaker biometric mismatch (similarity: {round(similarity * 100, 1)}%).")
            else:
                factors.append(f"Speaker identity profile verified (similarity: {round(similarity * 100, 1)}%).")
        else:
            # When reference speaker is not provided, redistribute weight proportionately
            synthetic_contrib *= (1.0 + self.w_spk / (self.w_syn + self.w_rep + self.w_anom))

        # 3. Replay component
        replay_contrib = 0.0
        if replay_result and replay_result.get("available"):
            rep_prob = replay_result.get("probability", 0.0)
            replay_contrib = rep_prob * self.w_rep
            if rep_prob > 0.35:
                factors.append(f"Physical loudspeaker replay indicators detected ({round(rep_prob * 100, 1)}%).")
            else:
                factors.append(f"Direct live acoustic transmission confirmed (replay probability: {round(rep_prob * 100, 1)}%).")

        # 4. Threat category modifier (if extortion / digital arrest / high-risk category)
        threat_multiplier = 1.0
        if threat_category:
            cat_lower = threat_category.lower()
            if "kidnapping" in cat_lower or "extortion" in cat_lower or "digital arrest" in cat_lower:
                threat_multiplier = 1.2
                factors.append(f"High-threat extortion script detected: {threat_category}.")
            elif "wire" in cat_lower or "otp" in cat_lower:
                threat_multiplier = 1.15
                factors.append(f"Financial deception vector flagged: {threat_category}.")

        # Compute raw fused score (0.0 to 1.0)
        raw_score = (synthetic_contrib + speaker_contrib + replay_contrib) * threat_multiplier
        final_score = int(min(max(round(raw_score * 100), 0), 100))

        # Determine Risk Level
        if final_score >= self.high_thresh:
            level = "HIGH"
            recommendation = (
                "HIGH-RISK VOICE THREAT: Enforce secondary out-of-band verification immediately. "
                "Do NOT authorize financial transactions or credentials transfer. Verify caller via verified callback."
            )
        elif final_score >= self.med_thresh:
            level = "MEDIUM"
            recommendation = (
                "SUSPICIOUS VOICE ACTIVITY: Proceed with caution. Exercise heightened diligence and request "
                "supplementary knowledge-based confirmation for sensitive or privileged operations."
            )
        else:
            level = "LOW"
            recommendation = (
                "LOW RISK: Voice acoustics align with legitimate live human speech. Continue interaction normally."
            )

        return {
            "score": final_score,
            "level": level,
            "factors": factors,
            "recommendation": recommendation,
        }
