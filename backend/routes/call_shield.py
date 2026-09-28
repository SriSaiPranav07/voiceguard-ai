import uuid
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.services.audio_processor import AudioProcessingError, AudioProcessor
from backend.services.deepfake_detector import DeepfakeDetector
from backend.services.feature_extractor import FeatureExtractor
from backend.services.risk_engine import RiskEngine
from backend.utils.security import MAX_FILE_SIZE_BYTES

router = APIRouter(tags=["Call Shield Threat Intelligence"])
processor = AudioProcessor()
extractor = FeatureExtractor()
detector = DeepfakeDetector()
risk_engine = RiskEngine()

# Fictional records for UI demonstrations only; not live or observed incidents.
INCIDENTS_DATABASE = [
    {
        "id": "DEMO-9012",
        "category": "OTP Theft Scam",
        "caller_id": "Fictional caller",
        "detected_language": None,
        "language_code": None,
        "deepfake_risk": None,
        "threat_score": None,
        "transcript_snippet": None,
        "status": "SIMULATION",
        "created_at": "2026-09-18T00:15:00Z",
    },
    {
        "id": "DEMO-8994",
        "category": "Digital Arrest Extortion",
        "caller_id": "Fictional caller",
        "detected_language": None,
        "language_code": None,
        "deepfake_risk": None,
        "threat_score": None,
        "transcript_snippet": None,
        "status": "SIMULATION",
        "created_at": "2026-09-17T22:18:00Z",
    },
]


@router.get("/api/v1/call-shield/incidents")
@router.get("/v1/call-shield/incidents")
async def get_incidents():
    return {
        "total_threats": 0,
        "incidents": INCIDENTS_DATABASE,
        "demo_notice": "SIMULATION DATA ONLY — these fictional records are not live incidents.",
        "demo_only": True,
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
    evidence = ["Contextual conversation analysis is not implemented."]

    if file is not None:
        try:
            audio_bytes = await file.read(MAX_FILE_SIZE_BYTES + 1)
            processed = processor.process_audio_bytes(audio_bytes, file.filename or "audio.wav")
            features = extractor.extract_features(processed["waveform"])
            auth_result = detector.analyze(features)
            measurements = auth_result.get("measurements")
            evidence = list(auth_result.get("evidence", []))
        except AudioProcessingError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Threat audio analysis failed due to an internal server error.") from exc

    risk_result = risk_engine.evaluate(authenticity_result={"score": None}, threat_category=category)
    return {
        "status": "ANALYSIS_UNAVAILABLE",
        "threat_id": f"VG-{uuid.uuid4().hex[:8].upper()}",
        "category": category,
        "caller_id": caller_phone or None,
        "requested_language": language,
        "detected_language": None,
        "deepfake_risk": None,
        "threat_score": None,
        "measurements": measurements,
        "evidence": evidence,
        "recommendation": risk_result["recommendation"],
    }
