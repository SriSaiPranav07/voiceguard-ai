import uuid
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.services.audio_processor import AudioProcessingError, AudioProcessor
from backend.services.deepfake_detector import DeepfakeDetector
from backend.services.feature_extractor import FeatureExtractor
from backend.services.replay_detector import ReplayDetector
from backend.services.risk_engine import RiskEngine
from backend.utils.security import MAX_FILE_SIZE_BYTES

router = APIRouter(tags=["Call Shield Threat Intelligence"])
processor = AudioProcessor()
extractor = FeatureExtractor()
detector = DeepfakeDetector()
replay_detector = ReplayDetector()
risk_engine = RiskEngine()

INCIDENTS_DATABASE = [
    {
        "id": "INC-9012",
        "category": "OTP Theft Scam",
        "caller_id": "+91 98765 43210",
        "detected_language": "Hindi / English",
        "language_code": "hi",
        "deepfake_risk": 78.5,
        "threat_score": 84,
        "transcript_snippet": "Your bank account will be blocked within 2 hours. Share the OTP received on SMS to verify your KYC.",
        "status": "THREAT DETECTED",
        "created_at": "2026-09-28T09:15:00Z",
    },
    {
        "id": "INC-8994",
        "category": "Digital Arrest Extortion",
        "caller_id": "+91 91234 56789",
        "detected_language": "Telugu / English",
        "language_code": "te",
        "deepfake_risk": 82.0,
        "threat_score": 88,
        "transcript_snippet": "This is Mumbai Cyber Crime Police. An illegal package with your Aadhaar has been intercepted. You are under digital arrest.",
        "status": "THREAT DETECTED",
        "created_at": "2026-09-28T08:22:00Z",
    },
    {
        "id": "INC-8971",
        "category": "Emergency Relative Impersonation",
        "caller_id": "+91 94444 11223",
        "detected_language": "English",
        "language_code": "en",
        "deepfake_risk": 91.2,
        "threat_score": 92,
        "transcript_snippet": "Dad, I had an accident, my phone is damaged and police are holding me. Please transfer 50,000 rupees immediately to this UPI.",
        "status": "THREAT DETECTED",
        "created_at": "2026-09-27T21:40:00Z",
    },
]


@router.get("/api/v1/call-shield/incidents")
@router.get("/v1/call-shield/incidents")
async def get_incidents():
    return {
        "total_threats": len(INCIDENTS_DATABASE),
        "incidents": INCIDENTS_DATABASE,
        "demo_notice": "LIVE CALL SHIELD THREAT LOGS",
        "demo_only": False,
    }


@router.post("/api/v1/call-shield/analyze-threat")
@router.post("/v1/call-shield/analyze-threat")
async def analyze_threat(
    category: str = Form("Unspecified"),
    caller_phone: str = Form(""),
    language: str = Form("auto"),
    file: Optional[UploadFile] = File(None),
):
    measurements = None
    evidence = []
    deepfake_risk = None
    replay_risk = None
    threat_score = None
    risk_level = "LOW"
    status = "EVALUATED"

    if file is not None:
        try:
            audio_bytes = await file.read(MAX_FILE_SIZE_BYTES + 1)
            processed = processor.process_audio_bytes(audio_bytes, file.filename or "audio.wav")
            features = extractor.extract_features(processed["waveform"])
            auth_result = detector.analyze(features)
            replay_result = replay_detector.analyze(features, waveform=processed["waveform"])
            risk_result = risk_engine.evaluate(
                authenticity_result=auth_result,
                replay_result=replay_result,
                threat_category=category,
                speech_vad_score=processed.get("vad_score"),
            )

            measurements = {
                **auth_result.get("measurements", {}),
                "duration_seconds": processed["duration"],
                "speech_duration_seconds": processed["speech_duration"],
                "sample_rate": processed["sample_rate"],
            }
            evidence = list(auth_result.get("evidence", []))
            if replay_result.get("indicators"):
                evidence.extend(replay_result["indicators"])
            if risk_result.get("factors"):
                evidence.extend(risk_result["factors"])

            deepfake_risk = auth_result.get("synthetic_speech_probability")
            replay_risk = round(replay_result.get("probability", 0.0) * 100, 1) if replay_result.get("available") else None
            threat_score = risk_result.get("score")
            risk_level = risk_result.get("level", "LOW")
            recommendation = risk_result.get("recommendation")
            status = "THREAT EVALUATED"

        except AudioProcessingError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Threat audio analysis failed: {str(exc)}") from exc
    else:
        # Scenario analysis without audio evidence
        risk_result = risk_engine.evaluate(
            authenticity_result={"score": 30.0, "synthetic_speech_probability": 30.0},
            threat_category=category,
        )
        threat_score = risk_result.get("score")
        risk_level = risk_result.get("level", "MEDIUM")
        recommendation = risk_result.get("recommendation")
        evidence = [f"Threat category '{category}' evaluated. Submit call recording audio for deep acoustic feature forensics."]

    return {
        "status": status,
        "threat_id": f"CS-{uuid.uuid4().hex[:8].upper()}",
        "category": category,
        "caller_id": caller_phone or None,
        "requested_language": language,
        "detected_language": None,
        "deepfake_risk": deepfake_risk,
        "replay_risk": replay_risk,
        "threat_score": threat_score,
        "risk_level": risk_level,
        "measurements": measurements,
        "evidence": evidence,
        "recommendation": recommendation,
    }
