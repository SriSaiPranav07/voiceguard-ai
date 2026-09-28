from typing import Any, Dict, Optional


class RiskEngine:
    """Keep overall fraud risk unavailable until validated model outputs exist."""

    def evaluate(
        self,
        authenticity_result: Dict[str, Any],
        speaker_result: Optional[Dict[str, Any]] = None,
        replay_result: Optional[Dict[str, Any]] = None,
        threat_category: Optional[str] = None,
    ) -> Dict[str, Any]:
        factors = ["Overall voice threat risk is unavailable: validated authenticity and replay model outputs are not configured."]
        if threat_category:
            factors.append("A scenario category was supplied, but contextual conversation analysis is not implemented.")
        if speaker_result and speaker_result.get("available"):
            factors.append("Reference audio was compared using acoustic features; this is not validated speaker biometrics.")
        if replay_result and replay_result.get("measurements"):
            factors.append("Acoustic channel measurements are available; no validated replay classification is configured.")

        return {
            "score": None,
            "level": "UNAVAILABLE",
            "factors": factors,
            "recommendation": "Voice authenticity and fraud risk cannot be determined by the current baseline. Verify the speaker and any sensitive request through a trusted, separate channel.",
        }
