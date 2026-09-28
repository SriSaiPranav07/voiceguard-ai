import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routes.health import router as health_router
from backend.routes.analyze import router as analyze_router
from backend.routes.speaker import router as speaker_router
from backend.routes.replay import router as replay_router
from backend.routes.call_shield import router as call_shield_router
from backend.routes.ws_live import router as ws_live_router
from backend.services.audio_processor import AudioProcessingError
from backend.utils.logger import get_logger

logger = get_logger("app")

app = FastAPI(
    title="VoiceGuard AI — Cybersecurity Threat Detection API",
    description=(
        "AI-Powered Real-Time Detection and Prevention of Voice-Cloning Impersonation Attacks. "
        "Prepared for Smart India Hackathon (SIH) 2026."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
# Set CORS_ORIGINS to a comma-separated list when deploying to a different frontend host.
allowed_origins = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "").split(",") if origin.strip()]
allowed_origins.extend([
    "https://voiceguard-ai-psn1.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
])
allowed_origin_regex = os.environ.get(
    "CORS_ORIGIN_REGEX",
    r"https://.*\.vercel\.app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Custom Exception Handlers
@app.exception_handler(AudioProcessingError)
async def audio_processing_exception_handler(request: Request, exc: AudioProcessingError):
    logger.warning(f"Audio validation failed: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"status": "error", "error": "audio_processing_error", "detail": str(exc)},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": "internal_server_error",
            "detail": "An unexpected error occurred within the VoiceGuard AI analysis pipeline. Technical logs recorded.",
        },
    )

# Include API Routers
app.include_router(health_router)
app.include_router(analyze_router)
app.include_router(speaker_router)
app.include_router(replay_router)
app.include_router(call_shield_router)
app.include_router(ws_live_router)

@app.get("/")
@app.get("/api")
async def root():
    return {
        "platform": "VoiceGuard AI — AI-Powered Voice Threat Platform",
        "edition": "Smart India Hackathon (SIH) 2026",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "health": "/api/health",
            "analyze": "/api/analyze (POST audio file)",
            "verify_speaker": "/api/verify-speaker (POST reference + incoming)",
            "detect_replay": "/api/detect-replay (POST audio file)",
            "live_websocket": "/ws/live-detection (WebSocket)",
            "call_shield_incidents": "/api/v1/call-shield/incidents",
            "call_shield_threat": "/api/v1/call-shield/analyze-threat",
        },
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=True)
