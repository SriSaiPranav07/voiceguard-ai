from backend.services.risk_engine import RiskEngine


def test_risk_engine_does_not_infer_low_risk_from_missing_model():
    result = RiskEngine().evaluate(
        authenticity_result={"score": None, "classification": "UNAVAILABLE"},
        replay_result={"available": False, "probability": None},
    )

    assert result["score"] is None
    assert result["level"] == "UNAVAILABLE"
    assert "cannot be determined" in result["recommendation"]


def test_risk_engine_does_not_invent_contextual_risk_from_category():
    result = RiskEngine().evaluate(
        authenticity_result={"score": None},
        threat_category="Fictional emergency scenario",
    )

    assert result["score"] is None
    assert result["level"] == "UNAVAILABLE"
    assert any("contextual conversation analysis is not implemented" in f for f in result["factors"])
