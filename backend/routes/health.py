from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter(tags=["Health"])

class HealthResponseModel(BaseModel):
    status: str
    service: str
    api_online: bool
    model_loaded: bool
    ai_engine_online: bool
    model_status: str
    model_version: str
    active_modules: Dict[str, bool]

@router.get("/api/health", response_model=HealthResponseModel)
@router.get("/health", response_model=HealthResponseModel)
async def get_health():
    """
    System Health & Operational Status endpoint.
    Reports operational status of all core cybersecurity pipeline modules.
    """
    return HealthResponseModel(
        status="degraded",
        service="voiceguard-ai",
        api_online=True,
        model_loaded=False,
        ai_engine_online=False,
        model_status="MODEL_UNAVAILABLE",
        model_version="acoustic-checks-v1.1.0",
        active_modules={
            "audio_preprocessor": True,
            "feature_extractor": True,
            "authenticity_detector": False,
            "speaker_verifier": False,
            "replay_detector": False,
            "risk_engine": False,
        },
    )
