from backend.services.risk_engine import RiskEngine


def test_risk_engine_evaluation():
    engine = RiskEngine()
    result = engine.evaluate(
        authenticity_result={"score": 85.0, "synthetic_speech_probability": 85.0},
        replay_result={"available": True, "probability": 0.60},
        threat_category="Digital Arrest Authority Scam",
    )

    assert result["score"] >= 65
    assert result["level"] == "HIGH"
    assert "CRITICAL THREAT" in result["recommendation"]
    assert len(result["factors"]) > 0


def test_risk_engine_low_risk():
    engine = RiskEngine()
    result = engine.evaluate(
        authenticity_result={"score": 12.0, "synthetic_speech_probability": 12.0},
        replay_result={"available": True, "probability": 0.08},
    )

    assert result["score"] < 35
    assert result["level"] == "LOW"
    assert "LOW THREAT" in result["recommendation"]
