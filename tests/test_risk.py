import pytest
from backend.services.risk_engine import RiskEngine

def test_risk_engine_low_risk():
    engine = RiskEngine()
    auth_res = {"score": 0.08, "classification": "REAL"}
    spk_res = {"available": True, "similarity": 0.95, "match": True}
    rep_res = {"available": True, "probability": 0.05, "is_replay": False}

    evaluation = engine.evaluate(
        authenticity_result=auth_res,
        speaker_result=spk_res,
        replay_result=rep_res,
    )

    assert evaluation["level"] == "LOW"
    assert evaluation["score"] < 30
    assert "LOW RISK" in evaluation["recommendation"]
    assert len(evaluation["factors"]) > 0

def test_risk_engine_high_risk_synthetic():
    engine = RiskEngine()
    auth_res = {"score": 0.92, "classification": "FAKE"}
    spk_res = {"available": True, "similarity": 0.40, "match": False}
    rep_res = {"available": True, "probability": 0.15, "is_replay": False}

    evaluation = engine.evaluate(
        authenticity_result=auth_res,
        speaker_result=spk_res,
        replay_result=rep_res,
    )

    assert evaluation["level"] == "HIGH"
    assert evaluation["score"] >= 60
    assert "HIGH-RISK VOICE THREAT" in evaluation["recommendation"]

def test_risk_engine_threat_category_multiplier():
    engine = RiskEngine()
    auth_res = {"score": 0.55, "classification": "SUSPICIOUS"}
    rep_res = {"available": True, "probability": 0.20, "is_replay": False}

    eval_normal = engine.evaluate(authenticity_result=auth_res, replay_result=rep_res)
    eval_extortion = engine.evaluate(
        authenticity_result=auth_res,
        replay_result=rep_res,
        threat_category="Kidnapping / Extortion",
    )

    assert eval_extortion["score"] >= eval_normal["score"]
    assert any("extortion" in f.lower() for f in eval_extortion["factors"])
