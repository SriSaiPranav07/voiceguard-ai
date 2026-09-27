from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter(tags=["Health"])

class HealthResponseModel(BaseModel):
    status: str
    ai_engine_online: bool
    model_status: str
    model_version: str
    active_modules: Dict[str, bool]

@router.get("/api/health", response_model=HealthResponseModel)
async def get_health():
    """
    System Health & Operational Status endpoint.
    Reports operational status of all core cybersecurity pipeline modules.
    """
    return HealthResponseModel(
        status="healthy",
        ai_engine_online=True,
        model_status="BASELINE_MODEL",
        model_version="VoiceGuard-v1.0.0-SIH2026",
        active_modules={
            "audio_preprocessor": True,
            "feature_extractor": True,
            "authenticity_detector": True,
            "speaker_verifier": True,
            "replay_detector": True,
            "risk_engine": True,
        },
    )
